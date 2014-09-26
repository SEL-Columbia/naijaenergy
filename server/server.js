var http  = require('http');
var express = require('express');
var server = express();
var get_lga = require('./lgas_json');
//var routing = require('router');
server.use(express.static(__dirname + '/../browser'));

server.get('/state/:state', function(req, res) {
    var state = req.params.state;
    get_lga(state, function(err, data) {
        res.end(JSON.stringify(data));
    });
});

server.listen('1337');
