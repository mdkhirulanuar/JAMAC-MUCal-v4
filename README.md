# ⚡ MU Validate Pro v4.1

**Measurement Uncertainty Validator for Energy Meter Calibration**  
Manual calculation trace · Reference-standard correction · Historical drift · JAMAC Student-t calculation · Browser-based single-page application

## Purpose

MU Validate Pro v4.1 is the controlled development version derived from the original `JAMAC-MUCal` / MU Validate Pro v3.3 workflow. The original repository remains unchanged.

The application helps calibration personnel reproduce and review measurement uncertainty calculations transparently. It shows the arithmetic sequence from raw readings to corrected result, uncertainty components, combined standard uncertainty, effective degrees of freedom, Student-t coverage factor, expanded uncertainty, CMC comparison and Excel-reference comparison.

## v4.1 validated calculation changes

- Uses **Reference Standard Error from Calibration Certificate (%)** as a signed manual input.
- Calculates **Correction Factor (CF)** automatically: `CF = −Eref`.
- Calculates **Corrected Mean Error**: `x̄corrected = x̄ + CF`.
- Keeps calibration-certificate uncertainty separate from correction and historical drift.
- Uses **Historical Drift of Reference Standard Used (%)** as a manual laboratory-controlled input. The value must refer to the reference standard directly used in the current calibration.
- Uses `u2 = Ucert / kcert` for calibration-certificate uncertainty.
- Uses **v2 = 60** for U2 to reproduce the current approved JAMAC `JM-LR-037` calculation method.
- Uses Welch–Satterthwaite effective degrees of freedom.
- Uses the JAMAC Student's-t table at approximately 95% confidence with the **lower tabulated DoF** convention.
- For finite `veff ≥ 120`, the current JAMAC method uses the `120` row, therefore `k = 1.98`.
- U3, U4 and U5 use `v = ∞` in the current JM-LR-037 uncertainty budget.
- Retains upward rounding to 3 decimal places and the existing CMC reporting-floor workflow for compatibility with the laboratory calculation process.

## Calculation model

### Deterministic correction

`CF = −Eref`

`Corrected reading = Measured reading + CF`

`Corrected mean error = x̄ + CF`

A constant correction shifts all readings by the same amount and therefore does not change standard deviation or repeatability.

### Standard uncertainty components

| Component | Source | Model | Degree of freedom used |
|---|---|---|---|
| U1 | Repeatability | `u1 = s / √n` | `v1 = n−1` |
| U2 | Calibration certificate | `u2 = Ucert / kcert` | `v2 = 60` |
| U3 | Reference-standard resolution | `u3 = (R/2) / √3` | `∞` |
| U4 | Historical drift of reference standard used | `u4 = D / √3` | `∞` |
| U5 | Temperature effect | `u5 = (β × ΔT) / √3` | `∞` |

Combined standard uncertainty:

`uc = √(u1² + u2² + u3² + u4² + u5²)`

Effective degrees of freedom:

`veff = uc⁴ / [(u1⁴/v1) + (u2⁴/60)]`

U3, U4 and U5 contribute zero to the Welch–Satterthwaite denominator because their degree of freedom is treated as infinity in the current laboratory budget.

### Coverage factor

The approved JAMAC approach is:

`veff → Student's-t table → k95`

The software reproduces the table used in the current `JM-LR-037` workbook:

| DoF | k | DoF | k | DoF | k |
|---:|---:|---:|---:|---:|---:|
| 1 | 12.71 | 11 | 2.20 | 25 | 2.06 |
| 2 | 4.30 | 12 | 2.18 | 30 | 2.04 |
| 3 | 3.18 | 13 | 2.16 | 35 | 2.03 |
| 4 | 2.78 | 14 | 2.14 | 40 | 2.02 |
| 5 | 2.57 | 15 | 2.13 | 45 | 2.01 |
| 6 | 2.45 | 16 | 2.12 | 50 | 2.01 |
| 7 | 2.36 | 17 | 2.11 | 60 | 2.00 |
| 8 | 2.31 | 18 | 2.10 | 70 | 1.99 |
| 9 | 2.26 | 19 | 2.09 | 80 | 1.99 |
| 10 | 2.23 | 20 | 2.09 | 90 | 1.99 |
| 100 | 1.98 | 110 | 1.98 | 120 | 1.98 |
| ∞ | 1.96 |  |  |  |  |

For non-tabulated finite `veff`, the next lower tabulated DoF is used. Example: `veff = 38.35 → DoF 35 → k = 2.03`.

Expanded uncertainty:

`U = k95 × uc`

The calculated U is rounded upward to 3 decimal places for compatibility with the current laboratory workbook.

## Important metrology distinctions

1. **Reference Standard Error** — signed current value from the applicable calibration certificate point.
2. **Correction Factor** — deterministic correction applied to the measurement result, calculated as the negative of the certificate error.
3. **Historical Drift** — laboratory-controlled historical stability/drift value for the reference standard directly used in the current calibration.
4. **Certificate reporting k = 2 statement** — a reporting statement used by the laboratory for approximately 95% coverage; it is separate from the Student-t `k95` used in the calculation engine.

## Validation status

The v4.1 engine was regression-checked against the operational workbook `JM-LR-037 - 3PTB08 MU JTSO0260039 E650.xlsx` for 15 +P test points. Calculated `uc`, `veff`, Student-t `k` and final rounded MU reproduced the Excel results for all 15 tested points.

See `VALIDATION.md` for the verification record.

## Controlled-use note

The software reproduces the current JAMAC calculation method and can be used as a calculation/validation aid. For accredited operational use, retain version control, approved test evidence, representative regression cases, change control, and laboratory authorization in accordance with the laboratory management system.

`v2 = 60` is documented here as a **laboratory-controlled calculation convention** reproduced from the approved/current `JM-LR-037` workbook. It is not stated as a general ISO/IEC 17025 requirement.

## Files

```text
JAMAC-MUCal-v4/
├── index.html
├── style.css
├── script.js
├── README.md
├── VALIDATION.md
└── LICENSE
```

## Technology

Pure HTML5, CSS3 and JavaScript. No framework or server is required. Project data is stored in browser LocalStorage.

## License

MIT License. See `LICENSE`.

## Author

Mohd Khirul Anuar Bin Saadon  
JAMAC METERING SDN BHD