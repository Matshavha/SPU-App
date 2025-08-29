// ✅ simulate.js — now with Homeflex (TOU + Gen-offset credits) and VAT inclusion

// ---------------- VAT ----------------
const VAT_RATE = 0.15;

// ---------------- Helper funcs ----------------
function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}
function formatRands(value) { return `R ${value.toFixed(2)}`; }
function formatRateRands(value) { return `R ${value.toFixed(2)}`; }

// Count days in high (Jun–Aug) vs low (Sep–May) inside range
function seasonDaySplit(startISO, endISO) {
  const s = new Date(startISO), e = new Date(endISO);
  let high = 0, low = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const m = d.getMonth(); // 0=Jan
    if (m === 5 || m === 6 || m === 7) high += 1; else low += 1;
  }
  const total = high + low;
  return { high, low, total, fHigh: total ? high / total : 0, fLow: total ? low / total : 0 };
}

// ---------------- Embedded tariff data (yours, VAT-exclusive) ----------------
const tariffData = [
  // (unchanged) — Businessrate, Homepower, Homelight, Landrate, Landlight, Municrate
  {"Tariff":"Businessrate 1","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":14.54,"Network Capacity Charge [R/POD/day]":20.34,"Service and Administration Charge [R/POD/day]":14.70,"Electrification and Rural Network Subsidy Charge [c/kWh]":4.94,"Generation Capacity Charge [R/POD/day]":1.98},
  {"Tariff":"Businessrate 2","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":14.54,"Network Capacity Charge [R/POD/day]":30.21,"Service and Administration Charge [R/POD/day]":14.70,"Electrification and Rural Network Subsidy Charge [c/kWh]":4.94,"Generation Capacity Charge [R/POD/day]":2.95},
  {"Tariff":"Businessrate 3","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":14.54,"Network Capacity Charge [R/POD/day]":75.38,"Service and Administration Charge [R/POD/day]":14.70,"Electrification and Rural Network Subsidy Charge [c/kWh]":4.94,"Generation Capacity Charge [R/POD/day]":7.37},
  {"Tariff":"Businessrate 4","Energy Charge [c/kWh]":350.09,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":14.54,"Network Capacity Charge [R/POD/day]":null,"Service and Administration Charge [R/POD/day]":null,"Electrification and Rural Network Subsidy Charge [c/kWh]":4.94,"Generation Capacity Charge [R/POD/day]":0.00},

  {"Tariff":"Homepower 1","Energy Charge [c/kWh]":268.78,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":26.37,"Network Capacity Charge [R/POD/day]":12.13,"Service and Administration Charge [R/POD/day]":3.27,"Generation Capacity Charge [R/POD/day]":0.72},
  {"Tariff":"Homepower 2","Energy Charge [c/kWh]":268.78,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":26.37,"Network Capacity Charge [R/POD/day]":27.07,"Service and Administration Charge [R/POD/day]":3.27,"Generation Capacity Charge [R/POD/day]":1.27},
  {"Tariff":"Homepower 3","Energy Charge [c/kWh]":268.78,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":26.37,"Network Capacity Charge [R/POD/day]":57.82,"Service and Administration Charge [R/POD/day]":3.27,"Generation Capacity Charge [R/POD/day]":3.1},
  {"Tariff":"Homepower 4","Energy Charge [c/kWh]":268.78,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":26.37,"Network Capacity Charge [R/POD/day]":8.35,"Service and Administration Charge [R/POD/day]":3.27,"Generation Capacity Charge [R/POD/day]":0.47},

  {"Tariff":"Homepower Bulk","Energy Charge [c/kWh]":268.78,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":26.37,"Network Capacity Charge [R/POD/day]":8.35,"Service and Administration Charge [R/POD/day]":3.27,"Generation Capacity Charge [R/POD/day]":4.48},

  {"Tariff":"Homelight 20A","Energy Charge [c/kWh]":216.11},
  {"Tariff":"Homelight 60A","Energy Charge [c/kWh]":274.72},

  {"Tariff":"Landrate 1","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":61.66,"Network Capacity Charge [R/POD/day]":62.2,"Service and Administration Charge [R/POD/day]":24.5,"Generation Capacity Charge [R/POD/day]":2.71},
  {"Tariff":"Landrate 2","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":61.66,"Network Capacity Charge [R/POD/day]":96.99,"Service and Administration Charge [R/POD/day]":24.5,"Generation Capacity Charge [R/POD/day]":5.37},
  {"Tariff":"Landrate 3","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":61.66,"Network Capacity Charge [R/POD/day]":155.32,"Service and Administration Charge [R/POD/day]":24.5,"Generation Capacity Charge [R/POD/day]":10.5},
  {"Tariff":"Landrate 4","Energy Charge [c/kWh]":369.32,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":61.66,"Network Capacity Charge [R/POD/day]":45.92,"Generation Capacity Charge [R/POD/day]":1.78},
  {"Tariff":"LandrateDx*","Service and Administration Charge [R/POD/day]":87},

  {"Tariff":"Landlight 20A","Energy Charge [c/kWh]":603.54},
  {"Tariff":"Landlight 60A","Energy Charge [c/kWh]":836},

  {"Tariff":"Municrate 1","Energy Charge [c/kWh]":229.79,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":43.60,"Network Capacity Charge [R/POD/day]":34.06,"Service and Administration Charge [R/POD/day]":18.81,"Generation Capacity Charge [R/POD/day]":2.17},
  {"Tariff":"Municrate 2","Energy Charge [c/kWh]":229.79,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":43.60,"Network Capacity Charge [R/POD/day]":69.01,"Service and Administration Charge [R/POD/day]":18.81,"Generation Capacity Charge [R/POD/day]":4.01},
  {"Tariff":"Municrate 3","Energy Charge [c/kWh]":229.79,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":43.60,"Network Capacity Charge [R/POD/day]":138.21,"Service and Administration Charge [R/POD/day]":18.81,"Generation Capacity Charge [R/POD/day]":8.46},
  {"Tariff":"Municrate 4","Energy Charge [c/kWh]":349.28,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":43.60,"Network Capacity Charge [R/POD/day]":null,"Service and Administration Charge [R/POD/day]":null,"Generation Capacity Charge [R/POD/day]":null},

  // ---------------- Homeflex (variants with fixed + other c/kWh; energy is TOU below) ----------------
  {"Tariff":"Homeflex 1","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":12.13,"Generation Capacity Charge [R/POD/day]":0.72,"Service and Administration Charge [R/POD/day]":3.27},
  {"Tariff":"Homeflex 2","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":27.07,"Generation Capacity Charge [R/POD/day]":1.27,"Service and Administration Charge [R/POD/day]":3.27},
  {"Tariff":"Homeflex 3","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":57.82,"Generation Capacity Charge [R/POD/day]":3.10,"Service and Administration Charge [R/POD/day]":3.27},
  {"Tariff":"Homeflex 4","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":8.35,"Generation Capacity Charge [R/POD/day]":0.47,"Service and Administration Charge [R/POD/day]":3.27}
];

// ---------------- Homeflex TOU energy & rebate rates (VAT-exclusive, c/kWh) ----------------
const HF_ENERGY = {
  high: { peak: 706.97, standard: 216.31, offpeak: 159.26 },
  low:  { peak: 329.28, standard: 204.90, offpeak: 159.26 }
};
// From uploaded Gen-offset table (your screenshot): VAT-exclusive rebate rates
const HF_REBATE = {
  high: { peak: 650.52, standard: 185.41, offpeak: 131.21 },
  low:  { peak: 292.75, standard: 174.58, offpeak: 131.21 }
};

// ---------------- DOM ready ----------------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('billForm');
  const output = document.getElementById('billOutput');
  const tariffSelect = document.getElementById('tariff');

  const blockSimple = document.getElementById('blockSimpleEnergy');
  const blockHF = document.getElementById('blockHomeflex');

  // Populate tariffs
  tariffData.forEach(t => {
    const option = document.createElement('option');
    option.value = t['Tariff'];
    option.textContent = t['Tariff'];
    tariffSelect.appendChild(option);
  });

  // Toggle Homeflex inputs
  function isHomeflex(name){ return /^Homeflex\s[1-4]$/.test(name); }
  tariffSelect.addEventListener('change', () => {
    const isHF = isHomeflex(tariffSelect.value);
    blockHF.style.display = isHF ? '' : 'none';
    blockSimple.style.display = isHF ? 'none' : '';
  });

  // Defaults for date & PODs (unchanged)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const fmt = (d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  document.getElementById('start').value = fmt(start);
  document.getElementById('end').value = fmt(end);
  const podsInput = document.getElementById('pods');
  if (!podsInput.value) podsInput.value = 1;

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const selected = tariffData.find(t => t['Tariff'] === tariffSelect.value);
    if (!selected) return;

    const pods = Math.max(1, parseInt(document.getElementById('pods').value || '1', 10));
    const startISO = document.getElementById('start').value;
    const endISO   = document.getElementById('end').value;
    const days = daysBetween(startISO, endISO);
    const { high, low, total, fHigh, fLow } = seasonDaySplit(startISO, endISO);

    const breakdown = [];
    let subtotal = 0;

    // Helper: push a line (handles VAT)
    function addLine(label, baseAmountExVAT, unitText=null, showRate=null){
      const amountInc = baseAmountExVAT * (1 + VAT_RATE);
      subtotal += amountInc;
      breakdown.push({
        name: label,
        unitText,
        rateDisplay: showRate,
        amountInc
      });
    }

    // ---------------- Non-Homeflex flow (unchanged) ----------------
    if (!/^Homeflex\s[1-4]$/.test(selected['Tariff'])) {
      const energy = parseFloat(document.getElementById('energy').value || '0');

      for (const key in selected) {
        const val = parseFloat(selected[key]);
        if (!isNaN(val) && val > 0) {
          const unit = key.match(/\[(.*?)\]/)?.[1] || '';
          let chargeEx = 0;
          if (unit === 'c/kWh') {
            chargeEx = (val / 100) * energy;
          } else if (unit === 'R/POD/day') {
            // Keep your original behaviour (apportion per POD)
            chargeEx = (val / pods) * days;
          }
          const rateInc = unit === 'c/kWh'
            ? `${(val*(1+VAT_RATE)).toFixed(2)} c/kWh`
            : `${formatRateRands(val*(1+VAT_RATE))} /POD/day`;
          addLine(key.split('[')[0].trim(), chargeEx, unit, rateInc);
        }
      }

    } else {
      // ---------------- Homeflex flow (TOU + Gen-offset) ----------------
      const peakK = parseFloat(document.getElementById('hf_peak_kwh').value || '0');
      const stdK  = parseFloat(document.getElementById('hf_std_kwh').value  || '0');
      const offK  = parseFloat(document.getElementById('hf_off_kwh').value  || '0');

      const peakX = parseFloat(document.getElementById('hf_peak_exp').value || '0');
      const stdX  = parseFloat(document.getElementById('hf_std_exp').value  || '0');
      const offX  = parseFloat(document.getElementById('hf_off_exp').value  || '0');

      const totalEnergy = peakK + stdK + offK;

      // Energy charges (TOU) — prorate by season-day fractions
      function energyChargeEx(energyKWh, rateHigh, rateLow){
        // energyKWh applies to full period; split by day fractions
        return (energyKWh * fHigh * (rateHigh/100)) + (energyKWh * fLow * (rateLow/100));
      }

      const energyPeakEx = energyChargeEx(peakK, HF_ENERGY.high.peak, HF_ENERGY.low.peak);
      const energyStdEx  = energyChargeEx(stdK,  HF_ENERGY.high.standard, HF_ENERGY.low.standard);
      const energyOffEx  = energyChargeEx(offK,  HF_ENERGY.high.offpeak,  HF_ENERGY.low.offpeak);

      addLine("Active Energy — Peak (TOU)", energyPeakEx,
              "c/kWh", `${(HF_ENERGY.high.peak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.peak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Active Energy — Standard (TOU)", energyStdEx,
              "c/kWh", `${(HF_ENERGY.high.standard*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.standard*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Active Energy — Off-peak (TOU)", energyOffEx,
              "c/kWh", `${(HF_ENERGY.high.offpeak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.offpeak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);

      // Other energy-linked charges on total energy
      const legacyEx   = (selected["Legacy Charge [c/kWh]"]   || 0) / 100 * totalEnergy;
      const ndemandEx  = (selected["Network Demand Charge [c/kWh]"] || 0) / 100 * totalEnergy;
      const ancillaryEx= (selected["Ancillary Service Charge [c/kWh]"] || 0) / 100 * totalEnergy;

      if (legacyEx>0)  addLine("Legacy Charge", legacyEx, "c/kWh", `${(selected["Legacy Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (ndemandEx>0) addLine("Network Demand Charge", ndemandEx, "c/kWh", `${(selected["Network Demand Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (ancillaryEx>0) addLine("Ancillary Service Charge", ancillaryEx, "c/kWh", `${(selected["Ancillary Service Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);

      // Fixed daily charges (keep your original per-POD apportion)
      const ncap = selected["Network Capacity Charge [R/POD/day]"] || 0;
      const gcap = selected["Generation Capacity Charge [R/POD/day]"] || 0;
      const sadmin = selected["Service and Administration Charge [R/POD/day]"] || 0;

      if (ncap)   addLine("Network Capacity Charge",   (ncap / pods) * days, "R/POD/day", `${formatRateRands(ncap*(1+VAT_RATE))} /POD/day`);
      if (gcap)   addLine("Generation Capacity Charge",(gcap / pods) * days, "R/POD/day", `${formatRateRands(gcap*(1+VAT_RATE))} /POD/day`);
      if (sadmin) addLine("Service & Administration",  (sadmin / pods) * days, "R/POD/day", `${formatRateRands(sadmin*(1+VAT_RATE))} /POD/day`);

      // -------- Gen-offset credits (negative lines), capped at consumption per TOU --------
      function rebateCreditEx(exportKWh, consKWh, rHigh, rLow){
        const eligible = Math.min(exportKWh, consKWh);
        return eligible * fHigh * (rHigh/100) + eligible * fLow * (rLow/100);
      }

      const creditPeakEx = rebateCreditEx(peakX, peakK, HF_REBATE.high.peak, HF_REBATE.low.peak);
      const creditStdEx  = rebateCreditEx(stdX,  stdK,  HF_REBATE.high.standard, HF_REBATE.low.standard);
      const creditOffEx  = rebateCreditEx(offX,  offK,  HF_REBATE.high.offpeak,  HF_REBATE.low.offpeak);

      // Add as negative (reduces subtotal)
      addLine("Gen-offset Credit — Peak",   -creditPeakEx,  "c/kWh", `${(HF_REBATE.high.peak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.peak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Gen-offset Credit — Standard",-creditStdEx, "c/kWh", `${(HF_REBATE.high.standard*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.standard*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Gen-offset Credit — Off-peak",-creditOffEx, "c/kWh", `${(HF_REBATE.high.offpeak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.offpeak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
    }

    // VAT amount (for display only, still show total incl VAT)
    const vatAmount = subtotal / (1 + VAT_RATE) * VAT_RATE;

    // -------- Render table (unchanged style) --------
    output.innerHTML = `
      <h2 style="margin-bottom: 10px;">Bill Breakdown (VAT Inclusive)</h2>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; margin-bottom:10px;">
          <thead style="background-color:#f9f9f9;">
            <tr>
              <th style="padding:10px; text-align:left; border-bottom:2px solid #ccc;">Charge Type</th>
              <th style="padding:10px; text-align:right; border-bottom:2px solid #ccc;">Rate (Incl. VAT)</th>
              <th style="padding:10px; text-align:right; border-bottom:2px solid #ccc;">Amount (Incl. VAT)</th>
            </tr>
          </thead>
          <tbody>
            ${breakdown.map(item => `
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
                <td style="padding:8px; text-align:right; border-bottom:1px solid #eee;">${item.rateDisplay ?? ''}</td>
                <td style="padding:8px; text-align:right; border-bottom:1px solid #eee;">${formatRands(item.amountInc)}</td>
              </tr>
            `).join('')}
            <tr style="background-color:#e7f4ea;">
              <td colspan="2" style="padding:12px; text-align:right; font-size:1.1em; font-weight:bold;">Total (Incl. VAT)</td>
              <td style="padding:12px; text-align:right; font-size:1.1em; font-weight:bold;">${formatRands(subtotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-style:italic; color:#555;">All rates and amounts include VAT at 15%. Seasonal split (High: Jun–Aug; Low: Sep–May) is applied by day-count within your selected dates.</p>
    `;
  });
});
