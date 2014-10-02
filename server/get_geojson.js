var level = require('level');
var sublevel = require('sublevel');
var db = level('.leveldb', {valueEncoding: 'json'});
var geojson_sub = sublevel(db, 'geojson');
var pipeline = function(collection, cb) {
    var rs = geojson_sub.createReadStream({start: collection, end: collection + '\xff'});
    var geojson = { type: "FeatureCollection",
                    features: []
    };
    rs
        .on('data', function(data) {
            geojson.features.push(data.value)
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
