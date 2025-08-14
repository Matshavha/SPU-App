// compareTariffs.js — theme-aware charts, VAT toggle, up to 5 tariffs
// Single legend for all breakdown pies + safe labels in all charts

const VAT_RATE = 0.15;
const MAX_SELECT = 5;

/* ---------- Theme helpers (pull from style.css, with fallbacks) ---------- */
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const THEME = {
  primary:   cssVar('--primary', '#003896'),      // Eskom blue
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

/* Decide text colour for contrast on a given rgb(...) color */
function getTextColorForBg(rgb) {
  const nums = (rgb.match(/\d+/g) || []).map(Number);
  if (nums.length < 3) return '#000';
  const [r, g, b] = nums;
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
}

/* Rough text width estimator (for SVG placement decisions) */
function estimateTextWidth(text, fontSize = 12) {
  return Math.max(6, text.length * fontSize * 0.6);
}

/* ---------- Tariff data (keep in sync with spuTariffsmart.js) ---------- */
const tariffData = [
  { "Tariff": "Businessrate 1", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/Pod/Day]": 20.34, "Service and Administration Charge [R/Pod/Day]": 14.70, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/Pod/Day]": 1.98 },
  { "Tariff": "Businessrate 2", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/Pod/Day]": 30.21, "Service and Administration Charge [R/Pod/Day]": 14.70, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/Pod/Day]": 2.95 },
  { "Tariff": "Businessrate 3", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/Pod/Day]": 75.38, "Service and Administration Charge [R/Pod/Day]": 14.70, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/Pod/Day]": 7.37 },
  { "Tariff": "Businessrate 4", "Energy Charge [c/kWh]": 350.09, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 14.54, "Network Capacity Charge [R/Pod/Day]": null, "Service and Administration Charge [R/Pod/Day]": null, "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94, "Generation Capacity Charge [R/Pod/Day]": 0.00 },

  { "Tariff": "Homepower 1", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/Pod/Day]": 12.13, "Service and Administration Charge [R/Pod/Day]": 3.27, "Generation Capacity Charge [R/Pod/Day]": 0.72 },
  { "Tariff": "Homepower 2", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/Pod/Day]": 27.07, "Service and Administration Charge [R/Pod/Day]": 3.27, "Generation Capacity Charge [R/Pod/Day]": 1.27 },
  { "Tariff": "Homepower 3", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/Pod/Day]": 57.82, "Service and Administration Charge [R/Pod/Day]": 3.27, "Generation Capacity Charge [R/Pod/Day]": 3.1 },
  { "Tariff": "Homepower 4", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/Pod/Day]": 8.35, "Service and Administration Charge [R/Pod/Day]": 3.27, "Generation Capacity Charge [R/Pod/Day]": 0.47 },
  { "Tariff": "Homepower Bulk", "Energy Charge [c/kWh]": 268.78, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 26.37, "Network Capacity Charge [R/Pod/Day]": 8.35, "Service and Administration Charge [R/Pod/Day]": 3.27, "Generation Capacity Charge [R/Pod/Day]": 4.48 },

  { "Tariff": "Homelight 20A", "Energy Charge [c/kWh]": 216.11 },
  { "Tariff": "Homelight 60A", "Energy Charge [c/kWh]": 274.72 },

  { "Tariff": "Landrate 1", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/Pod/Day]": 62.2, "Service and Administration Charge [R/Pod/Day]": 24.5, "Generation Capacity Charge [R/Pod/Day]": 2.71 },
  { "Tariff": "Landrate 2", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/Pod/Day]": 96.99, "Service and Administration Charge [R/Pod/Day]": 24.5, "Generation Capacity Charge [R/Pod/Day]": 5.37 },
  { "Tariff": "Landrate 3", "Energy Charge [c/kWh]": 224.93, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/Pod/Day]": 155.32, "Service and Administration Charge [R/Pod/Day]": 24.5, "Generation Capacity Charge [R/Pod/Day]": 10.5 },
  { "Tariff": "Landrate 4", "Energy Charge [c/kWh]": 369.32, "Ancillary Service Charge [c/kWh]": 0.41, "Netword Demand Charge [c/kWh]": 61.66, "Network Capacity Charge [R/Pod/Day]": 45.92, "Generation Capacity Charge [R/Pod/Day]": 1.78 },
  { "Tariff": "LandrateDx*", "Service and Administration Charge [R/Pod/Day]": 87 },

  { "Tariff": "Landlight 20A", "Energy Charge [c/kWh]": 603.54 },
  { "Tariff": "Landlight 60A", "Energy Charge [c/kWh]": 836 },

  /* ✅ Added Municrate 1–4 (VAT-exclusive values; units per spec R/POD/day) */
  { "Tariff": "Municrate 1", "Energy Charge [c/kWh]": 229.79, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": 34.06, "Service and Administration Charge [R/POD/day]": 18.81, "Generation Capacity Charge [R/POD/day]": 2.17 },
  { "Tariff": "Municrate 2", "Energy Charge [c/kWh]": 229.79, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": 69.01, "Service and Administration Charge [R/POD/day]": 18.81, "Generation Capacity Charge [R/POD/day]": 4.01 },
  { "Tariff": "Municrate 3", "Energy Charge [c/kWh]": 229.79, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": 138.21, "Service and Administration Charge [R/POD/day]": 18.81, "Generation Capacity Charge [R/POD/day]": 8.46 },
  { "Tariff": "Municrate 4", "Energy Charge [c/kWh]": 349.28, "Ancillary Service Charge [c/kWh]": 0.41, "Network Demand Charge [c/kWh]": 43.60, "Network Capacity Charge [R/POD/day]": null, "Service and Administration Charge [R/POD/day]": null, "Generation Capacity Charge [R/POD/day]": null }
];

/* ---------- helpers ---------- */
const keyUnit = (k) => (k.match(/\[(.*?)\]/)?.[1] || "");
const isEnergyKey = (k) => keyUnit(k) === "c/kWh";
/* ✅ Accept both historical [R/Pod/Day] and new [R/POD/day] spellings */
function isFixedKey(k){
  const u = keyUnit(k).toLowerCase();
  return u === "r/pod/day";
}
/* ✅ Normalize money label text to R/POD/day */
const withVat = (v, incl) => (v == null ? 0 : (incl ? v * (1 + VAT_RATE) : v));
const catOf = (tName) => tName.split(" ")[0];

function energyCentsPerKwhTotal(t) {
  return Object.keys(t).reduce((acc, k) => acc + (isEnergyKey(k) ? (t[k] || 0) : 0), 0);
}
function fixedRandsPerDayTotal(t) {
  return Object.keys(t).reduce((acc, k) => acc + (isFixedKey(k) ? (t[k] || 0) : 0), 0);
}
function calcBill(t, kwh, days, vatIncl) {
  const energyR_excl = (energyCentsPerKwhTotal(t) / 100) * kwh;
  const fixedR_excl  = fixedRandsPerDayTotal(t) * days;
  const sub_excl = energyR_excl + fixedR_excl;
  const total = vatIncl ? sub_excl * (1 + VAT_RATE) : sub_excl;
  const vat   = vatIncl ? sub_excl * VAT_RATE : 0;
  return { energyR_excl, fixedR_excl, sub_excl, vat, total };
}
function money(v){ return `R ${v.toFixed(2)}`; }
function cents(v){ return `${v.toFixed(2)} c/kWh`; }
/* ✅ Output unit text as R/POD/day everywhere */
function perDay(v){ return `R ${v.toFixed(2)} /POD/day`; }

/* Detailed components (support both “Network” and historic “Netword” spellings) */
const ENERGY_COMPONENT_KEYS = [
  "Energy Charge [c/kWh]",
  "Ancillary Service Charge [c/kWh]",
  "Network Demand Charge [c/kWh]",
  "Netword Demand Charge [c/kWh]",
  "Electrification and Rural Network Subsidy Charge [c/kWh]"
];
const FIXED_COMPONENT_KEYS = [
  "Network Capacity Charge [R/Pod/Day]",
  "Network Capacity Charge [R/POD/day]",
  "Generation Capacity Charge [R/Pod/Day]",
  "Generation Capacity Charge [R/POD/day]",
  "Service and Administration Charge [R/Pod/Day]",
  "Service and Administration Charge [R/POD/day]"
];

/* Strip either fixed-unit variant from labels */
function stripUnits(lbl){
  return lbl.replace(' [c/kWh]','')
            .replace(' [R/Pod/Day]','')
            .replace(' [R/POD/day]','');
}

function componentBreakdownRand(t, kwh, days) {
  const items = [];
  for (const k of ENERGY_COMPONENT_KEYS) {
    if (t[k] != null) items.push({ label: stripUnits(k), amountR: (t[k]||0)/100 * kwh, kind:'energy' });
  }
  for (const k of FIXED_COMPONENT_KEYS) {
    if (t[k] != null) items.push({ label: stripUnits(k), amountR: (t[k]||0) * days, kind:'fixed' });
  }
  return items;
}

/* ---------- state ---------- */
const state = {
  categories: new Set(["Homepower", "Homelight"]), // defaults
  selected: [],
  vatInclusive: true,
  kwh: 500,
  days: 30,
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

  dom.billChart   = q("billChart");
  dom.splitChart  = q("splitChart");
  dom.billTable   = q("billTable").querySelector("tbody");
  dom.compTable   = q("componentTable").querySelector("tbody");
  dom.billTotalHdr= q("billTotalHdr");

  injectBreakdownUI(); // button + hidden card

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

  // Bill inputs
  dom.kwhInput.addEventListener("input", () => {
    state.kwh = Math.max(0, Number(dom.kwhInput.value) || 0);
    renderAll();
  });
  dom.daysInput.addEventListener("input", () => {
    let d = Math.floor(Number(dom.daysInput.value) || 0);
    if (d < 1) d = 1; if (d > 31) d = 31;
    dom.daysInput.value = d;
    state.days = d;
    renderAll();
  });

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

/* ---------- options & selection ---------- */
function renderOptions() {
  dom.options.innerHTML = "";
  const cats = state.categories;
  if (!cats.size) {
    dom.catHint.textContent = "Tick at least one category to load tariffs.";
    return;
  }
  /* ✅ Do NOT switch to the “Tick up to five tariffs to compare.” sentence */
  dom.catHint.textContent = "Choose categories to see tariffs below.";

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
  renderAll();
}
function updateSelCounter() {
  dom.selCounter.textContent = `${state.selected.length}/${MAX_SELECT} selected`;
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
}

/* ---------- results ---------- */
function renderAll() {
  const items = state.selected
    .map(name => tariffData.find(t => t.Tariff === name))
    .filter(Boolean);

  renderComponentTable(items);
  renderBillTable(items);
  renderBillChart(items);
  renderSplitChart(items);
  if (state.breakdownOpen) renderBreakdown();
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

function renderBillTable(items) {
  dom.billTable.innerHTML = "";
  items.forEach(t => {
    const r = calcBill(t, state.kwh, state.days, state.vatInclusive);
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
function polarToCartesian(cx, cy, r, angleRad){
  return { x: cx + r*Math.cos(angleRad), y: cy + r*Math.sin(angleRad) };
}

/* Horizontal bar chart with smart label placement */
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

    svg.appendChild(rect(pad, y + rowH*0.2, w - pad*2, rowH*0.6, THEME.surface2)); // track
    svg.appendChild(rect(pad, y + rowH*0.2, barW, rowH*0.6, barColor));            // bar

    const labW = estimateTextWidth(lab, fontSize);
    const valW = estimateTextWidth(valueStr, fontSize);
    const insidePadding = 10;

    // Name
    if (barW > labW + insidePadding * 2) {
      svg.appendChild(text(pad + insidePadding, y + rowH*0.5, lab, { anchor: "start", size: fontSize, color: txtOnBar }));
    } else {
      svg.appendChild(text(pad - 6, y + rowH*0.5, lab, { anchor: "end", size: fontSize, color: "white" }));
    }
    // Value
    if (barW > valW + insidePadding * 2) {
      svg.appendChild(text(pad + barW - insidePadding, y + rowH*0.5, valueStr, { anchor: "end", size: fontSize, color: txtOnBar }));
    } else {
      svg.appendChild(text(pad + barW + insidePadding, y + rowH*0.5, valueStr, { anchor: "start", size: fontSize, color: "black" }));
    }
  });

  container.appendChild(svg);
}

/* 100% stacked split (energy vs fixed) — label always visible */
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

    // subtle track to improve readability
    svg.appendChild(rect(pad, y + rowH*0.2, w - pad*2, rowH*0.6, THEME.surface3));
    svg.appendChild(rect(pad, y + rowH*0.2, eW, rowH*0.6, THEME.energy));
    svg.appendChild(rect(pad + eW, y + rowH*0.2, fW, rowH*0.6, THEME.fixed));

    // Name inside the track at the very left → never clipped
    svg.appendChild(text(pad + 8, y + rowH*0.5, `${lab}`, { anchor: "start", size: 12, color: THEME.ink }));
    // Percentages on the right
    svg.appendChild(text(w - 8, y + rowH*0.5, `${e.toFixed(0)}% / ${f.toFixed(0)}%`, { anchor: "end", size: 12, color: THEME.ink }));
  });

  container.appendChild(svg);
}

/* Donut pie (no legend here; legend is global) */
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
    const path = svgEl("path", { d: arcPath(cx,cy,r,angle,end,inner), fill: it.color, stroke: '#fff', 'stroke-width': 1 });
    /* ✅ Native tooltip on hover */
    const tip = svgEl("title", {});
    tip.textContent = `${it.label}: ${money(it.value)}`;
    path.appendChild(tip);
    svg.appendChild(path);
    angle = end;
  });

  // Center total
  svg.appendChild(text(cx, cy, money(sum), { anchor: "middle", size: 12, color: THEME.ink }));
  // Title
  svg.appendChild(text(cx, h-14, title, { anchor: "middle", size: 12, color: THEME.inkMuted }));

  container.appendChild(svg);
}

/* Build a single legend covering all pies */
function renderGlobalLegend(container, labelsOrdered, colorMap) {
  container.innerHTML = "";
  const legend = document.createElement('div');
  legend.style.display = 'grid';
  legend.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  legend.style.gap = '.45rem .9rem';

  labelsOrdered.forEach(lbl => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '.5rem';
    const sw = document.createElement('span');
    sw.style.width = '14px'; sw.style.height = '14px';
    sw.style.borderRadius = '3px'; sw.style.background = colorMap[lbl];
    const txt = document.createElement('span');
    txt.style.fontSize = '.95rem';
    txt.style.color = THEME.inkMuted;
    txt.textContent = lbl;
    row.appendChild(sw); row.appendChild(txt);
    legend.appendChild(row);
  });

  container.appendChild(legend);
}

/* ---------- chart renders ---------- */
function renderBillChart(items) {
  const labels = items.map(t => t.Tariff);
  const totals = items.map(t => calcBill(t, state.kwh, state.days, state.vatInclusive).total);
  drawBarChart(dom.billChart, labels, totals, { unit: "R" });
}
function renderSplitChart(items) {
  const labels = items.map(t => t.Tariff);
  const pairs = items.map(t => {
    const r = calcBill(t, state.kwh, state.days, false);
    const total = r.sub_excl || 1;
    return {
      energyPct: (r.energyR_excl / total) * 100,
      fixedPct:  (r.fixedR_excl  / total) * 100
    };
  });
  drawStackedPctChart(dom.splitChart, labels, pairs);
}

/* ---------- Full breakdown card (hidden by default) ---------- */
function renderBreakdown(){
  dom.breakdownTableBody.innerHTML = "";
  dom.piesRow.innerHTML = "";
  dom.piesLegend.innerHTML = "";

  const selectedTariffs = state.selected
    .map(name => tariffData.find(t => t.Tariff === name))
    .filter(Boolean);

  // global legend bookkeeping
  const colorMap = {};
  const labelOrder = [];
  const assignColor = (lbl) => {
    if (!colorMap[lbl]) {
      colorMap[lbl] = THEME.pieColors[labelOrder.length % THEME.pieColors.length];
      labelOrder.push(lbl);
    }
    return colorMap[lbl];
  };

  /* ✅ Friendly lookup aliases so columns populate instead of “—” */
  const aliases = {
    "Active energy": ["Energy Charge"],
    "Ancillary service": ["Ancillary Service Charge"],
    "Network demand": ["Network Demand Charge","Netword Demand Charge"],
    "Electrification subsidy": ["Electrification and Rural Network Subsidy Charge"],
    "Network capacity": ["Network Capacity Charge"],
    "Generation capacity": ["Generation Capacity Charge"],
    "Service": ["Service and Administration Charge"]
  };
  const amountFor = (comps, aliasList) => {
    const hit = comps.find(c => aliasList.some(a => c.label.toLowerCase().startsWith(a.toLowerCase())));
    return hit ? money(hit.amountR) : '—';
  };

  selectedTariffs.forEach((t) => {
    const comps = componentBreakdownRand(t, state.kwh, state.days);
    const energyTotal = comps.filter(c => c.kind==='energy').reduce((a,c)=>a+c.amountR,0);
    const fixedTotal  = comps.filter(c => c.kind==='fixed').reduce((a,c)=>a+c.amountR,0);
    const sub_excl = energyTotal + fixedTotal;
    const vat = state.vatInclusive ? sub_excl * VAT_RATE : 0;
    const total = state.vatInclusive ? sub_excl + vat : sub_excl;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.Tariff}</td>
      <td>${amountFor(comps, aliases["Active energy"])}</td>
      <td>${amountFor(comps, aliases["Ancillary service"])}</td>
      <td>${amountFor(comps, aliases["Network demand"])}</td>
      <td>${amountFor(comps, aliases["Electrification subsidy"])}</td>
      <td><em>${money(energyTotal)}</em></td>
      <td>${amountFor(comps, aliases["Network capacity"])}</td>
      <td>${amountFor(comps, aliases["Generation capacity"])}</td>
      <td>${amountFor(comps, aliases["Service"])}</td>
      <td><em>${money(fixedTotal)}</em></td>
      <td>${state.vatInclusive ? money(vat) : '—'}</td>
      <td><strong>${money(total)}</strong></td>
    `;
    dom.breakdownTableBody.appendChild(tr);

    // Per-tariff donut
    const pieBox = document.createElement('div');
    const items = [];
    ENERGY_COMPONENT_KEYS.forEach(k => {
      if (t[k] != null) {
        const lbl = stripUnits(k);
        items.push({ label: lbl, value: (t[k]||0)/100*state.kwh, color: assignColor(lbl) });
      }
    });
    FIXED_COMPONENT_KEYS.forEach(k => {
      if (t[k] != null) {
        const lbl = stripUnits(k);
        items.push({ label: lbl, value: (t[k]||0)*state.days, color: assignColor(lbl) });
      }
    });
    if (state.vatInclusive) {
      items.push({ label: 'VAT', value: (energyTotal+fixedTotal)*VAT_RATE, color: assignColor('VAT') });
    }

    drawDonut(pieBox, t.Tariff, items);
    dom.piesRow.appendChild(pieBox);
  });

  // Render ONE legend for all pies
  renderGlobalLegend(dom.piesLegend, labelOrder, colorMap);
}
