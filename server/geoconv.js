var fs = require('fs');
var path = require('path');
var mapnik = require('mapnik');
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'shape.input'));
var ds = new mapnik.Datasource({type: "shape",
                                file: "data/lgas/nga_lgas_with_corrected_id.shp"});
var featureset = ds.featureset();
var geojson = {
  "type": "FeatureCollection",
  "features": [
  ]
}
var feat = featureset.next();
while (feat) {
    geojson.features.push(JSON.parse(feat.toJSON()));
    feat = featureset.next();
}
fs.writeFileSync("lgas.json",JSON.stringify(geojson,null,2));
