/**
 * compareTariffs.js — SPU Tariff comparator
 *
 * Homeflex changes in this version:
 *  - Uses an explicit 2025/26 public-holiday mapping (last column of the uploaded table).
 *  - Counts hours hour-by-hour across the chosen date range (URL ?start & ?end, or current
 *    month + state.days) and splits TOU consumption/exports by season (High vs Low) *per band*.
 *  - Buy and Gen-offset rebate are computed from those per-band, per-season splits.
 *
 * References (APA 7):
 * Eskom Holdings SOC Ltd. (2025a). Tariffs and Charges Booklet 2025/2026. Eskom.
 * Eskom Holdings SOC Ltd. (2025b). Public holiday TOU treatment table 2025/26
 *   (Megaflex / Miniflex / WEPS / Megaflex Gen column) — used for Homeflex mapping.
 */

const VAT_RATE = 0.15;
const MAX_SELECT = 5;

/* ---------- Theme helpers (pull from style.css, with fallbacks) ---------- */
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const THEME = {
  primary:   cssVar('--primary', '#003896'),
  surface2:  cssVar('--surface-2', '#eef2f7'),
  surface3:  cssVar('--surface-3', '#e6ecf5'),
  ink:       cssVar('--ink', '#1f2430'),
  inkMuted:  cssVar('--ink-muted', '#4a5160'),
  energy:    cssVar('--teal-100', '#598787'),
  fixed:     cssVar('--orange-100', '#C97A00'),
  pieColors: [
    cssVar('--primary', '#003896'),
    cssVar('--blue-75', 'rgb(64,106,176)'),
    cssVar('--teal-100', '#598787'),
    cssVar('--surface-4', '#bfc9d9'),
    cssVar('--orange-100', '#C97A00'),
    cssVar('--brown-100', 'rgb(131,114,91)'),
    cssVar('--green-100', 'rgb(13,176,43)'),
  ],
};
const VAT_COLOR = cssVar('--grey-500', '#9aa3b2');

/* ---------- small utils ---------- */
function getTextColorForBg(rgb) {
  const nums = (rgb.match(/\d+/g) || []).map(Number);
  if (nums.length < 3) return '#000';
  const [r, g, b] = nums;
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
}
function estimateTextWidth(text, fontSize = 12) {
  return Math.max(6, text.length * fontSize * 0.6);
}
function money(v){ return `R ${v.toFixed(2)}`; }
function cents(v){ return `${v.toFixed(2)} c/kWh`; }
function perDay(v){ return `R ${v.toFixed(2)} /POD/day`; }
function iso(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

/* ---------- Tariff data (VAT-exclusive) ---------- */
const tariffData = [
  { "Tariff": "Businessrate 1", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/POD/day]": 20.34, "Service and Administration Charge [R/POD/day]": 14.70, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/POD/day]": 1.98 },
  { "Tariff": "Businessrate 2", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/POD/day]": 30.21, "Service and Administration Charge [R/POD/day]": 14.70, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/POD/day]": 2.95 },
  { "Tariff": "Businessrate 3", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/POD/day]": 75.38, "Service and Administration Charge [R/POD/day]": 14.70, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/POD/day]": 7.37 },
  { "Tariff": "Businessrate 4", "Energy Charge [c/kWh]": 350.09, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/POD/day]": null, "Service and Administration Charge [R/POD/day]": null, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/POD/day]": 0.00 },

  { "Tariff": "Homepower 1", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/POD/day]": 12.13, "Service and Administration Charge [R/POD/day]": 3.27, "Generation Capacity Charge [R/POD/day]": 0.72 },
  { "Tariff": "Homepower 2", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/POD/day]": 27.07, "Service and Administration Charge [R/POD/day]": 3.27, "Generation Capacity Charge [R/POD/day]": 1.27 },
  { "Tariff": "Homepower 3", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/POD/day]": 57.82, "Service and Administration Charge [R/POD/day]": 3.27, "Generation Capacity Charge [R/POD/day]": 3.1 },
  { "Tariff": "Homepower 4", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/POD/day]": 8.35, "Service and Administration Charge [R/POD/day]": 3.27, "Generation Capacity Charge [R/POD/day]": 0.47 },
  { "Tariff": "Homepower Bulk", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/POD/day]": 8.35, "Service and Administration Charge [R/POD/day]": 3.27, "Generation Capacity Charge [R/POD/day]": 4.48 },

  { "Tariff": "Homelight 20A", "Energy Charge [c/kWh]": 216.11 },
  { "Tariff": "Homelight 60A", "Energy Charge [c/kWh]": 274.72 },

  { "Tariff": "Landrate 1", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/POD/day]": 62.2, "Service and Administration Charge [R/POD/day]": 24.5, "Generation Capacity Charge [R/POD/day]": 2.71 },
  { "Tariff": "Landrate 2", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/POD/day]": 96.99, "Service and Administration Charge [R/POD/day]": 24.5, "Generation Capacity Charge [R/POD/day]": 5.37 },
  { "Tariff": "Landrate 3", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/POD/day]": 155.32, "Service and Administration Charge [R/POD/day]": 24.5, "Generation Capacity Charge [R/POD/day]": 10.5 },
  { "Tariff": "Landrate 4", "Energy Charge [c/kWh]": 369.32, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/POD/day]": 45.92, "Service and Administration Charge [R/POD/day]": 24.5, "Generation Capacity Charge [R/POD/day]": 1.78 },
  { "Tariff": "LandrateDx*", "Service and Administration Charge [R/POD/day]": 87 },

  { "Tariff": "Landlight 20A", "Energy Charge [c/kWh]": 603.54 },
  { "Tariff": "Landlight 60A", "Energy Charge [c/kWh]": 836 },

  { "Tariff": "Municrate 1", "Energy Charge [c/kWh]": 229.79, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": 34.06, "Service and Administration Charge [R/POD/day]": 18.81, "Generation Capacity Charge [R/POD/day]": 2.17 },
  { "Tariff": "Municrate 2", "Energy Charge [c/kWh]": 229.79, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": 69.01, "Service and Administration Charge [R/POD/day]": 18.81, "Generation Capacity Charge [R/POD/day]": 4.01 },
  { "Tariff": "Municrate 3", "Energy Charge [c/kWh]": 229.79, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": 138.21, "Service and Administration Charge [R/POD/day]": 18.81, "Generation Capacity Charge [R/POD/day]": 8.46 },
  { "Tariff": "Municrate 4", "Energy Charge [c/kWh]": 349.28, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": null, "Service and Administration Charge [R/POD/day]": null, "Generation Capacity Charge [R/POD/day]": null },

  // Homeflex 1–4: include Legacy + other c/kWh; TOU active energy handled separately
  { "Tariff": "Homeflex 1", "Legacy Charge [c/kWh]": 22.78, "Network Demand Charge [c/kWh]": 26.37, "Ancillary Service Charge [c/kWh]": 0.41, "Network Capacity Charge [R/POD/day]": 12.13, "Generation Capacity Charge [R/POD/day]": 0.72, "Service and Administration Charge [R/POD/day]": 3.27 },
  { "Tariff": "Homeflex 2", "Legacy Charge [c/kWh]": 22.78, "Network Demand Charge [c/kWh]": 26.37, "Ancillary Service Charge [c/kWh]": 0.41, "Network Capacity Charge [R/POD/day]": 27.07, "Generation Capacity Charge [R/POD/day]": 1.27, "Service and Administration Charge [R/POD/day]": 3.27 },
  { "Tariff": "Homeflex 3", "Legacy Charge [c/kWh]": 22.78, "Network Demand Charge [c/kWh]": 26.37, "Ancillary Service Charge [c/kWh]": 0.41, "Network Capacity Charge [R/POD/day]": 57.82, "Generation Capacity Charge [R/POD/day]": 3.10, "Service and Administration Charge [R/POD/day]": 3.27 },
  { "Tariff": "Homeflex 4", "Legacy Charge [c/kWh]": 22.78, "Network Demand Charge [c/kWh]": 26.37, "Ancillary Service Charge [c/kWh]": 0.41, "Network Capacity Charge [R/POD/day]": 8.35, "Generation Capacity Charge [R/POD/day]": 0.47, "Service and Administration Charge [R/POD/day]": 3.27 }
];

/* ---------- Homeflex TOU buy & rebate rates (VAT-exclusive, c/kWh) ---------- */
// Eskom Holdings SOC Ltd. (2025a)
const HF_ENERGY = {
  high: { peak: 706.97, standard: 216.31, offpeak: 159.26 },
  low:  { peak: 329.28, standard: 204.90, offpeak: 159.26 }
};
const HF_REBATE = {
  high: { peak: 650.52, standard: 185.41, offpeak: 131.21 },
  low:  { peak: 292.75, standard: 174.58, offpeak: 131.21 }
};

/* ---------- Season & date helpers ---------- */
// URL support: ?start=YYYY-MM-DD&end=YYYY-MM-DD (no UI change)
function parseISO(d){ const t = new Date(d); return Number.isNaN(t.getTime()) ? null : t; }
function firstOfMonth(date){ return new Date(date.getFullYear(), date.getMonth(), 1); }
function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate()+n); return d; }
function daysBetweenDates(a,b){ return Math.max(0, Math.floor((b - a) / 86400000) + 1); }
function isHighMonth(m){ return m===5 || m===6 || m===7; } // Jun, Jul, Aug

function seasonDaySplit(start, end){
  let high=0, low=0;
  for (let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
    isHighMonth(d.getMonth()) ? high++ : low++;
  }
  const total = high+low;
  return { high, low, total, fHigh: total ? high/total : 0, fLow: total ? low/total : 0 };
}
function inferDateRange(days){
  const params = new URLSearchParams(location.search);
  const sStr = params.get('start');
  const eStr = params.get('end');
  const s = sStr ? parseISO(sStr) : null;
  const e = eStr ? parseISO(eStr) : null;
  if (s && e && e >= s) return { start: s, end: e };
  const today = new Date();
  const start = firstOfMonth(today);
  const end = addDays(start, Math.max(0, Math.round(days) - 1));
  return { start, end };
}
function inferSeasonFractions(days){
  const { start, end } = inferDateRange(days);
  return seasonDaySplit(start, end);
}

/* ---------- Homeflex TOU wheels & explicit PH mapping (2025/26) ---------- */
// Wheels: Eskom 2025/26 (Eskom Holdings SOC Ltd., 2025a)
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
  const m = date.getMonth();
  return (m===5 || m===6 || m===7) ? 'high' : 'low';
}

// 2025/26 PH mapping: use LAST COLUMN (Megaflex/Miniflex/WEPS/Megaflex Gen) — Eskom (2025b)
const HF_PH_2025_26 = {
  // 2025
  '2025-04-18': 'sunday',   // Good Friday
  '2025-04-21': 'sunday',   // Family Day
  '2025-04-27': 'sunday',   // Freedom Day (Sunday)
  '2025-04-28': 'saturday', // Observed Monday
  '2025-05-01': 'saturday', // Workers’ Day
  '2025-06-16': 'saturday', // Youth Day
  '2025-08-09': 'saturday', // National Women's Day (Saturday)
  '2025-09-24': 'saturday', // Heritage Day
  '2025-12-16': 'saturday', // Day of Reconciliation
  '2025-12-25': 'sunday',   // Christmas Day
  '2025-12-26': 'sunday',   // Day of Goodwill
  // 2026
  '2026-01-01': 'sunday',   // New Year’s Day
  '2026-03-21': 'saturday', // Human Rights Day (Saturday)
  '2026-04-03': 'sunday',   // Good Friday
  '2026-04-06': 'sunday',   // Family Day
  '2026-04-27': 'sunday',   // Freedom Day
  '2026-05-01': 'saturday', // Workers’ Day
  '2026-06-16': 'saturday'  // Youth Day
};
function homeflexDayType(date){
  const key = iso(date);
  const mapped = HF_PH_2025_26[key]; // 'saturday' | 'sunday' | undefined
  if (mapped) return mapped;
  const d = date.getDay();
  if (d === 6) return 'saturday';
  if (d === 0) return 'sunday';
  return 'weekday';
}
function countHomeflexTouHours(startISO, endISO){
  const s = new Date(startISO);
  const e = new Date(endISO);
  const cursor = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0);
  const endHour = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 0, 0);

  const counts = { high: { peak:0, standard:0, offpeak:0 }, low: { peak:0, standard:0, offpeak:0 } };
  while (cursor <= endHour) {
    const season = seasonOf(cursor);
    const type = homeflexDayType(cursor);
    const hour = cursor.getHours();
    const cfg = HF_TOU[season][type];
    if (inAny(hour, cfg.peak)) counts[season].peak++;
    else if (inAny(hour, cfg.standard)) counts[season].standard++;
    else counts[season].offpeak++;
    cursor.setHours(cursor.getHours()+1);
  }
  return counts;
}

/* ---------- helpers ---------- */
const keyUnit = (k) => (k.match(/\[(.*?)\]/)?.[1] || "");
const isEnergyKey = (k) => keyUnit(k) === "c/kWh";
function isFixedKey(k){ return keyUnit(k).toLowerCase() === "r/pod/day"; }
const catOf = (tName) => tName.split(" ")[0];
const isHomeflexTariff = (name) => /^Homeflex\s[1-4]$/.test(name);

/* ---------- state ---------- */
const state = {
  categories: new Set(["Homepower", "Homelight", "Homeflex"]),
  selected: [],
  vatInclusive: true,
  kwh: 500,
  days: 30.437,
  hf: {
    cons: { peak: 0, standard: 0, offpeak: 0 },
    exp:  { peak: 0, standard: 0, offpeak: 0 }
  },
  breakdownOpen: false
};

/* ---------- DOM ---------- */
const dom = {};
function q(id){ return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", () => {
  dom.catGroup    = q("categoryGroup");
  dom.catHint     = q("catHint");

  dom.options     = q("tariffOptions");
  dom.selCounter  = q("selCounter");
  dom.selWarning  = q("selWarning");
  dom.clearSelBtn = q("clearSelBtn");

  dom.vatToggle   = q("vatToggle");
  dom.vatLabel    = q("vatModeLabel");

  dom.kwhInput    = q("kwhInput");
  dom.daysInput   = q("daysInput");

  dom.hfInputs    = q("hfInputs");
  dom.hfConsPeak  = q("hfConsPeak");
  dom.hfConsStd   = q("hfConsStd");
  dom.hfConsOff   = q("hfConsOff");
  dom.hfExpPeak   = q("hfExpPeak");
  dom.hfExpStd    = q("hfExpStd");
  dom.hfExpOff    = q("hfExpOff");

  dom.billChart   = q("billChart");
  dom.splitChart  = q("splitChart");
  dom.billTable   = q("billTable").querySelector("tbody");
  dom.compTable   = q("componentTable").querySelector("tbody");
  dom.billTotalHdr= q("billTotalHdr");

  injectBreakdownUI();

  // Categories
  dom.catGroup.querySelectorAll("input.cat").forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) state.categories.add(cb.value);
      else state.categories.delete(cb.value);
      state.selected = state.selected.filter(name => state.categories.has(catOf(name)));
      renderOptions();
      updateSelCounter();
      renderAll();
    });
  });

  // VAT
  dom.vatToggle.addEventListener("change", () => {
    state.vatInclusive = dom.vatToggle.checked;
    dom.vatLabel.textContent = `VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}`;
    dom.billTotalHdr.textContent = `Total (VAT ${state.vatInclusive ? "incl." : "excl."})`;
    renderAll();
  });

  // Inputs
  dom.kwhInput.addEventListener("input", () => {
    state.kwh = Math.max(0, Number(dom.kwhInput.value) || 0);
    renderAll();
  });
  dom.daysInput.addEventListener("input", () => {
    let d = parseFloat(dom.daysInput.value);
    if (!Number.isFinite(d)) d = 1;
    if (d < 1) d = 1; if (d > 31) d = 31;
    dom.daysInput.value = d;
    state.days = d;
    renderAll();
  });

  // Homeflex TOU inputs
  const hfWire = (el, path) => {
    el.addEventListener('input', () => {
      const v = Math.max(0, Number(el.value) || 0);
      const [grp, key] = path;
      state.hf[grp][key] = v;
      renderAll();
    });
  };
  hfWire(dom.hfConsPeak, ['cons','peak']);
  hfWire(dom.hfConsStd,  ['cons','standard']);
  hfWire(dom.hfConsOff,  ['cons','offpeak']);
  hfWire(dom.hfExpPeak,  ['exp','peak']);
  hfWire(dom.hfExpStd,   ['exp','standard']);
  hfWire(dom.hfExpOff,   ['exp','offpeak']);

  // Clear selection
  dom.clearSelBtn.addEventListener("click", () => {
    state.selected = [];
    dom.options.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    updateSelCounter();
    renderAll();
  });

  // Initial paint
  dom.vatLabel.textContent = "VAT: Inclusive";
  renderOptions();
  autoPreselect(2);
  renderAll();
});

/* ---------- UI Injection for Breakdown Card ---------- */
function injectBreakdownUI(){
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;justify-content:flex-end;margin:.75rem 0 1.25rem;';
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn-ghost';
  toggleBtn.type = 'button';
  toggleBtn.textContent = 'Show full breakdown comparison';
  btnRow.appendChild(toggleBtn);

  const grid = document.querySelector('.card-grid');
  grid.parentNode.insertBefore(btnRow, grid);

  const card = document.createElement('section');
  card.className = 'card';
  card.style.display = 'none';
  card.innerHTML = `
    <h2 style="margin-bottom:.4rem;">Full breakdown comparison</h2>
    <p class="muted" style="margin-bottom:.8rem;">Detailed view of all charge components using your current kWh, days and VAT mode.</p>
    <div id="breakdownWrap">
      <div style="overflow-x:auto;">
        <table class="tariff-table" id="breakdownTable">
          <thead>
            <tr>
              <th>Tariff</th>
              <th>Active energy</th>
              <th>Legacy Charge</th>
              <th>Ancillary service</th>
              <th>Network demand</th>
              <th>Electrification subsidy</th>
              <th><em>Energy total</em></th>
              <th>Network capacity</th>
              <th>Generation capacity</th>
              <th>Service &amp; admin</th>
              <th><em>Fixed total</em></th>
              <th>VAT</th>
              <th><strong>Total</strong></th>
            </tr>
          </thead>
          <tbody><!-- injected --></tbody>
        </table>
      </div>
      <div id="piesRow" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-top:1rem;"></div>
      <div id="piesLegend" style="margin-top:.6rem;"></div>
    </div>
  `;
  grid.parentNode.insertBefore(card, grid.nextSibling);

  toggleBtn.addEventListener('click', () => {
    state.breakdownOpen = !state.breakdownOpen;
    card.style.display = state.breakdownOpen ? '' : 'none';
    toggleBtn.textContent = state.breakdownOpen ? 'Hide full breakdown comparison' : 'Show full breakdown comparison';
    if (state.breakdownOpen) renderBreakdown();
  });

  dom.breakdownCard = card;
  dom.breakdownTableBody = card.querySelector('#breakdownTable tbody');
  dom.piesRow = card.querySelector('#piesRow');
  dom.piesLegend = card.querySelector('#piesLegend');
}

/* ---------- option rendering & selection ---------- */
function renderOptions() {
  dom.options.innerHTML = "";
  const cats = state.categories;
  if (!cats.size) {
    dom.catHint.textContent = "Tick at least one category to load tariffs.";
    return;
  }
  dom.catHint.textContent = "";

  const items = tariffData.filter(t => cats.has(catOf(t.Tariff)));

  items.forEach(t => {
    const id = "opt_" + t.Tariff.replace(/\s+/g, "_");
    const wrap = document.createElement("label");
    wrap.className = "option-tile";
    wrap.innerHTML = `
      <input type="checkbox" id="${id}" value="${t.Tariff}">
      <span>${t.Tariff}</span>
      <span class="pill">${catOf(t.Tariff)}</span>
    `;
    const cb = wrap.querySelector("input");
    cb.checked = state.selected.includes(t.Tariff);
    cb.addEventListener("change", () => onSelectChange(cb));
    dom.options.appendChild(wrap);
  });
}
function onSelectChange(cb) {
  const name = cb.value;
  if (cb.checked) {
    if (state.selected.length >= MAX_SELECT) {
      cb.checked = false;
      dom.selWarning.style.display = "";
      return;
    }
    dom.selWarning.style.display = "none";
    state.selected.push(name);
  } else {
    state.selected = state.selected.filter(n => n !== name);
  }
  updateSelCounter();
  toggleHomeflexInputs();
  renderAll();
}
function updateSelCounter() {
  dom.selCounter.textContent = `${state.selected.length}/${MAX_SELECT} selected`;
}
function anyHomeflexSelected(){
  return state.selected.some(n => isHomeflexTariff(n));
}
function toggleHomeflexInputs(){
  if (!dom.hfInputs) return;
  dom.hfInputs.style.display = anyHomeflexSelected() ? '' : 'none';
}
function autoPreselect(n) {
  const cbs = dom.options.querySelectorAll("input[type=checkbox]");
  let count = 0;
  for (let i = 0; i < cbs.length && count < n; i++) {
    if (!cbs[i].checked) {
      cbs[i].checked = true;
      state.selected.push(cbs[i].value);
      count++;
    }
  }
  updateSelCounter();
  toggleHomeflexInputs();
}

/* ---------- component keys ---------- */
const ENERGY_COMPONENT_KEYS = [
  "Energy Charge [c/kWh]", // for non-Homeflex active-energy tariffs
  "Legacy Charge [c/kWh]",
  "Ancillary Service Charge [c/kWh]",
  "Network Demand Charge [c/kWh]",
  "Netword Demand Charge [c/kWh]",
  "Electrification and Rural Network Subsidy Charge [c/kWh]"
];
const FIXED_COMPONENT_KEYS = [
  "Network Capacity Charge [R/POD/day]",
  "Generation Capacity Charge [R/POD/day]",
  "Service and Administration Charge [R/POD/day]"
];

function canonicalizeLabel(raw){
  const base = String(raw).replace(/\s*\[.*?\]\s*/,'');
  if (base.toLowerCase().startsWith('energy charge')) return 'Active energy';
  if (base.toLowerCase().startsWith('legacy charge')) return 'Legacy Charge';
  if (base.toLowerCase().startsWith('ancillary service')) return 'Ancillary service';
  if (base.toLowerCase().startsWith('network demand') || base.toLowerCase().startsWith('netword demand')) return 'Network demand';
  if (base.toLowerCase().startsWith('electrification and rural network subsidy')) return 'Electrification subsidy';
  if (base.toLowerCase().startsWith('network capacity')) return 'Network capacity';
  if (base.toLowerCase().startsWith('generation capacity')) return 'Generation capacity';
  if (base.toLowerCase().startsWith('service and administration')) return 'Service & admin';
  return base;
}

/* ---------- Homeflex active energy using hour counts (per-band, per-season) ---------- */
function homeflexActiveEnergyRandFromHours(hourCounts) {
  const c = state.hf.cons, e = state.hf.exp;

  const bandHours = {
    peak:     (hourCounts?.high?.peak     || 0) + (hourCounts?.low?.peak     || 0),
    standard: (hourCounts?.high?.standard || 0) + (hourCounts?.low?.standard || 0),
    offpeak:  (hourCounts?.high?.offpeak  || 0) + (hourCounts?.low?.offpeak  || 0),
  };

  function splitBySeason(band, kwh){
    const totalH = bandHours[band] || 0;
    if (!totalH || kwh <= 0) return { high:0, low:0 };
    const hi = hourCounts.high[band] || 0;
    const lo = hourCounts.low[band]  || 0;
    return { high: kwh * (hi/totalH), low: kwh * (lo/totalH) };
  }

  const cons = {
    peak:     splitBySeason('peak', c.peak),
    standard: splitBySeason('standard', c.standard),
    offpeak:  splitBySeason('offpeak', c.offpeak)
  };
  const exp  = {
    peak:     splitBySeason('peak', e.peak),
    standard: splitBySeason('standard', e.standard),
    offpeak:  splitBySeason('offpeak', e.offpeak)
  };

  const energyChargeEx = (split, rates) => (split.high * rates.high/100) + (split.low * rates.low/100);
  const buy =
      energyChargeEx(cons.peak,     {high:HF_ENERGY.high.peak,     low:HF_ENERGY.low.peak}) +
      energyChargeEx(cons.standard, {high:HF_ENERGY.high.standard, low:HF_ENERGY.low.standard}) +
      energyChargeEx(cons.offpeak,  {high:HF_ENERGY.high.offpeak,  low:HF_ENERGY.low.offpeak});

  const rebateCreditEx = (expSplit, consSplit, rates) => {
    const hiK = Math.min(expSplit.high, consSplit.high);
    const loK = Math.min(expSplit.low,  consSplit.low);
    return hiK * (rates.high/100) + loK * (rates.low/100);
  };
  const rebate =
      rebateCreditEx(exp.peak,     cons.peak,     {high:HF_REBATE.high.peak,     low:HF_REBATE.low.peak}) +
      rebateCreditEx(exp.standard, cons.standard, {high:HF_REBATE.high.standard, low:HF_REBATE.low.standard}) +
      rebateCreditEx(exp.offpeak,  cons.offpeak,  {high:HF_REBATE.high.offpeak,  low:HF_REBATE.low.offpeak});

  return Math.max(0, buy - rebate); // R, excl VAT
}

/* ---------- core calcs ---------- */
function energyCentsPerKwhTotal(t) {
  // Sum only the defined c/kWh keys on the object (DO NOT include Homeflex TOU buy here)
  return Object.keys(t).reduce((acc, k) => acc + (isEnergyKey(k) ? (t[k] || 0) : 0), 0);
}
function fixedRandsPerDayTotal(t) {
  return Object.keys(t).reduce((acc, k) => acc + (isFixedKey(k) ? (t[k] || 0) : 0), 0);
}

function componentBreakdownRand(t, kwhGeneric, days, hourCounts) {
  const items = [];
  if (isHomeflexTariff(t.Tariff)) {
    // Active energy (TOU, net of rebate) via hour counts
    items.push({ label: 'Active energy', amountR: homeflexActiveEnergyRandFromHours(hourCounts), kind:'energy' });

    // Other energy-based components applied to total TOU consumption
    const kwhTotal = state.hf.cons.peak + state.hf.cons.standard + state.hf.cons.offpeak;
    ["Legacy Charge [c/kWh]","Ancillary Service Charge [c/kWh]","Network Demand Charge [c/kWh]","Netword Demand Charge [c/kWh]","Electrification and Rural Network Subsidy Charge [c/kWh]"]
      .forEach(k => { if (t[k] != null) items.push({ label: canonicalizeLabel(k), amountR: (t[k]||0)/100 * kwhTotal, kind:'energy' }); });
  } else {
    // Non-Homeflex: active energy is via summed c/kWh * generic kWh
    for (const k of ENERGY_COMPONENT_KEYS) {
      if (t[k] != null) items.push({ label: canonicalizeLabel(k), amountR: (t[k]||0)/100 * kwhGeneric, kind:'energy' });
    }
  }
  for (const k of FIXED_COMPONENT_KEYS) {
    if (t[k] != null) items.push({ label: canonicalizeLabel(k), amountR: (t[k]||0) * days, kind:'fixed' });
  }
  return items;
}

function calcBill(t, kwhGeneric, days, vatIncl, hourCounts) {
  let energyR_excl = 0;

  if (isHomeflexTariff(t.Tariff)) {
    const kwhTotal = state.hf.cons.peak + state.hf.cons.standard + state.hf.cons.offpeak;
    const activeR = homeflexActiveEnergyRandFromHours(hourCounts);
    const otherEnergyCents = ["Legacy Charge [c/kWh]","Ancillary Service Charge [c/kWh]","Network Demand Charge [c/kWh]","Netword Demand Charge [c/kWh]","Electrification and Rural Network Subsidy Charge [c/kWh]"]
      .reduce((a,k) => a + (t[k]||0), 0);
    energyR_excl = activeR + (otherEnergyCents/100) * kwhTotal;
  } else {
    const energyCents = Object.keys(t).reduce((acc, k) => acc + (isEnergyKey(k) ? (t[k] || 0) : 0), 0);
    energyR_excl = (energyCents / 100) * kwhGeneric;
  }

  const fixedR_excl  = fixedRandsPerDayTotal(t) * days;
  const sub_excl = energyR_excl + fixedR_excl;
  const vat   = vatIncl ? sub_excl * VAT_RATE : 0;
  const total = sub_excl + vat;
  return { energyR_excl, fixedR_excl, sub_excl, vat, total };
}

/* ---------- charts & tables ---------- */
function renderAll() {
  const items = state.selected
    .map(name => tariffData.find(t => t.Tariff === name))
    .filter(Boolean);

  // Date range (for Homeflex hour counting)
  const { start, end } = inferDateRange(state.days);
  const hourCounts = countHomeflexTouHours(iso(start), iso(end)); // safe even if no Homeflex selected

  renderComponentTable(items, hourCounts);
  renderBillTable(items, hourCounts);
  renderBillChart(items, hourCounts);
  renderSplitChart(items, hourCounts);
  if (state.breakdownOpen) renderBreakdown(hourCounts);
}

function renderComponentTable(items) {
  dom.compTable.innerHTML = "";
  items.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.Tariff}</td>
      <td>${cents(energyCentsPerKwhTotal(t))}</td>
      <td>${perDay(fixedRandsPerDayTotal(t))}</td>
    `;
    dom.compTable.appendChild(tr);
  });
}

function renderBillTable(items, hourCounts) {
  dom.billTable.innerHTML = "";
  items.forEach(t => {
    const r = calcBill(t, state.kwh, state.days, state.vatInclusive, hourCounts);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.Tariff}</td>
      <td>${money(r.energyR_excl)}</td>
      <td>${money(r.fixedR_excl)}</td>
      <td>${state.vatInclusive ? money(r.vat) : "—"}</td>
      <td>${money(r.total)}</td>
    `;
    dom.billTable.appendChild(tr);
  });
}

/* ---------- lightweight SVG helpers ---------- */
function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs || {}).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}
function rect(x,y,w,h,fill){ return svgEl("rect", { x, y, width:w, height:h, fill, rx:8, ry:8 }); }
function text(x,y,str,{anchor="start",size=12,color=THEME.ink}={}) {
  const t = svgEl("text", { x, y, "text-anchor": anchor, "font-size": size, fill: color, "dominant-baseline":"middle", "font-family":"system-ui, Segoe UI, Roboto, Arial" });
  t.textContent = str;
  return t;
}
function polarToCartesian(cx, cy, r, angleRad){
  return { x: cx + r*Math.cos(angleRad), y: cy + r*Math.sin(angleRad) };
}
function arcPath(cx, cy, r, startAngle, endAngle, innerR=0){
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const arcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  if (innerR <= 0) {
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${arcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
  }
  const start2 = polarToCartesian(cx, cy, innerR, endAngle);
  const end2   = polarToCartesian(cx, cy, innerR, startAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${arcFlag} 0 ${end.x} ${end.y} L ${end2.x} ${end2.y} A ${innerR} ${innerR} 0 ${arcFlag} 1 ${start2.x} ${start2.y} Z`;
}

/* Horizontal bar chart */
function drawBarChart(container, labels, values, { unit = "" } = {}) {
  container.innerHTML = "";
  const w = container.clientWidth || 680;
  const h = container.clientHeight || 240;
  const pad = 28;
  const rowH = Math.max(18, Math.min(38, (h - pad*2) / Math.max(1, labels.length)));
  const max = Math.max(1, Math.max(...values, 0));
  const svg = svgEl("svg", { width: w, height: h });

  const barColor = THEME.primary;
  const txtOnBar = getTextColorForBg(barColor);
  const fontSize = 12;

  labels.forEach((lab, i) => {
    const y = pad + i * rowH;
    const val = values[i] || 0;
    const barW = ((w - pad*2) * val) / max;
    const valueStr = unit === "R" ? `R ${val.toFixed(2)}` : val.toFixed(2);

    svg.appendChild(rect(pad, y + rowH*0.2, w - pad*2, rowH*0.6, THEME.surface2));
    svg.appendChild(rect(pad, y + rowH*0.2, barW, rowH*0.6, barColor));

    const labW = estimateTextWidth(lab, fontSize);
    const valW = estimateTextWidth(valueStr, fontSize);
    const insidePadding = 10;

    if (barW > labW + insidePadding * 2) {
      svg.appendChild(text(pad + insidePadding, y + rowH*0.5, lab, { anchor: "start", size: fontSize, color: txtOnBar }));
    } else {
      svg.appendChild(text(pad - 6, y + rowH*0.5, lab, { anchor: "end", size: fontSize, color: "white" }));
    }
    if (barW > valW + insidePadding * 2) {
      svg.appendChild(text(pad + barW - insidePadding, y + rowH*0.5, valueStr, { anchor: "end", size: fontSize, color: txtOnBar }));
    } else {
      svg.appendChild(text(pad + barW + insidePadding, y + rowH*0.5, valueStr, { anchor: "start", size: fontSize, color: "black" }));
    }
  });

  container.appendChild(svg);
}

/* 100% stacked split (energy vs fixed) */
function drawStackedPctChart(container, labels, pairs) {
  container.innerHTML = "";
  const w = container.clientWidth || 680;
  const h = container.clientHeight || 200;
  const pad = 28;
  const rowH = Math.max(18, Math.min(34, (h - pad*2) / Math.max(1, labels.length)));
  const svg = svgEl("svg", { width: w, height: h });

  labels.forEach((lab, i) => {
    const y = pad + i * rowH;
    const e = Math.max(0, Math.min(100, pairs[i].energyPct || 0));
    const f = Math.max(0, 100 - e);
    const eW = (w - pad*2) * (e / 100);
    const fW = (w - pad*2) - eW;

    svg.appendChild(rect(pad, y + rowH*0.2, w - pad*2, rowH*0.6, THEME.surface3));
    svg.appendChild(rect(pad, y + rowH*0.2, eW, rowH*0.6, THEME.energy));
    svg.appendChild(rect(pad + eW, y + rowH*0.2, fW, rowH*0.6, THEME.fixed));

    svg.appendChild(text(pad + 8, y + rowH*0.5, `${lab}`, { anchor: "start", size: 12, color: THEME.ink }));
    svg.appendChild(text(w - 8, y + rowH*0.5, `${e.toFixed(0)}% / ${f.toFixed(0)}%`, { anchor: "end", size: 12, color: THEME.ink }));
  });

  container.appendChild(svg);
}

function renderBillChart(items, hourCounts) {
  const labels = items.map(t => t.Tariff);
  const totals = items.map(t => calcBill(t, state.kwh, state.days, state.vatInclusive, hourCounts).total);
  drawBarChart(dom.billChart, labels, totals, { unit: "R" });
}
function renderSplitChart(items, hourCounts) {
  const labels = items.map(t => t.Tariff);
  const pairs = items.map(t => {
    const r = calcBill(t, state.kwh, state.days, false, hourCounts);
    const total = r.sub_excl || 1;
    return {
      energyPct: (r.energyR_excl / total) * 100,
      fixedPct:  (r.fixedR_excl  / total) * 100
    };
  });
  drawStackedPctChart(dom.splitChart, labels, pairs);
}

/* ---------- Full breakdown card (hidden by default) ---------- */
function renderBreakdown(hourCounts){
  dom.breakdownTableBody.innerHTML = "";
  dom.piesRow.innerHTML = "";
  dom.piesLegend.innerHTML = "";

  const selectedTariffs = state.selected
    .map(name => tariffData.find(t => t.Tariff === name))
    .filter(Boolean);

  const seen = new Set();
  const amountByCanon = (comps, canonLabel) => {
    const hit = comps.find(c => c.label === canonLabel);
    return hit ? money(hit.amountR) : '—';
  };

  selectedTariffs.forEach((t) => {
    const kwhGeneric = state.kwh;
    const comps = componentBreakdownRand(t, kwhGeneric, state.days, hourCounts);
    const energyTotal = comps.filter(c => c.kind==='energy').reduce((a,c)=>a+c.amountR,0);
    const fixedTotal  = comps.filter(c => c.kind==='fixed').reduce((a,c)=>a+c.amountR,0);
    const sub_excl = energyTotal + fixedTotal;
    const vat = state.vatInclusive ? sub_excl * VAT_RATE : 0;
    const total = state.vatInclusive ? sub_excl + vat : sub_excl;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.Tariff}</td>
      <td>${amountByCanon(comps, 'Active energy')}</td>
      <td>${amountByCanon(comps, 'Legacy Charge')}</td>
      <td>${amountByCanon(comps, 'Ancillary service')}</td>
      <td>${amountByCanon(comps, 'Network demand')}</td>
      <td>${amountByCanon(comps, 'Electrification subsidy')}</td>
      <td><em>${money(energyTotal)}</em></td>
      <td>${amountByCanon(comps, 'Network capacity')}</td>
      <td>${amountByCanon(comps, 'Generation capacity')}</td>
      <td>${amountByCanon(comps, 'Service & admin')}</td>
      <td><em>${money(fixedTotal)}</em></td>
      <td>${state.vatInclusive ? money(vat) : '—'}</td>
      <td><strong>${money(total)}</strong></td>
    `;
    dom.breakdownTableBody.appendChild(tr);

    const pieBox = document.createElement('div');
    const items = [];

    comps.forEach(c => {
      const colorMap = {
        'Active energy': THEME.pieColors[0],
        'Legacy Charge': THEME.pieColors[1],
        'Ancillary service': THEME.pieColors[2],
        'Network demand': THEME.pieColors[3],
        'Electrification subsidy': THEME.pieColors[4],
        'Network capacity': THEME.pieColors[5],
        'Generation capacity': THEME.pieColors[6],
        'Service & admin': THEME.pieColors[1] // reuse
      };
      if (c.amountR > 0) {
        items.push({ label: c.label, value: c.amountR, color: colorMap[c.label] || THEME.pieColors[0] });
        seen.add(c.label);
      }
    });
    if (state.vatInclusive) {
      items.push({ label: 'VAT', value: sub_excl * VAT_RATE, color: VAT_COLOR });
      seen.add('VAT');
    }

    drawDonut(pieBox, t.Tariff, items);
    dom.piesRow.appendChild(pieBox);
  });

  // Legend
  dom.piesLegend.innerHTML = "";
  const legend = document.createElement('div');
  legend.style.display = 'grid';
  legend.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  legend.style.gap = '.45rem .9rem';
  Array.from(seen).forEach(lbl => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '.5rem';
    const sw = document.createElement('span');
    sw.style.width='14px'; sw.style.height='14px'; sw.style.borderRadius='3px';
    const colorMap = {
      'Active energy': THEME.pieColors[0],
      'Legacy Charge': THEME.pieColors[1],
      'Ancillary service': THEME.pieColors[2],
      'Network demand': THEME.pieColors[3],
      'Electrification subsidy': THEME.pieColors[4],
      'Network capacity': THEME.pieColors[5],
      'Generation capacity': THEME.pieColors[6],
      'Service & admin': THEME.pieColors[1],
      'VAT': VAT_COLOR
    };
    sw.style.background = colorMap[lbl] || THEME.pieColors[0];
    const txt = document.createElement('span');
    txt.style.fontSize = '.95rem';
    txt.style.color = THEME.inkMuted;
    txt.textContent = lbl;
    row.appendChild(sw); row.appendChild(txt);
    legend.appendChild(row);
  });
  dom.piesLegend.appendChild(legend);
}

/* ---------- Donut helpers ---------- */
function drawDonut(container, title, items) {
  const w = 260, h = 260, cx = w/2, cy = h/2 - 6, r = 92, inner = 54;
  const sum = items.reduce((a,c)=>a+(c.value||0),0) || 1;
  let angle = -Math.PI/2;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.style.display = 'block';
  svg.style.margin = 'auto';

  items.forEach(it => {
    if (!it.value) return;
    const frac = it.value / sum;
    const end = angle + frac * Math.PI * 2;
    const path = svgEl("path", { d: arcPath(w/2,h/2,r,angle,end,inner), fill: it.color, stroke: '#fff', 'stroke-width': 1 });
    const tip = svgEl("title", {});
    tip.textContent = `${it.label}: ${money(it.value)}`;
    path.appendChild(tip);
    svg.appendChild(path);
    angle = end;
  });

  svg.appendChild(text(cx, cy, money(sum), { anchor: "middle", size: 12, color: THEME.ink }));
  svg.appendChild(text(cx, h-14, title, { anchor: "middle", size: 12, color: THEME.inkMuted }));

  container.appendChild(svg);
}



