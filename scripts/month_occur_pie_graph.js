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
    radius = 240;

svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-size", "24px")
    .text("Number of Accidents at given Each Month")

// var g = svg.append("g")
//     .attr("transform", "translate(" + 100 + "," + 100 + ")");
var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("./data/Motor_Vehicle_Collisions_Crashes.csv", function(error, data) {
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
    // Define arc colours
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    var colors = ['#52d726', '#ffec00', '#ff7300', '#ff0000', '#007ed6', '#7cdddd', '#e3adb5', '#f69284', '#95b8e3', '#ffff384', '#c095e3', '#008080']

    // Sort by desc
    var sortedMonth = new Map([...monthCount].sort((a,b) => b[1] - a[1]));

    // Make a new data object
    var jsonData = []
    var names = []
    for (let[key, value] of sortedMonth.entries()) {
        var jsonVal = {}
        jsonVal['name'] = key;
        jsonVal['value'] = value;
        jsonData.push(jsonVal);
        names.push(key);
    }

    var ordScale = d3.scaleOrdinal()
        .domain(jsonData)
        .range(colors);

    var pie = d3.pie().value(function(d) { 
        return d.value; 
    });

    var arc = g.selectAll("arc")
        .data(pie(jsonData))
        .enter();

    var path = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return ordScale(d.data.name); });

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    arc.append("text")
        // .attr("transform", function(d) { 
        //     return "translate(" + (label.centroid(d)+10000) + ")"; 
        // })
        .attr("transform", function(d) {
            return "translate(" + 
            ( (radius - 12) * Math.sin( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) +
            ", " +
            ( -1 * (radius - 12) * Math.cos( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) +
            ")";
        })
        .text(function(d) { return d.data.name; })
        .style("font-family", "arial")
        .style("font-size", 15)
        .style("text-anchor", function(d) {
            var rads = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
            if ( (rads > 7 * Math.PI / 4 && rads < Math.PI / 4) || (rads > 3 * Math.PI / 4 && rads < 5 * Math.PI / 4) ) {
                return "middle";
            } else if (rads >= Math.PI / 4 && rads <= 3 * Math.PI / 4) {
                return "start";
            } else if (rads >= 5 * Math.PI / 4 && rads <= 7 * Math.PI / 4) {
                return "end";
            } else {
                return "middle";
            }
        });

    var legendG = svg.selectAll(".legend") // note appending it to mySvg and not svg to make positioning easier
        .data(pie(jsonData))
        .enter().append("g")
        .attr("transform", function(d,i){
          return "translate(" + (width - 10) + "," + (i * 20 + 80) + ")"; // place each legend on the right and bump each one down 15 pixels
        })
        .attr("class", "legend");   
      
      legendG.append("rect") // make a matching color rect
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function(d, i) {
          return colors[i];
        });
      
      legendG.append("text") // add the text
        .text(function(d){
          return d.data.name;
        })
        .style("font-size", 14)
        .attr("y", 10)
        .attr("x", 11);
});