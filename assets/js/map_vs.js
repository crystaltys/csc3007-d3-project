
// initial setup
const svg = d3.select("#my_dataviz"),
	width = svg.attr("width"),
	height = svg.attr("height"),
	path = d3.geoPath(),
	data = d3.map(),
	worldmap = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
	worldpopulation = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
  infectionlist = "https://raw.githubusercontent.com/crystaltys/CSC3007-project/main/infection.csv";

let centered, world;
var color_data = [{"color":d3.schemeOrRd[5][0],"value":100},{"color":d3.schemeOrRd[5][1],"value":300},{"color":d3.schemeOrRd[5][2],"value":500},{"color":d3.schemeOrRd[5][3],"value":700},{"color":d3.schemeOrRd[5][4],"value":201200}]


// style of geographic projection and scaling
const projection = d3.geoRobinson()
	.scale(160)
	.translate([width / 2, height / 2]);

// Define color scale
const colorScale = d3.scaleThreshold()
	.domain([100, 300, 500, 700, 201200])
	.range(d3.schemeOrRd[7]);

// add tooltip
const tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Load external data and boot
d3.queue()
	.defer(d3.json, worldmap)
	.defer(d3.csv, worldpopulation, function(d) {
		data.set(d.code, +d.pop);
	})
    .defer(d3.csv, infectionlist)
	.await(ready);

// Add clickable background
svg.append("rect")
  .attr("class", "background")
	.attr("width", width)
	.attr("height", height)
	.on("click", click);

// Add filtering colors
function fill_color(total_case){
    var fill="";
    if (total_case<100){
        fill = d3.schemeOrRd[5][0]
    }else if (total_case>=100 && total_case<300){
        fill = d3.schemeOrRd[5][1]
    }else if (total_case>=300 && total_case<500){
        fill = d3.schemeOrRd[5][2]
    }else if (total_case>=500 && total_case<700){
        fill = d3.schemeOrRd[5][3]
    }else if (total_case>=700 &&total_case<201200){
        fill = d3.schemeOrRd[5][4]
    }
    return fill
}  
    

// Zoom functionality
function click(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = -(centroid[0] * 6);
    y = (centroid[1] * 6);
    k = 3;
    centered = d;
  } else {
    x = 0;
    y = 0;
    k = 1;
    centered = null;
  }

  world.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  world.transition()
      .duration(750)
      .attr("transform", "translate(" + x + "," + y + ") scale(" + k + ")" );
  
}


// Libraries

// ----------------------------
//Start of Choropleth drawing
// ----------------------------


function ready(error, topo, nil, inf_list) {
  
  // topo is the data received from the d3.queue function (the world.geojson)
  // the data from world_population.csv (country code and country population) is saved in data variable
  groupBy = inf_list.reduce(function (r, a) {
      r[a.Country_Code] = r[a.Country_Code] || [];
      r[a.Country_Code].push(a);
      return r;
  }, Object.create(null));
  Object.values(groupBy).forEach(function (obj , i){
      if (obj.length>1){
          var cfm_cases = 0;
          var sus_cases = 0;
          var hospitalized = 0;
          var travel_hist_no = 0;
          var travel_hist_yes = 0;
          var country = obj[0].Country
          var code = obj[0].Country_Code
          obj.forEach(item => {
              cfm_cases += parseInt(item.Confirmed_Cases)
              sus_cases += parseInt(item.Suspected_Cases)
              hospitalized += parseInt(item.Hospitalized)
              travel_hist_no += parseInt(item.travel_hist_no)
              travel_hist_yes += parseInt(item.travel_hist_yes)
          ;});
          groupBy[code] = [{Confirmed_Cases: cfm_cases.toString(), Country: country, Country_Code: code, Hospitalized: hospitalized.toString(),
              Travel_History_No: travel_hist_no.toString(), Travel_History_Yes: travel_hist_yes.toString()}]
      }
  })

  topo_groupBy_id = topo.features.reduce(function (r, a) {
      r[a.id] = r[a.id] || [];
      r[a.id].push(a);
      return r;
  }, Object.create(null));

  Object.keys(groupBy).forEach(function (obj , i){
      index = Object.keys(topo_groupBy_id).findIndex(id => id===obj.toString())
      if (index!=-1){
          topo.features[index]["Confirmed_Cases"] = groupBy[obj][0].Confirmed_Cases
          topo.features[index]["Hospitalized"] = groupBy[obj][0].Hospitalized
          topo.features[index]["Suspected_Cases"] = groupBy[obj][0].Suspected_Cases
          topo.features[index]["Travel_History_No"] = groupBy[obj][0].Travel_History_No
          topo.features[index]["Travel_History_Yes"] = groupBy[obj][0].Travel_History_Yes
      }
  })

  //*************************************** Pie Chart ******************************************************//

    // Declaration
    const hospital = []
    const non_hospital = []
    let sum = 0

    for (let i = 0; i < topo.features.length; i++) {
      if (topo.features[i].Hospitalized >= 0) {
        hospital.push(topo.features[i].Hospitalized)
      }
      else {
        non_hospital.push(topo.features[i].Hospitalized)
      }
    }

    // console.log(hospital)

    for (let i = 0; i<hospital.length; i++) {
      sum += parseInt(hospital[i])
    }
    
    // console.log("Sum: " + sum)

    const final_no = sum
    const hosp_per = Math.round((hospital.length / topo.features.length) * 100)
    const non_hosp_per = 100 - hosp_per

    
    
    // console.log("Not hospitalized Percentage: " + Math.round(non_hosp_per) + "%")

    // Set the dimension and margins of the graph
    var pie_width = 500
        pie_height = 500
        pie_margin = 10
    var donutWidth =  100 //This is the size of the hole in the middle

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var pie_radius = Math.min(pie_width, pie_height) / 2 - pie_margin
    
    var pie_dataset = {
      hospitalized: hosp_per,
      non_hospitalized: non_hosp_per
    }

    // console.log(pie_dataset)

    var color = d3.scaleOrdinal()
      .domain(pie_dataset)
      .range(["#5A39AC", "#E7C820"])

    // Compute the position of each group on the pie:
    var pie = d3.pie()
      .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(pie_dataset))

    var div = d3.select("#pie_chart").append("div")
     .attr("class", "tooltip-donut")
     .style('opacity','0');

    // append the svg object to the div called 'pie_chart'
    var piepie = d3.select("#pie_chart")
      .append("svg")
        .attr("id", "pie_svg")
        .attr("width", pie_width)
        .attr("height", pie_height)
      .append("g")
      .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")")

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    piepie.selectAll("path")
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(pie_radius - donutWidth)
        .outerRadius(pie_radius)
      )
      .attr('fill', function(d){ return(color(d.data.key)) })
      .attr("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", "0.7")

      .on('mouseover', function(d, i) {
        d3.select(this).transition()
          .duration(2)
          .style('opacity', '0.25');
        //Makes the new div appear on hover:
        div.transition()
          .duration(50)
          .style("opacity", 1);
          let num = (d.value + '%');

        div.html(num)
          .style("left", (d3.event.pageX + 30) + "px")
          .style("top", (d3.event.pageY - 25) + "px");
        
      })

      .on('mouseout', function(d, i) {
        d3.select(this).transition()
          .duration(2)
          .style('opacity', '1');
        
          div.transition()
            .duration(2)
            .style('opacity', '0')
          
          //Makes the new div disappear:
          div.transition()
               .duration('50')
               .style("opacity", 0);
      })

      // Text in the middle
      piepie.append("svg:text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("style","font-family:Ubuntu")
      .attr("font-size","40")
      .attr("fill","black")
      .text(final_no + " cases")


      var pi_legend_dataset = ["Hospitalized", "Not Hospitalized"]
      var pi_leg = d3.select("#pie_chart_legend")
      pi_leg.append("svg").attr("width", width)
      .attr("height", 100)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")

      
      var pi_color_data = d3.scaleOrdinal()
      .domain(pi_legend_dataset)
      .range(["#5A39AC", "#E7C820"]);
      var pi_pieSize = 200
      
      pi_leg.select("svg")
            .selectAll("rect")
            .data(pi_legend_dataset)
            .enter()
            .append("g")
            .append("rect")
            .attr("x", function(d,i){ return i * 1000})
            .attr("y", function(d,i){ return 200 }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", pi_pieSize)
            .attr("height", pi_pieSize)
            .style("fill", function(d){ return pi_color_data(d)})
            
      pi_leg.select("svg")
            .selectAll("g").append("text")
            .attr("x",function(d,i){ return i * 1000 + 300 })
            .attr("y", function(d,i){ return 300
            
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return pi_color_data(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", "60px")


    
      

  //******************************* Confirmed Cases ********************************************************//

  const confirm = []
  const not_confirm = []
  let confirm_sum = 0

  // console.log(topo.features[4].Confirmed_Cases)

  for (let i = 0; i < topo.features.length; i++) {
    if (topo.features[i].Confirmed_Cases >= 0) {
      confirm.push(topo.features[i].Confirmed_Cases)
    }
    else {
      not_confirm.push(topo.features[i].Confirmed_Cases)
    }
  }

  // console.log(confirm)

  for (let i = 0; i<confirm.length; i++) {
    confirm_sum += parseInt(confirm[i])
  }

  
  //******************************* End of Confirmed Cases ********************************************************//

  //******************************* Confirmed Cases ********************************************************//

  const sus = []
  const not_sus = []
  let sus_sum = 0

  // console.log(topo.features[4].Confirmed_Cases)

  for (let i = 0; i < topo.features.length; i++) {
    if (topo.features[i].Suspected_Cases >= 0) {
      sus.push(topo.features[i].Suspected_Cases)
    }
    else {
      not_sus.push(topo.features[i].Suspected_Cases)
    }
  }

  // console.log(confirm)

  for (let i = 0; i<sus.length; i++) {
    sus_sum += parseInt(sus[i])
  }

  console.log("SUS " + sus_sum)

  //******************************* End of Confirmed Cases ********************************************************//


let mouseOver = function(d) {
  let cases = 0;
  if (isNaN(Math.round(d.Confirmed_Cases+d.Suspected_Cases))==false){
    cases = Math.round(parseInt(d.Confirmed_Cases)+parseInt(d.Suspected_Cases))
  }
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", .5)
    .style("stroke", "transparent");
  d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "black");
  tooltip.style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY - 28) + "px")
    .transition().duration(400)
    .style("background","black")
    .style("opacity", 0.75)
    .style("color","white")
    .text(d.properties.name + ': ' + cases + ' cases.');
}

let mouseLeave = function() {
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "transparent");
  tooltip.transition().duration(300)
    .style("opacity", 0);
}

// Draw the map
world = svg.append("g")
  .attr("class", "world");
world.selectAll("path")
  .data(topo.features)
  .enter()
  .append("path")
  .attr("id", function(d) {
    return d.id
  })
  .attr("class","country")
  // draw each country
  // d3.geoPath() is a built-in function of d3 v4 and takes care of showing the map from a properly formatted geojson file, if necessary filtering it through a predefined geographic projection
  .attr("d", d3.geoPath().projection(projection))
  //retrieve the name of the country from data
  .attr("data-name", function(d) {
    return d.properties.name
  })

  // set the color of each country
  .attr("fill", function(d,i) {
          cases = d.Confirmed_Cases
          sus_cases = d.Suspected_Cases
          if (typeof (cases)==="undefined"){
              color = "#D7DCFC";
          }else{
              color = fill_color(parseInt(cases)+parseInt(sus_cases))
          }
          return color
      })

  // add a class, styling and mouseover/mouseleave and click functions
  .style("stroke", "transparent")
  .attr("class", function(d) {
    return "Country"
  })
  .attr("id", function(d) {
    return d.id
  })
  .style("opacity", 1)
  .on("mouseover", mouseOver)
  .on("mouseleave", mouseLeave)
  .on("click", click);

// Legend
const x = d3.scaleLinear()
  .domain([2.6, 75.1])
  .rangeRound([600, 860]);

const legend = svg.append("g")
  .attr("id", "legend");

const legend_entry = legend.selectAll("g.legend")
  .data(colorScale.range().map(function(d) {
    d = colorScale.invertExtent(d);
    if (d[0] == null) d[0] = x.domain()[0];
    if (d[1] == null) d[1] = x.domain()[1];
    return d;
  }))
  .enter().append("g")
  .attr("class", "legend_entry");

const ls_w = 20,
  ls_h = 20;

legend_entry.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i) {
    return height - (i * ls_h) - 2 * ls_h;
  })
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d) {
    return colorScale(d[0]);
  })
  .style("opacity", 0.8);

legend_entry.append("text")
      .attr("fill", "black")
  .attr("x", 50)
  .attr("y", function(d, i) {
    return height - (i * ls_h) - ls_h - 6;
  })
  .text(function(d, i) {
    if (i === 0) return "< " + color_data[0].value + " cases";
    if (d[1] < d[0]) return d[0]  + " cases +";
    return d[0] + " cases - " + d[1]  + " cases";
  });
  d3.select("#legend").append("text").attr("fill", "black").attr("y", 280).attr("x", 15).text(function(d) { return "Total cases (count)"; });

  var xTicks = color_data.map(d => d.value);
  threshold = d3.scaleThreshold()
  .domain(xTicks)
  .range(d3.schemeOrRd[5])
  var legendElement = legend_func({
    color: threshold,
    title: "",
    data: topo.features,
    tickSize: 6,
    width: 700, 
    height:  60
});

}
// Libraries
function legend_func({
  color,
  title,
  data,
  tickSize = 6,
  width = 320,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 30,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  const svg = d3.select("#legends")
    
  svg.attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")


  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  

  // Sequential
  else if (color.interpolator) {

    x = Object.assign(color.copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)), {
        range() {
          return [marginLeft, width - marginRight];
        }
      });

    svg.append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", ramp(color.interpolator()).toDataURL());
     

    // scaleSequentialQuantile doesnâ€™t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds = color.thresholds ? color.thresholds() // scaleQuantize
      :
      color.quantiles ? color.quantiles() // scaleQuantile
      :
      color.domain(); // scaleThreshold

    const thresholdFormat = tickFormat === undefined ? d => d :
      typeof tickFormat === "string" ? d3.format(tickFormat) :
      tickFormat;

    x = d3.scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([marginLeft, width - marginRight]);

    svg.selectAll("rect")
      .data(color.range())
      .enter()
      .append("rect")
      .attr("x", function(d,i){return x(i - 1)})
      .attr("y", marginTop)
      .attr("width", (d, i) => x(i) - x(i - 1))
      .attr("height", height - marginTop - marginBottom)
      .style("fill", d => d)
      .on("mouseover", (e,d) => {
        // find countries code that falls within that range 
        let lowerlimit
        let Higherlimit
        if (d == 0){
          lowerlimit = 0 
          Higherlimit = color.domain()[d]
        }
        else{
          lowerlimit = color.domain()[d-1]
          Higherlimit = color.domain()[d]
        }
        let filter = filterCountries(data,lowerlimit,Higherlimit)
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity",0.2)
    
        d3.selectAll(filter.toString())
          .transition()
          .duration(200)
          .style("opacity",1.0)
          .style("stroke","black") 
      });

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
      .domain(color.domain())
      .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
      .attr("x", x)
      .attr("y", marginTop)
      .attr("width", Math.max(0, x.bandwidth() - 1))
      .attr("height", height - marginTop - marginBottom)
      .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x)
      .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
      .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
      .tickSize(tickSize)
      .tickValues(tickValues))
    .call(tickAdjust)
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
      .attr("x", -40)
      .attr("y", marginTop + marginBottom - height - 6)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(title));

  return svg.node();
}

function filterCountries(data, low, high){
  filtered = []
  data.forEach(function (obj , i){
    total_case = parseInt(obj.Confirmed_Cases)+parseInt(obj.Suspected_Cases)
    if ((isNaN(obj.Confirmed_Cases)==false) && (total_case>=low) && (total_case<high)) {
      filtered.push("#"+obj.id)
    }
  })
  return filtered

}