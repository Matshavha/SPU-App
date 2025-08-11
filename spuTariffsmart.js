// 🚀 spuTariffsmart.js
const VAT_RATE = 0.15;

// Persist VAT & favourites
const state = {
  vatInclusive: JSON.parse(localStorage.getItem("vatInclusive") ?? "true"),
  favorites: JSON.parse(localStorage.getItem("favorites") ?? "[]"), // array of tariff names
  category: ""
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

// ---- helpers ----
const keyUnit = (key) => (key.match(/\[(.*?)\]/)?.[1] || "");
const withVat = (v, incl) => (incl ? v * (1 + VAT_RATE) : v);

function formatRate(value, unit, includeVat) {
  if (value == null) return "";
  const v = withVat(value, includeVat);
  if (unit === "c/kWh") return `${v.toFixed(2)} c/kWh`;
  if (unit === "R/Pod/Day") return `R ${v.toFixed(2)} /Pod/Day`;
  return `R ${v.toFixed(2)}`;
}

// ---- render ----
function render() {
  const container    = document.getElementById("tariffContainer");
  const educationBox = document.getElementById("educationBox");
  const controlsBar  = document.getElementById("controlsBar");

  const hasCategory = Boolean(state.category);
  educationBox.style.display = hasCategory ? "block" : "none";
  controlsBar.style.display  = hasCategory ? "flex"  : "none";

  document.getElementById("vatToggle").checked = state.vatInclusive;
  document.getElementById("vatModeLabel").textContent =
    `VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}`;

  // Filter by selected category
  const items = tariffData.filter(t => {
    if (!hasCategory) return false;
    if (state.category === "Businessrate") return t.Tariff.startsWith("Businessrate");
    if (state.category === "Homepower")   return t.Tariff.startsWith("Homepower");
    if (state.category === "Landrate")    return t.Tariff.startsWith("Landrate");
    if (state.category === "Homelight")   return t.Tariff.startsWith("Homelight");
    if (state.category === "Landlight")   return t.Tariff.startsWith("Landlight");
    return false;
  });

  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center;">No tariffs found for this selection.</p>';
    return;
  }

  for (const t of items) {
    const card = document.createElement("div");
    card.className = "tariff-card";

    // Header + favourite
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";

    const title = document.createElement("h3");
    title.textContent = t.Tariff;

    const fav = document.createElement("span");
    const isFav = state.favorites.includes(t.Tariff);
    fav.className = "fav" + (isFav ? " active" : "");
    fav.title = isFav ? "Remove from favourites" : "Add to favourites";
    fav.textContent = isFav ? "★" : "☆";
    fav.addEventListener("click", () => {
      const i = state.favorites.indexOf(t.Tariff);
      if (i >= 0) state.favorites.splice(i, 1);
      else state.favorites.push(t.Tariff);
      localStorage.setItem("favorites", JSON.stringify(state.favorites));
      render();
    });

    header.appendChild(title);
    header.appendChild(fav);
    card.appendChild(header);

    // Details table
    const table = document.createElement("table");
    table.classList.add("tariff-table");
    const tbody = document.createElement("tbody");

    for (const key in t) {
      if (key === "Tariff") continue;
      const rawVal = t[key];
      if (rawVal == null) continue;

      const unit = keyUnit(key);
      const label = key.split('[')[0].trim();
      const rateStr = formatRate(rawVal, unit, state.vatInclusive);

      const row = document.createElement("tr");
      row.innerHTML = `<td>${label}</td><td>${rateStr}</td>`;
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  }
}

// ---- init ----
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const vatToggle = document.getElementById("vatToggle");

  // hydrate VAT toggle
  vatToggle.checked = state.vatInclusive;

  categorySelect.addEventListener("change", () => {
    state.category = categorySelect.value;
    render();
  });

  vatToggle.addEventListener("change", () => {
    state.vatInclusive = vatToggle.checked;
    localStorage.setItem("vatInclusive", JSON.stringify(state.vatInclusive));
    render();
  });

  render();
});


