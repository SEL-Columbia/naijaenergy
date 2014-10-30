var level = require('level');
var sub = require('level-sublevel');
var data_db = require('./levelmedown').data_db;
var pipeline = function(collection, cb) {
    var rs = data_db.createReadStream({start: collection + "!!", end: collection + '!!\xff'});
    var res = [];
    rs
        .on('data', function(data) {
            res.push(data.value);
        })
        .on('error', function(err) {
            if (cb)
                cb(err);
            cb = null;
        })
        .on('end', function() {
            if (cb)
                cb(null, res);
            cb = null;
        });
};
module.exports = pipeline;


