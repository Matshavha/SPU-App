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

/* ---------- Tariff data (unchanged from your working copy) ---------- */
const tariffData = [/* … keep exactly as in your message … */];

/* ---------- helpers ---------- */
const keyUnit = (k) => (k.match(/\[(.*?)\]/)?.[1] || "");
const isEnergyKey = (k) => keyUnit(k) === "c/kWh";
function isFixedKey(k){ return keyUnit(k).toLowerCase() === "r/pod/day"; }
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
function perDay(v){ return `R ${v.toFixed(2)} /POD/day`; }

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
  categories: new Set(["Homepower", "Homelight"]),
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
  if (!cats.size) return; // no hint line anymore

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

/* ---------- legend-only canonicalization (does NOT affect table logic) ---------- */
function canonLegendLabel(lbl){
  const L = lbl.toLowerCase();
  if (L.startsWith('energy charge')) return 'Active energy';
  if (L.startsWith('ancillary service charge')) return 'Ancillary service';
  if (L.startsWith('network demand charge') || L.startsWith('netword demand charge')) return 'Network demand';
  if (L.startsWith('electrification and rural network subsidy charge')) return 'Electrification subsidy';
  if (L.startsWith('network capacity charge')) return 'Network capacity';
  if (L.startsWith('generation capacity charge')) return 'Generation capacity';
  if (L.startsWith('service and administration charge')) return 'Service & admin';
  if (L === 'vat') return 'VAT';
  return lbl;
}

/* 100% stacked split (energy vs fixed) — label always visible */
function drawStackedPctChart(container, labels, pairs) { /* unchanged */ }

/* Donut pie (legend unified; labels untouched for table) */
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

/* Build a single legend covering all pies (uses canonical legend labels) */
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
    txt.textContent = canonLegendLabel(lbl);
    row.appendChild(sw); row.appendChild(txt);
    legend.appendChild(row);
  });

  container.appendChild(legend);
}

/* ---------- chart renders ---------- */
function renderBillChart(items) { /* unchanged */ }
function renderSplitChart(items)  { /* unchanged */ }

/* ---------- Full breakdown card (hidden by default) ---------- */
function renderBreakdown(){
  dom.breakdownTableBody.innerHTML = "";
  dom.piesRow.innerHTML = "";
  dom.piesLegend.innerHTML = "";

  const selectedTariffs = state.selected
    .map(name => tariffData.find(t => t.Tariff === name))
    .filter(Boolean);

  // global legend bookkeeping (canonicalized for color *only*)
  const colorMap = {};
  const labelOrder = [];
  const assignColor = (lbl) => {
    const key = canonLegendLabel(lbl);
    if (!colorMap[key]) {
      colorMap[key] = THEME.pieColors[labelOrder.length % THEME.pieColors.length];
      labelOrder.push(key);
    }
    return colorMap[key];
  };

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

    // Per-tariff donut (labels unchanged; only legend colors are canonicalized)
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

  // ONE legend for all pies (canonical labels)
  renderGlobalLegend(dom.piesLegend, labelOrder, colorMap);
}




