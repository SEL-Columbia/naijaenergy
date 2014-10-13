var level = require('level');
var sub = require('level-sublevel');
var mapreduce = require('map-reduce');
var data_db = sub(level('db/data', {valueEncoding: 'json'}));


var mapper = function (key, value, emit) {
    //key is fct_bwari!dsfsdfasfasf
    //value is an obj: src, power_type, power_access, lat, long, 
    //functional_status, facility_type_display
    var unique_lga = key.split('!')[0];
    var src = value.src;
    emit(unique_lga, src);
};

var reducer = function(acc, value, key) {
    acc = JSON.parse(acc);
    value = JSON.parse(value);
    acc[value] = (acc[value] || 0) + 1;
    return JSON.stringify(acc);
};

var state_aggregate = mapreduce(data_db, 'state_aggregate', mapper, reducer, 0);
exports.state_aggregate = state_aggregate;
exports.data_db = data_db;
