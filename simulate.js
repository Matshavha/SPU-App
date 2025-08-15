// ✅ simulate.js with embedded tariff data and VAT inclusion

// Embedded tariff data as JSON
const tariffData = [
  {
    "Tariff": "Businessrate 1",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/POD/day]": 20.34,
    "Service and Administration Charge [R/POD/day]": 14.70,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/POD/day]": 1.98
  },
  {
    "Tariff": "Businessrate 2",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/POD/day]": 30.21,
    "Service and Administration Charge [R/POD/day]": 14.70,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/POD/day]": 2.95
  },
  {
    "Tariff": "Businessrate 3",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/POD/day]": 75.38,
    "Service and Administration Charge [R/POD/day]": 14.70,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/POD/day]": 7.37
  },
  {
    "Tariff": "Businessrate 4",
    "Energy Charge [c/kWh]": 350.09,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 14.54,
    "Network Capacity Charge [R/POD/day]": null,
    "Service and Administration Charge [R/POD/day]": null,
    "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
    "Generation Capacity Charge [R/POD/day]": 0.00
  },
  {
    "Tariff": "Homepower 1",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/POD/day]": 12.13,
    "Service and Administration Charge [R/POD/day]": 3.27,
    "Generation Capacity Charge [R/POD/day]": 0.72
  },
  {
    "Tariff": "Homepower 2",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/POD/day]": 27.07,
    "Service and Administration Charge [R/POD/day]": 3.27,
    "Generation Capacity Charge [R/POD/day]": 1.27
  },
  {
    "Tariff": "Homepower 3",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/POD/day]": 57.82,
    "Service and Administration Charge [R/POD/day]": 3.27,
    "Generation Capacity Charge [R/POD/day]": 3.1
  },
  {
    "Tariff": "Homepower 4",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/POD/day]": 8.35,
    "Service and Administration Charge [R/POD/day]": 3.27,
    "Generation Capacity Charge [R/POD/day]": 0.47
  },
  {
    "Tariff": "Homepower Bulk",
    "Energy Charge [c/kWh]": 268.78,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 26.37,
    "Network Capacity Charge [R/POD/day]": 8.35,
    "Service and Administration Charge [R/POD/day]": 3.27,
    "Generation Capacity Charge [R/POD/day]": 4.48
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
    "Network Capacity Charge [R/POD/day]": 62.2,
    "Service and Administration Charge [R/POD/day]": 24.5,
    "Generation Capacity Charge [R/POD/day]": 2.71
  },
  {
    "Tariff": "Landrate 2",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/POD/day]": 96.99,
    "Service and Administration Charge [R/POD/day]": 24.5,
    "Generation Capacity Charge [R/POD/day]": 5.37
  },
  {
    "Tariff": "Landrate 3",
    "Energy Charge [c/kWh]": 224.93,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/POD/day]": 155.32,
    "Service and Administration Charge [R/POD/day]": 24.5,
    "Generation Capacity Charge [R/POD/day]": 10.5
  },
  {
    "Tariff": "Landrate 4",
    "Energy Charge [c/kWh]": 369.32,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Netword Demand Charge [c/kWh]": 61.66,
    "Network Capacity Charge [R/POD/day]": 45.92,
    "Generation Capacity Charge [R/POD/day]": 1.78
  },
  {
    "Tariff": "LandrateDx*",
    "Service and Administration Charge [R/POD/day]": 87
  },
  {
    "Tariff": "Landlight 20A",
    "Energy Charge [c/kWh]": 603.54
  },
  {
    "Tariff": "Landlight 60A",
    "Energy Charge [c/kWh]": 836
  },
  {
    "Tariff": "Municrate 1",
    "Energy Charge [c/kWh]": 229.79,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Network Demand Charge [c/kWh]": 43.60,
    "Network Capacity Charge [R/POD/day]": 34.06,
    "Service and Administration Charge [R/POD/day]": 18.81,
    "Generation Capacity Charge [R/POD/day]": 2.17
  },
  {
    "Tariff": "Municrate 2",
    "Energy Charge [c/kWh]": 229.79,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Network Demand Charge [c/kWh]": 43.60,
    "Network Capacity Charge [R/POD/day]": 69.01,
    "Service and Administration Charge [R/POD/day]": 18.81,
    "Generation Capacity Charge [R/POD/day]": 4.01
  },
  {
    "Tariff": "Municrate 3",
    "Energy Charge [c/kWh]": 229.79,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Network Demand Charge [c/kWh]": 43.60,
    "Network Capacity Charge [R/POD/day]": 138.21,
    "Service and Administration Charge [R/POD/day]": 18.81,
    "Generation Capacity Charge [R/POD/day]": 8.46
  },
  {
    "Tariff": "Municrate 4",
    "Energy Charge [c/kWh]": 349.28,
    "Ancillary Service Charge [c/kWh]": 0.41,
    "Network Demand Charge [c/kWh]": 43.60,
    "Network Capacity Charge [R/POD/day]": null,
    "Service and Administration Charge [R/POD/day]": null,
    "Generation Capacity Charge [R/POD/day]": null
  }
];

const VAT_RATE = 0.15;

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
    let subtotal = 0;

    for (const key in selectedTariff) {
      const value = parseFloat(selectedTariff[key]);
      if (!isNaN(value) && value > 0) {
        let charge = 0;
        let unit = key.match(/\[(.*?)\]/)?.[1] || '';

        if (unit === 'c/kWh') {
          charge = (value / 100) * energy;
        } else if (unit === 'R/POD/day') {
          // Apportion the daily per-POD rate across the number of PODs
          const podsCount = Math.max(1, Number.isFinite(pods) ? pods : 1);
          charge = (value / podsCount) * days;
       }

        const chargeWithVAT = charge * (1 + VAT_RATE);
        subtotal += chargeWithVAT;

        breakdown.push({
          name: key.split('[')[0].trim(),
          unit,
          rate: value,
          charge: chargeWithVAT
        });
      }
    }

    const vatAmount = subtotal / (1 + VAT_RATE) * VAT_RATE;

    output.innerHTML = `
  <h2 style="margin-bottom: 10px;">Bill Breakdown (VAT Inclusive)</h2>
  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 10px;">
      <thead style="background-color: #f9f9f9;">
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ccc;">Charge Type</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ccc;">Rate (Incl. VAT)</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ccc;">Amount (Incl. VAT)</th>
        </tr>
      </thead>
      <tbody>
        ${breakdown.map(item => {
          const rateWithVAT = item.rate * (1 + VAT_RATE);
          const rateDisplay = item.unit === 'c/kWh'
            ? `${rateWithVAT.toFixed(2)} c/kWh`
            : `${formatRands(rateWithVAT)} R/POD/day`;

          return `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${rateDisplay}</td>
              <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${formatRands(item.charge)}</td>
            </tr>`;
        }).join('')}
        <tr style="background-color: #e7f4ea;">
          <td colspan="2" style="padding: 12px; text-align: right; font-size: 1.1em; font-weight: bold;">Total (Incl. VAT)</td>
          <td style="padding: 12px; text-align: right; font-size: 1.1em; font-weight: bold;">
            ${formatRands(subtotal)}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p style="font-style: italic; color: #555;">All rates and amounts include VAT at 15%.</p>
`;
  });
});




