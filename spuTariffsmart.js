// Understanding Your Tariff — inline PDF, Quick details, Rates with VAT toggle.
// Place PDFs at assets/pdfs/ with the exact names referenced below.

const PDF_BASE = "assets/pdfs/";
const STORAGE_LAST     = "spu.lastTariffKey";
const STORAGE_VAT      = "spu.vatInclusive";
const VAT_RATE = 0.15;

/* ------------------------------------------------------------------------- */
/* Homeflex TOU definitions (explicit wheels + 2025/26 public-holiday rules) */
/* ------------------------------------------------------------------------- */
// Wheels match the booklet dials you provided (High = Jun–Aug; Low = Sep–May)
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

// 2025/26 public-holiday treatment for Homeflex uses the LAST column
// (Megaflex/Miniflex/WEPS/Megaflex Gen) from your uploaded table.
// Keys are ISO dates; values are the day type Homeflex must follow that day.
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

/* Utilities for the TOU Explorer */
const TOU_COLORS = { peak: "#C62828", standard: "#FBC02D", offpeak: "#2E7D32" };
function iso(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function seasonOf(d){ const m=d.getMonth(); return (m===5||m===6||m===7)?'high':'low'; } // Jun–Aug
function homeflexDayType(d){
  const k = iso(d);
  if (HF_PH_2025_26[k]) return HF_PH_2025_26[k]; // 'saturday' | 'sunday'
  const wd = d.getDay();
  if (wd===0) return 'sunday';
  if (wd===6) return 'saturday';
  return 'weekday';
}
function inAny(hour, ranges){ return ranges.some(([a,b]) => hour>=a && hour<b); }
function bandAt(dateObj){
  const season = seasonOf(dateObj);
  const dtype  = homeflexDayType(dateObj);
  const hour   = dateObj.getHours();
  const cfg = HF_TOU[season][dtype];
  if (inAny(hour, cfg.peak)) return 'peak';
  if (inAny(hour, cfg.standard)) return 'standard';
  return 'offpeak';
}
function segmentsForDay(d){
  const season = seasonOf(d);
  const dtype  = homeflexDayType(d);
  const cfg = HF_TOU[season][dtype];
  // normalize to an ordered set of [start,end,type] pieces across 24h
  const parts = [];
  [['peak',cfg.peak],['standard',cfg.standard],['offpeak',cfg.offpeak]].forEach(([t,arr])=>{
    arr.forEach(([s,e])=>parts.push({s,e,t}));
  });
  // Fill all hours: simple 24 bar by checking each hour bucket t
  const hourly = [];
  for (let h=0; h<24; h++){
    let t = 'offpeak';
    if (inAny(h, cfg.peak)) t='peak';
    else if (inAny(h, cfg.standard)) t='standard';
    hourly.push({h, t});
  }
  // Merge contiguous hours of same t
  const merged = [];
  let cur = {t: hourly[0].t, s:0};
  for (let h=1; h<=24; h++){
    const t = h<24 ? hourly[h].t : null;
    if (t!==cur.t){ merged.push({start:cur.s, end:h, type:cur.t}); cur={t, s:h}; }
  }
  return { season, dtype, merged };
}

/* ------------------------------------------------------------------------- */
/* ------------------------   RATE / CONTENT DATA   ------------------------ */
/* ------------------------------------------------------------------------- */

// ------- Rate data (from your earlier datasets) -------
const RATE_DATA = {
  Businessrate: {
    variants: {
      "Businessrate 1": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/POD/day]": 20.34,
        "Service and Administration Charge [R/POD/day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/POD/day]": 1.98
      },
      "Businessrate 2": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/POD/day]": 30.21,
        "Service and Administration Charge [R/POD/day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/POD/day]": 2.95
      },
      "Businessrate 3": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/POD/day]": 75.38,
        "Service and Administration Charge [R/POD/day]": 14.70,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/POD/day]": 7.37
      },
      "Businessrate 4": {
        "Energy Charge [c/kWh]": 350.09,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 14.54,
        "Network Capacity Charge [R/POD/day]": null,
        "Service and Administration Charge [R/POD/day]": null,
        "Electrification and Rural Network Subsidy Charge [c/kWh]": 4.94,
        "Generation Capacity Charge [R/POD/day]": 0.00
      }
    }
  },
  Homepower: {
    variants: {
      "Homepower 1": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/POD/day]": 12.13,
        "Service and Administration Charge [R/POD/day]": 3.27,
        "Generation Capacity Charge [R/POD/day]": 0.72
      },
      "Homepower 2": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/POD/day]": 27.07,
        "Service and Administration Charge [R/POD/day]": 3.27,
        "Generation Capacity Charge [R/POD/day]": 1.27
      },
      "Homepower 3": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/POD/day]": 57.82,
        "Service and Administration Charge [R/POD/day]": 3.27,
        "Generation Capacity Charge [R/POD/day]": 3.1
      },
      "Homepower 4": {
        "Energy Charge [c/kWh]": 268.78,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 26.37,
        "Network Capacity Charge [R/POD/day]": 8.35,
        "Service and Administration Charge [R/POD/day]": 3.27,
        "Generation Capacity Charge [R/POD/day]": 0.47
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
        "Network Capacity Charge [R/POD/day]": 62.2,
        "Service and Administration Charge [R/POD/day]": 24.5,
        "Generation Capacity Charge [R/POD/day]": 2.71
      },
      "Landrate 2": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/POD/day]": 96.99,
        "Service and Administration Charge [R/POD/day]": 24.5,
        "Generation Capacity Charge [R/POD/day]": 5.37
      },
      "Landrate 3": {
        "Energy Charge [c/kWh]": 224.93,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/POD/day]": 155.32,
        "Service and Administration Charge [R/POD/day]": 24.5,
        "Generation Capacity Charge [R/POD/day]": 10.5
      },
      "Landrate 4": {
        "Energy Charge [c/kWh]": 369.32,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Netword Demand Charge [c/kWh]": 61.66,
        "Network Capacity Charge [R/POD/day]": 45.92,
        "Generation Capacity Charge [R/POD/day]": 1.78
      },
      "LandrateDx*": {
        "Service and Administration Charge [R/POD/day]": 87
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
        "Energy Charge [c/kWh]": 229.79,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Demand Charge [c/kWh]": 43.60,
        "Network Capacity Charge [R/POD/day]": 34.06,
        "Service and Administration Charge [R/POD/day]": 18.81,
        "Generation Capacity Charge [R/POD/day]": 2.17
      },
      "Municrate 2": {
        "Energy Charge [c/kWh]": 229.79,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Demand Charge [c/kWh]": 43.60,
        "Network Capacity Charge [R/POD/day]": 69.01,
        "Service and Administration Charge [R/POD/day]": 18.81,
        "Generation Capacity Charge [R/POD/day]": 4.01
      },
      "Municrate 3": {
        "Energy Charge [c/kWh]": 229.79,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Demand Charge [c/kWh]": 43.60,
        "Network Capacity Charge [R/POD/day]": 138.21,
        "Service and Administration Charge [R/POD/day]": 18.81,
        "Generation Capacity Charge [R/POD/day]": 8.46
      },
      "Municrate 4": {
        "Energy Charge [c/kWh]": 349.28,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Demand Charge [c/kWh]": 43.60,
        "Network Capacity Charge [R/POD/day]": null,
        "Service and Administration Charge [R/POD/day]": null,
        "Generation Capacity Charge [R/POD/day]": null
      }
    }
  },

  // -------------------- Homeflex --------------------
  Homeflex: {
    variants: {
      "Homeflex 1": {
        "Active Energy (High) Peak [c/kWh]": 706.97,
        "Active Energy (High) Standard [c/kWh]": 216.31,
        "Active Energy (High) Off-Peak [c/kWh]": 159.26,
        "Active Energy (Low) Peak [c/kWh]": 329.28,
        "Active Energy (Low) Standard [c/kWh]": 204.90,
        "Active Energy (Low) Off-Peak [c/kWh]": 159.26,
        "Legacy Charge [c/kWh]": 22.78,
        "Network Demand Charge [c/kWh]": 26.37,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Capacity Charge [R/POD/day]": 12.13,
        "Generation Capacity Charge [R/POD/day]": 0.72,
        "Service and Administration Charge [R/POD/day]": 3.27
      },
      "Homeflex 2": {
        "Active Energy (High) Peak [c/kWh]": 706.97,
        "Active Energy (High) Standard [c/kWh]": 216.31,
        "Active Energy (High) Off-Peak [c/kWh]": 159.26,
        "Active Energy (Low) Peak [c/kWh]": 329.28,
        "Active Energy (Low) Standard [c/kWh]": 204.90,
        "Active Energy (Low) Off-Peak [c/kWh]": 159.26,
        "Legacy Charge [c/kWh]": 22.78,
        "Network Demand Charge [c/kWh]": 26.37,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Capacity Charge [R/POD/day]": 27.07,
        "Generation Capacity Charge [R/POD/day]": 1.27,
        "Service and Administration Charge [R/POD/day]": 3.27
      },
      "Homeflex 3": {
        "Active Energy (High) Peak [c/kWh]": 706.97,
        "Active Energy (High) Standard [c/kWh]": 216.31,
        "Active Energy (High) Off-Peak [c/kWh]": 159.26,
        "Active Energy (Low) Peak [c/kWh]": 329.28,
        "Active Energy (Low) Standard [c/kWh]": 204.90,
        "Active Energy (Low) Off-Peak [c/kWh]": 159.26,
        "Legacy Charge [c/kWh]": 22.78,
        "Network Demand Charge [c/kWh]": 26.37,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Capacity Charge [R/POD/day]": 57.82,
        "Generation Capacity Charge [R/POD/day]": 3.10,
        "Service and Administration Charge [R/POD/day]": 3.27
      },
      "Homeflex 4": {
        "Active Energy (High) Peak [c/kWh]": 706.97,
        "Active Energy (High) Standard [c/kWh]": 216.31,
        "Active Energy (High) Off-Peak [c/kWh]": 159.26,
        "Active Energy (Low) Peak [c/kWh]": 329.28,
        "Active Energy (Low) Standard [c/kWh]": 204.90,
        "Active Energy (Low) Off-Peak [c/kWh]": 159.26,
        "Legacy Charge [c/kWh]": 22.78,
        "Network Demand Charge [c/kWh]": 26.37,
        "Ancillary Service Charge [c/kWh]": 0.41,
        "Network Capacity Charge [R/POD/day]": 8.35,
        "Generation Capacity Charge [R/POD/day]": 0.47,
        "Service and Administration Charge [R/POD/day]": 3.27
      }
    }
  }
};

// ------- Quick info content -------
const QUICK_INFO = {
  Businessrate: {
    file: "Businessrate.pdf",
    title: "Businessrate — Non-Local Authority (Urban)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Businessrate is designed for commercial and community-type supplies in urban areas up to 100&nbsp;kVA where no grid-tied generation is connected.</p>
      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em>: Active Energy, Network Demand, Ancillary Service, and (where applicable) Electrification &amp; Rural Network Subsidy.</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, and Service &amp; Administration.</li>
      </ul>
      <p><strong>Good to know</strong></p>
      <p>For prepaid users, energy-based charges may be combined for vending and daily fixed charges may also be combined. Time-of-Use applies where grid-tied generation is present.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Businessrate 1</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A), 2-phase 32&nbsp;kVA (80&nbsp;A/phase), 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Businessrate 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase), 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Businessrate 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase), 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Businessrate 4</strong> (conv./prepaid): same sizes as BR1</li>
      </ul>
    `
  },

  Homepower: {
    file: "Homepower.pdf",
    title: "Homepower — Non-Local Authority (Residential)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Homepower is the residential suite for urban supplies up to 100&nbsp;kVA. It can also apply to comparable uses such as schools and clinics.</p>
      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em>: Active Energy, Network Demand, Ancillary Service.</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, Service &amp; Administration.</li>
      </ul>
      <p><strong>Good to know</strong></p>
      <p>For prepaid users, energy charges (c/kWh) may be combined for vending and daily fixed charges (R/POD/day) are combined.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Homepower 1</strong>: 2-phase 32&nbsp;kVA (80&nbsp;A/phase), 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Homepower 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase), 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Homepower 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase), 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
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
        <li><em>Fixed charges</em>: Network Capacity &amp; Generation Capacity (often on kVA/month), plus Service &amp; Administration (R/POD/day).</li>
      </ul>
      <p><strong>Good to know</strong></p>
      <p>Network Capacity may be based on NMD or measured maximum demand.</p>
    `,
    supplyHTML: `
      <p>Supply is bulk at development level. Capacity charges typically follow NMD/measured demand arrangements.</p>
    `
  },

  Homelight: {
    file: "Homelight.pdf",
    title: "Homelight — Non-Local Authority (Residential, Prepaid)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>Prepaid, low-usage single-phase residential supply.</p>
      <p><strong>How you’re charged</strong></p>
      <ul><li><em>Energy charges (c/kWh)</em> only. No fixed daily charges.</li></ul>
      <p><strong>Good to know</strong></p>
      <p>Homelight 20A is for indigent customers, while Homelight 60A is for medium to high usage residential customers</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Homelight 20A</strong>: 1-phase 20&nbsp;A</li>
        <li><strong>Homelight 60A</strong>: 1-phase 60&nbsp;A (smart-meter 80&nbsp;A prepayment and legacy 80&nbsp;A post-paid also exist)</li>
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
      <ul><li><em>Energy charges (c/kWh)</em> only.</li></ul>
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
      <p>Local-authority urban suite for smaller supplies.</p>
      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Energy charges (c/kWh)</em> and <em>Demand (c/kWh)</em>.</li>
        <li><em>Fixed charges (R/POD/day)</em>: Network Capacity, Generation Capacity, Service &amp; Administration.</li>
      </ul>
      <p><strong>Good to know</strong></p>
      <p>Time-of-Use applies where grid-tied generation is connected.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Municrate 1</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A); 2-phase 32&nbsp;kVA (80&nbsp;A/phase); 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Municrate 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase); 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Municrate 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase); 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Municrate 4</strong>: same sizes as Municrate 1 (conv./prepaid)</li>
      </ul>
    `
  },

  // -------------------- Homeflex (two PDFs) --------------------
  Homeflex: {
    files: ["Homeflex.pdf", "Homeflex2.pdf"],
    title: "Homeflex — Non-Local Authority (Residential, TOU + Gen-Offset)",
    descriptionHTML: `
      <p><strong>Overview</strong></p>
      <p>A Time-of-Use (TOU) residential tariff for customers up to 100&nbsp;kVA, including those with <em>grid-tied generation</em> (Gen-Offset / net billing).</p>
      <p><strong>How you’re charged</strong></p>
      <ul>
        <li><em>Active Energy (c/kWh)</em>, TOU &amp; season-differentiated (peak/standard/off-peak; high season Jun–Aug, low season Sep–May).</li>
        <li><em>Legacy</em>, <em>Network Demand</em>, and <em>Ancillary Service</em> charges (c/kWh).</li>
        <li><em>Network Capacity</em>, <em>Generation Capacity</em>, and <em>Service &amp; Administration</em> as daily fixed charges (R/POD/day).</li>
      </ul>
      <p><strong>Good to know</strong></p>
      <p>Public holidays follow explicit TOU treatment. The TOU Explorer below lets you test a date &amp; time.</p>
    `,
    supplyHTML: `
      <ul class="tight-list">
        <li><strong>Homeflex 1</strong>: 2-phase 32&nbsp;kVA (80&nbsp;A/phase); 3-phase 25&nbsp;kVA (40&nbsp;A/phase)</li>
        <li><strong>Homeflex 2</strong>: 2-phase 64&nbsp;kVA (150&nbsp;A/phase); 3-phase 50&nbsp;kVA (80&nbsp;A/phase)</li>
        <li><strong>Homeflex 3</strong>: 2-phase 100&nbsp;kVA (225&nbsp;A/phase); 3-phase 100&nbsp;kVA (150&nbsp;A/phase)</li>
        <li><strong>Homeflex 4</strong>: 1-phase 16&nbsp;kVA (80&nbsp;A)</li>
      </ul>
    `
  }
};

// --- DOM helpers / state ---
const els = {};
function $(id){ return document.getElementById(id); }
const unitOf = (k) => (k.match(/\[(.*?)\]/)?.[1] || "");
const isEnergy = (k) => unitOf(k) === "c/kWh";
const isFixed  = (k) => unitOf(k) === "R/POD/day";

const state = {
  vatInclusive: JSON.parse(localStorage.getItem(STORAGE_VAT) ?? "true")
};

document.addEventListener("DOMContentLoaded", () => {
  els.select = $("tariffSelect");
  els.wrap   = $("contentWrap");
  els.title  = $("viewerTitle");
  els.iframe = $("pdfFrame");
  els.embed  = $("pdfEmbed");
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

  // -------- multi-file aware viewer setup --------
  const files = meta.files || (meta.file ? [meta.file] : []);
  const primary = files[0];
  const clean = PDF_BASE + primary;

  // Inline PDF — try iframe first, fallback to embed if needed
  const urlIframe = clean + "#view=FitH";
  els.iframe.src = urlIframe;
  els.iframe.removeAttribute("hidden");

  setTimeout(() => {
    const bb = els.iframe.getBoundingClientRect();
    if (bb.width < 10 || bb.height < 10) {
      els.embed.src = clean + "#toolbar=1&navpanes=0&view=FitH";
      els.embed.removeAttribute("hidden");
    }
  }, 250);

  els.view.href = clean;
  els.dl.href   = clean;
  els.dl.setAttribute("download", primary);

  // Add/remove extra Part 2 buttons dynamically
  const actions = document.querySelector(".viewer-actions");
  Array.from(actions.querySelectorAll(".btn.extra")).forEach(b => b.remove());

  if (files.length > 1) {
    const second = PDF_BASE + files[1];

    const v2 = document.createElement("a");
    v2.className = "btn extra";
    v2.target = "_blank";
    v2.rel = "noopener";
    v2.href = second;
    v2.innerHTML = `<i class="fas fa-external-link-alt"></i> View (Part&nbsp;2)`;
    actions.appendChild(v2);

    const d2 = document.createElement("a");
    d2.className = "btn primary extra";
    d2.download = files[1];
    d2.href = second;
    d2.innerHTML = `<i class="fas fa-download"></i> Download (Part&nbsp;2)`;
    actions.appendChild(d2);
  }

  // Build quick cards
  els.cardsWrap.innerHTML = "";
  createMiniCard("fa-clipboard-list", "Tariff Description", () => showPanel("Tariff Description", meta.descriptionHTML, true));
  createMiniCard("fa-plug", "Supply Sizes", () => showPanel("Supply Sizes", meta.supplyHTML, true));
  createMiniCard("fa-chart-bar", "Rates", () => showRatesPanel(key));

  // Homeflex gets an extra interactive card
  if (key === "Homeflex") {
    createMiniCard("fa-clock", "TOU Explorer", () => showTouPanel());
  }

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

/* -------------------------- Rates (unchanged) --------------------------- */
function showRatesPanel(tariffKey){
  const rd = RATE_DATA[tariffKey];
  els.panelT.textContent = "Rates";
  if (!rd) {
    els.panelB.innerHTML = `<p>No rate data available for this tariff.</p>`;
    els.panel.classList.add("show");
    return;
  }

  const variants = Object.keys(rd.variants);
  const charges = ["All", "Energy charges (c/kWh)", "Fixed charges (R/POD/day)"];

  const controls = document.createElement("div");
  controls.className = "rates-controls";
  controls.innerHTML = `
    <div class="rates-row">
      <label for="rateVariant">Variant</label>
      <select id="rateVariant">${variants.map(v => `<option value="${v}">${v}</option>`).join("")}</select>
    </div>
    <div class="rates-row">
      <label for="rateType">Charge type</label>
      <select id="rateType">${charges.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
    </div>
    <div class="rates-row vat-row">
      <label>VAT mode</label>
      <label class="switch" title="Toggle VAT inclusive/exclusive">
        <input type="checkbox" id="vatToggle" ${state.vatInclusive ? "checked" : ""} />
        <span class="slider"></span>
      </label>
      <span id="vatModeLabel" class="vat-label">VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}</span>
    </div>
  `;

  const tableWrap = document.createElement("div");
  tableWrap.className = "rates-table-wrap";
  tableWrap.innerHTML = `
    <table class="tariff-table">
      <thead><tr><th>Charge</th><th>Rate</th></tr></thead>
      <tbody id="ratesTbody"></tbody>
    </table>
  `;

  const renderTable = () => {
    const variant = document.getElementById("rateVariant").value;
    const type    = document.getElementById("rateType").value;
    const tbody   = tableWrap.querySelector("#ratesTbody");
    tbody.innerHTML = "";

    const obj = rd.variants[variant] || {};
    const entries = Object.entries(obj).filter(([,v]) => v !== null && v !== undefined);

    const filtered = entries.filter(([k]) => {
      if (type.startsWith("All")) return true;
      if (type.toLowerCase().startsWith("energy")) return isEnergy(k);
      if (type.toLowerCase().startsWith("fixed"))  return isFixed(k);
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="2">No matching charges for this selection.</td></tr>`;
      return;
    }

    for (const [k, v] of filtered) {
      const u = unitOf(k);
      const label = k.split("[")[0].trim();

      let val = Number(v);
      if (state.vatInclusive) val = val * (1 + VAT_RATE);

      let display = "";
      if (u === "c/kWh") display = `${val.toFixed(2)} c/kWh`;
      else if (u === "R/POD/day") display = `R ${val.toFixed(2)} /POD/day`;
      else display = `R ${val.toFixed(2)}`;

      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${label}</td><td>${display}</td>`;
      tbody.appendChild(tr);
    }
  };

  setTimeout(() => {
    const vSel = controls.querySelector("#rateVariant");
    const tSel = controls.querySelector("#rateType");
    const vatToggle = controls.querySelector("#vatToggle");
    const vatLabel  = controls.querySelector("#vatModeLabel");

    vSel.addEventListener("change", renderTable);
    tSel.addEventListener("change", renderTable);
    vatToggle.addEventListener("change", () => {
      state.vatInclusive = vatToggle.checked;
      localStorage.setItem(STORAGE_VAT, JSON.stringify(state.vatInclusive));
      vatLabel.textContent = `VAT: ${state.vatInclusive ? "Inclusive" : "Exclusive"}`;
      renderTable();
    });

    renderTable();
  });

  els.panelB.innerHTML = "";
  els.panelB.appendChild(controls);
  els.panelB.appendChild(tableWrap);
  els.panel.classList.add("show");
}

/* ---------------------- Homeflex TOU Explorer ---------------------- */
function showTouPanel(){
  els.panelT.textContent = "Homeflex — TOU Explorer";

  // Defaults = current date & time
  const now = new Date();
  const defDate = iso(now);
  const defTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const wrap = document.createElement('div');
  wrap.className = 'prose';

  wrap.innerHTML = `
    <div class="muted" style="margin-bottom:.4rem;">
      Check the Homeflex TOU band (Peak / Standard / Off-peak) for any date & time.
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:end;">
      <label>Date<br><input id="touDate" type="date" value="${defDate}"></label>
      <label>Time<br><input id="touTime" type="time" step="60" value="${defTime}"></label>
      <div id="touBadge" class="pill" style="margin-left:auto;"></div>
    </div>

    <div id="touMeta" style="margin:.5rem 0 0.8rem 0;" class="muted"></div>

    <div id="touBar" style="width:100%;height:110px;border-radius:10px;background:#f3f5f9;position:relative;"></div>

    <div id="touLegend" style="display:flex;gap:1rem;margin-top:.6rem;flex-wrap:wrap;">
      ${legendSwatch('Peak', TOU_COLORS.peak)}
      ${legendSwatch('Standard', TOU_COLORS.standard)}
      ${legendSwatch('Off-peak', TOU_COLORS.offpeak)}
    </div>

    <div id="touIntervals" style="margin-top:.6rem;"></div>
  `;

  function legendSwatch(lbl, color){
    return `<span style="display:inline-flex;align-items:center;gap:.4rem;">
      <span aria-hidden="true" style="width:14px;height:14px;border-radius:4px;background:${color};display:inline-block;"></span>${lbl}
    </span>`;
  }

  els.panelB.innerHTML = "";
  els.panelB.appendChild(wrap);
  els.panel.classList.add("show");

  const dateEl = wrap.querySelector("#touDate");
  const timeEl = wrap.querySelector("#touTime");
  const badge  = wrap.querySelector("#touBadge");
  const meta   = wrap.querySelector("#touMeta");
  const bar    = wrap.querySelector("#touBar");
  const list   = wrap.querySelector("#touIntervals");

  function parseSelectedDate(){
    const [y,m,d] = (dateEl.value||defDate).split('-').map(n=>parseInt(n,10));
    const [hh,mm] = (timeEl.value||defTime).split(':').map(n=>parseInt(n,10));
    return new Date(y, m-1, d, hh, mm, 0);
  }

  function bandName(t){ return t==='peak'?'Peak':(t==='standard'?'Standard':'Off-peak'); }

  function drawBar(d){
    // Build day's merged segments
    const { season, dtype, merged } = segmentsForDay(d);

    // SVG bar across 24h
    const w = bar.clientWidth || 700;
    const h = bar.clientHeight || 110;
    bar.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);

    const padL = 28, padR = 28, padT = 24, padB = 28;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;

    // Axis baseline
    const base = document.createElementNS("http://www.w3.org/2000/svg","rect");
    base.setAttribute("x", padL);
    base.setAttribute("y", padT + innerH*0.25);
    base.setAttribute("width", innerW);
    base.setAttribute("height", innerH*0.5);
    base.setAttribute("rx", 10);
    base.setAttribute("fill", "#e9edf5");
    svg.appendChild(base);

    // Segments
    merged.forEach(seg=>{
      const x = padL + innerW * (seg.start/24);
      const wSeg = innerW * ((seg.end - seg.start)/24);
      const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", padT + innerH*0.25);
      rect.setAttribute("width", Math.max(1,wSeg));
      rect.setAttribute("height", innerH*0.5);
      rect.setAttribute("fill", TOU_COLORS[seg.type]);
      rect.setAttribute("rx", 10);
      svg.appendChild(rect);
    });

    // Hour ticks (every 3 hours)
    for (let hTick=0; hTick<=24; hTick+=3){
      const x = padL + innerW * (hTick/24);
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", x); line.setAttribute("x2", x);
      line.setAttribute("y1", padT + innerH*0.2); line.setAttribute("y2", padT + innerH*0.8);
      line.setAttribute("stroke", "#c9d3e6"); line.setAttribute("stroke-width", 1);
      svg.appendChild(line);

      const txt = document.createElementNS("http://www.w3.org/2000/svg","text");
      txt.textContent = String(hTick).padStart(2,'0');
      txt.setAttribute("x", x);
      txt.setAttribute("y", h - 8);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("font-size", "11");
      txt.setAttribute("fill", "#475065");
      svg.appendChild(txt);
    }

    // Cursor line for selected time
    const minOfDay = d.getHours()*60 + d.getMinutes();
    const xSel = padL + innerW * (minOfDay/1440);
    const cur = document.createElementNS("http://www.w3.org/2000/svg","line");
    cur.setAttribute("x1", xSel); cur.setAttribute("x2", xSel);
    cur.setAttribute("y1", padT); cur.setAttribute("y2", padT + innerH);
    cur.setAttribute("stroke", "#1d4ed8"); cur.setAttribute("stroke-width", 2);
    svg.appendChild(cur);

    // Title (season + day type)
    const title = document.createElementNS("http://www.w3.org/2000/svg","text");
    title.textContent = `${season.toUpperCase()} • ${dtype.toUpperCase()}`;
    title.setAttribute("x", padL);
    title.setAttribute("y", 16);
    title.setAttribute("font-size", "12");
    title.setAttribute("fill", "#475065");
    title.setAttribute("text-anchor", "start");
    svg.appendChild(title);

    bar.appendChild(svg);

    // Intervals list
    list.innerHTML = `
      <table class="tariff-table" style="margin-top:.25rem;">
        <thead><tr><th>Period</th><th>From</th><th>To</th></tr></thead>
        <tbody>
          ${merged.map(m=>`<tr>
            <td style="color:${TOU_COLORS[m.type]};"><strong>${bandName(m.type)}</strong></td>
            <td>${String(m.start).padStart(2,'0')}:00</td>
            <td>${String(m.end).padStart(2,'0')}:00</td>
          </tr>`).join("")}
        </tbody>
      </table>
    `;

    // Meta + badge
    const bd = bandAt(d);
    badge.textContent = bandName(bd);
    badge.style.background = TOU_COLORS[bd];
    badge.style.color = "#fff";
    badge.style.borderRadius = "999px";
    badge.style.padding = ".35rem .65rem";
    badge.style.fontWeight = "600";

    const dt = iso(d);
    const phNote = HF_PH_2025_26[dt] ? ` • Public holiday treated as <em>${HF_PH_2025_26[dt]}</em>` : "";
    meta.innerHTML = `For <strong>${dt}</strong> at <strong>${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</strong> — <strong>${bandName(bd)}</strong> (${seasonOf(d)} season • ${homeflexDayType(d)}${phNote}).`;
  }

  // Initial draw + wire
  const first = parseSelectedDate();
  drawBar(first);

  dateEl.addEventListener("change", () => drawBar(parseSelectedDate()));
  timeEl.addEventListener("input", () => drawBar(parseSelectedDate()));
}

/* ------------------------------- helpers ------------------------------- */
function createMiniCard(icon, title, onClick){
  const btn = document.createElement("button");
  btn.className = "mini-card";
  btn.type = "button";
  btn.innerHTML = `<i class="fas ${icon}"></i><span>${title}</span>`;
  btn.addEventListener("click", onClick);
  els.cardsWrap.appendChild(btn);
}



