var through = require('through');
var fs = require('fs');
var _ = require('underscore');
var mapreduce = require('map-reduce');
//var data_db = sub(level('db/data', {valueEncoding: 'json'}));
var data_db =require('./mapper').data_db;
var mapper = require('./mapper').state_aggregate;

var write_data_db = function(file ,db) {
    fs.readFile(file, function(err, data) {
        if (err)
            throw err;
        var energy = JSON.parse(data.toString());
        _.keys(energy).forEach(function(key) {
            data_db.put(key, energy[key], function(err) {
                if (err) 
                    throw(err);
            });
        });
    });
};

write_data_db('raw.json', data_db);
