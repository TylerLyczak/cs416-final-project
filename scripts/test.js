// define data
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
    radius = (Math.min(width, height) / 2)-60
    

// legend dimensions
var legendRectSize = 25; // defines the size of the colored squares in legend
var legendSpacing = 6; // defines spacing between squares

// define color scale
var color = d3.scaleOrdinal(d3.schemeCategory20c);

var g = svg.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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
    //var colors = ['#52d726', '#ffec00', '#ff7300', '#ff0000', '#007ed6', '#7cdddd', '#e3adb5', '#f69284', '#95b8e3', '#ffff384', '#c095e3', '#008080']

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

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { 
            return d.value; 
        })
        .sort(null);
      
    // Tooltip area
    var tooltip = svg.select('g')
        .append('div') // append a div element to the element we've selected                               
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

    tooltip.append('div') // add divs to the tooltip defined above                            
        .attr('class', 'label'); // add class 'label' on the selection                         

    tooltip.append('div') // add divs to the tooltip defined above                     
        .attr('class', 'count'); // add class 'count' on the selection                  

    tooltip.append('div') // add divs to the tooltip defined above  
        .attr('class', 'percent'); // add class 'percent' on the selection

    jsonData.forEach(function(d) {
        d.count =+ d.count; // calculate count as we iterate through the data
        d.enabled = true; // add enabled property to track which entries are checked
    });

    // creating the chart
    var path = g.selectAll('path')
        .data(pie(jsonData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d) { return color(d.data.name); })
        .each(function(d) { this._current - d; });

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', function(d) {  // when mouse enters div      
        var total = d3.sum(jsonData.map(function(d) { // calculate the total number of tickets in the dataset         
            return (d.enabled) ? d.count : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase                                      
    }));

    var percent = Math.round(1000 * d.data.value / total) / 10; // calculate percent
        tooltip.select('.label').html("TEMPPPPP"); // set current label           
        tooltip.select('.count').html('$' + d.data.value); // set current count            
        tooltip.select('.percent').html(percent + '%'); // set percent calculated above          
        tooltip.style('display', 'block'); // set display                     
    });                                                           

    path.on('mouseout', function() { // when mouse leaves div                        
        tooltip.style('display', 'none'); // hide tooltip for that element
    });

    path.on('mousemove', function(d) { // when mouse moves                  
        tooltip.style('top', (d3.event.layerY + 10) + 'px') // always 10px below the cursor
            .style('left', (d3.event.layerX + 10) + 'px'); // always 10px to the right of the mouse
    });

    // define legend
    var legend = g.selectAll('.legend') // selecting elements with class 'legend'
        .data(color.domain()) // refers to an array of labels from our dataset
        .enter() // creates placeholder
        .append('g') // replace placeholders with g elements
        .attr('class', 'legend') // each g is given a legend class
        .attr('transform', function(d, i) {                   
            var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
            var offset =  height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
            var horz = 18 * legendRectSize; // the legend is shifted to the left to make room for the text
            var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
            return 'translate(' + horz + ',' + vert + ')'; //return translation       
    });

    // adding colored squares to legend
    legend.append('rect') // append rectangle squares to legend                                   
        .attr('width', legendRectSize) // width of rect size is defined above                        
        .attr('height', legendRectSize) // height of rect size is defined above                      
        .style('fill', color) // each fill is passed a color
        .style('stroke', color) // each stroke is passed a color
        .on('click', function(label) {
            var rect = d3.select(this); // this refers to the colored squared just clicked
            var enabled = true; // set enabled true to default
            var totalEnabled = d3.sum(jsonData.map(function(d) { // can't disable all options
                return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
            }));

            if (rect.attr('class') === 'disabled') { // if class is disabled
                rect.attr('class', ''); // remove class disabled
            } else { // else
                if (totalEnabled < 2) return; // if less than two labels are flagged, exit
                rect.attr('class', 'disabled'); // otherwise flag the square disabled
                enabled = false; // set enabled to false
            }

            pie.value(function(d) { 
                if (d.label === label) d.enabled = enabled; // if entry label matches legend label
                    return (d.enabled) ? d.count : 0; // update enabled property and return count or 0 based on the entry's status
            });

            path = path.data(pie(jsonData)); // update pie with new data

            path.transition() // transition of redrawn pie
            .duration(750) // 
            .attrTween('d', function(d) { // 'd' specifies the d attribute that we'll be animating
                var interpolate = d3.interpolate(this._current, d); // this = current path element
                this._current = interpolate(0); // interpolate between current value and the new value of 'd'
                return function(t) {
                return arc(interpolate(t));
                };
            });
    });

    // adding text to legend
    legend.append('text')                                    
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; }); // return label
});