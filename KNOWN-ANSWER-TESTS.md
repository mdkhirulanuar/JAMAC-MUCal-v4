# MU Validate Pro v4.2 — Independent Known-Answer & Boundary Test Record

## Purpose

Challenge the calculation engine independently of the JAMAC Excel output. Expected values in this record are calculated from the documented mathematical model, not copied from Excel-calculated intermediate or final results.

## Controlled calculation model used

- Mean: ε̄ = Σεᵢ / n
- Reference correction: CF = −Eref
- Corrected reading: εᵢ,corr = εᵢ + CF
- Corrected mean: ε̄corr = ε̄ + CF
- Sample standard deviation: s = √[Σ(εᵢ,corr − ε̄corr)²/(n−1)]
- u1 = s/√n; ν1 = n−1
- u2 = Ucert/kcert; ν2 = 60 **provisionally retained from the current operational model; technical basis remains open**
- u3 = (R/2)/√3; ν3 = ∞
- u4 = D/√3; ν4 = ∞
- u5 = (βΔT)/√3; ν5 = ∞
- uc = √Σuᵢ² (all current sensitivity coefficients cᵢ = 1)
- νeff = uc⁴ / [(u1⁴/ν1) + (u2⁴/ν2)]
- k95 = current controlled lower-tabulated Student-t lookup rule
- U = uc × k95
- operational reporting rule: round U upward to 3 decimal places, then report not less than laboratory CMC.

Calculations retain full floating-point precision; displayed values below are rounded only for presentation.

## KAT-01 — Baseline known-answer case — PASS

Inputs: readings = [-0.0349, -0.0374, -0.0374, -0.0349, -0.0349, -0.0324, -0.0349, -0.0349, -0.0324, -0.0374] %, Eref = -0.0200 %, Ucert = 0.0400 %, kcert = 2, R = 0.0001 %, D = 0.0120 %, β = 0.0020 %/°C, ΔT = 2 °C, CMC = 0.040 %.

| Parameter | Independent expected result |
|---|---:|
| Mean ε̄ | -0.035150 % |
| CF | +0.020000 % |
| Corrected mean | -0.015150 % |
| s | 0.001844662 % |
| u1 | 0.000583333 % |
| u2 | 0.020000000 % |
| u3 | 0.000028868 % |
| u4 | 0.006928203 % |
| u5 | 0.002309401 % |
| uc | 0.021299635 % |
| νeff | 77.18231571 |
| lookup DoF | 70 |
| k95 | 1.99 |
| U before reporting rounding | 0.042386273 % |
| U rounded upward | 0.043 % |
| Final reported MU | 0.043 % |

Code-path inspection confirms the v4.2 engine implements this sequence without using `excelMU` as a calculation input.

## KAT-02 — Positive reference error / negative correction factor — PASS

Use KAT-01 inputs except Eref = +0.0200 %. Expected CF = -0.020000 % and corrected mean = -0.055150 %. Because the same additive CF is applied to every reading and to the mean, s, u1, u2–u5, uc, νeff, k95 and U remain identical to KAT-01.

The engine implements `correctionFactor = -refStdError`, applies it to every reading and the mean, and forms deviations from corrected values. This correctly preserves repeatability under a common additive correction.

## KAT-03 — Zero reference correction — PASS

Use KAT-01 inputs except Eref = 0. Expected CF = 0 and corrected mean = raw mean = -0.035150 %. All uncertainty results remain identical to KAT-01. The engine code path satisfies this invariant.

## KAT-04 — Zero repeatability — PASS

Inputs: readings = [-0.0100, -0.0100] %, with all other uncertainty inputs as KAT-01.

Independent result: s = 0; u1 = 0; uc = 0.021291645466 %; νeff = 77.0669500003; lookup DoF = 70; k95 = 1.99; U = 0.042370374478 %; upward-rounded U = 0.043 %; reported MU = 0.043 %.

The engine explicitly sets the u1 Welch–Satterthwaite term to zero when u1 = 0, preventing a NaN/division failure.

## KAT-05 — Minimum permitted n = 2 with non-zero repeatability — PASS

Inputs: readings = [-0.0100, +0.0100] %, with all other uncertainty inputs as KAT-01.

Independent result: mean = 0; s = 0.014142135624 %; u1 = 0.010000000000 %; ν1 = 1; uc = 0.023523056066 %; νeff = 24.1720026316; lookup DoF = 20; k95 = 2.09; U = 0.049163187177 %; upward-rounded/report MU = 0.050 %.

This confirms the intended n−1 sample denominator, minimum n validation and lower-tabulated Student-t selection.

## BT-01 — Student-t lookup boundaries — PASS

Direct inspection of `coverageFactor95()` and `coverageDf95()` confirms a lower-tabulated lookup. At an exact table row the row is selected; immediately below it the previous row is selected; immediately above it the same row remains selected until the next row. Representative expected behavior:

| νeff | Lookup DoF | k95 |
|---:|---:|---:|
| 19.999999 | 19 | 2.09 |
| 20.000000 | 20 | 2.09 |
| 24.999999 | 20 | 2.09 |
| 25.000000 | 25 | 2.06 |
| 59.999999 | 50 | 2.01 |
| 60.000000 | 60 | 2.00 |
| 119.999999 | 110 | 1.98 |
| 120.000000 | 120 | 1.98 |
| 120.000001 | 120 | 1.98 |
| finite >120 | 120 | 1.98 |

This is consistent with the current operational lookup convention.

## BT-02 — True infinite νeff — NOT REACHABLE UNDER VALID NORMAL INPUTS

The engine returns k = 1.96 only when νeff is true Infinity. Under current input validation, Ucert > 0 and kcert > 0, therefore u2 > 0 and its finite ν2 = 60 produces a non-zero Welch–Satterthwaite denominator. Consequently true Infinity is not normally reachable with valid user inputs. The branch is retained as a mathematical fallback but is not part of the normal validated operating domain while ν2 = 60 is used.

## BT-03 — Upward rounding to 0.001 % — PASS WITH CAUTION

The engine uses `Math.ceil((v - Number.EPSILON) * 1000) / 1000`. This correctly implements the intended operational upward rounding for ordinary MU magnitudes and avoids common binary floating-point overshoot at an exact decimal boundary. Expected behavior around 0.043 %:

| U | Upward result |
|---:|---:|
| 0.042999999 | 0.043 |
| 0.043000000 | 0.043 |
| 0.043000001 | 0.044 |

Caution: `Number.EPSILON` is an absolute machine-scale adjustment, not a general decimal arithmetic framework. Current MU magnitudes are suitable, but this function should remain covered by regression tests if the calculation range changes.

## BT-04 — CMC decision boundary — PASS

The engine applies `reportedMU = Urounded < CMC ? CMC : Urounded`. Therefore:

- Urounded < CMC → report CMC.
- Urounded = CMC → report that same value.
- Urounded > CMC → report Urounded.

No Excel value participates in this decision.

## BT-05 — Very small non-zero components — PASS BY CODE INSPECTION

All uncertainty components are retained as JavaScript Number values through uc, fourth-power terms, νeff and U. `fmt()` is used for display only. There is no deliberate 3- or 6-decimal intermediate rounding in `calculate()`. This satisfies the requirement that presentation precision must not become calculation precision for the normal operating range.

## BT-06 — Input rejection — PASS

`validate()` rejects: fewer than 2 readings; non-finite readings; CMC ≤ 0; non-finite Eref; Ucert ≤ 0; kcert ≤ 0; negative resolution; negative historical drift; negative temperature coefficient; and negative ΔT. These controls prevent the principal invalid-domain cases from entering the calculation engine.

## Independence check — PASS

`excelMU` is stored as a comparison input but is not referenced by `calculate()` when deriving the MU result. The independent engine derives the result solely from readings and uncertainty-component inputs. This is a critical validation requirement: changing the Excel comparison value cannot change the independently calculated MU.

## Remaining open technical issue

### ν2 = 60 — OPEN / METHOD JUSTIFICATION REQUIRED

The software currently fixes the calibration-certificate component degrees of freedom at 60 because that is the current operational model. The available controlled formula supports u2 = Ucert/kcert, but the independent technical/documentary basis for ν2 = 60 has not yet been established in this validation exercise.

This issue must not be closed merely because the Excel workbook also uses 60. It should be resolved against the approved uncertainty methodology and documented technical basis.

## Current conclusion

**Software implementation tests KAT-01 to KAT-05 and boundary/code-path checks BT-01 to BT-06: PASS for the currently defined calculation model.**

The engine is independent of the Excel comparison value and retains full calculation precision before reporting/display rounding.

**Current validation status: CONDITIONALLY VERIFIED.**

The remaining blocker to a FULLY VERIFIED technical status is the controlled-method justification and disposition of ν2 = 60. Regression against Excel remains separate evidence and is not used as proof that the mathematical model itself is correct.
