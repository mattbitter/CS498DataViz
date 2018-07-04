var styles = [
      {
        stylers: [
          { hue: "#00ffe6" },
          { saturation: -70 },
          { lightness: 10 },
          { gamma: 1.0 }
        ]
      },{
        featureType: "administrative",
        stylers: [
          { gamma: 0 },
          { visibility: "simplified" }
        ]
      },{
        featureType: "road.local",
        stylers: [
          { gamma: -30 },
          { visibility: "on" },
          { strokeWeight: 3},
          { strokeColor: "black"}
        ]
      },
      {
        featureType: "landscape.man_made  ",
        stylers: [
          { visibility: "simplified" },

        ]
      },
      {
        featureType: "transit",
        stylers: [
          { visibility: "off" },
        ]
      }
    ];

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 13,
  center: new google.maps.LatLng(34.0554907, -118.41893235),
  mapTypeId: google.maps.MapTypeId.ROADMAP,
});

map.setOptions({styles: styles});




// Load the station data. When the data comes back, create an overlay.
d3.json("query.json", function(data) {

  // console.log(data.businesses[0].location.coordinate.latitude, data.businesses[0].location.coordinate.longitude);



  var overlay = new google.maps.OverlayView();


  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "stations");

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
  overlay.draw = function() {
    var projection = this.getProjection(),
        padding = 10;

    var flatData = [];

    $.each(data.businesses, function(i, item) {

    flatData.push({latitude: item.location.coordinate.latitude, longitude: item.location.coordinate.longitude});

    })  

    var marker = layer.selectAll("svg")
        // .data(d3.entries(data))
        .data(d3.entries(flatData))
        .each(transform) // update existing markers
        .enter()
        .append("svg")
        .each(transform)
        .attr("class", "marker");

      // Add a circle.
    marker.append("circle")
        .attr("r", 8)
        .attr("cx", padding)
        .attr("cy", padding);


    // Add a label.
    marker.append("text")
        .attr("x", padding + 7)
        .attr("y", padding)
        .attr("dy", ".31em")
        .text(function(d) { return d.key; });


 

    function transform(d) {    
      console.log(d);
      // d = new google.maps.LatLng(d.value[0], d.value[1]);
      d = new google.maps.LatLng(d.value.latitude, d.value.longitude);
      // d = new google.maps.LatLng(d[1], d[0]);
      // d = new google.maps.LatLng(d.coordinate[0], d.coordinate[1]);
      d = projection.fromLatLngToDivPixel(d);
      return d3.select(this)
          .style("left", (d.x - padding) + "px")
          .style("top", (d.y - padding) + "px");
    }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
});
