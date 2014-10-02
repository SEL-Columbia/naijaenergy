var level = require('level');
var sublevel = require('sublevel');
var fs = require('fs');
var db = level('.leveldb', {valueEncoding: 'json'});
var geojson_sub = sublevel(db, 'geojson');
var get_unique_lga = require('./adding_unique_lga');

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
 	            .replace(/\s+/gi, "_");
};

var write_db = function (lga, state) {
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
write_db('lgas.json', 'states.json');

