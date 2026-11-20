# Random forest classification of NEON AOP reflectance data with the Google Earth Engine Python API

This project is a NEON Data Skills tutorial. It shows how to train and evaluate a random forest classifier on NEON Airborne Observation Platform (AOP) surface reflectance data. All processing uses the Google Earth Engine (GEE) Python API (`earthengine-api`).

The tutorial is a Python port of an existing random forest classification written in GEE JavaScript.

## Status

Phase 1 complete. The Python notebook reproduces the JavaScript script results exactly.

## Headline results

**Phase 1: Parity port** (CLBJ 2017, 10 classes, 100-tree random forest)

- Overall accuracy: 83.1%
- Kappa coefficient: 0.764
- Test sample: 65 points (inside airshed)

The Python port matches the JavaScript reference script on all metrics. The known method problems (listed in the notebook) remain for the corrections phase.

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
