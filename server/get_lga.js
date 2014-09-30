var level = require('level');
var db = level('.leveldb', {valueEncoding: 'json'});

var pipeline = function(state, cb) {
    var rs = db.createReadStream({start: state, end: state + '\xff'});
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
