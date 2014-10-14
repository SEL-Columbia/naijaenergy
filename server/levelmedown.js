var level = require('level');
var sub = require('level-sublevel');
var _ = require('underscore');
var JSONStream = require('JSONStream');
var fs = require('fs');
var mapreduce = require('map-reduce');
var geojson_db = sub(level('db/geojson', {valueEncoding: 'json'}));
var data_db = sub(level('db/data', {valueEncoding: 'json'}));

exports.data_db = data_db;
exports.geojson_db = geojson_db;

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
 	            .replace(/\s+/gi, "_");
};

exports.write_geojson_db = function (lga, state) {
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

exports.write_data_db = function(file, db) {
    var rs = fs.createReadStream(file);
    rs
        .pipe(JSONStream.parse('*'))
        .on('data', function(data) {
            var key = data.key;
            delete data.key;
            db.put(key, data, function(err) {
                if (err)
                    throw(err);
            });
        });
};

var mapper = function (key, value, emit) {
    //key is fct_bwari!dsfsdfasfasf
    //value is an obj: src, power_type, power_access, lat, long, 
    //functional_status, facility_type_display
    var unique_lga = key.split('!')[0];
    emit(['all', unique_lga], JSON.stringify(value.src));
};

var reducer = function(acc, value, key) {
    /*
    if (acc === undefined) {
        acc = '{}';
    }
    

    try {
        acc = JSON.parse(acc);
    } catch (e) {
        console.log('zaiming sucks');
    }
    */
    acc = JSON.parse(acc);
    value = JSON.parse(value);
    if('string' === typeof value) {
        acc[value] = (acc[value] || 0) + 1;
        return JSON.stringify(acc);
    }

    for (var src in value) {
        acc[src] = (acc[src] || 0) + value[src];
    }
    return JSON.stringify(acc);
};

exports.mapdb = mapreduce(data_db, 'state_aggregate', mapper, reducer, '{}');
exports.get_data = function(db, rg) {
    db
        .createReadStream({range: rg})
        .on('data', function(data) {
            console.log(data.value);
        });
};


