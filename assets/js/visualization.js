// Declare constant varaibles 
let width = "100%";
let height = "50%";
// Map and projection
let projection = d3.geoEquirectangular();
let geopath = d3.geoPath().projection(projection);
let svg = d3
    .select("svg#map_")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 1000 500");

var color_data = [{"color":"#E0E9F5","value":100},{"color":"#C6DBEE","value":300},{"color":"#9DCAE1","value":24000},{"color":"#6AAFD6","value":32000},{"color":"#4292C4","value":40000},{"color":"#2171B3","value":48000},{"color":"#09519C","value":56000},{"color":"#093067","value":64000}]

// Helper Functions for slider //
function sortDate(dates) {
    newdate=dates.sort((a, b) => a - b);
    return newdate;
}

function zip_sort(dates,cases,coords) {
    sort_all = []
    let keys = Array.from(dates.keys()).sort((a, b) => dates[a] - dates[b])
    newdates = keys.map(i => dates[i]),
    newCases = keys.map(i => cases[i]),
    newCoords = keys.map(i => coords[i]);;
    sort_all.push(newCases);
    sort_all.push(newCoords);
    return (sort_all)
}


function create_dateSlider(sorted_date,coordinates_data){
    // plotting the bubbles on the map 
    var formatDateIntoYear = d3.timeFormat("%b");
    var formatDate = d3.timeFormat("%b %Y");

    var startDate = new Date(sorted_date[0]),
        endDate = new Date(sorted_date[sorted_date.length-1]);

    var margin = {top:0, right:50, bottom:0, left:50},
        width = 960 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    ////////// slider //////////
    var svgSlider = d3.select("#slider")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height);
        
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width])
        .clamp(true);

    var slider = svgSlider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

    var label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(formatDate(startDate))
        .attr("transform", "translate(0," + (-25) + ")")


    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function(e,d) { slider.interrupt(); })
            .on("start drag", function(e,d) { update(x.invert(e.x),handle,x,label,coordinates_data)}));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDateIntoYear(d); });
    
    
    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    ////////// plot //////////

    sub_array = getGroup(coordinates_data, 0)
    drawPlot(coordinates_data,sub_array);

}


function getGroup(coordinates_data,i){
    var sub_array = [];
    coordinates_data.forEach((d) => {
        dummy = [];
        m = Object.keys(d.daily_count)
        n = Object.values(d.daily_count)
        for (let i=0;i<Object.keys(m).length;i++){
            scaled = n[i] - 0 / 100;
            temp = {"month":m[i], "num":scaled}  
            dummy.push(temp) 
        }
        groupKey = 0;
        groups = dummy.reduce(function (r, o) {
        var m = o.month.split(('-'))[1];
        (r[m])? r[m].data.push(o) : r[m] = {group: String(groupKey++), data: [o]};
        return r;
        }, {});

        var result = Object.keys(groups).map(function(k){ return groups[k]; });
        result[i].data.forEach((d,i) => {
            temporary = []
            temporary.push(d.num)
            if (i==0){
                sub_array.push(temporary)
            }
        })
    })
    return(sub_array)

}

function drawPlot(coordinates_data,sub_array) {
    daily_count = [];
    sub_array.forEach((d) => {
        daily_count.push([d]);
    })
    // console.log(daily_count)
    
    var dot = svg.selectAll(".dot").data(daily_count, function(d){return d});
    dot.enter().append("circle").attr("class","dot")
        .style("stroke", "gray")
        .style("fill", "black")
        .attr("cx", function(d,i){ return projection([coordinates_data[i].long, coordinates_data[i].lat])[0] })
        .attr("cy", function(d,i){ return projection([coordinates_data[i].long, coordinates_data[i].lat])[1] })
        .attr("r", function(d,i){ return parseInt(d) })
        .style("fill", function(d){ return "red" })
        .attr("stroke", function(d){ return "red" })
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)    
    dot.exit().remove();
   
}

function update(h,handle,x,label,coordinates_data) {
    // update position and text of label according to slider scale
    var formatDate = d3.timeFormat("%b %Y");
    handle.attr("cx", x(h));
    label
      .attr("x", x(h))
      .text(formatDate(h));
    
    //filter data set and redraw plot
    sub_array = getGroup(coordinates_data,new Date (formatDate(h)).getMonth())
    drawPlot(coordinates_data,sub_array);
  }

function prepare(d) {
    d.id = d.id;
    d.date = parseDate(d.date);
    return d;
}

// get longitude and latitude of countries 
function process_all_data(csv,topo,map,daily) {
    //const filteredArray = array1.filter(value => array2.includes(value));
    let countries = csv.map(d => d.Country.toLowerCase());
    let confirmed_cases_arr = csv.map(d => Math.round(d.Confirmed_Cases));
    let suspected_cases_arr = csv.map(d => Math.round(d.Suspected_Cases));
    let hopsiptalized_arr = csv.map(d => d.Hospitalized);
    let travel_yes_arr = csv.map(d => Math.round(d.Travel_History_Yes));
    let travel_no_arr = csv.map(d => Math.round(d.Travel_History_No));
    
    data= []
    dataset = []
    let indx = []
    let topo_countries = topo.ref_country_codes.map(d => d.country.toLowerCase());
    let map_countries = map.features.map(d => d.properties.name.toLowerCase());
    let daily_countries = [] 
    daily.forEach((d) => {
        daily_countries.push(Object.values(d)[0].toLowerCase())
        dates = Object.keys(d);
        dates = dates.slice(1,Object.keys(d).length-1)    
    });
    countries.forEach((d, idx) => {
        if (topo_countries.indexOf(d)!=-1 && map_countries.indexOf(d)!=-1 && daily_countries.indexOf(d)!=-1){
            data.push(d);
            indx.push(idx);
        }});
    

    sorted_date = sortDate(dates)

    data.forEach((d, idx) => {
        temp = {}
        topo_id = topo_countries.indexOf(d)
        map_id = map_countries.indexOf(d)
        daily_id = daily_countries.indexOf(d)
        temp["lat"] = topo.ref_country_codes[topo_id].latitude
        temp["long"] = topo.ref_country_codes[topo_id].longitude
        temp["features"] = map.features[map_id]
        temp["country"] = d
        test = daily[daily_id]
        temp["daily_count"] = Object.fromEntries(Object.entries(test).slice(1, Object.entries(test).length))
        const max = Math.max.apply(Math, confirmed_cases_arr);
        const min = Math.min.apply(Math, confirmed_cases_arr);
        temp['confirmed_cases_norm']=((confirmed_cases_arr[indx[idx]]-min)/(max-min));
        temp["confirmed_cases"] = confirmed_cases_arr[indx[idx]]
        temp["suspected_cases"] = suspected_cases_arr[indx[idx]]
        dataset.push(temp)
    })

    return [dataset, data, sorted_date]
}
// End Helper Functions for slider //

// Helper Functions for map color //

function fill_color(total_case){
    var ticks =  color_data.map(d => parseInt(d.value));
    var color = color_data.map(d => d.color);
    var fill="";
    if (total_case<10){
        fill = color[0]
    }else if (total_case>=10 && total_case<100){
        fill = color[1]
    }else if (total_case>=100 && total_case<300){
        fill = color[2]
    }else if (total_case>=300 && total_case<500){
        fill = color[3]
    }else if (total_case>=500 &&total_case<700){
        fill = color[4]
    }else if (total_case>=700 &&total_case<900){
        fill = color[5]
    }else if (total_case>=900 && total_case<1000){
        fill = color[6]
    }
    return fill;
   
}  
// End of helper function for colors // 

draw_choropleth();


function draw_choropleth(){
    Promise.all([d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"), d3.csv("https://raw.githubusercontent.com/crystaltys/CSC3007-project/main/infection.csv"),d3.json("https://raw.githubusercontent.com/eesur/country-codes-lat-long/master/country-codes-lat-long-alpha3.json"),
                 d3.csv("https://raw.githubusercontent.com/crystaltys/CSC3007-project/main/daily_cases.csv")]).then((data) => {
        
        let map = data[0];
        let csv = data[1];
        // for bubble_sort need the longitude and latitude 
        let topo = data[2];
        let daily = data[3];

        
        // Sort dates
        // Sort dataset for bubble map
        dataset = process_all_data(csv,topo,map,daily);
        process_data = dataset[0];
        countries = dataset[1];

        tooltip = d3.select(".tooltips")
        svg.append("g")
            .attr("id", "districts")
            .selectAll("path")
            .data(map.features)
            .enter()
            .append("path")
            .attr("class", function(d) { return d.properties.name })
            .attr("fill", function(d,i) {
                let color ="";
                let country = d.properties.name.toLowerCase();
                let idx = countries.indexOf(country);
                if (idx===-1 || idx>process_data.length){
                    color = "#D7DCFC";
                }else{
                    color =  String(fill_color(process_data[idx].confirmed_cases));

                }
                return (color);
            })
            .attr("d",  d => geopath(d))
            .style("stroke", "#1B1B1B")
            .style('stroke-width', '2px')
            .on("mouseover", function(e, d){
                let country = d.properties.name.toLowerCase();
                let idx = countries.indexOf(country);
                if (idx===-1 || idx>process_data.length){
                    cfm_val = 0
                    sus_val = 0
                }else{
                    cfm_val = process_data[idx].confirmed_cases
                    sus_val = process_data[idx].suspected_cases
                }
                tooltip.transition()     
                .duration(200)      
                .style("opacity", .9);  
                tooltip.html("<div id='country'>" + country + "</div> <div id='sus_cases'> sus_cases:" + sus_val + "</div> <div id='cfm_cases'> cfm_cases:"  +cfm_val+ "</div>")
                        .style("visibility", "visible") // make the tooltip visible on hover
                        .style("top", e.pageY + "px") // position the tooltip with its top at the same pixel location as the mouse on the screen
                        .style("left", e.pageX + "px");     
            })
            .on("mouseout", function(e, d) {
                tooltip.transition()
                       .duration(200)
                       .style("opacity", 0)
                d3.select("#country").text("");
                d3.select("#sus_cases").text("");
                d3.select("#cfm_cases").text("");
            
            })
        create_dateSlider(dataset[2],process_data);
        lengends_ticks = [10,30,100,300,1000,3000,10000]
        legend({color: d3.scaleThreshold(
            lengends_ticks,
                d3.schemeBlues[8]
            ),
            title: "No data",
            tickSize: 0,
            width: 500, 
            height:  50 
        });
              
    })
    
};

// Libraries
function legend({
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
        .join("rect")
        .attr("x", function(d,i){console.log(x(i -1)); return x(i - 1)})
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

        svg.append("g")
        .selectAll("rect")
        .data([5])
        .join("rect")
        .attr("x", function(d,i){console.log(x(i -1)); return -50})
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