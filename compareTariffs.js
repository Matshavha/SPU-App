// compareTariffs.js — theme-aware charts, VAT toggle, up to 5 tariffs

const VAT_RATE = 0.15;
const MAX_SELECT = 5;

// Helper to read CSS variables from style.css
function cssVar(name, fallback){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Eskom theme colours pulled from style.css (with safe fallbacks)
const COLOR_PRIMARY   = cssVar('--primary', '#003896');       // Eskom blue
const COLOR_BG_BAR    = cssVar('--surface-2', '#f1f3f7');     // chart background bars
const COLOR_TEXT      = cssVar('--ink', '#1f2430');           // main text
const COLOR_TEXT_MUTE = cssVar('--ink-muted', '#444');        // muted text
const COLOR_ENERGY    = cssVar('--teal-100', '#598787');      // energy split colour
const COLOR_FIXED     = cssVar('--orange-100', '#C97A00');    // fixed split colour

// Keep this in sync with your spuTariffsmart.js
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
  { "Tariff": "Landlight 60A", "Energy Charge [c/kWh]": 836 }
];

// ---------- helpers ----------
const keyUnit = (k) => (k.match(/\[(.*?)\]/)?.[1] || "");
const isEnergyKey = (k) => keyUnit(k) === "c/kWh";
const isFixedKey  = (k) => keyUnit(k) === "R/Pod/Day";
const withVat = (v, incl) => (v == null ? 0 : (incl ? v * (1 + VAT_RATE) : v));
const catOf = (tName) => tName.split(" ")[0]; // Businessrate, Homepower, Landrate, Homelight, Landlight

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
function perDay(v){ return `R ${v.toFixed(2)} /Pod/Day`; }

// ---------- state ----------
const state = {
  categories: new Set(["Homepower", "Homelight"]), // defaults
  selected: [], // tariff names
  vatInclusive: true,
  kwh: 500,
  days: 30
};

// ---------- DOM ----------
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

  // Wire category checkboxes
  dom.catGroup.querySelectorAll("input.cat").forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) state.categories.add(cb.value);
      else state.categories.delete(cb.value);
      // Reset selections that no longer belong
      state.selected = state.selected.filter(name => state.categories.has(catOf(name)));
      renderOptions();
      updateSelCounter();
      renderResults();
    });
  });

  // VAT
  dom.vatToggle.addEventListener("change", () => {
    state.vatInclusive = dom.vatToggle.checked;
    dom.vatLabel.textContent = `VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}`;
    dom.billTotalHdr.textContent = `Total (VAT ${state.vatInclusive ? "incl." : "excl."})`;
    renderResults();
  });

  // Bill inputs
  dom.kwhInput.addEventListener("input", () => {
    state.kwh = Math.max(0, Number(dom.kwhInput.value) || 0);
    renderResults();
  });
  dom.daysInput.addEventListener("input", () => {
    let d = Math.floor(Number(dom.daysInput.value) || 0);
    if (d < 1) d = 1; if (d > 31) d = 31;
    dom.daysInput.value = d;
    state.days = d;
    renderResults();
  });

  // Clear selection
  dom.clearSelBtn.addEventListener("click", () => {
    state.selected = [];
    dom.options.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    updateSelCounter();
    renderResults();
  });

  // Initial paint
  dom.vatLabel.textContent = "VAT: Inclusive";
  renderOptions();
  autoPreselect(2); // show results immediately
  renderResults();
});

// ---------- options & selection ----------
function renderOptions() {
  dom.options.innerHTML = "";
  const cats = state.categories;
  if (!cats.size) {
    dom.catHint.textContent = "Tick at least one category to load tariffs.";
    return;
  }
  dom.catHint.textContent = "Tick up to five tariffs to compare.";

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
  renderResults();
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

// ---------- results ----------
function renderResults() {
  const selectedTariffs = state.selected
    .map(name => tariffData.find(t => t.Tariff === name))
    .filter(Boolean);

  renderComponentTable(selectedTariffs);
  renderBillTable(selectedTariffs);
  renderBillChart(selectedTariffs);
  renderSplitChart(selectedTariffs);
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

// ---------- lightweight SVG charts (theme-aware) ----------
function renderBillChart(items) {
  dom.billChart.innerHTML = "";
  const labels = items.map(t => t.Tariff);
  const totals = items.map(t => calcBill(t, state.kwh, state.days, state.vatInclusive).total);
  drawBarChart(dom.billChart, labels, totals, { unit: "R" });
}

function renderSplitChart(items) {
  dom.splitChart.innerHTML = "";
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

// SVG helpers
function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs || {}).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}
function rect(x,y,w,h,fill){ return svgEl("rect", { x, y, width:w, height:h, fill, rx:6, ry:6 }); }
function text(x,y,str,{anchor="start",size=12,color=COLOR_TEXT}={}) {
  const t = svgEl("text", { x, y, "text-anchor": anchor, "font-size": size, fill: color, "dominant-baseline":"middle", "font-family":"system-ui, Segoe UI, Roboto, Arial" });
  t.textContent = str;
  return t;
}

// Horizontal bar chart (SVG) — uses theme colours
function drawBarChart(container, labels, values, { unit = "" } = {}) {
  const w = container.clientWidth || 680;
  const h = container.clientHeight || 240;
  const pad = 32;
  const rowH = Math.max(18, Math.min(38, (h - pad*2) / Math.max(1, labels.length)));
  const max = Math.max(1, Math.max(...values, 0));
  const svg = svgEl("svg", { width: w, height: h });

  labels.forEach((lab, i) => {
    const y = pad + i * rowH;
    const val = values[i] || 0;
    const barW = ((w - pad*2) * val) / max;

    svg.appendChild(rect(pad, y + rowH*0.2, w - pad*2, rowH*0.6, COLOR_BG_BAR)); // bg
    svg.appendChild(rect(pad, y + rowH*0.2, barW, rowH*0.6, COLOR_PRIMARY));      // bar
    svg.appendChild(text(8, y + rowH*0.7, lab, { anchor: "start", size: 12, color: COLOR_TEXT_MUTE }));
    const display = unit === "R" ? `R ${val.toFixed(2)}` : val.toFixed(2);
    svg.appendChild(text(w - 8, y + rowH*0.7, display, { anchor: "end", size: 12, color: COLOR_TEXT }));
  });

  container.appendChild(svg);
}

// 100% stacked split (energy vs fixed) — uses theme accent colours
function drawStackedPctChart(container, labels, pairs) {
  const w = container.clientWidth || 680;
  const h = container.clientHeight || 200;
  const pad = 32;
  const rowH = Math.max(18, Math.min(34, (h - pad*2) / Math.max(1, labels.length)));
  const svg = svgEl("svg", { width: w, height: h });

  labels.forEach((lab, i) => {
    const y = pad + i * rowH;
    const e = Math.max(0, Math.min(100, pairs[i].energyPct || 0));
    const f = Math.max(0, 100 - e);
    const eW = (w - pad*2) * (e / 100);
    const fW = (w - pad*2) - eW;

    svg.appendChild(rect(pad, y + rowH*0.2, eW, rowH*0.6, COLOR_ENERGY));   // energy
    svg.appendChild(rect(pad + eW, y + rowH*0.2, fW, rowH*0.6, COLOR_FIXED)); // fixed
    svg.appendChild(text(pad + 6, y + rowH*0.7, `${lab}`, { anchor: "start", size: 12, color: COLOR_TEXT_MUTE }));
    svg.appendChild(text(w - 8, y + rowH*0.7, `${e.toFixed(0)}% / ${f.toFixed(0)}%`, { anchor: "end", size: 12, color: COLOR_TEXT }));
  });

  container.appendChild(svg);
}
