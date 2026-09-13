import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateInvestment, investmentDefaults, investmentScenarios, scenarios } from './litoral-investment.ts';

const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);

test('intermediate reference reproduces the dated research cashflow without tax or appreciation', () => {
  const result = calculateInvestment(investmentDefaults);
  assert.equal(result.capital, 600000);
  assert.equal(result.availableNights, 365);
  close(result.nights, 164.25);
  close(result.stays, 54.75);
  close(result.lodging, 53381.25);
  close(result.cleaningRevenue, 8212.5);
  close(result.platform, 9855);
  close(result.management, 10676.25);
  close(result.maintenance, 2669.0625);
  close(result.cleaning, 8212.5);
  close(result.consumption, 2463.75);
  close(result.fixedAnnual, 14400);
  close(result.totalCosts, 48276.5625);
  close(result.annualResult, 13317.1875);
  close(result.monthlyResult, 1109.765625);
  close(result.yieldPercent, 2.21953125);
  close(result.breakEvenPercent!, 23.378995433789952);
  assert.equal(result.breakEvenStatus, 'feasible');
});

test('scenario presets are hypotheses and include a loss case', () => {
  assert.equal(scenarios, investmentScenarios);
  const results = Object.values(investmentScenarios).map(({ daily, occupancy }) => calculateInvestment({ ...investmentDefaults, daily, occupancy }));
  close(results[0].annualResult, -767.25);
  close(results[0].yieldPercent, -0.127875);
  close(results[1].annualResult, 13317.1875);
  close(results[2].annualResult, 38707.5);
  close(results[2].yieldPercent, 6.45125);
});

test('blocked nights reduce availability, not fixed costs or invested capital', () => {
  const result = calculateInvestment({ ...investmentDefaults, blockedNights: 65 });
  assert.equal(result.availableNights, 300);
  assert.equal(result.nights, 135);
  assert.equal(result.fixedAnnual, 14400);
  assert.equal(result.capital, 600000);
  close(result.breakEvenPercent!, 14400 / (300 * (325 * .59 - 23)) * 100);
});

test('no availability returns fixed-cost loss and no division by zero', () => {
  const result = calculateInvestment({ ...investmentDefaults, blockedNights: 365 });
  assert.equal(result.nights, 0);
  assert.equal(result.stays, 0);
  assert.equal(result.annualResult, -14400);
  assert.equal(result.breakEvenPercent, null);
  assert.equal(result.breakEvenStatus, 'no_available_nights');
});

test('zero occupancy and zero fixed costs remain meaningful', () => {
  const empty = calculateInvestment({ ...investmentDefaults, occupancy: 0 });
  assert.equal(empty.annualResult, -14400);
  const noFixed = calculateInvestment({ ...investmentDefaults, fixedMonthly: 0 });
  assert.equal(noFixed.breakEvenPercent, 0);
  assert.equal(noFixed.breakEvenStatus, 'feasible');
});

test('non-positive contribution margin never promises break-even', () => {
  for (const daily of [10, 23 / .59]) {
    const result = calculateInvestment({ ...investmentDefaults, daily });
    assert.equal(result.breakEvenPercent, null);
    assert.equal(result.breakEvenStatus, 'non_positive_margin');
  }
});

test('insufficient nights returns explicit impossible break-even rather than over-100% occupancy', () => {
  for (const overrides of [{ daily: 50 }, { blockedNights: 300 }]) {
    const result = calculateInvestment({ ...investmentDefaults, ...overrides });
    assert.equal(result.breakEvenPercent, null);
    assert.equal(result.breakEvenStatus, 'exceeds_available_nights');
  }
});

test('exactly 100% break-even is feasible', () => {
  const result = calculateInvestment({ ...investmentDefaults, fixedMonthly: 365 * (325 * .59 - 23) / 12 });
  close(result.breakEvenPercent!, 100);
  assert.equal(result.breakEvenStatus, 'feasible');
});

test('cleaning is pass-through but platform fee also applies to its revenue', () => {
  const original = calculateInvestment(investmentDefaults);
  const noCleaning = calculateInvestment({ ...investmentDefaults, cleaningIncome: 0, cleaningCost: 0 });
  close(noCleaning.annualResult - original.annualResult, original.cleaningRevenue * .16);
});

test('expenses can be zero and high fees can create an honest loss', () => {
  const free = calculateInvestment({ ...investmentDefaults, platformPercent: 0, managementPercent: 0, reservePercent: 0, consumptionPerNight: 0, fixedMonthly: 0, cleaningIncome: 0, cleaningCost: 0 });
  assert.equal(free.annualResult, free.lodging);
  const expensive = calculateInvestment({ ...investmentDefaults, platformPercent: 100, managementPercent: 100, reservePercent: 100 });
  assert.ok(expensive.annualResult < 0);
  assert.equal(expensive.breakEvenStatus, 'non_positive_margin');
});

test('fixed costs and total acquisition capital are correctly reflected in annual yield', () => {
  const base = calculateInvestment(investmentDefaults);
  const extraCosts = calculateInvestment({ ...investmentDefaults, fixedMonthly: 1500 });
  close(extraCosts.annualResult, base.annualResult - 3600);
  close(extraCosts.yieldPercent, base.yieldPercent - .6);
  const extraCapital = calculateInvestment({ ...investmentDefaults, closing: 40000 });
  assert.equal(extraCapital.annualResult, base.annualResult);
  close(extraCapital.yieldPercent, base.annualResult / 620000 * 100);
});

test('input objects are never mutated', () => {
  const input = Object.freeze({ ...investmentDefaults });
  calculateInvestment(input);
  assert.deepEqual(input, investmentDefaults);
});

test('every numeric field rejects NaN, infinity, missing and string values', () => {
  for (const key of Object.keys(investmentDefaults)) {
    for (const value of [NaN, Infinity, -Infinity, undefined, '10']) {
      assert.throws(() => calculateInvestment({ ...investmentDefaults, [key]: value } as never), new RegExp(key));
    }
  }
});

test('every numeric field rejects negative values and unrealistic overflow-sized values', () => {
  for (const key of Object.keys(investmentDefaults)) {
    for (const value of [-1, Number.MAX_VALUE]) {
      assert.throws(() => calculateInvestment({ ...investmentDefaults, [key]: value }), new RegExp(key));
    }
  }
});

test('bounded inputs reject impossible occupancy, blocked days, stay duration and zero purchase', () => {
  for (const [key, value] of [['occupancy', 101], ['blockedNights', 366], ['blockedNights', .5], ['averageStay', 0], ['averageStay', 366], ['purchase', 0], ['daily', 0], ['platformPercent', 101], ['managementPercent', 101], ['reservePercent', 101]] as const) {
    assert.throws(() => calculateInvestment({ ...investmentDefaults, [key]: value }), new RegExp(key));
  }
});

test('null and missing whole input fail with understandable input validation', () => {
  assert.throws(() => calculateInvestment(null as never), /input/i);
  assert.throws(() => calculateInvestment(undefined as never), /input/i);
});
