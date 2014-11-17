var http  = require('http');
var express = require('express');
var compression = require('compression');
var server = express();
var get_geojson = require('./get_geojson');
var get_data = require('./get_data');
server.use(compression());
server.use(express.static(__dirname + '/../browser'));

server.get(/^\/geojson\/(.*?)\/?$/, function(req, res) {
    var lvls = req.params[0].split('/');
    get_geojson(lvls, function(err, data) {
        if (err)
            throw err;
        res.end(JSON.stringify(data));
    });
});

server.get('/data/:unique_lga', function(req, res) {
    var unique_lga = req.params.unique_lga;
    get_data(unique_lga, function(err, data) {
        if (err)
            throw err;
        res.end(JSON.stringify(data));
    });
});

server.listen('1337');
