var http  = require('http');
var express = require('express');
var compression = require('compression');
var server = express();
var get_lga = require('./get_lga');
//var routing = require('router');
server.use(compression());
server.use(express.static(__dirname + '/../browser'));

server.get('/state/:state', function(req, res) {
    var state = req.params.state;
    get_lga(state, function(err, data) {
        if (err)
            throw err;
        res.end(JSON.stringify(data));
    });
});

server.listen('1337');
