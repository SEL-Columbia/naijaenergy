var through = require('through');
var fs = require('fs');
var _ = require('underscore');
var mapreduce = require('map-reduce');
//var data_db = sub(level('db/data', {valueEncoding: 'json'}));
var data_db =require('./levelmedown').data_db;
var mapper = require('./levelmedown').mapdb;
var write_data_db = require('./levelmedown').write_data_db;

write_data_db('raw_with_key_prettified.json', data_db);
