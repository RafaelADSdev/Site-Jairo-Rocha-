/** Illustrative operating cashflow, before income tax and debt. Not a price or income forecast. */
export interface InvestmentInput {
  purchase: number;
  closing: number;
  fitOut: number;
  cashReserve: number;
  daily: number;
  /** Percentage of nights offered for rental, after owner-use and maintenance blocks. */
  occupancy: number;
  blockedNights: number;
  averageStay: number;
  cleaningIncome: number;
  cleaningCost: number;
  platformPercent: number;
  managementPercent: number;
  reservePercent: number;
  consumptionPerNight: number;
  fixedMonthly: number;
}

export type BreakEvenStatus = 'feasible' | 'non_positive_margin' | 'exceeds_available_nights' | 'no_available_nights';

export interface InvestmentResult {
  capital: number;
  availableNights: number;
  nights: number;
  stays: number;
  lodging: number;
  cleaningRevenue: number;
  platform: number;
  management: number;
  maintenance: number;
  cleaning: number;
  consumption: number;
  fixedAnnual: number;
  totalCosts: number;
  annualResult: number;
  monthlyResult: number;
  yieldPercent: number;
  breakEvenPercent: number | null;
  breakEvenStatus: BreakEvenStatus;
}

export const investmentDefaults: Readonly<InvestmentInput> = Object.freeze({
  purchase: 500000,
  closing: 20000,
  fitOut: 60000,
  cashReserve: 20000,
  daily: 325,
  occupancy: 45,
  blockedNights: 0,
  averageStay: 3,
  cleaningIncome: 150,
  cleaningCost: 150,
  platformPercent: 16,
  managementPercent: 20,
  reservePercent: 5,
  consumptionPerNight: 15,
  fixedMonthly: 1200,
});

/** These sensitivity cases do not represent observed returns of any listed property. */
export const investmentScenarios = Object.freeze({
  conservative: Object.freeze({ label: 'Conservador', daily: 250, occupancy: 30 }),
  intermediate: Object.freeze({ label: 'Intermediário', daily: 325, occupancy: 45 }),
  favorable: Object.freeze({ label: 'Favorável', daily: 450, occupancy: 60 }),
});
export const scenarios = investmentScenarios;

const percentageFields = new Set<keyof InvestmentInput>(['occupancy', 'platformPercent', 'managementPercent', 'reservePercent']);

function validate(input: Readonly<InvestmentInput>): void {
  if (!input || typeof input !== 'object') throw new TypeError('input: informe as hipóteses da simulação.');
  for (const key of Object.keys(investmentDefaults) as (keyof InvestmentInput)[]) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`${key}: informe um número finito.`);
    }
    const maximum = percentageFields.has(key) ? 100 : key === 'blockedNights' || key === 'averageStay' ? 365 : 1e12;
    const minimum = key === 'averageStay' ? 1 : 0;
    if (value < minimum || value > maximum || ((key === 'purchase' || key === 'daily') && value === 0)) {
      throw new RangeError(`${key}: valor fora dos limites da simulação.`);
    }
    if (key === 'blockedNights' && !Number.isInteger(value)) {
      throw new RangeError('blockedNights: informe um número inteiro de noites.');
    }
  }
}

export function calculateInvestment(input: Readonly<InvestmentInput>): InvestmentResult {
  validate(input);
  const capital = input.purchase + input.closing + input.fitOut + input.cashReserve;
  const availableNights = 365 - input.blockedNights;
  // Fractional nights/stays represent an annual expected average, not bookable reservations.
  const nights = availableNights * input.occupancy / 100;
  const stays = nights / input.averageStay;
  const lodging = nights * input.daily;
  const cleaningRevenue = stays * input.cleaningIncome;
  const platform = (lodging + cleaningRevenue) * input.platformPercent / 100;
  const management = lodging * input.managementPercent / 100;
  const maintenance = lodging * input.reservePercent / 100;
  const cleaning = stays * input.cleaningCost;
  const consumption = nights * input.consumptionPerNight;
  const fixedAnnual = input.fixedMonthly * 12;
  const totalCosts = platform + management + maintenance + cleaning + consumption + fixedAnnual;
  const annualResult = lodging + cleaningRevenue - totalCosts;
  const monthlyResult = annualResult / 12;
  const yieldPercent = annualResult / capital * 100;
  const marginPerNight = input.daily * (1 - (input.platformPercent + input.managementPercent + input.reservePercent) / 100)
    + input.cleaningIncome / input.averageStay * (1 - input.platformPercent / 100)
    - input.cleaningCost / input.averageStay - input.consumptionPerNight;

  let breakEvenStatus: BreakEvenStatus;
  let breakEvenPercent: number | null = null;
  if (availableNights === 0) {
    breakEvenStatus = 'no_available_nights';
  } else if (marginPerNight <= 1e-9) {
    breakEvenStatus = 'non_positive_margin';
  } else {
    const requiredPercent = fixedAnnual / (availableNights * marginPerNight) * 100;
    if (requiredPercent > 100 + 1e-9) {
      breakEvenStatus = 'exceeds_available_nights';
    } else {
      breakEvenStatus = 'feasible';
      breakEvenPercent = Math.min(100, requiredPercent);
    }
  }

  return { capital, availableNights, nights, stays, lodging, cleaningRevenue, platform, management,
    maintenance, cleaning, consumption, fixedAnnual, totalCosts, annualResult, monthlyResult,
    yieldPercent, breakEvenPercent, breakEvenStatus };
}
