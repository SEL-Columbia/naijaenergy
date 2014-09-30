var level = require('level');
var sublevel = require('sublevel')';
var fs = require('fs');
var db = level('.leveldb', {valueEncoding: 'json'});
var lga = sublevel(db, 'lgas');
var get_unique_lga = require('./adding_unique_lga');

var write_db = function (file) {
    fs.readFile(file, function(err, data) {
        if (err)
            throw err;
        var lgas = JSON.parse(data.toString());
        get_unique_lga(function(lgas_json) {
            lgas.features.forEach(function(lga) {
                var lga_id = lga.properties.lga_id;
                db.put(lgas_json[lga_id], lga, function(err) {
                    if (err)
                        throw err;
                });
            });
        });
    });
};
write_db('lgas.json');

