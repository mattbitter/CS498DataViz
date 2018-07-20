//Matthew Bitter - MCS DS, CS498 Final Project JS d3

// ********** SCENE 1 **********
var margin = {top: 10, left: 10, bottom: 10, right: 10},
    width = parseInt(d3.select('#viz').style('width')),
    width = width - margin.left - margin.right,
    mapRatio = .5, //adjust the length of the map container
    height = width * mapRatio,
    mapRatioAdjuster = 6; // adjust how zoomed in the map starts out as
ca_center = [-81, 43.5]; // Western Ontario's geographical center

//Define map projection
var projection = d3.geo.mercator()
    .center(ca_center) // sets map center to Ontario's center
    .translate([width / 2, height / 2])
    .scale(width * [mapRatio + mapRatioAdjuster]);

// adjust map size when browser window size changes
function resize() {
    width = parseInt(d3.select('#viz').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection.translate([width / 2, height / 2])
        .center(ca_center)
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


//Load TopoJSON data, this defines how the map is drawn
d3.json("map.json", function (error, syr) {

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

    d3.csv("mapdots.csv", function (data) {
        features.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", function (d) {
                return d.radf;
            })
            //.style("fill", "rgb(217,91,67)")
            .style("opacity", 0.85)
            .style("fill", function (d) {
                return color(d.label);
            })
            //this is the trigger for the mouse over to show important information
            .on("mousemove", function (d) {
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("top", (d3.event.pageY) + 20 + "px")
                    .style("left", (d3.event.pageX) + 20 + "px")
                    .select('#SN')
                    .text(d.StoreName);
                d3.select('#BN')
                    .text(d.Banner);
                d3.select('#QS')
                    .text(d.QTY_ALL);
                d3.select('#RS')
                    .text(d.pci);
                // Show tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            // Hide tooltip when user stops hovering over map
            .on("mouseout", function () {
                d3.select("#tooltip").classed("hidden", true);
            });

    });

});

//defines the scrollTween function which controls the progress to next scene and previous scene buttons
function scrollTween(offset) {
    return function () {
        var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
        return function (t) {
            scrollTo(0, i(t));
        };
    };
}

//progress to next scene button calling trigger
d3.select("#down").on("click", function () {
    d3.select("body").transition()
        .delay(.5)
        .duration(4500)
        .tween("scroll", scrollTween(1200));
});

//up button, go to previous scene button calling trigger
d3.select("#up").on("click", function () {
    //resume transition
    d3.select("body").transition()
        .delay(.5)
        .duration(4500)
        .tween("scroll", scrollTween(0));
});

//
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

//disable scroll bar
document.body.style.overflow = 'hidden';

//************** SCENE 2 ************

//function is called Filter JSON however the file is changed to CSV.
function filterJSON(json, key, value) {
    var result = [];
    json.forEach(function (val, idx, arr) {
        if (val[key] == value) {
            if (!(val.year instanceof Date)) { //this ensures only non date values are parsed
                parseDate = d3.time.format("%Y%U").parse; //this parses the time into time format and shows YEAR WEEK
                val.year = parseDate(val.year); //this does the parsing
            }
            result.push(val)
        }
    })
    return result;
}

// Set the dimensions of the canvas / graph
var margin = {top: 50, right: 40, bottom: 30, left: 160},
    width = 1000 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;


//set x and y scales
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes from the scales
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5)
    .tickFormat(d3.time.format("%Y Wk %U"))

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var stateline = d3.svg.line()
    .interpolate("linear")
    .x(function (d) {
        return x(d.year);
    })
    .y(function (d) {
        return y(d.value);
    });

// Adds the svg canvas
var svg = d3.select("#scene2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("stroke-width", 2)
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
var data;
// Get the data
d3.csv("scene2_test3.csv", function (error, json) {
    console.log(json)

    json.forEach(function (d) {
        d.value = +d.value; //get each data row so the line chart knows what datapoints to plot when it initially shows
    });

    d3.select('#inds')
        .on("change", function () {
            var sect = document.getElementById("inds");
            var section = sect.options[sect.selectedIndex].value; //get selected dropdown item

            data = filterJSON(json, 'pci', section); //filter based on drop down item

            data.forEach(function (d) { //re pull data based on updated filter slection from user
                d.value = +d.value;
                d.active = true;
            });

            //update the line chart based on selection
            updateGraph(data);

            //jQuery('h1.page-header').html(section);
        });

    // generate initial graph
    data = filterJSON(json, 'pci', 'Very High');
    updateGraph(data);

});

//controls the colors of the line chart
var colors2 = d3.scale.ordinal().range(["#48A36D", "#0096ff", "#ff007e", "#f5da48", "#b953d2"]);

function updateGraph(data) {


    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
        return d.year;
    }));
    y.domain([d3.min(data, function (d) {
        return d.value;
    }), d3.max(data, function (d) {
        return d.value;
    })]);


    // Nest the entries by StoreName so that it splits out the lines by Store and you do not get one continuous line
    dataNest = d3.nest()
        .key(function (d) {
            return d.StoreName;
        })
        .entries(data);

    //create svg line for each store
    var state = svg.selectAll(".line")
        .data(dataNest, function (d) {
            return d.key
        });

    state.enter().append("path")
        .attr("class", "line");

    //logic to control assigning colors to lines
    state.transition()
        .style("stroke", function (d, i) {
            return d.colors2 = colors2(d.key);
        })
        .style("fill", "none")
        .attr("d", function (d) {

            return stateline(d.values)
        });

    state.exit().remove(); //remove lines not in the dataset

    //define the legend based on data, storeName being the key
    var legend = d3.select("#legend")
        .selectAll("text")
        .data(dataNest, function (d) {
            return d.key
        });

    //checkboxes set up for the legend
    legend.enter().append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", 0)
        .attr("y", function (d, i) {
            return 0 + i * 15;
        })  // spacing
        .attr("fill", function (d) {
            return colors2(d.key); //assign same colors to the legend so they match the lines

        })
        .attr("class", function (d, i) {
            return "legendcheckbox " + d.key
        })
        .on("click", function (d) {
            d.active = !d.active; //flip the active status when the legend is clicked

            d3.select(this).attr("fill", function (d) {
                if (d3.select(this).attr("fill") == "#ccc") {
                    return colors2(d.key); //if the legend box is grey make it a color
                } else {
                    return "#ccc"; //else make it grey
                }
            })


            var result = dataNest.filter(function (val, idx, arr) {
                if (val.active != true) {
                    return $("." + val.key); //if active is false i.e. not clicked then bring in the data
                }
            })

            // Hide or show the lines based on the ID
            svg.selectAll(".line").data(result, function (d) {
                return d.key
            })
                .enter()
                .append("path")
                .attr("class", "line")
                .style("stroke", function (d, i) {
                    return d.colors2 = colors2(d.key);
                })
                .style("fill", "none")
                .attr("d", function (d) {
                    return stateline(d.values);
                });

            svg.selectAll(".line").data(result, function (d) {
                return d.key
            }).exit().remove()

        })

    // Add the Legend text
    legend.enter().append("text")
        .attr("x", 15)
        .attr("y", function (d, i) {
            return 10 + i * 15;
        })
        .attr("class", "legend");

    legend.transition()
        .style("fill", "#777")
        .text(function (d) {
            return d.key;
        });

    legend.exit().remove(); //remove legends not matching data set

    svg.selectAll(".axis").remove();

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
};

//defines the clear all lines and annotations button
function clearAll() {
    d3.selectAll(".line")
        .transition().duration(100)
        .attr("d", function (d) {
            return null;
        });
    d3.select("#legend").selectAll("rect")
        .transition().duration(100)
        .attr("fill", "#ccc");

    //hide annotation red circle
    var cirs2 = document.getElementById("circles2");
    cirs2.style.display = "none";
};

function showAll() {

    //show all the lines. data needed to be re pulled into results variable and lines redrawn.
    //also set all the legend colors back to colors and not grey
    d3.select("#legend").selectAll("rect")
        .attr("fill", function (d) {
            return colors2(d.key);

        })
    var cirs2 = document.getElementById("circles2");
    cirs2.style.display = "block";

    var result = dataNest.filter(function (val, idx, arr) {
        val.active = false;
        return $("." + val.key);
    })

    // Hide or show the lines based on the ID
    svg.selectAll(".line").data(result, function (d) {
        return d.key
    })
        .enter()
        .append("path")
        .attr("class", "line")
        .style("stroke", function (d, i) {
            return d.colors2 = colors2(d.key);
        })
        .style("fill", "none")
        .attr("d", function (d) {
            return stateline(d.values);
        });

    d3.selectAll(".line")
        .transition().duration(100)
        .attr("d", function (d) {
            return stateline(d.values);
        });
};
