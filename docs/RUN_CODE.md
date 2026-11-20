# How to run the code

## 1. Requirements

- Anaconda or Miniconda.
- A Google account with access to Google Earth Engine (GEE).
- A Google Cloud project that is registered for Earth Engine. Find the project ID in the GEE Code Editor (profile icon, top right).

## 2. Make the conda environment

Run these commands from the repository root, in Anaconda Prompt or another terminal with conda:

```bash
conda env create -f environment.yml
conda activate neon-gee-rf
```

If `environment.yml` changes, update the environment:

```bash
conda env update -f environment.yml --prune
```

## 3. Authenticate with Earth Engine

Do this one time on each computer. The command opens a browser. Sign in with the Google account that has Earth Engine access.

```bash
conda activate neon-gee-rf
earthengine authenticate --auth_mode=localhost
```

Use `--auth_mode=localhost`. If the Google Cloud SDK (`gcloud`) is installed, the default mode is `gcloud`, and Google can block it with "This app is blocked". If port 8085 is in use, use `--auth_mode=localhost:0`. Do not use `--auth_mode=notebook`, because its credentials expire after 7 days.

The command writes the credentials to `~/.config/earthengine/credentials`. All Earth Engine Python installations on the computer use this one file, in all conda environments. If valid credentials already exist, the command does nothing. To replace valid credentials (for example, to change the Google account), add `--force`.

## 4. Test the connection

Replace `<project-id>` with your Cloud project ID:

```bash
python -c "import ee; ee.Initialize(project='<project-id>'); print(ee.String('Earth Engine OK').getInfo())"
```

The command must print `Earth Engine OK`.

## 5. Use the environment

**Option A: VS Code**

1. Open a `.ipynb` notebook or a `.py` file.
2. Select the kernel or interpreter `neon-gee-rf`.

**Option B: JupyterLab**

1. Activate the environment and start JupyterLab:
   ```bash
   conda activate neon-gee-rf
   jupyter lab
   ```
2. A browser window opens. Navigate to the notebook file and open it.
3. The kernel is `neon-gee-rf` (Python 3.11).

## 6. Scripts

For each new script, add a section with:

- Purpose.
- Inputs (files in `data/` or GEE asset IDs).
- The command to run it.
- Outputs (files in `output/` or GEE exports).

### 6.1 `scripts/clbj_rf_classification.ipynb`

**Purpose.** Phase 1 (parity port) of the CLBJ random forest classification. The notebook is a Python port of the GEE Code Editor script `scripts/CLBJ_Random_Forest_modified_4.js`. It classifies 7 woody plant species and 3 land cover classes (grassland, water, shade) at CLBJ in 2017. It uses a `smileRandomForest(100)` classifier on 381 reflectance bands plus the canopy height model (CHM), and an 80/20 per-class split of the reference points. The accuracy numbers must match the JavaScript console output.

**Inputs (GEE asset IDs).**

- `projects/neon/AOP_NEON_Plots/CLBJ_veg_2017_filtered` (reference points)
- `projects/neon/AOP_TOS_Boundaries/D11_CLBJ_TOS_dissolve` (TOS boundary)
- `projects/neon/Airsheds/CLBJ_90percent_footprint` (airshed boundary)
- `projects/neon/DP3-30024-001_DEM` (DTM and CHM, filter `Type`)
- `projects/neon/DP3-30006-001_SDR` (reflectance)

**How to run.**

1. Complete sections 2 and 3 above (conda environment and Earth Engine authentication).
2. In VS Code, open `scripts/clbj_rf_classification.ipynb` and select the `neon-gee-rf` kernel.
3. In the setup cell, set `PROJECT_ID` to your own Google Cloud project ID.
4. Run the cells in order (Run All). The sampling, training, and accuracy cells run on the Earth Engine servers. Their run time and EECU use are not measured yet.

**Outputs.** The notebook writes no files. It prints the point counts for each class, the training accuracy, the test confusion matrix (as a pandas table with `taxonID` labels), the overall accuracy, the kappa coefficient, and the producer's and user's accuracy. It also shows three interactive `geemap` maps (input layers, reference points for each class, and the classified image with the reference points).
