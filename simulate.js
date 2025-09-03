// ✅ simulate.js — Homeflex TOU with weekday/Saturday/Sunday + SA public holidays
// - High season: Jun–Aug; Low season: Sep–May
// - Homeflex: Public holidays treated as SATURDAY (except if the holiday actually falls on a Sunday → treat as Sunday).
// - Hour-by-hour TOU counting; Gen-offset credits capped per TOU; VAT-inclusive display.

const VAT_RATE = 0.15;

/* ---------------- Basic helpers ---------------- */
function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.ceil((e - s) / 86400000) + 1);
}
function formatRands(v) { return `R ${v.toFixed(2)}`; }
function formatRateRands(v) { return `R ${v.toFixed(2)}`; }
function iso(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

/* ---------------- South African public holidays ---------------- */
// Easter (Meeus/Jones/Butcher)
function easterDate(y) {
  const a = y % 19, b = Math.floor(y/100), c = y % 100;
  const d = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25);
  const g = Math.floor((b - f + 1)/3);
  const h = (19*a + b - d - g + 15) % 30;
  const i = Math.floor(c/4), k = c % 4;
  const l = (32 + 2*e + 2*i - h - k) % 7;
  const m = Math.floor((a + 11*h + 22*l)/451);
  const month = Math.floor((h + l - 7*m + 114)/31) - 1; // 0=Jan
  const day = ((h + l - 7*m + 114) % 31) + 1;
  return new Date(y, month, day);
}
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
/** If holiday falls on Sunday, SA observes Monday as a holiday as well */
function observedIfSunday(d){
  const s = new Set([iso(d)]);
  if (d.getDay() === 0) s.add(iso(addDays(d,1))); // observed Monday
  return s;
}
function saPublicHolidays(year){
  const set = new Set();
  // Fixed-date holidays
  [
    new Date(year,0,1),   // New Year’s Day
    new Date(year,2,21),  // Human Rights Day
    new Date(year,3,27),  // Freedom Day
    new Date(year,4,1),   // Workers’ Day
    new Date(year,5,16),  // Youth Day
    new Date(year,7,9),   // National Women’s Day
    new Date(year,8,24),  // Heritage Day
    new Date(year,11,16), // Day of Reconciliation
    new Date(year,11,25), // Christmas Day
    new Date(year,11,26), // Day of Goodwill
  ].forEach(d => observedIfSunday(d).forEach(s => set.add(s)));

  // Moveable: Good Friday & Family Day (Easter Monday)
  const easter = easterDate(year);
  observedIfSunday(addDays(easter, -2)).forEach(s => set.add(s)); // Good Friday
  observedIfSunday(addDays(easter, +1)).forEach(s => set.add(s)); // Family Day
  return set;
}
function buildHolidaySet(fromISO, toISO){
  const s = new Date(fromISO), e = new Date(toISO);
  const years = new Set([s.getFullYear(), e.getFullYear()]);
  const set = new Set();
  years.forEach(y => saPublicHolidays(y).forEach(x => set.add(x)));
  return set;
}

/* ---------------- Homeflex TOU clock (from Eskom 2025/26 Appendix A) ----------------
   High-demand (Jun–Aug):
     Weekday:  Peak 06–08 & 18–21; Standard 08–18 & 21–22; Off-peak 22–06
     Saturday: Peak –;                Standard 07–08 & 18–22; Off-peak rest
     Sunday:   Peak –;                Standard 19–21;            Off-peak rest
   Low-demand (Sep–May):
     Weekday:  Peak 07–08 & 20–21; Standard 06–07 & 18–20 & 21–22; Off-peak 22–06
     Saturday: Peak 07–08 & 19–20;  Standard 06–07 & 18–19 & 20–22; Off-peak rest
     Sunday:   Peak 07–08 & 19–20;  Standard 06–07 & 20–22;          Off-peak rest
*/
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
function inAny(hour, ranges){ return ranges.some(([a,b]) => hour>=a && hour<b); }
function seasonOf(date){
  const m = date.getMonth(); // 0=Jan
  return (m===5 || m===6 || m===7) ? 'high' : 'low';
}

/** Holiday treatment per tariff: Homeflex → 'saturday' (Megaflex-style),
 *  else default to 'sunday' (Nightsave Urban style) for compatibility. */
function holidayTreatmentForTariff(tariffName){
  if (/^Homeflex\s[1-4]$/.test(tariffName)) return 'saturday';
  return 'sunday';
}

/** Compute the day-type for an hour, with holiday override.
 *  rule can be: 'sunday' | 'saturday' | 'same'
 *  Special: if the holiday ACTUALLY falls on a Sunday, keep 'sunday'. */
function dayTypeOf(date, holidaySet, rule){
  const dow = date.getDay(); // 0 Sun .. 6 Sat
  if (holidaySet.has(iso(date))) {
    if (dow === 0) return 'sunday';         // holiday actually on Sunday → Sunday
    if (rule === 'saturday') return 'saturday';
    if (rule === 'sunday')   return 'sunday';
    // 'same' → treat as its real weekday
  }
  if (dow === 6) return 'saturday';
  if (dow === 0) return 'sunday';
  return 'weekday';
}
function bandOfHour(date, holidaySet, rule){
  const season = seasonOf(date);
  const type = dayTypeOf(date, holidaySet, rule);
  const hour = date.getHours();
  const cfg = HF_TOU[season][type];
  if (inAny(hour, cfg.peak)) return 'peak';
  if (inAny(hour, cfg.standard)) return 'standard';
  return 'offpeak';
}

/** Count hours in each {season, band} within [startISO .. endISO] (inclusive).
 *  `holidayRule` as above. */
function countTouHours(startISO, endISO, holidayRule){
  const holidaySet = buildHolidaySet(startISO, endISO);
  const s = new Date(startISO);
  const e = new Date(endISO);
  const cursor = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0);
  const endHour = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 0, 0);

  const counts = { high: { peak:0, standard:0, offpeak:0 }, low: { peak:0, standard:0, offpeak:0 } };
  while (cursor <= endHour) {
    const season = seasonOf(cursor);
    const band = bandOfHour(cursor, holidaySet, holidayRule);
    counts[season][band] += 1;
    cursor.setHours(cursor.getHours()+1);
  }
  return counts;
}

/* ---------------- Embedded tariff data (VAT-exclusive) ---------------- */
const tariffData = [
  // ... (unchanged — keep your full table as-is)
  {"Tariff":"Businessrate 1","Energy Charge [c/kWh]":224.93,"Ancillary Service Charge [c/kWh]":0.41,"Network Demand Charge [c/kWh]":14.54,"Network Capacity Charge [R/POD/day]":20.34,"Service and Administration Charge [R/POD/day]":14.70,"Electrification and Rural Network Subsidy Charge [c/kWh]":4.94,"Generation Capacity Charge [R/POD/day]":1.98},
  // (all your existing entries) …
  {"Tariff":"Homeflex 1","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":12.13,"Generation Capacity Charge [R/POD/day]":0.72,"Service and Administration Charge [R/POD/day]":3.27},
  {"Tariff":"Homeflex 2","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":27.07,"Generation Capacity Charge [R/POD/day]":1.27,"Service and Administration Charge [R/POD/day]":3.27},
  {"Tariff":"Homeflex 3","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":57.82,"Generation Capacity Charge [R/POD/day]":3.10,"Service and Administration Charge [R/POD/day]":3.27},
  {"Tariff":"Homeflex 4","Legacy Charge [c/kWh]":22.78,"Network Demand Charge [c/kWh]":26.37,"Ancillary Service Charge [c/kWh]":0.41,"Network Capacity Charge [R/POD/day]":8.35,"Generation Capacity Charge [R/POD/day]":0.47,"Service and Administration Charge [R/POD/day]":3.27}
];

/* ---------------- Homeflex TOU energy & rebate rates (VAT-exclusive, c/kWh) ----------------
   From Eskom Tariffs & Charges Booklet 2025/26 (Homeflex + Gen-offset tables). */
const HF_ENERGY = {
  high: { peak: 706.97, standard: 216.31, offpeak: 159.26 },
  low:  { peak: 329.28, standard: 204.90, offpeak: 159.26 }
};
const HF_REBATE = {
  high: { peak: 650.52, standard: 185.41, offpeak: 131.21 },
  low:  { peak: 292.75, standard: 174.58, offpeak: 131.21 }
};

/* ---------------- DOM ready ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('billForm');
  const output = document.getElementById('billOutput');
  const tariffSelect = document.getElementById('tariff');

  const blockSimple = document.getElementById('blockSimpleEnergy');
  const blockHF     = document.getElementById('blockHomeflex');

  // Populate tariffs
  tariffData.forEach(t => {
    const o = document.createElement('option');
    o.value = t['Tariff']; o.textContent = t['Tariff'];
    tariffSelect.appendChild(o);
  });

  function isHomeflex(name){ return /^Homeflex\s[1-4]$/.test(name); }
  function toggleBlocks(){
    const isHF = isHomeflex(tariffSelect.value);
    if (blockHF) blockHF.style.display = isHF ? '' : 'none';
    if (blockSimple) blockSimple.style.display = isHF ? 'none' : '';
  }
  tariffSelect.addEventListener('change', toggleBlocks);
  toggleBlocks();

  // Default dates (current month)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const fmt = d => iso(d);
  document.getElementById('start').value = fmt(start);
  document.getElementById('end').value   = fmt(end);
  const podsInput = document.getElementById('pods');
  if (!podsInput.value) podsInput.value = 1;

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

    if (!isHomeflex(selected['Tariff'])) {
      // ---------- Non-Homeflex ----------
      const energy = parseFloat(document.getElementById('energy').value || '0');

      for (const key in selected) {
        const val = parseFloat(selected[key]);
        if (!isNaN(val) && val > 0) {
          const unit = key.match(/\[(.*?)\]/)?.[1] || '';
          let chargeEx = 0;
          if (unit === 'c/kWh') {
            chargeEx = (val / 100) * energy;
          } else if (unit === 'R/POD/day') {
            // per-POD share (match your earlier model)
            chargeEx = (val / pods) * days;
          }
          const rateInc = unit === 'c/kWh'
            ? `${(val*(1+VAT_RATE)).toFixed(2)} c/kWh`
            : `${formatRateRands(val*(1+VAT_RATE))} /POD/day`;
          addLine(key.split('[')[0].trim(), chargeEx, rateInc);
        }
      }

    } else {
      // ---------- Homeflex: hour-by-hour TOU with holiday rule ----------
      const peakK = parseFloat(document.getElementById('hf_peak_kwh').value || '0');
      const stdK  = parseFloat(document.getElementById('hf_std_kwh').value  || '0');
      const offK  = parseFloat(document.getElementById('hf_off_kwh').value  || '0');

      const peakX = parseFloat(document.getElementById('hf_peak_exp').value || '0');
      const stdX  = parseFloat(document.getElementById('hf_std_exp').value  || '0');
      const offX  = parseFloat(document.getElementById('hf_off_exp').value  || '0');

      // Holiday rule: Homeflex → treat PH as Saturday (except if the holiday is on Sunday)
      const holidayRule = holidayTreatmentForTariff(selected['Tariff']); // 'saturday'
      const hourCounts  = countTouHours(startISO, endISO, holidayRule);

      const bandHours = {
        peak:     hourCounts.high.peak     + hourCounts.low.peak,
        standard: hourCounts.high.standard + hourCounts.low.standard,
        offpeak:  hourCounts.high.offpeak  + hourCounts.low.offpeak
      };

      // Split any band kWh into high/low season by actual hours in range
      function splitBySeason(band, kwh){
        const totalH = bandHours[band] || 0;
        if (!totalH || kwh <= 0) return { high:0, low:0 };
        const hi = hourCounts.high[band] || 0;
        const lo = hourCounts.low[band]  || 0;
        return { high: kwh * (hi/totalH), low: kwh * (lo/totalH) };
      }

      const cons = {
        peak:     splitBySeason('peak',     peakK),
        standard: splitBySeason('standard', stdK),
        offpeak:  splitBySeason('offpeak',  offK)
      };
      const exp  = {
        peak:     splitBySeason('peak',     peakX),
        standard: splitBySeason('standard', stdX),
        offpeak:  splitBySeason('offpeak',  offX)
      };

      // Energy charges (c/kWh -> R)
      const energyChargeEx = (split, rates) => (split.high * rates.high/100) + (split.low * rates.low/100);
      const energyPeakEx = energyChargeEx(cons.peak,     {high:HF_ENERGY.high.peak,     low:HF_ENERGY.low.peak});
      const energyStdEx  = energyChargeEx(cons.standard, {high:HF_ENERGY.high.standard, low:HF_ENERGY.low.standard});
      const energyOffEx  = energyChargeEx(cons.offpeak,  {high:HF_ENERGY.high.offpeak,  low:HF_ENERGY.low.offpeak});

      addLine("Active Energy — Peak (TOU)",
              energyPeakEx,
              `${(HF_ENERGY.high.peak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.peak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Active Energy — Standard (TOU)",
              energyStdEx,
              `${(HF_ENERGY.high.standard*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.standard*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Active Energy — Off-peak (TOO)",
              energyOffEx,
              `${(HF_ENERGY.high.offpeak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_ENERGY.low.offpeak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);

      // Other energy-linked charges on total energy
      const totalEnergy = peakK + stdK + offK;
      const legacyEx    = (selected["Legacy Charge [c/kWh]"]                || 0) / 100 * totalEnergy;
      const ndemandEx   = (selected["Network Demand Charge [c/kWh]"]        || 0) / 100 * totalEnergy
                        + (selected["Netword Demand Charge [c/kWh]"]        || 0) / 100 * totalEnergy; // accept alt spelling
      const ancillaryEx = (selected["Ancillary Service Charge [c/kWh]"]     || 0) / 100 * totalEnergy;
      const electSubEx  = (selected["Electrification and Rural Network Subsidy Charge [c/kWh]"] || 0) / 100 * totalEnergy;

      if (legacyEx>0)    addLine("Legacy Charge", legacyEx, `${(selected["Legacy Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (ndemandEx>0)   addLine("Network Demand Charge", ndemandEx, `${(((selected["Network Demand Charge [c/kWh]"]||0)+(selected["Netword Demand Charge [c/kWh]"]||0))*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (ancillaryEx>0) addLine("Ancillary Service Charge", ancillaryEx, `${(selected["Ancillary Service Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);
      if (electSubEx>0)  addLine("Electrification & Rural Network Subsidy", electSubEx, `${(selected["Electrification and Rural Network Subsidy Charge [c/kWh]"]*(1+VAT_RATE)).toFixed(2)} c/kWh`);

      // Fixed daily (per-POD share, matching your model)
      const ncap   = selected["Network Capacity Charge [R/POD/day]"] || 0;
      const gcap   = selected["Generation Capacity Charge [R/POD/day]"] || 0;
      const sadmin = selected["Service and Administration Charge [R/POD/day]"] || 0;

      if (ncap)   addLine("Network Capacity Charge",   (ncap / pods) * days, `${formatRateRands(ncap*(1+VAT_RATE))} /POD/day`);
      if (gcap)   addLine("Generation Capacity Charge",(gcap / pods) * days, `${formatRateRands(gcap*(1+VAT_RATE))} /POD/day`);
      if (sadmin) addLine("Service & Administration",  (sadmin / pods) * days, `${formatRateRands(sadmin*(1+VAT_RATE))} /POD/day`);

      // Gen-offset credits (negative), capped per TOU & per season
      const rebateCreditEx = (expSplit, consSplit, rates) => {
        const hiK = Math.min(expSplit.high, consSplit.high);
        const loK = Math.min(expSplit.low,  consSplit.low);
        return hiK * (rates.high/100) + loK * (rates.low/100);
      };
      const creditPeakEx = rebateCreditEx(exp.peak,     cons.peak,     {high:HF_REBATE.high.peak,     low:HF_REBATE.low.peak});
      const creditStdEx  = rebateCreditEx(exp.standard, cons.standard, {high:HF_REBATE.high.standard, low:HF_REBATE.low.standard});
      const creditOffEx  = rebateCreditEx(exp.offpeak,  cons.offpeak,  {high:HF_REBATE.high.offpeak,  low:HF_REBATE.low.offpeak});

      addLine("Gen-offset Credit — Peak",     -creditPeakEx, `${(HF_REBATE.high.peak*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.peak*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
      addLine("Gen-offset Credit — Standard", -creditStdEx,  `${(HF_REBATE.high.standard*(1+VAT_RATE)).toFixed(2)} (High), ${(HF_REBATE.low.standard*(1+VAT_RATE)).toFixed(2)} (Low) c/kWh`);
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
        VAT 15% included. TOU hours follow the Eskom booklet: weekday / Saturday / Sunday.
        For <strong>Homeflex</strong>, South African public holidays are treated as <strong>Saturday</strong>
        (except when the holiday actually falls on a Sunday). Seasonal split (High: Jun–Aug; Low: Sep–May)
        and the actual calendar in your date range are applied hour-by-hour.
      </p>
    `;
  });
});
