// File to generate a zip occurance graph

// Get the svg container, which is a div
var svgContainer = d3.select('#chart')
const margin = 200;
const width = 1000 - margin;
const height = 800 - margin;

// Make a svg object
var svg = svgContainer.append('svg')
    .attr('width', 1000)
    .attr('height', 800)

// Append the title
svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("font-size", "24px")
    .text("Number of Accidents at Top 5 Zip Codes")

// Make the scales for each axis
var xScale = d3.scaleBand().range([0, width]).padding(0.4);
var yScale = d3.scaleLinear().range([height, 0]);

// Append a g object and move it over 100 px
var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");

// Open the dataset
d3.csv("./data/Motor_Vehicle_Collisions_Crashes.csv", function(error, data) {
    if (error) throw error;

    // Filter data to get rid of blank zip codes
    var data = data
        .map(function(d) { return {zip_code: d['ZIP CODE']}})
        .filter(function(d) { return d.zip_code != ''})

    // Count the occurance of each zip code
    var zipCount = new Map()
    for (var i=0; i < data.length; i++) {
        var zip = (data[i].zip_code)
        if (zip != '') {
            if (zipCount.has(zip)) {
                zipCount.set(zip, zipCount.get(zip) + 1);
            }
            else {
                zipCount.set(zip, 1)
            }
        }
    }

    // Sort by desc
    var sortedZip = new Map([...zipCount].sort((a,b) => b[1] - a[1]));

    // Get the top 5 elements
    var newZip = new Map()
    var tempIter = 0;
    for( let[key, value] of sortedZip.entries()) {
        newZip.set(key, value);
        tempIter+=1;
        if (tempIter >= 5) {
            break;
        }
    }

    // Make a new data object
    var newData = []
    for ( let[key, value] of newZip.entries()) {
        var tempItem = new Map()
        tempItem.set('zip_code', key)
        tempItem.set('count', value)
        newData.push(tempItem)
    }

    // Get the highest val for y-axis
    const [firstVal] = newZip.values();

    // Set the scales
    xScale.domain(newData.map(function (d) {
        return d.get('zip_code')
    }));
    yScale.domain([0, firstVal]);

    // Append the x-axis
    g.append("g")
        .style("font", "16px times")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("y", height - 550)
        .attr("x", width - 100)
        .attr("text-anchor", "end")
        .text("Zip Code")
        .attr("fill", "black");

    // Append the y-axis
    g.append("g")
        .style("font", "16px times")
        .call(d3.axisLeft(yScale).tickFormat(function(d){
            return d;
        })
        .ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "end")
        .text("Number of Accidents")
        .attr("fill", "black");

    // Create tooltip
    var tooltip = svgContainer
        .append("div")
        .attr("transform", "translate(" + 100 + "," + 100 + ")")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position", "absolute");

    // Create mouse functions
    var mouseover = function(d) {
        var zip = d.get('zip_code')
        var count = d.get('count');
        tooltip
            .html("Zip Code: " + zip + "<br>" + "Number of Accidents: " + count)
            .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
            .style("left", (d3.mouse(this)[0]+70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
        tooltip
            .style("opacity", 0)
    }
    
    // Append the bars to the graph
    g.selectAll(".bar")
        .data(newData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.get('zip_code')); })
        //.attr("y", function(d) { return yScale(d.get('count')); })
        .attr('y', function(d) { return yScale(0); })
        .attr("width", xScale.bandwidth())
        //.attr("height", function(d) { return height - yScale(d.get('count')); })
        .attr('height', function(d) { return height - yScale(0); })
        .attr("fill", '#ADD8E6')
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    
    // Animation for the rectangles
    svg.selectAll("rect")
        .transition()
        .duration(1000)
        .attr("y", function(d) { return yScale(d.get('count')); })
        .attr("height", function(d) { return height - yScale(d.get('count')); })
        .delay(function(d,i){return(i*100);})
});