
// initial setup
const svg = d3.select("#my_dataviz"),
	width = svg.attr("width"),
	height = svg.attr("height"),
	path = d3.geoPath(),
	data = d3.map(),
	worldmap = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
	worldpopulation = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
    infectionlist = "https://raw.githubusercontent.com/crystaltys/CSC3007-project/main/infection.csv";

let centered, world;

var color_data = [{"color":"#E0E9F5","value":100},{"color":"#C6DBEE","value":300},{"color":"#9DCAE1","value":24000},{"color":"#6AAFD6","value":32000},{"color":"#4292C4","value":40000},{"color":"#2171B3","value":48000},{"color":"#09519C","value":56000},{"color":"#093067","value":64000}]


// style of geographic projection and scaling
const projection = d3.geoRobinson()
	.scale(160)
	.translate([width / 2, height / 2]);

// Define color scale
const colorScale = d3.scaleThreshold()
	.domain([100, 300, 24000, 32000, 40000, 48000])
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
    if (total_case<10){
        fill = d3.schemeOrRd[7][0]
    }else if (total_case>=10 && total_case<100){
        fill = d3.schemeOrRd[7][1]
    }else if (total_case>=100 && total_case<300){
        fill = d3.schemeOrRd[7][2]
    }else if (total_case>=300 && total_case<500){
        fill = d3.schemeOrRd[7][3]
    }else if (total_case>=500 &&total_case<700){
        fill = d3.schemeOrRd[7][4]
    }else if (total_case>=700 &&total_case<900){
        fill = d3.schemeOrRd[7][5]
    }else{
        fill = d3.schemeOrRd[7][6]
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
function legend_linear({
    color,
    title,
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
      .attr("width", width)
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
  
      svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .enter().append('rect')
        .attr("x", function(d,i){return x(i - 1)})
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill",function(d,i){return (d)});

        svg.append("g")
        .selectAll("rect")
        .data([5])
        .enter().append('rect')
        .attr("x", function(d,i){return -50})
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", "#D7DCFC");
    
  
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

    console.log(topo.features)

	let mouseOver = function(d) {
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
			.style("opacity", 1)
			.text(d.properties.name + ': ' + Math.round((d.total / 1000000) * 10) / 10 + ' mio.');
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
                color = fill_color(parseInt(cases+sus_cases))
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
			if (d[1] < d[0]) return d[0]  + " m +";
			return d[0] + " m - " + d[1]  + " m";
		});
    d3.select("#legend").append("text").attr("fill", "black").attr("y", 280).attr("x", 15).text(function(d) { return "Total cases (count)"; });

    lengends_ticks = [10,30,100,300,1000,3000,10000]
    legend_linear({color: d3.scaleThreshold(
            lengends_ticks,
                d3.schemeBlues[8]
            ),
            title: "No data",
            tickSize: 0,
            width: 500, 
            height:  50 
        });
}