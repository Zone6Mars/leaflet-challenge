// Specify link to USGS API
let dataurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Specify location of orogens data
let orogens_data = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_orogens.json"
//Specify location of boundary data
let boundaries_data = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
//Specify location of plates data
let plates_data = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
//Specify location of steps data
let steps_data = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json"

// Create function to select colors based on magnitude
function getColor(depth) {
    if (depth > 500) {
      return "#000000";
    }
    if (depth > 100) {
      return "#120811";
    }
    if (depth > 90) {
      return "#241022";
    }
    if (depth > 70) {
      return "#361834";
    }
    if (depth > 50) {
      return "#482045";
    }
    if (depth > 30) {
      return "#5b2956";
    }
    if (depth > 10) {
      return "#6d3167";
    }
  
    if (depth > -10) {
      return "#d397cd";
    } else {
      return "#ffffff";
    }
  }
  

// Create basemaps
let navNightView = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/navigation-night-v1',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})

let grayscaleView = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})

let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

// Define a baseMaps object for base layers
let baseMaps = {
    "Night Nav": navNightView ,
    "Grayscale": grayscaleView,
    "Topology": topo
  };

// Initialize overlay maps
let layers = {
    earthquakes: new L.LayerGroup(),
    boundaries: new L.LayerGroup(),
    plates: new L.LayerGroup(),
    steps: new L.LayerGroup(),
    orogens: new L.LayerGroup()
};

//Initialize the map to focus on earthquakes around Alaska as a default
let mymap = L.map('map', {
    center: [50.5, -125], // center of the world
    zoom: 5,
    layers:[
        navNightView,
        layers.earthquakes,
    ]
  });

// Create array of overlay maps
let overlays = {
    "Earthquakes": layers.earthquakes,
    "Boundaries": layers.boundaries,
    "Plates": layers.plates,
    "Steps": layers.steps,
    "Orogens": layers.orogens

};

// Add layer control 
L.control.layers(baseMaps,overlays,{
    condensed: false
}).addTo(mymap);

// Pull Json earthquake data
d3.json(dataurl).then(data=>{
    data.features.forEach(EQuake => {
              
        let lat = EQuake.geometry.coordinates[1]
        let long = EQuake.geometry.coordinates[0]
        let timetag = new Date(EQuake.properties.time).toGMTString()

        // Magnitude Color Selector
        let color = getColor(EQuake.geometry.coordinates[2]);

        // Create Circle Layer
        var myDate = new Date(EQuake.properties.time);
        L.circle(
            [lat,long],
            {
              fillOpacity: 0.8,
              weight: 0.1,
              color : '#fafafa',
              fillColor : color,
              radius : EQuake.properties.mag*10000
            }
          ).bindPopup("<p><b>Time</b>: " + myDate.toLocaleString() + "</p>" + "<p><b>Depth</b>: " + EQuake.geometry.coordinates[2] + "</p>" + "<p><b>Magnitude</b>: " + EQuake.properties.mag + "</p>" + "<p><b>Place</b>: " + EQuake.properties.place + "</p>")
          .addTo(layers.earthquakes)


    });
});

// Read in fault boundary data
d3.json(boundaries_data).then(data=>{
    let onEachFeature = (feature, layer) => {layer}
    let boundary = L.geoJson(data,{
        style: function(feature){
            return {
                color: '#000000', //highlighter orange
                weight: 4.5
            }
        },
    }).addTo(layers.boundaries)
});

d3.json(orogens_data).then(data=>{
    let onEachFeature = (feature, layer) => {layer}
    let orogens = L.geoJson(data,{
        style: function(feature){
            return {
                color: '#f95700ff', //highlighter orange
                weight: 1.5
            }
        },
    }).addTo(layers.orogens)
});

d3.json(plates_data).then(data=>{
    let onEachFeature = (feature, layer) => {layer}
    let plate = L.geoJson(data,{
        style: function(feature){
            return {
                fillColor: 'none',
                color: '#5e8fff', //pale blue
                weight: 0.5
            }
        },
    }).addTo(layers.plates)
});

d3.json(steps_data).then(data=>{
    let onEachFeature = (feature, layer) => {layer}
    let step = L.geoJson(data,{
        style: function(feature){
            return {
                color: '#f2ff00', //pale blue
                weight: 2.5
            }
        },
    }).addTo(layers.steps)
});

// Add legened to the map
let legend = L.control({
    position: 'bottomleft'
});
legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90, 100, 500],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> '+
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] +'<br>': '+');
    }
    return div;
};

// Add legend to map
legend.addTo(mymap)

// Add legend controls to only show up when earthquakes layer is selected
mymap.on('overlayremove', function (eventLayer) {
    console.log(eventLayer)
    if (eventLayer.name === 'Earthquakes') {
        mymap.removeControl(legend);
    };
});

mymap.on('overlayadd', function (eventLayer) {
    console.log(eventLayer)
    if (eventLayer.name === 'Earthquakes') {
        legend.addTo(mymap);
    };
});