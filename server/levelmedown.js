var level = require('level');
var sub = require('level-sublevel');
var _ = require('underscore');
var JSONStream = require('JSONStream');
var fs = require('fs');
var mapreduce = require('map-reduce');
var geojson_db = sub(level('db/geojson', {valueEncoding: 'json'}));
var data_db = sub(level('db/data', {valueEncoding: 'json'}));

/* this is a collection of functions
 * that initialize database and
 * dump data from geojson, etc.
*/

exports.data_db = data_db;
exports.geojson_db = geojson_db;

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
 	            .replace(/\s+/gi, "_");
};

exports.write_geojson_db = function (lga, state, geojson_db) {
    var get_unique_lga = require('./adding_unique_lga');
    fs.readFile(lga, function(err, data) {
        if (err)
            throw err;
        var lgas = JSON.parse(data.toString());
        get_unique_lga(function(lgas_json) {
            lgas.features.forEach(function(lga) {
                var lga_id = lga.properties.lga_id;
                var key = 'nigeria!!' +
                          sluggify(lgas_json[lga_id].state) +
                          '!!geojson!!'+
                          sluggify(lgas_json[lga_id].lga);

                geojson_db.put(key, lga, function(err) {
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
            geojson_db.put('nigeria!!geojson!!' + state_name , state, function(err) {
                if (err)
                    throw err;
            });
        });
    });
};
//exports.write_geojson_db('lgas.json', 'states.json', exports.geojson_db);

exports.write_guinea_geojson = function(l1, l2, l3, db) {
    // region
    fs.readFile(l1, function(err, data) {
        if (err)
            throw err;
        var gj = JSON.parse(data.toString());
        gj.features.forEach(function(feat) {
            var key = 'guinea!!' +
                      'geojson!!'+
                      sluggify(feat.properties.ADM1_NAME);

            geojson_db.put(key, feat, function(err) {
                if (err)
                    throw err;
            });
        });
    });
    //prefecture
    fs.readFile(l2, function(err, data) {
        if (err)
            throw err;
        var gj = JSON.parse(data.toString());
        gj.features.forEach(function(feat) {
            var key = 'guinea!!' +
                      sluggify(feat.properties.ADM1_NAME) +
                      '!!geojson!!'+
                      sluggify(feat.properties.ADM2_NAME);

            geojson_db.put(key, feat, function(err) {
                if (err)
                    throw err;
            });
        });
    });
    //sous-prefecture
    fs.readFile(l3, function(err, data) {
        if (err)
            throw err;
        var gj = JSON.parse(data.toString());
        gj.features.forEach(function(feat) {
            var key = 'guinea!!' +
                      sluggify(feat.properties.ADM1_NAME) +
                      '!!'+
                      sluggify(feat.properties.ADM2_NAME) +
                      '!!geojson!!' +
                      sluggify(feat.properties.ADM3_NAME);

            geojson_db.put(key, feat, function(err) {
                if (err)
                    throw err;
            });
        });
    });
};
//exports.write_guinea_geojson('guinea_region.json', 'guinea_prefecture.json', 'guinea_sous_prefecture.json', exports.geojson_db);

exports.write_data_db = function(file, db) {
    var rs = fs.createReadStream(file);
    rs
        .pipe(JSONStream.parse('*'))
        .on('data', function(data) {
            var key = data.state + 
                      '!!' +
                      data.lga +
                      '!!' +
                      data.survey_id;
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
    emit(['all', value.state, value.lga], JSON.stringify(value.src));
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
            console.log(data.key, data.value);
        });
};


