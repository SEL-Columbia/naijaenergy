var through = require('through');
var fs = require('fs');
var _ = require('underscore');
var mapreduce = require('map-reduce');
//var data_db = sub(level('db/data', {valueEncoding: 'json'}));
var data_db =require('./levelmedown').data_db;
var geojson_db =require('./levelmedown').geojson_db;
var mapper = require('./levelmedown').mapdb;
var write_data_db = require('./levelmedown').write_data_db;
var write_geojson_db = require('./levelmedown').write_geojson_db;

write_geojson_db('lgas.json', 'states.json', geojson_db);
write_data_db('raw.json', data_db);
