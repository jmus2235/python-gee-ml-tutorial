# Plan: Python port of the CLBJ random forest classification

Reference script: [scripts/CLBJ_Random_Forest_modified_4.js](../scripts/CLBJ_Random_Forest_modified_4.js) (GEE Code Editor, JavaScript).

## Decisions (2026-11-20)

| Topic | Decision |
|---|---|
| Format | One Jupyter notebook with `geemap` maps, in `scripts/` |
| Tutorial text | NEON Data Skills style (ASD-STE100 applies only to replies to the user) |
| Data, phase 1 | Legacy `projects/neon/` assets, same as the JavaScript script |
| Data, phase 2 | BRDF-corrected reflectance `projects/neon-prod-earthengine/assets/HSI_REFL/002` (CLBJ: 2022–2025) |
| Method | Faithful port first, then a separate, labeled corrections section |

The JavaScript script is an example. The goal is to improve on it, not only to copy it. The parity port (phase 1) is the verified start point for the improvements.

## TBD (for later discussion)

- **Multi-site tutorial (macrosystems approach).** A tutorial that analyzes AOP data from more than one NEON site. Scope, sites, and method are not decided.

## Phases

1. **Parity port.** Port the JavaScript 1:1 with the legacy assets and the same seeds. Compare the overall accuracy, kappa, and confusion matrix with the JavaScript console output.
2. **Data update.** Change to `HSI_REFL/002` and `CHM/001` for the same year, and to the `neon-prod-earthengine` feature collections. Apply the scale factor and a no-data mask.
3. **Method corrections.** One labeled section for each correction (see "Problems in the JavaScript script").
4. **Compute measurement.** Measure the EECU use of the classified-image export (`batchEecuUsageSeconds`).

## Data facts (checked 2026-11-20)

- Training points: `projects/neon/AOP_NEON_Plots/CLBJ_veg_2017_filtered`. 374 points, 44 plots. 348 points are inside the airshed.
  - Counts (all / in airshed): CELA 21/19, JUVI 45/43, PRME 3/3, QUMA3 43/43, QUST 206/184, ULAL 6/6, ULCR 20/20, GRSS 10/10, WATR 10/10, SHADE 10/10.
  - `taxonIDnum`: CELA 0, JUVI 1, PRME 2, QUMA3 3, QUST 4, ULAL 5, ULCR 6, GRSS 7, WATR 8, SHADE 9.
- Legacy 2017 reflectance: `band001`–`band426`, float, percent reflectance (0–100).
- `HSI_REFL/001/2017_CLBJ_2`: `B001`–`B426` + 16 QA bands, int16. Property `SCALE_FACTOR` = 10000. The values are 100 × the legacy values.
- `HSI_REFL/002` at CLBJ: `2022_CLBJ_6`, `2023_CLBJ_7`, `2024_CLBJ_8`, `2025_CLBJ_9`. Property name is `SCALING_FACTOR` (not `SCALE_FACTOR`). `2025_CLBJ_9`: sensor NIS2, `PROVISIONAL`. The 2017 data used sensor NIS1.
- `CHM/001` at CLBJ: 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025. Band name `CHM`.
- New feature collections: `Feature_Collections/90percent_footprint` (airsheds, all sites), `Feature_Collections/terrestrialSamplingBoundaries` (TOS boundaries).

## Problems in the JavaScript script (for phase 3)

1. The classification input is not masked for no-data (-9999). Only the display layer is masked.
2. 26 of 374 points are outside the airshed. `sampleRegions` drops them without a message. The printed training and test counts are larger than the counts that are used.
3. PRME (3 points) and ULAL (6 points) are too small for an 80/20 split. The PRME test set has 0 or 1 points.
4. The random split puts stems from the same plot in the training and test sets. The test accuracy is probably too high.
5. Stem locations of understory trees are not visible from the air. `canopyPosition` and `height` are available as filters.
6. "Train Accuracy" is a resubstitution accuracy. Use the out-of-bag error from `classifier.explain()`.

## Open issue for phase 2: temporal mismatch

The training points are from 2017, but `HSI_REFL/002` starts in 2022 (5 or more years later).

- Trees can die, fall, or grow in that time.
- The GRSS, WATR, and SHADE points were selected from the 2017 reflectance image. Shade positions change with the sun angle at flight time. Water extent changes with water level.

**Decision (2026-11-20): option (b).** The tutorial will make the training feature collection from vegetation structure (VST) field data (DP1.10098.001), for site-years that match the `HSI_REFL/002` images (2022–2025). Making the feature collection is part of the tutorial.

VST availability at CLBJ (NEON Data API, checked 2026-11-20):

- RELEASE-2026: 2022-04, 2022-05, 2022-11, 2023-11, 2024-11, 2024-12.
- PROVISIONAL: 2025-01, 2025-02, 2025-03, 2025-11.
- AOP flights at CLBJ are in late spring (2017: 1 May; 2025: 31 May).

Phase 2 decisions (2026-11-23):

1. **Year:** 2022 (`2022_CLBJ_6` from `HSI_REFL/002`). Spring VST bouts (2022-04, 2022-05) align with the late-spring AOP flight. Same NIS1 sensor as 2017. CHM is RELEASED (2022). VST is RELEASE-2026.
2. **VST bouts:** 2022-04 and 2022-05 (spring data, closest to flight). Fall bout (2022-11) excluded due to temporal mismatch.
3. **Stem positions:** geoNEON formula implemented in Python. Query NEON location API for each `(plotID, pointID)` pair to get UTM easting/northing, apply formula: `adjEasting = pointEasting + stemDistance * sin(stemAzimuth * pi/180)`, `adjNorthing = pointNorthing + stemDistance * cos(stemAzimuth * pi/180)`. Convert UTM Zone 14N (EPSG:32614) to WGS84 lon/lat with `pyproj`.
4. **VST filtering:** `plantStatus` contains "Live", `canopyPosition` in ["Full sun", "Open grown"], `height >= 3`, valid `stemDistance`/`stemAzimuth`. Addresses Phase 1 problem #5 (understory stems not visible from air).
5. **Non-tree classes (GRSS, WATR, SHADE):** Threshold-based generation from NDVI, brightness, and CHM. GRSS: `CHM < 1.5` AND `NDVI > 0.3`. WATR: `NDVI < 0.0` AND `brightness < 0.05`. SHADE: `brightness < 0.02` AND `CHM > 3`. Sample ~10–15 points per class with `stratifiedSample`.
6. **Environment:** `neonutilities` added to `environment.yml` (pip install). Brings `pyproj`, `requests`, `duckdb`, `pyarrow`, `h5py`.
7. **NEON_TOKEN:** Read from environment variable `NEON_TOKEN` (`os.environ.get('NEON_TOKEN')`), passed to `neonutilities`. Never printed or written to notebook output. NEON requires tokens for all downloads.
8. **New notebook:** `scripts/clbj_rf_classification_v2.ipynb` (64 cells). Phase 1 notebook remains as verified parity reference.
9. **OOB error:** Phase 2 reports out-of-bag error from `classifier.explain()` (fixes Phase 1 problem #6).
