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

const BUILTIN_GENES = [
  "16S", "ITS", "LSU", "28S", "SSU", "18S",
  "TEF1-a", "TEF1", "TUB2", "benA", "rpoB", "gyrB", "recA", "COI", "COX1", "ACT", "CaM", "RPB1", "RPB2", "BRCA1"
];

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
    customGenes: [],
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
    if (!Array.isArray(state.settings.customGenes)) state.settings.customGenes = [];
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
    format: "sangbase.project.v2.1",
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
    // Auto-migrate older v1/v2 projects (fwdId/revId -> memberIds)
    const memberIds = Array.isArray(g.memberIds) ? g.memberIds : [g.fwdId, g.revId].filter(Boolean);
    const needsRebuild = g.alignment && g.alignment.cols && g.alignment.cols.length && !Array.isArray(g.alignment.cols[0]);
    state.groups[id] = {
      ...g,
      memberIds,
      gene: g.gene || "",
      deleted: new Set(g.deleted || []),
      edits: g.edits || {},
      undoStack: [], redoStack: []
    };
    if (needsRebuild) buildGroupAlignmentAndConsensus(state.groups[id]);
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
  const gene = detectGeneFromFilename(fileName);

  const smp = {
    id: uid("smp"), fileName, name: fileName.replace(/\.ab1$/i, ""), smplTag: smplName,
    direction: detected.dir || "F", detectedPrimer: detected.primer || "", gene,
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
   5. SYNTHETIC BINARY .AB1 WRITER & STANDARD DEMO DATA (INCLUDES 3-READ CONTIG)
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

  // 2. 3-Read Microbial 16S rRNA Contig (27F + 518F internal primer walk + 1492R with noisy ends & 1 bp indel)
  const microbialCore =
    "AGAGTTTGATCCTGGCTCAGGACGAACGCTGGCGGCGTGCCTAATACATGCAAGTCGA" +
    "GCGGACAGATGGGAGCTTGCTCCCTGATGTTAGCGGCGGACGGGTGAGTAACACGTGG" +
    "GTAACCTGCCTGTAAGACTGGGATAACTCCGGGAAACCGGGGCTAATACCGGATGGTT" +
    "GTTTGAACCGCATGGTTCAAACATAAAAGGTGGCTTCGGCTACCACTTACAGATGGAC";
  const mFwd1 = "NNGTCGTACGTACGTA" + microbialCore.slice(0, 155) + "TCGANNTG";
  const mFwd2 = microbialCore.slice(60, 210);
  const mCoreDel = microbialCore.slice(20, 95) + microbialCore.slice(96, 195);
  const mRevArr = revComp(mCoreDel).split("");
  mRevArr[40] = mRevArr[40] === "A" ? "G" : "A";
  const mRev = "NNATCGATGCTAGC" + mRevArr.join("") + "GGNNTT";

  // 3. Intentionally mismatched fungal ITS pair
  const misF = "ATGCGTACGTTAGCTAGCTAGGCTAGCTAGCTAGCGATCGATCGATCGTAGCTAGCTAGCATCGATCGTAGCTAGCTAGCTAGCATCGATCGTAGC";
  const misR = "GGGGCCCCAAAATTTTGGCCAATTGGCCAATTGGCCAATTCCGGTTAACCGGTTAACCGGTTAACCGGAATTCCGGAATTCCGGAATTCCGGAATT";

  const demoFiles = [
    { name: "BRCA1_Ex11_M13F.ab1", buf: generateSyntheticAB1("BRCA1_Ex11_M13F", brcaF, { hets: { 48: "G", 92: "T" } }) },
    { name: "BRCA1_Ex11_M13R.ab1", buf: generateSyntheticAB1("BRCA1_Ex11_M13R", brcaR, { hets: { 72: "A", 116: "C" } }) },
    { name: "Bacillus_16S_Iso01_27F_E05.ab1", buf: generateSyntheticAB1("Bacillus_16S_Iso01_27F", mFwd1, { noisyEnds: true }) },
    { name: "Bacillus_16S_Iso01_518F_E06.ab1", buf: generateSyntheticAB1("Bacillus_16S_Iso01_518F", mFwd2, {}) },
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
        marker: "16S ribosomal RNA", text: "3-read demo contig (2F+1R) with noisy ends & 1 bp indel",
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
  toast("Loaded 3 demo contigs (including a 3-read 2F+1R 16S contig)!", "success");
}

/* ==========================================================================
   6. PROGRESSIVE N-READ ALIGNMENT, BAYESIAN CONSENSUS & LOSSLESS FLIP
   ========================================================================== */
function revComp(seq) {
  let out = "";
  for (let i = seq.length - 1; i >= 0; i--) out += COMPLEMENT_MAP[seq[i]] || "N";
  return out;
}

/**
 * Returns a read oriented according to its direction (F as-is, R reverse-complemented)
 * AND sliced to its individual trimmed range [trimStart, trimEnd) so per-strand trimming
 * feeds directly into contig assembly.
 */
function getOrientedTrimmedSample(s) {
  const fullLen = s.seq.length;
  const tStart = Math.max(0, Math.min(fullLen, s.trimStart || 0));
  const tEnd = Math.max(tStart, Math.min(fullLen, s.trimEnd !== undefined ? s.trimEnd : fullLen));
  const isRev = s.direction === "R";

  if (!isRev) {
    return {
      id: s.id, name: s.name, direction: s.direction, origSample: s,
      seq: s.seq.slice(tStart, tEnd),
      traces: s.traces,
      ploc: s.ploc.slice(tStart, tEnd),
      pcon: s.pcon.slice(tStart, tEnd),
      normHeight: s.normHeight,
      trimOffset: tStart
    };
  }

  const n = s.traces.A.length;
  const rcTraces = { A: new Int16Array(n), T: new Int16Array(n), G: new Int16Array(n), C: new Int16Array(n) };
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    rcTraces.A[i] = s.traces.T[j]; rcTraces.T[i] = s.traces.A[j];
    rcTraces.G[i] = s.traces.C[j]; rcTraces.C[i] = s.traces.G[j];
  }
  const sliceLen = tEnd - tStart;
  const rcPloc = new Int32Array(sliceLen);
  const rcPcon = new Uint8Array(sliceLen);
  for (let i = 0; i < sliceLen; i++) {
    const origIdx = tEnd - 1 - i;
    rcPloc[i] = Math.max(0, Math.min(n - 1, (n - 1) - s.ploc[origIdx]));
    rcPcon[i] = s.pcon[origIdx];
  }
  return {
    id: s.id, name: s.name, direction: s.direction, origSample: s,
    seq: revComp(s.seq.slice(tStart, tEnd)),
    traces: rcTraces,
    ploc: rcPloc,
    pcon: rcPcon,
    normHeight: s.normHeight,
    trimOffset: tStart
  };
}

function alignForwardReverse(seqA, seqB) {
  const m = seqA.length, n = seqB.length;
  if (m === 0 || n === 0) return { cols: [], overlapLen: 0, identity: 0, isMismatch: true };

  const match = 2, mismatch = -2, gap = -3, W = n + 1;
  const dp = new Int16Array((m + 1) * W), tb = new Uint8Array((m + 1) * W);

  for (let i = 1; i <= m; i++) {
    const rowOff = i * W, prevOff = (i - 1) * W, cA = seqA.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const sc = cA === seqB.charCodeAt(j - 1) ? match : mismatch;
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
      overlapLen++; if (seqA[i - 1] === seqB[j - 1] && seqA[i - 1] !== "N") matches++;
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
  const rawMembers = (group.memberIds || []).map(id => state.samples[id]).filter(Boolean);
  if (!rawMembers.length) return;

  const oriented = rawMembers.map(s => getOrientedTrimmedSample(s));
  const N = oriented.length;
  const minConf = state.settings.consMinConf ?? 20;
  const minPeakFrac = state.settings.minPeakFrac ?? 0.14;

  let seedIdx = 0;
  for (let i = 1; i < N; i++) if (oriented[i].seq.length > oriented[seedIdx].seq.length) seedIdx = i;

  let cols = [];
  for (let i = 0; i < oriented[seedIdx].seq.length; i++) {
    const row = new Array(N).fill(-1);
    row[seedIdx] = i;
    cols.push(row);
  }

  let minOverlap = Infinity, minIdentity = 100;
  const mismatchedReads = [];

  for (let r = 0; r < N; r++) {
    if (r === seedIdx) continue;
    let runSeq = "";
    for (let c = 0; c < cols.length; c++) {
      let bestB = "N", bestQ = -1;
      for (let k = 0; k < N; k++) {
        const idx = cols[c][k];
        if (idx >= 0) {
          const q = oriented[k].pcon[idx] || 0;
          if (q > bestQ) { bestQ = q; bestB = oriented[k].seq[idx]; }
        }
      }
      runSeq += bestB;
    }

    const aln = alignForwardReverse(runSeq, oriented[r].seq);
    if (aln.overlapLen < minOverlap) minOverlap = aln.overlapLen;
    if (aln.identity < minIdentity) minIdentity = aln.identity;
    if (aln.isMismatch) mismatchedReads.push(`${oriented[r].name} (${aln.overlapLen} bp, ${aln.identity.toFixed(0)}%)`);

    const newCols = [];
    for (const pair of aln.cols) {
      const row = pair.fIdx >= 0 ? [...cols[pair.fIdx]] : new Array(N).fill(-1);
      row[r] = pair.rIdx;
      newCols.push(row);
    }
    cols = newCols;
  }
  if (N === 1) { minOverlap = 0; minIdentity = 100; }

  let ovStart = cols.length, ovEnd = -1;
  for (let c = 0; c < cols.length; c++) {
    let cov = 0;
    for (let r = 0; r < N; r++) if (cols[c][r] >= 0) cov++;
    if (cov >= 2) { if (c < ovStart) ovStart = c; if (c > ovEnd) ovEnd = c; }
  }

  const cons = [], consQ = [];
  for (let c = 0; c < cols.length; c++) {
    const inOverlap = c >= ovStart && c <= ovEnd;
    const baseScores = { A: 0, C: 0, G: 0, T: 0 };
    let presentCount = 0, validCount = 0, singleReadIdx = -1, singleQ = 0, singleB = "N";

    for (let r = 0; r < N; r++) {
      const bIdx = cols[c][r];
      if (bIdx < 0) continue;
      presentCount++;
      singleReadIdx = r;
      const b = oriented[r].seq[bIdx].toUpperCase();
      const valid = isValidTracePeak(oriented[r], bIdx, b, minPeakFrac);
      const q = valid ? (oriented[r].pcon[bIdx] || 0) : 0;
      singleQ = q; singleB = b;
      if (valid && "ACGT".includes(b)) { baseScores[b] += q; validCount++; }
    }

    if (presentCount === 0) {
      cons.push("-"); consQ.push(0);
    } else if (presentCount === 1 && N > 1 && inOverlap) {
      let oppFlankSum = 0, oppFlankCnt = 0;
      for (let r = 0; r < N; r++) {
        if (r === singleReadIdx) continue;
        for (const d of [-2, -1, 1, 2]) {
          const k = c + d;
          if (k >= 0 && k < cols.length && cols[k][r] >= 0) {
            oppFlankSum += oriented[r].pcon[cols[k][r]] || 0; oppFlankCnt++;
          }
        }
      }
      const oppFlankQ = oppFlankCnt ? oppFlankSum / oppFlankCnt : 0;
      if (validCount === 0 || singleQ < oppFlankQ) { cons.push("-"); consQ.push(0); }
      else { cons.push(singleQ >= minConf ? singleB : "N"); consQ.push(singleQ); }
    } else if (presentCount === 1) {
      cons.push(validCount > 0 ? singleB : "N");
      consQ.push(singleQ);
    } else {
      const ranked = Object.entries(baseScores).sort((a, b) => b[1] - a[1]);
      const [topB, topQ] = ranked[0], runnerQ = ranked[1][1];
      if (runnerQ === 0) {
        const qComb = Math.min(60, topQ);
        cons.push(qComb >= minConf ? topB : "N"); consQ.push(qComb);
      } else {
        const netQ = Math.min(60, topQ - runnerQ);
        cons.push(netQ >= minConf ? topB : "N"); consQ.push(netQ);
      }
    }
  }

  group.alignment = {
    cols,
    overlapLen: Number.isFinite(minOverlap) ? minOverlap : 0,
    identity: minIdentity,
    isMismatch: mismatchedReads.length > 0,
    mismatchedReads
  };
  group.baseConsensus = cons.join("");
  group.baseConsensusQ = consQ;
  group.trimStart = 0;
  group.trimEnd = cons.length;

  if (state.settings.autoTrim) {
    const b = computeQualityTrimBounds(group.baseConsensus, group.baseConsensusQ, state.settings.trimQ || 20, state.settings.trimWin || 10, state.settings.trimMinGood || 8);
    group.trimStart = b.start; group.trimEnd = b.end;
  }
  group.savedConsensus = getEffectiveConsensus(group).seq;
}

function flipActiveContigOrientation() {
  const item = getActiveItem();
  if (!item) return;

  if (state.activeItemType === "group") {
    flipContigOrientation(item.id);
  } else {
    pushUndo(item);
    const L = item.seq.length;
    const newEdits = {};
    for (const [k, v] of Object.entries(item.edits || {})) newEdits[L - 1 - parseInt(k)] = COMPLEMENT_MAP[v.toUpperCase()] || v;
    const newDel = new Set();
    for (const idx of (item.deleted || new Set())) newDel.add(L - 1 - idx);
    const oldStart = item.trimStart || 0, oldEnd = item.trimEnd !== undefined ? item.trimEnd : L;
    item.direction = item.direction === "F" ? "R" : "F";
    item.edits = newEdits; item.deleted = newDel;
    item.trimStart = L - oldEnd; item.trimEnd = L - oldStart;
    item.savedConsensus = getEffectiveConsensus(item).seq;
    runProAnalysesSilent(); renderTable(); renderViewer(); persistDB();
    toast(`Flipped ${item.name} to ${item.direction} (all manual edits preserved)`, "success");
  }
}

function flipContigOrientation(gid) {
  const g = state.groups[gid];
  if (!g || !g.alignment) return;
  const members = (g.memberIds || []).map(id => state.samples[id]).filter(Boolean);
  if (!members.length) return;

  pushUndo(g);
  const L = g.alignment.cols.length;
  const trimLens = members.map(s => {
    const tStart = Math.max(0, Math.min(s.seq.length, s.trimStart || 0));
    const tEnd = Math.max(tStart, Math.min(s.seq.length, s.trimEnd !== undefined ? s.trimEnd : s.seq.length));
    s.direction = s.direction === "F" ? "R" : "F";
    return tEnd - tStart;
  });

  const newCols = new Array(L);
  for (let c = 0; c < L; c++) {
    const oldRow = g.alignment.cols[L - 1 - c];
    newCols[c] = oldRow.map((idx, r) => (idx >= 0 ? (trimLens[r] - 1 - idx) : -1));
  }
  g.alignment.cols = newCols;
  g.baseConsensus = revComp(g.baseConsensus || "");
  g.baseConsensusQ = [...(g.baseConsensusQ || [])].reverse();

  const newEdits = {};
  for (const [k, v] of Object.entries(g.edits || {})) {
    const pos = parseInt(k);
    if (pos >= 0 && pos < L) newEdits[L - 1 - pos] = COMPLEMENT_MAP[v.toUpperCase()] || v;
  }
  const newDel = new Set();
  for (const idx of (g.deleted || new Set())) if (idx >= 0 && idx < L) newDel.add(L - 1 - idx);

  const oldStart = g.trimStart || 0, oldEnd = g.trimEnd !== undefined ? g.trimEnd : L;
  g.edits = newEdits; g.deleted = newDel;
  g.trimStart = Math.max(0, L - oldEnd); g.trimEnd = Math.min(L, L - oldStart);
  g.savedConsensus = getEffectiveConsensus(g).seq;

  runProAnalysesSilent(); renderTable(); renderViewer(); persistDB();
  toast(`Flipped contig "${g.name}" (RC) — all manual edits preserved!`, "success");
}

function getEffectiveConsensus(item) {
  const isGrp = item.alignment !== undefined;
  const baseSeq = isGrp ? (item.baseConsensus || "") : (item.direction === "R" ? revComp(item.seq) : item.seq);
  const baseQ = isGrp ? (item.baseConsensusQ || []) : (item.direction === "R" ? [...item.pcon].reverse() : item.pcon);
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
  const baseSeq = isGrp ? (item.baseConsensus || "") : (item.direction === "R" ? revComp(item.seq) : item.seq);
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
  const item = getActiveItem(); if (!item) return;
  const untrimmed = state.viewer.showUntrimmedConsensus;
  const seq = getConsensusSequenceText(item, untrimmed);
  const out = asFasta ? `>${item.name}${untrimmed ? "_untrimmed" : "_trimmed"}\n${seq}` : seq;
  navigator.clipboard.writeText(out).then(() => toast(`Copied ${seq.length} bp (${untrimmed ? "untrimmed" : "trimmed"}${asFasta ? " FASTA" : ""})`, "success"));
}

/* ==========================================================================
   7. PRIMER/VECTOR CLIPPING, CUSTOM GENES & MULTI-READ AUTO-GROUPING
   ========================================================================== */
function iupacToRegex(seq) { return new RegExp(seq.toUpperCase().split("").map(c => IUPAC_REGEX_MAP[c] || c).join(""), "i"); }

function clipPrimersCurrent() {
  const item = getActiveItem(); if (!item) return;
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
  rebuildParentGroupIfSample(item.id);
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
  toast(`Clipped ${clipped} primer/vector hit(s) → ${tStart + 1}–${tEnd}`, "success");
}

function getAllPrimers() { return { F: [...state.settings.customF, ...BUILTIN_PRIMERS.F], R: [...state.settings.customR, ...BUILTIN_PRIMERS.R] }; }
function getAllGenes() { return [...state.settings.customGenes, ...BUILTIN_GENES]; }
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function detectGeneFromFilename(fileName) {
  const base = fileName.replace(/\.ab1$/i, "");
  const genes = getAllGenes().sort((a, b) => b.length - a.length);
  for (const g of genes) {
    if (new RegExp("(?:^|[_\\-\\.\\s])" + escapeRegExp(g) + "(?:[_\\-\\.\\s]|$)", "i").test(base)) return g;
  }
  return "";
}

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
  if (s1.gene && s2.gene && s1.gene.toLowerCase() !== s2.gene.toLowerCase()) return 0;
  const c1 = cleanSampleCore(s1.fileName), c2 = cleanSampleCore(s2.fileName);
  if (c1.toLowerCase() === c2.toLowerCase() && c1.length > 0) return 1.0;
  const lcp = longestCommonPrefix(c1, c2).length / Math.max(1, Math.min(c1.length, c2.length));
  const tokDice = diceSets(new Set(c1.toLowerCase().split(/[_\-.\s]+/).filter(Boolean)), new Set(c2.toLowerCase().split(/[_\-.\s]+/).filter(Boolean)));
  const bgDice = diceSets(bigrams(c1), bigrams(c2));
  const lcsScore = (2 * lcsLen(c1, c2)) / Math.max(1, c1.length + c2.length);
  const oppBonus = s1.direction !== s2.direction ? 0.08 : 0.0;
  return Math.max(0, Math.min(1, 0.38 * lcp + 0.25 * tokDice + 0.18 * lcsScore + 0.19 * bgDice + oppBonus));
}

function suggestGroupNameMulti(samples) {
  if (!samples.length) return "Contig";
  if (samples.length === 1) return samples[0].name;
  let prefix = cleanSampleCore(samples[0].fileName);
  for (let i = 1; i < samples.length; i++) prefix = longestCommonPrefix(prefix, cleanSampleCore(samples[i].fileName));
  if (prefix.length >= 4) return prefix.replace(/[_\-.\s]+$/, "");
  let rawPre = samples[0].name;
  for (let i = 1; i < samples.length; i++) rawPre = longestCommonPrefix(rawPre, samples[i].name);
  return (rawPre.length >= 4 ? rawPre : cleanSampleCore(samples[0].fileName) || samples[0].name).replace(/[_\-.\s]+$/, "");
}

function autoGroupSamples() {
  const ungrouped = state.order.filter(o => o.type === "sample").map(o => state.samples[o.id]).filter(Boolean);
  for (const s of ungrouped) {
    const det = detectPrimerAndDirection(s.fileName);
    if (det.dir) { s.direction = det.dir; s.detectedPrimer = det.primer; }
    s.gene = detectGeneFromFilename(s.fileName);
  }

  const n = ungrouped.length, thresh = state.settings.simThreshold || 0.45;
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (computePairSimilarity(ungrouped[i], ungrouped[j]) >= thresh) { adj[i].push(j); adj[j].push(i); }
    }
  }

  const visited = new Uint8Array(n);
  let created = 0;
  for (let i = 0; i < n; i++) {
    if (visited[i] || adj[i].length === 0) continue;
    const comp = [], stack = [i];
    visited[i] = 1;
    while (stack.length) {
      const u = stack.pop();
      comp.push(ungrouped[u]);
      for (const v of adj[u]) if (!visited[v]) { visited[v] = 1; stack.push(v); }
    }
    comp.sort((a, b) => (a.direction === b.direction ? a.name.localeCompare(b.name) : (a.direction === "F" ? -1 : 1)));
    createGroup(comp, suggestGroupNameMulti(comp), comp.find(s => s.gene)?.gene || "");
    created++;
  }
  renderTable(); persistDB();
  toast(created ? `Auto-grouped ${created} contig(s) from matching reads` : "No new matching reads met the similarity threshold", created ? "success" : "warn");
}

function createGroup(memberSamples, name, gene = "") {
  const gid = uid("grp");
  const memberIds = memberSamples.map(s => s.id), idSet = new Set(memberIds);
  const grp = {
    id: gid, name: name || suggestGroupNameMulti(memberSamples),
    gene: gene || memberSamples.find(s => s.gene)?.gene || "",
    memberIds, collapsed: false, use: true,
    notes: emptyNotes(), refFasta: "", snpResults: null,
    edits: {}, deleted: new Set(), undoStack: [], redoStack: []
  };
  buildGroupAlignmentAndConsensus(grp);
  state.groups[gid] = grp;

  const firstIdx = state.order.findIndex(o => o.type === "sample" && idSet.has(o.id));
  state.order = state.order.filter(o => !(o.type === "sample" && idSet.has(o.id)));
  state.order.splice(firstIdx >= 0 ? firstIdx : state.order.length, 0, { type: "group", id: gid });
  return grp;
}

function findParentGroupOfSample(sid) { return Object.values(state.groups).find(g => (g.memberIds || []).includes(sid)) || null; }
function rebuildParentGroupIfSample(sid) { const parent = findParentGroupOfSample(sid); if (parent) buildGroupAlignmentAndConsensus(parent); }