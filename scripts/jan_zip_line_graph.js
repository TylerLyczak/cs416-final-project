// 11207 zip
// January

// File to generate a zip occurance graph

var svg = d3.select("svg"),
    margin = 200,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin

    svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("font-size", "24px")
    .text("Number of Accidents per Day in January at Zip 11207")


var xScale = d3.scaleBand().range([0, width]).padding(0.4);
var yScale = d3.scaleLinear().range([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");

d3.csv("./data/Motor_Vehicle_Collisions_Crashes.csv", function(error, data) {
    if (error) throw error;

    // Filter data to get rid of blank CRASH DATEs
    var data = data
        .map(function(d) { return {date: d['CRASH DATE'], zip_code: d['ZIP CODE']}})
        .filter(function(d) { return d.date != ''})
        .filter(function(d) { return d.zip_code != ''})

    // Count the occurance of each month
    var dayCount = new Map()
    for (var i=0; i < data.length; i++) {
        var date = (data[i].date)
        const month = (date.split('/'))[0]
        const day = (date.split('/'))[1]
        if (month == '01') {
            if (dayCount.has(day)) {
                dayCount.set(day, dayCount.get(day) + 1);
            }
            else {
                dayCount.set(day, 1);
            }
        }
    }

    // Sort by desc
    const sortedDay = new Map([...dayCount].sort());

    // Make a new data object
    var newData = []
    for ( let[key, value] of sortedDay.entries()) {
        var tempItem = new Map()
        tempItem.set('name', key)
        tempItem.set('value', value)
        newData.push(tempItem)
    }

    // Get the highest val for y-axis
    const tempDayCount = new Map([...dayCount].sort((a,b) => b[1] - a[1]));
    const [firstVal] = tempDayCount.values();

    xScale.domain(newData.map(function (d) {
        return d.get('name')
    }));
    yScale.domain([0, firstVal]);

    // Make x-axis
    g.append("g")
        .style("font", "14px times")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("y", height-550)
        .attr("x", width - 100)
        .attr("text-anchor", "end")
        .text("Month")
        .style("font", "16px times")
        .attr("fill", "black");

    // Make y-axis
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

    // Dot code
    g.append('g')
        .selectAll('dot')
        .data(newData)
        .enter()
        .append('circle')
        .attr("cx", function (d) { return xScale(d.get('name')); } )
        .attr("cy", function (d) { return yScale(d.get('value')); } )
        .attr("r", 4)
        .style("fill", "#CC0000");

    // Define line
    var line = d3.line()
        .x(function(d) { return xScale(d.get('name'));})
        .y(function(d) { return yScale(d.get('value'));})
        .curve(d3.curveMonotoneX);

    // Add line to graph
    g.append('path')
        .datum(newData)
        .attr("class", "line") 
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "#CC0000")
        .style("stroke-width", "2");
});