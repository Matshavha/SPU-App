// PDF-first, no search. Hard-coded detail cards per tariff from uploaded PDFs.
// Place PDFs under assets/pdfs/ with these exact names.

const PDF_BASE = "assets/pdfs/";
const STORAGE_LAST = "spu.lastTariffKey";

// --- DATA from uploaded PDFs (summarised) ---
// Each tariff has: file, title, and "cards" (title + html content).
// Sources: Businessrate.pdf, Homepower.pdf, Homepower Bulk.pdf, Homelight.pdf,
// Landrate.pdf, Landlight.pdf, Municrate.pdf (2025/26 Tariffs & Charges Booklet).

const TARIFFS = {
  Businessrate: {
    file: "Businessrate.pdf",
    title: "Businessrate — Non-Local Authority (Urban)",
    cards: [
      {
        title: "Variants & supply sizes",
        html: `
          <ul>
            <li><strong>Businessrate 1</strong>: single-phase 16 kVA (80 A/phase), dual-phase 32 kVA (80 A/phase), three-phase 25 kVA (40 A/phase).</li>
            <li><strong>Businessrate 2</strong>: dual-phase 64 kVA (150 A/phase), three-phase 50 kVA (80 A/phase).</li>
            <li><strong>Businessrate 3</strong>: dual-phase 100 kVA (225 A/phase), three-phase 100 kVA (150 A/phase).</li>
            <li><strong>Businessrate 4</strong> (conv./prepaid): same sizes as BR1.</li>
          </ul>
          <p class="muted">Up to 100 kVA, no grid-tied generation (TOU required if grid-tied).</p>
        `
      },
      {
        title: "Charges at a glance",
        html: `
          <ul>
            <li>Active energy (c/kWh), Network demand (c/kWh), Ancillary service (c/kWh).</li>
            <li>Network capacity (R/POD/day), Generation capacity (R/POD/day), Service & admin (R/POD/day).</li>
            <li>Electrification & rural network subsidy (c/kWh).</li>
          </ul>
          <p class="muted">When offered as prepaid: energy-based c/kWh charges combined; daily R/POD/day charges combined for vending.</p>
        `
      },
      {
        title: "Notes & applicability",
        html: `
          <p>Commercial or non-commercial (schools, clinics, churches, halls, etc.) in urban areas without grid-tied generation (up to 100 kVA).</p>
        `
      }
    ]
  },

  Homepower: {
    file: "Homepower.pdf",
    title: "Homepower — Non-Local Authority (Residential)",
    cards: [
      {
        title: "Variants & supply sizes",
        html: `
          <ul>
            <li><strong>Homepower 1</strong>: dual-phase 32 kVA (80 A/phase), three-phase 25 kVA (40 A/phase).</li>
            <li><strong>Homepower 2</strong>: dual-phase 64 kVA (150 A/phase), three-phase 50 kVA (80 A/phase).</li>
            <li><strong>Homepower 3</strong>: dual-phase 100 kVA (225 A/phase), three-phase 100 kVA (150 A/phase).</li>
            <li><strong>Homepower 4</strong>: single-phase 16 kVA (80 A/phase).</li>
            <li><strong>Homepower Bulk</strong>: no limit (see separate card).</li>
          </ul>
        `
      },
      {
        title: "Charges at a glance",
        html: `
          <ul>
            <li>Active energy, Network demand, Ancillary service (all c/kWh).</li>
            <li>Network capacity, Generation capacity, Service & admin (R/POD/day).</li>
          </ul>
          <p class="muted">On prepaid: energy-based c/kWh combined; daily R/POD/day combined for vending.</p>
        `
      },
      {
        title: "Notes & applicability",
        html: `
          <p>Residential suite (also used by similar supplies like schools/clinics) in urban areas up to 100 kVA.</p>
        `
      }
    ]
  },

  "Homepower Bulk": {
    file: "Homepower Bulk.pdf",
    title: "Homepower Bulk — Sectional Title (Non-Local Authority)",
    cards: [
      {
        title: "Applicability",
        html: `
          <p>Bulk residential supplies for sectional title developments; no grid-tied generation.</p>
        `
      },
      {
        title: "Charges at a glance",
        html: `
          <ul>
            <li>Active energy, Network demand, Ancillary service (c/kWh).</li>
            <li>Network capacity (R/kVA/month), Generation capacity (R/kVA/month).</li>
            <li>Service & admin (R/POD/day).</li>
          </ul>
          <p class="muted">Network capacity is based on NMD or measured maximum demand.</p>
        `
      }
    ]
  },

  Homelight: {
    file: "Homelight.pdf",
    title: "Homelight — Non-Local Authority (Residential, Prepaid)",
    cards: [
      {
        title: "Variants & supply sizes",
        html: `
          <ul>
            <li><strong>Homelight 20A</strong>: single-phase 20 A (low-usage).</li>
            <li><strong>Homelight 60A</strong>: single-phase 60 A prepayment or 80 A smart-meter prepayment / 80 A post-paid (for existing 80 A customers).</li>
          </ul>
        `
      },
      {
        title: "Charges at a glance",
        html: `
          <p><strong>Energy only</strong> (c/kWh). No fixed charges (hence higher energy rates than Homepower).</p>
        `
      },
      {
        title: "Upgrade note",
        html: `<p>Upgrading from 20 A to 60 A requires a connection fee.</p>`
      }
    ]
  },

  Landrate: {
    file: "Landrate.pdf",
    title: "Landrate — Non-Local Authority (Rural)",
    cards: [
      {
        title: "Variants & supply sizes",
        html: `
          <ul>
            <li><strong>Landrate 1</strong>: 16 kVA (1-ph 80 A), 32 kVA (2-ph 80 A), 25 kVA (3-ph 40 A).</li>
            <li><strong>Landrate 2</strong>: 64 kVA (2-ph 150 A), 50 kVA (3-ph 80 A).</li>
            <li><strong>Landrate 3</strong>: 100 kVA (2-ph 225 A), 100 kVA (3-ph 150 A).</li>
            <li><strong>Landrate 4</strong>: single-phase 5 kVA (limited to 80 A/phase).</li>
            <li><strong>Landrate Dx</strong>: no limit (daily fixed charge inclusive of multiple components).</li>
          </ul>
        `
      },
      {
        title: "Charges at a glance",
        html: `
          <ul>
            <li>Active energy, Network demand, Ancillary service (c/kWh).</li>
            <li>Network capacity, Generation capacity (R/POD/day).</li>
            <li>Service & admin (R/POD/day) for 1, 2, 3.</li>
          </ul>
          <p class="muted">When offered as prepaid (if/when available), certain charges are combined for vending.</p>
        `
      }
    ]
  },

  Landlight: {
    file: "Landlight.pdf",
    title: "Landlight — Non-Local Authority (Rural, Prepaid)",
    cards: [
      {
        title: "Variants & supply sizes",
        html: `
          <ul>
            <li><strong>Landlight 20A</strong>: single-phase 20 A.</li>
            <li><strong>Landlight 60A</strong>: single-phase 60 A.</li>
          </ul>
        `
      },
      {
        title: "Charges at a glance",
        html: `<p><strong>Energy only</strong> (c/kWh). No fixed charges; energy rates are higher than Landrate.</p>`
      }
    ]
  },

  Municrate: {
    file: "Municrate.pdf",
    title: "Municrate — Local Authority (Urban)",
    cards: [
      {
        title: "Variants & supply sizes",
        html: `
          <ul>
            <li><strong>Municrate 1</strong>: single-phase 16 kVA (80 A/phase), dual-phase 32 kVA (80 A/phase), three-phase 25 kVA (40 A/phase).</li>
            <li><strong>Municrate 2</strong>: dual-phase 64 kVA (150 A/phase), three-phase 50 kVA (80 A/phase).</li>
            <li><strong>Municrate 3</strong>: dual-phase 100 kVA (225 A/phase), three-phase 100 kVA (150 A/phase).</li>
            <li><strong>Municrate 4</strong> (conv./prepaid): same sizes as Municrate 1.</li>
          </ul>
        `
      },
      {
        title: "Charges at a glance",
        html: `
          <ul>
            <li>Active energy, Network demand, Ancillary service (c/kWh).</li>
            <li>Network capacity, Generation capacity, Service & admin (R/POD/day).</li>
          </ul>
          <p class="muted">New local-authority suite (replaces prior LA on Businessrate/Landrate/Homepower). TOU required if grid-tied generation.</p>
        `
      }
    ]
  }
};

// --- DOM ---
const els = {};
function $(id){ return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", () => {
  els.select = $("tariffSelect");
  els.wrap   = $("contentWrap");
  els.title  = $("viewerTitle");
  els.frame  = $("pdfFrame");
  els.view   = $("viewBtn");
  els.dl     = $("downloadBtn");

  els.cardsWrap = $("detailCards");
  els.panel     = $("detailPanel");
  els.panelT    = $("panelTitle");
  els.panelB    = $("panelBody");

  // Restore last or auto-select first real option
  const last = localStorage.getItem(STORAGE_LAST);
  const initial = last && TARIFFS[last] ? last : "Businessrate";
  setSelection(initial);
  loadTariff(initial);

  els.select.addEventListener("change", () => {
    const key = els.select.value;
    if (!TARIFFS[key]) return;
    loadTariff(key);
    localStorage.setItem(STORAGE_LAST, key);
  });
});

function setSelection(key){
  const opt = Array.from(els.select.options).find(o => o.value === key);
  if (opt) els.select.value = key;
}

function loadTariff(key){
  const rec = TARIFFS[key];
  if (!rec) return;

  els.wrap.style.display = "";
  els.title.textContent = rec.title;

  const url = PDF_BASE + rec.file + "#zoom=page-width";
  els.frame.src = url;
  els.view.href = PDF_BASE + rec.file;
  els.dl.href   = PDF_BASE + rec.file;
  els.dl.setAttribute("download", rec.file);

  // Build mini-cards
  els.cardsWrap.innerHTML = "";
  rec.cards.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.className = "mini-card";
    btn.type = "button";
    btn.innerHTML = `<i class="fas fa-info-circle"></i><span>${c.title}</span>`;
    btn.addEventListener("click", () => showPanel(c.title, c.html));
    els.cardsWrap.appendChild(btn);
    // Auto-open first card for quick context
    if (idx === 0) showPanel(c.title, c.html);
  });
}

function showPanel(title, html){
  els.panelT.textContent = title;
  els.panelB.innerHTML = html;
  els.panel.classList.add("show");
}




