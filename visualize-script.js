/*
* This file is licensed under the GPLv3 License Copyright (c) 2025 Sam Groveman
* Contributors: Sam Groveman
* 
* With help from: https://stackoverflow.com/questions/68779019/d3-how-to-create-multiple-line-charts-from-an-array-of-objects
* and https://stackoverflow.com/questions/75686681/display-data-from-multiple-columns-from-a-csv-file-in-d3-js
* and https://d3-graph-gallery.com/graph/line_smallmultiple.html
*/

// Set the dimensions and margins of the graph
const margin = {top: 30, right: 0, bottom: 30, left: 50},
	width = 310 - margin.left - margin.right,
	height = 310 - margin.top - margin.bottom;

let color_index = 0;
let container;

// Color palette
const color = d3.scaleOrdinal().range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#bdbd0bff','#a65628','#f781bf','#999999']);

// Run code when page DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	container = document.getElementById("graphs");
	document.getElementById("refresh").onclick = function() {
		container.innerHTML = "";
		color_index = 0;
		loadData();
	};
	loadData();
});

function loadData() {
	// Load the data
	d3.text("/download?path=/data/Data.csv").then(function(data_raw) {
		const data = d3.csvParse(data_raw, d3.autoType);
		const keys = data.columns.slice(1);

		// Parse the data
		const aggregateData = data.reduce((acc,curr)=> {
			keys.forEach(key => {
				const foundKey = acc.find(d => d.value === key);
				if(foundKey) {
					foundKey.values.push({time: d3.timeParse('%Y-%m-%d %H:%M:%S')(curr.time), value: curr[key]});
					} else {
						acc.push({value: key, values: []});
						container.innerHTML += '<span class="param"></span>';
					};
				});
				return acc;
			},
		[]);

		// Add graphs to each span element created above
	   	d3.selectAll(".param").data(aggregateData).each(lineChart);
	});
}

// Adds a line cart to the an element with the name and values
function lineChart({value, values}) {
	let name = value;
	const svg = d3.select(this)
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

	const dateParse = d3.timeParse('%Y-%m-%d %H:%M:%S');
	// Add X axis --> it is a date format
	const x = d3.scaleTime()
		.domain(d3.extent(values, d => d.time))
		.range([ 0, width ]);
	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x).ticks(3));

	// Add Y axis
	const y = d3.scaleLinear()
		.domain(d3.extent(values.map(v => v.value)))
		.range([ height, 0 ]);
	svg.append("g")
		.call(d3.axisLeft(y).ticks(5));

	// This allows to find the closest X index of the mouse:
	const bisect = d3.bisector(d => d.time).center;

	const focus = svg.append('g')
		.append('circle')
		.style("fill", "none")
		.attr("stroke", "black")
		.attr('r', 5.5)
		.style("opacity", 0);


	if (color_index > 8) {
		color_index = 0;
	}

	// Draw the line
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", function() { return color(color_index) })
		.attr("stroke-width", 1.9)
		.attr("d", function() {
			return d3.line()
			.x(d => x(d.time))
			.y(d => y(d.value))
			(values)
		});

	svg.append("g")
		.selectAll("dot")
		.data(values)
		.join("circle")
			.attr("cx", d => x(d.time))
			.attr("cy", d => y(d.value))
			.attr("r", 4)
			.attr("fill", function(){ return color(color_index)});

	// Add title
	svg.append("text")
		.attr("text-anchor", "start")
		.attr("y", -5)
		.attr("x", 0)
		.text(function(){ return(name)})
		.style("font-size", "0.8em")
		.style("fill", function(){ return color(color_index) });

	svg.append('rect')
		.style("fill", "none")
		.style("pointer-events", "all")
		.attr('width', width)
		.attr('height', height)
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	const focusText = svg.append('g')
		.append('text')
		.style("opacity", 0)
		.style("font-size", "0.8em")
		.attr("text-anchor", "left")
		.attr("alignment-baseline", "middle");

	function mouseover() {
		focus.style("opacity", 1)
		focusText.style("opacity",1)
	}

	function mousemove(event) {
		// Recover coordinate we need
		let x0 = x.invert(d3.pointer(event, this)[0]);
		let i = bisect(values, x0, 1);
		let selectedData = values[i]
		focus
			.attr("cx", x(selectedData.time))
			.attr("cy", y(selectedData.value))
		focusText
			.html(selectedData.value)
			.attr("x", x(selectedData.time)+15)
			.attr("y", y(selectedData.value))
	}

	function mouseout() {
		focus.style("opacity", 0)
		focusText.style("opacity", 0)
	}
		
	color_index++;
}