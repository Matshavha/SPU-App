// ✅ simulate.js — Homeflex TOU with weekday/Saturday/Sunday + SA public holidays treated as Sunday
// - Applies correct Peak / Standard / Off-peak windows per *season* (High: Jun–Aug; Low: Sep–May)
//   and per *day type* (Weekday, Saturday, Sunday/Public holiday).
// - Uses users’ TOU kWh inputs (Peak/Standard/Off-peak + Exports) and splits those kWh
//   across High vs Low season in proportion to the actual TOU hours present in the selected date range.
// - Gen-offset credits are capped per TOU: rebate export ≤ consumption for that TOU.
// - All rates in data are VAT-exclusive; table shows amounts VAT-inclusive.

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
function iso(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

// ---------------- SA Public Holidays (treated as Sunday) ----------------
// Easter (Meeus/Jones/Butcher algorithm)
function easterDate(y) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0=Jan
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month, day);
}
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function observedIfSunday(d){ // SA: if holiday falls on Sunday, following Monday is a public holiday
  const list = new Set([iso(d)]);
  if (d.getDay() === 0) list.add(iso(addDays(d,1)));
  return list;
}
function saPublicHolidays(year){
  const set = new Set();
  // Fixed
  [new Date(year,0,1),  // New Year’s Day
   new Date(year,2,21), // Human Rights Day
   new Date(year,3,27), // Freedom Day
   new Date(year,4,1),  // Workers’ Day
   new Date(year,5,16), // Youth Day
   new Date(year,7,9),  // National Women’s Day
   new Date(year,8,24), // Heritage Day
   new Date(year,11,16),// Day of Reconciliation
   new Date(year,11,25),// Christmas Day
   new Date(year,11,26) // Day of Goodwill
  ].forEach(d => observedIfSunday(d).forEach(s => set.add(s)));

  // Moveable: Good Friday, Family Day (Easter Monday)
  const easter = easterDate(year);
  const goodFri = addDays(easter, -2);
  const easterMon = addDays(easter, +1);
  set.add(iso(goodFri));
  set.add(iso(easterMon));
  return set;
}
function buildHolidaySet(fromISO, toISO){
  const s = new Date(fromISO), e = new Date(toISO);
  const years = new Set([s.getFullYear(), e.getFullYear()]);
  const set = new Set();
  years.forEach(y => saPublicHolidays(y).forEach(x => set.add(x)));
  return set;
}

// ---------------- Homeflex TOU clock (hours are [start, end) 24h local) ----------------
// Derived from your TOU wheels:
// High-demand (Jun–Aug):
//   Weekday: Peak 06–08 & 18–21; Standard 08–18 & 21–22; Off-peak 22–06
//   Saturday: Peak —; Standard 07–08 & 18–22; Off-peak rest
//   Sunday/PH: Peak —; Standard 19–21; Off-peak rest
// Low-demand (Sep–May):
//   Weekday: Peak 07–08 & 20–21; Standard 06–07 & 18–20 & 21–22; Off-peak 22–06
//   Saturday: Peak 07–08 & 19–20; Standard 06–07 & 18–19 & 20–22; Off-peak rest
//   Sunday/PH: Peak 07–08 & 19–20; Standard 06–07 & 20–22; Off-peak rest
const HF_TOU = {
  high: {
    weekday: {
      peak:     [[6,8],[18,21]],
      standard: [[8,18],[21,22]],
      offpeak:  [[22,24],[0,6]]
    },
    saturday: {
      peak:     [],
      standard: [[7,8],[18,22]],
      offpeak:  [[22,24],[0,7],[8,18]]
    },
    sunday: {
      peak:     [],
      standard: [[19,21]],
      offpeak:  [[21,24],[0,19]]
    }
  },
  low: {
    weekday: {
      peak:     [[7,8],[20,21]],
      standard: [[6,7],[18,20],[21,22]],
      offpeak:  [[22,24],[0,6]]
    },
    saturday: {
      peak:     [[7,8],[19,20]],
      standard: [[6,7],[18,19],[20,22]],
      offpeak:  [[22,24],[0,6],[8,18]]
    },
    sunday: {
      peak:     [[7,8],[19,20]],
      standard: [[6,7],[20,22]],
      offpeak:  [[22,24],[0,6],[8,19]]
    }
  }
};
function inAny(hour, ranges){ return ranges.some(([a,b]) => (hour>=a && hour<b)); }
function dayTypeOf(date, holidaySet){
  const d = date.getDay();
  if (holidaySet.has(iso(date))) return 'sunday'; // treat PH as Sunday
  if (d === 6) return 'saturday';
  if (d === 0) return 'sunday';
  return 'weekday';
}
function seasonOf(date){
  const m = date.getMonth(); // 0=Jan
  return (m===5 || m===6 || m===7) ? 'high' : 'low';
}
function bandOfHour(date, holidaySet){
  const season = seasonOf(date);
  const type = dayTypeOf(date, holidaySet);
  const hour = date.getHours();
  const cfg = HF_TOU[season][type];
  if (inAny(hour, cfg.peak)) return 'peak';
  if (inAny(hour, cfg.standard)) return 'standard';
  return 'offpeak';
}

// Count *hours* within range for each {season, band}
function countTouHours(startISO, endISO){
  const holidaySet = buildHolidaySet(startISO, endISO);
  const s = new Date(startISO);
  const e = new Date(endISO);
  // normalize to top of hour start/end inclusive of end’s last day 23:00
  const cursor = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0);
  const endHour = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 0, 0);

  const counts = { high: { peak:0, standard:0, offpeak:0 }, low: { peak:0, standard:0, offpeak:0 } };
  while (cursor <= endHour) {
    const season = seasonOf(cursor);
    const band = bandOfHour(cursor, holidaySet);
    counts[season][band] += 1;
    cursor.setHours(cursor.getHours()+1);
  }
  return counts;
}

// ---------------- Embedded tariff data (VAT-exclusive) ----------------
const tariffData = [
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

  // ---------------- Homeflex variants (fixed + other c/kWh; TOU energy is separate) ----------------
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
// Gen-offset (rebate) rates — VAT-exclusive
const HF_REBATE = {
  high: { peak: 650.52, standard: 185.41, offpeak: 131.21 },
  low:  { peak: 292.75, standard: 174.58, offpeak: 131.21 }
};

// ---------------- DOM ready ----------------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('billForm');
  const output = document.getElementById('billOutput');
  const tariffSelect = document.getElementById('tariff');

  // Blocks (simple vs Homeflex)
  const blockSimple = document.getElementById('blockSimpleEnergy');   // container with “Energy [kWh]”
  const blockHF     = document.getElementById('blockHomeflex');       // container with TOU + Export fields

  // Populate tariffs
  tariffData.forEach(t => {
    const option = document.createElement('option');
    option.value = t['Tariff'];
    option.textContent = t['Tariff'];
    tariffSelect.appendChild(option);
  });

  // Toggle Homeflex inputs
  function isHomeflex(name){ return /^Homeflex\s[1-4]$/.test(name); }
  function toggleBlocks(){
    const isHF = isHomeflex(tariffSelect.value);
    if (blockHF) blockHF.style.display = isHF ? '' : 'none';
    if (blockSimple) blockSimple.style.display = isHF ? 'none' : '';
  }
  tariffSelect.addEventListener('change', toggleBlocks);
  toggleBlocks();

  // Defaults for date & PODs
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const fmt = (d)=>iso(d);
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

    const breakdown = [];
    let subtotal = 0;
    const addLine = (label, baseAmountExVAT, rateDisplay='') => {
      const amountInc = baseAmountExVAT * (1 + VAT_RATE);
      subtotal += amountInc;
      breakdown.push({ name: label, rateDisplay, amountInc });
    };

    // ---------------- Non-Homeflex flow ----------------
    if (!isHomeflex(selected['Tariff'])) {
      const energy = parseFloat(document.getElementById('energy').value || '0');

      for (const key in selected) {
        const val = parseFloat(selected[key]);
        if (!isNaN(val) && val > 0) {
          const unit = key.match(/\[(.*?)\]/)?.[1] || '';
          let chargeEx = 0;
          if (unit === 'c/kWh') {
            chargeEx = (val / 100) * energy;
          } else if (unit === 'R/POD/day') {
            // NOTE: This models a per-POD share (divide by pods). If you want the full
            // invoice across N PODs, multiply by pods instead.
            chargeEx = (val / pods) * days;
          }
          const rateInc = unit === 'c/kWh'
            ? `${(val*(1+VAT_RATE)).toFixed(2)} c/kWh`
            : `${formatRateRands(val*(1+VAT_RATE))} /POD/day`;
          addLine(key.split('[')[0].trim(), chargeEx, rateInc);
        }
      }

    } else {
      // ---------------- Homeflex flow: TOU hour map by season + PH as Sunday ----------------
      // Gather inputs
      const peakK = parseFloat(document.getElementById('hf_peak_kwh').value || '0');
      const stdK  = parseFloat(document.getElementById('hf_std_kwh').value  || '0');
      const offK  = parseFloat(document.getElementById('hf_off_kwh').value  || '0');

      const peakX = parseFloat(document.getElementById('hf_peak_exp').value || '0');
      const stdX  = parseFloat(document.getElementById('hf_std_exp').value  || '0');
      const offX  = parseFloat(document.getElementById('hf_off_exp').value  || '0');

      const hourCounts = countTouHours(startISO, endISO);
      const bandHours = {
        peak: hourCounts.high.peak + hourCounts.low.peak,
        standard: hourCounts.high.standard + hourCounts.low.standard,
        offpeak: hourCounts.high.offpeak + hourCounts.low.offpeak
      };

      // Helper to season-split a given band kWh by actual hours in the range
      function splitBySeason(band, kwh){
        const totalH = bandHours[band] || 0;
        if (!totalH || kwh <= 0) return { high:0, low:0 };
        const hi = hourCounts.high[band] || 0;
        const lo = hourCounts.low[band]  || 0;
        const fHi = hi / totalH;
        const fLo = lo / totalH;
        return { high: kwh * fHi, low: kwh * fLo };
      }

      const cons = {
        peak: splitBySeason('peak', peakK),
        standard: splitBySeason('standard', stdK),
        offpeak: splitBySeason('offpeak', offK)
      };
      const exp  = {
        peak: splitBySeason('peak', peakX),
        standard: splitBySeason('standard', stdX),
        offpeak: splitBySeason('offpeak', offX)
      };

      // Energy charges per season (c/kWh → R)
      function energyChargeEx(consSplit, rates) {
        return (consSplit.high * rates.high / 100) + (consSplit.low * rates.low / 100);
      }
      const energyPeakEx = energyChargeEx(cons.peak,    {high:HF_ENERGY.high.peak,    low:HF_ENERGY.low.peak});
      const energyStdEx  = energyChargeEx(cons.standard,{high:HF_ENERGY.high.standard,low:HF_ENERGY.low.standard});
      const energyOffEx  = energyChargeEx(cons.offpeak, {high:HF_ENERGY.high.offpeak, low:HF_ENERGY.low.offpeak});

      addLine("Active Energy — Peak (TOU)",
              energyPeakEx,
              `${(HF_ENERGY.high.peak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.peak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Active Energy — Standard (TOU)",
              energyStdEx,
              `${(HF_ENERGY.high.standard*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.standard*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Active Energy — Off-peak (TOU)",
              energyOffEx,
              `${(HF_ENERGY.high.offpeak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.offpeak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);

      // Other energy-linked charges on *total* energy (unchanged)
      const totalEnergy = peakK + stdK + offK;
      const legacyEx    = (selected["Legacy Charge [c/kWh]"]                || 0) / 100 * totalEnergy;
      const ndemandEx   = (selected["Network Demand Charge [c/kWh]"]        || 0) / 100 * totalEnergy
                        + (selected["Netword Demand Charge [c/kWh]"]        || 0) / 100 * totalEnergy; // accept both spellings
      const ancillaryEx = (selected["Ancillary Service Charge [c/kWh]"]     || 0) / 100 * totalEnergy;
      const electSubEx  = (selected["Electrification and Rural Network Subsidy Charge [c/kWh]"] || 0) / 100 * totalEnergy;

      if (legacyEx>0)    addLine("Legacy Charge", legacyEx, `${(selected["Legacy Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (ndemandEx>0)   addLine("Network Demand Charge", ndemandEx, `${(((selected["Network Demand Charge [c/kWh]"]||0)+(selected["Netword Demand Charge [c/kWh]"]||0))*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (ancillaryEx>0) addLine("Ancillary Service Charge", ancillaryEx, `${(selected["Ancillary Service Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (electSubEx>0)  addLine("Electrification & Rural Network Subsidy", electSubEx, `${(selected["Electrification and Rural Network Subsidy Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);

      // Fixed daily charges (per-POD share, to match your previous model)
      const ncap   = selected["Network Capacity Charge [R/POD/day]"] || 0;
      const gcap   = selected["Generation Capacity Charge [R/POD/day]"] || 0;
      const sadmin = selected["Service and Administration Charge [R/POD/day]"] || 0;

      if (ncap)   addLine("Network Capacity Charge",   (ncap / pods) * days, `${formatRateRands(ncap*(1+VAT_RATE))} /POD/day`);
      if (gcap)   addLine("Generation Capacity Charge",(gcap / pods) * days, `${formatRateRands(gcap*(1+VAT_RATE))} /POD/day`);
      if (sadmin) addLine("Service & Administration",  (sadmin / pods) * days, `${formatRateRands(sadmin*(1+VAT_RATE))} /POD/day`);

      // -------- Gen-offset credits (negative), capped per TOU & split by season hours --------
      function rebateCreditEx(expSplit, consSplit, rates){
        // Cap exports by consumption per season separately
        const hiK = Math.min(expSplit.high, consSplit.high);
        const loK = Math.min(expSplit.low,  consSplit.low);
        return hiK * (rates.high/100) + loK * (rates.low/100);
      }
      const creditPeakEx = rebateCreditEx(exp.peak,    cons.peak,    {high:HF_REBATE.high.peak,    low:HF_REBATE.low.peak});
      const creditStdEx  = rebateCreditEx(exp.standard,cons.standard,{high:HF_REBATE.high.standard,low:HF_REBATE.low.standard});
      const creditOffEx  = rebateCreditEx(exp.offpeak, cons.offpeak, {high:HF_REBATE.high.offpeak, low:HF_REBATE.low.offpeak});

      addLine("Gen-offset Credit — Peak",    -creditPeakEx,  `${(HF_REBATE.high.peak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.peak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Gen-offset Credit — Standard",-creditStdEx,   `${(HF_REBATE.high.standard*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.standard*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Gen-offset Credit — Off-peak", -creditOffEx,  `${(HF_REBATE.high.offpeak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.offpeak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
    }

    // -------- Render table --------
    output.innerHTML = `
      <h2 style="margin-bottom:10px;">Bill Breakdown (VAT Inclusive)</h2>
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
      <p style="font-style:italic; color:#555;">
        VAT 15% included. TOU hours follow your tariff booklet: weekday / Saturday / Sunday with South African public holidays treated as Sunday.
        Seasonal split (High: Jun–Aug; Low: Sep–May) and the actual calendar in your date range are applied hour-by-hour.
      </p>
    `;
  });
});




