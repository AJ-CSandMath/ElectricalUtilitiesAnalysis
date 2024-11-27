import { formatCurrency } from './utilities.js';

async function initUtilitiesTable() {
    try {
        const response = await fetch('http://localhost:3000/api/utilities');
        const { data: utilities } = await response.json();
        
        const coverageResponse = await fetch('http://localhost:3000/api/service-areas');
        const { data: serviceAreas } = await coverageResponse.json();

        // Create state selector
        const states = [...new Set(serviceAreas.map(area => area.state))].sort();
        const stateSelect = document.createElement('select');
        stateSelect.id = 'state-selector';
        stateSelect.innerHTML = `
            <option value="">Select a state...</option>
            ${states.map(state => `<option value="${state}">${state}</option>`).join('')}
        `;

        const tableContainer = document.querySelector('.data-table');
        tableContainer.insertBefore(stateSelect, tableContainer.firstChild);

        // State change handler
        stateSelect.addEventListener('change', (e) => {
            const selectedState = e.target.value;
            if (!selectedState) {
                clearTable();
                return;
            }
            updateTableForState(selectedState, utilities, serviceAreas);
        });

        function clearTable() {
            const tbody = document.querySelector('#utilities-table tbody');
            tbody.innerHTML = '<tr><td colspan="4">Select a state to view utilities</td></tr>';
        }

        function updateTableForState(state, utilities, serviceAreas) {
            // Get utilities operating in this state
            const stateUtilities = new Map();
            
            serviceAreas
                .filter(area => area.state === state)
                .forEach(area => {
                    const utility = utilities.find(u => u.eiaid === area.eiaid);
                    if (!utility) return;

                    if (!stateUtilities.has(area.eiaid)) {
                        stateUtilities.set(area.eiaid, {
                            company: utility.utility_name,
                            types: new Set([utility.ownership]),
                            zipCount: 1
                        });
                    } else {
                        const data = stateUtilities.get(area.eiaid);
                        data.types.add(utility.ownership);
                        data.zipCount++;
                    }
                });

            // Convert to array and sort by company name
            const rows = Array.from(stateUtilities.values())
                .sort((a, b) => a.company.localeCompare(b.company));

            const tbody = document.querySelector('#utilities-table tbody');
            tbody.innerHTML = rows.map(row => `
                <tr>
                    <td>${row.company}</td>
                    <td>${state}</td>
                    <td>${Array.from(row.types).join(', ')}</td>
                    <td>${row.zipCount} zip codes</td>
                </tr>
            `).join('');
        }

        // Initial clear
        clearTable();

    } catch (error) {
        console.error('Error loading utilities table:', error);
        const tbody = document.querySelector('#utilities-table tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="error-message">
                    Error loading utility data. Please try again later.
                </td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initUtilitiesTable); 