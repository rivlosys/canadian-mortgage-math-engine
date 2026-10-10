# Canadian Mortgage & Financial Math Engine 🇨🇦

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Interactive Calculators](https://img.shields.io/badge/Live%20Demo-UseCOS-success)](https://usecos.app/mortgage)

> An open-source reference, mathematical specification, and TypeScript implementation of official Canadian lending, mortgage qualification, and taxation formulas. Includes Bank of Canada / OSFI B-20 stress-test rules, semi-annual compounding equations, GDS/TDS limits, and provincial tax brackets.

---

## 📌 Why This Exists

Most mortgage and finance calculators on the internet default to **US lending standards** (monthly compounding). In Canada, federal lending laws mandate **semi-annual compounding** for fixed-rate mortgages, and OSFI B-20 enforces strict qualifying stress tests.

Using US formulas for Canadian mortgages causes errors in amortization schedules, payment amounts, and debt-service ratios. This repository serves as the transparent, open-source mathematical reference for developers, financial analysts, and mortgage professionals.

> **Need an interactive browser tool?**
> Test these formulas with visual charts and amortization schedules on [UseCOS Canadian Mortgage Calculator](https://usecos.app/mortgage) and the [Mortgage Renewal Offer Analyzer](https://usecos.app/mortgage/renewal-offer-analyzer).

---

## 📐 1. Canadian Mortgage Compounding Formula

Under Canadian federal law (*Interest Act*, Section 6), interest on mortgages must be quoted on a semi-annual or annual compounding basis. Fixed-rate Canadian mortgages compound **semi-annually, not in advance**.

### Mathematical Derivation

To calculate the monthly payment from an annual nominal rate r:

1. **Semi-Annual Compounding Factor**:
   f = 1 + (r / 2)

2. **Effective Monthly Interest Rate (i)**:
   i = (1 + r / 2)^(2 / 12) - 1 = (1 + r / 2)^(1 / 6) - 1

3. **Monthly Payment (P)**:
   Given loan principal L and total amortization months n:
   P = L * [i * (1 + i)^n] / [(1 + i)^n - 1]

### TypeScript Implementation

```typescript
export function calculateCanadianMonthlyPayment(
  principal: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (principal <= 0 || amortizationYears <= 0) return 0;
  if (annualRate === 0) return principal / (amortizationYears * 12);

  const r = annualRate / 100;
  // Canadian Semi-Annual Compounding to Monthly Equivalent
  const monthlyRate = Math.pow(1 + r / 2, 2 / 12) - 1;
  const totalMonths = amortizationYears * 12;

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(payment * 100) / 100;
}

// Example Test Vector:
// $500,000 principal at 5.00% for 25 years
// Result: $2,908.02 CAD / month
```

---

## 🛡️ 2. OSFI Guideline B-20 Stress Test (Qualification Rate)

Federal regulation requires federally regulated financial institutions (FRFIs) to qualify uninsured and insured borrowers at the **higher** of:
1. The contract mortgage interest rate + 2.00%
2. The minimum qualifying rate (floor set by OSFI / BoC, currently **5.25%**)

r_qualify = max(r_contract + 2.00%, 5.25%)

### Debt Service Caps

| Ratio | Cap (Standard) | Cap (Exceptional / Strong Credit) | Formula |
| :--- | :--- | :--- | :--- |
| **GDS** (Gross Debt Service) | **39.0%** | 39.0% | (PITI / Gross Monthly Income) * 100 |
| **TDS** (Total Debt Service) | **44.0%** | 44.0% | ((PITI + Other Debts) / Gross Monthly Income) * 100 |

### TypeScript Implementation

```typescript
export function getQualifyingStressRate(contractRate: number): number {
  const OSFI_FLOOR = 5.25;
  return Math.max(contractRate + 2.0, OSFI_FLOOR);
}

export function checkDebtServiceQualification(params: {
  grossAnnualIncome: number;
  monthlyPITI: number;
  monthlyOtherDebts: number;
}): { gds: number; tds: number; qualifies: boolean } {
  const grossMonthly = params.grossAnnualIncome / 12;
  const gds = (params.monthlyPITI / grossMonthly) * 100;
  const tds = ((params.monthlyPITI + params.monthlyOtherDebts) / grossMonthly) * 100;

  return {
    gds: Math.round(gds * 10) / 10,
    tds: Math.round(tds * 10) / 10,
    qualifies: gds <= 39.0 && tds <= 44.0
  };
}
```

---

## 🔄 3. Mortgage Renewal "Break-Even" & Net Advantage

When a borrower renews or switches lenders, comparing headline interest rates is misleading because lenders charge transfer fees, appraisal costs, or offer cashback bonuses.

For an interactive comparison of total cost across 3-year and 5-year terms, run your renewal statement through the [UseCOS Renewal Offer Grader](https://usecos.app/mortgage/renewal-offer-analyzer).

---

## 📊 4. Canadian 2026 Federal Tax Brackets

Federal tax brackets indexed for inflation for the 2026 tax year:

| Federal Tax Bracket | Tax Rate | Cumulative Tax at Base |
| :--- | :--- | :--- |
| **$0 to $57,375** | 15.0% | $0.00 |
| **$57,376 to $114,750** | 20.5% | $8,606.25 |
| **$114,751 to $177,882** | 26.0% | $20,368.13 |
| **$177,883 to $253,414** | 29.0% | $36,782.45 |
| **Over $253,414** | 33.0% | $58,686.73 |

---

## 🛠️ Interactive Tools & Reference Suite

All algorithms in this repository power the open browser utilities on **[UseCOS](https://usecos.app)**:

* 🏠 **[Canadian Mortgage Calculator](https://usecos.app/mortgage)** — Semi-annual compounding and amortization schedules.
* 🔄 **[Mortgage Renewal Offer Analyzer](https://usecos.app/mortgage/renewal-offer-analyzer)** — Term cost, switching fees, and penalty calculations.
* 💼 **[Paycheck & Tax Calculator Canada](https://usecos.app/pay)** — Federal & provincial brackets, CPP/CPP2, and EI limits.
* 🏷️ **[GST/HST Canada Table & Calculator](https://usecos.app/gst)** — Provincial rates and input tax credit breakdowns.
* 🏢 **[DSCR & Rental Property Calculator](https://usecos.app/mortgage/investor)** — Debt service coverage ratios and cap rates.

---

## 📄 License & Contributing

Licensed under the **MIT License**. Contributions, bug reports, and updates are welcome via GitHub Pull Requests.
