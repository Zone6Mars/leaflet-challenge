//Function to choose color of circle based on the depth of the earthquake.
function chooseColor(depth) {
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

//Initializing Function
function init() {
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(data=>{
  data.json().then(d => {

      //Initialize the map to focus on earthquakes around Alaska as a default
      var myMap = L.map("map", {
          center: [50.5, -125],
          zoom: 5
        });

        //Add Legend to bottom left
        var legend = L.control({position: 'bottomleft'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10 ,10, 30, 50, 70, 90, 100, 500];
            
            // loop through earthquake depths and assign color to each depth
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    //loop creaates 2 lines, where the second line is overwritten in the next iteration until the end
                    //adding 0.5 to meet the conditions set in chooseColor (0.5, 1.5, etc.)
                    '<i style="background:' + chooseColor(grades[i] + 0.5) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };
        legend.addTo(myMap)

      //Use mapbox to add a night navigation map layer under the earthquakes
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/navigation-night-v1',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: API_KEY 
      }).addTo(myMap);


      
      // Circles Design - Loop through each data point 
      // Set radius of circle marker based on magnitude
      // Set fill color to use function chooseColor on Depth data for earthquake 
      d.features.forEach(EQuake => {
          var myDate = new Date(EQuake.properties.time);       // <--- converted epoch data to human-readable for popup
          L.circle([EQuake.geometry.coordinates[1],EQuake.geometry.coordinates[0]], {
              color: "black",
              weight: 0.1,
              fillColor: chooseColor(EQuake.geometry.coordinates[2]),
              fillOpacity: 0.75,
              radius: EQuake.properties.mag*10000
            })
            //add popup to each circle containing time, magnitude and place of the recorded earthquake
            .bindPopup("<p><b>Time</b>: " + myDate.toLocaleString() + "</p>" + "<p><b>Depth</b>: " + EQuake.geometry.coordinates[2] + "</p>" + "<p><b>Magnitude</b>: " + EQuake.properties.mag + "</p>" + "<p><b>Place</b>: " + EQuake.properties.place + "</p>")
              .addTo(myMap);
      });
    
  })
});
}

//produce final map with earthquakes identified as markers ontop of the mapbox layer
init();
