let width = "100%";
let height = "100%";
let svg = d3
  .select("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 1000 600`);

var country_data = []
  const infection = (data) => {
    country_data.push(data)
  }

console.log(country_data);
d3.csv("/infection.csv", infection)


// Map and projection
let projection = d3.geoEquirectangular()

let geopath = d3.geoPath().projection(projection);


// THE BACKGROUND OCEAN
// svg
//   .append("path")
//   .datum({ type: "Sphere" })
//   .attr("id", "ocean")
//   .attr("d", geopath)
//   .attr("fill", "lightBlue");


// THE GRATICULE LINES
// let graticule = d3.geoGraticule().step([10, 10]);
// svg
//   .append("g")
//   .attr("id", "graticules")
//   .selectAll("path")
//   .data([graticule()])
//   .enter()
//   .append("path")
//   .attr("d", (d) => geopath(d))
//   .attr("fill", "none")
//   .attr("stroke", "#aaa")
//   .attr("stroke-width", 0.2);

// Load GeoJSON data
d3.json(
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
).then((data) => {


  // THE MAP
  svg
    .append("g")
    .attr("id", "countries")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class", "countries")
    .attr("d", (d) => geopath(d))
    .on("mouseover", (event, d) => {
      const country = d.properties.name
      var selected = {}
      country_data.map((count) =>{
        if(country === count.Country){
          selected = count;    
        }
      })
      d3.select(".tooltip")
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px");
      d3.select(".name")
      .text(`${d.properties.name}`);
      d3.select(".confirm").text(`Confirmed Cases: ${selected.Confirmed_Cases}`);
      d3.select(".suspect").text(`Suspected Cases: ${selected.Suspected_Cases}`);
        
    })
    .on("mouseout", (event, d) => {
      d3.select(".name").text("");
      d3.select(".confirm").text("");
      d3.select(".suspect").text("");
    });
});



