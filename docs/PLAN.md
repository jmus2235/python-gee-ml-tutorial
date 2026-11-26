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

## Phase 3 (notebook v3): decisions and results (2026-11-25)

Note: the notebook numbering (v1, v2, v3, v4) does not match the numbered list in "Phases" above. Notebook v1 is the parity port. Notebook v2 is the VST-based workflow. Notebook v3 is the cross-validation. Notebook v4 is planned.

**Data facts (checked 2026-11-25, NEON Data API, DP1.10098.001 at CLBJ).**

- `vst_apparentindividual` for 2022-04 to 2022-05 has 156 records, all with `eventID` = `vst_CLBJ_2021`, dated from 2022-04-06. They cover two plots: `CLBJ_036` (79) and `CLBJ_043` (77). Only `CLBJ_043` has georeferenced stems that pass the filters, so only one plot is usable.
- `vst_mappingandtagging` has coordinates for 830 stems in 48 plots, but the stems have no filter attributes in the April and May download.
- The download for 2022-04 to 2022-12 has 412 apparent individual records (345 individuals): 156 from `vst_CLBJ_2021` and 256 from `vst_CLBJ_2022` (dates to 2022-11-22). 65 stems in 5 plots pass the filters (`CLBJ_002`, `CLBJ_003`, `CLBJ_004`, `CLBJ_006`, `CLBJ_043`).
- Stems by species (plots): QUST 41 (5), JUVI 9 (2), ULCR 7 (2), QUMA3 6 (3), PRME 1 (1), ULAL 1 (1).

**Decisions.**

1. **VST bouts: 2022-04 to 2022-12.** This replaces decision 2 of Phase 2 (spring bouts only). Reason: the spring records give one usable plot, and plot-level validation needs several. Cost: some attributes (`plantStatus`, `canopyPosition`, `height`) are up to six months after the AOP flight.
2. **Filters (supersedes Phase 2 decision 4):** `plantStatus` contains "Live", `canopyPosition` in ["Full sun", "Partially shaded", "Mostly shaded"], `height >= 1`, valid stem distance and azimuth. The strict filter leaves too few stems. The relaxed filter keeps some understory stems that the sensor may not see. The most recent apparent individual record is used for each individual.
3. **Species rule:** keep species with at least 5 stems in at least 2 plots. This drops PRME and ULAL and keeps QUMA3.
4. **Non-tree classes (supersedes Phase 2 decision 5):** 10 manually selected points for each of GRSS, WATR, and SHADE. The threshold masks are in the notebook for display only. The classifier does not use them.
5. **Validation: leave-one-plot-out cross-validation** (5 folds) instead of one 80/20 split of plots. With 5 plots, one test plot makes the accuracy depend on the plot choice. Non-tree points have no plot. They are assigned to the folds at random, with equal numbers of each class in each fold. Their spatial autocorrelation remains.
6. **One class lookup table.** Tree species 0 to 3 (alphabetical), GRSS 7, WATR 8, SHADE 9.

**Status of the six problems of the JavaScript script.**

| # | Problem | Status in notebook v3 |
|---|---|---|
| 1 | No-data (-9999) not masked in the classification input | Not done. One of 93 reference points fell on a masked pixel and was dropped at sampling. |
| 2 | Points outside the airshed dropped without a message | Not examined in v3. |
| 3 | Classes too small to split | Done by the species rule (decision 3). |
| 4 | Stems of one plot in training and test sets | Done for tree classes (decision 5). Not done for non-tree classes. |
| 5 | Understory stems not visible from the air | Not solved. The filters were relaxed (decision 2). |
| 6 | Resubstitution accuracy reported as training accuracy | Done. The notebook reports the OOB error and the cross-validated accuracy. |

**Results.** 92 held-out points (63 tree stems, 29 non-tree). Overall accuracy 66.3%, kappa 0.517. Tree accuracy 52.4% (33 of 63). Predicting "QUST" for every tree gives 65.1%. Only QUST is predicted correctly. JUVI, QUMA3, and ULCR have 0% producer's and user's accuracy. Tree accuracy for each held-out plot: 14.3% (`CLBJ_004`, 7 stems) to 85.7% (`CLBJ_003`, 14 stems). Non-tree accuracy 96.6%. OOB accuracy 72.8%.

**Earlier claims that are withdrawn.** The Phase 2 notebook reported a test accuracy of 87.5% with a random split of stems. All 16 tree points were in one plot (`CLBJ_043`), so this value does not measure generalization to new locations. The first version of notebook v3 (commit `f2e83b6`) used a plot-level 80/20 split. With one tree plot, the split put all trees in the test set and none in the training set. The "60-75% expected accuracy" in the first documents of notebook v3 was a prediction without data and was wrong.

**Phase 4 (planned; notebook v4).** Test one change at a time with the same cross-validation. Compare the tree accuracy with the baseline of 65.1%. Candidate tests, in this order:

1. Mean reflectance in a small window around each stem (for example a 2 m buffer) instead of one pixel.
2. Class balancing: oversample the rare species in the training folds only.
3. Fewer bands.

Other open items: no-data masking in the classification input (problem 1), airshed handling (problem 2), hyperparameter tuning, feature importance, class probability maps, and removal of the unused threshold steps from the notebook.
