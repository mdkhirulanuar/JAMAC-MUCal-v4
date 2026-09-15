# ⚡ MU Validate Pro v4.2

**Independent Measurement Uncertainty Verification & Validation Tool for Energy Meter Calibration**

Manual calculation trail · Reference-standard correction · Historical drift · Student-t coverage factor · Independent Excel MU checking · Portable project save/load

## Purpose

MU Validate Pro v4.2 is independently developed software intended for **internal verification and validation of JAMAC Metering measurement uncertainty (MU) calculations**.

The application uses entered source data to independently recalculate the MU calculation sequence. Its purpose is to provide a second calculation path for checking the correctness of the applicable JAMAC Metering MU calculation worksheet, including intermediate and final results.

The software calculation is independent of the Excel calculation results. Excel results are reference/comparison values only and do not drive the software calculation engine.

## Owner & Developer

**Mohd Khirul Anuar Bin Saadon**

Copyright © 2026 Mohd Khirul Anuar Bin Saadon. All Rights Reserved.

Internal use by JAMAC Metering does not transfer ownership of the software.

## Calculation model

### Deterministic correction

`CF = −Eref`

`Corrected reading = Measured reading + CF`

`Corrected mean error = x̄ + CF`

A constant correction shifts all readings by the same amount and therefore does not change standard deviation or repeatability.

### Standard uncertainty components

| Component | Source | Model | Degree of freedom used |
|---|---|---|---|
| u1 | Repeatability | `u1 = s / √n` | `ν1 = n−1` |
| u2 | Calibration certificate | `u2 = Ucert / kcert` | `ν2 = 60` |
| u3 | Reference-standard resolution | `u3 = (R/2) / √3` | `∞` |
| u4 | Historical drift of reference standard used | `u4 = D / √3` | `∞` |
| u5 | Temperature effect | `u5 = (β × ΔT) / √3` | `∞` |

Combined standard uncertainty:

`uc = √(u1² + u2² + u3² + u4² + u5²)`

Effective degrees of freedom:

`νeff = uc⁴ / [(u1⁴/ν1) + (u2⁴/60)]`

The calculated `νeff` is mapped to the controlled Student-t table to obtain `k95`, followed by:

`U = k95 × uc`

The calculated expanded uncertainty is rounded upward to 3 decimal places for compatibility with the current laboratory workbook, followed by the CMC reporting check.

## Manual calculation trail

The application provides a 15-step calculation trail covering raw measured errors, mean, correction factor, corrected readings, deviations, sample standard deviation, u1–u5, combined standard uncertainty, effective degrees of freedom, coverage factor, expanded uncertainty and final CMC reporting check.

## Validation status

The calculation engine has been regression-checked against the operational JAMAC Metering workbook using representative +P test points. The software is intended to act as an **independent checker**, so regression agreement should be supplemented by controlled formula review and representative verification evidence rather than being treated alone as proof that the source Excel workbook is correct.

See `VALIDATION.md` for the available verification record.

## Controlled-use note

For laboratory operational use, retain software version identification, representative validation evidence, change control, input/output records and appropriate laboratory authorization in accordance with the applicable management system.

The use of `ν2 = 60` is treated as a laboratory-controlled calculation convention reproduced from the current operational calculation method; it is not presented as a general ISO/IEC 17025 requirement.

## Technology

Pure HTML5, CSS3 and JavaScript. No framework or server is required. Browser LocalStorage is used for local project storage, with portable JSON save/load support.

## License

**Proprietary software. All Rights Reserved.**

See `LICENSE` for the applicable internal-use terms.
