var leaflet = require('leaflet');
var http = require('http');
var hyperquest =require('hyperquest');
var states = require('../data/states');
var get_json = require('./get_json');

leaflet.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

//define nigeria boundry
var sw = leaflet.latLng(3.886177033699361, 1.86767578125);
var ne = leaflet.latLng(14.072644954380328, 15.292968749999998);
var nigeria_bounds = leaflet.latLngBounds(sw, ne);

var map_div = 'map';
var map = new leaflet.Map(map_div).fitBounds(nigeria_bounds);

var osm_server = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var osm_layer = leaflet.tileLayer(osm_server, {
        attribution: "Open Street Map"
    });



var heat_color = function(d) {
    return d > 30  ? '#800026' :
           d > 25  ? '#BD0026' :
           d > 20  ? '#E31A1C' :
           d > 15  ? '#FC4E2A' :
           d > 10  ? '#FD8D3C' :
                     '#FEB24C';
};

var style = function(feature) {
    return {
        fillColor: heat_color(feature.properties.ID),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    };
};

var highlight = function(ev) {
    var layer = ev.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // ie shame
    if (!leaflet.Browser.ie && !leaflet.Browser.opera) {
        layer.bringToFront();
    }
};

var states_layer;
var reset_style = function(ev) {
        return states_layer.resetStyle(ev.target);
};

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
 	            .replace(/\s+/gi, "_");
};

var zoom_to = function(map, ev) {
    map.fitBounds(ev.target.getBounds());
};

var add_lga_layer = function(map, ev) {
    var slug = sluggify(ev.target.feature.properties.Name);
    get_json('/state/' + slug, function(err, res) {
        var lga_layer = leaflet.geoJson(res);
        if(map.current_layer) {
            map.removeLayer(map.current_layer);
        }
        map.current_layer = lga_layer;
        lga_layer.addTo(map);
    });
};

var click_ev = function(map) {
    return function(ev) {
        zoom_to(map, ev);
        add_lga_layer(map, ev);
    };
};

var on_each_feature = function(lmap, geolayer) {
    return function(feature, layer) {
        layer.on({
            mouseover: highlight,
            mouseout:  reset_style,
            click:     click_ev(lmap)
        });
    };
};

var states_layer = leaflet.geoJson(states, {
    style: style,
    onEachFeature: on_each_feature(map, states_layer)
});

osm_layer.addTo(map);
states_layer.addTo(map);

module.exports = map;
