var level = require('level');
var sub = require('level-sublevel');
var geojson_sub = require('./levelmedown').geojson_db;
var pipeline = function(collection, cb) {
    var key = collection.join('!!') + '!!geojson!!';
    var rs = geojson_sub.createReadStream({start: key, 
                                           end: key + '\xff'});
    var geojson = { type: "FeatureCollection",
                    features: []
    };
    rs
        .on('data', function(data) {
            geojson.features.push(data.value);
        })
        .on('error', function(err) {
            if (cb)
                cb(err);
            cb = null;
        })
        .on('end', function() {
            if (cb)
                cb(null, geojson);
            cb = null;
        });
};

module.exports = pipeline;
