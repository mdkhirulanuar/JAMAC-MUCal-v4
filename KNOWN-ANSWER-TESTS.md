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

## KAT-01 — Baseline known-answer case

Inputs: readings = [-0.0349, -0.0374, -0.0374, -0.0349, -0.0349, -0.0324, -0.0349, -0.0349, -0.0324, -0.0374] %, Eref = -0.0200 %, Ucert = 0.0400 %, kcert = 2, R = 0.0001 %, D = 0.0120 %, β = 0.0020 %/°C, ΔT = 2 °C, CMC = 0.040 %.

Expected independent results:

| Parameter | Expected |
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

Expected status: PASS if software agrees within numerical/display tolerance.

## KAT-02 — Positive reference error / negative correction factor

Use KAT-01 inputs except Eref = +0.0200 %. Expected CF = -0.020000 % and corrected mean = -0.055150 %. Because the same additive CF is applied to every reading and to the mean, s, u1, u2–u5, uc, νeff, k95 and U must remain identical to KAT-01.

This test detects incorrect correction-factor sign and incorrect use of CF inside repeatability.

## KAT-03 — Zero reference correction

Use KAT-01 inputs except Eref = 0. Expected CF = 0 and corrected mean = raw mean = -0.035150 %. All uncertainty results must remain identical to KAT-01.

## KAT-04 — Zero repeatability

Inputs: readings = [-0.0100, -0.0100] %, with all other uncertainty inputs as KAT-01.

Expected: s = 0; u1 = 0; uc = 0.021291645 %; νeff = 77.06695000; lookup DoF = 70; k95 = 1.99; U = 0.042370374 %; upward-rounded U = 0.043 %; reported MU = 0.043 %.

This test verifies that the engine handles u1 = 0 without division/NaN failure in Welch–Satterthwaite.

## KAT-05 — Minimum permitted n = 2 with non-zero repeatability

Inputs: readings = [-0.0100, +0.0100] %, with all other uncertainty inputs as KAT-01.

Expected: mean = 0; s = 0.014142136 %; u1 = 0.010000000 %; ν1 = 1; uc = 0.023523056 %; νeff = 24.17200263; lookup DoF = 20; k95 = 2.09; U = 0.049163187 %; upward-rounded/report MU = 0.050 %.

This challenges the n−1 denominator, minimum-reading validation and low-DoF Student-t selection.

## Boundary tests required before release status can be upgraded

1. Student-t exact-row boundaries (e.g. νeff exactly 20, 25, 30, 60, 120) and values immediately below/above each boundary.
2. Finite νeff > 120 must use the current operational row 120 (k = 1.98); true νeff = ∞ must be separately challenged because the current engine returns k = 1.96.
3. Upward-rounding boundaries immediately below, exactly at and immediately above a 0.001 % increment.
4. CMC decision boundary where Urounded < CMC, = CMC and > CMC.
5. Very small but non-zero uncertainty components to confirm no premature rounding affects downstream calculations.
6. Input rejection tests: n < 2, non-numeric readings, CMC ≤ 0, Ucert ≤ 0, kcert ≤ 0, negative R/D/β/ΔT.

## Current conclusion

KAT-01 through KAT-05 establish independent numerical reference cases for the principal calculation path and correction-factor invariance. They are not evidence that ν2 = 60 is technically justified; that assumption remains an open controlled-method issue.

**Current engine status: CONDITIONALLY VERIFIED — known-answer reference set established; boundary execution and ν2 technical justification remain open before FULLY VERIFIED status.**
