// compareTariffs.js
const VAT_RATE = 0.15;

// Copy of your SPU tariff data (kept here so this page is standalone).
// If you prefer one source of truth, move this array to tariffsData.js and import in both pages.
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

// ------- helpers -------
const unitOf = (key) => (key.match(/\[(.*?)\]/)?.[1] || "");
const isEnergyKey = (k) => unitOf(k) === "c/kWh";
const isFixedKey  = (k) => unitOf(k) === "R/Pod/Day";
const withVat = (v, incl) => v == null ? null : (incl ? v * (1 + VAT_RATE) : v);

function sumByUnit(t, predicate, vatIncl) {
  return Object.keys(t).reduce((acc, k) => {
    if (k === "Tariff") return acc;
    if (predicate(k)) {
      const val = t[k] ?? 0;
      return acc + withVat(val, vatIncl);
    }
    return acc;
  }, 0);
}

function keysByUnit(tariffs, predicate, priorityList=[]) {
  const set = new Set();
  tariffs.forEach(t => Object.keys(t).forEach(k => {
    if (k !== "Tariff" && predicate(k)) set.add(k);
  }));
  const rest = [...set].filter(k => !priorityList.includes(k)).sort();
  return [...priorityList, ...rest];
}

function formatVal(val, unit) {
  if (val == null) return "—";
  if (unit === "c/kWh") return `${val.toFixed(2)} c/kWh`;
  if (unit === "R/Pod/Day") return `R ${val.toFixed(2)} /Pod/Day`;
  return `R ${val.toFixed(2)}`;
}

// ------- UI state -------
const state = {
  category: "",
  selectedTariffs: [],
  vatInclusive: true
};

// ------- Charts -------
let energyChart, fixedChart;

function ensureCharts() {
  const ectx = document.getElementById("energyChart").getContext("2d");
  const fctx = document.getElementById("fixedChart").getContext("2d");

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
    plugins: { legend: { position: "top" } }
  };

  energyChart = energyChart || new Chart(ectx, {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: commonOptions
  });

  fixedChart = fixedChart || new Chart(fctx, {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: commonOptions
  });
}

function updateCharts(selected) {
  ensureCharts();

  const names = selected.map(t => t.Tariff);

  // ENERGY datasets (c/kWh)
  const energyPriority = [
    "Energy Charge [c/kWh]",
    "Ancillary Service Charge [c/kWh]",
    "Netword Demand Charge [c/kWh]",
    "Electrification and Rural Network Subsidy Charge [c/kWh]"
  ];
  const energyKeys = keysByUnit(selected, isEnergyKey, energyPriority);

  const energyDatasets = energyKeys.map((k) => ({
    label: k.replace(" [c/kWh]", ""),
    data: selected.map(t => withVat(t[k] ?? 0, state.vatInclusive)),
    stack: "energy"
  }));

  energyChart.data.labels = names;
  energyChart.data.datasets = energyDatasets;
  energyChart.update();

  // FIXED datasets (R/Pod/Day)
  const fixedPriority = [
    "Network Capacity Charge [R/Pod/Day]",
    "Service and Administration Charge [R/Pod/Day]",
    "Generation Capacity Charge [R/Pod/Day]"
  ];
  const fixedKeys = keysByUnit(selected, isFixedKey, fixedPriority);

  const fixedDatasets = fixedKeys.map((k) => ({
    label: k.replace(" [R/Pod/Day]", ""),
    data: selected.map(t => withVat(t[k] ?? 0, state.vatInclusive)),
    stack: "fixed"
  }));

  fixedChart.data.labels = names;
  fixedChart.data.datasets = fixedDatasets;
  fixedChart.update();
}

// ------- Tables -------
function updateTables(selected) {
  // Totals
  const totalsBody = document.querySelector("#totalsTable tbody");
  totalsBody.innerHTML = "";
  selected.forEach(t => {
    const totalEnergy = sumByUnit(t, isEnergyKey, state.vatInclusive);
    const totalFixed  = sumByUnit(t, isFixedKey,  state.vatInclusive);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.Tariff}</td>
      <td>${totalEnergy.toFixed(2)} c/kWh</td>
      <td>R ${totalFixed.toFixed(2)} /Pod/Day</td>
    `;
    totalsBody.appendChild(tr);
  });

  // Energy components
  const eHead = document.querySelector("#energyTable thead");
  const eBody = document.querySelector("#energyTable tbody");
  eHead.innerHTML = "";
  eBody.innerHTML = "";
  const eKeys = keysByUnit(selected, isEnergyKey, [
    "Energy Charge [c/kWh]",
    "Ancillary Service Charge [c/kWh]",
    "Netword Demand Charge [c/kWh]",
    "Electrification and Rural Network Subsidy Charge [c/kWh]"
  ]);
  if (eKeys.length) {
    const trh = document.createElement("tr");
    trh.innerHTML = `<th>Component</th>${selected.map(s => `<th>${s.Tariff}</th>`).join("")}`;
    eHead.appendChild(trh);

    eKeys.forEach(k => {
      const unit = unitOf(k);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${k.replace(" [c/kWh]", "")}</td>
        ${selected.map(s => `<td>${formatVal(withVat(s[k] ?? 0, state.vatInclusive), unit)}</td>`).join("")}
      `;
      eBody.appendChild(tr);
    });
  }

  // Fixed components
  const fHead = document.querySelector("#fixedTable thead");
  const fBody = document.querySelector("#fixedTable tbody");
  fHead.innerHTML = "";
  fBody.innerHTML = "";
  const fKeys = keysByUnit(selected, isFixedKey, [
    "Network Capacity Charge [R/Pod/Day]",
    "Service and Administration Charge [R/Pod/Day]",
    "Generation Capacity Charge [R/Pod/Day]"
  ]);
  if (fKeys.length) {
    const trh = document.createElement("tr");
    trh.innerHTML = `<th>Component</th>${selected.map(s => `<th>${s.Tariff}</th>`).join("")}`;
    fHead.appendChild(trh);

    fKeys.forEach(k => {
      const unit = unitOf(k);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${k.replace(" [R/Pod/Day]", "")}</td>
        ${selected.map(s => `<td>${formatVal(withVat(s[k] ?? 0, state.vatInclusive), unit)}</td>`).join("")}
      `;
      fBody.appendChild(tr);
    });
  }
}

// ------- Render -------
function render() {
  const hint = document.getElementById("selectionHint");
  const selected = state.selectedTariffs;

  if (!state.category) {
    hint.textContent = "Choose a category, then select up to 3 tariffs.";
    updateCharts([]);
    updateTables([]);
    return;
  }

  if (selected.length === 0) {
    hint.textContent = "Pick 2–3 tariffs to see comparisons.";
    updateCharts([]);
    updateTables([]);
    return;
  }

  if (selected.length > 3) {
    hint.textContent = "You selected more than 3. Only the first 3 will be compared.";
  } else {
    hint.textContent = `${selected.length} tariff(s) selected. Toggle VAT for Incl/Excl view.`;
  }

  const slice = selected.slice(0, 3);
  updateCharts(slice);
  updateTables(slice);
}

// ------- Init -------
document.addEventListener("DOMContentLoaded", () => {
  const category = document.getElementById("category");
  const list = document.getElementById("tariffSelect");
  const vatToggle = document.getElementById("vatToggle");
  const vatModeLabel = document.getElementById("vatModeLabel");

  // Populate on category change
  category.addEventListener("change", () => {
    state.category = category.value;
    list.innerHTML = "";
    state.selectedTariffs = [];

    if (!state.category) {
      render();
      return;
    }

    const items = tariffData.filter(t => t.Tariff.startsWith(state.category));
    items.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.Tariff;
      opt.textContent = t.Tariff;
      list.appendChild(opt);
    });

    render();
  });

  // Capture multi-select (limit 3)
  list.addEventListener("change", () => {
    const selected = [...list.selectedOptions].map(o => o.value);
    // Enforce up to 3
    if (selected.length > 3) {
      // keep only first three in DOM selection
      for (let i = 3; i < selected.length; i++) {
        [...list.options].find(o => o.value === selected[i]).selected = false;
      }
    }
    const finalSel = [...list.selectedOptions].map(o => o.value).slice(0,3);
    state.selectedTariffs = finalSel.map(name => tariffData.find(t => t.Tariff === name));
    render();
  });

  // VAT toggle
  vatToggle.checked = true;
  vatToggle.addEventListener("change", () => {
    state.vatInclusive = vatToggle.checked;
    vatModeLabel.textContent = `VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}`;
    render();
  });

  // Initial
  vatModeLabel.textContent = "VAT: Inclusive";
  render();
});
