var leaflet = require('leaflet');
var http = require('http');
var get_json = require('./get_json');
var layer = require('./layer');

leaflet.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

var map_div = 'map';
var map = new leaflet.Map(map_div);

var osm_server = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var osm_layer = leaflet.tileLayer(osm_server, {
    attribution: "Open Street Map"
});

var state_layer = new layer(map, 'guinea');

osm_layer.addTo(map);

module.exports = map;
