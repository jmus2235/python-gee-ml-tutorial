# Random forest classification of NEON AOP reflectance data with the Google Earth Engine Python API

This project is a NEON Data Skills tutorial. It shows how to train and evaluate a random forest classifier on NEON Airborne Observation Platform (AOP) surface reflectance data. All processing uses the Google Earth Engine (GEE) Python API (`earthengine-api`).

The tutorial is a Python port of an existing random forest classification written in GEE JavaScript.

## Status

Phase 1 complete (parity port). Phase 2 complete (VST-based training data, 2022 data). Phase 3 in progress (plot-level splitting implemented, ready for testing).

## Headline results

**Phase 1: Parity port** (CLBJ 2017, 10 classes, pre-made training data)

- Overall accuracy: 83.1%
- Kappa coefficient: 0.764
- Test sample: 65 points (inside airshed)
- Notebook: `scripts/clbj_rf_classification.ipynb`

**Phase 2: VST-based workflow** (CLBJ 2022, 6 classes, field-data-derived training points)

- OOB accuracy: 83.8%
- Test accuracy: 87.5% (stem-level split)
- Kappa coefficient: 0.846
- Training: 37 points (16 trees from VST + 30 non-tree manual selection)
- Test sample: 8 points
- Notebook: `scripts/clbj_rf_classification_v2.ipynb`

Phase 2 demonstrates the complete workflow from NEON field data download to classification.

**Phase 3: Plot-level splitting** (CLBJ 2022, 6 classes, spatial autocorrelation addressed)

- Plot-level train/test split to avoid inflated accuracy from spatial autocorrelation
- Expected test accuracy: 60-75% (measures true generalization to new locations)
- Same training data as Phase 2, but plots split independently
- Notebook: `scripts/clbj_rf_classification_v3.ipynb` (ready for testing)

Phase 3 addresses the highest priority methodological issue: spatial autocorrelation. Lower test accuracy is expected and correct - it measures whether the classifier can generalize to plots it has never seen, not just recognize spectrally similar neighbors.

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
