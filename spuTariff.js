// 🚀 spuTariff.js
const VAT_RATE = 0.15;

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

function formatR(value) {
  return `R ${value.toFixed(2)}`;
}

function formatRate(value, unit) {
  if (unit === 'c/kWh') return `${(value * (1 + VAT_RATE)).toFixed(2)} c/kWh`;
  if (unit === 'R/Pod/Day') return formatR(value * (1 + VAT_RATE));
  return value;
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('tariffContainer');

  tariffData.forEach(tariff => {
    const card = document.createElement('div');
    card.classList.add('tariff-card');

    const title = document.createElement('h2');
    title.textContent = tariff['Tariff'];
    card.appendChild(title);

    const table = document.createElement('table');
    table.classList.add('tariff-table');

    const tbody = document.createElement('tbody');
    for (const key in tariff) {
      if (key === 'Tariff') continue;

      const value = tariff[key];
      if (value === null || value === undefined) continue;

      const match = key.match(/\[(.*?)\]/);
      const unit = match ? match[1] : '';
      const label = key.split('[')[0].trim();

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${label}</td>
        <td>${formatRate(value, unit)}</td>
      `;
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
});
