# Random forest classification of NEON AOP reflectance data with the Google Earth Engine Python API

This project is a NEON Data Skills tutorial. It shows how to train and evaluate a random forest classifier on NEON Airborne Observation Platform (AOP) surface reflectance data. All processing uses the Google Earth Engine (GEE) Python API (`earthengine-api`).

The tutorial is a Python port of an existing random forest classification written in GEE JavaScript.

## Status

Phase 1 complete (parity port). Phase 2 complete (VST-based training data, 2022 data). Phase 3 complete (leave-one-plot-out cross-validation). The Phase 3 result is negative: the classifier does not predict three of the four tree species at new plots. Phase 4 (step-wise tests to improve it) is planned.

## Headline results

**Phase 1: Parity port** (CLBJ 2017, 10 classes, pre-made training data)

- Overall accuracy: 83.1%
- Kappa coefficient: 0.764
- Test sample: 65 points (inside airshed)
- Notebook: `scripts/clbj_rf_classification.ipynb`

**Phase 2: VST-based workflow** (CLBJ 2022, 6 classes, field-data-derived training points)

- OOB accuracy: 83.8%
- Test accuracy: 87.5% (random split of stems)
- Kappa coefficient: 0.846
- Reference points: 46 (16 trees from VST + 30 non-tree manual selection). Training: 37 points. Test: 8 points.
- Notebook: `scripts/clbj_rf_classification_v2.ipynb`

All 16 tree points of Phase 2 are in one plot (`CLBJ_043`). The test accuracy therefore compares stems of one plot with other stems of the same plot. It does not measure how well the classifier works at new locations.

**Phase 3: Leave-one-plot-out cross-validation** (CLBJ 2022, 7 classes, VST data from 2022-04 to 2022-12)

- Reference data: 63 tree stems in 5 plots (JUVI 9, QUMA3 6, QUST 41, ULCR 7) + 30 non-tree points. 92 of 93 points were sampled (one point fell on a no-data pixel).
- Overall accuracy: 66.3% (61 of 92 held-out points), kappa 0.517
- Tree accuracy: 52.4% (33 of 63 stems). A classifier that labels every tree "QUST" gets 65.1%.
- Only QUST is predicted correctly (producer's accuracy 80.5%, user's accuracy 61.1%). JUVI, QUMA3, and ULCR have 0% producer's and user's accuracy.
- Tree accuracy for each held-out plot: 14.3% to 85.7% (`CLBJ_004`: 1 of 7 stems; `CLBJ_003`: 12 of 14 stems).
- Non-tree accuracy: 96.6% (28 of 29 points). The non-tree points are not separated by plot, so this value is probably too high.
- OOB accuracy: 72.8%, higher than the cross-validated accuracy, because the OOB estimate ignores the plots.
- Notebook: `scripts/clbj_rf_classification_v3.ipynb`

The overall accuracy looks acceptable only because the three non-tree classes are easy to separate. Probable causes of the poor tree result (not yet tested): 382 bands for 63 stems, one 1 m pixel for each stem, and the dominance of QUST. Phase 4 will test these causes one at a time.

## Repository layout

| Folder | Content |
|---|---|
| `docs/` | Documents and daily handoffs (`docs/handoffs/`) |
| `scripts/` | Python, R, and JavaScript scripts |
| `data/` | Input data |
| `output/` | Output results |

## Documents

- [docs/PLAN.md](docs/PLAN.md) — decisions, phases, data facts, and known problems.
- [docs/RUN_CODE.md](docs/RUN_CODE.md) — environment setup and how to run each script.
- [docs/handoffs/](docs/handoffs/) — daily progress, results, and to-do items.
