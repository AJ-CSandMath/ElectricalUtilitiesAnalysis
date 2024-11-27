import { formatCurrency } from './utilities.js';

async function initRateAnalysis() {
    const response = await fetch('http://localhost:3000/api/utilities/coverage');
    const data = await response.json();
    
    const states = Object.keys(data).sort();
    const multiselect = document.getElementById('state-multiselect');
    
    // Add options
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        option.selected = true;  // All selected by default
        multiselect.appendChild(option);
    });

    // Update display when selection changes
    multiselect.addEventListener('change', () => {
        const selectedStates = Array.from(multiselect.selectedOptions).map(opt => opt.value);
        updateDisplay(selectedStates);
    });

    function updateDisplay(selectedStates) {
        const rateChart = document.getElementById('rate-chart');
        
        let allRates = selectedStates.map(state => ({
            state,
            ...data[state].avgRates
        }));

        rateChart.innerHTML = `
            <table class="rate-table">
                <thead>
                    <tr>
                        <th>State</th>
                        <th>Residential</th>
                        <th>Commercial</th>
                        <th>Industrial</th>
                    </tr>
                </thead>
                <tbody>
                    ${allRates.map(rate => `
                        <tr>
                            <td>${rate.state}</td>
                            <td>${formatCurrency(rate.residential)}/kWh</td>
                            <td>${formatCurrency(rate.commercial)}/kWh</td>
                            <td>${formatCurrency(rate.industrial)}/kWh</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Initial display
    updateDisplay(states);

    document.getElementById('select-all').addEventListener('click', () => {
        const options = multiselect.options;
        for (let i = 0; i < options.length; i++) {
            options[i].selected = true;
        }
        updateDisplay(states);
    });

    document.getElementById('unselect-all').addEventListener('click', () => {
        const options = multiselect.options;
        for (let i = 0; i < options.length; i++) {
            options[i].selected = false;
        }
        updateDisplay([]);
    });
}

document.addEventListener('DOMContentLoaded', initRateAnalysis); 