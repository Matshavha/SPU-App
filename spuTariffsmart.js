// PDF-first; no default selection; two Quick details for every tariff.
// PDFs must live in assets/pdfs/ with these names.

const PDF_BASE = "assets/pdfs/";
const STORAGE_LAST = "spu.lastTariffKey";

// ---- Hard-coded quick details derived from the uploaded PDFs (Eskom, 2025) ----
// For each tariff: file, title, quick: { descriptionHTML, supplySizesHTML }.

const TARIFFS = {
  Businessrate: {
    file: "Businessrate.pdf",
    title: "Businessrate — Non-Local Authority (Urban)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Urban commercial/community-type supplies up to 100 kVA without grid-tied generation.</p>
        <p><strong>Charges:</strong> Active Energy, Network Demand, Ancillary Service (all c/kWh);
        Network Capacity, Generation Capacity, Service & Administration (R/POD/day);
        may include Electrification & Rural Network Subsidy (c/kWh). On prepayment, energy-based charges are combined for vending, and daily charges are combined (Eskom, 2025a).</p>
        <p><strong>Notes:</strong> Time-of-Use (TOU) is required if grid-tied generation is connected (Eskom, 2025a).</p>
      `,
      supplySizesHTML: `
        <ul>
          <li><strong>Businessrate 1:</strong> 1φ 16 kVA (80 A), 2φ 32 kVA (80 A/phase), 3φ 25 kVA (40 A/phase)</li>
          <li><strong>Businessrate 2:</strong> 2φ 64 kVA (150 A/phase), 3φ 50 kVA (80 A/phase)</li>
          <li><strong>Businessrate 3:</strong> 2φ 100 kVA (225 A/phase), 3φ 100 kVA (150 A/phase)</li>
          <li><strong>Businessrate 4:</strong> same sizes as BR1 (conv./prepaid)</li>
        </ul>
      `
    }
  },

  Homepower: {
    file: "Homepower.pdf",
    title: "Homepower — Non-Local Authority (Residential)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Residential suite in urban areas (also applied to similar uses like schools/clinics)
        up to 100 kVA (Eskom, 2025b).</p>
        <p><strong>Charges:</strong> Active Energy, Network Demand, Ancillary Service (c/kWh);
        Network Capacity, Generation Capacity, Service & Administration (R/POD/day).
        On prepaid, c/kWh components and daily components are each combined for vending (Eskom, 2025b).</p>
      `,
      supplySizesHTML: `
        <ul>
          <li><strong>Homepower 1:</strong> 2φ 32 kVA (80 A/phase), 3φ 25 kVA (40 A/phase)</li>
          <li><strong>Homepower 2:</strong> 2φ 64 kVA (150 A/phase), 3φ 50 kVA (80 A/phase)</li>
          <li><strong>Homepower 3:</strong> 2φ 100 kVA (225 A/phase), 3φ 100 kVA (150 A/phase)</li>
          <li><strong>Homepower 4:</strong> 1φ 16 kVA (80 A/phase)</li>
        </ul>
      `
    }
  },

  "Homepower Bulk": {
    file: "Homepower Bulk.pdf",
    title: "Homepower Bulk — Sectional Title (Non-Local Authority)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Bulk residential supply for sectional title developments; no grid-tied generation (Eskom, 2025c).</p>
        <p><strong>Charges:</strong> Active Energy, Network Demand, Ancillary Service (c/kWh);
        Network Capacity & Generation Capacity typically on kVA/month basis; Service & Admin (R/POD/day).
        Network capacity may be based on NMD or measured maximum demand (Eskom, 2025c).</p>
      `,
      supplySizesHTML: `
        <p>Supply is bulk/metered at development level. Individual dwelling supply sizes are managed internally;
        contractual NMD or measured maximum demand drives capacity charges (Eskom, 2025c).</p>
      `
    }
  },

  Homelight: {
    file: "Homelight.pdf",
    title: "Homelight — Non-Local Authority (Residential, Prepaid)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Prepayment, low-usage single-phase residential supply.
        <strong>Energy-only</strong> tariff — no fixed daily charges, hence higher c/kWh vs Homepower (Eskom, 2025d).</p>
      `,
      supplySizesHTML: `
        <ul>
          <li><strong>Homelight 20A:</strong> 1φ 20 A</li>
          <li><strong>Homelight 60A:</strong> 1φ 60 A prepayment; smart 80 A prepayment; 80 A post-paid (legacy) (Eskom, 2025d)</li>
        </ul>
      `
    }
  },

  Landrate: {
    file: "Landrate.pdf",
    title: "Landrate — Non-Local Authority (Rural)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Rural suite up to 100 kVA. Charges include energy (c/kWh), demand (c/kWh),
        capacity & generation capacity (R/POD/day), and service/admin (R/POD/day) where applicable (Eskom, 2025e).</p>
      `,
      supplySizesHTML: `
        <ul>
          <li><strong>Landrate 1:</strong> 1φ 16 kVA (80 A), 2φ 32 kVA (80 A/phase), 3φ 25 kVA (40 A/phase)</li>
          <li><strong>Landrate 2:</strong> 2φ 64 kVA (150 A/phase), 3φ 50 kVA (80 A/phase)</li>
          <li><strong>Landrate 3:</strong> 2φ 100 kVA (225 A/phase), 3φ 100 kVA (150 A/phase)</li>
          <li><strong>Landrate 4:</strong> ~5 kVA single-phase (limited to 80 A/phase)</li>
          <li><strong>Landrate Dx:</strong> bulk/different basis; daily fixed charge inclusive of components</li>
        </ul>
      `
    }
  },

  Landlight: {
    file: "Landlight.pdf",
    title: "Landlight — Non-Local Authority (Rural, Prepaid)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Rural prepayment, <strong>energy-only</strong> (no fixed charges) — energy rate higher than Landrate (Eskom, 2025f).</p>
      `,
      supplySizesHTML: `
        <ul>
          <li><strong>Landlight 20A:</strong> 1φ 20 A</li>
          <li><strong>Landlight 60A:</strong> 1φ 60 A</li>
        </ul>
      `
    }
  },

  Municrate: {
    file: "Municrate.pdf",
    title: "Municrate — Local Authority (Urban)",
    quick: {
      descriptionHTML: `
        <p><strong>What it is:</strong> Local authority urban suite. Charges include energy & demand (c/kWh),
        and fixed daily components (R/POD/day) such as network capacity, generation capacity, service & admin;
        TOU applies where grid-tied generation is present (Eskom, 2025g).</p>
      `,
      supplySizesHTML: `
        <ul>
          <li><strong>Municrate 1:</strong> 1φ 16 kVA (80 A), 2φ 32 kVA (80 A/phase), 3φ 25 kVA (40 A/phase)</li>
          <li><strong>Municrate 2:</strong> 2φ 64 kVA (150 A/phase), 3φ 50 kVA (80 A/phase)</li>
          <li><strong>Municrate 3:</strong> 2φ 100 kVA (225 A/phase), 3φ 100 kVA (150 A/phase)</li>
          <li><strong>Municrate 4:</strong> same sizes as Municrate 1 (conv./prepaid)</li>
        </ul>
      `
    }
  }
};

// --- DOM ---
const els = {};
function $(id){ return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", () => {
  els.select = $("tariffSelect");
  els.wrap   = $("contentWrap");
  els.title  = $("viewerTitle");
  els.obj    = $("pdfObject");
  els.iframe = $("pdfFrame");
  els.view   = $("viewBtn");
  els.dl     = $("downloadBtn");

  els.cardsWrap = $("detailCards");
  els.panel     = $("detailPanel");
  els.panelT    = $("panelTitle");
  els.panelB    = $("panelBody");

  // Do NOT auto-load any tariff; wait for selection
  const last = localStorage.getItem(STORAGE_LAST);
  if (last && TARIFFS[last]) {
    els.select.value = last;
    loadTariff(last);
  }

  els.select.addEventListener("change", () => {
    const key = els.select.value;
    if (!TARIFFS[key]) {
      els.wrap.style.display = "none";
      return;
    }
    loadTariff(key);
    localStorage.setItem(STORAGE_LAST, key);
  });
});

function loadTariff(key){
  const rec = TARIFFS[key];
  if (!rec) return;

  els.wrap.style.display = "";
  els.title.textContent = rec.title;

  // Inline PDF in the app (works on most mobile browsers via <object> embed)
  const pdfURL = PDF_BASE + rec.file + "#zoom=page-width";
  els.obj.setAttribute("data", PDF_BASE + rec.file + "#toolbar=1&navpanes=0&view=FitH");
  els.iframe.src = pdfURL; // fallback content if <object> fails to render

  // Actions: View / Download
  els.view.href = PDF_BASE + rec.file;
  els.dl.href   = PDF_BASE + rec.file;
  els.dl.setAttribute("download", rec.file);

  // Build exactly TWO quick detail cards per tariff
  els.cardsWrap.innerHTML = "";
  const cards = [
    { icon: "fa-clipboard-list", title: "Tariff Description", html: rec.quick.descriptionHTML },
    { icon: "fa-plug",           title: "Supply Sizes",       html: rec.quick.supplySizesHTML }
  ];
  cards.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.className = "mini-card";
    btn.type = "button";
    btn.innerHTML = `<i class="fas ${c.icon}"></i><span>${c.title}</span>`;
    btn.addEventListener("click", () => showPanel(c.title, c.html));
    els.cardsWrap.appendChild(btn);
    if (idx === 0) showPanel(c.title, c.html); // auto-open first card
  });
}

function showPanel(title, html){
  els.panelT.textContent = title;
  els.panelB.innerHTML = html;
  els.panel.classList.add("show");
}
