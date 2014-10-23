var leaflet = require('leaflet');
var get_json = require('./get_json');

var layer = function(geojson, map) {
    this.geojson = geojson;
    this.map = map;
    var self = this;
    return leaflet.geoJson(geojson, {
        style: style,
        onEachFeature: on_each_feature
    }).addTo(map);
};

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

var reset_style = function(ev) {
        return layer.resetStyle(ev.target);
};

var zoom_to = function(ev) {
    map.fitBounds(ev.target.getBounds());
};

var click_ev = function(ev) {
    console.log(this);
    zoom_to(ev);
    //load_next_layer(ev);
};

var on_each_feature = function(feature, layer) {
    layer.on({
        click: zoom_to
        //mouseover: self.highlight,
        //mouseout: self.reset_style,
        //dblclick: self.click_ev
    });
};


var load_next_layer = function(ev) {
    var self = this;
    get_json('/state/' + slug, function(err, res) {
        var secondary_layer = new geojson_layer(res, map);
        secondary_layer.addTo(map);
    });
};


module.exports = layer;
    

