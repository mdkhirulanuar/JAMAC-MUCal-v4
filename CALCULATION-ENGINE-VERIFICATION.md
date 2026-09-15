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
| 7 | Certificate u2 | `u2 = Ucert/kcert` | PASS for formula; `v2=60` retained only as provisional legacy/operational assumption pending approved basis |
| 8 | Resolution u3 | `(R/2)/sqrt(3)` | PASS |
| 9 | Historical drift u4 | `D/sqrt(3)` | PASS against current controlled model |
| 10 | Temperature u5 | `(beta*deltaT)/sqrt(3)` | PASS |
| 11 | Combined standard uncertainty | `uc = sqrt(u1²+u2²+u3²+u4²+u5²)`; equivalent to full model where all sensitivity coefficients ci=1 | PASS |
| 12 | Effective DoF | Welch–Satterthwaite: `uc^4 / sum(ui^4/vi)` with u3–u5 treated as infinite DoF | PASS against current controlled model, subject to u2 DoF treatment |
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

## Technical assessment — u2 degrees of freedom

### What the JAMAC controlled records establish

JM-LR-031 Rev.2 identifies the calibration-certificate contribution as a Type B, normal-distribution component and defines the standard uncertainty as the certificate expanded uncertainty divided by its coverage factor. The form also includes `v2` in the Welch–Satterthwaite denominator, but the reviewed controlled record does not state a numerical value or rule for assigning `v2`.

The draft Rev.3 validation form therefore deliberately records `ν2 (controlled value / basis)` rather than prescribing 60.

### External metrology basis

The GUM treatment of degrees of freedom for a Type B standard uncertainty is based on the reliability of the uncertainty estimate. GUM Annex G provides an approximate relationship of the form:

`νi ≈ 0.5 × [Δu(xi) / u(xi)]^(-2)`

where `Δu/u` represents the relative uncertainty assigned to the uncertainty estimate itself. Consequently, a fixed value such as 60 is not a universal consequence of `u2 = Ucert/kcert`, nor is it an ISO/IEC 17025 requirement.

Where a Type B contribution is considered known with sufficiently high reliability, metrology guidance commonly treats its degrees of freedom as effectively infinite. Where the source calibration certificate provides effective degrees of freedom, that certificate information can provide a more direct basis for the propagated contribution. A finite assumed value is defensible only when its reliability assumption or controlled laboratory method is documented.

For reference, `ν = 60` corresponds through the GUM reliability approximation to an assumed relative uncertainty in the uncertainty estimate of approximately:

`Δu/u = sqrt[1/(2×60)] ≈ 0.0913 = 9.13%`

Therefore assigning 60 implicitly represents a reliability assumption of about 9.1% in the estimate of the Type B standard uncertainty. No reviewed JAMAC controlled document currently states that assumption.

### Decision for MU Validate Pro v4.2

**Do not change the production calculation engine solely from this technical review.** The current `U2_DOF = 60` remains in v4.2 because it is part of the existing operational JM-LR-037 model and changing it before JAMAC approves the governing method would make the software inconsistent with the current controlled calculation.

However, `ν2 = 60` shall be classified as a **provisional legacy/operational assumption**, not as independently validated metrological truth.

Before the software can be designated fully verified for controlled use, JAMAC should establish one approved rule for the calibration-certificate component, for example:

1. use effective DoF stated by the source calibration certificate, where available and applicable;
2. treat the Type B certificate contribution as effectively infinite where the laboratory has an approved technical basis for doing so; or
3. retain a finite laboratory-assigned DoF (including 60) with documented reliability rationale and approval.

The chosen rule should be incorporated into JM-LGL-005/JM-LR-037 or another controlled technical document and then implemented consistently in both Excel and MU Validate Pro.

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

Independent known-answer and boundary testing has been completed against the defined current model without identifying a calculation-sequence defect. The remaining material method-control issue is the technical/controlled basis for `ν2 = 60`. Until that rule is formally established, v4.2 may reproduce and independently check the current operational model, but the fixed `ν2=60` assumption shall not be represented as a universal metrology or ISO/IEC 17025 requirement.

Owner & Developer: Mohd Khirul Anuar Bin Saadon
