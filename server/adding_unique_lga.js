var fs = require('fs');
var level = require('level');
var csv = require('csv-streamify');
var through = require('through');



var get_unique_file = function(cb){
    var lgas_csv = fs.createReadStream('lgas.csv');
    var id_obj = {};
    lgas_csv
        .pipe(csv({objectMode: true, columns: true}))
        .pipe(through(function(data){
            id_obj[data.lga_id] = {state: data.state,
                                      lga: data.lga};
        }))
        .on('end', function() {
            cb(id_obj);
        });
};
module.exports = get_unique_file;


