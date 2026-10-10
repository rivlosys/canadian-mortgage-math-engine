/**
 * Canadian Mortgage & Financial Math Engine
 * Reference Implementation — UseCOS Research & Engineering (https://usecos.app)
 * Licensed under MIT.
 */

export interface CanadianMortgageParams {
  principal: number;
  annualRatePct: number;
  amortizationYears: number;
}

export interface AmortizationSummary {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  effectiveMonthlyRatePct: number;
}

/**
 * Calculates monthly mortgage payment using Canadian statutory semi-annual compounding
 * (Interest Act, R.S.C., 1985, c. I-15, s. 6).
 */
export function calculateCanadianMonthlyPayment(
  principal: number,
  annualRatePct: number,
  amortizationYears: number
): number {
  if (principal <= 0 || amortizationYears <= 0) return 0;
  if (annualRatePct === 0) return principal / (amortizationYears * 12);

  const r = annualRatePct / 100;
  // Semi-annual compounding converted to effective monthly rate
  const monthlyRate = Math.pow(1 + r / 2, 2 / 12) - 1;
  const totalMonths = amortizationYears * 12;

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Generates full term and lifetime summary for a Canadian fixed-rate mortgage.
 */
export function calculateAmortizationSummary(
  params: CanadianMortgageParams
): AmortizationSummary {
  const payment = calculateCanadianMonthlyPayment(
    params.principal,
    params.annualRatePct,
    params.amortizationYears
  );
  const totalMonths = params.amortizationYears * 12;
  const totalPaid = Math.round(payment * totalMonths * 100) / 100;
  const totalInterest = Math.round((totalPaid - params.principal) * 100) / 100;
  const r = params.annualRatePct / 100;
  const effectiveMonthlyRate = (Math.pow(1 + r / 2, 2 / 12) - 1) * 100;

  return {
    monthlyPayment: payment,
    totalPaid,
    totalInterest,
    effectiveMonthlyRatePct: Math.round(effectiveMonthlyRate * 10000) / 10000,
  };
}

/**
 * Calculates OSFI Guideline B-20 Qualifying Stress Rate.
 * Mandates the higher of contract rate + 2.0% or 5.25% floor.
 */
export function getQualifyingStressRate(contractRatePct: number): number {
  const OSFI_FLOOR = 5.25;
  return Math.max(contractRatePct + 2.0, OSFI_FLOOR);
}

export interface DebtServiceParams {
  grossAnnualIncome: number;
  monthlyPITI: number;       // Principal, Interest, Taxes, Heating
  monthlyOtherDebts: number;  // Credit cards, car loans, personal loans
}

export interface DebtServiceResult {
  gdsRatioPct: number;
  tdsRatioPct: number;
  qualifiesStandard: boolean; // GDS <= 39%, TDS <= 44%
}

/**
 * Evaluates Gross Debt Service (GDS) and Total Debt Service (TDS) ratios under federal caps.
 */
export function evaluateDebtServiceRatios(
  params: DebtServiceParams
): DebtServiceResult {
  if (params.grossAnnualIncome <= 0) {
    return { gdsRatioPct: 100, tdsRatioPct: 100, qualifiesStandard: false };
  }

  const grossMonthly = params.grossAnnualIncome / 12;
  const gds = (params.monthlyPITI / grossMonthly) * 100;
  const tds = ((params.monthlyPITI + params.monthlyOtherDebts) / grossMonthly) * 100;

  const roundedGds = Math.round(gds * 10) / 10;
  const roundedTds = Math.round(tds * 10) / 10;

  return {
    gdsRatioPct: roundedGds,
    tdsRatioPct: roundedTds,
    qualifiesStandard: roundedGds <= 39.0 && roundedTds <= 44.0,
  };
}

/**
 * Compares two mortgage renewal offers by true net term cost rather than monthly payment alone.
 */
export function compareRenewalOffers(params: {
  currentRemainingPrincipal: number;
  termMonths: number;
  offerA: { annualRatePct: number; fees: number; cashback: number };
  offerB: { annualRatePct: number; fees: number; cashback: number };
  amortizationYearsRemaining: number;
}): {
  paymentA: number;
  paymentB: number;
  termCostA: number;
  termCostB: number;
  netAdvantageOfferB: number;
} {
  const payA = calculateCanadianMonthlyPayment(
    params.currentRemainingPrincipal,
    params.offerA.annualRatePct,
    params.amortizationYearsRemaining
  );
  const payB = calculateCanadianMonthlyPayment(
    params.currentRemainingPrincipal,
    params.offerB.annualRatePct,
    params.amortizationYearsRemaining
  );

  const termCostA = payA * params.termMonths + params.offerA.fees - params.offerA.cashback;
  const termCostB = payB * params.termMonths + params.offerB.fees - params.offerB.cashback;

  return {
    paymentA: payA,
    paymentB: payB,
    termCostA: Math.round(termCostA * 100) / 100,
    termCostB: Math.round(termCostB * 100) / 100,
    netAdvantageOfferB: Math.round((termCostA - termCostB) * 100) / 100,
  };
}
