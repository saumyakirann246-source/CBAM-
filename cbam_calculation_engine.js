/**
 * CBAM Exporter Tracker — Calculation Engine
 * ==============================================================
 * Canonical Version 2 (Sector-Aware & Full 2026-2034 Schedule)
 * Pure functions, no side effects.
 */

export function calculateEmbeddedEmissions(productionData, defaultFactor, sectorExemption, markupMultiplier) {
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

  const directPerTonne = defaultFactor.directEmissionsTCo2PerT * markupMultiplier;
  const indirectPerTonne = sectorExemption.indirectExempt
    ? 0
    : (defaultFactor.indirectEmissionsTCo2PerT || 0) * markupMultiplier;

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

export function getMarkupMultiplierForSectorYear(sector, year, markupScheduleBySectorYear) {
  const key = `${sector}:${year}`;
  if (markupScheduleBySectorYear.has(key)) return markupScheduleBySectorYear.get(key);

  const seededYearsForSector = [...markupScheduleBySectorYear.keys()]
    .filter(k => k.startsWith(`${sector}:`))
    .map(k => parseInt(k.split(':')[1], 10))
    .sort((a, b) => a - b);

  if (seededYearsForSector.length === 0) {
    throw new Error(`No markup schedule seeded at all for sector '${sector}'.`);
  }

  const latestSeeded = seededYearsForSector[seededYearsForSector.length - 1];
  if (year > latestSeeded) return markupScheduleBySectorYear.get(`${sector}:${latestSeeded}`);
  throw new Error(`No markup multiplier seeded for sector '${sector}', year ${year}, and it precedes the earliest seeded year (${seededYearsForSector[0]}) — do not extrapolate backward.`);
}

export function getFreeAllocationLiabilityForYear(year, scheduleByYear) {
  if (scheduleByYear.has(year)) return scheduleByYear.get(year);
  const seededYears = [...scheduleByYear.keys()].sort((a, b) => a - b);
  const latestSeeded = seededYears[seededYears.length - 1];
  if (year > latestSeeded) return scheduleByYear.get(latestSeeded); // holds at 100% past 2034
  throw new Error(`No sourced free-allocation liability percentage for year ${year}. Populate free_allocation_schedule from the official phase-out table first.`);
}

export function calculateCostExposure(totalEmbeddedEmissionsT, liabilityPercentage, etsPriceEurPerTonne) {
  const liableEmissions = totalEmbeddedEmissionsT * liabilityPercentage;
  const estimatedCostEur = liableEmissions * etsPriceEurPerTonne;
  return {
    liableEmissionsT: round3(liableEmissions),
    estimatedCostEur: round2(estimatedCostEur)
  };
}

function round2(n) { return Math.round(n * 100) / 100; }
function round3(n) { return Math.round(n * 1000) / 1000; }
