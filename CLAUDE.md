# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication norm

Working norm: use ASD-STE100 for replies and for skill output. Never drop or soften a technical issue to keep the text simple. If no simple word exists, use the exact technical term.

Spell out each acronym the first time it occurs in a chat, for example "Google Earth Engine (GEE)".

The full rules are in [.claude/skills/ste100-communication/SKILL.md](.claude/skills/ste100-communication/SKILL.md). Apply them to every reply.

## Project purpose

This project is a NEON Data Skills tutorial. It shows how to train a random forest classifier on NEON AOP (Airborne Observation Platform) reflectance data with the Google Earth Engine (GEE) Python API.

The reference is the user's GEE JavaScript script [scripts/CLBJ_Random_Forest_modified_4.js](scripts/CLBJ_Random_Forest_modified_4.js) (CLBJ site, 2017, 10 classes, `smileRandomForest(100)`). Decisions, phases, data facts, and known problems of the JavaScript method are in [docs/PLAN.md](docs/PLAN.md). Read it before you work on the port.

The tutorial is one Jupyter notebook with `geemap` maps. Write tutorial text in the normal NEON Data Skills style, not ASD-STE100.

## Folder structure

- `docs/` — documents. Daily handoffs go in `docs/handoffs/`.
- `scripts/` — Python, R, and JavaScript scripts.
- `data/` — input data.
- `output/` — output results (figures, tables, exported files).

`README.md` and `CLAUDE.md` stay in the repository root.

Git does not track `output/` or `data/` (see [.gitignore](.gitignore)). To track an essential input file (for example, a small training-polygon file that the tutorial needs), add a `!data/<file>` line to `.gitignore`. Tell the user when you do this.

## Working rules

- **Models.** Use Opus (latest version) for planning and Sonnet (latest version) for coding. The main session uses the `opusplan` alias in `.claude/settings.local.json`: Opus in plan mode, Sonnet in other modes. When you start a subagent, set `model: "opus"` for planning work and `model: "sonnet"` for coding work.
- **Who runs the scripts.** You can run smoke tests: imports, syntax checks, `ee.Initialize`, and small tests on a small area or a small sample. Do not run full analysis scripts. Give the user the command (from `docs/RUN_CODE.md`), and the user runs it locally. This keeps token use low.
- **End of each day.** Write the handoff for the day. Update README.md and `docs/RUN_CODE.md` if necessary. Then commit and push to GitHub.

## Project documents: keep them current

- [README.md](README.md) — project summary and headline results. When new results replace old results, replace the old results. Keep an old result only if it is a necessary record or it completes an argument.
- [docs/RUN_CODE.md](docs/RUN_CODE.md) — how to run each script: environment, inputs, command, outputs. Do not put run results here, except short examples when they are necessary. Update it when you add or change a script.
- `docs/handoffs/HANDOFF-YYYY-MM-DD.md` — one file for each work day. At the end of the day, write the progress, results, and to-do items. These files are the project history. Do not rewrite the handoffs of earlier days.
- Make other documents in `docs/` if they are useful. Add each one to the document list in README.md.

## Environment

- Conda environment: `neon-gee-rf`, defined in [environment.yml](environment.yml) (conda-forge, Python 3.11, `earthengine-api` 1.x, `geemap`).
- Create: `conda env create -f environment.yml`. Update after changes to the file: `conda env update -f environment.yml --prune`.
- Run a command in the environment from the Bash tool: `conda run -n neon-gee-rf python <script>`.
- `earthengine-api` 1.x needs a Cloud project. The user's project: `ee.Initialize(project='neon-sandbox-dataflow-ee')` (noncommercial, Contributor tier: 1,000 EECU-hours per month = 3,600,000 EECU-seconds). Keep the project ID in one setting in each script, so that tutorial readers can change it.
- `neon-nonprod-earthengine` is also available (noncommercial, Contributor tier; connection test passed 2026-11-20). It has the same tier as the sandbox project, so it is not a fallback for quota.
- A commercial NEON production project is available. It has no monthly EECU quota ceiling, but usage is billed. Use it only if the sandbox project quota stops the work, and ask the user first.
- Design the tutorial to fit a noncommercial Earth Engine quota. Most tutorial readers will use a noncommercial project.
- Authentication: `earthengine authenticate --auth_mode=localhost`. It opens a browser, so the user must run it. The default `gcloud` mode fails on this computer with "This app is blocked".
- NEON AOP reflectance in GEE: `projects/neon-prod-earthengine/assets/HSI_REFL/001` and `.../HSI_REFL/002` (both `IMAGE_COLLECTION`).
- NEON API token: read it only from the environment variable `NEON_TOKEN`. Never print it, write it to a file, put it in a notebook output, or commit it. To check that it exists, test only that the variable is set.
- Do not use the old `ee` conda environment. It has `earthengine-api` 0.1.345, which is out of date.
