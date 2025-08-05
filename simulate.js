// ✅ simulate.js with embedded tariff data

// Embedded tariff data as JSON
const tariffData = [
  {
    "Tariff": "Businessrate 1",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/Pod/Day]": 20.34,
    "Service and Administration Charge [R/Pod/Day]": 14.70,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/Pod/Day]": 1.98
  },
  {
    "Tariff": "Businessrate 2",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/Pod/Day]": 30.21,
    "Service and Administration Charge [R/Pod/Day]": 14.70,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/Pod/Day]": 2.95
  },
  {
    "Tariff": "Businessrate 3",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/Pod/Day]": 75.38,
    "Service and Administration Charge [R/Pod/Day]": 14.70,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/Pod/Day]": 7.37
  },
  {
    "Tariff": "Businessrate 4",
    "Energy Charge [c/kWh]": 350.09,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/Pod/Day]": null,
    "Service and Administration Charge [R/Pod/Day]": null,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/Pod/Day]": 0.00
  },
  {
    "Tariff": "Homepower 1",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/Pod/Day]": 12.13,
    "Service and Administration Charge [R/Pod/Day]": 3.27,
    "Generation Capacity Charge [R/Pod/Day]": 0.72
  },
  {
    "Tariff": "Homepower 2",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/Pod/Day]": 27.07,
    "Service and Administration Charge [R/Pod/Day]": 3.27,
    "Generation Capacity Charge [R/Pod/Day]": 1.27
  },
  {
    "Tariff": "Homepower 3",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/Pod/Day]": 57.82,
    "Service and Administration Charge [R/Pod/Day]": 3.27,
    "Generation Capacity Charge [R/Pod/Day]": 3.1
  },
  {
    "Tariff": "Homepower 4",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/Pod/Day]": 8.35,
    "Service and Administration Charge [R/Pod/Day]": 3.27,
    "Generation Capacity Charge [R/Pod/Day]": 0.47
  },
  {
    "Tariff": "Homepower Bulk",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/Pod/Day]": 8.35,
    "Service and Administration Charge [R/Pod/Day]": 3.27,
    "Generation Capacity Charge [R/Pod/Day]": 4.48
  },
  {
    "Tariff": "Homelight 20A",
    "Energy Charge [c/kWh]": 216.11
  },
  {
    "Tariff": "Homelight 60A",
    "Energy Charge [c/kWh]": 274.72
  },
  {
    "Tariff": "Landrate 1",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/Pod/Day]": 62.2,
    "Service and Administration Charge [R/Pod/Day]": 24.5,
    "Generation Capacity Charge [R/Pod/Day]": 2.71
  },
  {
    "Tariff": "Landrate 2",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/Pod/Day]": 96.99,
    "Service and Administration Charge [R/Pod/Day]": 24.5,
    "Generation Capacity Charge [R/Pod/Day]": 5.37
  },
  {
    "Tariff": "Landrate 3",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/Pod/Day]": 155.32,
    "Service and Administration Charge [R/Pod/Day]": 24.5,
    "Generation Capacity Charge [R/Pod/Day]": 10.5
  },
  {
    "Tariff": "Landrate 4",
    "Energy Charge [c/kWh]": 369.32,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/Pod/Day]": 45.92,
    "Generation Capacity Charge [R/Pod/Day]": 1.78
  },
  {
    "Tariff": "LandrateDx*",
    "Service and Administration Charge [R/Pod/Day]": 87
  },
  {
    "Tariff": "Landlight 20A",
    "Energy Charge [c/kWh]": 603.54
  },
  {
    "Tariff": "Landlight 60A",
    "Energy Charge [c/kWh]": 836
  }
];

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

function formatRands(value) {
  return `R ${value.toFixed(2)}`;
}

function formatCents(value) {
  return `R ${(value / 100).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('billForm');
  const output = document.getElementById('billOutput');
  const tariffSelect = document.getElementById('tariff');

  tariffData.forEach(t => {
    const option = document.createElement('option');
    option.value = t['Tariff'];
    option.textContent = t['Tariff'];
    tariffSelect.appendChild(option);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const selectedTariff = tariffData.find(t => t['Tariff'] === tariffSelect.value);
    const energy = parseFloat(document.getElementById('energy').value);
    const pods = parseInt(document.getElementById('pods').value);
    const days = daysBetween(document.getElementById('start').value, document.getElementById('end').value);

    const breakdown = [];
    let total = 0;

    for (const key in selectedTariff) {
      const value = parseFloat(selectedTariff[key]);
      if (!isNaN(value) && value > 0) {
        let charge = 0;
        let unit = key.match(/\[(.*?)\]/)?.[1] || '';

        if (unit === 'c/kWh') {
          charge = (value / 100) * energy;
        } else if (unit === 'R/Pod/Day') {
          charge = value * pods * days;
        }

        total += charge;
        breakdown.push({ name: key.split('[')[0].trim(), unit, rate: value, charge });
      }
    }

    output.innerHTML = `
      <h2>Bill Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Charge Type</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${breakdown.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.unit}</td>
              <td>${item.unit === 'c/kWh' ? formatCents(item.rate) : formatRands(item.rate)}</td>
              <td>${formatRands(item.charge)}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold;">
            <td colspan="3">Total</td>
            <td>${formatRands(total)}</td>
          </tr>
        </tbody>
      </table>
    `;
  });
});
