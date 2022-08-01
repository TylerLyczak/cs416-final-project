// 11207 zip
// January

// File to generate a zip occurance graph

var makeGraph = function() {

    // Remove any graph from div
    d3.select("#chart").html('')

    // Get month and zip
    var e = document.getElementById('monthLs')
    var monthName = e.options[e.selectedIndex].text;
    var monthVal = e.options[e.selectedIndex].value;

    var t = document.getElementById('zipLs')
    var zipVal = t.options[t.selectedIndex].value;

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
        .text(`Number of Accidents per Day in ${monthName} at Zip ${zipVal}`)

    // Make the scales for each axis
    var xScale = d3.scaleBand().range([0, width]).padding(0.4);
    var yScale = d3.scaleLinear().range([height, 0]);

    // Append a g object and move it over 100 px
    var g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");

    // Open the dataset
    d3.csv("./data/Motor_Vehicle_Collisions_Crashes.csv", function(error, data) {
        if (error) throw error;

        // Filter data to get rid of blank CRASH DATEs
        var data = data
            .map(function(d) { return {date: d['CRASH DATE'], zip_code: d['ZIP CODE']}})
            .filter(function(d) { return d.date != ''})
            .filter(function(d) { return d.zip_code != ''})
            .filter(function(d) { return d.zip_code == zipVal});

        // Count the occurance of each month
        var dayCount = new Map()
        for (var i=0; i < data.length; i++) {
            var date = (data[i].date)
            const month = (date.split('/'))[0]
            const day = (date.split('/'))[1]
            if (month == monthVal) {
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

        // Set the scales
        xScale.domain(newData.map(function (d) {
            return d.get('name')
        }));
        yScale.domain([0, firstVal]);

        // Append the x-axis
        g.append("g")
            .style("font", "14px times")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", height - 550)
            .attr("x", width - 100)
            .attr("text-anchor", "end")
            .text("Day")
            .style("font", "16px times")
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
            var zip = d.get('name')
            var count = d.get('value');
            d3.select(this).transition()
                .duration(500)
                .attr("r", 20);
            tooltip
                .html("Day: " + zip + "<br>" + "Number of Accidents: " + count)
                .style("opacity", 1)
                .style("left", (d3.mouse(this)[0]+40) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }
        var mousemove = function(d) {
            tooltip
                .style("left", (d3.mouse(this)[0]+40) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }
        var mouseleave = function(d) {
            d3.select(this).transition()
                .duration(500)
                .attr("r", 10);
            tooltip
                .style("opacity", 0)
                .style("left", 0 + "px")
                .style("top", 0 + "px")
        }

        // Dot code
        g.append('g')
            .selectAll('dot')
            .data(newData)
            .enter()
            .append('circle')
            .attr("cx", function (d) { return xScale(d.get('name')); } )
            .attr("cy", function (d) { return yScale(d.get('value')); } )
            .attr("r", 10)
            .style("fill", "#000")
            .attr("fill", '#000')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

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
            .style("stroke", '#008B8B')
            .style("stroke-width", "2");

        const type = d3.annotationLabel;

        const annotations = [{
            note: {
                label: "18th has over 100 more accidents than the 2nd highest, the 21st. Avoid this day if driving",
                bgPadding: 20,
                title: "January 18th"
            },
            data: {
                name: "18",
                value: 848
            },
            className: "show-bg",
            dy: 300,
            dx: 150,
            color: 'black'
        }];

        const makeAnnotations = d3.annotation()
            .editMode(false)
            .notePadding(15)
            .type(type)
            .accessors({
                x: d => xScale(d.name) + (xScale.bandwidth()/2),
                y: d => yScale(d.value)
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
}