// PDFs must live in assets/pdfs/ with these names.

const PDF_BASE = "assets/pdfs/";
const STORAGE_LAST = "spu.lastTariffKey";

// ------- Base rate data (from your earlier tariff datasets) -------
const RATE_DATA = {
  Businessrate: {
    variants: {
      "Businessrate 1": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": 20.34,
        "Service and Administration Charge [R/Pod/Day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 1.98
      },
      "Businessrate 2": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": 30.21,
        "Service and Administration Charge [R/Pod/Day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 2.95
      },
      "Businessrate 3": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": 75.38,
        "Service and Administration Charge [R/Pod/Day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 7.37
      },
      "Businessrate 4": {
        "Energy Charge [c/kWh]": 350.09,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": null,
        "Service and Administration Charge [R/Pod/Day]": null,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 0.00
      }
    }
  },
  Homepower: {
    variants: {
      "Homepower 1": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/Pod/Day]": 12.13,
        "Service and Administration Charge [R/Pod/Day]": 3.27,
        "Generation Capacity Charge [R/Pod/Day]": 0.72
      },
      "Homepower 2": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/Pod/Day]": 27.07,
        "Service and Administration Charge [R/Pod/Day]": 3.27,
        "Generation Capacity Charge [R/Pod/Day]": 1.27
      },
      "Homepower 3": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/Pod/Day]": 57.82,
        "Service and Administration Charge [R/Pod/Day]": 3.27,
        "Generation Capacity Charge [R/Pod/Day]": 3.1
      },
      "Homepower 4": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/Pod/Day]": 8.35,
        "Service and Administration Charge [R/Pod/Day]": 3.27,
        "Generation Capacity Charge [R/Pod/Day]": 0.47
      }
    }
  },
  "Homepower Bulk": { variants: { "Homepower Bulk": {} } },
  Homelight: {
    variants: {
      "Homelight 20A": { "Energy Charge [c/kWh]": 216.11 },
      "Homelight 60A": { "Energy Charge [c/kWh]": 274.72 }
    }
  },
  Landrate: {
    variants: {
      "Landrate 1": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/Pod/Day]": 62.2,
        "Service and Administration Charge [R/Pod/Day]": 24.5,
        "Generation Capacity Charge [R/Pod/Day]": 2.71
      },
      "Landrate 2": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/Pod/Day]": 96.99,
        "Service and Administration Charge [R/Pod/Day]": 24.5,
        "Generation Capacity Charge [R/Pod/Day]": 5.37
      },
      "Landrate 3": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/Pod/Day]": 155.32,
        "Service and Administration Charge [R/Pod/Day]": 24.5,
        "Generation Capacity Charge [R/Pod/Day]": 10.5
      },
      "Landrate 4": {
        "Energy Charge [c/kWh]": 369.32,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/Pod/Day]": 45.92,
        "Generation Capacity Charge [R/Pod/Day]": 1.78
      },
      "LandrateDx*": {
        "Service and Administration Charge [R/Pod/Day]": 87
      }
    }
  },
  Landlight: {
    variants: {
      "Landlight 20A": { "Energy Charge [c/kWh]": 603.54 },
      "Landlight 60A": { "Energy Charge [c/kWh]": 836 }
    }
  },
  Municrate: {
    variants: {
      "Municrate 1": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": 20.34,
        "Service and Administration Charge [R/Pod/Day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 1.98
      },
      "Municrate 2": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": 30.21,
        "Service and Administration Charge [R/Pod/Day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 2.95
      },
      "Municrate 3": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": 75.38,
        "Service and Administration Charge [R/Pod/Day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 7.37
      },
      "Municrate 4": {
        "Energy Charge [c/kWh]": 350.09,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/Pod/Day]": null,
        "Service and Administration Charge [R/Pod/Day]": null,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/Pod/Day]": 0.00
      }
    }
  }
};

// ------- Quick info content (professionally formatted; no citations text) -------
const QUICK_INFO = {
  Businessrate: {
    file: "Businessrate.pdf",
    title: "Businessrate — Non-Local Authority (Urban)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Businessrate applies to commercial and community-type supplies in urban areas up to 100&nbsp;kVA where no grid-tied generation is connected.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em>: Active Energy, Network Demand, Ancillary Service, Electrification &amp; Rural Network Subsidy (where applicable).</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, Service &amp; Administration.</li>
      </ul>

      <p><strong>Good to know</strong></p>
      <p>For prepaid options, energy-based charges may be combined for vending; daily fixed charges may also be combined. Time-of-Use is required if grid-tied generation is connected.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Businessrate 1</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A); 2-phase 32&nbsp;kVA (80&nbsp;A/phase); 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Businessrate 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase); 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Businessrate 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase); 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Businessrate 4</strong> (conv./prepaid): same sizes as BR1</li>
      </ul>
    `
  },

  Homepower: {
    file: "Homepower.pdf",
    title: "Homepower — Non-Local Authority (Residential)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Homepower is the urban residential suite (also applied to comparable uses such as schools or clinics) for supplies up to 100&nbsp;kVA.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em>: Active Energy, Network Demand, Ancillary Service.</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, Service &amp; Administration.</li>
      </ul>

      <p><strong>Good to know</strong></p>
      <p>On prepaid configurations, energy components are combined for vending, and daily fixed components are combined.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Homepower 1</strong>: 2-phase 32&nbsp;kVA (80&nbsp;A/phase); 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Homepower 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase); 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Homepower 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase); 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Homepower 4</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A/phase)</li>
      </ul>
    `
  },

  "Homepower Bulk": {
    file: "Homepower Bulk.pdf",
    title: "Homepower Bulk — Sectional Title (Non-Local Authority)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Bulk residential supply for sectional-title developments.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em>: Active Energy, Network Demand, Ancillary Service.</li>
        <li><em>Fixed charges</em>: Network Capacity &amp; Generation Capacity (often on kVA/month), and Service &amp; Administration (R/POD/day).</li>
      </ul>

      <p><strong>Good to know</strong></p>
      <p>Network Capacity may be based on NMD or measured maximum demand.</p>
    `,
    supplyHTML: `
      <p>Supply is bulk/metered at development level. Capacity charges typically follow NMD/measured demand arrangements.</p>
    `
  },

  Homelight: {
    file: "Homelight.pdf",
    title: "Homelight — Non-Local Authority (Residential, Prepaid)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Prepaid, low-usage single-phase residential supply.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em> only. No fixed daily charges.</li>
      </ul>

      <p><strong>Good to know</strong></p>
      <p>Because fixed charges are not applied, the per-kWh energy price is higher than Homepower.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Homelight 20A</strong>: 1-phase 20&nbsp;A</li>
        <li><strong>Homelight 60A</strong>: 1-phase 60&nbsp;A (plus smart-meter 80&nbsp;A prepayment / legacy 80&nbsp;A post-paid)</li>
      </ul>
    `
  },

  Landrate: {
    file: "Landrate.pdf",
    title: "Landrate — Non-Local Authority (Rural)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Rural tariff suite for supplies up to 100&nbsp;kVA.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em>: Active Energy, Network Demand, Ancillary Service.</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, Service &amp; Administration (for relevant variants).</li>
      </ul>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Landrate 1</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A); 2-phase 32&nbsp;kVA (80&nbsp;A/phase); 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Landrate 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase); 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Landrate 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase); 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Landrate 4</strong>: ±5&nbsp;kVA single-phase (limited to 80&nbsp;A/phase)</li>
        <li><strong>Landrate Dx</strong>: daily fixed charge on a different basis</li>
      </ul>
    `
  },

  Landlight: {
    file: "Landlight.pdf",
    title: "Landlight — Non-Local Authority (Rural, Prepaid)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Rural prepayment option with no fixed daily charges.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em> only.</li>
      </ul>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Landlight 20A</strong>: 1-phase 20&nbsp;A</li>
        <li><strong>Landlight 60A</strong>: 1-phase 60&nbsp;A</li>
      </ul>
    `
  },

  Municrate: {
    file: "Municrate.pdf",
    title: "Municrate — Local Authority (Urban)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Local-authority urban suite.</p>

      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em> and <em>Demand (c/kWh)</em>.</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, Service &amp; Administration.</li>
      </ul>

      <p><strong>Good to know</strong></p>
      <p>Time-of-Use applies where grid-tied generation is present.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Municrate 1</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A); 2-phase 32&nbsp;kVA (80&nbsp;A/phase); 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Municrate 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase); 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Municrate 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase); 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Municrate 4</strong>: same sizes as Municrate 1 (conv./prepaid)</li>
      </ul>
    `
  }
};

// --- Helpers ---
const els = {};
function $(id){ return document.getElementById(id); }
const unitOf = (k) => (k.match(/\[(.*?)\]/)?.[1] || "");
const isEnergy = (k) => unitOf(k) === "c/kWh";
const isFixed  = (k) => unitOf(k) === "R/Pod/Day";

document.addEventListener("DOMContentLoaded", () => {
  els.select = $("tariffSelect");
  els.wrap   = $("contentWrap");
  els.title  = $("viewerTitle");
  els.embed  = $("pdfEmbed");
  els.iframe = $("pdfFrame");
  els.view   = $("viewBtn");
  els.dl     = $("downloadBtn");

  els.cardsWrap = $("detailCards");
  els.panel     = $("detailPanel");
  els.panelT    = $("panelTitle");
  els.panelB    = $("panelBody");

  const last = localStorage.getItem(STORAGE_LAST);
  if (last && QUICK_INFO[last]) {
    els.select.value = last;
    loadTariff(last);
  }

  els.select.addEventListener("change", () => {
    const key = els.select.value;
    if (!QUICK_INFO[key]) { els.wrap.style.display = "none"; return; }
    loadTariff(key);
    localStorage.setItem(STORAGE_LAST, key);
  });
});

function loadTariff(key){
  const meta = QUICK_INFO[key];
  els.wrap.style.display = "";
  els.title.textContent = meta.title;

  // Inline PDF (try <embed> first; if it fails to attach, show iframe fallback)
  const clean = PDF_BASE + meta.file;
  const url   = clean + "#toolbar=1&navpanes=0&view=FitH";
  try {
    els.embed.src = url;
    els.embed.removeAttribute("hidden");
    els.iframe.setAttribute("hidden", "true");
    // If the embed doesn't load within a short while (mobile oddities), use iframe
    setTimeout(() => {
      // Heuristic: if embed has zero size (render fail), flip to iframe
      const bb = els.embed.getBoundingClientRect();
      if (bb.width < 10 || bb.height < 10) {
        els.iframe.src = clean + "#zoom=page-width";
        els.iframe.removeAttribute("hidden");
      }
    }, 250);
  } catch {
    els.iframe.src = clean + "#zoom=page-width";
    els.iframe.removeAttribute("hidden");
  }

  els.view.href = clean;
  els.dl.href   = clean;
  els.dl.setAttribute("download", meta.file);

  // Build 3 quick cards: Description, Supply Sizes, Rates
  els.cardsWrap.innerHTML = "";
  createMiniCard("fa-clipboard-list", "Tariff Description", () => showPanel("Tariff Description", meta.descriptionHTML, true));
  createMiniCard("fa-plug", "Supply Sizes", () => showPanel("Supply Sizes", meta.supplyHTML, true));
  createMiniCard("fa-chart-bar", "Rates", () => showRatesPanel(key));

  // Auto-open Description
  showPanel("Tariff Description", meta.descriptionHTML, true);
}

function createMiniCard(icon, title, onClick){
  const btn = document.createElement("button");
  btn.className = "mini-card";
  btn.type = "button";
  btn.innerHTML = `<i class="fas ${icon}"></i><span>${title}</span>`;
  btn.addEventListener("click", onClick);
  els.cardsWrap.appendChild(btn);
}

function showPanel(title, html, formatted=false){
  els.panelT.textContent = title;
  els.panelB.innerHTML = formatted ? `<div class="prose">${html}</div>` : html;
  els.panel.classList.add("show");
}

// ----- Rates panel -----
function showRatesPanel(tariffKey){
  const rd = RATE_DATA[tariffKey];
  if (!rd) {
    els.panelT.textContent = "Rates";
    els.panelB.innerHTML = `<p>No rate data available for this tariff.</p>`;
    els.panel.classList.add("show");
    return;
  }

  // Build controls
  const variants = Object.keys(rd.variants);
  const charges = ["All", "Energy Charges (c/kWh)", "Fixed Charges (R/POD/day)"];

  const controls = document.createElement("div");
  controls.className = "rates-controls";
  controls.innerHTML = `
    <div class="rates-row">
      <label>Variant</label>
      <select id="rateVariant">${variants.map(v => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div class="rates-row">
      <label>Charge type</label>
      <select id="rateType">${charges.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
    </div>
  `;

  const tableWrap = document.createElement("div");
  tableWrap.className = "rates-table-wrap";
  tableWrap.innerHTML = `<table class="tariff-table"><thead><tr><th>Charge</th><th>Rate</th></tr></thead><tbody id="ratesTbody"></tbody></table>`;

  const renderTable = () => {
    const variant = document.getElementById("rateVariant").value;
    const type    = document.getElementById("rateType").value;
    const tbody   = tableWrap.querySelector("#ratesTbody");
    tbody.innerHTML = "";

    const obj = rd.variants[variant] || {};
    const entries = Object.entries(obj).filter(([,v]) => v !== null && v !== undefined);

    const filtered = entries.filter(([k]) => {
      if (type.startsWith("All")) return true;
      if (type.startsWith("Energy")) return isEnergy(k);
      if (type.startsWith("Fixed"))  return isFixed(k);
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="2">No matching charges for this selection.</td></tr>`;
      return;
    }

    for (const [k, v] of filtered) {
      const u = unitOf(k);
      const label = k.split("[")[0].trim();
      const display = u === "c/kWh" ? `${Number(v).toFixed(2)} c/kWh`
                   : u === "R/Pod/Day" ? `R ${Number(v).toFixed(2)} /POD/Day`
                   : `R ${Number(v).toFixed(2)}`;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${label}</td><td>${display}</td>`;
      tbody.appendChild(tr);
    }
  };

  // Wire and initial render
  setTimeout(() => {
    const vSel = controls.querySelector("#rateVariant");
    const tSel = controls.querySelector("#rateType");
    vSel.addEventListener("change", renderTable);
    tSel.addEventListener("change", renderTable);
    renderTable();
  });

  els.panelT.textContent = "Rates";
  els.panelB.innerHTML = "";
  els.panelB.appendChild(controls);
  els.panelB.appendChild(tableWrap);
  els.panel.classList.add("show");
}


