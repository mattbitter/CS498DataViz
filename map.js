var margin = {top: 10, left: 10, bottom: 10, right: 10},
    width = parseInt(d3.select('#viz').style('width')),
    width = width - margin.left - margin.right,
    mapRatio = .4,
    height = width * mapRatio,
    mapRatioAdjuster = 4; // adjust map ratio here without changing map container size.
    syria_center = [-81, 43.5]; // Syria's geographical center

//Define map projection
var projection = d3.geo.mercator()
                   .center(syria_center) // sets map center to Syria's center
                   .translate([width/2, height/2])
                   .scale(width * [mapRatio + mapRatioAdjuster]);

// adjust map size when browser window size changes
function resize() {
    width = parseInt(d3.select('#viz').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection.translate([width / 2, height / 2])
              .center(syria_center)
              .scale(width * [mapRatio + mapRatioAdjuster]);

    // resize map container
    svg.style('width', width + 'px')
       .style('height', height + 'px');

    // resize map
    svg.selectAll("path").attr('d', path);
}

// adds zoom function to map
var zoom = d3.behavior.zoom()
                      .translate([0, 0])
                      .scale(1)
                      .scaleExtent([1, 10]) // defines how far users can zoom in and out
                      .on("zoom", zoomed);

// zoom function. allows users to zoom in and out of map
function zoomed() {
  features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// when window size changes, resize the map
d3.select(window).on('resize', resize);

// create SVG element
var svg = d3.select("#viz")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom); //Call zoom function on map

//Define path generator
var path = d3.geo.path()
             .projection(projection);

//Group SVG elements together
var features = svg.append("g");
var color = d3.scale.category10();

var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

//Load TopoJSON data
d3.json("map.json", function(error, syr) {

  if (error) return console.error(error);

  var subunits = topojson.feature(syr, syr.objects.collection);

    // Bind data and create one path per TopoJSON feature
    features.selectAll("path")
    .data(topojson.feature(syr, syr.objects.collection).features)
    .enter()
    .append("path")
    .attr("d", path)

    // Sets colors of fill and stroke for each district. Sets stroke width, too.
    .attr("fill", "#e8d8c3")
    .attr("stroke", "#404040")
    .attr("stroke-width", .3)
    //the temp mouse over code sgoes below this

	d3.csv("mapdots.csv", function(data) {
		features.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return projection([d.lon, d.lat])[0];
			})
			.attr("cy", function(d) {
				return projection([d.lon, d.lat])[1];
			})
			.attr("r", function(d) {
				return 1;
			})
			//.style("fill", "rgb(217,91,67)")
			.style("opacity", 0.85)
			.style("fill", function(d) {return color( d.label); })
			//added - bitter
			.on("mouseover", function(d) {
						tooltip.transition()
						.duration(200)
						.style("opacity", .9);
						tooltip.html(d.StoreName)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
					  })
					  .on("mouseout", function(d) {
						tooltip.transition()
						.duration(500)
						.style("opacity", 0);
					  });

	});

});

//playing

//
