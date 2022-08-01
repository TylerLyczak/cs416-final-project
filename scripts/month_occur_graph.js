// File to generate a zip occurance graph

const zipChangeOrig = function() {

    // Remove any graph from div
    d3.select("#chart").html('')

    const intToMonth = new Map([
        ['01', 'January'],
        ['02', 'February'],
        ['03', 'March'],
        ['04', 'April'],
        ['05', 'May'],
        ['06', 'June'],
        ['07', 'July'],
        ['08', 'August'],
        ['09', 'September'],
        ['10', 'October'],
        ['11', 'November'],
        ['12', 'December']
    ]);

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
        .text("Number of Accidents at given Each Month")

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

        // Count the occurance of each month
        var monthCount = new Map()
        for (var i=0; i < data.length; i++) {
            var date = (data[i].date)
            const month = intToMonth.get((date.split('/'))[0])
            if (month != '') {
                if (monthCount.has(month)) {
                    monthCount.set(month, monthCount.get(month) + 1);
                }
                else {
                    monthCount.set(month, 1);
                }
            }
        }

        // Sort by desc
        var sortedMonth = new Map([...monthCount].sort((a,b) => b[1] - a[1]));

        // Make a new data object
        var newData = []
        for ( let[key, value] of sortedMonth.entries()) {
            var tempItem = new Map()
            tempItem.set('month', key)
            tempItem.set('count', value)
            newData.push(tempItem)
        }

        // Get the highest val for y-axis
        const [firstVal] = sortedMonth.values();

        // Set the scales
        xScale.domain(newData.map(function (d) {
            return d.get('month')
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
            .text("Month")
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
            var zip = d.get('month')
            var count = d.get('count');
            tooltip
                .html("Zip Code: " + zip + "<br>" + "Number of Accidents: " + count)
                .style("opacity", 1)
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }
        var mousemove = function(d) {
            tooltip
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }
        var mouseleave = function(d) {
            tooltip
                .style("opacity", 0)
                .style("left", 0 + "px")
                .style("top", 0 + "px")
        }
        
        g.selectAll(".bar")
            .data(newData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xScale(d.get('month')); })
            .attr('y', function(d) { return yScale(0); })
            .attr("width", xScale.bandwidth())
            .attr('height', function(d) { return height - yScale(0); })
            .attr("fill", '#008B8B')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // Animation for the rectangles
        svg.selectAll("rect")
            .transition()
            .duration(1000)
            .attr("y", function(d) { return yScale(d.get('count')); })
            .attr("height", function(d) { return height - yScale(d.get('count')); })
            .delay(function(d,i) { return(i*100); })

        const type = d3.annotationLabel;

        const annotations = [{
            note: {
                label: "These are the months of the new year, along with the coldest months in New York City. Why do we see more crashes during these months?",
                bgPadding: 20,
                title: "January and February"
            },
            data: {
                month: "February",
                count: 17276
            },
            className: "show-bg",
            dy: 25,
            dx: 675,
            color: 'black'
        }];

        const makeAnnotations = d3.annotation()
            .editMode(false)
            .notePadding(15)
            .type(type)
            .accessors({
                x: d => xScale(d.month) + (xScale.bandwidth()/2),
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
}