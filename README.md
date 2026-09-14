# ⚡ MU Validate Pro v4.0

**Measurement Uncertainty Validator for Energy Meter Calibration**  
Manual calculation trace · Reference-standard correction · Historical drift · Browser-based single-page application

## Purpose

MU Validate Pro v4.0 is an upgraded validation tool derived from the original `JAMAC-MUCal` / MU Validate Pro v3.3 workflow. The original repository is retained unchanged; this repository is the controlled development version for v4.

The application is intended to help calibration personnel reproduce and review MU calculations transparently. It shows the arithmetic sequence from raw readings to corrected result, uncertainty components, combined standard uncertainty, effective degrees of freedom, coverage factor, expanded uncertainty, CMC comparison and Excel-reference comparison.

## v4.0 changes

- Adds **Reference Standard Error from Calibration Certificate (%)** as a signed manual input.
- Calculates **Correction Factor (CF)** automatically: `CF = −Eref`.
- Calculates **Corrected Mean Error**: `x̄corrected = x̄ + CF`.
- Shows corrected value for every individual reading.
- Renames the old error-drift concept to **Historical Drift of Reference Standard (%)**.
- Historical drift remains a **manual non-negative laboratory input**.
- Keeps calibration-certificate uncertainty separate from correction and drift.
- Displays a complete manual calculation trail when **Calculate & Validate** is pressed.
- Removes the previous hard-coded `v = 60` assumption for calibration-certificate Type B uncertainty. In v4, Type B components default to infinite degrees of freedom unless the laboratory has separately justified finite DoF information.
- Uses a two-sided 95% Student-t coverage factor based on effective degrees of freedom.
- Retains the v3 CMC reporting-floor workflow but labels it as a laboratory/accreditation reporting control that must be verified against the applicable scope/policy.

## Calculation model

### Deterministic correction

`CF = −Eref`

`Corrected reading = Measured reading + CF`

`Corrected mean error = x̄ + CF`

A constant correction shifts all readings by the same amount and therefore does not change standard deviation or repeatability.

### Standard uncertainty components

| Component | Source | Model |
|---|---|---|
| U1 | Repeatability | `u1 = s / √n` |
| U2 | Calibration certificate | `u2 = Ucert / kcert` |
| U3 | Reference-standard resolution | `u3 = (R/2) / √3` |
| U4 | Historical reference-standard drift | `u4 = D / √3` |
| U5 | Temperature effect | `u5 = (β × ΔT) / √3` |

Combined standard uncertainty:

`uc = √(u1² + u2² + u3² + u4² + u5²)`

Effective degrees of freedom:

`veff = uc⁴ / Σ(ui⁴/vi)`

In the current v4 implementation, U1 uses `v1 = n−1` and Type B components use `v = ∞` by default.

Expanded uncertainty:

`U = k95 × uc`

The displayed expanded uncertainty is rounded upward to 3 decimal places to preserve the existing v3 validation workflow.

## Important metrology distinction

The application intentionally separates three different concepts:

1. **Reference Standard Error** — signed value from the applicable calibration certificate point.
2. **Correction Factor** — deterministic correction applied to the measured result, automatically calculated as the negative of the certificate error.
3. **Historical Drift** — laboratory-established stability/drift magnitude from historical control data and entered manually as an uncertainty contribution.

These values must not be treated as interchangeable.

## Controlled-use note

This tool supports calculation review and software validation evidence. Before production or accredited use, the laboratory should verify:

- the measurement model and all uncertainty contributors;
- distribution assumptions and sensitivity coefficients;
- applicability of the historical-drift model;
- CMC/reporting rules required by the applicable accreditation body/policy;
- rounding rules;
- representative test cases, boundary cases and regression results;
- software version identification and change control.

## Files

```text
JAMAC-MUCal-v4/
├── index.html
├── style.css
├── script.js
├── README.md
└── LICENSE
```

## Technology

Pure HTML5, CSS3 and JavaScript. No framework or server is required. Project data is stored in browser LocalStorage.

## License

MIT License. See `LICENSE`.

## Author

Mohd Khirul Anuar Bin Saadon  
JAMAC METERING SDN BHD
