# MU Validate Pro v4.2 — Independent Calculation Engine Verification

## Purpose

Verify the software calculation logic independently from the JAMAC Excel output. Excel results are comparison data only and are not calculation inputs to the software engine.

## Primary controlled basis reviewed

- JM-LR-031 Rev.2 — Validation of Software Record.
- JM-LGL-005 — Guidelines for Measurement Uncertainty Calculation, as the approved MU calculation guideline referenced by JAMAC controlled work instructions.
- JM-LR-037 — Measurement Uncertainty Calculation workbook, used only as an operational comparison/regression source after the calculation model is established.

## Calculation-engine audit

| Step | Quantity | Software implementation | Verification status |
|---|---|---|---|
| 1 | Raw measured errors | Uses entered readings directly | PASS |
| 2 | Mean error | `mean = sum(readings)/n` | PASS |
| 3 | Reference correction | `CF = -Eref`; corrected reading = reading + CF; corrected mean = mean + CF | PASS |
| 4 | Deviations | corrected reading − corrected mean | PASS |
| 5 | Sample standard deviation | `s = sqrt(sum(d²)/(n-1))` | PASS |
| 6 | Repeatability u1 | `u1 = s/sqrt(n)`; `v1=n-1` | PASS |
| 7 | Certificate u2 | `u2 = Ucert/kcert` | PASS for formula; `v2=60` OPEN for controlled technical justification |
| 8 | Resolution u3 | `(R/2)/sqrt(3)` | PASS |
| 9 | Historical drift u4 | `D/sqrt(3)` | PASS against current controlled model |
| 10 | Temperature u5 | `(beta*deltaT)/sqrt(3)` | PASS |
| 11 | Combined standard uncertainty | `uc = sqrt(u1²+u2²+u3²+u4²+u5²)`; equivalent to full model where all sensitivity coefficients ci=1 | PASS |
| 12 | Effective DoF | Welch–Satterthwaite: `uc^4 / sum(ui^4/vi)` with u3–u5 treated as infinite DoF | PASS against current controlled model, subject to u2 DoF justification |
| 13 | Coverage factor | Current controlled JAMAC Student-t lookup convention, lower tabulated finite DoF | PASS as implementation of current table/convention |
| 14 | Expanded uncertainty | `U = k95 * uc` | PASS |
| 15 | Reporting | Upward 3-d.p. rounding followed by CMC floor comparison | PASS as implementation of current operational workbook; retain as laboratory-controlled reporting rule |

## Mathematical observations

### Correction factor and repeatability

Because the same constant correction factor is added to every reading and to the mean:

`(xi + CF) - (xbar + CF) = xi - xbar`

Therefore correction changes the corrected result but does not change the sample standard deviation or u1. The software implementation is mathematically consistent with this identity.

### Full-precision calculation

The engine performs calculations with JavaScript numeric precision. Display formatting is separate from the calculation values. Intermediate displayed decimal places must not be fed back into downstream calculations.

### Sensitivity coefficients

The controlled uncertainty budget includes sensitivity coefficients. The current software model implicitly uses `c1=c2=c3=c4=c5=1`; therefore its RSS implementation is algebraically equivalent to `uc = sqrt(sum((ci*ui)^2))` for the current model.

## Open technical item

### u2 degrees of freedom = 60

The software currently contains the fixed constant `U2_DOF = 60`. The operational JM-LR-037 workbook uses the same convention, but the controlled material reviewed for the formula `u2 = Ucert/kcert` does not by itself establish a general technical basis for assigning 60 degrees of freedom.

**Status: OPEN.** Do not describe `v2=60` as an ISO/IEC 17025 or universal metrology requirement. Before final controlled release, document the laboratory-approved basis for this value or revise the model if the approved method requires another treatment.

## Independent-validation principle

The acceptance sequence for MU Validate Pro is:

1. Establish the approved mathematical model from controlled technical documents.
2. Verify the source-code implementation against that model.
3. Execute independent known-answer/boundary test cases.
4. Only then compare the independently calculated results with JM-LR-037 Excel results.
5. Investigate discrepancies at intermediate level before evaluating the final MU.

The Excel result must never be used to derive or alter the software result merely to obtain agreement.

## Required comparison parameters

For each validation case retain, where applicable: mean error, corrected mean, sample standard deviation, u1, u2, u3, u4, u5, uc, effective DoF, lookup DoF, k95, unrounded U, rounded U, CMC comparison and final reported MU.

## Current conclusion

**Calculation logic: CONDITIONALLY VERIFIED.**

The implemented arithmetic for Steps 1–15 is internally consistent with the controlled calculation model reviewed and the existing regression evidence. Final controlled validation remains conditional on closure/documentation of the `v2=60` technical basis and completion of independent known-answer and boundary tests.

Owner & Developer: Mohd Khirul Anuar Bin Saadon
