// Random Forests classification example for Lyndon B. Johnson National Grassland (CLBJ)
// Adapted from Geethen Singh 2020, GEE for Ecology and Conservation OTS course

// Workflow:
// 1. Specify input (training) data for display and use in analysis
// 2. Combine AOP spectrometer reflectance data with lidar-derived canopy height model (CHM) to create the predictor data
// 3. Create reference data for plant species and land cover types based on NEON vegetation structure data
// 4. Fit a random forest model based on spectral/CHM composite to map the distribution of plant species at CLBJ
// 5. Evaluate the model accuracy 

// Specify CLBJ location
var geo = ee.Geometry.Point([-97.5706464, 33.4045729])
// Load species/land cover samples feature collection to variable (originally a .csv file extracted from  NEON woody plant vegetation structure data product (DP1.10098.001))
var CLBJ_veg = ee.FeatureCollection('projects/neon/AOP_NEON_Plots/CLBJ_veg_2017_filtered')
// Load terrestrial observation system (TOS) boundary to a variable
var CLBJ_TOS = ee.FeatureCollection('projects/neon/AOP_TOS_Boundaries/D11_CLBJ_TOS_dissolve')
//Load tower airshed boundary to a variable
var CLBJ_Airshed = ee.FeatureCollection('projects/neon/Airsheds/CLBJ_90percent_footprint')

// Display Digital Terrain Model (DTM) for CLBJ. First, filter the DEM image collection by year, DEM type and geographic location
var CLBJ_DTM2017 = ee.ImageCollection('projects/neon/DP3-30024-001_DEM')
  .filterDate('2017-01-01', '2017-12-31')
  .filterMetadata('Type', 'equals', 'DTM')
  .filterBounds(geo)
  .first();
// Then mask out the no-data values (-9999) in the image and add to the map using a histogram stretch based on lower and upper data values
var CLBJ_DTM2017mask = CLBJ_DTM2017.updateMask(CLBJ_DTM2017.gte(0.0000));
Map.addLayer(CLBJ_DTM2017mask, {min:285, max:1294}, 'CLBJ DTM 2017',0);

// Display Canopy Height Model (CHM) for CLBJ. First, filter the DEM image collection by year, DEM type and geographic location
var CLBJ_CHM2017 = ee.ImageCollection('projects/neon/DP3-30024-001_DEM')
  .filterDate('2017-01-01', '2017-12-31')
  .filterMetadata('Type', 'equals', 'CHM')
  .filterBounds(geo)
  .first();
  
// Then mask out the no-data values (-9999) in the image and add to the map using a histogram stretch based on lower and upper data values
var CLBJ_CHM2017mask = CLBJ_CHM2017.updateMask(CLBJ_CHM2017.gte(0.0000));
Map.addLayer(CLBJ_CHM2017mask, {min:0, max:33}, 'CLBJ CHM 2017',0);

// Display Surface Directional Reflectance (SDR) image for CLBJ. First, filter the image collection by year, type and geographic location
// Then select all bands except water absorption bands (band195-band205 and band287-band310), as well as the last 10 bands, which also tend to be noisy
var CLBJ_SDR2017 = ee.ImageCollection('projects/neon/DP3-30006-001_SDR')
  .filterDate('2017-01-01', '2017-12-31')
  .filterBounds(geo)
  .first()

var bandNames = CLBJ_SDR2017.bandNames()
var bandsToRemove = ['band195','band196','band197','band198','band199','band200','band201','band202','band203','band204','band205',
                    'band287','band288','band289','band290','band291','band292','band293','band294','band295','band296','band297',
                    'band298','band299','band300','band301','band302','band303','band304','band305','band306','band307','band308',
                    'band309','band310','band416','band417','band418','band419','band420','band421','band422','band423','band424','band425']
var bandsToKeep = bandNames.removeAll(bandsToRemove)
var CLBJ_SDR2017subset = CLBJ_SDR2017.select(bandsToKeep)

print('CLBJ_SDR2017 Valid Band Subset')
print(CLBJ_SDR2017subset)

//Then mask out the no-data values (-9999) in the image and add to the map using a histogram stretch based on lower and upper data values
var CLBJ_SDR2017mask = CLBJ_SDR2017.updateMask(CLBJ_SDR2017.gte(0.0000)).select(['band053', 'band035', 'band019']);
Map.addLayer(CLBJ_SDR2017mask, {min:.5, max:10}, 'CLBJ SDR 2017', 0);

//Combine the SDR (381 bands) and CHM (1 band) for classification
var CLBJ_SDR_CHMcomposite = CLBJ_SDR2017subset.addBands(CLBJ_CHM2017mask).aside(print, 'Composite SDR and CHM image');

//Crop the reflectance image/CHM composite to the NEON tower airshed boundary and add to the map
var CLBJ_SDR2017_airshed = CLBJ_SDR_CHMcomposite.clip(CLBJ_Airshed) // comment if uncommenting next line of code
//var CLBJ_SDR2017_airshed = composite // uncomment to classify entire SDR scene
Map.addLayer(CLBJ_SDR2017_airshed, {bands:['band053', 'band035', 'band019'], min:.5, max:10}, 'CLBJ-Airshed SDR/CHM 2017');

// Display the TOS boundary polygon layer
Map.addLayer(CLBJ_TOS.style({width: 3, color: "blue", fillColor: "#00000000"}),{},"CLBJ TOS", 0)

// Display the Airshed polygon layer
Map.addLayer(CLBJ_Airshed.style({width: 3, color: "white", fillColor: "#00000000"}),{},"CLBJ Airshed", 0)

// Print details about the NEON vegetation structure Feature Collection to the Console
// Note that plant species data were derived from the NEON woody plant vegetation structure data product (DP1.10098.001)
// Land cover classes (grassland, water, shade) were subsequently added to the Feature Collection from visual inspection of the NEON spectrometer reflectance data product (DP3.30006.001)
print(CLBJ_veg, 'All woody plant samples')

// Display all plot locations in the map
//Map.addLayer(CLBJ_veg_filt, {color: 'white'}, 'Woody plant species');

// Filter vegetation structure data to tree height > 8m (optional - uncomment next line to apply filter)
// var CLBJ_veg_filt = CLBJ_veg.filter(ee.Filter.gt('height', 8))
// print(CLBJ_veg_filt, 'CLBJ Filtered Veg Structure Table')

var CLBJ_veg_filt = CLBJ_veg // Comment this line out if optional tree height filter is applied
print(CLBJ_veg_filt)

var CLBJ_CELA = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['CELA']))
//print(CLBJ_CELA, 'CELA')
Map.addLayer(CLBJ_CELA, {color: 'yellow'}, 'Sugarberry', 0);

var CLBJ_JUVI = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['JUVI']))
//print(CLBJ_JUVI, 'JUVI')
Map.addLayer(CLBJ_JUVI, {color: 'white'}, 'Eastern red cedar', 0);

var CLBJ_PRME = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['PRME']))
//print(CLBJ_PRME, 'PRME')
Map.addLayer(CLBJ_PRME, {color: 'green'}, 'Mexican plum', 0);

var CLBJ_QUMA3 = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['QUMA3']))
//print(QUMA3, 'QUMA3')
Map.addLayer(CLBJ_QUMA3, {color: 'orange'}, 'Blackjack oak', 0);

var CLBJ_QUST = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['QUST']))
//print(CLBJ_QUST, 'QUST')
Map.addLayer(CLBJ_QUST, {color: 'darkgreen'}, 'Post oak', 0);

var CLBJ_ULAL = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['ULAL']))
//print(CLBJ_ULAL, 'ULAL')
Map.addLayer(CLBJ_ULAL, {color: 'cyan'}, 'Winged elm', 0);

var CLBJ_ULCR = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['ULCR']))
//print(CLBJ_ULCR, 'ULCR')
Map.addLayer(CLBJ_ULCR, {color: 'purple'}, 'Cedar elm', 0);

var CLBJ_GRSS = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['GRSS']))
//print(CLBJ_GRSS, 'GRSS')
Map.addLayer(CLBJ_GRSS, {color: 'lightgreen'}, 'Grassland', 0);

var CLBJ_WATR = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['WATR']))
//print(CLBJ_WATR, 'WATR')
Map.addLayer(CLBJ_WATR, {color: 'blue'}, 'Water', 0);

var CLBJ_SHADE = CLBJ_veg_filt.filter(ee.Filter.inList('taxonID', ['SHADE']));
//print(CLBJ_SHADE, 'SHADE')
Map.addLayer(CLBJ_SHADE, {color: 'black'}, 'Shade', 0);

// Create training and test subsets for each class (i.e., species types) using stratified random sampling (80%/20% respectively)
// uncomment the print statements to display each of the test samples
var new_table = CLBJ_CELA.randomColumn({seed: 1});
var CELAtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var CELAtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(CELAtraining, 'Number of Sugarberry training samples')

var new_table = CLBJ_JUVI.randomColumn({seed: 1});
var JUVItraining = new_table.filter(ee.Filter.lt('random', 0.80));
var JUVItest = new_table.filter(ee.Filter.gte('random', 0.80));
print(JUVItraining, 'Number of Eastern red cedar training samples')

var new_table = CLBJ_PRME.randomColumn({seed: 1});
var PRMEtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var PRMEtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(PRMEtraining, 'Number of Mexican plum training samples')

var new_table = CLBJ_QUMA3.randomColumn({seed: 1});
var QUMA3training = new_table.filter(ee.Filter.lt('random', 0.80));
var QUMA3test = new_table.filter(ee.Filter.gte('random', 0.80));
print(QUMA3training, 'Number of Blackjack oak training samples')

var new_table = CLBJ_QUST.randomColumn({seed: 1});
var QUSTtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var QUSTtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(QUSTtraining, 'Number of Post oak training samples')

var new_table = CLBJ_ULAL.randomColumn({seed: 1});
var ULALtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var ULALtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(ULALtraining, 'Number of Winged elm training samples')

var new_table = CLBJ_ULCR.randomColumn({seed: 1});
var ULCRtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var ULCRtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(ULCRtraining, 'Number of Cedar elm training samples')

var new_table = CLBJ_GRSS.randomColumn({seed: 1});
var GRSStraining = new_table.filter(ee.Filter.lt('random', 0.80));
var GRSStest = new_table.filter(ee.Filter.gte('random', 0.80));
print(GRSStraining, 'Number of Grassland training samples')

var new_table = CLBJ_WATR.randomColumn({seed: 1});
var WATRtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var WATRtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(WATRtraining, 'Number of Water training samples')

var new_table = CLBJ_SHADE.randomColumn({seed: 1});
var SHADEtraining = new_table.filter(ee.Filter.lt('random', 0.80));
var SHADEtest = new_table.filter(ee.Filter.gte('random', 0.80));
print(SHADEtraining, 'Number of Shade training samples')

// Combine species-type reference points for training partition
var training = (CELAtraining).merge(JUVItraining).merge(PRMEtraining).merge(QUMA3training).merge(QUSTtraining).merge(ULALtraining).merge(ULCRtraining).merge(GRSStraining).merge(WATRtraining).merge(SHADEtraining).aside(print, 'Training partition');
var test = (CELAtest).merge(JUVItest).merge(PRMEtest).merge(QUMA3test).merge(QUSTtest).merge(ULALtest).merge(ULCRtest).merge(GRSStest).merge(WATRtest).merge(SHADEtest).aside(print, 'Test partition');
var points = training.merge(test).aside(print,'All points');

// Extract spectral signatures from airshed reflectance/CHM image for training sample based on species ID 
var Features = CLBJ_SDR2017_airshed.sampleRegions({
  collection: training,
  properties: ['taxonIDnum'],
  scale: 1,
  tileScale:16
});
print('Features with spectral signatures:', Features)

// Train a 100-tree random forest classifier based on spectral signatures from the training sample for each species 
var trainedClassifier = ee.Classifier.smileRandomForest(100)
.train({
  features: Features,
  classProperty: 'taxonIDnum',
  inputProperties: CLBJ_SDR2017_airshed.bandNames()
});

// Classify the reflectance/CHM image from the trained classifier
var classified = CLBJ_SDR2017_airshed.classify(trainedClassifier);

// Calulate a confusion matrix and overall accuracy for the training sample
// Note that this overestimates the accuracy of the model since it does not consider the test sample
var trainAccuracy = trainedClassifier.confusionMatrix().accuracy();
print('Train Accuracy', trainAccuracy);

// Test the classification accuracy (more reliable estimation of accuracy)
// Extract spectral signatures from airshed reflectance image for test sample
var test = CLBJ_SDR2017_airshed.sampleRegions({
  collection: test,
  properties: ['taxonIDnum'],
  scale: 1,
  tileScale: 16
});

// Calculate different test accuracy estimates
var Test = test.classify(trainedClassifier);
print('Confusion Matrix', Test.errorMatrix('taxonIDnum', 'classification'));
print('Overall Accuracy', Test.errorMatrix('taxonIDnum', 'classification').accuracy());
// Kappa Coefficient: evaluates how well a classification performs as compared to randomly assigning values
print('Kappa Coefficient', Test.errorMatrix('taxonIDnum', 'classification').kappa());
// Producer's Accuracy: frequency with which a real feature on the ground is correctly shown in the classified map (corresponds to error of omission)
print('Producers Accuracy', Test.errorMatrix('taxonIDnum', 'classification').producersAccuracy());
// User's Accuracy: frequency with which a feature in the classified map will actually be present on the ground (corresponds to error of commission)
print('Users Accuracy', Test.errorMatrix('taxonIDnum', 'classification').consumersAccuracy());

// Function used to display training data and image classification
function showTrainingData(){
  var colours = ee.List(["yellow", "white", "green", "orange", "darkgreen", "cyan", "purple","lightgreen","blue","black"]);
  var lc_type = ee.List(["CELA", "JUVI", "PRME","QUMA3","QUST","ULAL","ULCR","GRSS","WATR","SHADE"]);
  var lc_label = ee.List([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  var lc_points = ee.FeatureCollection(
    lc_type.map(function(lc){
      var colour = colours.get(lc_type.indexOf(lc));
      return points.filterMetadata("taxonIDnum", "equals", lc_type.indexOf(lc))
                  .map(function(point){
                    return point.set('style', {color: colour, pointShape: "diamond", pointSize: 3, width: 2, fillColor: "00000000"});
                  });
        })).flatten();

  Map.addLayer(classified, {min: 0, max: 9, palette: ["yellow","white", "green", "orange", "darkgreen", "cyan", "purple", "lightgreen", "blue", "black"]}, 'Classified image', false);
  Map.addLayer(lc_points.style({styleProperty: "style"}), {}, 'All training sample points', false);
  Map.centerObject(geo, 16)
}

// Display the training data and image classification using the showTrainingData function
showTrainingData();