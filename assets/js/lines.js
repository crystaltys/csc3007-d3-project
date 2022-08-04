const line_width = 960;
const line_height = 500;
const line_margin = 5;
const line_padding = 5;
const line_adj = 50;

var formatDate = d3.timeFormat('%d %b')
const line_svg = d3.select("#line").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + line_adj + " -"
          + line_adj + " "
          + (line_width + line_adj *3) + " "
          + (line_height + line_adj*3))
    .style("padding", line_padding)
    .style("margin", line_margin)
    .classed("svg-content", true);

// load data
const timeConv = d3.timeParse("%d/%m/%Y");
const dataset = d3.csv("/assets/dataset/daily_trans.csv");


dataset.then(function(data) {
    const slices = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d){
                return {
                    date: timeConv(d.date),
                    cases: +d[id]
                };
                
            })
        };
    });

var line_countries = data.columns.slice(1); 
countriesNest = d3.nest()
    .key(function(d) {return line_countries;})
    .entries(line_countries);
console.log(line_countries);
    
// x and y scale

const xScale = d3.scaleTime().range([0,width]);

const yScale = d3.scaleLinear().rangeRound([height, 0]);
xScale.domain(d3.extent(data, function(d){
    return timeConv(d.date)}));
yScale.domain([(0), d3.max(slices, function(c) {
    return d3.max(c.values, function(d) {
        return d.cases + 4; });
        })
    ]);

// x and y axis
const yaxis = d3.axisLeft()
    .ticks((slices[0].values).length)
    .scale(yScale);

const xaxis = d3.axisBottom()
    // .ticks(d3.timeDay.every(1))
    .ticks(d3.month )
    .tickFormat(d3.timeFormat('%b'))
    .scale(xScale );

// draw lines
const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.cases); }); 

// let id = 0;
// const ids = function () {
//     return "line-"+id++;
// } 

// tooltip
const line_tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");


line_svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);


line_svg.append("g")
    .attr("class", "axis")
    .call(yaxis)
    //this you append
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".75em")
    .attr("y", 6)
    .style("text-anchor", "end")
    .text("Number of Cases");

var mycolor = d3.scaleOrdinal().domain(line_countries) 
    .range(d3.schemeSet3); 
 
const line_lines = line_svg.selectAll("lines") 
    .data(slices) 
    .enter() 
    .append("g") 
 
    line_lines.append("path") 
        .attr("class", "line") 
        .attr("d", function(d) { return line(d.values); }) 
        .style("stroke", function(d) {  
            // console.log( mycolor(d.id)) 
                return mycolor(d.id); });
            
    // });
    line_lines.append("text")
    .attr("class","line_country_label")
    .datum(function(d) {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) {
            return "translate(" + (1000)  
            + "," + (yScale(d.value.cases) + 5 ) + ")"; })
    .attr("x", 5)
    .text(function(d) { return d.id; });

    const ghost_lines = line_lines.append("path")
    .attr("class", "ghost-line")
    .attr("d", function(d) { return line(d.values); });

// interactive points 
line_lines.selectAll("points")
    .data(function(d) {return d.values})
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d.date); })      
    .attr("cy", function(d) { return yScale(d.cases); })    
    .attr("r", 1)
    .attr("class","point")
    .style("opacity", 1);


line_lines.selectAll("circles")
    .data(function(d) { return(d.values); } )
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d.date); })      
    .attr("cy", function(d) { return yScale(d.cases); })    
    .attr('r', 10)
    .style("opacity", 0)

    //append this
    .on('mouseover', function(d) {
        line_tooltip.transition()
            .delay(30)
            .duration(200)
            .style("opacity", 1);

        line_tooltip.html( "Cases: " + d.cases + "<br/>" + "Date: " + formatDate(d.date))
        .style("left", (d3.event.pageX + 25) + "px")
        .style("top", (d3.event.pageY) + "px");

        //add this        
        const selection = d3.select(this).raise();

        selection
            .transition()
            .delay("20")
            .duration("200")
            .attr("r", 6)
            .style("opacity", 1)
            .style("fill","#ed3700");
    })

    .on("mouseout", function(d) {      
        line_tooltip.transition()        
        .duration(100)      
        .style("opacity", 0);   

        //add this        
        const selection = d3.select(this);

        selection
            .transition()
            .delay("20")
            .duration("200")
            .attr("r", 10)
            .style("opacity", 0);
    });


    
line_svg.selectAll(".ghost-line")
  .on('mouseover', function() {
      const selection = d3.select(this).raise();
      selection
        .transition()
        .delay("100")
        .duration("10")
        .style("stroke","#ed3700")
        .style("opacity","1")
        .style("stroke-width","3");
      // add the legend action
      const legend = d3.select(this.parentNode)
              .select(".country_label");

      legend
        .transition()
        .delay("100")
        .duration("10")
        .style("fill","#2b2929");
  })
  .on('mouseout', function() {
  const selection = d3.select(this)
  selection
          .transition()
          .delay("100")
          .duration("10")
          .style("stroke","#d2d2d2")
          .style("opacity","0")
          .style("stroke-width","10");

  // add the legend action
  const legend = d3.select(this.parentNode)
            .select(".country_label");

  legend
      .transition()
      .delay("100")
      .duration("10")
      .style("fill","#d2d2d2");
  });
});