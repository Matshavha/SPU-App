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

document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('category');
  const container = document.getElementById('tariffContainer');
  const educationBox = document.getElementById('educationBox');

  categorySelect.addEventListener('change', () => {
    const category = categorySelect.value;
    container.innerHTML = '';
    educationBox.style.display = category ? 'block' : 'none';

const relevantTariffs = tariffData.filter(t => {
  if (category === 'Businessrate') return t.Tariff.startsWith('Businessrate');
  if (category === 'Homepower') return t.Tariff.startsWith('Homepower');
  if (category === 'Landrate') return t.Tariff.startsWith('Landrate');
  if (category === 'Homelight') return t.Tariff.startsWith('Homelight');
  if (category === 'Landlight') return t.Tariff.startsWith('Landlight');
  return false;
});

if (relevantTariffs.length === 0) {
  container.innerHTML = '<p style="text-align:center;">No tariffs found for this category.</p>';
  return;
}

relevantTariffs.forEach(tariff => {
  const card = document.createElement('div');
  card.className = 'tariff-card';

  const title = document.createElement('h3');
  title.textContent = tariff.Tariff;
  card.appendChild(title);

  const table = document.createElement('table');
  table.classList.add('tariff-table');
  const tbody = document.createElement('tbody');

  for (const key in tariff) {
    if (key === 'Tariff') continue;
    const value = tariff[key];
    if (value == null) continue;

    const unit = key.match(/\[(.*?)\]/)?.[1] || '';
    const label = key.split('[')[0].trim();
    const rateWithVAT = unit === 'c/kWh'
      ? `${(value * (1 + VAT_RATE)).toFixed(2)} c/kWh`
      : `R ${(value * (1 + VAT_RATE)).toFixed(2)} /Pod/Day`;

    const row = document.createElement('tr');
    row.innerHTML = `<td>${label}</td><td>${rateWithVAT}</td>`;
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  card.appendChild(table);
  container.appendChild(card);
    });
  });
});

