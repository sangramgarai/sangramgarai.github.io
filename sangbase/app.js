/* ==========================================================================
   1. PWA MANIFEST, CONFIG (UPI & TUTORIAL LINK) & CONSTANTS
   ========================================================================== */
(function initPWAManifest() {
  const iconSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#0f172a"/><path d="M24 138 Q48 138 60 66 T96 138 T132 48 T168 138" fill="none" stroke="#22c55e" stroke-width="11" stroke-linecap="round"/><path d="M24 138 Q60 138 78 84 T120 138 T156 72 T174 138" fill="none" stroke="#3b82f6" stroke-width="9" stroke-linecap="round"/><path d="M24 138 Q42 102 66 138 T108 60 T144 138" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/></svg>')}`;
  const manifest = {
    name: "SangBase — Sanger Sequencing Analysis",
    short_name: "SangBase",
    description: "100% browser-only Sanger sequencing chromatogram viewer, assembler, and taxonomy workspace.",
    start_url: ".",
    display: "standalone",
    background_color: "#0b1120",
    theme_color: "#0f172a",
    icons: [{ src: iconSvg, sizes: "192x192", type: "image/svg+xml" }]
  };
  const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = URL.createObjectURL(blob);
  document.head.appendChild(link);
})();

const TUTORIAL_URL = "https://youtube.com"; // <-- Replace with your YouTube tutorial link

const UPI_CONFIG = {
  upiId: "yourname@upi",           // <-- Replace with your UPI ID
  payeeName: "SangBase Pro",
  amount: "99",
  supportEmail: "you@example.com", // <-- Replace with your support email
  qrImageDataUrl: ""               // <-- Optional: paste your UPI QR image URL or data:image/png;base64,...
};

const BUILTIN_PRIMERS = {
  F: [
    "27F","8F","16S-27F","338F","341F","515F","518F","799F","968F","1114F","rpoB-F","gyrB-F","UP-1","recA-F","H279",
    "ITS1","ITS1F","ITS5","ITS3","fITS7","ITS1-F_KYO1",
    "LR0R","NL1","LSU1F","LR3R",
    "NS1","NS3","NS5","SSU-F",
    "Bt2a","T1","T10",
    "EF1-728F","EF1-983F","EF1","983F","Al33F",
    "CMD5","CF1","CL1",
    "fRPB2-5F","RPB2-5F2","RPB1-Af",
    "ACT-512F",
    "M13F","M13-20","M13F(-21)","M13F(-47)","T7","T3","Fwd","Forward","Sense","_F","1F","-F"
  ],
  R: [
    "1492R","U1492R","1525R","1391R","1193R","1100R","907R","806R","800R","785R","534R","519R","rpoB-R","gyrB-R","UP-2r","recA-R","H280",
    "ITS4","ITS4B","ITS2","ITS4-KYO1","ITS4-KYO2",
    "LR5","LR7","NL4","TW13","LR3",
    "NS4","NS6","NS8","SSU-R",
    "Bt2b","T2","T22",
    "EF1-986R","EF1-2218R","EF2","2218R","1567R",
    "CMD6","CF4","CL2A",
    "fRPB2-7cR","RPB2-7cR","RPB1-Cr",
    "ACT-783R",
    "M13R","M13-Rev","M13R(-48)","SP6","T7-Term","Rev","Reverse","Antisense","_R","1R","-R"
  ]
};

const DEFAULT_CLIP_PRIMERS = [
  "AGAGTTTGATCMTGGCTCAG",   // 27F
  "TACGGYTACCTTGTTACGACTT", // 1492R
  "TCCGTAGGTGAACCTGCGG",    // ITS1
  "TCCTCCGCTTATTGATATGC",   // ITS4
  "GTAAAACGACGGCCAGT",      // M13F
  "CAGGAAACAGCTATGAC"       // M13R
];

const RESTRICTION_ENZYMES = [
  { name: "EcoRI", site: "GAATTC" },
  { name: "BamHI", site: "GGATCC" },
  { name: "HindIII", site: "AAGCTT" },
  { name: "XhoI", site: "CTCGAG" },
  { name: "NotI", site: "GCGGCCGC" },
  { name: "XbaI", site: "TCTAGA" },
  { name: "PstI", site: "CTGCAG" },
  { name: "SalI", site: "GTCGAC" },
  { name: "KpnI", site: "GGTACC" },
  { name: "SacI", site: "GAGCTC" }
];

const IUPAC_CODES = new Set("ACGTNWSMKRYBDHV".split(""));
const IUPAC_REGEX_MAP = {
  A:"A", C:"C", G:"G", T:"T", N:"[ACGTN]",
  R:"[AG]", Y:"[CT]", S:"[GC]", W:"[AT]", K:"[GT]", M:"[AC]",
  B:"[CGT]", D:"[AGT]", H:"[ACT]", V:"[ACG]"
};
const IUPAC_PAIR = {
  "AG":"R","GA":"R","CT":"Y","TC":"Y","GC":"S","CG":"S","AT":"W","TA":"W",
  "GT":"K","TG":"K","AC":"M","CA":"M","AA":"A","CC":"C","GG":"G","TT":"T"
};
const COMPLEMENT_MAP = {
  A:"T", T:"A", G:"C", C:"G", N:"N",
  R:"Y", Y:"R", S:"S", W:"W", K:"M", M:"K",
  B:"V", V:"B", D:"H", H:"D", "-":"-"
};

// Standard Genetic Code (Table 1) + NCBI overrides for Tables 11, 2, 5
const CODON_TABLE_1 = {
  TTT:"F",TTC:"F",TTA:"L",TTG:"L",CTT:"L",CTC:"L",CTA:"L",CTG:"L",
  ATT:"I",ATC:"I",ATA:"I",ATG:"M",GTT:"V",GTC:"V",GTA:"V",GTG:"V",
  TCT:"S",TCC:"S",TCA:"S",TCG:"S",CCT:"P",CCC:"P",CCA:"P",CCG:"P",
  ACT:"T",ACC:"T",ACA:"T",ACG:"T",GCT:"A",GCC:"A",GCA:"A",GCG:"A",
  TAT:"Y",TAC:"Y",TAA:"*",TAG:"*",CAT:"H",CAC:"H",CAA:"Q",CAG:"Q",
  AAT:"N",AAC:"N",AAA:"K",AAG:"K",GAT:"D",GAC:"D",GAA:"E",GAG:"E",
  TGT:"C",TGC:"C",TGA:"*",TGG:"W",CGT:"R",CGC:"R",CGA:"R",CGG:"R",
  AGT:"S",AGC:"S",AGA:"R",AGG:"R",GGT:"G",GGC:"G",GGA:"G",GGG:"G"
};

const GENETIC_CODES = {
  "1":  { name: "1: Standard (Eukaryote Nuclear)", overrides: {} },
  "11": { name: "11: Bacterial, Archaeal & Plastid", overrides: {} },
  "2":  { name: "2: Vertebrate Mitochondrial (COI)", overrides: { AGA:"*", AGG:"*", ATA:"M", TGA:"W" } },
  "5":  { name: "5: Invertebrate Mitochondrial (COI)", overrides: { AGA:"S", AGG:"S", ATA:"M", TGA:"W" } }
};

function translateCodon(codon, tableId = "1") {
  const ov = GENETIC_CODES[tableId]?.overrides || {};
  if (ov[codon]) return ov[codon];
  return CODON_TABLE_1[codon] || "X";
}

/* ==========================================================================
   2. OFFLINE PRO LICENSE VALIDATION (SBPRO-XXXX-XXXX-XXXX)
   ========================================================================== */
const SB_ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function sbComputeCheck(p1, p2) {
  const str = "SANGBASE-PRO-99-V1|" + p1 + "-" + p2;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 4; i++) out += SB_ALPHA[(h >>> (i * 5)) & 31];
  return out;
}

function validateProKey(key) {
  if (!key) return false;
  const norm = key.trim().toUpperCase();
  const m = /^SBPRO-([A-Z2-9]{4})-([A-Z2-9]{4})-([A-Z2-9]{4})$/.exec(norm);
  return !!(m && sbComputeCheck(m[1], m[2]) === m[3]);
}

function isPro() {
  return validateProKey(localStorage.getItem("sangbase_pro_key") || "");
}

function updateProUI() {
  const pro = isPro();
  const btn = document.getElementById("proBtn");
  if (pro) {
    btn.textContent = "Pro Active";
    btn.style.background = "var(--success-soft)";
    btn.style.borderColor = "var(--success)";
    btn.style.color = "var(--success)";
  } else {
    btn.textContent = "Upgrade to Pro (₹99)";
    btn.style.background = "";
    btn.style.borderColor = "";
    btn.style.color = "";
  }
  renderProDrawer();
}

/* ==========================================================================
   3. APPLICATION STATE & INDEXEDDB PERSISTENCE
   ========================================================================== */
const state = {
  projectName: "Untitled Sanger Project",
  samples: {},
  groups: {},
  order: [],
  selectedIds: new Set(),
  activeItemId: null,
  activeItemType: null,
  sort: { col: null, asc: true },
  settings: {
    simThreshold: 0.45,
    trimQ: 20,
    trimWin: 10,
    trimMinGood: 8,
    autoTrim: true,
    consMinConf: 20,
    minPeakFrac: 0.14,
    hetRatio: 0.30,
    geneticCode: "1",
    customF: [],
    customR: [],
    clipPrimerSeqs: [...DEFAULT_CLIP_PRIMERS]
  },
  viewer: {
    mode: 1,
    colWidth: 16,
    ampScale: 1.0,
    cursor: 0,
    selStart: null,
    selEnd: null,
    activeRow: 0,
    findMatches: [],
    findIdx: -1,
    proTab: "consensus",
    showUntrimmedConsensus: false,
    selectedFrame: "+1",
    frameData: [],
    reResults: [],
    hetResults: [],
    crisprSplit: null,
    wtSample: null,
    wtDiffs: []
  },
  phyloCache: { names: [], matrix: [], newick: "", svg: "" },
  derepClusters: []
};

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function emptyNotes() {
  return {
    taxon: "", accession: "", identity: "", coverage: "", evalue: "", marker: "", text: "",
    strain: "", isolate: "", isolationSource: "", host: "", geoLoc: "", collectionDate: "", collectedBy: "", voucher: ""
  };
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("sangbase_settings") || "null");
    if (saved) Object.assign(state.settings, saved);
    if (!Array.isArray(state.settings.clipPrimerSeqs)) state.settings.clipPrimerSeqs = [...DEFAULT_CLIP_PRIMERS];
    const theme = localStorage.getItem("sangbase_theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("themeBtn").textContent = theme === "dark" ? "Light" : "Dark";
    const at = document.getElementById("autoTrimToggle");
    if (at) at.checked = state.settings.autoTrim !== false;
    const tut = document.getElementById("tutorialBtn");
    if (tut && TUTORIAL_URL) tut.href = TUTORIAL_URL;
  } catch (e) {}
}

function saveSettings() {
  localStorage.setItem("sangbase_settings", JSON.stringify(state.settings));
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("SangBaseDB", 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("workspace")) db.createObjectStore("workspace");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let persistTimer = null;
function persistDB() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("workspace", "readwrite");
      tx.objectStore("workspace").put(serializeProject(), "current");
    } catch (e) { console.warn("IndexedDB save error", e); }
  }, 300);
}

async function restoreDB() {
  try {
    const db = await openDB();
    const tx = db.transaction("workspace", "readonly");
    const req = tx.objectStore("workspace").get("current");
    req.onsuccess = () => {
      if (req.result) {
        deserializeProject(req.result);
        toast("Restored offline session from IndexedDB", "success");
      }
    };
  } catch (e) {}
}

function serializeProject() {
  const cleanSamples = {};
  for (const [id, s] of Object.entries(state.samples)) {
    cleanSamples[id] = {
      ...s,
      traces: { A: Array.from(s.traces.A), T: Array.from(s.traces.T), G: Array.from(s.traces.G), C: Array.from(s.traces.C) },
      ploc: Array.from(s.ploc),
      pcon: Array.from(s.pcon),
      deleted: Array.from(s.deleted || []),
      undoStack: [], redoStack: []
    };
  }
  const cleanGroups = {};
  for (const [id, g] of Object.entries(state.groups)) {
    cleanGroups[id] = {
      ...g,
      deleted: Array.from(g.deleted || []),
      undoStack: [], redoStack: []
    };
  }
  return {
    format: "sangbase.project.v2",
    projectName: state.projectName,
    settings: state.settings,
    samples: cleanSamples,
    groups: cleanGroups,
    order: state.order
  };
}

function deserializeProject(data) {
  state.projectName = data.projectName || "Untitled Sanger Project";
  document.getElementById("projectNameInput").value = state.projectName;
  if (data.settings) {
    Object.assign(state.settings, data.settings);
    saveSettings();
  }
  state.samples = {};
  for (const [id, s] of Object.entries(data.samples || {})) {
    state.samples[id] = {
      ...s,
      traces: { A: new Int16Array(s.traces.A), T: new Int16Array(s.traces.T), G: new Int16Array(s.traces.G), C: new Int16Array(s.traces.C) },
      ploc: new Int32Array(s.ploc),
      pcon: new Uint8Array(s.pcon),
      deleted: new Set(s.deleted || []),
      edits: s.edits || {},
      undoStack: [], redoStack: []
    };
  }
  state.groups = {};
  for (const [id, g] of Object.entries(data.groups || {})) {
    state.groups[id] = {
      ...g,
      deleted: new Set(g.deleted || []),
      edits: g.edits || {},
      undoStack: [], redoStack: []
    };
  }
  state.order = data.order || [];
  state.selectedIds.clear();
  state.activeItemId = null;
  state.activeItemType = null;
  renderTable();
  renderViewer();
}

/* ==========================================================================
   4. NATIVE BINARY .AB1 (ABIF) PARSER + REAL-WORLD HARDENING
   ========================================================================== */
function parseAB1(arrayBuffer, fileName) {
  const dv = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== "ABIF") throw new Error(`"${fileName}" is not a valid binary ABIF (.ab1) file.`);

  const numEntries = dv.getInt32(18, false);
  const dirOffset = dv.getInt32(26, false);

  const entries = {};
  for (let i = 0; i < numEntries; i++) {
    const off = dirOffset + i * 28;
    if (off + 28 > bytes.length) break;
    const tag = String.fromCharCode(bytes[off], bytes[off+1], bytes[off+2], bytes[off+3]);
    const num = dv.getInt32(off + 4, false);
    const elemType = dv.getInt16(off + 8, false);
    const elemSize = dv.getInt16(off + 10, false);
    const numElems = dv.getInt32(off + 12, false);
    const dataSize = dv.getInt32(off + 16, false);
    const dataOffset = dv.getInt32(off + 20, false);
    entries[`${tag}_${num}`] = { tag, num, elemType, elemSize, numElems, dataSize, dataOffset, rawOff: off + 20 };
  }

  function readBytes(entry) {
    if (!entry) return null;
    if (entry.dataSize <= 4) return bytes.slice(entry.rawOff, entry.rawOff + entry.dataSize);
    return bytes.slice(entry.dataOffset, entry.dataOffset + entry.dataSize);
  }

  function readInt16Array(entry) {
    if (!entry) return new Int16Array(0);
    const start = entry.dataSize <= 4 ? entry.rawOff : entry.dataOffset;
    const count = Math.floor(entry.dataSize / 2);
    const out = new Int16Array(count);
    for (let i = 0; i < count; i++) out[i] = dv.getInt16(start + i * 2, false);
    return out;
  }

  let fwo = "GATC";
  const fwoRaw = readBytes(entries["FWO__1"]);
  if (fwoRaw && fwoRaw.length >= 4) fwo = String.fromCharCode(fwoRaw[0], fwoRaw[1], fwoRaw[2], fwoRaw[3]).toUpperCase();

  const rawTraces = {};
  for (let c = 0; c < 4; c++) rawTraces[fwo[c] || "GATC"[c]] = readInt16Array(entries[`DATA_${9 + c}`]);
  const traceLen = Math.min(rawTraces.A.length, rawTraces.T.length, rawTraces.G.length, rawTraces.C.length);
  const traces = {
    A: rawTraces.A.slice(0, traceLen), T: rawTraces.T.slice(0, traceLen),
    G: rawTraces.G.slice(0, traceLen), C: rawTraces.C.slice(0, traceLen)
  };

  const pbasRaw = readBytes(entries["PBAS_2"]) || readBytes(entries["PBAS_1"]);
  let seq = "";
  if (pbasRaw) {
    for (let i = 0; i < pbasRaw.length; i++) seq += String.fromCharCode(pbasRaw[i]);
    seq = seq.toUpperCase().replace(/[^ACGTNWSMKRYBDHV]/g, "N");
  }

  const ploc = sanitizePLOC(readInt16Array(entries["PLOC_2"] || entries["PLOC_1"]), seq.length, traceLen);
  const pconRaw = readBytes(entries["PCON_2"]) || readBytes(entries["PCON_1"]);
  const pcon = new Uint8Array(seq.length);
  for (let i = 0; i < seq.length; i++) pcon[i] = pconRaw && i < pconRaw.length ? pconRaw[i] : 30;

  let smplName = fileName.replace(/\.ab1$/i, "");
  const smplRaw = readBytes(entries["SMPL_1"]);
  if (smplRaw && smplRaw.length > 1) {
    const pLen = smplRaw[0];
    if (pLen > 0 && pLen < smplRaw.length) {
      let s = "";
      for (let i = 1; i <= pLen; i++) s += String.fromCharCode(smplRaw[i]);
      if (s.trim().length > 0) smplName = s.trim();
    }
  }

  const normHeight = computePercentile95(traces, ploc);
  const detected = detectPrimerAndDirection(fileName);

  const smp = {
    id: uid("smp"), fileName, name: fileName.replace(/\.ab1$/i, ""), smplTag: smplName,
    direction: detected.dir || "F", detectedPrimer: detected.primer || "",
    seq, traces, ploc, pcon, normHeight,
    use: true, notes: emptyNotes(), refFasta: "", snpResults: null,
    edits: {}, deleted: new Set(), trimStart: 0, trimEnd: seq.length,
    savedConsensus: null, undoStack: [], redoStack: []
  };

  if (state.settings.autoTrim) {
    const b = computeQualityTrimBounds(smp.seq, smp.pcon, state.settings.trimQ || 20, state.settings.trimWin || 10, state.settings.trimMinGood || 8);
    smp.trimStart = b.start; smp.trimEnd = b.end;
  }
  return smp;
}

function sanitizePLOC(raw, seqLen, traceLen) {
  const out = new Int32Array(seqLen);
  if (seqLen === 0) return out;
  const maxIdx = Math.max(1, traceLen - 1), step = traceLen / Math.max(1, seqLen);
  for (let i = 0; i < seqLen; i++) {
    let v = i < raw.length ? raw[i] : Math.round((i + 0.5) * step);
    if (!Number.isFinite(v) || v < 0) v = Math.round((i + 0.5) * step);
    if (v > maxIdx) v = maxIdx;
    if (i > 0 && v <= out[i - 1]) v = Math.min(maxIdx, out[i - 1] + 1);
    out[i] = v;
  }
  return out;
}

function computePercentile95(traces, ploc) {
  const peaks = [];
  for (let i = 0; i < ploc.length; i++) {
    const idx = ploc[i];
    const m = Math.max(traces.A[idx] || 0, traces.T[idx] || 0, traces.G[idx] || 0, traces.C[idx] || 0);
    if (m > 0) peaks.push(m);
  }
  if (!peaks.length) return 1000;
  peaks.sort((a, b) => a - b);
  return Math.max(200, peaks[Math.floor(peaks.length * 0.95)] || 1000);
}

/* ==========================================================================
   5. SYNTHETIC BINARY .AB1 WRITER & STANDARD DEMO DATA
   ========================================================================== */
function generateSyntheticAB1(sampleName, seq, opts = {}) {
  const spacing = 12, traceLen = (seq.length + 2) * spacing;
  const channels = { A: new Int16Array(traceLen), T: new Int16Array(traceLen), G: new Int16Array(traceLen), C: new Int16Array(traceLen) };
  const ploc = new Int16Array(seq.length), pcon = new Uint8Array(seq.length);
  const noisyEnds = opts.noisyEnds || false, hets = opts.hets || {};

  let seed = 1337;
  for (let i = 0; i < sampleName.length; i++) seed = (seed * 31 + sampleName.charCodeAt(i)) >>> 0;
  function rand() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }

  for (let i = 0; i < seq.length; i++) {
    const center = Math.round((i + 1) * spacing + (rand() - 0.5) * 1.2);
    ploc[i] = center;
    const isEnd = noisyEnds && (i < 16 || i > seq.length - 16);
    pcon[i] = hets[i] ? 24 : (isEnd ? Math.floor(8 + rand() * 10) : Math.floor(38 + rand() * 18));

    const mainBase = seq[i], secBase = hets[i] || null;
    const amp = isEnd ? 380 + rand() * 300 : 1250 + rand() * 350;
    const sigma = isEnd ? 3.2 : 2.35;

    for (let x = Math.max(0, center - 10); x < Math.min(traceLen, center + 11); x++) {
      const g = Math.exp(-0.5 * Math.pow((x - center) / sigma, 2));
      if (channels[mainBase]) channels[mainBase][x] = Math.min(30000, channels[mainBase][x] + Math.round(amp * g));
      if (secBase && channels[secBase]) channels[secBase][x] = Math.min(30000, channels[secBase][x] + Math.round(amp * 0.68 * g));
      if (isEnd) for (const b of ["A","T","G","C"]) channels[b][x] = Math.min(30000, channels[b][x] + Math.round(rand() * 240 * g));
    }
  }
  for (let x = 0; x < traceLen; x++) for (const b of ["A","T","G","C"]) channels[b][x] += Math.round(12 + rand() * (noisyEnds ? 40 : 18));

  const records = [];
  const addRec = (tag, num, elemType, elemSize, bytesArr) => records.push({ tag, num, elemType, elemSize, numElems: Math.floor(bytesArr.length / elemSize), bytes: bytesArr });
  const i16ToBytes = arr => { const buf = new ArrayBuffer(arr.length * 2), dv = new DataView(buf); for (let i = 0; i < arr.length; i++) dv.setInt16(i * 2, arr[i], false); return new Uint8Array(buf); };
  const strToBytes = s => { const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };

  addRec("FWO_", 1, 2, 1, strToBytes("GATC"));
  addRec("DATA", 9, 4, 2, i16ToBytes(channels.G));
  addRec("DATA", 10, 4, 2, i16ToBytes(channels.A));
  addRec("DATA", 11, 4, 2, i16ToBytes(channels.T));
  addRec("DATA", 12, 4, 2, i16ToBytes(channels.C));
  addRec("PBAS", 2, 2, 1, strToBytes(seq));
  addRec("PLOC", 2, 4, 2, i16ToBytes(ploc));
  addRec("PCON", 2, 2, 1, pcon);
  const pStr = new Uint8Array(sampleName.length + 1);
  pStr[0] = sampleName.length;
  for (let i = 0; i < sampleName.length; i++) pStr[i + 1] = sampleName.charCodeAt(i);
  addRec("SMPL", 1, 18, 1, pStr);

  let dataTotal = 0;
  for (const r of records) if (r.bytes.length > 4) dataTotal += r.bytes.length;
  const headerSize = 128, dirOffset = headerSize + dataTotal;
  const out = new ArrayBuffer(dirOffset + records.length * 28), dv = new DataView(out), u8 = new Uint8Array(out);

  u8.set(strToBytes("ABIF"), 0); dv.setInt16(4, 101, false); u8.set(strToBytes("tdir"), 6);
  dv.setInt32(10, 1, false); dv.setInt16(14, 1023, false); dv.setInt16(16, 28, false);
  dv.setInt32(18, records.length, false); dv.setInt32(22, records.length * 28, false); dv.setInt32(26, dirOffset, false);

  let curData = headerSize;
  records.forEach((r, idx) => {
    const dOff = dirOffset + idx * 28;
    u8.set(strToBytes(r.tag), dOff); dv.setInt32(dOff + 4, r.num, false);
    dv.setInt16(dOff + 8, r.elemType, false); dv.setInt16(dOff + 10, r.elemSize, false);
    dv.setInt32(dOff + 12, r.numElems, false); dv.setInt32(dOff + 16, r.bytes.length, false);
    if (r.bytes.length <= 4) u8.set(r.bytes, dOff + 20);
    else { dv.setInt32(dOff + 20, curData, false); u8.set(r.bytes, curData); curData += r.bytes.length; }
  });
  return out;
}

function loadDemoData() {
  // 1. Clean protein-coding pair (BRCA1 Exon 11) with clean +1 ORF, restriction sites, and 2 heterozygous peaks
  const brcaCore =
    "CCGGAATTCCATGGCTAGCGATCGTAAGCTTGACCTGACCGGATCCTACGATCGATCG" +
    "ATGCTAGCTAGCATCGATCGTAGCTAGCATCGATCGTAGCTGACTCGAGCTGATCGAT" +
    "CGATCGTAGCTAGCTAGCATCGATCGTAGCTAGCTAGCATCGATCGTAGCTAGCTAAC" +
    "GGTAAGCTTGGATCCGAATTC";
  const brcaF = brcaCore.slice(0, 165);
  const brcaR = revComp(brcaCore.slice(25));

  // 2. Microbial 16S rRNA pair with noisy ends, F/R discrepancies, and a 1 bp indel
  const microbialCore =
    "AGAGTTTGATCCTGGCTCAGGACGAACGCTGGCGGCGTGCCTAATACATGCAAGTCGA" +
    "GCGGACAGATGGGAGCTTGCTCCCTGATGTTAGCGGCGGACGGGTGAGTAACACGTGG" +
    "GTAACCTGCCTGTAAGACTGGGATAACTCCGGGAAACCGGGGCTAATACCGGATGGTT" +
    "GTTTGAACCGCATGGTTCAAACATAAAAGGTGGCTTCGGCTACCACTTACAGATGGAC";
  const mFwd = "NNGTCGTACGTACGTA" + microbialCore.slice(0, 175) + "TCGANNTG";
  const mCoreDel = microbialCore.slice(20, 95) + microbialCore.slice(96, 195);
  const mRevArr = revComp(mCoreDel).split("");
  mRevArr[40] = mRevArr[40] === "A" ? "G" : "A";
  mRevArr[65] = mRevArr[65] === "C" ? "T" : "C";
  const mRev = "NNATCGATGCTAGC" + mRevArr.join("") + "GGNNTT";

  // 3. Intentionally mismatched fungal ITS pair
  const misF = "ATGCGTACGTTAGCTAGCTAGGCTAGCTAGCTAGCGATCGATCGATCGTAGCTAGCTAGCATCGATCGTAGCTAGCTAGCTAGCATCGATCGTAGC";
  const misR = "GGGGCCCCAAAATTTTGGCCAATTGGCCAATTGGCCAATTCCGGTTAACCGGTTAACCGGTTAACCGGAATTCCGGAATTCCGGAATTCCGGAATT";

  const demoFiles = [
    { name: "BRCA1_Ex11_M13F.ab1", buf: generateSyntheticAB1("BRCA1_Ex11_M13F", brcaF, { hets: { 48: "G", 92: "T" } }) },
    { name: "BRCA1_Ex11_M13R.ab1", buf: generateSyntheticAB1("BRCA1_Ex11_M13R", brcaR, { hets: { 72: "A", 116: "C" } }) },
    { name: "Bacillus_16S_Iso01_27F_E05.ab1", buf: generateSyntheticAB1("Bacillus_16S_Iso01_27F", mFwd, { noisyEnds: true }) },
    { name: "Bacillus_16S_Iso01_1492R_F05.ab1", buf: generateSyntheticAB1("Bacillus_16S_Iso01_1492R", mRev, { noisyEnds: true }) },
    { name: "ITS_Fungus_Mismatch_ITS1F.ab1", buf: generateSyntheticAB1("ITS_Mismatch_F", misF, {}) },
    { name: "ITS_Fungus_Mismatch_ITS4.ab1", buf: generateSyntheticAB1("ITS_Mismatch_R", misR, {}) }
  ];

  for (const df of demoFiles) {
    const smp = parseAB1(df.buf, df.name);
    state.samples[smp.id] = smp;
    state.order.push({ type: "sample", id: smp.id });
  }
  autoGroupSamples();

  for (const g of Object.values(state.groups)) {
    if (g.name.includes("Bacillus_16S")) {
      g.notes = {
        ...emptyNotes(),
        taxon: "Bacillus subtilis", accession: "NR_112116.2", identity: "99.65%", coverage: "98%", evalue: "0.0",
        marker: "16S ribosomal RNA", text: "Demo pair with noisy ends and 1 bp indel",
        strain: "Iso01", isolationSource: "rhizosphere soil", geoLoc: "India: Chandigarh", collectionDate: "2026-11-27"
      };
    } else if (g.name.includes("BRCA1")) {
      g.notes = {
        ...emptyNotes(),
        taxon: "Homo sapiens", accession: "NM_007294.4", identity: "99.8%", coverage: "100%", evalue: "0.0",
        marker: "BRCA1 Exon 11", text: "Clean ORF + EcoRI/BamHI/HindIII/XhoI + 2 het peaks",
        isolate: "BRCA1-Ex11"
      };
    }
  }
  renderTable();
  const firstGroup = state.order.find(o => o.type === "group");
  if (firstGroup) openInViewer("group", firstGroup.id);
  persistDB();
  toast("Loaded 3 synthetic binary .ab1 demo pairs!", "success");
}

/* ==========================================================================
   6. ALIGNMENT, BAYESIAN CONSENSUS & QUALITY END-TRIMMING
   ========================================================================== */
function revComp(seq) {
  let out = "";
  for (let i = seq.length - 1; i >= 0; i--) out += COMPLEMENT_MAP[seq[i]] || "N";
  return out;
}

function getReverseComplementSample(s) {
  const n = s.traces.A.length;
  const rcTraces = { A: new Int16Array(n), T: new Int16Array(n), G: new Int16Array(n), C: new Int16Array(n) };
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    rcTraces.A[i] = s.traces.T[j]; rcTraces.T[i] = s.traces.A[j];
    rcTraces.G[i] = s.traces.C[j]; rcTraces.C[i] = s.traces.G[j];
  }
  const m = s.seq.length, rcPloc = new Int32Array(m), rcPcon = new Uint8Array(m);
  for (let i = 0; i < m; i++) {
    rcPloc[i] = Math.max(0, Math.min(n - 1, (n - 1) - s.ploc[m - 1 - i]));
    rcPcon[i] = s.pcon[m - 1 - i];
  }
  return { seq: revComp(s.seq), traces: rcTraces, ploc: rcPloc, pcon: rcPcon, normHeight: s.normHeight };
}

function alignForwardReverse(seqF, seqR_rc) {
  const m = seqF.length, n = seqR_rc.length;
  if (m === 0 || n === 0) return { cols: [], overlapLen: 0, identity: 0, isMismatch: true };

  const match = 2, mismatch = -2, gap = -3, W = n + 1;
  const dp = new Int16Array((m + 1) * W), tb = new Uint8Array((m + 1) * W);

  for (let i = 1; i <= m; i++) {
    const rowOff = i * W, prevOff = (i - 1) * W, cF = seqF.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const sc = cF === seqR_rc.charCodeAt(j - 1) ? match : mismatch;
      const d = dp[prevOff + j - 1] + sc, u = dp[prevOff + j] + gap, l = dp[rowOff + j - 1] + gap;
      if (d >= u && d >= l) { dp[rowOff + j] = d; tb[rowOff + j] = 1; }
      else if (u >= l) { dp[rowOff + j] = u; tb[rowOff + j] = 2; }
      else { dp[rowOff + j] = l; tb[rowOff + j] = 3; }
    }
  }

  let bestScore = -1e9, bi = m, bj = n;
  for (let j = 0; j <= n; j++) if (dp[m * W + j] > bestScore) { bestScore = dp[m * W + j]; bi = m; bj = j; }
  for (let i = 0; i <= m; i++) if (dp[i * W + n] > bestScore) { bestScore = dp[i * W + n]; bi = i; bj = n; }

  const cols = [];
  for (let i = m - 1; i >= bi; i--) cols.push({ fIdx: i, rIdx: -1 });
  for (let j = n - 1; j >= bj; j--) cols.push({ fIdx: -1, rIdx: j });

  let i = bi, j = bj, overlapLen = 0, matches = 0;
  while (i > 0 && j > 0) {
    const dir = tb[i * W + j];
    if (dir === 1) {
      overlapLen++; if (seqF[i - 1] === seqR_rc[j - 1] && seqF[i - 1] !== "N") matches++;
      cols.push({ fIdx: i - 1, rIdx: j - 1 }); i--; j--;
    } else if (dir === 2) { overlapLen++; cols.push({ fIdx: i - 1, rIdx: -1 }); i--; }
    else { overlapLen++; cols.push({ fIdx: -1, rIdx: j - 1 }); j--; }
  }
  while (i > 0) { cols.push({ fIdx: i - 1, rIdx: -1 }); i--; }
  while (j > 0) { cols.push({ fIdx: -1, rIdx: j - 1 }); j--; }
  cols.reverse();

  const identity = overlapLen > 0 ? (matches / overlapLen) * 100 : 0;
  return { cols, overlapLen, identity, isMismatch: overlapLen < 20 || identity < 60 };
}

function isValidTracePeak(strand, idx, baseChar, minPeakFrac = 0.14) {
  if (!strand || idx < 0 || idx >= strand.ploc.length) return false;
  const b = (baseChar || "").toUpperCase();
  if (!"ACGT".includes(b)) return false;
  const p = strand.ploc[idx];
  return (strand.traces[b] ? (strand.traces[b][p] || 0) : 0) >= (strand.normHeight || 1000) * minPeakFrac;
}

function getFlankingQuality(cols, colIdx, side, strand, radius = 2) {
  let sum = 0, count = 0;
  for (let d = 1; d <= radius; d++) {
    for (const step of [-d, d]) {
      const k = colIdx + step;
      if (k < 0 || k >= cols.length) continue;
      const bIdx = side === "F" ? cols[k].fIdx : cols[k].rIdx;
      if (bIdx >= 0) { sum += strand.pcon[bIdx] || 0; count++; }
    }
  }
  return count > 0 ? sum / count : 0;
}

function computeQualityTrimBounds(seq, qArr, qThresh = 20, win = 10, minGood = 8) {
  const n = qArr.length;
  if (n === 0) return { start: 0, end: 0 };
  if (n < win) return { start: 0, end: n };

  const isGood = i => (qArr[i] || 0) >= qThresh && seq[i] && "ACGT".includes(seq[i].toUpperCase());

  let start = 0, foundStart = false, goodCount = 0;
  for (let i = 0; i < win; i++) if (isGood(i)) goodCount++;
  for (let i = 0; i <= n - win; i++) {
    if (goodCount >= minGood) { start = i; foundStart = true; break; }
    if (i + win < n) { if (isGood(i)) goodCount--; if (isGood(i + win)) goodCount++; }
  }
  if (!foundStart) return { start: 0, end: n };

  let end = n; goodCount = 0;
  for (let i = n - win; i < n; i++) if (isGood(i)) goodCount++;
  for (let i = n - win; i >= start; i--) {
    if (goodCount >= minGood) { end = i + win; break; }
    if (i > start) { if (isGood(i + win - 1)) goodCount--; if (isGood(i - 1)) goodCount++; }
  }

  while (start < end && !isGood(start)) start++;
  while (end > start && !isGood(end - 1)) end--;
  return { start, end };
}

function buildGroupAlignmentAndConsensus(group) {
  const fwd = group.fwdId ? state.samples[group.fwdId] : null;
  const rev = group.revId ? state.samples[group.revId] : null;
  if (!fwd && !rev) return;

  const minConf = state.settings.consMinConf ?? 20;
  const minPeakFrac = state.settings.minPeakFrac ?? 0.14;

  if (fwd && rev) {
    const rc = getReverseComplementSample(rev);
    const aln = alignForwardReverse(fwd.seq, rc.seq);
    const cols = aln.cols;

    let ovStart = cols.length, ovEnd = -1;
    for (let i = 0; i < cols.length; i++) {
      if (cols[i].fIdx >= 0 && cols[i].rIdx >= 0) { if (i < ovStart) ovStart = i; if (i > ovEnd) ovEnd = i; }
    }

    const cons = [], consQ = [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i], inOverlap = i >= ovStart && i <= ovEnd;
      const hasF = c.fIdx >= 0, hasR = c.rIdx >= 0;
      const fb = hasF ? fwd.seq[c.fIdx].toUpperCase() : "-";
      const rb = hasR ? rc.seq[c.rIdx].toUpperCase() : "-";

      const fValid = hasF && isValidTracePeak(fwd, c.fIdx, fb, minPeakFrac);
      const rValid = hasR && isValidTracePeak(rc, c.rIdx, rb, minPeakFrac);
      const fq = hasF ? (fValid ? (fwd.pcon[c.fIdx] || 0) : 0) : 0;
      const rq = hasR ? (rValid ? (rc.pcon[c.rIdx] || 0) : 0) : 0;

      if (hasF && hasR) {
        if (fb === rb && "ACGT".includes(fb)) {
          const qComb = Math.min(60, fq + rq);
          cons.push(qComb >= minConf ? fb : "N"); consQ.push(qComb);
        } else {
          const netQ = Math.abs(fq - rq);
          if (netQ >= minConf) {
            const winner = fq > rq ? fb : rb;
            cons.push("ACGT".includes(winner) ? winner : "N"); consQ.push(netQ);
          } else { cons.push("N"); consQ.push(netQ); }
        }
      } else if (hasF) {
        if (inOverlap) {
          const oppFlankQ = getFlankingQuality(cols, i, "R", rc, 2);
          if (!fValid || fq < oppFlankQ) { cons.push("-"); consQ.push(0); }
          else { cons.push(fq >= minConf ? fb : "N"); consQ.push(fq); }
        } else { cons.push(fValid ? fb : "N"); consQ.push(fq); }
      } else if (hasR) {
        if (inOverlap) {
          const oppFlankQ = getFlankingQuality(cols, i, "F", fwd, 2);
          if (!rValid || rq < oppFlankQ) { cons.push("-"); consQ.push(0); }
          else { cons.push(rq >= minConf ? rb : "N"); consQ.push(rq); }
        } else { cons.push(rValid ? rb : "N"); consQ.push(rq); }
      }
    }

    group.alignment = aln;
    group.baseConsensus = cons.join("");
    group.baseConsensusQ = consQ;
    group.trimStart = 0; group.trimEnd = cons.length;
  } else {
    const s = fwd || rev, isRev = !fwd, data = isRev ? getReverseComplementSample(s) : s;
    const cols = [], cons = [], consQ = [];
    for (let i = 0; i < data.seq.length; i++) {
      cols.push(isRev ? { fIdx: -1, rIdx: i } : { fIdx: i, rIdx: -1 });
      const b = data.seq[i].toUpperCase(), valid = isValidTracePeak(data, i, b, minPeakFrac);
      cons.push(valid ? b : "N"); consQ.push(valid ? (data.pcon[i] || 0) : 0);
    }
    group.alignment = { cols, overlapLen: 0, identity: 100, isMismatch: false };
    group.baseConsensus = cons.join(""); group.baseConsensusQ = consQ;
    group.trimStart = 0; group.trimEnd = data.seq.length;
  }

  if (state.settings.autoTrim) {
    const b = computeQualityTrimBounds(group.baseConsensus, group.baseConsensusQ, state.settings.trimQ || 20, state.settings.trimWin || 10, state.settings.trimMinGood || 8);
    group.trimStart = b.start; group.trimEnd = b.end;
  }
  group.savedConsensus = getEffectiveConsensus(group).seq;
}

function getEffectiveConsensus(item) {
  const isGrp = item.alignment !== undefined;
  const baseSeq = isGrp ? (item.baseConsensus || "") : item.seq;
  const baseQ = isGrp ? (item.baseConsensusQ || []) : item.pcon;
  const edits = item.edits || {}, del = item.deleted || new Set();
  const tStart = item.trimStart || 0, tEnd = item.trimEnd !== undefined ? item.trimEnd : baseSeq.length;

  let seq = "", qSum = 0, q20 = 0, q30 = 0, gc = 0, ambig = 0, count = 0;
  const mapColToEff = [];
  for (let i = 0; i < baseSeq.length; i++) {
    if (i < tStart || i >= tEnd || del.has(i)) continue;
    const ch = (edits[i] !== undefined ? edits[i] : baseSeq[i]).toUpperCase();
    if (!ch || ch === "-" || ch === " ") continue;
    seq += ch; mapColToEff.push(i);
    const q = baseQ[i] || 0; qSum += q;
    if (q >= 20) q20++; if (q >= 30) q30++;
    if (ch === "G" || ch === "C") gc++;
    if (!"ACGT".includes(ch)) ambig++;
    count++;
  }
  return {
    seq, mapColToEff, length: count,
    gcPct: count ? (gc / count) * 100 : 0, ambig,
    meanQ: count ? qSum / count : 0,
    q20Pct: count ? (q20 / count) * 100 : 0,
    q30Pct: count ? (q30 / count) * 100 : 0
  };
}

function getConsensusSequenceText(item, untrimmed = false) {
  const isGrp = item.alignment !== undefined;
  const baseSeq = isGrp ? (item.baseConsensus || "") : item.seq;
  const edits = item.edits || {}, del = item.deleted || new Set();
  const tStart = untrimmed ? 0 : (item.trimStart || 0);
  const tEnd = untrimmed ? baseSeq.length : (item.trimEnd !== undefined ? item.trimEnd : baseSeq.length);

  let seq = "";
  for (let i = tStart; i < tEnd; i++) {
    if (del.has(i)) continue;
    const ch = (edits[i] !== undefined ? edits[i] : baseSeq[i]).toUpperCase();
    if (ch && ch !== "-" && ch !== " ") seq += ch;
  }
  return seq;
}

function copyDrawerConsensus(asFasta = false) {
  const item = getActiveItem();
  if (!item) return;
  const untrimmed = state.viewer.showUntrimmedConsensus;
  const seq = getConsensusSequenceText(item, untrimmed);
  const out = asFasta ? `>${item.name}${untrimmed ? "_untrimmed" : "_trimmed"}\n${seq}` : seq;
  navigator.clipboard.writeText(out).then(() => toast(`Copied ${seq.length} bp (${untrimmed ? "untrimmed" : "trimmed"}${asFasta ? " FASTA" : ""})`, "success"));
}

/* ==========================================================================
   7. PRIMER / VECTOR CLIPPING & SMART AUTO-GROUPING
   ========================================================================== */
function iupacToRegex(seq) { return new RegExp(seq.toUpperCase().split("").map(c => IUPAC_REGEX_MAP[c] || c).join(""), "i"); }

function clipPrimersCurrent() {
  const item = getActiveItem();
  if (!item) return;
  const ctxData = getViewerContextData();
  const primers = (state.settings.clipPrimerSeqs || []).filter(p => p.length >= 8);
  if (!primers.length) { toast("No primer sequences configured in Settings.", "warn"); return; }

  const baseSeq = ctxData.baseSeq;
  let tStart = item.trimStart || 0, tEnd = item.trimEnd !== undefined ? item.trimEnd : baseSeq.length, clipped = 0;
  const headSlice = baseSeq.slice(tStart, Math.min(tEnd, tStart + 80));
  const tailOffset = Math.max(tStart, tEnd - 80), tailSlice = baseSeq.slice(tailOffset, tEnd);

  for (const p of primers) {
    for (const v of [p, revComp(p)]) {
      const re = iupacToRegex(v);
      const mHead = re.exec(headSlice);
      if (mHead) { tStart = Math.max(tStart, (item.trimStart || 0) + mHead.index + mHead[0].length); clipped++; }
      const mTail = re.exec(tailSlice);
      if (mTail) { tEnd = Math.min(tEnd, tailOffset + mTail.index); clipped++; }
    }
  }
  if (!clipped) { toast("No matching 5'/3' primer or vector sequences found.", "warn"); return; }
  pushUndo(item);
  item.trimStart = tStart; item.trimEnd = Math.max(tStart, tEnd);
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
  toast(`Clipped ${clipped} primer/vector hit(s) → ${tStart + 1}–${tEnd}`, "success");
}

function getAllPrimers() { return { F: [...state.settings.customF, ...BUILTIN_PRIMERS.F], R: [...state.settings.customR, ...BUILTIN_PRIMERS.R] }; }
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function detectPrimerAndDirection(fileName) {
  const base = fileName.replace(/\.ab1$/i, ""), all = getAllPrimers();
  const candidates = [...all.F.map(p => ({ p, dir: "F" })), ...all.R.map(p => ({ p, dir: "R" }))].sort((a, b) => b.p.length - a.p.length);
  for (const c of candidates) {
    const tok = c.p;
    const re = (tok.startsWith("_") || tok.startsWith("-"))
      ? new RegExp(escapeRegExp(tok) + "(?:[_\\-\\.]|$)", "i")
      : new RegExp("(?:^|[_\\-\\.\\s])" + escapeRegExp(tok) + "(?:[_\\-\\.\\s]|$)", "i");
    if (re.test(base)) return { dir: c.dir, primer: tok };
  }
  return { dir: null, primer: "" };
}

function cleanSampleCore(fileName) {
  let s = fileName.replace(/\.ab1$/i, "").replace(/[_.\-][A-H]\d{2}$/i, "");
  const all = [...state.settings.customF, ...state.settings.customR, ...BUILTIN_PRIMERS.F, ...BUILTIN_PRIMERS.R].sort((a, b) => b.length - a.length);
  for (const p of all) if (p.length >= 2) s = s.replace(new RegExp("(^|[_\\-\\.])" + escapeRegExp(p) + "(?=[_\\-\\.]|$)", "gi"), "$1");
  return s.replace(/[_.\-]{2,}/g, "_").replace(/^[_.\-]+|[_.\-]+$/g, "");
}

function longestCommonPrefix(a, b) {
  let i = 0, len = Math.min(a.length, b.length);
  while (i < len && a[i].toLowerCase() === b[i].toLowerCase()) i++;
  return a.slice(0, i).replace(/[_\-.\s]+$/, "");
}

function bigrams(s) { const set = new Set(), t = s.toLowerCase(); for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2)); return set; }
function diceSets(a, b) { if (!a.size || !b.size) return 0; let inter = 0; for (const x of a) if (b.has(x)) inter++; return (2 * inter) / (a.size + b.size); }

function lcsLen(a, b) {
  const m = Math.min(a.length, 60), n = Math.min(b.length, 60), dp = new Int16Array(n + 1);
  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) { const tmp = dp[j]; dp[j] = a[i-1].toLowerCase() === b[j-1].toLowerCase() ? prev + 1 : Math.max(dp[j], dp[j-1]); prev = tmp; }
  }
  return dp[n];
}

function computePairSimilarity(s1, s2) {
  const c1 = cleanSampleCore(s1.fileName), c2 = cleanSampleCore(s2.fileName);
  if (c1.toLowerCase() === c2.toLowerCase() && c1.length > 0) return 1.0;
  const lcp = longestCommonPrefix(c1, c2).length / Math.max(1, Math.min(c1.length, c2.length));
  const tokDice = diceSets(new Set(c1.toLowerCase().split(/[_\-.\s]+/).filter(Boolean)), new Set(c2.toLowerCase().split(/[_\-.\s]+/).filter(Boolean)));
  const bgDice = diceSets(bigrams(c1), bigrams(c2));
  const lcsScore = (2 * lcsLen(c1, c2)) / Math.max(1, c1.length + c2.length);
  return Math.max(0, Math.min(1, 0.35 * lcp + 0.25 * tokDice + 0.20 * lcsScore + 0.20 * bgDice + (s1.direction !== s2.direction ? 0.12 : -0.15)));
}

function suggestGroupName(s1, s2) {
  const c1 = cleanSampleCore(s1.fileName), c2 = cleanSampleCore(s2.fileName);
  const lcpRaw = longestCommonPrefix(s1.name, s2.name), lcpClean = longestCommonPrefix(c1, c2);
  return (lcpClean.length >= 4 ? lcpClean : (lcpRaw.length >= 4 ? lcpRaw : c1 || s1.name)).replace(/[_\-.\s]+$/, "");
}

function autoGroupSamples() {
  const ungrouped = state.order.filter(o => o.type === "sample").map(o => state.samples[o.id]).filter(Boolean);
  for (const s of ungrouped) { const det = detectPrimerAndDirection(s.fileName); if (det.dir) { s.direction = det.dir; s.detectedPrimer = det.primer; } }
  const pairs = [];
  for (let i = 0; i < ungrouped.length; i++) {
    for (let j = i + 1; j < ungrouped.length; j++) {
      const a = ungrouped[i], b = ungrouped[j];
      if (a.direction === b.direction) continue;
      const score = computePairSimilarity(a, b);
      if (score >= state.settings.simThreshold) pairs.push({ a, b, score });
    }
  }
  pairs.sort((x, y) => y.score - x.score);
  const used = new Set(); let created = 0;
  for (const p of pairs) {
    if (used.has(p.a.id) || used.has(p.b.id)) continue;
    used.add(p.a.id); used.add(p.b.id);
    const fwd = p.a.direction === "F" ? p.a : p.b, rev = p.a.direction === "R" ? p.a : p.b;
    createGroup(fwd, rev, suggestGroupName(fwd, rev)); created++;
  }
  renderTable(); persistDB();
  toast(created ? `Auto-grouped ${created} F/R pair(s)` : "No new F/R pairs matched current threshold", created ? "success" : "warn");
}

function createGroup(fwd, rev, name) {
  const gid = uid("grp");
  const grp = {
    id: gid, name: name || suggestGroupName(fwd, rev), fwdId: fwd.id, revId: rev.id,
    collapsed: false, use: true, notes: emptyNotes(), refFasta: "", snpResults: null,
    edits: {}, deleted: new Set(), undoStack: [], redoStack: []
  };
  buildGroupAlignmentAndConsensus(grp);
  state.groups[gid] = grp;
  const idx = state.order.findIndex(o => o.type === "sample" && (o.id === fwd.id || o.id === rev.id));
  state.order = state.order.filter(o => !(o.type === "sample" && (o.id === fwd.id || o.id === rev.id)));
  state.order.splice(idx >= 0 ? idx : state.order.length, 0, { type: "group", id: gid });
  return grp;
}

/* ==========================================================================
   8. CONTINUOUS CATMULL-ROM SPLINE RENDERER
   ========================================================================== */
function getThemeColors(forceWhite = false) {
  const light = forceWhite || document.documentElement.getAttribute("data-theme") === "light";
  return {
    bg: light ? "#ffffff" : "#080d1a", grid: light ? "#e2e8f0" : "#1e293b",
    text: light ? "#0f172a" : "#f1f5f9", muted: light ? "#64748b" : "#94a3b8",
    A: light ? "#16a34a" : "#22c55e", T: light ? "#dc2626" : "#ef4444",
    G: light ? "#1e293b" : "#e2e8f0", C: light ? "#2563eb" : "#3b82f6"
  };
}

function buildContinuousTracePoints(traceArr, ploc, normHeight, colMap, colWidth, baselineY, trackHeight, ampScale, xStart, xEnd) {
  const nBases = ploc.length;
  if (nBases === 0 || traceArr.length === 0) return [];
  const baseX = new Float32Array(nBases);
  for (let i = 0; i < nBases; i++) baseX[i] = (colMap[i] + 0.5) * colWidth;

  let bStart = 0, bEnd = nBases - 1;
  while (bStart < nBases - 1 && baseX[bStart + 1] < xStart - colWidth * 2) bStart++;
  while (bEnd > bStart && baseX[bEnd - 1] > xEnd + colWidth * 2) bEnd--;

  const sStart = Math.max(0, ploc[bStart] - 12), sEnd = Math.min(traceArr.length - 1, ploc[bEnd] + 12);
  const pts = [], maxVal = normHeight / Math.max(0.2, ampScale);
  let curBase = bStart;

  for (let s = sStart; s <= sEnd; s++) {
    while (curBase < nBases - 1 && s > ploc[curBase + 1]) curBase++;
    let x;
    if (s <= ploc[0]) { const sp = nBases > 1 ? Math.max(1, ploc[1] - ploc[0]) : 12; x = baseX[0] - ((ploc[0] - s) / sp) * colWidth; }
    else if (s >= ploc[nBases - 1]) { const sp = nBases > 1 ? Math.max(1, ploc[nBases - 1] - ploc[nBases - 2]) : 12; x = baseX[nBases - 1] + ((s - ploc[nBases - 1]) / sp) * colWidth; }
    else {
      const p0 = ploc[curBase], p1 = ploc[curBase + 1], t = (s - p0) / Math.max(1, p1 - p0);
      const x0 = baseX[curBase], x1 = baseX[curBase + 1], gapSpan = x1 - x0;
      if (gapSpan > colWidth * 1.35) {
        const shoulder = colWidth * 0.45;
        if (t <= 0.35) x = x0 + (t / 0.35) * shoulder;
        else if (t >= 0.65) x = x1 - ((1 - t) / 0.35) * shoulder;
        else x = (x0 + shoulder) + ((t - 0.35) / 0.30) * (gapSpan - 2 * shoulder);
      } else x = x0 + t * gapSpan;
    }
    pts.push({ x, y: baselineY - Math.min(1.12, Math.max(0, traceArr[s]) / maxVal) * trackHeight });
  }

  if (pts.length > (xEnd - xStart) * 2.2 && xEnd > xStart) {
    const ds = []; let i = 0;
    while (i < pts.length) {
      const bx = pts[i].x; let minPt = pts[i], maxPt = pts[i], j = i + 1;
      while (j < pts.length && pts[j].x - bx < 1.5) { if (pts[j].y < minPt.y) minPt = pts[j]; if (pts[j].y > maxPt.y) maxPt = pts[j]; j++; }
      if (minPt === maxPt) ds.push(minPt); else if (minPt.x < maxPt.x) ds.push(minPt, maxPt); else ds.push(maxPt, minPt);
      i = j;
    }
    return ds;
  }
  return pts;
}

function drawContinuousStrandTrace(ctx, pts, color, baselineY, lineWidth = 1.6, alpha = 1.0) {
  if (!pts || pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  const tension = 0.5;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i > 0 ? i - 1 : i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    let cp1x = p1.x + ((p2.x - p0.x) / 6) * tension, cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    let cp2x = p2.x - ((p3.x - p1.x) / 6) * tension, cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    const minY = Math.min(p1.y, p2.y) - 6;
    cp1y = Math.max(minY, Math.min(baselineY, cp1y)); cp2y = Math.max(minY, Math.min(baselineY, cp2y));
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.stroke(); ctx.restore();
}

function getActiveItem() {
  if (!state.activeItemId) return null;
  return state.activeItemType === "group" ? state.groups[state.activeItemId] : state.samples[state.activeItemId];
}

function getViewerContextData() {
  const item = getActiveItem();
  if (!item) return null;
  const isGrp = state.activeItemType === "group";
  let fwd = null, rev = null, revRC = null, cols = [], baseSeq = "", baseQ = [];

  if (isGrp) {
    fwd = item.fwdId ? state.samples[item.fwdId] : null;
    rev = item.revId ? state.samples[item.revId] : null;
    if (rev) revRC = getReverseComplementSample(rev);
    if (!item.alignment) buildGroupAlignmentAndConsensus(item);
    cols = item.alignment.cols; baseSeq = item.baseConsensus || ""; baseQ = item.baseConsensusQ || [];
  } else {
    if (item.direction === "R") {
      rev = item; revRC = getReverseComplementSample(item);
      for (let i = 0; i < revRC.seq.length; i++) cols.push({ fIdx: -1, rIdx: i });
      baseSeq = revRC.seq; baseQ = revRC.pcon;
    } else {
      fwd = item;
      for (let i = 0; i < fwd.seq.length; i++) cols.push({ fIdx: i, rIdx: -1 });
      baseSeq = fwd.seq; baseQ = fwd.pcon;
    }
  }
  return { item, isGrp, fwd, rev, revRC, cols, baseSeq, baseQ };
}

function renderViewer() {
  const ctxData = getViewerContextData();
  const emptyEl = document.getElementById("emptyViewer"), activeEl = document.getElementById("activeViewer");
  if (!ctxData) { emptyEl.style.display = "flex"; activeEl.style.display = "none"; return; }
  emptyEl.style.display = "none"; activeEl.style.display = "flex";

  const { item, isGrp, fwd, rev } = ctxData;
  document.getElementById("viewerTitle").textContent = item.name;
  document.querySelectorAll("#viewModeButtons button").forEach(b => b.classList.toggle("active", parseInt(b.dataset.mode) === state.viewer.mode));
  document.getElementById("activeRowBadge").textContent = "Row: " + ["Consensus", "Forward", "Reverse"][state.viewer.activeRow];

  const banner = document.getElementById("mismatchBanner");
  if (isGrp && fwd && rev && item.alignment && item.alignment.isMismatch) {
    banner.classList.add("show");
    document.getElementById("mismatchText").textContent = `Overlap: ${item.alignment.overlapLen} bp, Identity: ${item.alignment.identity.toFixed(1)}% (threshold: >=20 bp & >=60%).`;
  } else banner.classList.remove("show");

  const stats = getEffectiveConsensus(item);
  document.getElementById("statLen").textContent = stats.length + " bp";
  document.getElementById("statGC").textContent = stats.gcPct.toFixed(1) + "%";
  document.getElementById("statAmbig").textContent = stats.ambig;
  document.getElementById("statMeanQ").textContent = stats.meanQ.toFixed(1);
  document.getElementById("statQ2030").textContent = `${stats.q20Pct.toFixed(0)}% / ${stats.q30Pct.toFixed(0)}%`;
  const ovWrap = document.getElementById("statOverlapWrap");
  if (isGrp && fwd && rev && item.alignment) {
    ovWrap.style.display = "";
    document.getElementById("statOverlap").textContent = `${item.alignment.overlapLen} bp (${item.alignment.identity.toFixed(1)}%)`;
  } else ovWrap.style.display = "none";

  updateSelectionBar(); renderMainCanvas(); renderMinimap(); renderProDrawer();
}

function renderMainCanvas(customOpts = null) {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const { item, fwd, revRC, cols, baseSeq } = ctxData;
  const mode = state.viewer.mode, colW = customOpts ? customOpts.colWidth : state.viewer.colWidth, amp = state.viewer.ampScale;
  const colors = getThemeColors(customOpts && customOpts.whiteBg);
  const viewport = document.getElementById("canvasViewport"), canvas = customOpts ? customOpts.canvas : document.getElementById("traceCanvas");
  const dpr = customOpts ? customOpts.dpr : (window.devicePixelRatio || 1);

  const totalCols = mode === 3 ? Math.max(fwd ? fwd.seq.length : 0, revRC ? revRC.seq.length : 0) : cols.length;
  const startCol = customOpts ? customOpts.startCol : 0, endCol = customOpts ? customOpts.endCol : totalCols;
  const dispCols = Math.max(1, endCol - startCol);
  const totalW = Math.max(customOpts ? dispCols * colW : viewport.clientWidth, dispCols * colW + 40);
  const viewH = customOpts ? customOpts.height : Math.max(320, viewport.clientHeight);

  canvas.width = Math.round(totalW * dpr); canvas.height = Math.round(viewH * dpr);
  canvas.style.width = totalW + "px"; canvas.style.height = viewH + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr); ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, totalW, viewH);

  const scrollL = customOpts ? 0 : viewport.scrollLeft, visW = customOpts ? totalW : viewport.clientWidth;
  const xStart = scrollL - 60, xEnd = scrollL + visW + 60;

  let headerOffset = customOpts && customOpts.title ? 28 : 0;
  if (customOpts && customOpts.title) { ctx.fillStyle = colors.text; ctx.font = "bold 14px sans-serif"; ctx.fillText(customOpts.title, 12, 19); }

  const rulerY = headerOffset + 18, consY = headerOffset + 42, fwdSeqY = headerOffset + 62, revSeqY = headerOffset + 80, traceTop = headerOffset + 96;
  const availH = Math.max(140, viewH - traceTop - 16);

  const selRange = getSelectionRange();
  if (!customOpts && selRange) { ctx.fillStyle = "rgba(59,130,246,0.22)"; ctx.fillRect((selRange.start - startCol) * colW, headerOffset, (selRange.end - selRange.start + 1) * colW, viewH - headerOffset); }
  if (!customOpts) { const rowY = state.viewer.activeRow === 0 ? consY - 14 : (state.viewer.activeRow === 1 ? fwdSeqY - 13 : revSeqY - 13); ctx.fillStyle = "rgba(59,130,246,0.08)"; ctx.fillRect(scrollL, rowY, visW, 18); }
  if (!customOpts && state.viewer.cursor >= startCol && state.viewer.cursor < endCol) {
    const cx = (state.viewer.cursor - startCol) * colW;
    ctx.fillStyle = "rgba(245,158,11,0.24)"; ctx.fillRect(cx, headerOffset, colW, viewH - headerOffset);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, headerOffset + 0.5, colW - 1, viewH - headerOffset - 1);
  }
  if (!customOpts && state.viewer.findMatches.length) {
    for (let k = 0; k < state.viewer.findMatches.length; k++) {
      const m = state.viewer.findMatches[k];
      ctx.fillStyle = k === state.viewer.findIdx ? "rgba(234,179,8,0.45)" : "rgba(234,179,8,0.2)";
      ctx.fillRect((m.start - startCol) * colW, consY - 14, m.len * colW, 18);
    }
  }

  const visColStart = Math.max(startCol, Math.floor(scrollL / colW) + startCol - 2);
  const visColEnd = Math.min(endCol - 1, Math.ceil((scrollL + visW) / colW) + startCol + 2);
  const tStart = item.trimStart || 0, tEnd = item.trimEnd !== undefined ? item.trimEnd : baseSeq.length;
  const delSet = item.deleted || new Set(), edits = item.edits || {};

  ctx.textAlign = "center";
  for (let c = visColStart; c <= visColEnd; c++) {
    const x = (c - startCol) * colW + colW * 0.5;
    if (c < tStart || c >= tEnd) { ctx.fillStyle = "rgba(100,116,139,0.16)"; ctx.fillRect((c - startCol) * colW, headerOffset, colW, viewH - headerOffset); }
    if ((c + 1) % 10 === 0 || c === 0) {
      ctx.fillStyle = colors.muted; ctx.font = "10px monospace"; ctx.fillText(String(c + 1), x, rulerY);
      ctx.strokeStyle = colors.grid; ctx.beginPath(); ctx.moveTo(x, rulerY + 3); ctx.lineTo(x, traceTop); ctx.stroke();
    }

    if (c < baseSeq.length) {
      const isDel = delSet.has(c), ch = (edits[c] !== undefined ? edits[c] : baseSeq[c]).toUpperCase();
      if (!isDel && ch === "N") { ctx.fillStyle = "#ef4444"; ctx.fillRect((c - startCol) * colW + 1, consY - 12, Math.max(2, colW - 2), 15); }
      if (colW >= 9) {
        ctx.font = edits[c] !== undefined ? "bold 13px monospace" : "bold 12px monospace";
        ctx.fillStyle = isDel ? colors.muted : (ch === "N" ? "#ffffff" : (colors[ch] || "#f59e0b"));
        ctx.globalAlpha = isDel ? 0.45 : 1; ctx.fillText(ch, x, consY); ctx.globalAlpha = 1;
        if (isDel) { ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - colW * 0.35, consY - 4); ctx.lineTo(x + colW * 0.35, consY - 4); ctx.stroke(); }
      }
    }

    {
      let fb = "", rb = "", fq = -1, rq = -1;
      if (mode === 3) {
        if (fwd && c < fwd.seq.length) { fb = fwd.seq[c]; fq = fwd.pcon[c] || 0; }
        if (revRC && c < revRC.seq.length) { rb = revRC.seq[c]; rq = revRC.pcon[c] || 0; }
      } else if (c < cols.length) {
        if (fwd) { if (cols[c].fIdx >= 0) { fb = fwd.seq[cols[c].fIdx]; fq = fwd.pcon[cols[c].fIdx] || 0; } else fb = "-"; }
        if (revRC) { if (cols[c].rIdx >= 0) { rb = revRC.seq[cols[c].rIdx]; rq = revRC.pcon[cols[c].rIdx] || 0; } else rb = "-"; }
      }
      if (fq >= 0) { const qH = Math.min(13, (fq / 50) * 13); ctx.fillStyle = fq >= 30 ? "#22c55e44" : (fq >= 20 ? "#eab30855" : "#ef444466"); ctx.fillRect((c - startCol) * colW + 2, fwdSeqY - 11 + (13 - qH), Math.max(2, colW - 4), qH); }
      if (rq >= 0) { const qH = Math.min(13, (rq / 50) * 13); ctx.fillStyle = rq >= 30 ? "#22c55e44" : (rq >= 20 ? "#eab30855" : "#ef444466"); ctx.fillRect((c - startCol) * colW + 2, revSeqY - 11 + (13 - qH), Math.max(2, colW - 4), qH); }
      if (colW >= 9) { ctx.font = "11px monospace"; if (fb) { ctx.fillStyle = colors[fb] || colors.muted; ctx.fillText(fb, x, fwdSeqY); } if (rb) { ctx.fillStyle = colors[rb] || colors.muted; ctx.fillText(rb, x, revSeqY); } }
    }
  }
  ctx.textAlign = "left";

  if (isPro()) {
    if (state.viewer.reResults.length) {
      ctx.font = "bold 9px sans-serif";
      for (const hit of state.viewer.reResults) {
        const hx = (hit.col - startCol) * colW;
        if (hx < xStart || hx > xEnd) continue;
        ctx.fillStyle = "rgba(168,85,247,0.25)"; ctx.fillRect(hx, rulerY - 10, hit.len * colW, 12);
        ctx.fillStyle = "#c084fc"; ctx.fillText(hit.name, hx + 2, rulerY - 1);
      }
    }
    if (state.viewer.hetResults.length) {
      for (const h of state.viewer.hetResults) {
        const hx = (h.col - startCol) * colW + colW * 0.5;
        if (hx < xStart || hx > xEnd) continue;
        ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(hx, traceTop - 5, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (state.viewer.crisprSplit !== null) {
      const sx = (state.viewer.crisprSplit - startCol) * colW;
      if (sx >= xStart && sx <= xEnd) { ctx.save(); ctx.strokeStyle = "#ec4899"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx, traceTop); ctx.lineTo(sx, viewH); ctx.stroke(); ctx.restore(); }
    }
  }

  const fwdColMap = fwd ? new Int32Array(fwd.seq.length) : null, revColMap = revRC ? new Int32Array(revRC.seq.length) : null;
  if (mode === 3) {
    if (fwdColMap) for (let i = 0; i < fwdColMap.length; i++) fwdColMap[i] = i - startCol;
    if (revColMap) for (let i = 0; i < revColMap.length; i++) revColMap[i] = i - startCol;
  } else {
    for (let c = 0; c < cols.length; c++) {
      if (fwdColMap && cols[c].fIdx >= 0) fwdColMap[cols[c].fIdx] = c - startCol;
      if (revColMap && cols[c].rIdx >= 0) revColMap[cols[c].rIdx] = c - startCol;
    }
  }

  const drawStrand = (strand, colMap, baseY, trH, label, alpha = 1.0, lw = 1.6) => {
    if (!strand || !colMap) return;
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.max(0, xStart), baseY); ctx.lineTo(xEnd, baseY); ctx.stroke();
    if (label) { ctx.fillStyle = colors.muted; ctx.font = "bold 10px sans-serif"; ctx.fillText(label, Math.max(8, scrollL + 8), baseY - trH + 12); }
    for (const base of ["A", "T", "G", "C"]) {
      const pts = buildContinuousTracePoints(strand.traces[base], strand.ploc, strand.normHeight, colMap, colW, baseY, trH - 12, amp, xStart, xEnd);
      drawContinuousStrandTrace(ctx, pts, colors[base], baseY, lw, alpha);
    }
  };

  if (mode === 1 || mode === 3) {
    if (fwd && revRC) {
      const half = Math.floor(availH / 2) - 6;
      drawStrand(fwd, fwdColMap, traceTop + half, half, mode === 3 ? "Forward (Independent)" : "Forward (5'->3')");
      drawStrand(revRC, revColMap, traceTop + half * 2 + 12, half, mode === 3 ? "Reverse-Comp (Independent)" : "Reverse-Comp (5'->3')");
    } else if (fwd) drawStrand(fwd, fwdColMap, traceTop + availH, availH, "Forward (5'->3')");
    else if (revRC) drawStrand(revRC, revColMap, traceTop + availH, availH, "Reverse-Comp (5'->3')");
  } else if (mode === 2) {
    const baseY = traceTop + availH;
    if (fwd) drawStrand(fwd, fwdColMap, baseY, availH, "Overlay: Fwd (solid) + RevComp (translucent)", 0.95, 1.7);
    if (revRC) drawStrand(revRC, revColMap, baseY, availH, fwd ? "" : "Reverse-Comp", 0.52, 1.3);
  } else if (mode === 4) drawStrand(fwd, fwdColMap, traceTop + availH, availH, "Forward Only (5'->3')");
  else if (mode === 5) drawStrand(revRC, revColMap, traceTop + availH, availH, "Reverse-Comp Only (5'->3')");
}

function renderMinimap() {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const { fwd, revRC, cols } = ctxData;
  const wrap = document.getElementById("minimapWrap"), canvas = document.getElementById("minimapCanvas");
  const dpr = window.devicePixelRatio || 1, w = wrap.clientWidth, h = wrap.clientHeight;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  const colors = getThemeColors(); ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, w, h);

  const totalCols = Math.max(1, cols.length), miniColW = w / totalCols, strand = fwd || revRC;
  if (strand) {
    const colMap = new Int32Array(strand.seq.length);
    for (let i = 0; i < strand.seq.length; i++) colMap[i] = i;
    for (const base of ["A", "T", "G", "C"]) {
      const pts = buildContinuousTracePoints(strand.traces[base], strand.ploc, strand.normHeight, colMap, miniColW, h - 4, h - 10, 1.0, 0, w);
      drawContinuousStrandTrace(ctx, pts, colors[base], h - 4, 1.0, 0.8);
    }
  }
  const vp = document.getElementById("canvasViewport"), mainW = Math.max(1, totalCols * state.viewer.colWidth);
  const rx = (vp.scrollLeft / mainW) * w, rw = Math.max(14, (vp.clientWidth / mainW) * w);
  ctx.fillStyle = "rgba(59,130,246,0.22)"; ctx.fillRect(rx, 0, rw, h);
  ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1.5; ctx.strokeRect(rx + 0.5, 0.5, rw - 1, h - 1);
}

/* ==========================================================================
   9. PROJECT TABLE & CONTEXT MENU
   ========================================================================== */
function renderTable() {
  const tbody = document.getElementById("sampleTableBody");
  const filter = (document.getElementById("tableFilter").value || "").toLowerCase();
  tbody.innerHTML = "";

  const items = [...state.order];
  if (state.sort.col) {
    items.sort((a, b) => {
      const objA = a.type === "group" ? state.groups[a.id] : state.samples[a.id];
      const objB = b.type === "group" ? state.groups[b.id] : state.samples[b.id];
      if (!objA || !objB) return 0;
      let va = "", vb = "";
      if (state.sort.col === "name") { va = objA.name.toLowerCase(); vb = objB.name.toLowerCase(); }
      else if (state.sort.col === "notes") { va = (objA.notes?.taxon || objA.notes?.text || "").toLowerCase(); vb = (objB.notes?.taxon || objB.notes?.text || "").toLowerCase(); }
      else if (state.sort.col === "status") { va = objA.savedConsensus ? "1" : "0"; vb = objB.savedConsensus ? "1" : "0"; }
      else if (state.sort.col === "use") { va = objA.use ? "1" : "0"; vb = objB.use ? "1" : "0"; }
      return state.sort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  for (const entry of items) {
    if (entry.type === "group") {
      const g = state.groups[entry.id];
      if (!g) continue;
      if (filter && !`${g.name} ${g.notes?.taxon || ""} ${g.notes?.accession || ""} ${g.notes?.text || ""}`.toLowerCase().includes(filter)) continue;
      const stats = getEffectiveConsensus(g), isMismatch = g.alignment && g.alignment.isMismatch;
      const tr = document.createElement("tr");
      tr.className = "row-group" + (state.selectedIds.has(g.id) ? " selected" : "") + (state.activeItemId === g.id ? " active-viewing" : "");
      tr.innerHTML = `
        <td><input type="checkbox" ${g.use ? "checked" : ""} onclick="event.stopPropagation(); toggleUse('group','${g.id}')" /></td>
        <td title="${escapeHtml(g.name)}"><span onclick="event.stopPropagation(); toggleGroupCollapse('${g.id}')" style="cursor:pointer;margin-right:4px;">${g.collapsed ? "▸" : "▾"}</span>${escapeHtml(g.name)}</td>
        <td><span class="dir-badge dir-P" title="Paired F+R">F+R</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;">${stats.length} / Q${stats.meanQ.toFixed(0)}</td>
        <td><span class="status-pill ${isMismatch ? "status-err" : (g.savedConsensus ? "status-ok" : "status-idle")}">${isMismatch ? "Mismatch" : (g.savedConsensus ? "Saved" : "Ready")}</span></td>
        <td class="notes-cell" ondblclick="event.stopPropagation(); openNotesModal('${g.id}')">${formatNotesBadge(g.notes)}</td>
      `;
      attachRowEvents(tr, "group", g.id); tbody.appendChild(tr);
      if (!g.collapsed) for (const sid of [g.fwdId, g.revId]) if (state.samples[sid]) tbody.appendChild(createSampleRow(state.samples[sid], true, g.id));
    } else {
      const s = state.samples[entry.id];
      if (!s) continue;
      if (filter && !`${s.name} ${s.notes?.taxon || ""} ${s.notes?.text || ""}`.toLowerCase().includes(filter)) continue;
      tbody.appendChild(createSampleRow(s, false, null));
    }
  }
}

function createSampleRow(s, isChild, parentGroupId) {
  const stats = getEffectiveConsensus(s), tr = document.createElement("tr");
  tr.className = (state.selectedIds.has(s.id) ? " selected" : "") + (state.activeItemId === s.id ? " active-viewing" : "");
  tr.innerHTML = `
    <td>${isChild ? "" : `<input type="checkbox" ${s.use ? "checked" : ""} onclick="event.stopPropagation(); toggleUse('sample','${s.id}')" />`}</td>
    <td style="${isChild ? "padding-left:20px;color:var(--text-muted);" : ""}" title="${escapeHtml(s.fileName)}">${escapeHtml(s.name)}</td>
    <td><span class="dir-badge dir-${s.direction}" onclick="event.stopPropagation(); swapDirection('${s.id}')" title="Click to swap F/R">${s.direction}</span></td>
    <td style="font-family:var(--font-mono);font-size:11px;">${stats.length} / Q${stats.meanQ.toFixed(0)}</td>
    <td><span class="status-pill ${s.savedConsensus ? "status-ok" : "status-idle"}">${isChild ? "Member" : (s.savedConsensus ? "Saved" : "Single")}</span></td>
    <td class="notes-cell" ondblclick="event.stopPropagation(); openNotesModal('${parentGroupId || s.id}')">${isChild ? (s.detectedPrimer ? `<span class="kbd">${escapeHtml(s.detectedPrimer)}</span>` : "") : formatNotesBadge(s.notes)}</td>
  `;
  attachRowEvents(tr, "sample", s.id, parentGroupId); return tr;
}

function formatNotesBadge(n) {
  if (!n) return '<span style="opacity:0.45;">Double-click...</span>';
  if (n.taxon) return `<span class="notes-taxon">${escapeHtml(n.taxon)}</span>${n.identity ? `<span class="notes-pct">${escapeHtml(n.identity)}</span>` : ""}`;
  if (n.text) return escapeHtml(n.text);
  return '<span style="opacity:0.45;">Double-click...</span>';
}

function attachRowEvents(tr, type, id, parentGroupId = null) {
  tr.addEventListener("click", e => {
    if (e.ctrlKey || e.metaKey) { if (state.selectedIds.has(id)) state.selectedIds.delete(id); else state.selectedIds.add(id); }
    else { state.selectedIds.clear(); state.selectedIds.add(id); }
    renderTable();
  });
  tr.addEventListener("dblclick", () => openInViewer(parentGroupId ? "group" : type, parentGroupId || id));
  tr.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (!state.selectedIds.has(id)) { state.selectedIds.clear(); state.selectedIds.add(id); renderTable(); }
    showContextMenu(e.clientX, e.clientY, type, id);
  });
}

function showContextMenu(x, y, type, id) {
  const menu = document.getElementById("contextMenu"), isGrp = type === "group";
  menu.innerHTML = `
    <div class="ctx-item" onclick="openInViewer('${type}','${id}'); hideCtx();">Open in Trace Viewer <span class="kbd">Enter</span></div>
    <div class="ctx-item" onclick="openNotesModal('${id}'); hideCtx();">Edit Notes &amp; GenBank <span class="kbd">Ctrl+E</span></div>
    <div class="ctx-item" onclick="generateConsensusSelected(); hideCtx();">Generate Consensus <span class="kbd">F5</span></div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="groupSelected(); hideCtx();">Group 2 Selected <span class="kbd">Ctrl+G</span></div>
    ${isGrp ? `<div class="ctx-item" onclick="ungroupSelected(); hideCtx();">Ungroup Pair <span class="kbd">Ctrl+Shift+G</span></div>` : ""}
    ${isGrp ? `<div class="ctx-item" onclick="renameGroup('${id}'); hideCtx();">Rename Group <span class="kbd">F2</span></div>` : ""}
    <div class="ctx-item" onclick="swapSelectedDirection(); hideCtx();">Swap F/R Direction <span class="kbd">Ctrl+R</span></div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="clearSavedConsensusSelected(); hideCtx();">Clear Saved Consensus <span class="kbd">Ctrl+Del</span></div>
    <div class="ctx-item danger" onclick="deleteSelectedTableItems(); hideCtx();">Remove from Project <span class="kbd">Del</span></div>
  `;
  menu.style.left = Math.min(x, window.innerWidth - 225) + "px";
  menu.style.top = Math.min(y, window.innerHeight - 280) + "px";
  menu.classList.add("show");
}
function hideCtx() { document.getElementById("contextMenu").classList.remove("show"); }
document.addEventListener("click", hideCtx);

function openInViewer(type, id) {
  state.activeItemType = type; state.activeItemId = id;
  state.viewer.cursor = 0; state.viewer.selStart = null; state.viewer.selEnd = null;
  state.viewer.activeRow = 0; state.viewer.findMatches = []; state.viewer.findIdx = -1;
  const item = getActiveItem();
  if (type === "group" && item) {
    if (!item.alignment) buildGroupAlignmentAndConsensus(item);
    state.viewer.mode = (item.alignment && item.alignment.isMismatch) ? 3 : 1;
  } else state.viewer.mode = item && item.direction === "R" ? 5 : 4;
  runProAnalysesSilent(); renderTable(); renderViewer();
  document.getElementById("canvasViewport").scrollLeft = 0;
}

/* ==========================================================================
   10. TABLE ACTIONS & MULTI-BASE EDITING
   ========================================================================== */
function toggleUse(type, id) { const obj = type === "group" ? state.groups[id] : state.samples[id]; if (obj) { obj.use = !obj.use; persistDB(); } }
function toggleGroupCollapse(gid) { const g = state.groups[gid]; if (g) { g.collapsed = !g.collapsed; renderTable(); persistDB(); } }
function toggleAllGroups(expand) { for (const g of Object.values(state.groups)) g.collapsed = !expand; renderTable(); }

function swapDirection(sid) {
  const s = state.samples[sid]; if (!s) return;
  s.direction = s.direction === "F" ? "R" : "F";
  for (const g of Object.values(state.groups)) {
    if (g.fwdId === sid || g.revId === sid) {
      const tmp = g.fwdId; g.fwdId = g.revId; g.revId = tmp;
      if (state.samples[g.fwdId]) state.samples[g.fwdId].direction = "F";
      if (state.samples[g.revId]) state.samples[g.revId].direction = "R";
      buildGroupAlignmentAndConsensus(g);
    }
  }
  renderTable(); renderViewer(); persistDB();
}

function swapSelectedDirection() {
  for (const id of state.selectedIds) {
    if (state.samples[id]) swapDirection(id);
    else if (state.groups[id]) {
      const g = state.groups[id], tmp = g.fwdId; g.fwdId = g.revId; g.revId = tmp;
      if (state.samples[g.fwdId]) state.samples[g.fwdId].direction = "F";
      if (state.samples[g.revId]) state.samples[g.revId].direction = "R";
      buildGroupAlignmentAndConsensus(g);
    }
  }
  renderTable(); renderViewer(); persistDB();
}

function groupSelected() {
  const sel = Array.from(state.selectedIds).filter(id => state.samples[id]).map(id => state.samples[id]);
  if (sel.length !== 2) { toast("Select exactly 2 ungrouped samples to pair", "warn"); return; }
  const [a, b] = sel, fwd = a.direction === "F" ? a : (b.direction === "F" ? b : a), rev = fwd === a ? b : a;
  fwd.direction = "F"; rev.direction = "R";
  const suggested = suggestGroupName(fwd, rev), name = prompt("Group Name (suggested shared prefix):", suggested);
  if (name === null) return;
  const g = createGroup(fwd, rev, name.trim() || suggested);
  state.selectedIds.clear(); state.selectedIds.add(g.id);
  renderTable(); openInViewer("group", g.id); persistDB();
}

function ungroupSelected() {
  const sel = Array.from(state.selectedIds).filter(id => state.groups[id]);
  if (!sel.length) return;
  for (const gid of sel) {
    const g = state.groups[gid], idx = state.order.findIndex(o => o.type === "group" && o.id === gid), add = [];
    if (g.fwdId) add.push({ type: "sample", id: g.fwdId });
    if (g.revId) add.push({ type: "sample", id: g.revId });
    state.order.splice(idx, 1, ...add); delete state.groups[gid];
    if (state.activeItemId === gid) { state.activeItemId = null; state.activeItemType = null; }
  }
  state.selectedIds.clear(); renderTable(); renderViewer(); persistDB();
}

function renameGroup(gid) { const g = state.groups[gid]; if (!g) return; const n = prompt("Rename group:", g.name); if (n && n.trim()) { g.name = n.trim(); renderTable(); renderViewer(); persistDB(); } }

function generateConsensusSelected() {
  let count = 0;
  for (const id of state.selectedIds) {
    if (state.groups[id]) { buildGroupAlignmentAndConsensus(state.groups[id]); count++; }
    else if (state.samples[id]) { state.samples[id].savedConsensus = getEffectiveConsensus(state.samples[id]).seq; count++; }
  }
  renderTable(); renderViewer(); persistDB(); toast(`Generated consensus for ${count} item(s)`, "success");
}

function generateConsensusAll() {
  let count = 0;
  for (const g of Object.values(state.groups)) { buildGroupAlignmentAndConsensus(g); count++; }
  for (const o of state.order) if (o.type === "sample" && state.samples[o.id]) { state.samples[o.id].savedConsensus = getEffectiveConsensus(state.samples[o.id]).seq; count++; }
  renderTable(); renderViewer(); persistDB(); toast(`Generated consensus for all ${count} item(s)`, "success");
}

function clearSavedConsensusSelected() {
  for (const id of state.selectedIds) { if (state.groups[id]) state.groups[id].savedConsensus = null; if (state.samples[id]) state.samples[id].savedConsensus = null; }
  renderTable(); persistDB();
}

function deleteSelectedTableItems() {
  if (!state.selectedIds.size) return;
  for (const id of state.selectedIds) {
    if (state.groups[id]) { const g = state.groups[id]; delete state.samples[g.fwdId]; delete state.samples[g.revId]; delete state.groups[id]; state.order = state.order.filter(o => o.id !== id); }
    else if (state.samples[id]) { delete state.samples[id]; state.order = state.order.filter(o => o.id !== id); }
    if (state.activeItemId === id) { state.activeItemId = null; state.activeItemType = null; }
  }
  state.selectedIds.clear(); renderTable(); renderViewer(); persistDB();
}

function sortTable(col) { if (state.sort.col === col) state.sort.asc = !state.sort.asc; else { state.sort.col = col; state.sort.asc = true; } renderTable(); }

function getSelectionRange() {
  if (state.viewer.selStart === null || state.viewer.selEnd === null) return null;
  return { start: Math.min(state.viewer.selStart, state.viewer.selEnd), end: Math.max(state.viewer.selStart, state.viewer.selEnd) };
}

function updateSelectionBar() {
  const bar = document.getElementById("selectionBar"), txt = document.getElementById("selCountText"), clearBtn = document.getElementById("btnClearSel");
  const range = getSelectionRange();
  if (!range) { bar.classList.remove("has-selection"); txt.textContent = `Cursor: bp ${state.viewer.cursor + 1} (no range)`; if (clearBtn) clearBtn.disabled = true; return; }
  bar.classList.add("has-selection");
  const n = range.end - range.start + 1;
  txt.textContent = `${n} base${n > 1 ? "s" : ""} selected (${range.start + 1}–${range.end + 1})`;
  if (clearBtn) clearBtn.disabled = false;
}

function pushUndo(item) {
  item.undoStack.push({ edits: { ...item.edits }, deleted: new Set(item.deleted), trimStart: item.trimStart, trimEnd: item.trimEnd });
  if (item.undoStack.length > 60) item.undoStack.shift();
  item.redoStack = [];
}

function undoEdit() {
  const item = getActiveItem(); if (!item || !item.undoStack.length) return;
  item.redoStack.push({ edits: { ...item.edits }, deleted: new Set(item.deleted), trimStart: item.trimStart, trimEnd: item.trimEnd });
  const snap = item.undoStack.pop();
  item.edits = snap.edits; item.deleted = snap.deleted; item.trimStart = snap.trimStart; item.trimEnd = snap.trimEnd;
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function redoEdit() {
  const item = getActiveItem(); if (!item || !item.redoStack.length) return;
  item.undoStack.push({ edits: { ...item.edits }, deleted: new Set(item.deleted), trimStart: item.trimStart, trimEnd: item.trimEnd });
  const snap = item.redoStack.pop();
  item.edits = snap.edits; item.deleted = snap.deleted; item.trimStart = snap.trimStart; item.trimEnd = snap.trimEnd;
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function editConsensusAt(pos, char) {
  const item = getActiveItem(); if (!item) return;
  pushUndo(item); item.edits[pos] = char; item.deleted.delete(pos);
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function deleteSelectedBases() {
  const item = getActiveItem(); if (!item) return;
  const range = getSelectionRange() || { start: state.viewer.cursor, end: state.viewer.cursor };
  pushUndo(item); for (let i = range.start; i <= range.end; i++) item.deleted.add(i);
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function restoreSelectedBases() {
  const item = getActiveItem(); if (!item) return;
  const range = getSelectionRange() || { start: state.viewer.cursor, end: state.viewer.cursor };
  pushUndo(item); for (let i = range.start; i <= range.end; i++) { item.deleted.delete(i); delete item.edits[i]; }
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function trimToSelection(side) {
  const item = getActiveItem(); if (!item) return;
  const range = getSelectionRange() || { start: state.viewer.cursor, end: state.viewer.cursor };
  pushUndo(item); if (side === "left") item.trimStart = range.end + 1; else item.trimEnd = range.start;
  item.savedConsensus = getEffectiveConsensus(item).seq;
  clearSelection(); runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function toggleAutoTrimSetting(enabled) { state.settings.autoTrim = enabled; saveSettings(); if (enabled && state.activeItemId) autoTrimCurrent(); }

function autoTrimCurrent() {
  const item = getActiveItem(); if (!item) return;
  const ctxData = getViewerContextData();
  const qThresh = state.settings.trimQ || 20, win = state.settings.trimWin || 10, minGood = state.settings.trimMinGood || 8;
  const { start, end } = computeQualityTrimBounds(ctxData.baseSeq, ctxData.baseQ, qThresh, win, minGood);
  pushUndo(item); item.trimStart = start; item.trimEnd = Math.max(start, end);
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
  toast(`Auto-trimmed to ${start + 1}–${end} (${minGood}/${win} >= Q${qThresh})`, "success");
}

function copyTrimmedConsensus() {
  const item = getActiveItem(); if (!item) return;
  const seq = getConsensusSequenceText(item, false);
  if (!seq) { toast("Trimmed consensus is empty", "warn"); return; }
  navigator.clipboard.writeText(seq).then(() => toast(`Copied trimmed consensus (${seq.length} bp)`, "success"));
}

function copySelectedBases(asFasta = false) {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const { item, baseSeq } = ctxData;
  const range = getSelectionRange() || { start: 0, end: baseSeq.length - 1 };
  let seq = "";
  for (let i = range.start; i <= range.end; i++) {
    if (item.deleted.has(i)) continue;
    const ch = (item.edits[i] !== undefined ? item.edits[i] : baseSeq[i]).toUpperCase();
    if (ch && ch !== "-" && ch !== " ") seq += ch;
  }
  const out = asFasta ? `>${item.name}_${range.start+1}-${range.end+1}\n${seq}` : seq;
  navigator.clipboard.writeText(out).then(() => toast(`Copied ${seq.length} bp${asFasta ? " (FASTA)" : ""}`, "success"));
}

function clearSelection() { state.viewer.selStart = null; state.viewer.selEnd = null; updateSelectionBar(); renderMainCanvas(); }

/* ==========================================================================
   11. VIEWER INTERACTION, HOVER TOOLTIP & FIND
   ========================================================================== */
function setViewMode(m) { state.viewer.mode = m; renderViewer(); }
function adjustZoom(d) { state.viewer.colWidth = Math.max(4, Math.min(36, state.viewer.colWidth + d)); renderMainCanvas(); renderMinimap(); }
function resetZoom() { state.viewer.colWidth = 16; renderMainCanvas(); renderMinimap(); }
function adjustAmp(d) { state.viewer.ampScale = Math.max(0.3, Math.min(3.5, state.viewer.ampScale + d)); renderMainCanvas(); }

function scrollCursorIntoView() {
  const vp = document.getElementById("canvasViewport"), x = state.viewer.cursor * state.viewer.colWidth;
  if (x < vp.scrollLeft + 40) vp.scrollLeft = Math.max(0, x - 80);
  else if (x > vp.scrollLeft + vp.clientWidth - 60) vp.scrollLeft = x - vp.clientWidth + 100;
  updateSelectionBar(); renderMainCanvas(); renderMinimap();
}

function jumpNextIssue(kind, dir = 1) {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const { item, fwd, revRC, cols, baseSeq, baseQ } = ctxData, n = baseSeq.length;
  if (!n) return;
  for (let step = 1; step <= n; step++) {
    const idx = (state.viewer.cursor + step * dir + n) % n;
    if (item.deleted.has(idx)) continue;
    const ch = (item.edits[idx] !== undefined ? item.edits[idx] : baseSeq[idx]).toUpperCase();
    let hit = false;
    if (kind === "N") hit = !"ACGT".includes(ch);
    else if (kind === "lowQ") hit = (baseQ[idx] || 0) < (state.settings.trimQ || 20);
    else if (kind === "mismatch") {
      const c = cols[idx];
      if (c && fwd && revRC && ((c.fIdx >= 0 && c.rIdx >= 0 && fwd.seq[c.fIdx] !== revRC.seq[c.rIdx]) || c.fIdx < 0 || c.rIdx < 0)) hit = true;
    }
    if (hit) { state.viewer.cursor = idx; scrollCursorIntoView(); return; }
  }
  toast(`No ${kind} positions found`, "warn");
}

function toggleFindBar() { document.getElementById("findBar").classList.add("show"); const inp = document.getElementById("findInput"); inp.focus(); inp.select(); }
function closeFindBar() { document.getElementById("findBar").classList.remove("show"); state.viewer.findMatches = []; state.viewer.findIdx = -1; renderMainCanvas(); }

function runFind() {
  const q = (document.getElementById("findInput").value || "").trim().toUpperCase().replace(/[^ACGTN]/g, "");
  const ctxData = getViewerContextData();
  state.viewer.findMatches = []; state.viewer.findIdx = -1;
  if (!ctxData || q.length < 2) { document.getElementById("findCount").textContent = "0 matches"; renderMainCanvas(); return; }
  const { item, baseSeq } = ctxData;
  let full = "";
  for (let i = 0; i < baseSeq.length; i++) full += item.deleted.has(i) ? "-" : (item.edits[i] || baseSeq[i]).toUpperCase();
  const rcQ = revComp(q);
  for (const term of (rcQ === q ? [q] : [q, rcQ])) {
    let idx = full.indexOf(term);
    while (idx !== -1) { state.viewer.findMatches.push({ start: idx, len: term.length }); idx = full.indexOf(term, idx + 1); }
  }
  state.viewer.findMatches.sort((a, b) => a.start - b.start);
  document.getElementById("findCount").textContent = `${state.viewer.findMatches.length} match(es)`;
  if (state.viewer.findMatches.length) { state.viewer.findIdx = 0; state.viewer.cursor = state.viewer.findMatches[0].start; scrollCursorIntoView(); }
  else renderMainCanvas();
}

function stepFind(dir) {
  const m = state.viewer.findMatches; if (!m.length) return;
  state.viewer.findIdx = (state.viewer.findIdx + dir + m.length) % m.length;
  state.viewer.cursor = m[state.viewer.findIdx].start; scrollCursorIntoView();
}

(function initCanvasInteractions() {
  const vp = document.getElementById("canvasViewport"), tip = document.getElementById("traceTooltip");
  let dragging = false;

  function colFromEvent(e) {
    const rect = vp.getBoundingClientRect(), ctxData = getViewerContextData();
    const maxC = ctxData ? Math.max(0, ctxData.baseSeq.length - 1) : 0;
    return Math.max(0, Math.min(maxC, Math.floor((e.clientX - rect.left + vp.scrollLeft) / state.viewer.colWidth)));
  }

  vp.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    vp.focus(); const col = colFromEvent(e);
    if (e.shiftKey) { if (state.viewer.selStart === null) state.viewer.selStart = state.viewer.cursor; state.viewer.selEnd = col; }
    else { state.viewer.cursor = col; state.viewer.selStart = col; state.viewer.selEnd = col; dragging = true; }
    updateSelectionBar(); renderMainCanvas();
  });

  vp.addEventListener("mousemove", e => {
    const ctxData = getViewerContextData();
    if (!ctxData) { tip.style.display = "none"; return; }
    const col = colFromEvent(e), { item, fwd, revRC, cols, baseSeq, baseQ } = ctxData, c = cols[col];
    const consB = (item.edits[col] !== undefined ? item.edits[col] : baseSeq[col]) || "-";
    let lines = [`<b>Pos ${col + 1}</b> | Cons: <b>${consB}</b> (Q${baseQ[col] ?? 0})`];
    if (fwd && c && c.fIdx >= 0) { const fb = fwd.seq[c.fIdx]; lines.push(`Fwd: <b>${fb}</b> | Q${fwd.pcon[c.fIdx]} | ${fwd.traces[fb] ? fwd.traces[fb][fwd.ploc[c.fIdx]] : 0} RFU`); }
    if (revRC && c && c.rIdx >= 0) { const rb = revRC.seq[c.rIdx]; lines.push(`Rev: <b>${rb}</b> | Q${revRC.pcon[c.rIdx]} | ${revRC.traces[rb] ? revRC.traces[rb][revRC.ploc[c.rIdx]] : 0} RFU`); }
    tip.innerHTML = lines.join("<br>"); tip.style.display = "block";
    tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 220) + "px";
    tip.style.top = Math.min(e.clientY + 14, window.innerHeight - 90) + "px";
  });

  vp.addEventListener("mouseleave", () => { tip.style.display = "none"; });
  window.addEventListener("mousemove", e => { if (!dragging) return; const col = colFromEvent(e); state.viewer.selEnd = col; state.viewer.cursor = col; updateSelectionBar(); renderMainCanvas(); });
  window.addEventListener("mouseup", () => { if (dragging) { dragging = false; if (state.viewer.selStart === state.viewer.selEnd) { state.viewer.selStart = null; state.viewer.selEnd = null; updateSelectionBar(); renderMainCanvas(); } } });
  vp.addEventListener("scroll", () => { renderMainCanvas(); renderMinimap(); });

  const mm = document.getElementById("minimapWrap"); let mmDrag = false;
  function scrubMinimap(e) {
    const ctxData = getViewerContextData(); if (!ctxData) return;
    const rect = mm.getBoundingClientRect(), frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vp.scrollLeft = Math.max(0, frac * ctxData.cols.length * state.viewer.colWidth - vp.clientWidth / 2);
  }
  mm.addEventListener("mousedown", e => { mmDrag = true; scrubMinimap(e); });
  window.addEventListener("mousemove", e => { if (mmDrag) scrubMinimap(e); });
  window.addEventListener("mouseup", () => { mmDrag = false; });

  const resizer = document.getElementById("resizer"), ws = document.getElementById("workspace"); let resizing = false;
  resizer.addEventListener("mousedown", () => { resizing = true; });
  window.addEventListener("mousemove", e => { if (!resizing) return; ws.style.gridTemplateColumns = `${Math.max(280, Math.min(window.innerWidth - 420, e.clientX))}px 4px 1fr`; renderMainCanvas(); renderMinimap(); });
  window.addEventListener("mouseup", () => { resizing = false; });
  window.addEventListener("resize", () => { renderMainCanvas(); renderMinimap(); });
})();

/* ==========================================================================
   12. BOTTOM DRAWER: FREE CONSENSUS + STANDARD 6-FRAME CDS/ORF + PRO TABS
   ========================================================================== */
function switchProTab(tab) {
  state.viewer.proTab = tab;
  document.querySelectorAll(".pro-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  const drawer = document.getElementById("proDrawer");
  if (drawer.classList.contains("collapsed")) toggleProDrawer();
  renderProDrawer();
}

function toggleProDrawer() {
  const d = document.getElementById("proDrawer");
  d.classList.toggle("collapsed");
  document.getElementById("proDrawerToggle").textContent = d.classList.contains("collapsed") ? "Expand" : "Collapse";
  setTimeout(() => { renderMainCanvas(); renderMinimap(); }, 50);
}

function computeAllSixFrames(eff, tableId = "1") {
  const seq = eff.seq, rcSeq = revComp(seq), n = seq.length;
  const specs = [
    { label: "+1", s: seq, off: 0, rc: false }, { label: "+2", s: seq, off: 1, rc: false }, { label: "+3", s: seq, off: 2, rc: false },
    { label: "-1", s: rcSeq, off: 0, rc: true }, { label: "-2", s: rcSeq, off: 1, rc: true }, { label: "-3", s: rcSeq, off: 2, rc: true }
  ];

  return specs.map(sp => {
    let aa = "", stops = 0, firstStopCol = null, curOrf = 0, longestOrf = 0;
    const stopCols = [];
    for (let i = sp.off; i + 2 < n; i += 3) {
      const codon = sp.s.slice(i, i + 3);
      const res = translateCodon(codon, tableId);
      aa += res;
      const effIdx = sp.rc ? (n - 1 - i) : i;
      const col = eff.mapColToEff[Math.max(0, Math.min(eff.mapColToEff.length - 1, effIdx))] ?? 0;
      if (res === "*") {
        stops++;
        stopCols.push(col);
        if (firstStopCol === null) firstStopCol = col;
        curOrf = 0;
      } else {
        curOrf++;
        if (curOrf > longestOrf) longestOrf = curOrf;
      }
    }
    const cdsLen = Math.floor((n - sp.off) / 3) * 3;
    return {
      label: sp.label, aa, aaLen: aa.length, stops, longestOrf,
      firstStopCol, stopCols, rc: sp.rc, off: sp.off,
      cdsNt: sp.s.slice(sp.off, sp.off + cdsLen)
    };
  });
}

function runProAnalysesSilent() {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const eff = getEffectiveConsensus(ctxData.item);

  // Restriction Map
  const reHits = [];
  for (const enz of RESTRICTION_ENZYMES) {
    let idx = eff.seq.indexOf(enz.site);
    while (idx !== -1) { reHits.push({ name: enz.name, site: enz.site, pos: idx + 1, col: eff.mapColToEff[idx], len: enz.site.length }); idx = eff.seq.indexOf(enz.site, idx + 1); }
  }
  state.viewer.reResults = reHits.sort((a, b) => a.pos - b.pos);

  // Standard 6-Frame Translation & CDS Validation
  state.viewer.frameData = computeAllSixFrames(eff, state.settings.geneticCode || "1");
  // Auto-select best (cleanest / fewest stops) frame if current has many stops
  const bestFrame = [...state.viewer.frameData].sort((a, b) => (a.stops - b.stops) || (b.longestOrf - a.longestOrf))[0];
  if (bestFrame && !state.viewer.frameData.some(f => f.label === state.viewer.selectedFrame)) state.viewer.selectedFrame = bestFrame.label;

  // Heterozygote Peaks & CRISPR Split
  const hetHits = [], ratio = state.settings.hetRatio || 0.30, strand = ctxData.fwd || ctxData.revRC;
  const hetFlags = new Uint8Array(ctxData.cols.length);
  if (strand) {
    for (let c = 0; c < ctxData.cols.length; c++) {
      if (ctxData.item.deleted.has(c)) continue;
      const bIdx = ctxData.fwd ? ctxData.cols[c].fIdx : ctxData.cols[c].rIdx;
      if (bIdx < 0) continue;
      const p = strand.ploc[bIdx];
      const vals = [
        { b: "A", v: strand.traces.A[p] || 0 }, { b: "T", v: strand.traces.T[p] || 0 },
        { b: "G", v: strand.traces.G[p] || 0 }, { b: "C", v: strand.traces.C[p] || 0 }
      ].sort((a, b) => b.v - a.v);
      if (vals[0].v > 250 && vals[1].v / vals[0].v >= ratio) {
        hetFlags[c] = 1;
        hetHits.push({ col: c, pos: c + 1, b1: vals[0].b, b2: vals[1].b, ratio: vals[1].v / vals[0].v, iupac: IUPAC_PAIR[vals[0].b + vals[1].b] || "N" });
      }
    }
  }
  state.viewer.hetResults = hetHits;

  let splitCol = null, w = 15;
  for (let i = w; i < hetFlags.length - w; i++) {
    let pre = 0, post = 0;
    for (let k = i - w; k < i; k++) pre += hetFlags[k];
    for (let k = i; k < i + w; k++) post += hetFlags[k];
    if (pre / w <= 0.15 && post / w >= 0.40) { splitCol = i; break; }
  }
  state.viewer.crisprSplit = splitCol;
}

function copySelectedFrameProtein() {
  const item = getActiveItem(), fr = state.viewer.frameData.find(f => f.label === state.viewer.selectedFrame);
  if (!item || !fr) return;
  navigator.clipboard.writeText(`>${item.name}_frame_${fr.label}_code${state.settings.geneticCode}\n${fr.aa}`)
    .then(() => toast(`Copied Frame ${fr.label} protein (${fr.aaLen} aa)`, "success"));
}

function copySelectedFrameCDS() {
  const item = getActiveItem(), fr = state.viewer.frameData.find(f => f.label === state.viewer.selectedFrame);
  if (!item || !fr) return;
  navigator.clipboard.writeText(`>${item.name}_CDS_frame_${fr.label}\n${fr.cdsNt}`)
    .then(() => toast(`Copied Frame ${fr.label} CDS (${fr.cdsNt.length} bp, ${fr.stops} stops)`, "success"));
}

function runReferenceSnpAnalysis() {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const item = ctxData.item, raw = document.getElementById("refFastaInput").value || "";
  item.refFasta = raw;
  const refSeq = raw.split(/\r?\n/).filter(l => !l.startsWith(">")).join("").toUpperCase().replace(/[^ACGTN]/g, "");
  if (refSeq.length < 10) { toast("Paste a reference sequence (>=10 bp)", "warn"); return; }

  const eff = getEffectiveConsensus(item), aln = alignForwardReverse(refSeq, eff.seq), variants = [];
  for (let i = 0; i < aln.cols.length; i++) {
    const c = aln.cols[i];
    if (c.fIdx >= 0 && c.rIdx >= 0) {
      if (refSeq[c.fIdx] !== eff.seq[c.rIdx]) variants.push({ type: "SNP", refPos: c.fIdx + 1, qryCol: eff.mapColToEff[c.rIdx], change: `${refSeq[c.fIdx]}>${eff.seq[c.rIdx]}` });
    } else if (c.fIdx >= 0 && i > 0 && i < aln.cols.length - 1) {
      if (aln.cols.slice(0, i).some(x => x.rIdx >= 0) && aln.cols.slice(i + 1).some(x => x.rIdx >= 0)) variants.push({ type: "DEL", refPos: c.fIdx + 1, qryCol: null, change: `del${refSeq[c.fIdx]}` });
    } else if (c.rIdx >= 0 && i > 0 && i < aln.cols.length - 1) {
      if (aln.cols.slice(0, i).some(x => x.fIdx >= 0) && aln.cols.slice(i + 1).some(x => x.fIdx >= 0)) variants.push({ type: "INS", refPos: "-", qryCol: eff.mapColToEff[c.rIdx], change: `ins${eff.seq[c.rIdx]}` });
    }
  }
  item.snpResults = { overlap: aln.overlapLen, identity: aln.identity, variants };
  persistDB(); renderProDrawer();
}

function callAllHetIupac() {
  const item = getActiveItem(); if (!item || !state.viewer.hetResults.length) return;
  pushUndo(item); for (const h of state.viewer.hetResults) item.edits[h.col] = h.iupac;
  item.savedConsensus = getEffectiveConsensus(item).seq;
  renderViewer(); renderTable(); persistDB();
  toast(`Applied ${state.viewer.hetResults.length} IUPAC heterozygote call(s)`, "success");
}

document.getElementById("fileInputWtAb1").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  try {
    state.viewer.wtSample = parseAB1(await f.arrayBuffer(), f.name);
    compareWtToActive(); renderProDrawer();
    toast(`Loaded WT control trace: ${f.name}`, "success");
  } catch (err) { toast("Failed to parse WT .ab1: " + err.message, "error"); }
});

function compareWtToActive() {
  const ctxData = getViewerContextData(), wt = state.viewer.wtSample;
  if (!ctxData || !wt) { state.viewer.wtDiffs = []; return; }
  const eff = getEffectiveConsensus(ctxData.item), aln = alignForwardReverse(wt.seq, eff.seq), diffs = [];
  for (const c of aln.cols) if (c.fIdx >= 0 && c.rIdx >= 0 && wt.seq[c.fIdx] !== eff.seq[c.rIdx]) diffs.push({ wtPos: c.fIdx + 1, qryCol: eff.mapColToEff[c.rIdx], wtBase: wt.seq[c.fIdx], mutBase: eff.seq[c.rIdx] });
  state.viewer.wtDiffs = diffs;
}

function renderProDrawer() {
  const body = document.getElementById("proBody");
  if (!body) return;
  const pro = isPro(), tab = state.viewer.proTab;
  let html = "";

  if (!pro && tab !== "consensus") {
    html += `<div class="pro-lock-overlay">
      <div style="font-weight:700;font-size:14px;">SangBase Pro Feature</div>
      <div style="font-size:12px;color:var(--text-muted);">Unlock Per-Sample SNPs, 6-Frame CDS Validator, Restriction Map, CRISPR Split, WT vs Mutant .ab1, Phylo Tree &amp; Batch BLAST XML for ₹99 one-time.</div>
      <button class="btn-pro" onclick="openProModal()">Unlock Pro (₹99)</button>
    </div>`;
  }

  if (tab === "consensus") {
    const item = getActiveItem();
    if (!item) { body.innerHTML = '<span class="hint-text">Open a sample or pair to view its consensus sequence.</span>'; return; }
    const untrimmed = state.viewer.showUntrimmedConsensus;
    const seq = getConsensusSequenceText(item, untrimmed);
    const trimmedLen = getConsensusSequenceText(item, false).length, untrimmedLen = getConsensusSequenceText(item, true).length;
    html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
      <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;font-weight:600;">
        <input type="checkbox" ${untrimmed ? "checked" : ""} onchange="state.viewer.showUntrimmedConsensus=this.checked; renderProDrawer();" />
        Show untrimmed consensus sequence
        <span style="color:var(--text-muted);font-weight:400;">(${untrimmed ? `Full: ${untrimmedLen} bp` : `Trimmed: ${trimmedLen} / ${untrimmedLen} bp`})</span>
      </label>
      <div class="btn-row-tight">
        <button class="btn-sm" onclick="copyDrawerConsensus(false)">Copy Sequence</button>
        <button class="btn-sm btn-primary" onclick="copyDrawerConsensus(true)">Copy FASTA</button>
      </div>
    </div>
    <div class="mono-box" style="user-select:text;line-height:1.5;max-height:135px;overflow:auto;">${escapeHtml(seq) || "(empty sequence)"}</div>`;
  } else if (tab === "snp") {
    const item = getActiveItem(), res = item ? item.snpResults : null, refVal = item ? (item.refFasta || "") : "";
    html += `<div style="display:flex;gap:10px;height:100%;">
      <div style="width:44%;display:flex;flex-direction:column;gap:5px;">
        <textarea id="refFastaInput" rows="4" placeholder="Paste Reference FASTA for ${escapeHtml(item ? item.name : "this sample")}..." oninput="const it=getActiveItem(); if(it){it.refFasta=this.value; persistDB();}">${escapeHtml(refVal)}</textarea>
        <div class="btn-row-tight">
          <button class="btn-sm btn-primary" style="flex:1;" onclick="runReferenceSnpAnalysis()">Align &amp; Detect SNPs / Indels</button>
          <button class="btn-sm" onclick="const it=getActiveItem(); if(it){it.refFasta=''; it.snpResults=null; persistDB(); renderProDrawer();}">Clear</button>
        </div>
      </div>
      <div style="flex:1;overflow:auto;">
        ${res ? `<div style="margin-bottom:6px;font-size:12px;"><b>${escapeHtml(item.name)}</b> — Overlap: <b>${res.overlap} bp</b> | Identity: <b>${res.identity.toFixed(1)}%</b> | Variants: <b>${res.variants.length}</b></div>
          ${res.variants.length ? res.variants.map(v => `<span class="tag-chip" style="margin:2px;cursor:pointer;" onclick="${v.qryCol !== null ? `state.viewer.cursor=${v.qryCol};scrollCursorIntoView();` : ""}"><b>${v.type}</b> pos ${v.refPos}: ${v.change}</span>`).join("") : '<span style="color:var(--success);">100% match — no SNPs or indels detected.</span>'}` : '<span class="hint-text">Paste a reference sequence specific to this sample to highlight SNPs, insertions, and deletions.</span>'}
      </div>
    </div>`;
  } else if (tab === "orf") {
    const frames = state.viewer.frameData || [];
    const cur = frames.find(f => f.label === state.viewer.selectedFrame) || frames[0];
    const gcOpts = Object.entries(GENETIC_CODES).map(([id, g]) => `<option value="${id}" ${state.settings.geneticCode === id ? "selected" : ""}>${g.name}</option>`).join("");

    let aaHtml = "";
    if (cur) {
      let stopIdx = 0;
      for (let i = 0; i < cur.aa.length; i++) {
        const ch = cur.aa[i];
        if (ch === "*") {
          const col = cur.stopCols[stopIdx++] ?? 0;
          aaHtml += `<span class="aa-stop" title="Stop codon — click to jump to trace bp ${col + 1}" onclick="state.viewer.cursor=${col};scrollCursorIntoView();">*</span>`;
        } else if (ch === "M") aaHtml += `<span class="aa-start">M</span>`;
        else if (ch === "X") aaHtml += `<span class="aa-ambig">X</span>`;
        else aaHtml += ch;
      }
    }

    html += `<div class="orf-toolbar">
      <div class="btn-row-tight">
        <label style="font-size:11px;font-weight:600;">Genetic Code:</label>
        <select onchange="state.settings.geneticCode=this.value; saveSettings(); runProAnalysesSilent(); renderProDrawer();">${gcOpts}</select>
      </div>
      <div class="btn-row-tight">
        ${cur && cur.firstStopCol !== null ? `<button class="btn-sm btn-danger" onclick="state.viewer.cursor=${cur.firstStopCol};scrollCursorIntoView();">Jump to 1st Stop</button>` : ""}
        <button class="btn-sm" onclick="copySelectedFrameCDS()">Copy Frame CDS (DNA)</button>
        <button class="btn-sm btn-primary" onclick="copySelectedFrameProtein()">Copy Protein FASTA</button>
      </div>
    </div>
    <div class="orf-layout">
      <div style="overflow:auto;border:1px solid var(--border);border-radius:6px;">
        <table class="orf-table">
          <thead><tr><th>Frame</th><th>Len</th><th>Stops</th><th>Max ORF</th><th>CDS Status</th></tr></thead>
          <tbody>
            ${frames.map(f => `<tr class="${cur && f.label === cur.label ? "selected-frame" : ""}" onclick="state.viewer.selectedFrame='${f.label}'; renderProDrawer();">
              <td><b>${f.label}</b></td><td>${f.aaLen} aa</td><td>${f.stops}</td><td>${f.longestOrf} aa</td>
              <td><span class="status-pill ${f.stops === 0 ? "status-ok" : "status-err"}">${f.stops === 0 ? "Clean CDS" : f.stops + " Stop" + (f.stops > 1 ? "s" : "")}</span></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="orf-seq-view">${aaHtml || '<span class="hint-text">No sequence to translate.</span>'}</div>
    </div>`;
  } else if (tab === "re") {
    const hits = state.viewer.reResults;
    html += hits.length
      ? `<div class="btn-row">${hits.map(h => `<span class="tag-chip" style="cursor:pointer;" onclick="state.viewer.cursor=${h.col};scrollCursorIntoView();"><b>${h.name}</b> (${h.site}) @ bp ${h.pos}</span>`).join("")}</div>`
      : '<span class="hint-text">No common restriction sites detected in current consensus.</span>';
  } else if (tab === "het") {
    const hets = state.viewer.hetResults, split = state.viewer.crisprSplit;
    html += `<div class="btn-row" style="margin-bottom:8px;">
      <label style="font-size:11px;">Secondary Peak Ratio >= <b>${Math.round((state.settings.hetRatio||0.3)*100)}%</b></label>
      <input type="range" min="0.15" max="0.60" step="0.05" value="${state.settings.hetRatio||0.3}" oninput="state.settings.hetRatio=parseFloat(this.value);saveSettings();runProAnalysesSilent();renderViewer();" />
      <button class="btn-sm btn-primary" onclick="callAllHetIupac()">Call All as IUPAC (${hets.length})</button>
      ${split !== null ? `<span class="status-pill status-err" style="cursor:pointer;" onclick="state.viewer.cursor=${split};scrollCursorIntoView();">CRISPR Indel Split @ bp ${split + 1}</span>` : `<span class="status-pill status-ok">No CRISPR Trace Split</span>`}
    </div>
    <div class="btn-row">
      ${hets.length ? hets.map(h => `<span class="tag-chip" style="cursor:pointer;" onclick="state.viewer.cursor=${h.col};scrollCursorIntoView();">bp ${h.pos}: <b>${h.b1}/${h.b2} → ${h.iupac}</b> (${Math.round(h.ratio*100)}%)</span>`).join("") : '<span class="hint-text">No overlapping secondary peaks above threshold.</span>'}
    </div>`;
  } else if (tab === "wt") {
    const wt = state.viewer.wtSample, diffs = state.viewer.wtDiffs || [];
    html += `<div class="btn-row" style="margin-bottom:8px;">
      <button class="btn-sm btn-primary" onclick="document.getElementById('fileInputWtAb1').click()">Load Wild-Type Control .ab1</button>
      ${wt ? `<span style="font-size:12px;">WT: <b>${escapeHtml(wt.name)}</b> (${wt.seq.length} bp) | Differences vs Active: <b>${diffs.length}</b></span>` : '<span class="hint-text">Load a wild-type control .ab1 chromatogram to compare directly against the active sample.</span>'}
    </div>
    ${wt ? `<div class="btn-row">${diffs.length ? diffs.map(d => `<span class="tag-chip" style="cursor:pointer;" onclick="state.viewer.cursor=${d.qryCol};scrollCursorIntoView();">WT bp ${d.wtPos}: <b>${d.wtBase} → ${d.mutBase}</b></span>`).join("") : '<span style="color:var(--success);">Identical to Wild-Type control trace across overlap.</span>'}</div>` : ""}`;
  }
  body.innerHTML = html;
}

/* ==========================================================================
   13. GENBANK BANKIT, DEREPLICATION, PHYLO MATRIX/TREE & PRINTABLE PDF
   ========================================================================== */
function exportGenBankBankIt() {
  const items = getExportItems(true);
  if (!items.length) { toast('No "Use"-checked sequences to export', "warn"); return; }

  const fastaLines = [];
  const tsvLines = [
    ["Sequence_ID", "Organism", "Strain", "Isolate", "Isolation_source", "Host", "geo_loc_name", "Collection_date", "Collected_by", "Specimen_voucher", "Note"].join("\t")
  ];

  for (const it of items) {
    const eff = getEffectiveConsensus(it), n = { ...emptyNotes(), ...(it.notes || {}) };
    const seqId = it.name.replace(/[^\w\-]+/g, "_").slice(0, 25);
    const org = n.taxon || "Unidentified organism", marker = n.marker || "ribosomal RNA";

    const mods = [`[organism=${org}]`];
    if (n.strain) mods.push(`[strain=${n.strain}]`);
    else if (n.isolate) mods.push(`[isolate=${n.isolate}]`);
    else mods.push(`[isolate=${seqId}]`);
    if (n.isolationSource) mods.push(`[isolation-source=${n.isolationSource}]`);
    if (n.host) mods.push(`[host=${n.host}]`);
    if (n.geoLoc) mods.push(`[geo_loc_name=${n.geoLoc}]`);
    if (n.collectionDate) mods.push(`[collection-date=${n.collectionDate}]`);
    if (n.collectedBy) mods.push(`[collected-by=${n.collectedBy}]`);
    if (n.voucher) mods.push(`[specimen-voucher=${n.voucher}]`);

    fastaLines.push(`>${seqId} ${mods.join(" ")} ${marker} gene, partial sequence\n${eff.seq}`);
    tsvLines.push([seqId, org, n.strain, n.isolate || (!n.strain ? seqId : ""), n.isolationSource, n.host, n.geoLoc, n.collectionDate, n.collectedBy, n.voucher, (n.text || "").replace(/[\t\r\n]+/g, " ")].join("\t"));
  }
  const base = state.projectName.replace(/[^\w\-]+/g, "_");
  downloadText(`${base}_BankIt.fasta`, fastaLines.join("\n"));
  setTimeout(() => downloadText(`${base}_SourceModifiers.tsv`, tsvLines.join("\n")), 250);
  closeModal("batchModal");
  toast(`Exported BankIt FASTA + Source Modifier TSV for ${items.length} sequence(s)`, "success");
}

function openDerepModal() { openModal("derepModal"); runDereplication(); }

function fastSeqIdentity(a, b) {
  if (!a || !b) return 0; if (a === b) return 100;
  const k = 7; if (a.length < k || b.length < k) return 0;
  const setA = new Set(), setB = new Set();
  for (let i = 0; i <= a.length - k; i++) setA.add(a.slice(i, i + k));
  for (let i = 0; i <= b.length - k; i++) setB.add(b.slice(i, i + k));
  let inter = 0; for (const x of setA) if (setB.has(x)) inter++;
  return ((2 * inter) / (setA.size + setB.size)) * 100;
}

function runDereplication() {
  const thresh = parseFloat(document.getElementById("derepSlider").value) || 99;
  const items = getExportItems(true).map(it => ({ it, seq: getEffectiveConsensus(it).seq })).filter(x => x.seq.length >= 20);
  const visited = new Set(), clusters = [];
  for (let i = 0; i < items.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i); const grp = [items[i]];
    for (let j = i + 1; j < items.length; j++) {
      if (!visited.has(j) && fastSeqIdentity(items[i].seq, items[j].seq) >= thresh) { visited.add(j); grp.push(items[j]); }
    }
    clusters.push(grp);
  }
  state.derepClusters = clusters;
  const el = document.getElementById("derepResults");
  if (!clusters.length) { el.textContent = 'No "Use"-checked sequences (>=20 bp) to dereplicate.'; return; }
  el.innerHTML = clusters.map((c, idx) => `<div style="margin-bottom:8px;"><b>Cluster ${idx + 1}</b> (${c.length}): ${c.map((x, k) => k === 0 ? `<b style="color:var(--success);">${escapeHtml(x.it.name)}</b>` : escapeHtml(x.it.name)).join(", ")}</div>`).join("");
}

function uncheckDuplicates() {
  let unchecked = 0;
  for (const c of state.derepClusters) for (let k = 1; k < c.length; k++) { c[k].it.use = false; unchecked++; }
  renderTable(); persistDB(); toast(`Unchecked ${unchecked} duplicate sequence(s); kept 1 representative per cluster.`, "success");
}

function openPhyloModal() { if (!isPro()) { openProModal(); return; } openModal("phyloModal"); computePhyloMatrixAndTree(); }

function computePhyloMatrixAndTree() {
  const items = getExportItems(true).map(it => ({ name: it.name, seq: getEffectiveConsensus(it).seq })).filter(x => x.seq.length >= 20);
  const treeWrap = document.getElementById("phyloTreeWrap"), matWrap = document.getElementById("phyloMatrixWrap");
  if (items.length < 2) { treeWrap.innerHTML = '<span class="hint-text">Need at least 2 "Use"-checked sequences (>=20 bp).</span>'; matWrap.innerHTML = ""; return; }

  const n = items.length, mat = Array.from({ length: n }, () => new Array(n).fill(100));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) mat[i][j] = mat[j][i] = fastSeqIdentity(items[i].seq, items[j].seq);

  let nodes = items.map((it, i) => ({ id: i, name: it.name, height: 0, size: 1, left: null, right: null }));
  let dist = mat.map(row => row.map(v => Math.max(0, 100 - v) / 100));

  while (nodes.length > 1) {
    let bi = 0, bj = 1, best = Infinity;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) if (dist[i][j] < best) { best = dist[i][j]; bi = i; bj = j; }
    const a = nodes[bi], b = nodes[bj], merged = { name: "", height: best / 2, size: a.size + b.size, left: a, right: b };
    const newRow = [];
    for (let k = 0; k < nodes.length; k++) if (k !== bi && k !== bj) newRow.push((dist[bi][k] * a.size + dist[bj][k] * b.size) / (a.size + b.size));
    const nextNodes = nodes.filter((_, k) => k !== bi && k !== bj), nextDist = [];
    for (let i = 0; i < nodes.length; i++) if (i !== bi && i !== bj) nextDist.push(dist[i].filter((_, j) => j !== bi && j !== bj));
    for (let i = 0; i < nextDist.length; i++) nextDist[i].push(newRow[i]);
    nextDist.push([...newRow, 0]); nextNodes.push(merged);
    nodes = nextNodes; dist = nextDist;
  }

  const root = nodes[0];
  const toNewick = node => !node.left ? node.name.replace(/[:;,()]/g, "_") : `(${toNewick(node.left)}:${Math.max(0.0001, node.height - node.left.height).toFixed(4)},${toNewick(node.right)}:${Math.max(0.0001, node.height - node.right.height).toFixed(4)})`;
  const newick = toNewick(root) + ";";

  const rowH = 26, padL = 20, padR = 190, treeW = 480, svgW = padL + treeW + padR, svgH = Math.max(120, n * rowH + 30), maxH = Math.max(0.01, root.height);
  let leafY = 20; const lines = [], labels = [];
  function layout(node) {
    const x = padL + (1 - node.height / maxH) * treeW;
    if (!node.left) { const y = leafY; leafY += rowH; labels.push(`<text x="${x + 8}" y="${y + 4}" fill="currentColor" font-family="monospace" font-size="11">${escapeHtml(node.name)}</text>`); return { x, y }; }
    const L = layout(node.left), R = layout(node.right), y = (L.y + R.y) / 2;
    lines.push(`<line x1="${x}" y1="${L.y}" x2="${L.x}" y2="${L.y}" stroke="#3b82f6" stroke-width="1.8"/>`, `<line x1="${x}" y1="${R.y}" x2="${R.x}" y2="${R.y}" stroke="#3b82f6" stroke-width="1.8"/>`, `<line x1="${x}" y1="${L.y}" x2="${x}" y2="${R.y}" stroke="#3b82f6" stroke-width="1.8"/>`);
    return { x, y };
  }
  layout(root);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="color:var(--text-main);">${lines.join("")}${labels.join("")}</svg>`;
  state.phyloCache = { names: items.map(x => x.name), matrix: mat, newick, svg };
  treeWrap.innerHTML = svg;

  let mHtml = `<table class="matrix-table"><thead><tr><th>Sample</th>${items.map(x => `<th>${escapeHtml(x.name.slice(0, 14))}</th>`).join("")}</tr></thead><tbody>`;
  for (let i = 0; i < n; i++) {
    mHtml += `<tr><th>${escapeHtml(items[i].name.slice(0, 18))}</th>`;
    for (let j = 0; j < n; j++) {
      const v = mat[i][j], bg = i === j ? "var(--bg-elevated)" : (v >= 98 ? "rgba(34,197,94,0.25)" : (v >= 90 ? "rgba(234,179,8,0.2)" : "rgba(239,68,68,0.16)"));
      mHtml += `<td style="background:${bg};">${v.toFixed(1)}%</td>`;
    }
    mHtml += "</tr>";
  }
  matWrap.innerHTML = mHtml + "</tbody></table>";
}

function downloadPhyloSVG() { if (state.phyloCache.svg) downloadText(`${state.projectName}_tree.svg`, state.phyloCache.svg); }
function downloadPhyloNewick() { if (state.phyloCache.newick) downloadText(`${state.projectName}_tree.nwk`, state.phyloCache.newick); }
function downloadMatrixCSV() {
  const { names, matrix } = state.phyloCache; if (!names.length) return;
  const rows = [["Sample", ...names].join(",")];
  for (let i = 0; i < names.length; i++) rows.push([`"${names[i]}"`, ...matrix[i].map(v => v.toFixed(2))].join(","));
  downloadText(`${state.projectName}_identity_matrix.csv`, rows.join("\n"));
}

function openPrintReportModal() {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const { item, baseSeq } = ctxData, stats = getEffectiveConsensus(item), n = item.notes || emptyNotes();
  const body = document.getElementById("printReportBody");
  body.innerHTML = `<div class="print-header">
    <h2 style="font-size:18px;margin-bottom:4px;">SangBase Chromatogram Report — ${escapeHtml(item.name)}</h2>
    <div style="font-size:12px;color:#334155;">
      <b>Length:</b> ${stats.length} bp | <b>GC%:</b> ${stats.gcPct.toFixed(1)}% | <b>Mean Q:</b> ${stats.meanQ.toFixed(1)} | <b>Q20/Q30:</b> ${stats.q20Pct.toFixed(0)}% / ${stats.q30Pct.toFixed(0)}%
      ${n.taxon ? ` | <b>Taxon:</b> <i>${escapeHtml(n.taxon)}</i> (${escapeHtml(n.identity || "")} ${escapeHtml(n.accession || "")})` : ""}
    </div>
  </div>`;
  for (let start = 0; start < baseSeq.length; start += 80) {
    const end = Math.min(baseSeq.length, start + 80), c = document.createElement("canvas");
    c.className = "print-row-canvas";
    renderMainCanvas({ canvas: c, dpr: 2, whiteBg: true, title: `Bases ${start + 1} – ${end}`, startCol: start, endCol: end, colWidth: 10, height: 220 });
    body.appendChild(c);
  }
  openModal("printModal");
}

/* ==========================================================================
   14. PRO BATCH EXPORT, PNG & BLAST XML/CSV IMPORTER
   ========================================================================== */
function openPngModal() {
  if (!isPro()) { openProModal(); return; }
  const ctxData = getViewerContextData(); if (!ctxData) return;
  document.getElementById("pngTitleInput").value = ctxData.item.name;
  document.getElementById("pngStartInput").value = 1;
  document.getElementById("pngEndInput").value = Math.min(ctxData.baseSeq.length, 120);
  openModal("pngModal");
}

function exportHighResPNG() {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const title = document.getElementById("pngTitleInput").value || ctxData.item.name;
  const dpr = parseInt(document.getElementById("pngScaleSelect").value) || 3;
  const whiteBg = document.getElementById("pngBgSelect").value === "white";
  const startCol = Math.max(0, (parseInt(document.getElementById("pngStartInput").value) || 1) - 1);
  const endCol = Math.min(ctxData.baseSeq.length, parseInt(document.getElementById("pngEndInput").value) || ctxData.baseSeq.length);

  const offCanvas = document.createElement("canvas");
  renderMainCanvas({ canvas: offCanvas, dpr, whiteBg, title, startCol, endCol: Math.max(startCol + 1, endCol), colWidth: 16, height: 380 });
  const a = document.createElement("a");
  a.download = `${title.replace(/[^\w\-]+/g, "_")}_chromatogram_${dpr}x.png`;
  a.href = offCanvas.toDataURL("image/png"); a.click();
  closeModal("pngModal"); toast("Exported high-resolution PNG chromatogram", "success");
}

function openBatchExportModal() {
  document.getElementById("batchSummaryText").textContent = `${getExportItems(true).length} item(s) marked "Use" | ${getExportItems(false).length} item(s) currently selected.`;
  openModal("batchModal");
}

function getExportItems(useCheckedOnly) {
  const list = [];
  for (const o of state.order) {
    const obj = o.type === "group" ? state.groups[o.id] : state.samples[o.id];
    if (obj && (useCheckedOnly ? obj.use : state.selectedIds.has(obj.id))) list.push(obj);
  }
  return list;
}

function batchAutoTrimAndConsensus() {
  const items = getExportItems(true);
  for (const item of items) {
    if (item.alignment !== undefined) buildGroupAlignmentAndConsensus(item);
    else {
      const b = computeQualityTrimBounds(item.seq, item.pcon, state.settings.trimQ || 20, state.settings.trimWin || 10, state.settings.trimMinGood || 8);
      item.trimStart = b.start; item.trimEnd = b.end; item.savedConsensus = getEffectiveConsensus(item).seq;
    }
  }
  renderTable(); renderViewer(); persistDB();
  toast(`Batch quality auto-trimmed & updated ${items.length} consensus sequence(s)`, "success");
}

function exportBatchFasta(useCheckedOnly) {
  if (!isPro()) { openProModal(); return; }
  const items = getExportItems(useCheckedOnly);
  if (!items.length) { toast("No sequences to export", "warn"); return; }
  downloadText(`${state.projectName.replace(/[^\w\-]+/g, "_")}.fasta`, items.map(it => `>${it.name}${it.notes?.taxon ? ` [${it.notes.taxon}]` : ""}\n${getEffectiveConsensus(it).seq}`).join("\n"));
  closeModal("batchModal"); toast(`Exported ${items.length} sequence(s) to Multi-FASTA`, "success");
}

function exportBatchCSV() {
  if (!isPro()) { openProModal(); return; }
  const items = getExportItems(true);
  if (!items.length) { toast("No 'Use'-checked items to export", "warn"); return; }
  const header = ["Name","Type","Length_bp","GC_Pct","Ambiguous","Mean_Q","Q20_Pct","Q30_Pct","Genus_Species","Accession","BLAST_Identity","Query_Coverage","E_Value","Marker","Strain","Isolate","Isolation_Source","Host","Geo_Location","Collection_Date","Collected_By","Voucher","Notes"];
  const rows = [header.join(",")];
  for (const it of items) {
    const st = getEffectiveConsensus(it), n = { ...emptyNotes(), ...(it.notes || {}) };
    rows.push([
      it.name, it.alignment ? "Pair" : "Single", st.length, st.gcPct.toFixed(2), st.ambig,
      st.meanQ.toFixed(1), st.q20Pct.toFixed(1), st.q30Pct.toFixed(1),
      n.taxon, n.accession, n.identity, n.coverage, n.evalue, n.marker,
      n.strain, n.isolate, n.isolationSource, n.host, n.geoLoc, n.collectionDate, n.collectedBy, n.voucher, n.text
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
  }
  downloadText(`${state.projectName.replace(/[^\w\-]+/g, "_")}_summary.csv`, rows.join("\n"));
  closeModal("batchModal"); toast(`Exported ${items.length} row(s) to CSV`, "success");
}

function launchBatchBlastAllChecked() {
  if (!isPro()) { openProModal(); return; }
  const items = getExportItems(true);
  if (!items.length) { toast('No "Use"-checked sequences to BLAST', "warn"); return; }
  const fasta = items.map(it => `>${it.name.replace(/\s+/g, "_")}\n${getEffectiveConsensus(it).seq}`).join("\n");
  navigator.clipboard.writeText(fasta).catch(() => {});

  const form = document.createElement("form");
  form.method = "POST"; form.action = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"; form.target = "_blank"; form.style.display = "none";
  for (const [k, v] of Object.entries({ CMD: "Web", PAGE_TYPE: "BlastSearch", PROGRAM: "blastn", BLAST_PROGRAMS: "megaBlast", DATABASE: "core_nt", QUERY: fasta, JOB_TITLE: `${state.projectName} (${items.length} seqs)` })) {
    const inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; inp.value = v; form.appendChild(inp);
  }
  document.body.appendChild(form); form.submit(); form.remove();
  closeModal("batchModal");
  toast(`Submitted ${items.length} sequence(s) to NCBI BLASTn. Download XML when done and import it back!`, "success");
}

function triggerBlastXmlImport() { if (!isPro()) { openProModal(); return; } document.getElementById("fileInputBlastXml").click(); }
document.getElementById("fileInputBlastXml").addEventListener("change", async e => { const f = e.target.files[0]; e.target.value = ""; if (f) await importBlastResultsFile(f); });

function extractTaxonFromDef(def) {
  if (!def) return "";
  const words = def.replace(/^(PREDICTED|TPA|MAG):\s*/i, "").trim().split(/\s+/);
  if (words.length >= 2) {
    if (["sp.", "cf.", "aff.", "subsp.", "var."].includes(words[1].toLowerCase()) && words[2]) return `${words[0]} ${words[1]} ${words[2]}`;
    return `${words[0]} ${words[1]}`.replace(/[,;:\[\]]+$/g, "");
  }
  return words[0] || "";
}

function detectMarkerFromDef(def) {
  const d = (def || "").toLowerCase();
  if (d.includes("16s")) return "16S ribosomal RNA";
  if (d.includes("internal transcribed spacer") || /\bits[124]?\b/.test(d)) return "ITS";
  if (d.includes("28s") || d.includes("large subunit")) return "28S / LSU";
  if (d.includes("18s") || d.includes("small subunit")) return "18S / SSU";
  if (d.includes("translation elongation factor") || d.includes("tef1")) return "TEF1-a";
  if (d.includes("beta-tubulin") || d.includes("tub2")) return "TUB2";
  if (d.includes("rpob")) return "rpoB";
  if (d.includes("gyrb")) return "gyrB";
  if (d.includes("cytochrome c oxidase") || /\bcoi\b|\bcox1\b/.test(d)) return "COI";
  return "";
}

function findItemByBlastQueryName(qDef) {
  const clean = (qDef || "").trim().split(/\s+/)[0].toLowerCase();
  const norm = s => (s || "").trim().replace(/\s+/g, "_").toLowerCase();
  const all = [...Object.values(state.groups), ...Object.values(state.samples)];
  return all.find(it => norm(it.name) === clean) || all.find(it => clean.startsWith(norm(it.name))) || all.find(it => norm(it.name).startsWith(clean));
}

async function importBlastResultsFile(file) {
  try {
    const text = await file.text(), isXml = file.name.toLowerCase().endsWith(".xml") || text.trim().startsWith("<");
    const parsedHits = isXml ? parseBlastXml(text) : parseBlastHitTable(text);
    let updated = 0, noHit = 0, unmatched = 0;

    for (const r of parsedHits) {
      const item = findItemByBlastQueryName(r.queryName);
      if (!item) { unmatched++; continue; }
      item.notes = { ...emptyNotes(), ...(item.notes || {}) };
      if (r.noHit) { item.notes.taxon = "No significant hit"; noHit++; continue; }
      item.notes.taxon = r.taxon || item.notes.taxon;
      item.notes.accession = r.accession || item.notes.accession;
      item.notes.identity = r.identity || item.notes.identity;
      item.notes.coverage = r.coverage || item.notes.coverage;
      item.notes.evalue = r.evalue || item.notes.evalue;
      if (r.marker) item.notes.marker = r.marker;
      updated++;
    }
    renderTable(); persistDB(); closeModal("batchModal");
    toast(`BLAST Import: Updated ${updated} sample(s)${noHit ? `, ${noHit} no-hit` : ""}${unmatched ? `, ${unmatched} unmatched` : ""}.`, updated ? "success" : "warn");
  } catch (err) { toast("Failed to parse BLAST file: " + err.message, "error"); }
}

function parseBlastXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Malformed XML file");
  const results = [];
  for (const iter of doc.querySelectorAll("Iteration, Search")) {
    const qDef = iter.querySelector("Iteration_query-def")?.textContent || iter.querySelector("query-title")?.textContent || iter.querySelector("query-id")?.textContent || "";
    const qLen = parseFloat(iter.querySelector("Iteration_query-len")?.textContent || iter.querySelector("query-len")?.textContent || "0");
    const firstHit = iter.querySelector("Hit");
    if (!firstHit) { results.push({ queryName: qDef, noHit: true }); continue; }
    const hitDef = firstHit.querySelector("Hit_def")?.textContent || firstHit.querySelector("description > HitDescr > title")?.textContent || "";
    const accession = firstHit.querySelector("Hit_accession")?.textContent || firstHit.querySelector("description > HitDescr > accession")?.textContent || "";
    const hsp = firstHit.querySelector("Hsp");
    let identity = "", coverage = "", evalue = "";
    if (hsp) {
      const idNum = parseFloat(hsp.querySelector("Hsp_identity, identity")?.textContent || "0");
      const alnLen = parseFloat(hsp.querySelector("Hsp_align-len, align-len")?.textContent || "1");
      const qFrom = parseFloat(hsp.querySelector("Hsp_query-from, query-from")?.textContent || "0");
      const qTo = parseFloat(hsp.querySelector("Hsp_query-to, query-to")?.textContent || "0");
      const ev = hsp.querySelector("Hsp_evalue, evalue")?.textContent || "";
      const bits = hsp.querySelector("Hsp_bit-score, bit-score")?.textContent || "";
      if (alnLen > 0) identity = ((idNum / alnLen) * 100).toFixed(2) + "%";
      if (qLen > 0 && qTo >= qFrom) coverage = Math.round(Math.min(100, ((qTo - qFrom + 1) / qLen) * 100)) + "%";
      evalue = ev ? (bits ? `${ev} / ${Math.round(parseFloat(bits))}` : ev) : "";
    }
    results.push({ queryName: qDef, taxon: extractTaxonFromDef(hitDef), accession, identity, coverage, evalue, marker: detectMarkerFromDef(hitDef) });
  }
  return results;
}

function parseBlastHitTable(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("#")), seen = new Set(), results = [];
  for (const line of lines) {
    const cols = line.includes("\t") ? line.split("\t") : line.split(",");
    if (cols.length < 11) continue;
    const qName = cols[0].replace(/^"|"$/g, "").trim();
    if (seen.has(qName)) continue; seen.add(qName);
    results.push({ queryName: qName, taxon: cols[1].replace(/^"|"$/g, "").trim(), accession: cols[1].replace(/^"|"$/g, "").trim(), identity: parseFloat(cols[2]).toFixed(2) + "%", coverage: "", evalue: `${cols[10]} / ${Math.round(parseFloat(cols[11] || "0"))}`, marker: "" });
  }
  return results;
}

/* ==========================================================================
   15. MODALS: PRIMERS, NOTES + GENBANK, BLAST, GOTO, PRO (UPI), SHORTCUTS
   ========================================================================== */
function openModal(id) { document.getElementById(id).classList.add("show"); }
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

function openPrimerModal() {
  document.getElementById("simThreshSlider").value = state.settings.simThreshold;
  document.getElementById("simThreshVal").textContent = state.settings.simThreshold;
  document.getElementById("trimQInput").value = state.settings.trimQ;
  document.getElementById("consMinConfInput").value = state.settings.consMinConf ?? 20;
  document.getElementById("minPeakFracInput").value = Math.round((state.settings.minPeakFrac ?? 0.14) * 100);
  document.getElementById("clipPrimerSeqsInput").value = (state.settings.clipPrimerSeqs || []).join("\n");
  renderCustomPrimerLists();
  document.getElementById("builtinPrimerSummary").textContent =
    `Forward (${BUILTIN_PRIMERS.F.length}): ${BUILTIN_PRIMERS.F.join(", ")}\n\nReverse (${BUILTIN_PRIMERS.R.length}): ${BUILTIN_PRIMERS.R.join(", ")}`;
  openModal("primerModal");
}

function saveClipPrimerSeqs() {
  state.settings.clipPrimerSeqs = (document.getElementById("clipPrimerSeqsInput").value || "").split(/\r?\n/).map(s => s.trim().toUpperCase().replace(/[^ACGTNRYSWKMBDHV]/g, "")).filter(Boolean);
  saveSettings(); persistDB();
}

function renderCustomPrimerLists() {
  document.getElementById("customFwdList").innerHTML = state.settings.customF.map((p, i) => `<span class="tag-chip">${escapeHtml(p)}<button onclick="removeCustomPrimer('F',${i})">×</button></span>`).join("") || '<span class="hint-text">None yet</span>';
  document.getElementById("customRevList").innerHTML = state.settings.customR.map((p, i) => `<span class="tag-chip">${escapeHtml(p)}<button onclick="removeCustomPrimer('R',${i})">×</button></span>`).join("") || '<span class="hint-text">None yet</span>';
}

function addCustomPrimer(dir) {
  const inp = document.getElementById(dir === "F" ? "newFwdPrimer" : "newRevPrimer"), val = inp.value.trim();
  if (!val) return;
  const arr = dir === "F" ? state.settings.customF : state.settings.customR;
  if (!arr.includes(val)) arr.push(val);
  inp.value = ""; saveSettings(); persistDB(); renderCustomPrimerLists();
}

function removeCustomPrimer(dir, idx) { (dir === "F" ? state.settings.customF : state.settings.customR).splice(idx, 1); saveSettings(); persistDB(); renderCustomPrimerLists(); }

let notesTargetId = null;
function switchNotesTab(tab) {
  document.querySelectorAll(".modal-subtab").forEach(b => b.classList.toggle("active", b.dataset.ntab === tab));
  document.getElementById("notesTabBlast").style.display = tab === "blast" ? "block" : "none";
  document.getElementById("notesTabGenbank").style.display = tab === "genbank" ? "block" : "none";
}

function openNotesModal(id) {
  const obj = state.groups[id] || state.samples[id]; if (!obj) return;
  notesTargetId = id;
  const n = { ...emptyNotes(), ...(obj.notes || {}) };
  document.getElementById("noteTaxon").value = n.taxon;
  document.getElementById("noteAccession").value = n.accession;
  document.getElementById("noteIdentity").value = n.identity;
  document.getElementById("noteCoverage").value = n.coverage;
  document.getElementById("noteEvalue").value = n.evalue;
  document.getElementById("noteMarker").value = n.marker;
  document.getElementById("noteText").value = n.text;
  document.getElementById("noteStrain").value = n.strain;
  document.getElementById("noteIsolate").value = n.isolate;
  document.getElementById("noteIsolationSource").value = n.isolationSource;
  document.getElementById("noteHost").value = n.host;
  document.getElementById("noteGeoLoc").value = n.geoLoc;
  document.getElementById("noteCollectionDate").value = n.collectionDate;
  document.getElementById("noteCollectedBy").value = n.collectedBy;
  document.getElementById("noteVoucher").value = n.voucher;
  switchNotesTab("blast"); openModal("notesModal");
  document.getElementById("noteTaxon").focus();
}

function saveNotesModal() {
  const obj = state.groups[notesTargetId] || state.samples[notesTargetId]; if (!obj) return;
  obj.notes = {
    taxon: document.getElementById("noteTaxon").value.trim(),
    accession: document.getElementById("noteAccession").value.trim(),
    identity: document.getElementById("noteIdentity").value.trim(),
    coverage: document.getElementById("noteCoverage").value.trim(),
    evalue: document.getElementById("noteEvalue").value.trim(),
    marker: document.getElementById("noteMarker").value.trim(),
    text: document.getElementById("noteText").value.trim(),
    strain: document.getElementById("noteStrain").value.trim(),
    isolate: document.getElementById("noteIsolate").value.trim(),
    isolationSource: document.getElementById("noteIsolationSource").value.trim(),
    host: document.getElementById("noteHost").value.trim(),
    geoLoc: document.getElementById("noteGeoLoc").value.trim(),
    collectionDate: document.getElementById("noteCollectionDate").value.trim(),
    collectedBy: document.getElementById("noteCollectedBy").value.trim(),
    voucher: document.getElementById("noteVoucher").value.trim()
  };
  closeModal("notesModal"); renderTable(); persistDB();
  toast("Saved BLAST notes & GenBank modifiers", "success");
}

function applyGenBankCommonToAll() {
  const items = getExportItems(true);
  if (!items.length) { toast('No "Use"-checked samples found', "warn"); return; }
  const common = {
    isolationSource: document.getElementById("noteIsolationSource").value.trim(),
    host: document.getElementById("noteHost").value.trim(),
    geoLoc: document.getElementById("noteGeoLoc").value.trim(),
    collectionDate: document.getElementById("noteCollectionDate").value.trim(),
    collectedBy: document.getElementById("noteCollectedBy").value.trim()
  };
  for (const it of items) {
    it.notes = { ...emptyNotes(), ...(it.notes || {}) };
    if (common.isolationSource) it.notes.isolationSource = common.isolationSource;
    if (common.host) it.notes.host = common.host;
    if (common.geoLoc) it.notes.geoLoc = common.geoLoc;
    if (common.collectionDate) it.notes.collectionDate = common.collectionDate;
    if (common.collectedBy) it.notes.collectedBy = common.collectedBy;
  }
  persistDB(); toast(`Applied common GenBank fields to ${items.length} checked sample(s)`, "success");
}

function openBlastModal() {
  const item = getActiveItem(); if (!item) return;
  document.getElementById("blastSeqPreview").textContent = `>${item.name}\n${getEffectiveConsensus(item).seq}`;
  openModal("blastModal");
}

function executeBlastLaunch(useUrlFallback = false) {
  const item = getActiveItem(); if (!item) return;
  const eff = getEffectiveConsensus(item), db = document.getElementById("blastDbSelect").value, fasta = `>${item.name}\n${eff.seq}`;
  navigator.clipboard.writeText(fasta).catch(() => {});

  if (!useUrlFallback) {
    try {
      const form = document.createElement("form");
      form.method = "POST"; form.action = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"; form.target = "_blank"; form.style.display = "none";
      for (const [k, v] of Object.entries({ CMD: "Web", PAGE_TYPE: "BlastSearch", PROGRAM: "blastn", BLAST_PROGRAMS: "megaBlast", DATABASE: db, QUERY: fasta, JOB_TITLE: item.name })) {
        const inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; inp.value = v; form.appendChild(inp);
      }
      document.body.appendChild(form); form.submit(); form.remove();
      closeModal("blastModal"); toast("Submitted to NCBI BLASTn in new tab (sequence copied)", "success"); return;
    } catch (e) {}
  }
  window.open(`https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&DATABASE=${encodeURIComponent(db)}&QUERY=${encodeURIComponent(eff.seq.slice(0, 1800))}`, "_blank", "noopener");
  closeModal("blastModal"); toast("Opened NCBI BLASTn via URL fallback (sequence copied)", "success");
}

function downloadCurrentFasta() { const item = getActiveItem(); if (item) downloadText(`${item.name.replace(/[^\w\-]+/g, "_")}.fasta`, `>${item.name}\n${getEffectiveConsensus(item).seq}\n`); }
function openGotoModal() { openModal("gotoModal"); const inp = document.getElementById("gotoInput"); inp.value = state.viewer.cursor + 1; inp.focus(); inp.select(); }
function executeGoto() { const ctxData = getViewerContextData(); if (!ctxData) return; const v = parseInt(document.getElementById("gotoInput").value); if (Number.isFinite(v)) { state.viewer.cursor = Math.max(0, Math.min(ctxData.baseSeq.length - 1, v - 1)); scrollCursorIntoView(); } closeModal("gotoModal"); }

function openProModal() {
  const pro = isPro();
  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_CONFIG.upiId)}&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}&am=${UPI_CONFIG.amount}&cu=INR&tn=${encodeURIComponent("SangBase Pro - YourEmailHere")}`;
  const qrHtml = UPI_CONFIG.qrImageDataUrl
    ? `<img src="${UPI_CONFIG.qrImageDataUrl}" alt="UPI QR" style="width:140px;height:140px;border-radius:8px;background:#fff;padding:6px;" />`
    : `<div style="width:140px;height:140px;border-radius:8px;border:1px dashed var(--border-strong);display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;color:var(--text-muted);padding:8px;">Set <code>UPI_CONFIG.qrImageDataUrl</code> in app.js to show your QR image</div>`;

  document.getElementById("proStatusBanner").innerHTML = pro
    ? `<strong>Pro License Active!</strong> Key: <code>${escapeHtml(localStorage.getItem("sangbase_pro_key"))}</code>`
    : `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
         ${qrHtml}
         <div style="flex:1;min-width:210px;line-height:1.5;">
           <div><strong>Pay ₹${UPI_CONFIG.amount} One-Time via UPI:</strong></div>
           <div class="btn-row-tight" style="margin:5px 0;">
             <code style="font-size:13px;padding:3px 6px;background:var(--bg-app);border-radius:4px;">${escapeHtml(UPI_CONFIG.upiId)}</code>
             <button class="btn-sm" onclick="navigator.clipboard.writeText('${escapeHtml(UPI_CONFIG.upiId)}'); toast('Copied UPI ID','success');">Copy UPI</button>
             <a class="btn btn-sm btn-primary" href="${upiLink}">Pay App</a>
           </div>
           <div style="font-size:11px;"><strong>Important:</strong> Write your <b>Email ID</b> in the UPI payment note/remarks. Your <code>SBPRO</code> serial key will be emailed directly.</div>
         </div>
       </div>`;
  document.getElementById("proDeactivateWrap").style.display = pro ? "block" : "none";
  openModal("proModal");
}

function activateProKey() {
  const key = document.getElementById("proKeyInput").value.trim().toUpperCase();
  if (validateProKey(key)) { localStorage.setItem("sangbase_pro_key", key); updateProUI(); closeModal("proModal"); toast("SangBase Pro activated!", "success"); }
  else toast("Invalid serial key. Expected valid SBPRO-XXXX-XXXX-XXXX key.", "error");
}
function deactivateProKey() { localStorage.removeItem("sangbase_pro_key"); updateProUI(); closeModal("proModal"); toast("Pro license removed from this browser.", "warn"); }
function openShortcutsModal() { openModal("shortcutsModal"); }

/* ==========================================================================
   16. CHUNKED BULK FILE IMPORT / EXPORT & DRAG-AND-DROP
   ========================================================================== */
async function handleFiles(fileList) {
  const files = Array.from(fileList || []); if (!files.length) return;
  const ab1Files = files.filter(f => f.name.toLowerCase().endsWith(".ab1"));
  const jsonFiles = files.filter(f => f.name.toLowerCase().endsWith(".json"));
  const xmlFiles = files.filter(f => f.name.toLowerCase().endsWith(".xml"));

  for (const jf of jsonFiles) { try { deserializeProject(JSON.parse(await jf.text())); toast(`Opened project ${jf.name}`, "success"); } catch (e) { toast(`Invalid project JSON: ${e.message}`, "error"); } }
  for (const xf of xmlFiles) { if (isPro()) await importBlastResultsFile(xf); else toast("BLAST XML auto-import is a Pro feature.", "warn"); }
  if (!ab1Files.length) return;

  const progressToast = document.createElement("div");
  progressToast.className = "toast"; progressToast.textContent = `Importing 0 / ${ab1Files.length} .ab1 files...`;
  document.getElementById("toastContainer").appendChild(progressToast);

  let ok = 0, failed = 0;
  for (let i = 0; i < ab1Files.length; i += 15) {
    const results = await Promise.all(ab1Files.slice(i, i + 15).map(async file => {
      try { return { ok: true, smp: parseAB1(await file.arrayBuffer(), file.name) }; } catch (err) { return { ok: false }; }
    }));
    for (const r of results) { if (r.ok) { state.samples[r.smp.id] = r.smp; state.order.push({ type: "sample", id: r.smp.id }); ok++; } else failed++; }
    progressToast.textContent = `Importing ${Math.min(i + 15, ab1Files.length)} / ${ab1Files.length} .ab1 files...`;
    await new Promise(res => requestAnimationFrame(res));
  }
  progressToast.remove(); renderTable(); persistDB();
  toast(`Imported ${ok} .ab1 file(s)${failed ? ` (${failed} failed)` : ""}. Press Ctrl+M to Auto-Group.`, failed ? "warn" : "success");
}

document.getElementById("fileInputAb1").addEventListener("change", e => { handleFiles(e.target.files); e.target.value = ""; });
document.getElementById("fileInputProj").addEventListener("change", e => { handleFiles(e.target.files); e.target.value = ""; });

let dragDepth = 0;
window.addEventListener("dragenter", e => { e.preventDefault(); dragDepth++; document.getElementById("dropOverlay").classList.add("show"); });
window.addEventListener("dragover", e => e.preventDefault());
window.addEventListener("dragleave", () => { dragDepth--; if (dragDepth <= 0) { dragDepth = 0; document.getElementById("dropOverlay").classList.remove("show"); } });
window.addEventListener("drop", e => { e.preventDefault(); dragDepth = 0; document.getElementById("dropOverlay").classList.remove("show"); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); });

function newProject() {
  if (state.order.length && !confirm("Start a new empty project?")) return;
  state.projectName = "Untitled Sanger Project"; document.getElementById("projectNameInput").value = state.projectName;
  state.samples = {}; state.groups = {}; state.order = []; state.selectedIds.clear(); state.activeItemId = null; state.activeItemType = null;
  renderTable(); renderViewer(); persistDB();
}

function saveProjectDownload(saveAs = false) {
  let name = state.projectName;
  if (saveAs) { const n = prompt("Save project as:", name); if (!n) return; name = n.trim(); state.projectName = name; document.getElementById("projectNameInput").value = name; }
  persistDB();
  downloadText(`${name.replace(/[^\w\-]+/g, "_")}.sangbase.json`, JSON.stringify(serializeProject(), null, 2));
  toast("Saved project to .sangbase.json & IndexedDB", "success");
}

function downloadText(filename, content) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" })); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next); localStorage.setItem("sangbase_theme", next);
  document.getElementById("themeBtn").textContent = next === "dark" ? "Light" : "Dark";
  renderMainCanvas(); renderMinimap();
}

function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
function toast(msg, type = "info") { const el = document.createElement("div"); el.className = "toast " + type; el.textContent = msg; document.getElementById("toastContainer").appendChild(el); setTimeout(() => el.remove(), 3500); }

/* ==========================================================================
   17. CONTEXT-AWARE KEYBOARD SHORTCUTS (INPUT FOCUS SAFE)
   ========================================================================== */
document.addEventListener("keydown", e => {
  const tag = (document.activeElement?.tagName || "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) {
    if (e.key === "Escape") { if (document.activeElement.id === "findInput") closeFindBar(); else document.activeElement.blur(); }
    return;
  }
  const openMod = document.querySelector(".modal-backdrop.show");
  if (openMod) { if (e.key === "Escape") openMod.classList.remove("show"); return; }

  const ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey, k = e.key, kl = k.toLowerCase();
  const inViewer = document.activeElement === document.getElementById("canvasViewport") || (state.activeItemId && document.activeElement !== document.getElementById("tableWrap"));

  if (k === "F1" || (k === "?" && !ctrl)) { e.preventDefault(); openShortcutsModal(); return; }
  if (ctrl && kl === "n") { e.preventDefault(); newProject(); return; }
  if (ctrl && kl === "o") { e.preventDefault(); document.getElementById("fileInputProj").click(); return; }
  if (ctrl && kl === "s") { e.preventDefault(); saveProjectDownload(shift); return; }
  if (ctrl && kl === "i") { e.preventDefault(); document.getElementById("fileInputAb1").click(); return; }
  if (ctrl && shift && kl === "e") { e.preventDefault(); exportBatchFasta(true); return; }
  if (ctrl && shift && kl === "x") { e.preventDefault(); exportBatchFasta(false); return; }
  if (ctrl && k === ",") { e.preventDefault(); openPrimerModal(); return; }
  if (ctrl && kl === "m") { e.preventDefault(); autoGroupSamples(); return; }
  if (ctrl && k === "]") { e.preventDefault(); toggleAllGroups(true); return; }
  if (ctrl && k === "[") { e.preventDefault(); toggleAllGroups(false); return; }
  if (ctrl && ["1","2","3","4"].includes(k)) { e.preventDefault(); sortTable({ "1":"name", "2":"notes", "3":"status", "4":"use" }[k]); return; }

  if (!inViewer) {
    if (ctrl && !shift && kl === "g") { e.preventDefault(); groupSelected(); return; }
    if (ctrl && shift && kl === "g") { e.preventDefault(); ungroupSelected(); return; }
    if (ctrl && kl === "r") { e.preventDefault(); swapSelectedDirection(); return; }
    if (ctrl && kl === "e") { e.preventDefault(); const first = Array.from(state.selectedIds)[0]; if (first) openNotesModal(first); return; }
    if (k === "F2") { e.preventDefault(); const first = Array.from(state.selectedIds)[0]; if (first && state.groups[first]) renameGroup(first); return; }
    if (k === "F5") { e.preventDefault(); if (shift) generateConsensusAll(); else generateConsensusSelected(); return; }
    if (k === "Delete") { e.preventDefault(); if (ctrl) clearSavedConsensusSelected(); else deleteSelectedTableItems(); return; }
    if (ctrl && kl === "a") { e.preventDefault(); state.selectedIds.clear(); for (const o of state.order) state.selectedIds.add(o.id); renderTable(); return; }
    if (k === "Escape") { state.selectedIds.clear(); renderTable(); return; }
    if (k === "Enter") { const first = Array.from(state.selectedIds)[0]; if (first) openInViewer(state.groups[first] ? "group" : "sample", first); return; }
    return;
  }

  const ctxData = getViewerContextData(); if (!ctxData) return;
  const maxPos = Math.max(0, ctxData.baseSeq.length - 1);

  if (ctrl && kl === "f") { e.preventDefault(); toggleFindBar(); return; }
  if (ctrl && !shift && kl === "t") { e.preventDefault(); autoTrimCurrent(); return; }
  if (ctrl && shift && kl === "t") { e.preventDefault(); copyTrimmedConsensus(); return; }
  if (k === "F3") { e.preventDefault(); stepFind(shift ? -1 : 1); return; }
  if (ctrl && (k === "+" || k === "=")) { e.preventDefault(); adjustZoom(2); return; }
  if (ctrl && k === "-") { e.preventDefault(); adjustZoom(-2); return; }
  if (ctrl && k === "0") { e.preventDefault(); resetZoom(); return; }
  if (!ctrl && ["1","2","3","4","5"].includes(k)) { e.preventDefault(); setViewMode(parseInt(k)); return; }
  if (ctrl && kl === "g") { e.preventDefault(); openGotoModal(); return; }
  if (ctrl && kl === "e") { e.preventDefault(); openNotesModal(state.activeItemId); return; }
  if (k === "F8") { e.preventDefault(); jumpNextIssue("N", shift ? -1 : 1); return; }
  if (k === "F7") { e.preventDefault(); jumpNextIssue("lowQ", shift ? -1 : 1); return; }
  if ((ctrl && k === "ArrowLeft") || k === "[") { e.preventDefault(); jumpNextIssue("mismatch", -1); return; }
  if ((ctrl && k === "ArrowRight") || k === "]") { e.preventDefault(); jumpNextIssue("mismatch", 1); return; }
  if (ctrl && k === "ArrowUp") { e.preventDefault(); state.viewer.activeRow = (state.viewer.activeRow + 2) % 3; renderViewer(); return; }
  if (ctrl && k === "ArrowDown") { e.preventDefault(); state.viewer.activeRow = (state.viewer.activeRow + 1) % 3; renderViewer(); return; }
  if (!ctrl && k === "ArrowUp") { e.preventDefault(); adjustAmp(0.15); return; }
  if (!ctrl && k === "ArrowDown") { e.preventDefault(); adjustAmp(-0.15); return; }

  if (!ctrl && (k === "ArrowLeft" || k === "ArrowRight" || k === "Home" || k === "End")) {
    e.preventDefault(); const prev = state.viewer.cursor;
    if (k === "ArrowLeft") state.viewer.cursor = Math.max(0, prev - 1);
    else if (k === "ArrowRight") state.viewer.cursor = Math.min(maxPos, prev + 1);
    else if (k === "Home") state.viewer.cursor = 0;
    else if (k === "End") state.viewer.cursor = maxPos;
    if (shift) { if (state.viewer.selStart === null) state.viewer.selStart = prev; state.viewer.selEnd = state.viewer.cursor; }
    else { state.viewer.selStart = null; state.viewer.selEnd = null; }
    updateSelectionBar(); scrollCursorIntoView(); return;
  }

  if (ctrl && kl === "z" && !shift) { e.preventDefault(); undoEdit(); return; }
  if ((ctrl && kl === "y") || (ctrl && shift && kl === "z")) { e.preventDefault(); redoEdit(); return; }
  if (ctrl && kl === "a") { e.preventDefault(); state.viewer.selStart = 0; state.viewer.selEnd = maxPos; updateSelectionBar(); renderMainCanvas(); return; }
  if (ctrl && kl === "c") { e.preventDefault(); copySelectedBases(shift); return; }
  if (ctrl && kl === "x") { e.preventDefault(); copySelectedBases(false); deleteSelectedBases(); return; }
  if (ctrl && kl === "v") {
    e.preventDefault();
    navigator.clipboard.readText().then(txt => {
      const clean = txt.toUpperCase().replace(/[^ACGTNWSMKRYBDHV]/g, ""); if (!clean) return;
      const item = getActiveItem(); pushUndo(item);
      for (let i = 0; i < clean.length && state.viewer.cursor + i <= maxPos; i++) { item.edits[state.viewer.cursor + i] = clean[i]; item.deleted.delete(state.viewer.cursor + i); }
      state.viewer.cursor = Math.min(maxPos, state.viewer.cursor + clean.length);
      item.savedConsensus = getEffectiveConsensus(item).seq;
      runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    });
    return;
  }

  if (k === "Escape") { clearSelection(); closeFindBar(); return; }
  if (k === "Delete") { e.preventDefault(); deleteSelectedBases(); return; }
  if (k === "Backspace") {
    e.preventDefault();
    if (getSelectionRange()) deleteSelectedBases();
    else if (state.viewer.cursor > 0) {
      state.viewer.cursor--; const item = getActiveItem(); pushUndo(item); item.deleted.add(state.viewer.cursor);
      item.savedConsensus = getEffectiveConsensus(item).seq; scrollCursorIntoView(); renderTable(); persistDB();
    }
    return;
  }
  if (k === " ") { e.preventDefault(); editConsensusAt(state.viewer.cursor, "-"); state.viewer.cursor = Math.min(maxPos, state.viewer.cursor + 1); scrollCursorIntoView(); return; }

  if (!ctrl && (kl === "f" || kl === "r")) {
    const col = ctxData.cols[state.viewer.cursor];
    if (col) {
      const ch = kl === "f" ? (ctxData.fwd && col.fIdx >= 0 ? ctxData.fwd.seq[col.fIdx] : null) : (ctxData.revRC && col.rIdx >= 0 ? ctxData.revRC.seq[col.rIdx] : null);
      if (ch) { e.preventDefault(); editConsensusAt(state.viewer.cursor, ch); state.viewer.cursor = Math.min(maxPos, state.viewer.cursor + 1); scrollCursorIntoView(); return; }
    }
  }

  if (!ctrl && k.length === 1 && IUPAC_CODES.has(k.toUpperCase())) {
    e.preventDefault(); editConsensusAt(state.viewer.cursor, k.toUpperCase());
    state.viewer.cursor = Math.min(maxPos, state.viewer.cursor + 1); scrollCursorIntoView();
  }
});

/* ==========================================================================
   18. BOOTSTRAP
   ========================================================================== */
loadSettings();
updateProUI();
restoreDB();
renderTable();