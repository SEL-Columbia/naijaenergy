var leaflet = require('leaflet');
var get_json = require('./get_json');

var geojson_layer = function(geojson, map) {
    var self = this;
    this.geojson = geojson;
    this.map = map;
    this.click_ev = function(ev) {
        self.zoom_to(ev);
        self.load_next_layer(ev);
    };
    this.reset_style = function(ev) {
        return self.layer.resetStyle(ev.target);
    };
    this.layer = leaflet.geoJson(self.geojson, {
        style: self.style,
        onEachFeature: function(feature, layer) {
            layer.on({
                click: self.click_ev,
                mouseover: self.highlight,
                mouseout: self.reset_style,
            });
        }
    }).addTo(map);
    this.map.fitBounds(this.layer.getBounds());

};

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
                .replace(/\s+/gi, "_");
};

geojson_layer.prototype.layer = function() {
    var self = this;
    return leaflet.geoJson(self.geojson, {
        style: self.style,
        onEachFeature: function(feature, layer) {
            layer.on({
                click: self.click_ev,

            });
            //self.on_each_feature(feature, layer);
        }
    }).addTo(self.map);
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
    var self = this;
    //console.log('wat', this);
    layer.on({
        click: self.click_ev
        //mouseover: self.highlight,
        //mouseout: self.reset_style,
        //dblclick: self.click_ev
    });
};

geojson_layer.prototype.click_ev = function(ev) {
    console.log(this);
    this.zoom_to(ev);
    //this.load_next_layer(ev);
};

geojson_layer.prototype.load_next_layer = function(ev) {
    var self = this;
    var slug = sluggify(ev.target.feature.properties.Name);
    get_json('/state/' + slug, function(err, res) {
        var secondary_layer = new geojson_layer(res, self.map);
    });
};

geojson_layer.prototype.zoom_to = function(ev) {
    this.map.fitBounds(ev.target.getBounds());
};

module.exports = geojson_layer;
    

