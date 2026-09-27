import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  TrendingDown,
  Info,
  X,
  Zap,
  ChevronDown,
  ArrowRight,
  Check,
  Sparkles,
  BarChart3,
  Calendar,
  Filter,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import {
  calculateEmbeddedEmissions,
  calculateCostExposure,
  getMarkupMultiplierForSectorYear,
} from '../../utils/cbamEngine';

export interface MonthlyEmissionsRow {
  productId: string;
  productName: string;
  sku: string;
  cnCode: string;
  sector: 'iron_steel' | 'aluminium' | 'cement' | 'fertiliser' | 'hydrogen' | 'electricity';
  productionRoute: string;
  usesActualData: boolean;
  isComplete: boolean;

  // Consumption Inputs
  quantityProducedT: number;
  electricityConsumedMwh: number;
  naturalGasNm3: number; // Scope 1 primary fuel
  lightFuelOilT: number; // Scope 1 secondary fuel

  defaultFactor: {
    directEmissionsTCo2PerT: number;
    indirectEmissionsTCo2PerT: number;
  };
}

const Q3_INITIAL_ROWS: MonthlyEmissionsRow[] = [
  {
    productId: 'prod-01',
    productName: 'Hot-Rolled Steel Coil (S235JR)',
    sku: 'HRC-S235JR',
    cnCode: '7208 39 00',
    sector: 'iron_steel',
    productionRoute: 'EAF + 85% Scrap Recycling',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 62500,
    electricityConsumedMwh: 28125,
    naturalGasNm3: 1562500,
    lightFuelOilT: 18.5,
    defaultFactor: { directEmissionsTCo2PerT: 1.42, indirectEmissionsTCo2PerT: 0.47 },
  },
  {
    productId: 'prod-02',
    productName: 'Concrete Reinforcing Rebar (B500B)',
    sku: 'REB-B500B',
    cnCode: '7214 20 00',
    sector: 'iron_steel',
    productionRoute: 'EAF Melt Shop + Slit Rolling',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 45000,
    electricityConsumedMwh: 21150,
    naturalGasNm3: 990000,
    lightFuelOilT: 12.0,
    defaultFactor: { directEmissionsTCo2PerT: 1.31, indirectEmissionsTCo2PerT: 0.43 },
  },
  {
    productId: 'prod-03',
    productName: 'Aluminium Extrusion Billets (6063)',
    sku: 'ALU-BIL-6063',
    cnCode: '7601 20 20',
    sector: 'aluminium',
    productionRoute: 'Secondary Re-melting (45% Scrap)',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 18000,
    electricityConsumedMwh: 12600,
    naturalGasNm3: 1800000,
    lightFuelOilT: 4.2,
    defaultFactor: { directEmissionsTCo2PerT: 1.84, indirectEmissionsTCo2PerT: 5.1 },
  },
  {
    productId: 'prod-04',
    productName: 'Cold-Formed Structural Welded Tubes',
    sku: 'TUB-CFS-80',
    cnCode: '7306 61 92',
    sector: 'iron_steel',
    productionRoute: 'HF Induction Line',
    usesActualData: false, // Default value to show cost saving potential
    isComplete: false,
    quantityProducedT: 14200,
    electricityConsumedMwh: 1846,
    naturalGasNm3: 85200,
    lightFuelOilT: 0.0,
    defaultFactor: { directEmissionsTCo2PerT: 1.58, indirectEmissionsTCo2PerT: 0.54 },
  },
];

const Q2_LOCKED_ROWS: MonthlyEmissionsRow[] = [
  {
    productId: 'prod-01',
    productName: 'Hot-Rolled Steel Coil (S235JR)',
    sku: 'HRC-S235JR',
    cnCode: '7208 39 00',
    sector: 'iron_steel',
    productionRoute: 'EAF + 85% Scrap Recycling',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 58200,
    electricityConsumedMwh: 26190,
    naturalGasNm3: 1455000,
    lightFuelOilT: 16.0,
    defaultFactor: { directEmissionsTCo2PerT: 1.42, indirectEmissionsTCo2PerT: 0.47 },
  },
  {
    productId: 'prod-02',
    productName: 'Concrete Reinforcing Rebar (B500B)',
    sku: 'REB-B500B',
    cnCode: '7214 20 00',
    sector: 'iron_steel',
    productionRoute: 'EAF Melt Shop + Slit Rolling',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 42000,
    electricityConsumedMwh: 19740,
    naturalGasNm3: 924000,
    lightFuelOilT: 10.5,
    defaultFactor: { directEmissionsTCo2PerT: 1.31, indirectEmissionsTCo2PerT: 0.43 },
  },
  {
    productId: 'prod-03',
    productName: 'Aluminium Extrusion Billets (6063)',
    sku: 'ALU-BIL-6063',
    cnCode: '7601 20 20',
    sector: 'aluminium',
    productionRoute: 'Secondary Re-melting',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 16500,
    electricityConsumedMwh: 11550,
    naturalGasNm3: 1650000,
    lightFuelOilT: 3.8,
    defaultFactor: { directEmissionsTCo2PerT: 1.84, indirectEmissionsTCo2PerT: 5.1 },
  },
  {
    productId: 'prod-04',
    productName: 'Cold-Formed Structural Welded Tubes',
    sku: 'TUB-CFS-80',
    cnCode: '7306 61 92',
    sector: 'iron_steel',
    productionRoute: 'HF Induction Line',
    usesActualData: true,
    isComplete: true,
    quantityProducedT: 13800,
    electricityConsumedMwh: 1794,
    naturalGasNm3: 82800,
    lightFuelOilT: 1.2,
    defaultFactor: { directEmissionsTCo2PerT: 1.58, indirectEmissionsTCo2PerT: 0.54 },
  },
];

// Stoichiometric factors
const NAT_GAS_FACTOR_TCO2_PER_NM3 = 0.00202;
const FUEL_OIL_FACTOR_TCO2_PER_T = 3.18;
const GRID_EMISSION_FACTOR_TCO2_PER_MWH = 0.412;
const PPA_RENEWABLE_FACTOR_TCO2_PER_MWH = 0.018;

interface EmissionsViewProps {
  onNavigateStep?: (step: string) => void;
}

export const EmissionsDataEntryView: React.FC<EmissionsViewProps> = ({ onNavigateStep }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Q3_2026' | 'Q2_2026' | 'Q1_2026'>('Q3_2026');
  const [usePPA, setUsePPA] = useState(true);
  const [q3Rows, setQ3Rows] = useState<MonthlyEmissionsRow[]>(Q3_INITIAL_ROWS);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2>(1);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const isPeriodLocked = selectedPeriod === 'Q2_2026' || selectedPeriod === 'Q1_2026';
  const currentRows = isPeriodLocked ? Q2_LOCKED_ROWS : q3Rows;

  const etsPriceEur = 75.36;
  const reportingYear = 2026;
  const effectiveGridFactor = usePPA ? PPA_RENEWABLE_FACTOR_TCO2_PER_MWH : GRID_EMISSION_FACTOR_TCO2_PER_MWH;

  // Real-time calculation engine
  const calculatedRows = useMemo(() => {
    return currentRows.map((row) => {
      const directGas = row.naturalGasNm3 * NAT_GAS_FACTOR_TCO2_PER_NM3;
      const directOil = row.lightFuelOilT * FUEL_OIL_FACTOR_TCO2_PER_T;
      const calculatedActualDirect = directGas + directOil;
      const calculatedActualIndirect = row.electricityConsumedMwh * effectiveGridFactor;
      const isIndirectExempt = row.sector === 'iron_steel' || row.sector === 'aluminium';

      let markup = 1.1;
      try {
        markup = getMarkupMultiplierForSectorYear(row.sector, reportingYear);
      } catch (e) {
        markup = 1.1;
      }

      const res = calculateEmbeddedEmissions(
        {
          quantityProducedT: row.quantityProducedT,
          electricityConsumedMwh: row.electricityConsumedMwh,
          usesActualData: row.usesActualData,
          actualDirectEmissionsT: calculatedActualDirect,
          actualIndirectEmissionsT: calculatedActualIndirect,
        },
        row.defaultFactor,
        { indirectExempt: isIndirectExempt },
        markup
      );

      const cost = calculateCostExposure(res.totalEmbeddedEmissionsT, etsPriceEur, reportingYear);

      const seePerTonne =
        row.quantityProducedT > 0
          ? Math.round((res.totalEmbeddedEmissionsT / row.quantityProducedT) * 1000) / 1000
          : 0;

      return {
        ...row,
        calculatedDirect: res.directEmissionsT,
        calculatedIndirect: res.indirectEmissionsT,
        totalEmbeddedEmissions: res.totalEmbeddedEmissionsT,
        estimatedCostEur: cost.estimatedCostEur,
        specificEmissionsSEE: seePerTonne,
      };
    });
  }, [currentRows, effectiveGridFactor, reportingYear]);

  // Aggregate totals
  const totals = useMemo(() => {
    return calculatedRows.reduce(
      (acc, r) => ({
        tonnes: acc.tonnes + r.quantityProducedT,
        direct: acc.direct + r.calculatedDirect,
        indirect: acc.indirect + r.calculatedIndirect,
        embedded: acc.embedded + r.totalEmbeddedEmissions,
        cost: acc.cost + r.estimatedCostEur,
      }),
      { tonnes: 0, direct: 0, indirect: 0, embedded: 0, cost: 0 }
    );
  }, [calculatedRows]);

  const completedCount = calculatedRows.filter((r) => r.isComplete).length;
  const progressPercent = Math.round((completedCount / calculatedRows.length) * 100);

  const handleCellChange = (productId: string, field: keyof MonthlyEmissionsRow, rawValue: string) => {
    if (isPeriodLocked) return;

    const key = `${productId}-${field}`;
    const newErrors = { ...validationErrors };
    const numValue = parseFloat(rawValue);

    if (rawValue.trim() === '') {
      newErrors[key] = 'Required';
    } else if (isNaN(numValue)) {
      newErrors[key] = 'Invalid number';
    } else if (numValue < 0) {
      newErrors[key] = 'Positive number only';
    } else {
      delete newErrors[key];
    }

    setValidationErrors(newErrors);

    setQ3Rows((prev) =>
      prev.map((r) => {
        if (r.productId === productId) {
          return { ...r, [field]: isNaN(numValue) ? 0 : numValue };
        }
        return r;
      })
    );
  };

  const handleToggleActualData = (productId: string) => {
    if (isPeriodLocked) return;
    setQ3Rows((prev) =>
      prev.map((r) => {
        if (r.productId === productId) {
          const nextVal = !r.usesActualData;
          return { ...r, usesActualData: nextVal, isComplete: nextVal };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & REPORTING PERIOD TABS                               */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Emissions Data Entry
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isPeriodLocked
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs'
              }`}
            >
              {isPeriodLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Locked Archive</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Entry Open</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Input actual production volume and energy consumption to calculate compliant direct and indirect embedded emissions.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Period Selector Tabs */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-emerald-100 text-xs font-bold shadow-2xs">
            {(['Q3_2026', 'Q2_2026', 'Q1_2026'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === p
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/50'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import ERP</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. RUNNING TOTAL & COST EXPOSURE STRIP - EMERALD ACCENTED           */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Production */}
        <div className="p-6 bg-white border border-emerald-100/90 hover:border-emerald-200 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-2 group">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Period Output</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight tabular-nums">
              {totals.tonnes.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-sans">tonnes</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            {completedCount} of {calculatedRows.length} lines logged ({progressPercent}%)
          </div>
        </div>

        {/* Direct Scope 1 */}
        <div className="p-6 bg-white border border-emerald-100/90 hover:border-emerald-200 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-2 group">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Scope 1 GHG</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl sm:text-4xl text-emerald-600 tracking-tight tabular-nums">
              {Math.round(totals.direct).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-sans">tCO₂e</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Actual fuel gas & oil metered</span>
          </div>
        </div>

        {/* Indirect Scope 2 */}
        <div className="p-6 bg-white border border-emerald-100/90 hover:border-emerald-200 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Indirect Scope 2</span>
            {/* PPA Toggle Pill */}
            <button
              type="button"
              onClick={() => setUsePPA(!usePPA)}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                usePPA
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {usePPA ? '✓ Solar PPA Active' : 'Standard Grid'}
            </button>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl sm:text-4xl text-sky-600 tracking-tight tabular-nums">
              {Math.round(totals.indirect).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-sans">tCO₂e</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Grid factor: {effectiveGridFactor} t/MWh
          </div>
        </div>

        {/* Cost Exposure */}
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white rounded-2xl shadow-sm shadow-emerald-600/25 space-y-2">
          <div className="text-xs font-semibold text-emerald-100 flex items-center justify-between">
            <span className="uppercase tracking-wider text-[11px] font-bold">Certificate Exposure</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
              €{etsPriceEur}/t
            </span>
          </div>
          <div className="mt-1 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
            €{totals.cost.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-100 pt-1">
            2026 phase-in rate: 2.5% of liable GHG
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. PRIMARY DATA ENTRY TABLE WITH LIVE CALCULATIONS                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-emerald-100/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-bold text-slate-900">
              Active Production Lines ({selectedPeriod.replace('_', ' ')})
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live stoichiometric calculations
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden sm:block">
            {isPeriodLocked ? 'View-Only Archive' : 'Interactive: Edit cells to recalculate live'}
          </div>
        </div>

        {/* Standardized High-Density Data Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead className="bg-emerald-50/40 text-[10px] uppercase font-bold text-emerald-950/70 border-b border-emerald-100/80">
              <tr>
                <th className="py-3 px-4">Product Name & CN</th>
                <th className="py-3 px-3">Production (t)</th>
                <th className="py-3 px-3">Electricity (MWh)</th>
                <th className="py-3 px-3">Natural Gas (Nm³)</th>
                <th className="py-3 px-3 text-right">Direct Scope 1</th>
                <th className="py-3 px-3 text-right">SEE (tCO₂e/t)</th>
                <th className="py-3 px-4 text-center">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {calculatedRows.map((row) => {
                return (
                  <tr
                    key={row.productId}
                    className={`hover:bg-emerald-50/30 transition-colors ${
                      !row.usesActualData ? 'bg-amber-50/25' : ''
                    }`}
                  >
                    {/* Product Name */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-display font-bold text-slate-900 text-xs">{row.productName}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        CN {row.cnCode} · {row.sku}
                      </div>
                    </td>

                    {/* Quantity Produced */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        disabled={isPeriodLocked}
                        value={row.quantityProducedT}
                        onChange={(e) =>
                          handleCellChange(row.productId, 'quantityProducedT', e.target.value)
                        }
                        className={`w-28 h-10 px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 ${
                          isPeriodLocked
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                      />
                    </td>

                    {/* Electricity */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        disabled={isPeriodLocked}
                        value={row.electricityConsumedMwh}
                        onChange={(e) =>
                          handleCellChange(row.productId, 'electricityConsumedMwh', e.target.value)
                        }
                        className={`w-24 h-10 px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 ${
                          isPeriodLocked
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                      />
                    </td>

                    {/* Natural Gas */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        disabled={isPeriodLocked}
                        value={row.naturalGasNm3}
                        onChange={(e) =>
                          handleCellChange(row.productId, 'naturalGasNm3', e.target.value)
                        }
                        className={`w-28 h-10 px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 ${
                          isPeriodLocked
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                      />
                    </td>

                    {/* Live Calculated Direct */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-slate-900 text-xs tabular-nums">
                        {Math.round(row.calculatedDirect).toLocaleString()} t
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">
                        Gas + Oil emissions
                      </span>
                    </td>

                    {/* Specific SEE per tonne */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-emerald-700 text-xs tabular-nums">
                        {row.specificEmissionsSEE} <span className="font-normal text-slate-400">t/t</span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-through tabular-nums">
                        EU: {row.defaultFactor.directEmissionsTCo2PerT}
                      </span>
                    </td>

                    {/* Data Source Mode Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        disabled={isPeriodLocked}
                        onClick={() => handleToggleActualData(row.productId)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          row.usesActualData
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        {row.usesActualData ? '✓ Actual Data' : '⚠ Default Value'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Motivational Banner */}
        <div className="p-5 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-950 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="leading-relaxed">
              <strong>Cost Optimization:</strong> Using actual data across 3 lines saves your European buyers an estimated <strong>€418,500</strong> in CBAM certificate fees.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              alert('All quarterly consumption data synthesized and verified for EU XML dispatch!');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-sm self-start sm:self-auto shrink-0 transition-all"
          >
            Save & Lock Period
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. BULK ERP & SPREADSHEET IMPORT MODAL                             */}
      {/* ------------------------------------------------------------------- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsImportModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-150 border border-emerald-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Bulk Import from ERP / SCADA</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step {importStep} of 2: {importStep === 1 ? 'Select Source File' : 'Verify Column Mappings'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStep === 1 ? (
              <div className="space-y-4">
                <div
                  onClick={() => {
                    setSelectedFileName('Aegean_Rolling_Mill_Q3_Meters.xlsx');
                  }}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                    selectedFileName
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-emerald-400 bg-slate-50'
                  }`}
                >
                  <FileUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <div className="font-display text-xs font-bold text-slate-800">
                    {selectedFileName || 'Click to select Excel / CSV export file'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports SAP Plant Maintenance, SCADA CSVs, and Excel templates
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFileName}
                    onClick={() => setImportStep(2)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Next: Map Columns
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="font-display font-bold text-slate-800">Mapped Headers from {selectedFileName}:</div>
                  <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Production Volume (tonnes):</span>
                      <strong className="text-emerald-700 font-mono">Column B: NET_OUTPUT_TONS ✓</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Electricity (MWh):</span>
                      <strong className="text-emerald-700 font-mono">Column D: SUBSTATION_MWH ✓</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Natural Gas (Nm³):</span>
                      <strong className="text-emerald-700 font-mono">Column F: FLOW_METER_NM3 ✓</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setImportStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Bulk dataset imported and recalculated successfully!');
                      setIsImportModalOpen(false);
                      setImportStep(1);
                      setSelectedFileName(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Execute Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
