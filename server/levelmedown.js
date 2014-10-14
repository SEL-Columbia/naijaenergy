var level = require('level');
var sub = require('level-sublevel');
var _ = require('underscore');
var JSONStream = require('JSONStream');
var fs = require('fs');
var mapped_index = require('level-mapped-index');
var geojson_db = mapped_index(sub(level('db/geojson', {valueEncoding: 'json'})));
var data_db = mapped_index(sub(level('db/data', {valueEncoding: 'json'})));

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
 	            .replace(/\s+/gi, "_");
};

var write_geojson_db = function (lga, state) {
    var get_unique_lga = require('./adding_unique_lga');
    fs.readFile(lga, function(err, data) {
        if (err)
            throw err;
        var lgas = JSON.parse(data.toString());
        get_unique_lga(function(lgas_json) {
            lgas.features.forEach(function(lga) {
                var lga_id = lga.properties.lga_id;
                geojson_db.put(lgas_json[lga_id], lga, function(err) {
                    if (err)
                        throw err;
                });
            });
        });
    });
    fs.readFile(state, function(err, data) {
        if(err)
            throw err;
        var states = JSON.parse(data.toString());
        states.features.forEach(function(state) {
            var state_name = sluggify(state.properties.Name);
            console.log(state_name);
            geojson_db.put('__nigeria_' + state_name , state, function(err) {
                if (err)
                    throw err;
            });
        });
    });
};
write_geojson_db('lgas.json', 'states.json');

var write_data_db_async =function(file, db) {
    var rs = fs.createReadStream(file);
    rs
        .pipe(JSONStream.parse('*'))
        .on('data', function(data) {
            var key = data.key;
            delete data.key;
            console.log(key, data);
            db.put(data.key, data, function(err) {
                if (err)
                    throw(err);
            });
        });
};
write_data_db_async('raw_with_key_prettified.json', data_db);

