// File to generate a zip occurance graph

const intToMonth = new Map([
    ['01', 'January'],
    ['02', 'Feburary'],
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

var svg = d3.select("svg"),
    margin = 200,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin

    svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("font-size", "24px")
    .text("Number of Accidents at given Each Month")


var xScale = d3.scaleBand().range([0, width]).padding(0.4);
var yScale = d3.scaleLinear().range([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");

d3.csv("/data/Motor_Vehicle_Collisions_Crashes.csv", function(error, data) {
    if (error) throw error;

    // Filter data to get rid of blank CRASH DATEs
    var data = data
        .map(function(d) { return {date: d['CRASH DATE']}})
        .filter(function(d) { return d.date != ''})

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

    xScale.domain(newData.map(function (d) {
        return d.get('month')
    }));
    yScale.domain([0, firstVal]);


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
    
    g.selectAll(".bar")
        .data(newData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.get('month')); })
        .attr("y", function(d) { return yScale(d.get('count')); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d.get('count')); });
});