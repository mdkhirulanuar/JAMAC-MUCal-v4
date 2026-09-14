# MU Validate Pro v4.1 — Regression Validation Record

## Objective

Verify that the v4.1 calculation engine reproduces the current JAMAC measurement uncertainty method implemented in `JM-LR-037` for energy meter calibration.

## Reference workbook

`JM-LR-037 - 3PTB08 MU JTSO0260039 E650.xlsx`

Validation scope: 15 populated `+P` test points.

## Method confirmed from the workbook

- `U1 = s / √n`, with `v1 = n − 1`.
- `U2 = Ucert / kcert`, with `v2 = 60`.
- U3 Resolution: rectangular, `v = ∞`.
- U4 Reference-standard historical drift: rectangular, `v = ∞`.
- U5 Temperature coefficient: rectangular, `v = ∞`.
- `uc = √Σui²`.
- `veff = uc⁴ / [(u1⁴/v1) + (u2⁴/60)]`.
- Student's-t factor is selected using the next lower tabulated DoF.
- Finite `veff ≥ 120` uses the 120 row, `k = 1.98`.
- `Ue = uc × k`.
- Final MU is rounded upward to 3 decimal places in the operational workbook.

## Regression results

| Test point | Excel veff | Lookup DoF | Excel k | v4.1 k | Excel MU (%) | v4.1 MU (%) | Result |
|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | 113.7233 | 110 | 1.98 | 1.98 | 0.047 | 0.047 | PASS |
| 2 | 110.7328 | 110 | 1.98 | 1.98 | 0.047 | 0.047 | PASS |
| 3 | 38.3512 | 35 | 2.03 | 2.03 | 0.065 | 0.065 | PASS |
| 4 | 109.7041 | 100 | 1.98 | 1.98 | 0.047 | 0.047 | PASS |
| 5 | 112.0629 | 110 | 1.98 | 1.98 | 0.047 | 0.047 | PASS |
| 6 | 32.6788 | 30 | 2.04 | 2.04 | 0.068 | 0.068 | PASS |
| 7 | 86.2151 | 80 | 1.99 | 1.99 | 0.053 | 0.053 | PASS |
| 8 | 105.5173 | 100 | 1.98 | 1.98 | 0.052 | 0.052 | PASS |
| 9 | 111.5953 | 110 | 1.98 | 1.98 | 0.047 | 0.047 | PASS |
| 10 | 137.3691 | 120 | 1.98 | 1.98 | 0.044 | 0.044 | PASS |
| 11 | 128.8025 | 120 | 1.98 | 1.98 | 0.045 | 0.045 | PASS |
| 12 | 131.6522 | 120 | 1.98 | 1.98 | 0.041 | 0.041 | PASS |
| 13 | 140.0463 | 120 | 1.98 | 1.98 | 0.043 | 0.043 | PASS |
| 14 | 134.4430 | 120 | 1.98 | 1.98 | 0.042 | 0.042 | PASS |
| 15 | 140.2659 | 120 | 1.98 | 1.98 | 0.043 | 0.043 | PASS |

### Numerical check

- Maximum absolute difference in calculated `veff` across the 15 cases: approximately `7.1 × 10⁻14`, attributable to floating-point representation.
- Student-t `k`: 15/15 exact matches to the workbook.
- Final rounded MU: 15/15 exact matches to the workbook.

## Historical drift control

The application does not derive historical drift from certificate history. The input remains manual and must be taken from the laboratory's controlled historical calibration data for the reference standard directly used in the current calibration.

## Conclusion

**PASS — v4.1 calculation engine reproduces the tested operational JM-LR-037 results for the validated +P cases.**

This regression record supports software verification. Laboratory authorization, version/change control and retention of approved validation evidence remain part of the controlled-use process.