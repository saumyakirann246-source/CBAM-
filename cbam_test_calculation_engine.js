import assert from 'assert';
import {
  calculateEmbeddedEmissions,
  getMarkupMultiplierForSectorYear,
  getFreeAllocationLiabilityForYear,
  calculateCostExposure
} from './cbam_calculation_engine.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`✓ ${name}`); }
  catch (e) { console.error(`✗ ${name}\n  ${e.message}`); process.exitCode = 1; }
}

// ---------------------------------------------------------------
// Test 1: actual data path — indirect exempt sector (steel) ignores
// any indirect figure entirely, even if one was supplied.
// ---------------------------------------------------------------
check('actual data: indirect-exempt sector zeroes out indirect emissions', () => {
  const result = calculateEmbeddedEmissions(
    { quantityProducedT: 1000, usesActualData: true, actualDirectEmissionsT: 1800, actualIndirectEmissionsT: 300 },
    null,
    { indirectExempt: true },
    null
  );
  assert.strictEqual(result.directEmissionsT, 1800);
  assert.strictEqual(result.indirectEmissionsT, 0, 'indirect should be zeroed for an exempt sector even though 300 was supplied');
  assert.strictEqual(result.totalEmbeddedEmissionsT, 1800);
  assert.strictEqual(result.usedDefaultValue, false);
});

// ---------------------------------------------------------------
// Test 2: default-value fallback applies the correct year's markup,
// scaled by quantity produced, for a non-exempt sector (cement).
// ---------------------------------------------------------------
check('default value fallback: applies markup and scales by quantity (non-exempt sector)', () => {
  const defaultFactor = { directEmissionsTCo2PerT: 0.6, indirectEmissionsTCo2PerT: 0.1 };
  const result = calculateEmbeddedEmissions(
    { quantityProducedT: 500, usesActualData: false },
    defaultFactor,
    { indirectExempt: false },
    1.10 // 2026 markup
  );
  // direct: 0.6 * 1.10 * 500 = 330
  // indirect: 0.1 * 1.10 * 500 = 55
  assert.strictEqual(result.directEmissionsT, 330);
  assert.strictEqual(result.indirectEmissionsT, 55);
  assert.strictEqual(result.totalEmbeddedEmissionsT, 385);
  assert.strictEqual(result.usedDefaultValue, true);
  assert.strictEqual(result.markupApplied, 1.10);
});

// ---------------------------------------------------------------
// Test 3: markup schedule is now SECTOR-AWARE — steel and fertiliser
// must resolve independently (fertiliser's 1% flat rate must never
// leak into a steel calculation or vice versa), and each sector holds
// forward at its own latest seeded value.
// ---------------------------------------------------------------
check('markup schedule: sector-aware lookup keeps steel and fertiliser independent', () => {
  const schedule = new Map([
    ['iron_steel:2026', 1.10], ['iron_steel:2027', 1.20], ['iron_steel:2028', 1.30],
    ['fertiliser:2026', 1.01], ['fertiliser:2027', 1.01], ['fertiliser:2028', 1.01]
  ]);
  assert.strictEqual(getMarkupMultiplierForSectorYear('iron_steel', 2027, schedule), 1.20);
  assert.strictEqual(getMarkupMultiplierForSectorYear('fertiliser', 2027, schedule), 1.01, 'fertiliser must use its own 1% schedule, not steel\'s 20%');
  assert.strictEqual(getMarkupMultiplierForSectorYear('iron_steel', 2030, schedule), 1.30, 'steel should hold at its own latest seeded value');
  assert.strictEqual(getMarkupMultiplierForSectorYear('fertiliser', 2030, schedule), 1.01, 'fertiliser should hold at its own latest seeded value, not steel\'s');
});

check('markup schedule: refuses to guess for a year before the seeded range', () => {
  const schedule = new Map([['iron_steel:2026', 1.10]]);
  assert.throws(() => getMarkupMultiplierForSectorYear('iron_steel', 2025, schedule), /precedes the earliest seeded year/);
});

check('markup schedule: refuses a sector with no schedule seeded at all', () => {
  const schedule = new Map([['iron_steel:2026', 1.10]]);
  assert.throws(() => getMarkupMultiplierForSectorYear('electricity', 2026, schedule), /No markup schedule seeded at all/);
});

// ---------------------------------------------------------------
// Test 4: free-allocation lookup — now fully sourced 2026-2034, plus
// forward-hold at 100% beyond 2034.
// ---------------------------------------------------------------
check('free allocation: full sourced schedule resolves correctly, holds at 100% past 2034', () => {
  const schedule = new Map([
    [2026, 0.025], [2027, 0.05], [2028, 0.10], [2029, 0.225], [2030, 0.485],
    [2031, 0.61], [2032, 0.735], [2033, 0.86], [2034, 1.0]
  ]);
  assert.strictEqual(getFreeAllocationLiabilityForYear(2030, schedule), 0.485);
  assert.strictEqual(getFreeAllocationLiabilityForYear(2040, schedule), 1.0, 'years past 2034 should hold at fully phased-out (100%)');
  assert.throws(() => getFreeAllocationLiabilityForYear(2024, schedule), /Populate free_allocation_schedule/);
});

// ---------------------------------------------------------------
// Test 5: cost exposure — liable emissions and EUR estimate
// ---------------------------------------------------------------
check('cost exposure: applies liability percentage then ETS price', () => {
  const result = calculateCostExposure(1000, 0.025, 75.00);
  // liable: 1000 * 0.025 = 25 tonnes
  // cost: 25 * 75 = 1875
  assert.strictEqual(result.liableEmissionsT, 25);
  assert.strictEqual(result.estimatedCostEur, 1875);
});

console.log(`\n${passed} test(s) passed.`);
