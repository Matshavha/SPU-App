// 🚀 spuTariffsmart.js
const VAT_RATE = 0.15;

// App state (persist VAT & compact in localStorage)
const state = {
  vatInclusive: JSON.parse(localStorage.getItem("vatInclusive") ?? "true"),
  compact: JSON.parse(localStorage.getItem("compactCards") ?? "false"),
  favorites: JSON.parse(localStorage.getItem("favorites") ?? "[]"), // array of tariff names
  category: "",
  search: "",
  sortBy: "default",
};

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
const isEnergyUnit = (unit) => unit === "c/kWh";
const isDailyUnit  = (unit) => unit === "R/Pod/Day";

function withVat(value, includeVat) {
  return includeVat ? value * (1 + VAT_RATE) : value;
}

function formatRate(value, unit, includeVat) {
  if (value == null) return "";
  const v = withVat(value, includeVat);
  if (isEnergyUnit(unit)) return `${v.toFixed(2)} c/kWh`;
  if (isDailyUnit(unit))  return `R ${v.toFixed(2)} /Pod/Day`;
  // Fallback: show raw R value
  return `R ${v.toFixed(2)}`;
}

function sumFixedDaily(t) {
  // Sum known daily charge keys
  const keys = Object.keys(t).filter(k => /\[R\/Pod\/Day\]/.test(k));
  return keys.reduce((acc, k) => acc + (t[k] ?? 0), 0);
}

function sumEnergyPerKwh(t) {
  // Sum energy-based c/kWh components
  const keys = Object.keys(t).filter(k => /\[c\/kWh\]/.test(k));
  return keys.reduce((acc, k) => acc + (t[k] ?? 0), 0);
}

function keyUnit(key) {
  const m = key.match(/\[(.*?)\]/);
  return m ? m[1] : "";
}

// ---------- render ----------
function render() {
  const container = document.getElementById("tariffContainer");
  const educationBox = document.getElementById("educationBox");
  const controlsBar = document.getElementById("controlsBar");

  const hasCategory = Boolean(state.category);
  educationBox.style.display = hasCategory ? "block" : "none";
  controlsBar.style.display = hasCategory ? "flex" : "none";

  document.getElementById("vatToggle").checked = state.vatInclusive;
  document.getElementById("vatModeLabel").textContent =
    `VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}`;

  document.body.classList.toggle("compact", state.compact);

  // filter by category
  let items = tariffData.filter(t => {
    if (!hasCategory) return false;
    if (state.category === "Businessrate") return t.Tariff.startsWith("Businessrate");
    if (state.category === "Homepower")   return t.Tariff.startsWith("Homepower");
    if (state.category === "Landrate")    return t.Tariff.startsWith("Landrate");
    if (state.category === "Homelight")   return t.Tariff.startsWith("Homelight");
    if (state.category === "Landlight")   return t.Tariff.startsWith("Landlight");
    return false;
  });

  // search
  if (state.search) {
    const q = state.search.toLowerCase();
    items = items.filter(t => t.Tariff.toLowerCase().includes(q));
  }

  // sort
  if (state.sortBy === "energyAsc")   items.sort((a,b)=> sumEnergyPerKwh(a)-sumEnergyPerKwh(b));
  if (state.sortBy === "energyDesc")  items.sort((a,b)=> sumEnergyPerKwh(b)-sumEnergyPerKwh(a));
  if (state.sortBy === "fixedAsc")    items.sort((a,b)=> sumFixedDaily(a)-sumFixedDaily(b));
  if (state.sortBy === "fixedDesc")   items.sort((a,b)=> sumFixedDaily(b)-sumFixedDaily(a));

  // render cards
  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center;">No tariffs found for this selection.</p>';
    return;
  }

  for (const t of items) {
    const card = document.createElement("div");
    card.className = "tariff-card";

    // Header with favorite star
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";

    const title = document.createElement("h3");
    title.textContent = t.Tariff;

    const fav = document.createElement("span");
    fav.className = "fav" + (state.favorites.includes(t.Tariff) ? " active" : "");
    fav.title = "Add to favourites";
    fav.textContent = state.favorites.includes(t.Tariff) ? "★" : "☆";
    fav.addEventListener("click", () => {
      const i = state.favorites.indexOf(t.Tariff);
      if (i >= 0) state.favorites.splice(i,1);
      else state.favorites.push(t.Tariff);
      localStorage.setItem("favorites", JSON.stringify(state.favorites));
      render();
    });

    header.appendChild(title);
    header.appendChild(fav);
    card.appendChild(header);

    // Summary row (energy + fixed)
    const summary = document.createElement("p");
    const energySum = withVat(sumEnergyPerKwh(t), state.vatInclusive).toFixed(2);
    const fixedSum  = withVat(sumFixedDaily(t),  state.vatInclusive).toFixed(2);
    summary.innerHTML = `<strong>Summary:</strong> Energy total: <strong>${energySum} c/kWh</strong> · Fixed daily: <strong>R ${fixedSum}</strong>`;
    card.appendChild(summary);

    // Details table
    const table = document.createElement("table");
    table.classList.add("tariff-table");
    const tbody = document.createElement("tbody");

    for (const key in t) {
      if (key === "Tariff") continue;
      const rawVal = t[key];
      if (rawVal == null) continue;

      const unit = keyUnit(key); // 'c/kWh' or 'R/Pod/Day' (possibly empty)
      const label = key.split('[')[0].trim();
      const rateStr = formatRate(rawVal, unit, state.vatInclusive);

      const row = document.createElement("tr");
      row.innerHTML = `<td>${label}</td><td>${rateStr}</td>`;
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    card.appendChild(table);

    // Quick calculator (interactive)
    const calc = document.createElement("div");
    calc.className = "quick-calc";
    calc.innerHTML = `
      <label>Monthly kWh <input type="number" min="0" step="0.1" value="500" class="inp-kwh"/></label>
      <label>Billing days <input type="number" min="1" max="31" step="1" value="30" class="inp-days"/></label>
      <div class="result">Estimated bill: R 0.00</div>
    `;
    const kwhInput  = calc.querySelector(".inp-kwh");
    const daysInput = calc.querySelector(".inp-days");
    const result    = calc.querySelector(".result");

    function updateEstimate() {
      const kwh  = Number(kwhInput.value) || 0;
      const days = Number(daysInput.value) || 0;

      // energy components (c/kWh → R): (sum c/kWh /100) * kWh
      const energyRandsExcl = (sumEnergyPerKwh(t) / 100) * kwh;
      // fixed daily components (R/day) * days
      const fixedRandsExcl = sumFixedDaily(t) * days;

      let total = energyRandsExcl + fixedRandsExcl;
      if (state.vatInclusive) total *= (1 + VAT_RATE);

      result.textContent = `Estimated bill: R ${total.toFixed(2)} ${state.vatInclusive ? "(VAT incl.)" : "(VAT excl.)"}`;
    }
    kwhInput.addEventListener("input", updateEstimate);
    daysInput.addEventListener("input", updateEstimate);
    updateEstimate();

    card.appendChild(calc);
    container.appendChild(card);
  }
}

// ---------- init & events ----------
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const vatToggle = document.getElementById("vatToggle");
  const compactToggle = document.getElementById("compactToggle");
  const searchBox = document.getElementById("searchBox");
  const sortBy = document.getElementById("sortBy");

  // hydrate UI state
  compactToggle.checked = state.compact;

  categorySelect.addEventListener("change", () => {
    state.category = categorySelect.value;
    render();
  });

  vatToggle.addEventListener("change", () => {
    state.vatInclusive = vatToggle.checked;
    localStorage.setItem("vatInclusive", JSON.stringify(state.vatInclusive));
    render();
  });

  compactToggle.addEventListener("change", () => {
    state.compact = compactToggle.checked;
    localStorage.setItem("compactCards", JSON.stringify(state.compact));
    render();
  });

  searchBox.addEventListener("input", () => {
    state.search = searchBox.value;
    render();
  });

  sortBy.addEventListener("change", () => {
    state.sortBy = sortBy.value;
    render();
  });

  // initial render (no category yet)
  render();
});
