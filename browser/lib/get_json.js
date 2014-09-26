var http = require('http');
var get_json = function(loc, cb) {
    var json = '';
    http.get(loc, function(res){
        res
            .on('data', function(d) {
                json += d;
            })
            .on('error', function(e) {
                cb(e);
            })
            .on('end', function() {
                cb(null, JSON.parse(json))
            });
    });
};
module.exports = get_json;


