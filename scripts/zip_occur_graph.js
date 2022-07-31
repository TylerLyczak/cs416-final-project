// File to generate a zip occurance graph

const zipImg = new Map([
    ['11207', './assets/11207.jpg'],
    ['11236', './assets/11236.jpg'],
    ['11212', './assets/11212.jpg'],
    ['11208', './assets/11208.jpg'],
    ['11203', './assets/11203.jpg']
])

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
            .html("Zip Code: " + zip + "<br>" + "Number of Accidents: " + count + '<br>' + `'<img src="${zipImg.get(zip)}" width="150" height="150"></img>'` + '<br>' + 'Click to find out more about this zip code!')
            .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
            .style("left", (d3.mouse(this)[0]+70) + "px")
            .style("top", (d3.mouse(this)[1]-200) + "px")
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
        .attr("fill", '#008B8B')
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on('click', function(d,i) {
            // Go to zip page
            console.log(d.get('zip_code') + '.html');
            var url = './zip_pages/' + d.get('zip_code') + '.html';
            window.location.href = url;
        });
    
    // Animation for the rectangles
    svg.selectAll("rect")
        .transition()
        .duration(1000)
        .attr("y", function(d) { return yScale(d.get('count')); })
        .attr("height", function(d) { return height - yScale(d.get('count')); })
        .delay(function(d,i) { return(i*100); });

    const type = d3.annotationLabel

    const annotations = [{
        note: {
            label: "This zip code almost has twice the amount of accidents as the second biggest (11236). Why is this?",
            bgPadding: 20,
            title: "Zip Code 11207"
        },
        data: {
            zip_code: "11207",
            count: 4007
        },
        className: "show-bg",
        dy: 50,
        dx: 650,
        color: 'black'
    }];

    const makeAnnotations = d3.annotation()
        .editMode(false)
        .notePadding(15)
        .type(type)
        .accessors({
            x: d => xScale(d.zip_code) + (xScale.bandwidth()/2),
            y: d => yScale(d.count)
        })
        .accessorsInverse({
            date: d => xScale.invert(d.x) - (xScale.bandwidth()/2),
            close: d => yScale.invert(d.y)
        })
        .annotations(annotations)

    g.append('g')
        .attr("class", "annotation-group")
        .call(makeAnnotations)
});