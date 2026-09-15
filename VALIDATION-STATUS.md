# MU Validate Pro v4.2 — Validation Status and Release Criteria

## 1. Validation objective

MU Validate Pro v4.2 is intended to independently recalculate measurement uncertainty from entered source data and to verify/validate the corresponding JAMAC Metering Excel-based MU calculation. Excel-calculated intermediate or final values shall not drive the software calculation engine.

## 2. Evidence completed

| Validation activity | Status | Conclusion |
|---|---|---|
| Calculation sequence audit, Steps 1–15 | PASS / conditional method item | No calculation-sequence defect identified against the defined current model |
| Correction-factor sign and propagation | PASS | CF = −Eref; constant correction does not alter repeatability |
| Sample standard deviation and u1 | PASS | n−1 sample denominator and u1 = s/√n implemented |
| u2 formula | PASS | u2 = Ucert/kcert implemented |
| u3 resolution | PASS | (R/2)/√3 implemented |
| u4 historical drift | PASS | D/√3 implemented |
| u5 temperature | PASS | (βΔT)/√3 implemented |
| Combined standard uncertainty | PASS | RSS model equivalent to ci = 1 for all current components |
| Welch–Satterthwaite implementation | PASS / conditional on ν2 rule | Arithmetic implementation verified |
| Student-t lookup convention | PASS against current model | Lower-tabulated finite-DoF convention implemented |
| Expanded uncertainty | PASS | U = uc × k95 implemented |
| Upward 3-d.p. reporting rule | PASS against current operational model | Implemented before CMC comparison |
| CMC floor | PASS | Final MU is not reported below entered CMC |
| Known-answer tests KAT-01 to KAT-05 | PASS | Principal calculation paths challenged |
| Boundary/code-path tests BT-01 to BT-06 | PASS | Boundary, rounding, CMC, small-value and validation paths challenged |
| Independence from Excel MU input | PASS | Excel MU is comparison data only; it does not derive software MU |
| ν2 = 60 technical basis | OPEN | Current operational/legacy assumption; no reviewed controlled JAMAC source establishes the basis |

## 3. Controlled-source finding for ν2

JM-LR-031 Rev.2 defines the calibration-certificate component as Type B / normal and uses the certificate expanded uncertainty and coverage factor to obtain the standard uncertainty. Its uncertainty budget includes degrees of freedom in the Welch–Satterthwaite calculation, but the reviewed controlled record does not prescribe a numerical ν2 value or a rule that establishes 60.

Accordingly, `U2_DOF = 60` in v4.2 is retained only to preserve the current operational calculation model. It shall not be described as an ISO/IEC 17025 requirement or as a universally valid metrological value.

## 4. Current release classification

**CALCULATION ENGINE STATUS: CONDITIONALLY VERIFIED**

Meaning:

- the implemented arithmetic has passed the defined calculation audit, known-answer tests and boundary/code-path tests;
- no calculation-sequence defect has been identified for the current defined model;
- the software can be used as an independent checker of the current operational calculation model, subject to laboratory control and review;
- the fixed ν2 = 60 assumption remains a method-governance item requiring approved technical basis before the engine is designated FULLY VERIFIED.

`CONDITIONALLY VERIFIED` does not mean that the software result should be altered to agree with Excel. Any disagreement shall be investigated at the earliest differing intermediate calculation.

## 5. Criteria to upgrade to FULLY VERIFIED

All of the following shall be satisfied:

1. JAMAC approves and documents the treatment of degrees of freedom for the calibration-certificate contribution, including the basis for ν2.
2. JM-LGL-005, JM-LR-037 or another applicable controlled technical document is updated/confirmed so that the approved ν2 rule is unambiguous.
3. MU Validate Pro is updated if the approved rule differs from the current `ν2 = 60` implementation.
4. The affected known-answer and boundary tests are re-executed after any calculation-engine change.
5. Independent comparison against approved JM-LR-037 datasets is completed at intermediate and final-result level.
6. Any discrepancies are investigated and closed; expected answers shall not be modified merely to make the software pass.
7. The validated software version, validation dataset/reference, reviewer and approver are recorded in the controlled validation record.

## 6. Required independent Excel comparison

For each selected validation dataset compare at least:

- mean error;
- corrected mean;
- sample standard deviation;
- u1, u2, u3, u4 and u5;
- combined standard uncertainty, uc;
- effective degrees of freedom, νeff;
- Student-t lookup DoF and k95;
- unrounded expanded uncertainty, U;
- upward-rounded U;
- CMC decision; and
- final reported MU.

The acceptance conclusion should distinguish:

- **Software calculation verification** — whether MU Validate Pro agrees with the independently established expected calculation; and
- **Excel verification** — whether the JAMAC Excel workbook agrees with the independently verified software/manual calculation.

These are separate conclusions. Agreement between two implementations alone is not proof that the governing mathematical model is technically correct.

## 7. Change-control rule

Any change affecting formulas, constants, Student-t lookup, rounding, CMC logic, input validation or calculation precision shall trigger impact assessment and revalidation of affected tests before release. Cosmetic/UI-only changes may be classified separately where they demonstrably do not affect the calculation engine.

## 8. Recommended controlled conclusion wording

> MU Validate Pro v4.2 independently recalculates measurement uncertainty from entered source data. Calculation-engine Steps 1–15 have been verified against the defined current mathematical model using independent known-answer and boundary tests, with no calculation-sequence defect identified. The software result is calculated independently of the Excel comparison value. Full controlled verification remains conditional on formal approval/documentation of the degrees-of-freedom treatment for the calibration-certificate uncertainty contribution (ν2), currently implemented as the legacy operational value 60.

Owner & Developer: Mohd Khirul Anuar Bin Saadon
Copyright © 2026 Mohd Khirul Anuar Bin Saadon. All Rights Reserved.
