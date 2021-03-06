var leaflet = require('leaflet');
var util = require('util');
var $ = require('jquery');
var get_json = require('./get_json');

var geojson_layer = function(map) {
    var self = this;
    this.name_arr = Array.prototype.slice.call(arguments, 1);
    this.level = this.name_arr.length;
    this.map = map;
    this.path = '/geojson/' + this.name_arr.join('/'); 
    get_json(this.path, function(err, data) {
        if (data.features.length > 0) {
            self.geojson = data;
            self.click_ev = function(ev) {
                self.zoom_to(ev);
                self.load_next_layer(ev);
            };
            self.reset_style = function(ev) {
                $('#curr_name').get(0).textContent = '';
                return self.layer.resetStyle(ev.target);
            };
            self.layer = leaflet.geoJson(self.geojson, {
                style: self.style,
                onEachFeature: function(feature, layer) {
                    layer.on({
                        click: self.click_ev,
                        mouseover: self.highlight,
                        mouseout: self.reset_style,
                    });
                }
            });
            self.map.current_layers = self.map.current_layers || [];
            self.map.current_layers.push(self.layer);
            self.layer.addTo(map);
            self.map.fitBounds(self.layer.getBounds());
            $('#map_name').get(0).textContent = self.name_arr.join('|');
        }
    });
};

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
                .replace(/\s+/gi, "_");
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
        color: 'grey',
        dashArray: '3',
        fillOpacity: 0.0
    };
};

geojson_layer.prototype.highlight = function(ev) {
    var layer = ev.target;
    var prop = layer.feature.properties;
    var curr_name = prop.ADM3_NAME || prop.ADM2_NAME || prop.ADM1_NAME;
    $('#curr_name').get(0).textContent = curr_name;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.2
    });
    // ie shame
    if (!leaflet.Browser.ie && !leaflet.Browser.opera) {
        layer.bringToFront();
    }
};

var next_level = function(properties, name_arr) {
    if (name_arr[0] === 'guinea') {
        var next_name = util.format('ADM%d_NAME', name_arr.length);
        name_arr.push(sluggify(properties[next_name]));
        return name_arr;
    } 

    if (name_arr[0] === 'nigeria') {
        name_arr
            .push(sluggify(properties.Name));
        return name_arr;
    }
};

var which_map_layer = function(layer_arr, target) {
    for (var i = 0; i < layer_arr.length; i ++) {
        if (layer_arr[i].hasLayer(target)) {
            return i;
        }
    }
    return null;
};

geojson_layer.prototype.load_next_layer = function(ev) {
    var self = this;
    // remove all necessary layers
    var layer_level = which_map_layer(self.map.current_layers, ev.target);
    var layer_to_remove = self.map.current_layers.slice(layer_level + 1);
    layer_to_remove.map(function(l) {self.map.removeLayer(l);});
    self.map.current_layers = self.map.current_layers.slice(0, layer_level + 1);
    // redefine next layer
    self.name_arr = self.name_arr.slice(0, layer_level + 1);
    var next_arr = next_level(ev.target.feature.properties, self.name_arr);
    // apply next layer 
    var args = [self.map];
    next_arr.map(function(item) { args.push(item); });
    var next_layer = geojson_layer.apply(this, args);
};

geojson_layer.prototype.zoom_to = function(ev) {
    this.map.fitBounds(ev.target.getBounds());
};

module.exports = geojson_layer;
    
