# Contributing to Canadian Mortgage Math Engine

Thank you for your interest in contributing to the **Canadian Mortgage Math Engine**!

This project is an open-source, reference mathematical implementation maintained by [UseCOS](https://usecos.app). Our mission is to eliminate multi-thousand-dollar calculation errors in Canadian fintech and consumer borrowing tools.

---

## Areas Where Contributions Are Welcomed

1. **Provincial Land Transfer Tax Edge Cases**: Adding or updating municipal and provincial tax rebate rules (e.g. Ontario, BC, Toronto, Montreal).
2. **Prepayment Penalty Logic**: Refining standard Closed 3-Month Interest vs Interest Rate Differential (IRD) models against major Schedule I bank posted vs discounted rate spreads.
3. **Automated Mathematical Tests**: Adding edge test cases verifying rounding conventions and accelerated amortizations against CMHC tables and Bank of Canada data.

---

## How to Propose Changes

1. **Open an Issue**: For major formulas or discrepancies, open an issue citing the relevant regulatory guideline (e.g., OSFI B-20, FCAC guidance, or Section 6 of the *Interest Act*).
2. **Submit a Pull Request**:
   - Ensure all functions remain zero-dependency TypeScript.
   - Run verification scripts (`node test.mjs`) to ensure zero regressions.
   - Document the statutory source for any revised formulas.

---

## Production Verification

Live interactive implementations of this engine are hosted on:
- [UseCOS Canadian Mortgage Calculator](https://usecos.app/mortgage)
- [UseCOS Methodology & Test Cases](https://usecos.app/methodology/mortgage-calculator-validation)
