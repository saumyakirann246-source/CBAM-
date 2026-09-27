// ==================================================================
// Supabase Edge Function: calculate-cbam-emissions
// Deploy with: supabase functions deploy calculate-cbam-emissions
// Invoke from Lovable with:
//   supabase.functions.invoke('calculate-cbam-emissions', { body: { productionDataId } })
// ==================================================================
// Deno/ESM port of cbam_calculation_engine.js — same math, same
// guardrails (refuses to guess unsourced markup/free-allocation
// years). If you change a rule in cbam_calculation_engine.js, mirror
// the change here.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  try {
    const { productionDataId } = await req.json();
    if (!productionDataId) return json({ error: 'productionDataId is required' }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: pd, error: pdErr } = await supabase
      .from('production_data').select('*').eq('id', productionDataId).single();
    if (pdErr || !pd) return json({ error: 'production_data row not found' }, 404);

    const { data: product } = await supabase.from('products').select('*').eq('id', pd.product_id).single();
    const { data: cnCode } = await supabase.from('cn_codes').select('*').eq('code', product.cn_code).single();

    const reportYear = new Date(pd.reporting_period_start).getFullYear();

    const { data: exemptionRow } = await supabase
      .from('sector_indirect_exemptions').select('*').eq('sector', cnCode.sector).single();

    let emissions;

    if (pd.uses_actual_data) {
      emissions = calculateEmbeddedEmissions(
        { quantityProducedT: Number(pd.quantity_produced_t), usesActualData: true,
          actualDirectEmissionsT: Number(pd.calculated_direct_emissions_t || 0),
          actualIndirectEmissionsT: Number(pd.calculated_indirect_emissions_t || 0) },
        null,
        { indirectExempt: exemptionRow?.indirect_exempt ?? false },
        null
      );
    } else {
      const { data: factorRow } = await supabase
        .from('default_emission_factors').select('*')
        .eq('cn_code', product.cn_code)
        .lte('applicable_from', pd.reporting_period_start)
        .order('applicable_from', { ascending: false })
        .limit(1).single();

      if (!factorRow) return json({ error: `No default_emission_factors row found for CN code ${product.cn_code}` }, 422);
      if (factorRow.data_confidence === 'fake_placeholder') {
        return json({
          error: 'This CN code only has a fake placeholder emission factor (data_confidence = fake_placeholder). Refusing to calculate a compliance number from invented data.',
          cnCode: product.cn_code
        }, 422);
      }

      const { data: markupRows } = await supabase
        .from('default_value_markup_schedule').select('*')
        .eq('sector', cnCode.sector).lte('year', reportYear)
        .order('year', { ascending: false }).limit(1);
      if (!markupRows || markupRows.length === 0) {
        return json({ error: `No markup schedule seeded for sector ${cnCode.sector} at or before year ${reportYear}` }, 422);
      }

      emissions = calculateEmbeddedEmissions(
        { quantityProducedT: Number(pd.quantity_produced_t), usesActualData: false },
        { directEmissionsTCo2PerT: Number(factorRow.direct_emissions_t_co2_per_t),
          indirectEmissionsTCo2PerT: factorRow.indirect_emissions_t_co2_per_t ? Number(factorRow.indirect_emissions_t_co2_per_t) : null },
        { indirectExempt: exemptionRow?.indirect_exempt ?? false },
        Number(markupRows[0].markup_multiplier)
      );
    }

    const { data: allocationRows } = await supabase
      .from('free_allocation_schedule').select('*').lte('year', reportYear)
      .order('year', { ascending: false }).limit(1);
    const liabilityPct = allocationRows && allocationRows.length > 0 ? Number(allocationRows[0].liability_percentage) : null;

    const { data: priceRows } = await supabase
      .from('ets_prices').select('*').lte('price_date', pd.reporting_period_end)
      .order('price_date', { ascending: false }).limit(1);
    const etsPrice = priceRows && priceRows.length > 0 ? Number(priceRows[0].price_eur_per_tonne) : null;

    const cost = (liabilityPct !== null && etsPrice !== null)
      ? calculateCostExposure(emissions.totalEmbeddedEmissionsT, liabilityPct, etsPrice)
      : { liableEmissionsT: null, estimatedCostEur: null, warning: 'Missing free-allocation or ETS price data for this period.' };

    const { error: updateErr } = await supabase.from('production_data').update({
      calculated_direct_emissions_t: emissions.directEmissionsT,
      calculated_indirect_emissions_t: emissions.indirectEmissionsT,
      calculated_at: new Date().toISOString()
    }).eq('id', productionDataId);
    if (updateErr) return json({ error: 'Calculated but failed to save', details: updateErr.message, emissions, cost }, 500);

    return json({ emissions, cost });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// ---------- calculation logic (ported from cbam_calculation_engine.js) ----------

function calculateEmbeddedEmissions(productionData: any, defaultFactor: any, sectorExemption: any, markupMultiplier: number | null) {
  const { quantityProducedT, usesActualData, actualDirectEmissionsT, actualIndirectEmissionsT } = productionData;

  if (usesActualData) {
    return {
      directEmissionsT: round3(actualDirectEmissionsT || 0),
      indirectEmissionsT: sectorExemption.indirectExempt ? 0 : round3(actualIndirectEmissionsT || 0),
      totalEmbeddedEmissionsT: round3((actualDirectEmissionsT || 0) + (sectorExemption.indirectExempt ? 0 : (actualIndirectEmissionsT || 0))),
      usedDefaultValue: false,
      markupApplied: null
    };
  }

  const directPerTonne = defaultFactor.directEmissionsTCo2PerT * (markupMultiplier as number);
  const indirectPerTonne = sectorExemption.indirectExempt ? 0 : (defaultFactor.indirectEmissionsTCo2PerT || 0) * (markupMultiplier as number);
  const directTotal = directPerTonne * quantityProducedT;
  const indirectTotal = indirectPerTonne * quantityProducedT;

  return {
    directEmissionsT: round3(directTotal),
    indirectEmissionsT: round3(indirectTotal),
    totalEmbeddedEmissionsT: round3(directTotal + indirectTotal),
    usedDefaultValue: true,
    markupApplied: markupMultiplier
  };
}

function calculateCostExposure(totalEmbeddedEmissionsT: number, liabilityPercentage: number, etsPriceEurPerTonne: number) {
  const liableEmissions = totalEmbeddedEmissionsT * liabilityPercentage;
  return { liableEmissionsT: round3(liableEmissions), estimatedCostEur: round2(liableEmissions * etsPriceEurPerTonne) };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round3(n: number) { return Math.round(n * 1000) / 1000; }
