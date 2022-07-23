let legends = [
    { label: 'No Data', color: '#bcbcbc' },
    { label: 0, color: '#ffedc9' },
    { label: 3, color: '#ffe7b6' },
    { label: 10, color: '#ffd276' },
    { label: 30, color: '#ffbf3c' },
    { label: 110, color: '#f9b428' }
]

let width = "100%";
let height = "100%";
let rectSize = 25;

let svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 1000 600`);

var country_data = [];
let allCountries = [];
let countryWithData = [];
let countryWithNoData = [];

const infection = (data) => {
    country_data.push(data);
    countryWithData.push(`.${data.Country}`)
}
d3.csv("infection.csv", infection);


// Map and projection
let projection = d3.geoEquirectangular();

let geopath = d3.geoPath().projection(projection);

// THE BACKGROUND OCEAN
// svg
//   .append("path")
//   .datum({ type: "Sphere" })
//   .attr("id", "ocean")
//   .attr("d", geopath)
//   .attr("fill", "lightBlue");

// THE CITY CIRCLES
svg.append("g")
    .attr("id", "cities")
    .selectAll("circle")
    .data(cities)
    .enter().append("circle")
    .attr("r", 5)
    .attr("cx", d => projection([d.longitude, d.latitude])[0])
    .attr("cy", d => projection([d.longitude, d.latitude])[1]);

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
    allCountries = data.features.map(cty => `.${cty.properties.name}`);


    countryWithNoData = allCountries.filter(function(val) {
        return countryWithData.indexOf(val) == -1;
    });

    // THE MAP
    svg
        .append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", function(d) { return `${d.properties.name} country` })
        .attr("fill", function(d) {
            let ctry = (country_data.find(ctry => ctry.Country === d.properties.name));
            let color = '#eee';
            if (ctry) {
                let confirmedCaseInCtry = ctry.Confirmed_Cases;
                if (confirmedCaseInCtry > legends[1].label && confirmedCaseInCtry < legends[2].label) { color = '#ffedc9' } else if (confirmedCaseInCtry > legends[2].label && confirmedCaseInCtry < legends[3].label) { color = '#ffd276' } else if (confirmedCaseInCtry > legends[3].label && confirmedCaseInCtry < legends[4].label) { color = '#ffbf3c' } else if (confirmedCaseInCtry > legends[4].label && confirmedCaseInCtry < legends[5].label) { color = '#f9b428' } else if (confirmedCaseInCtry > legends[5].label) { color = '#f9b428' }
            }
            return (color)
        })
        .attr("d", (d) => geopath(d))
        .style("stroke", "transparent")
        .on("mouseover", (event, d) => {
            const country = d.properties.name

            var selected = {}
            country_data.map((count) => {
                if (country === count.Country) {
                    selected = count;
                }
            })

            d3.select(".tooltip")
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px");
            d3.select(".name")
                .text(`${d.properties.name}`);
            d3.select(".confirm").text(`Confirmed Cases: ${selected.Confirmed_Cases ?? 0}`);
            d3.select(".suspect").text(`Suspected Cases: ${selected.Suspected_Cases ?? 0}`);
        })
        .on("mouseout", (event, d) => {
            d3.select(".name").text("");
            d3.select(".confirm").text("");
            d3.select(".suspect").text("");
        });
});

function findAllCountryWithConfirmCases(confirmedCases) {

    let indexOfLeg = legends.findIndex(leg => leg.label === confirmedCases);

    let confirmedCountry = []
    if (confirmedCases === 'No Data') {
        confirmedCountry = countryWithNoData;
    } else {
        let filterData = country_data.filter(
            (indexOfLeg === legends.length - 1) ? (ctry => ctry.Confirmed_Cases >= confirmedCases) :
            (ctry => ctry.Confirmed_Cases >= confirmedCases && ctry.Confirmed_Cases < legends[indexOfLeg + 1].label)
        );
        confirmedCountry = filterData.map(ctry => `.${ctry.Country}`)
    }

    return confirmedCountry;
}

// LEGENDS
let legendsD = svg.append("g")
    .attr("id", "legends");

// LEGENDS RECT
legendsD
    .selectAll("rect")
    .data(legends)
    .enter().append("rect")
    .attr("x", function(d, i) { return (i === 0 ? 250 : 350) + i * (rectSize * 2) })
    .attr("y", function(d, i) { return 500 + (rectSize + 5) })
    .attr("width", rectSize * 2)
    .attr("height", rectSize)
    .style("fill", function(d) { return (d.color) })
    .on("mouseover", (event, d) => {
        let classArray = findAllCountryWithConfirmCases(d.label);
        d3.selectAll(".country")
            .transition()
            .duration(200)
            .style("opacity", .2)
            .style("stroke", "transparent");


        d3.selectAll(classArray.toString())
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", 'black');
    })
    .on("mouseout", (event, d) => {
        let classArray = findAllCountryWithConfirmCases(d.label);

        d3.selectAll(".country")
            .transition()
            .duration(200)
            .style("opacity", .8)

        d3.selectAll(classArray.toString())
            .transition()
            .duration(200)
            .style("stroke", "transparent")
    });

// LEGENDS TEXT
legendsD
    .selectAll("text")
    .data(legends)
    .enter()
    .append("text")
    .text(function(d) { return (d.label) })
    .attr("text-anchor", "left")
    .attr("x", function(d, i) { return (i === 0 ? 250 : 350) + i * (rectSize * 2) })
    .attr("y", function(d, i) { return 500 + (rectSize) })