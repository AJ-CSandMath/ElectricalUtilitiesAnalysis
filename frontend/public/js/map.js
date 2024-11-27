import { formatCurrency } from './utilities.js';

// Add state mapping at the top of the file
const stateMapping = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

async function initMap() {
    try {
        const width = document.getElementById('map-container').offsetWidth;
        const height = 500;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        
        const projection = d3.geoAlbersUsa()
            .scale(width)
            .translate([width / 2, height / 2]);
        const path = d3.geoPath().projection(projection);

        const svg = d3.select('#map-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Add tooltip div with styling
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('background', 'white')
            .style('padding', '10px')
            .style('border', '1px solid #ddd')
            .style('border-radius', '4px')
            .style('font-size', '14px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

        // Load data
        const us = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
        const response = await fetch('http://localhost:3000/api/utilities/coverage');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const utilityData = await response.json();

        // Calculate weighted rates for coloring
        const stateRates = {};
        Object.entries(utilityData).forEach(([state, data]) => {
            if (data && typeof data.weightedRate === 'number') {
                stateRates[state] = data.weightedRate;
            }
        });

        // Create color scale based on weighted rates
        const colorScale = d3.scaleQuantile()
            .domain(Object.values(stateRates))
            .range(d3.quantize(
                t => d3.interpolateBlues(0.2 + (t * 0.8)),
                9
            ));

        // Debug the data
        console.log('State rates:', stateRates);
        console.log('Color scale domain:', colorScale.domain());

        // Add legend
        const legendWidth = 200;
        const legendHeight = 10;
        
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - legendWidth - margin.right}, ${margin.top})`);

        // Create gradient for legend
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'rate-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%');

        linearGradient.selectAll('stop')
            .data(d3.range(0, 1.1, 0.1))
            .enter()
            .append('stop')
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => colorScale(d3.min(Object.values(stateRates)) + 
                d * (d3.max(Object.values(stateRates)) - d3.min(Object.values(stateRates)))));

        // Add legend rectangle
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#rate-gradient)');

        // Add legend labels
        legend.append('text')
            .attr('y', -5)
            .style('text-anchor', 'start')
            .text('Weighted Average Rate ($/kWh)');

        legend.append('text')
            .attr('x', 0)
            .attr('y', legendHeight + 15)
            .style('text-anchor', 'start')
            .text(formatCurrency(d3.min(Object.values(stateRates))));

        legend.append('text')
            .attr('x', legendWidth)
            .attr('y', legendHeight + 15)
            .style('text-anchor', 'end')
            .text(formatCurrency(d3.max(Object.values(stateRates))));

        // Draw states
        svg.append('g')
            .selectAll('path')
            .data(topojson.feature(us, us.objects.states).features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'state')
            .style('fill', d => {
                const stateAbbr = stateMapping[d.properties.name];
                const rate = utilityData[stateAbbr]?.weightedRate;
                console.log(`State: ${stateAbbr}, Rate: ${rate}, Color: ${rate ? colorScale(rate) : '#ddd'}`);
                return rate ? colorScale(rate) : '#ddd';
            })
            .style('stroke', '#fff')
            .on('mouseover', (event, d) => {
                const fullStateName = d.properties.name;
                const stateAbbr = stateMapping[fullStateName];
                const data = utilityData[stateAbbr];
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                
                tooltip.html(`
                    <strong>${fullStateName} (${stateAbbr})</strong><br/>
                    Utilities: ${data?.utilities || 'N/A'}<br/>
                    Avg. Residential Rate: ${data?.avgRates?.residential ? formatCurrency(data.avgRates.residential) : 'N/A'}/kWh<br/>
                    Avg. Commercial Rate: ${data?.avgRates?.commercial ? formatCurrency(data.avgRates.commercial) : 'N/A'}/kWh<br/>
                    Avg. Industrial Rate: ${data?.avgRates?.industrial ? formatCurrency(data.avgRates.industrial) : 'N/A'}/kWh
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

    } catch (error) {
        console.error('Error initializing map:', error);
        const container = document.getElementById('map-container');
        container.innerHTML = `
            <div class="error-message">
                Sorry, we couldn't load the map data. Please try again later.
                <br/>
                <small>Error: ${error.message}</small>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initMap); 