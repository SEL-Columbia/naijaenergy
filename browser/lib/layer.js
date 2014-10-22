var leaflet = require('leaflet');
var get_json = require('./get_json');

var geojson_layer = function(loc, map) {
    this.loc = loc;
    this.map = map;
    this.layer = this.layer_init();
};

geojson_layer.prototype.layer_init = function() {
    var self = this;
    get_json(self.loc, function(err, data) {
        if (err)
            throw err;
        console.log(data);
        return leaflet.geoJson(data, {
            style: self.style,
            onEachFeature: self.on_each_feature
        }).addTo(self.map);
    });
};

var heat_color = function(d) {
    return d > 30  ? '#800026' :
           d > 25  ? '#BD0026' :
           d > 20  ? '#E31A1C' :
           d > 15  ? '#FC4E2A' :
           d > 10  ? '#FD8D3C' :
                     '#FEB24C';
};

geojson_layer.prototype.style = function(feature) {
    return {
        fillColor: heat_color(feature.properties.ID),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    };
};

geojson_layer.prototype.highlight = function(ev) {
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

geojson_layer.prototype.reset_style = function(ev) {
        return this.layer.resetStyle(ev.target);
};

geojson_layer.prototype.on_each_feature = function(feature, layer) {
    layer.on({
        mouseover: this.highlight,
        mouseout: this.reset_style,
        dblclick: this.click_ev
    });
};

geojson_layer.prototype.zoom_to = function(ev) {
    this.map.fitBounds(ev.target.getBounds());
};

module.exports = geojson_layer;
    

