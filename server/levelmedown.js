var level = require('level');
var sublevel = require('level-sublevel');
var _ = require('underscore');
var fs = require('fs');
var db = level('.leveldb', {valueEncoding: 'json'});
var geojson_sub = sublevel(db, 'geojson');
var data_sub = sublevel(db, 'data');

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
                geojson_sub.put(lgas_json[lga_id], lga, function(err) {
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
            geojson_sub.put('__nigeria_' + state_name , state, function(err) {
                if (err)
                    throw err;
            });
        });
    });
};
write_geojson_db('lgas.json', 'states.json');

var write_data_db = function(file) {
    fs.readFile(file, function(err, data) {
        if (err)
            throw err;
        var energy = JSON.parse(data.toString());
        _.keys(energy).forEach(function(key) {
            data_sub.put(key, energy[key], function(err) {
                if (err) 
                    throw(err);
            });
        });
    });
};

write_data_db('raw.json');
            

