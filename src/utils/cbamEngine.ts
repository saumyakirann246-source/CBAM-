/**
 * CBAM Exporter Tracker — TypeScript Calculation Engine Module
 * Directly mirrors cbam_calculation_engine.js with full type definitions
 */

export interface ProductionCalculationInput {
  quantityProducedT: number;
  electricityConsumedMwh?: number;
  usesActualData: boolean;
  actualDirectEmissionsT?: number;
  actualIndirectEmissionsT?: number;
}

export interface DefaultFactorInput {
  directEmissionsTCo2PerT: number;
  indirectEmissionsTCo2PerT?: number | null;
}

export interface SectorExemptionInput {
  indirectExempt: boolean;
}

export interface EmbeddedEmissionsResult {
  directEmissionsT: number;
  indirectEmissionsT: number;
  totalEmbeddedEmissionsT: number;
  usedDefaultValue: boolean;
  markupApplied: number | null;
}

export interface CostExposureResult {
  liableEmissionsT: number;
  estimatedCostEur: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function calculateEmbeddedEmissions(
  productionData: ProductionCalculationInput,
  defaultFactor: DefaultFactorInput | null,
  sectorExemption: SectorExemptionInput,
  markupMultiplier: number | null
): EmbeddedEmissionsResult {
  const { quantityProducedT, usesActualData, actualDirectEmissionsT, actualIndirectEmissionsT } = productionData;

  if (usesActualData) {
    const direct = actualDirectEmissionsT || 0;
    const indirect = sectorExemption.indirectExempt ? 0 : (actualIndirectEmissionsT || 0);
    return {
      directEmissionsT: round3(direct),
      indirectEmissionsT: round3(indirect),
      totalEmbeddedEmissionsT: round3(direct + indirect),
      usedDefaultValue: false,
      markupApplied: null,
    };
  }

  if (!defaultFactor || markupMultiplier === null) {
    throw new Error('Default factor and markup multiplier required when usesActualData is false.');
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
    markupApplied: markupMultiplier,
  };
}

export const CANONICAL_MARKUP_SCHEDULE: Map<string, number> = new Map([
  ['iron_steel:2026', 1.10],
  ['iron_steel:2027', 1.20],
  ['iron_steel:2028', 1.30],
  ['cement:2026', 1.10],
  ['cement:2027', 1.20],
  ['cement:2028', 1.30],
  ['aluminium:2026', 1.10],
  ['aluminium:2027', 1.20],
  ['aluminium:2028', 1.30],
  ['hydrogen:2026', 1.10],
  ['hydrogen:2027', 1.20],
  ['hydrogen:2028', 1.30],
  ['fertiliser:2026', 1.01],
  ['fertiliser:2027', 1.01],
  ['fertiliser:2028', 1.01],
]);

export function getMarkupMultiplierForSectorYear(
  sector: string,
  year: number,
  markupSchedule: Map<string, number> = CANONICAL_MARKUP_SCHEDULE
): number {
  const key = `${sector}:${year}`;
  if (markupSchedule.has(key)) return markupSchedule.get(key)!;

  const seededYears = [...markupSchedule.keys()]
    .filter((k) => k.startsWith(`${sector}:`))
    .map((k) => parseInt(k.split(':')[1], 10))
    .sort((a, b) => a - b);

  if (seededYears.length === 0) {
    throw new Error(`No markup schedule seeded at all for sector '${sector}'.`);
  }

  const latestSeeded = seededYears[seededYears.length - 1];
  if (year > latestSeeded) return markupSchedule.get(`${sector}:${latestSeeded}`)!;
  throw new Error(`No markup multiplier seeded for sector '${sector}', year ${year}.`);
}

export const CANONICAL_FREE_ALLOCATION_SCHEDULE: Map<number, number> = new Map([
  [2026, 0.025],
  [2027, 0.05],
  [2028, 0.10],
  [2029, 0.225],
  [2030, 0.485],
  [2031, 0.61],
  [2032, 0.735],
  [2033, 0.86],
  [2034, 1.0],
]);

export function getFreeAllocationLiabilityForYear(
  year: number,
  schedule: Map<number, number> = CANONICAL_FREE_ALLOCATION_SCHEDULE
): number {
  if (schedule.has(year)) return schedule.get(year)!;
  const seededYears = [...schedule.keys()].sort((a, b) => a - b);
  const latestSeeded = seededYears[seededYears.length - 1];
  if (year > latestSeeded) return schedule.get(latestSeeded)!;
  throw new Error(`No sourced free-allocation liability percentage for year ${year}.`);
}

export function calculateCostExposure(
  totalEmbeddedEmissionsT: number,
  liabilityPercentage: number,
  etsPriceEurPerTonne: number
): CostExposureResult {
  const liableEmissions = totalEmbeddedEmissionsT * liabilityPercentage;
  const estimatedCostEur = liableEmissions * etsPriceEurPerTonne;
  return {
    liableEmissionsT: round3(liableEmissions),
    estimatedCostEur: round2(estimatedCostEur),
  };
}
