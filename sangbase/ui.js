/* ==========================================================================
   8. CONTINUOUS CATMULL-ROM SPLINE RENDERER (DYNAMIC N-READ SUPPORT)
   ========================================================================== */
function updateProUI() {
  const pro = isPro();
  const btn = document.getElementById("proBtn");
  if (!btn) return;
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

  if (isGrp) {
    if (!item.alignment) buildGroupAlignmentAndConsensus(item);
    const members = (item.memberIds || []).map(id => state.samples[id]).filter(Boolean).map(s => getOrientedTrimmedSample(s));
    return {
      item, isGrp: true, members,
      cols: item.alignment.cols,
      baseSeq: item.baseConsensus || "",
      baseQ: item.baseConsensusQ || []
    };
  } else {
    const orientedFull = getOrientedTrimmedSample({ ...item, trimStart: 0, trimEnd: item.seq.length });
    orientedFull.origSample = item;
    const cols = [];
    for (let i = 0; i < orientedFull.seq.length; i++) cols.push([i]);
    return { item, isGrp: false, members: [orientedFull], cols, baseSeq: orientedFull.seq, baseQ: orientedFull.pcon };
  }
}

function renderViewer() {
  const ctxData = getViewerContextData();
  const emptyEl = document.getElementById("emptyViewer"), activeEl = document.getElementById("activeViewer");
  if (!ctxData) { emptyEl.style.display = "flex"; activeEl.style.display = "none"; return; }
  emptyEl.style.display = "none"; activeEl.style.display = "flex";

  const { item, isGrp, members } = ctxData;
  document.getElementById("viewerTitle").textContent = item.name + (item.gene ? ` [${item.gene}]` : "");
  document.querySelectorAll("#viewModeButtons button").forEach(b => b.classList.toggle("active", parseInt(b.dataset.mode) === state.viewer.mode));

  if (state.viewer.activeRow > members.length) state.viewer.activeRow = 0;
  const rowLabel = state.viewer.activeRow === 0
    ? "Row: Consensus"
    : `Row: ${members[state.viewer.activeRow - 1].name} (${members[state.viewer.activeRow - 1].direction})`;
  document.getElementById("activeRowBadge").textContent = rowLabel;

  const banner = document.getElementById("mismatchBanner");
  if (isGrp && members.length > 1 && item.alignment && item.alignment.isMismatch) {
    banner.classList.add("show");
    document.getElementById("mismatchText").textContent = `Mismatched read(s): ${(item.alignment.mismatchedReads || []).join(", ")}.`;
  } else banner.classList.remove("show");

  const stats = getEffectiveConsensus(item);
  document.getElementById("statLen").textContent = stats.length + " bp";
  document.getElementById("statGC").textContent = stats.gcPct.toFixed(1) + "%";
  document.getElementById("statAmbig").textContent = stats.ambig;
  document.getElementById("statMeanQ").textContent = stats.meanQ.toFixed(1);
  document.getElementById("statQ2030").textContent = `${stats.q20Pct.toFixed(0)}% / ${stats.q30Pct.toFixed(0)}%`;
  const ovWrap = document.getElementById("statOverlapWrap");
  if (isGrp && members.length > 1 && item.alignment) {
    ovWrap.style.display = "";
    document.getElementById("statOverlap").textContent = `${item.alignment.overlapLen} bp (${item.alignment.identity.toFixed(1)}%)`;
  } else ovWrap.style.display = "none";

  updateSelectionBar(); renderMainCanvas(); renderMinimap(); renderProDrawer();
}

function renderMainCanvas(customOpts = null) {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const { item, members, cols, baseSeq } = ctxData;
  const mode = state.viewer.mode, colW = customOpts ? customOpts.colWidth : state.viewer.colWidth, amp = state.viewer.ampScale;
  const colors = getThemeColors(customOpts && customOpts.whiteBg);
  const viewport = document.getElementById("canvasViewport"), canvas = customOpts ? customOpts.canvas : document.getElementById("traceCanvas");
  const dpr = customOpts ? customOpts.dpr : (window.devicePixelRatio || 1);

  const visIndices = [];
  for (let r = 0; r < members.length; r++) {
    if (mode === 4 && members[r].direction !== "F") continue;
    if (mode === 5 && members[r].direction !== "R") continue;
    visIndices.push(r);
  }
  const activeVis = visIndices.length ? visIndices : members.map((_, i) => i);

  const totalCols = mode === 3 ? Math.max(1, ...members.map(m => m.seq.length)) : cols.length;
  const startCol = customOpts ? customOpts.startCol : 0, endCol = customOpts ? customOpts.endCol : totalCols;
  const dispCols = Math.max(1, endCol - startCol);

  let headerOffset = customOpts && customOpts.title ? 28 : 0;
  const rulerY = headerOffset + 18, consY = headerOffset + 42, rowStep = 18;
  const seqRowsStartY = headerOffset + 62;
  const traceTop = seqRowsStartY + activeVis.length * rowStep + 10;

  const trackH = mode === 2 ? 170 : Math.max(115, Math.floor(Math.max(220, (viewport.clientHeight - traceTop - 20)) / Math.max(1, Math.min(2, activeVis.length))));
  const neededH = mode === 2 ? (traceTop + trackH + 20) : (traceTop + activeVis.length * (trackH + 10) + 16);

  const totalW = Math.max(customOpts ? dispCols * colW : viewport.clientWidth, dispCols * colW + 40);
  const viewH = customOpts ? customOpts.height : Math.max(viewport.clientHeight, neededH);

  canvas.width = Math.round(totalW * dpr); canvas.height = Math.round(viewH * dpr);
  canvas.style.width = totalW + "px"; canvas.style.height = viewH + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr); ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, totalW, viewH);

  const scrollL = customOpts ? 0 : viewport.scrollLeft, visW = customOpts ? totalW : viewport.clientWidth;
  const xStart = scrollL - 60, xEnd = scrollL + visW + 60;

  if (customOpts && customOpts.title) { ctx.fillStyle = colors.text; ctx.font = "bold 14px sans-serif"; ctx.fillText(customOpts.title, 12, 19); }

  const selRange = getSelectionRange();
  if (!customOpts && selRange) { ctx.fillStyle = "rgba(59,130,246,0.22)"; ctx.fillRect((selRange.start - startCol) * colW, headerOffset, (selRange.end - selRange.start + 1) * colW, viewH - headerOffset); }
  if (!customOpts) {
    const ar = state.viewer.activeRow;
    const rowY = ar === 0 ? consY - 14 : (seqRowsStartY + Math.max(0, activeVis.indexOf(ar - 1)) * rowStep - 13);
    ctx.fillStyle = "rgba(59,130,246,0.08)"; ctx.fillRect(scrollL, rowY, visW, 18);
  }
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
  const { start: tStart, end: tEnd } = getDisplayTrimBounds(item, baseSeq.length);
  const delSet = item.deleted || new Set(), edits = item.edits || {};

  ctx.textAlign = "center";
  for (let c = visColStart; c <= visColEnd; c++) {
    const x = (c - startCol) * colW + colW * 0.5;
    if (c < tStart || c >= tEnd) { ctx.fillStyle = "rgba(100,116,139,0.16)"; ctx.fillRect((c - startCol) * colW, headerOffset, colW, viewH - headerOffset); }
    if ((c + 1) % 10 === 0 || c === 0) {
      ctx.fillStyle = colors.muted; ctx.font = "10px monospace"; ctx.fillText(String(c + 1), x, rulerY);
      ctx.strokeStyle = colors.grid; ctx.beginPath(); ctx.moveTo(x, rulerY + 3); ctx.lineTo(x, traceTop); ctx.stroke();
    }

    // Consensus row: clean background, red box + white text for N
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

    // Per-member base rows with per-strand Phred quality bars behind each base
    for (let vi = 0; vi < activeVis.length; vi++) {
      const r = activeVis[vi], m = members[r], ry = seqRowsStartY + vi * rowStep;
      let b = "", q = -1;
      if (mode === 3) {
        if (c < m.seq.length) { b = m.seq[c]; q = m.pcon[c] || 0; }
      } else if (c < cols.length) {
        const bIdx = cols[c][r];
        if (bIdx >= 0) { b = m.seq[bIdx]; q = m.pcon[bIdx] || 0; } else b = "-";
      }
      if (q >= 0) {
        const qH = Math.min(13, (q / 50) * 13);
        ctx.fillStyle = q >= 30 ? "#22c55e44" : (q >= 20 ? "#eab30855" : "#ef444466");
        ctx.fillRect((c - startCol) * colW + 2, ry - 11 + (13 - qH), Math.max(2, colW - 4), qH);
      }
      if (colW >= 9 && b) { ctx.font = "11px monospace"; ctx.fillStyle = colors[b] || colors.muted; ctx.fillText(b, x, ry); }
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

  const colMaps = members.map((m, r) => {
    const cm = new Int32Array(m.seq.length);
    if (mode === 3) { for (let i = 0; i < m.seq.length; i++) cm[i] = i - startCol; }
    else { for (let c = 0; c < cols.length; c++) if (cols[c][r] >= 0) cm[cols[c][r]] = c - startCol; }
    return cm;
  });

  const drawStrand = (strand, colMap, baseY, trH, label, alpha = 1.0, lw = 1.6) => {
    if (!strand || !colMap) return;
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.max(0, xStart), baseY); ctx.lineTo(xEnd, baseY); ctx.stroke();
    if (label) { ctx.fillStyle = colors.muted; ctx.font = "bold 10px sans-serif"; ctx.fillText(label, Math.max(8, scrollL + 8), baseY - trH + 12); }
    for (const base of ["A", "T", "G", "C"]) {
      const pts = buildContinuousTracePoints(strand.traces[base], strand.ploc, strand.normHeight, colMap, colW, baseY, trH - 12, amp, xStart, xEnd);
      drawContinuousStrandTrace(ctx, pts, colors[base], baseY, lw, alpha);
    }
  };

  if (mode === 2) {
    const baseY = traceTop + trackH;
    activeVis.forEach((r, vi) => drawStrand(members[r], colMaps[r], baseY, trackH, vi === 0 ? `Overlay (${activeVis.length} reads)` : "", vi === 0 ? 0.95 : 0.48, vi === 0 ? 1.7 : 1.3));
  } else {
    const availTrackH = customOpts ? Math.floor((viewH - traceTop - 16) / Math.max(1, activeVis.length)) - 6 : trackH;
    activeVis.forEach((r, vi) => {
      const m = members[r], baseY = traceTop + (vi + 1) * availTrackH + vi * 8;
      drawStrand(m, colMaps[r], baseY, availTrackH, `${m.name} (${m.direction === "F" ? "Fwd 5'→3'" : "RevComp 5'→3'"}${mode === 3 ? " • Indep" : ""})`);
    });
  }
}

function renderMinimap() {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const { members, cols } = ctxData;
  const wrap = document.getElementById("minimapWrap"), canvas = document.getElementById("minimapCanvas");
  const dpr = window.devicePixelRatio || 1, w = wrap.clientWidth, h = wrap.clientHeight;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  const colors = getThemeColors(); ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, w, h);

  const totalCols = Math.max(1, cols.length), miniColW = w / totalCols, strand = members[0];
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
function getGroupDirSummary(g) {
  const mems = (g.memberIds || []).map(id => state.samples[id]).filter(Boolean);
  const f = mems.filter(s => s.direction === "F").length, r = mems.filter(s => s.direction === "R").length;
  if (f && r) return `${f}F+${r}R`;
  if (f) return `${f}F`;
  if (r) return `${r}R`;
  return "0";
}

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
      const g = state.groups[entry.id]; if (!g) continue;
      if (filter && !`${g.name} ${g.gene || ""} ${g.notes?.taxon || ""} ${g.notes?.accession || ""} ${g.notes?.text || ""}`.toLowerCase().includes(filter)) continue;
      const stats = getEffectiveConsensus(g), isMismatch = g.alignment && g.alignment.isMismatch;
      const tr = document.createElement("tr");
      tr.className = "row-group" + (state.selectedIds.has(g.id) ? " selected" : "") + (state.activeItemId === g.id ? " active-viewing" : "");
      tr.innerHTML = `
        <td><input type="checkbox" ${g.use ? "checked" : ""} onclick="event.stopPropagation(); toggleUse('group','${g.id}')" /></td>
        <td title="${escapeHtml(g.name)}"><span onclick="event.stopPropagation(); toggleGroupCollapse('${g.id}')" style="cursor:pointer;margin-right:4px;">${g.collapsed ? "▸" : "▾"}</span>${escapeHtml(g.name)}${g.gene ? `<span class="gene-pill">${escapeHtml(g.gene)}</span>` : ""}</td>
        <td><span class="dir-badge dir-P" onclick="event.stopPropagation(); flipContigOrientation('${g.id}')" title="Click to Flip Contig Orientation (RC) without losing edits">${getGroupDirSummary(g)}</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;">${stats.length} / Q${stats.meanQ.toFixed(0)}</td>
        <td><span class="status-pill ${isMismatch ? "status-err" : (g.savedConsensus ? "status-ok" : "status-idle")}">${isMismatch ? "Mismatch" : (g.savedConsensus ? "Saved" : "Ready")}</span></td>
        <td class="notes-cell" ondblclick="event.stopPropagation(); openNotesModal('${g.id}')">${formatNotesBadge(g.notes)}</td>
      `;
      attachRowEvents(tr, "group", g.id, null); tbody.appendChild(tr);
      if (!g.collapsed) for (const sid of (g.memberIds || [])) if (state.samples[sid]) tbody.appendChild(createSampleRow(state.samples[sid], true, g.id));
    } else {
      const s = state.samples[entry.id]; if (!s) continue;
      if (filter && !`${s.name} ${s.gene || ""} ${s.notes?.taxon || ""} ${s.notes?.text || ""}`.toLowerCase().includes(filter)) continue;
      tbody.appendChild(createSampleRow(s, false, null));
    }
  }
}

function createSampleRow(s, isChild, parentGroupId) {
  const stats = getEffectiveConsensus(s), tr = document.createElement("tr");
  tr.className = (state.selectedIds.has(s.id) ? " selected" : "") + (state.activeItemId === s.id ? " active-viewing" : "");
  tr.innerHTML = `
    <td>${isChild ? "" : `<input type="checkbox" ${s.use ? "checked" : ""} onclick="event.stopPropagation(); toggleUse('sample','${s.id}')" />`}</td>
    <td style="${isChild ? "padding-left:20px;color:var(--text-muted);" : ""}" title="${escapeHtml(s.fileName)} (Double-click to open &amp; trim independently)">${escapeHtml(s.name)}</td>
    <td><span class="dir-badge dir-${s.direction}" onclick="event.stopPropagation(); swapDirection('${s.id}')" title="Click to flip ONLY this read's direction (F/R)">${s.direction}</span></td>
    <td style="font-family:var(--font-mono);font-size:11px;">${stats.length} / Q${stats.meanQ.toFixed(0)}</td>
    <td><span class="status-pill ${s.savedConsensus ? "status-ok" : "status-idle"}">${isChild ? "Read" : (s.savedConsensus ? "Saved" : "Single")}</span></td>
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
  tr.addEventListener("dblclick", () => openInViewer(type, id));
  tr.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (!state.selectedIds.has(id)) { state.selectedIds.clear(); state.selectedIds.add(id); renderTable(); }
    showContextMenu(e.clientX, e.clientY, type, id, parentGroupId);
  });
}

function showContextMenu(x, y, type, id, parentGroupId = null) {
  const menu = document.getElementById("contextMenu"), isGrp = type === "group";
  menu.innerHTML = `
    <div class="ctx-item" onclick="openInViewer('${type}','${id}'); hideCtx();">Open ${isGrp ? "Contig" : "Single Read"} <span class="kbd">Enter</span></div>
    ${parentGroupId ? `<div class="ctx-item" onclick="openInViewer('group','${parentGroupId}'); hideCtx();">Open Parent Contig</div>` : ""}
    <div class="ctx-item" onclick="openNotesModal('${parentGroupId || id}'); hideCtx();">Edit Notes &amp; GenBank <span class="kbd">Ctrl+E</span></div>
    <div class="ctx-item" onclick="generateConsensusSelected(); hideCtx();">Rebuild Consensus <span class="kbd">F5</span></div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="groupSelected(); hideCtx();">Group Selected (2+ Reads) <span class="kbd">Ctrl+G</span></div>
    ${!isGrp && !parentGroupId ? `<div class="ctx-item" onclick="addSelectedToExistingGroup(); hideCtx();">Add Selected to Existing Group…</div>` : ""}
    ${parentGroupId ? `<div class="ctx-item" onclick="removeReadFromGroup('${id}','${parentGroupId}'); hideCtx();">Remove Read from Group</div>` : ""}
    ${isGrp ? `<div class="ctx-item" onclick="ungroupSelected(); hideCtx();">Ungroup Contig <span class="kbd">Ctrl+Shift+G</span></div>` : ""}
    ${isGrp ? `<div class="ctx-item" onclick="renameGroup('${id}'); hideCtx();">Rename Group <span class="kbd">F2</span></div>` : ""}
    ${isGrp ? `<div class="ctx-item" onclick="setGroupGene('${id}'); hideCtx();">Set Gene / Locus Tag…</div>` : ""}
    ${isGrp ? `<div class="ctx-item" onclick="flipContigOrientation('${id}'); hideCtx();">Flip Contig (RC, Keep Edits) <span class="kbd">Ctrl+Shift+R</span></div>` : `<div class="ctx-item" onclick="swapSelectedDirection(); hideCtx();">Flip Read Direction (F/R) <span class="kbd">Ctrl+R</span></div>`}
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="clearSavedConsensusSelected(); hideCtx();">Clear Saved Consensus <span class="kbd">Ctrl+Del</span></div>
    <div class="ctx-item danger" onclick="deleteSelectedTableItems(); hideCtx();">Remove from Project <span class="kbd">Del</span></div>
  `;
  menu.style.left = Math.min(x, window.innerWidth - 235) + "px";
  menu.style.top = Math.min(y, window.innerHeight - 330) + "px";
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
   10. TABLE ACTIONS & MULTI-BASE / PER-STRAND EDITING
   ========================================================================== */
function toggleUse(type, id) { const obj = type === "group" ? state.groups[id] : state.samples[id]; if (obj) { obj.use = !obj.use; persistDB(); } }
function toggleGroupCollapse(gid) { const g = state.groups[gid]; if (g) { g.collapsed = !g.collapsed; renderTable(); persistDB(); } }
function toggleAllGroups(expand) { for (const g of Object.values(state.groups)) g.collapsed = !expand; renderTable(); }

function swapDirection(sid) {
  const s = state.samples[sid]; if (!s) return;
  s.direction = s.direction === "F" ? "R" : "F";
  rebuildParentGroupIfSample(sid);
  renderTable(); renderViewer(); persistDB();
}

function swapSelectedDirection() {
  for (const id of state.selectedIds) {
    if (state.samples[id]) swapDirection(id);
    else if (state.groups[id]) flipContigOrientation(id);
  }
}

function groupSelected() {
  const sel = Array.from(state.selectedIds).filter(id => state.samples[id] && !findParentGroupOfSample(id)).map(id => state.samples[id]);
  if (sel.length < 2) { toast("Select 2 or more ungrouped reads to create a contig", "warn"); return; }
  const suggested = suggestGroupNameMulti(sel);
  const name = prompt(`Group Name for ${sel.length} reads:`, suggested);
  if (name === null) return;
  const g = createGroup(sel, name.trim() || suggested, sel.find(s => s.gene)?.gene || "");
  state.selectedIds.clear(); state.selectedIds.add(g.id);
  renderTable(); openInViewer("group", g.id); persistDB();
}

function addSelectedToExistingGroup() {
  const groups = Object.values(state.groups);
  if (!groups.length) { toast("No existing groups yet. Use Group (Ctrl+G) first.", "warn"); return; }
  const sel = Array.from(state.selectedIds).filter(id => state.samples[id] && !findParentGroupOfSample(id));
  if (!sel.length) { toast("Select one or more ungrouped reads first.", "warn"); return; }
  const choice = prompt(`Add ${sel.length} read(s) to which group? Enter number:\n${groups.map((g, i) => `${i + 1}. ${g.name}`).join("\n")}`, "1");
  if (!choice) return;
  const target = groups[parseInt(choice) - 1];
  if (!target) { toast("Invalid group number", "warn"); return; }
  const idSet = new Set(sel);
  target.memberIds.push(...sel);
  state.order = state.order.filter(o => !(o.type === "sample" && idSet.has(o.id)));
  buildGroupAlignmentAndConsensus(target);
  state.selectedIds.clear(); state.selectedIds.add(target.id);
  renderTable(); openInViewer("group", target.id); persistDB();
  toast(`Added ${sel.length} read(s) to "${target.name}"`, "success");
}

function removeReadFromGroup(sid, gid) {
  const g = state.groups[gid]; if (!g) return;
  g.memberIds = g.memberIds.filter(id => id !== sid);
  const idx = state.order.findIndex(o => o.type === "group" && o.id === gid);
  state.order.splice(idx + 1, 0, { type: "sample", id: sid });
  if (g.memberIds.length === 0) {
    delete state.groups[gid]; state.order = state.order.filter(o => o.id !== gid);
    if (state.activeItemId === gid) { state.activeItemId = null; state.activeItemType = null; }
  } else buildGroupAlignmentAndConsensus(g);
  renderTable(); renderViewer(); persistDB();
}

function ungroupSelected() {
  const sel = Array.from(state.selectedIds).filter(id => state.groups[id]);
  if (!sel.length) return;
  for (const gid of sel) {
    const g = state.groups[gid], idx = state.order.findIndex(o => o.type === "group" && o.id === gid);
    state.order.splice(idx, 1, ...(g.memberIds || []).map(id => ({ type: "sample", id })));
    delete state.groups[gid];
    if (state.activeItemId === gid) { state.activeItemId = null; state.activeItemType = null; }
  }
  state.selectedIds.clear(); renderTable(); renderViewer(); persistDB();
}

function renameGroup(gid) { const g = state.groups[gid]; if (!g) return; const n = prompt("Rename group:", g.name); if (n && n.trim()) { g.name = n.trim(); renderTable(); renderViewer(); persistDB(); } }
function setGroupGene(gid) { const g = state.groups[gid]; if (!g) return; const n = prompt("Set Gene / Locus tag (e.g. 16S, ITS, rpoB, matK):", g.gene || ""); if (n !== null) { g.gene = n.trim(); renderTable(); renderViewer(); persistDB(); } }

function generateConsensusSelected() {
  let count = 0;
  for (const id of state.selectedIds) {
    if (state.groups[id]) { buildGroupAlignmentAndConsensus(state.groups[id]); count++; }
    else if (state.samples[id]) { state.samples[id].savedConsensus = getEffectiveConsensus(state.samples[id]).seq; rebuildParentGroupIfSample(id); count++; }
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
    if (state.groups[id]) {
      for (const mid of (state.groups[id].memberIds || [])) delete state.samples[mid];
      delete state.groups[id]; state.order = state.order.filter(o => o.id !== id);
    } else if (state.samples[id]) {
      const parent = findParentGroupOfSample(id);
      if (parent) { parent.memberIds = parent.memberIds.filter(mid => mid !== id); if (parent.memberIds.length) buildGroupAlignmentAndConsensus(parent); }
      delete state.samples[id]; state.order = state.order.filter(o => o.id !== id);
    }
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
  if (state.activeItemType === "sample") rebuildParentGroupIfSample(item.id);
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function redoEdit() {
  const item = getActiveItem(); if (!item || !item.redoStack.length) return;
  item.undoStack.push({ edits: { ...item.edits }, deleted: new Set(item.deleted), trimStart: item.trimStart, trimEnd: item.trimEnd });
  const snap = item.redoStack.pop();
  item.edits = snap.edits; item.deleted = snap.deleted; item.trimStart = snap.trimStart; item.trimEnd = snap.trimEnd;
  item.savedConsensus = getEffectiveConsensus(item).seq;
  if (state.activeItemType === "sample") rebuildParentGroupIfSample(item.id);
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

function cycleActiveRow() {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const maxRow = ctxData.members.length;
  state.viewer.activeRow = (state.viewer.activeRow + 1) % (maxRow + 1);
  renderViewer();
}

/**
 * Maps a sample's native [trimStart, trimEnd) into display coordinates
 * (accounting for Reverse-Complement mirroring when viewing a single R read).
 */
function getDisplayTrimBounds(item, baseLen) {
  const isGrp = item.alignment !== undefined;
  const tStart = item.trimStart || 0;
  const tEnd = item.trimEnd !== undefined ? item.trimEnd : baseLen;
  if (!isGrp && item.direction === "R") {
    return { start: Math.max(0, baseLen - tEnd), end: Math.min(baseLen, baseLen - tStart) };
  }
  return { start: tStart, end: tEnd };
}

/**
 * Finds the nearest base index in member `r` at or near alignment column `col`.
 */
function findMemberBaseIdxNearCol(cols, r, col) {
  if (col >= 0 && col < cols.length && cols[col][r] >= 0) return cols[col][r];
  for (let d = 1; d < cols.length; d++) {
    if (col - d >= 0 && cols[col - d][r] >= 0) return cols[col - d][r];
    if (col + d < cols.length && cols[col + d][r] >= 0) return cols[col + d][r];
  }
  return -1;
}

/**
 * Trims either the active individual chromatogram (when viewing a single read OR when
 * Active Row is set to a specific read inside a contig) or the contig consensus.
 */
function trimToSelection(side) {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const { item, isGrp, members, cols } = ctxData;
  const range = getSelectionRange() || { start: state.viewer.cursor, end: state.viewer.cursor };

  // Case A: Inside a Contig, targeting a specific individual chromatogram (Active Row >= 1)
  if (isGrp && state.viewer.activeRow >= 1) {
    const r = state.viewer.activeRow - 1;
    const m = members[r];
    const s = m && m.origSample;
    if (!s) return;

    const targetCol = side === "left" ? range.end : range.start;
    const bIdx = findMemberBaseIdxNearCol(cols, r, targetCol);
    if (bIdx < 0) { toast("Selected column is outside this chromatogram", "warn"); return; }

    pushUndo(s);
    const curStart = s.trimStart || 0;
    const curEnd = s.trimEnd !== undefined ? s.trimEnd : s.seq.length;

    if (s.direction === "F") {
      if (side === "left") s.trimStart = Math.min(curEnd - 1, curStart + bIdx + 1);
      else s.trimEnd = Math.max(curStart + 1, curStart + bIdx);
    } else {
      // Reverse-complement display: left side is native 3' end, right side is native 5' end
      if (side === "left") s.trimEnd = Math.max(curStart + 1, curEnd - 1 - bIdx);
      else s.trimStart = Math.min(curEnd - 1, curEnd - bIdx);
    }

    buildGroupAlignmentAndConsensus(item);
    clearSelection(); runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    toast(`Trimmed ${s.name} (${s.direction}) & rebuilt contig`, "success");
    return;
  }

  // Case B: Viewing an individual chromatogram directly
  if (!isGrp) {
    pushUndo(item);
    const L = item.seq.length;
    if (item.direction === "R") {
      if (side === "left") item.trimEnd = Math.max(1, L - 1 - range.end);
      else item.trimStart = Math.min(L - 1, L - range.start);
    } else {
      if (side === "left") item.trimStart = Math.min(L - 1, range.end + 1);
      else item.trimEnd = Math.max(1, range.start);
    }
    item.savedConsensus = getEffectiveConsensus(item).seq;
    rebuildParentGroupIfSample(item.id);
    clearSelection(); runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    toast(`Trimmed ${item.name} & updated parent contig`, "success");
    return;
  }

  // Case C: Contig Consensus Row (activeRow === 0)
  pushUndo(item);
  if (side === "left") item.trimStart = range.end + 1;
  else item.trimEnd = range.start;
  item.savedConsensus = getEffectiveConsensus(item).seq;
  clearSelection(); runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
}

function toggleAutoTrimSetting(enabled) { state.settings.autoTrim = enabled; saveSettings(); if (enabled && state.activeItemId) autoTrimCurrent(); }

function autoTrimCurrent() {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const { item, isGrp, members } = ctxData;
  const qThresh = state.settings.trimQ || 20, win = state.settings.trimWin || 10, minGood = state.settings.trimMinGood || 8;

  // Auto-trim targeted individual chromatogram inside a contig
  if (isGrp && state.viewer.activeRow >= 1) {
    const s = members[state.viewer.activeRow - 1]?.origSample;
    if (!s) return;
    const b = computeQualityTrimBounds(s.seq, s.pcon, qThresh, win, minGood);
    pushUndo(s);
    s.trimStart = b.start; s.trimEnd = b.end;
    buildGroupAlignmentAndConsensus(item);
    runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    toast(`Auto-trimmed ${s.name} (${b.start + 1}–${b.end}) & rebuilt contig`, "success");
    return;
  }

  // Auto-trim single chromatogram in native 5'->3' coordinates
  if (!isGrp) {
    const b = computeQualityTrimBounds(item.seq, item.pcon, qThresh, win, minGood);
    pushUndo(item);
    item.trimStart = b.start; item.trimEnd = b.end;
    item.savedConsensus = getEffectiveConsensus(item).seq;
    rebuildParentGroupIfSample(item.id);
    runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    toast(`Auto-trimmed ${item.name} to ${b.start + 1}–${b.end}`, "success");
    return;
  }

  // Auto-trim contig consensus
  const { start, end } = computeQualityTrimBounds(ctxData.baseSeq, ctxData.baseQ, qThresh, win, minGood);
  pushUndo(item); item.trimStart = start; item.trimEnd = Math.max(start, end);
  item.savedConsensus = getEffectiveConsensus(item).seq;
  runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
  toast(`Auto-trimmed consensus to ${start + 1}–${end}`, "success");
}

function resetActiveTrim() {
  const ctxData = getViewerContextData();
  if (!ctxData) return;
  const { item, isGrp, members } = ctxData;

  if (isGrp && state.viewer.activeRow >= 1) {
    const s = members[state.viewer.activeRow - 1]?.origSample;
    if (!s) return;
    pushUndo(s); s.trimStart = 0; s.trimEnd = s.seq.length;
    buildGroupAlignmentAndConsensus(item);
    runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    toast(`Reset trim for ${s.name} & rebuilt contig`, "success");
  } else {
    pushUndo(item);
    item.trimStart = 0;
    item.trimEnd = isGrp ? (item.baseConsensus || "").length : item.seq.length;
    item.savedConsensus = getEffectiveConsensus(item).seq;
    if (!isGrp) rebuildParentGroupIfSample(item.id);
    runProAnalysesSilent(); renderViewer(); renderTable(); persistDB();
    toast(`Reset trim for ${item.name}`, "success");
  }
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
  const out = asFasta ? `>${item.name}_${range.start + 1}-${range.end + 1}\n${seq}` : seq;
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
  const { item, members, cols, baseSeq, baseQ } = ctxData, n = baseSeq.length;
  if (!n) return;
  for (let step = 1; step <= n; step++) {
    const idx = (state.viewer.cursor + step * dir + n) % n;
    if (item.deleted.has(idx)) continue;
    const ch = (item.edits[idx] !== undefined ? item.edits[idx] : baseSeq[idx]).toUpperCase();
    let hit = false;
    if (kind === "N") hit = !"ACGT".includes(ch);
    else if (kind === "lowQ") hit = (baseQ[idx] || 0) < (state.settings.trimQ || 20);
    else if (kind === "mismatch" && members.length > 1) {
      const row = cols[idx], seen = new Set();
      for (let r = 0; r < members.length; r++) if (row && row[r] >= 0) seen.add(members[r].seq[row[r]]);
      if (seen.size > 1) hit = true;
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
    const col = colFromEvent(e), { item, members, cols, baseSeq, baseQ } = ctxData, row = cols[col];
    const consB = (item.edits[col] !== undefined ? item.edits[col] : baseSeq[col]) || "-";
    let lines = [`<b>Pos ${col + 1}</b> | Cons: <b>${consB}</b> (Q${baseQ[col] ?? 0})`];
    if (row) {
      for (let r = 0; r < members.length; r++) {
        const bIdx = row[r];
        if (bIdx >= 0) {
          const m = members[r], b = m.seq[bIdx], rfu = m.traces[b] ? m.traces[b][m.ploc[bIdx]] : 0;
          lines.push(`${escapeHtml(m.name.slice(0, 16))} (${m.direction}): <b>${b}</b> | Q${m.pcon[bIdx]} | ${rfu} RFU`);
        }
      }
    }
    tip.innerHTML = lines.join("<br>"); tip.style.display = "block";
    tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 260) + "px";
    tip.style.top = Math.min(e.clientY + 14, window.innerHeight - 120) + "px";
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
      const res = translateCodon(sp.s.slice(i, i + 3), tableId);
      aa += res;
      const effIdx = sp.rc ? (n - 1 - i) : i;
      const col = eff.mapColToEff[Math.max(0, Math.min(eff.mapColToEff.length - 1, effIdx))] ?? 0;
      if (res === "*") { stops++; stopCols.push(col); if (firstStopCol === null) firstStopCol = col; curOrf = 0; }
      else { curOrf++; if (curOrf > longestOrf) longestOrf = curOrf; }
    }
    const cdsLen = Math.floor((n - sp.off) / 3) * 3;
    return { label: sp.label, aa, aaLen: aa.length, stops, longestOrf, firstStopCol, stopCols, cdsNt: sp.s.slice(sp.off, sp.off + cdsLen) };
  });
}

function runProAnalysesSilent() {
  const ctxData = getViewerContextData(); if (!ctxData) return;
  const eff = getEffectiveConsensus(ctxData.item);

  const reHits = [];
  for (const enz of RESTRICTION_ENZYMES) {
    let idx = eff.seq.indexOf(enz.site);
    while (idx !== -1) { reHits.push({ name: enz.name, site: enz.site, pos: idx + 1, col: eff.mapColToEff[idx], len: enz.site.length }); idx = eff.seq.indexOf(enz.site, idx + 1); }
  }
  state.viewer.reResults = reHits.sort((a, b) => a.pos - b.pos);

  state.viewer.frameData = computeAllSixFrames(eff, state.settings.geneticCode || "1");
  const bestFrame = [...state.viewer.frameData].sort((a, b) => (a.stops - b.stops) || (b.longestOrf - a.longestOrf))[0];
  if (bestFrame && !state.viewer.frameData.some(f => f.label === state.viewer.selectedFrame)) state.viewer.selectedFrame = bestFrame.label;

  const hetHits = [], ratio = state.settings.hetRatio || 0.30, strand = ctxData.members[0];
  const hetFlags = new Uint8Array(ctxData.cols.length);
  if (strand) {
    for (let c = 0; c < ctxData.cols.length; c++) {
      if (ctxData.item.deleted.has(c)) continue;
      const bIdx = ctxData.cols[c][0];
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
  try { state.viewer.wtSample = parseAB1(await f.arrayBuffer(), f.name); compareWtToActive(); renderProDrawer(); toast(`Loaded WT control trace: ${f.name}`, "success"); }
  catch (err) { toast("Failed to parse WT .ab1: " + err.message, "error"); }
});

function compareWtToActive() {
  const ctxData = getViewerContextData(), wt = state.viewer.wtSample;
  if (!ctxData || !wt) { state.viewer.wtDiffs = []; return; }
  const eff = getEffectiveConsensus(ctxData.item), aln = alignForwardReverse(wt.seq, eff.seq), diffs = [];
  for (const c of aln.cols) if (c.fIdx >= 0 && c.rIdx >= 0 && wt.seq[c.fIdx] !== eff.seq[c.rIdx]) diffs.push({ wtPos: c.fIdx + 1, qryCol: eff.mapColToEff[c.rIdx], wtBase: wt.seq[c.fIdx], mutBase: eff.seq[c.rIdx] });
  state.viewer.wtDiffs = diffs;
}

function renderProDrawer() {
  const body = document.getElementById("proBody"); if (!body) return;
  const pro = isPro(), tab = state.viewer.proTab;
  let html = "";

  if (!pro && tab !== "consensus") {
    html += `<div class="pro-lock-overlay">
      <div style="font-weight:700;font-size:14px;">SangBase Pro Feature</div>
      <div style="font-size:12px;color:var(--text-muted);">Unlock Per-Sample SNPs, 6-Frame CDS Validator, Restriction Map, CRISPR Split, WT vs Mutant .ab1, Phylo Tree &amp; 300-DPI PNG for ₹99 one-time.</div>
      <button class="btn-pro" onclick="openProModal()">Unlock Pro (₹99)</button>
    </div>`;
  }

  if (tab === "consensus") {
    const item = getActiveItem();
    if (!item) { body.innerHTML = '<span class="hint-text">Open a sample or contig to view its consensus sequence.</span>'; return; }
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
    const frames = state.viewer.frameData || [], cur = frames.find(f => f.label === state.viewer.selectedFrame) || frames[0];
    const gcOpts = Object.entries(GENETIC_CODES).map(([id, g]) => `<option value="${id}" ${state.settings.geneticCode === id ? "selected" : ""}>${g.name}</option>`).join("");
    let aaHtml = "";
    if (cur) {
      let stopIdx = 0;
      for (let i = 0; i < cur.aa.length; i++) {
        const ch = cur.aa[i];
        if (ch === "*") { const col = cur.stopCols[stopIdx++] ?? 0; aaHtml += `<span class="aa-stop" title="Stop codon — click to jump to bp ${col + 1}" onclick="state.viewer.cursor=${col};scrollCursorIntoView();">*</span>`; }
        else if (ch === "M") aaHtml += `<span class="aa-start">M</span>`;
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
    html += hits.length ? `<div class="btn-row">${hits.map(h => `<span class="tag-chip" style="cursor:pointer;" onclick="state.viewer.cursor=${h.col};scrollCursorIntoView();"><b>${h.name}</b> (${h.site}) @ bp ${h.pos}</span>`).join("")}</div>` : '<span class="hint-text">No common restriction sites detected in current consensus.</span>';
  } else if (tab === "het") {
    const hets = state.viewer.hetResults, split = state.viewer.crisprSplit;
    html += `<div class="btn-row" style="margin-bottom:8px;">
      <label style="font-size:11px;">Secondary Peak Ratio >= <b>${Math.round((state.settings.hetRatio || 0.3) * 100)}%</b></label>
      <input type="range" min="0.15" max="0.60" step="0.05" value="${state.settings.hetRatio || 0.3}" oninput="state.settings.hetRatio=parseFloat(this.value);saveSettings();runProAnalysesSilent();renderViewer();" />
      <button class="btn-sm btn-primary" onclick="callAllHetIupac()">Call All as IUPAC (${hets.length})</button>
      ${split !== null ? `<span class="status-pill status-err" style="cursor:pointer;" onclick="state.viewer.cursor=${split};scrollCursorIntoView();">CRISPR Indel Split @ bp ${split + 1}</span>` : `<span class="status-pill status-ok">No CRISPR Trace Split</span>`}
    </div>
    <div class="btn-row">${hets.length ? hets.map(h => `<span class="tag-chip" style="cursor:pointer;" onclick="state.viewer.cursor=${h.col};scrollCursorIntoView();">bp ${h.pos}: <b>${h.b1}/${h.b2} → ${h.iupac}</b> (${Math.round(h.ratio * 100)}%)</span>`).join("") : '<span class="hint-text">No overlapping secondary peaks above threshold.</span>'}</div>`;
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
   13. FREE BATCH TOOLS, GENBANK, DEREPLICATION, PHYLO & PRINTABLE PDF
   ========================================================================== */
function exportGenBankBankIt() {
  const items = getExportItems(true);
  if (!items.length) { toast('No "Use"-checked sequences to export', "warn"); return; }
  const fastaLines = [], tsvLines = [["Sequence_ID", "Organism", "Strain", "Isolate", "Isolation_source", "Host", "geo_loc_name", "Collection_date", "Collected_by", "Specimen_voucher", "Note"].join("\t")];

  for (const it of items) {
    const eff = getEffectiveConsensus(it), n = { ...emptyNotes(), ...(it.notes || {}) };
    const seqId = it.name.replace(/[^\w\-]+/g, "_").slice(0, 25), org = n.taxon || "Unidentified organism", marker = n.marker || it.gene || "ribosomal RNA";
    const mods = [`[organism=${org}]`];
    if (n.strain) mods.push(`[strain=${n.strain}]`); else if (n.isolate) mods.push(`[isolate=${n.isolate}]`); else mods.push(`[isolate=${seqId}]`);
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
  closeModal("batchModal"); toast(`Exported BankIt FASTA + Source Modifier TSV for ${items.length} sequence(s)`, "success");
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
    for (let j = i + 1; j < items.length; j++) if (!visited.has(j) && fastSeqIdentity(items[i].seq, items[j].seq) >= thresh) { visited.add(j); grp.push(items[j]); }
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
    const a = nodes[bi], b = nodes[bj], merged = { name: "", height: best / 2, size: a.size + b.size, left: a, right: b }, newRow = [];
    for (let k = 0; k < nodes.length; k++) if (k !== bi && k !== bj) newRow.push((dist[bi][k] * a.size + dist[bj][k] * b.size) / (a.size + b.size));
    const nextNodes = nodes.filter((_, k) => k !== bi && k !== bj), nextDist = [];
    for (let i = 0; i < nodes.length; i++) if (i !== bi && i !== bj) nextDist.push(dist[i].filter((_, j) => j !== bi && j !== bj));
    for (let i = 0; i < nextDist.length; i++) nextDist[i].push(newRow[i]);
    nextDist.push([...newRow, 0]); nextNodes.push(merged); nodes = nextNodes; dist = nextDist;
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
    renderMainCanvas({ canvas: c, dpr: 2, whiteBg: true, title: `Bases ${start + 1} – ${end}`, startCol: start, endCol: end, colWidth: 10, height: 240 });
    body.appendChild(c);
  }
  openModal("printModal");
}

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
  renderMainCanvas({ canvas: offCanvas, dpr, whiteBg, title, startCol, endCol: Math.max(startCol + 1, endCol), colWidth: 16, height: 420 });
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
    if (item.alignment !== undefined) {
      for (const mid of (item.memberIds || [])) {
        const s = state.samples[mid];
        if (s) {
          const b = computeQualityTrimBounds(s.seq, s.pcon, state.settings.trimQ || 20, state.settings.trimWin || 10, state.settings.trimMinGood || 8);
          s.trimStart = b.start; s.trimEnd = b.end;
        }
      }
      buildGroupAlignmentAndConsensus(item);
    } else {
      const b = computeQualityTrimBounds(item.seq, item.pcon, state.settings.trimQ || 20, state.settings.trimWin || 10, state.settings.trimMinGood || 8);
      item.trimStart = b.start; item.trimEnd = b.end; item.savedConsensus = getEffectiveConsensus(item).seq;
    }
  }
  renderTable(); renderViewer(); persistDB();
  toast(`Batch quality auto-trimmed & rebuilt ${items.length} consensus sequence(s)`, "success");
}

function exportBatchFasta(useCheckedOnly) {
  const items = getExportItems(useCheckedOnly);
  if (!items.length) { toast("No sequences to export", "warn"); return; }
  downloadText(`${state.projectName.replace(/[^\w\-]+/g, "_")}.fasta`, items.map(it => `>${it.name}${it.notes?.taxon ? ` [${it.notes.taxon}]` : ""}\n${getEffectiveConsensus(it).seq}`).join("\n"));
  closeModal("batchModal"); toast(`Exported ${items.length} sequence(s) to Multi-FASTA`, "success");
}

function exportBatchCSV() {
  const items = getExportItems(true);
  if (!items.length) { toast("No 'Use'-checked items to export", "warn"); return; }
  const header = ["Name", "Gene", "Reads", "Length_bp", "GC_Pct", "Ambiguous", "Mean_Q", "Q20_Pct", "Q30_Pct", "Genus_Species", "Accession", "BLAST_Identity", "Query_Coverage", "E_Value", "Marker", "Strain", "Isolate", "Isolation_Source", "Host", "Geo_Location", "Collection_Date", "Collected_By", "Voucher", "Notes"];
  const rows = [header.join(",")];
  for (const it of items) {
    const st = getEffectiveConsensus(it), n = { ...emptyNotes(), ...(it.notes || {}) };
    rows.push([
      it.name, it.gene || "", it.memberIds ? it.memberIds.length : 1, st.length, st.gcPct.toFixed(2), st.ambig,
      st.meanQ.toFixed(1), st.q20Pct.toFixed(1), st.q30Pct.toFixed(1),
      n.taxon, n.accession, n.identity, n.coverage, n.evalue, n.marker,
      n.strain, n.isolate, n.isolationSource, n.host, n.geoLoc, n.collectionDate, n.collectedBy, n.voucher, n.text
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
  }
  downloadText(`${state.projectName.replace(/[^\w\-]+/g, "_")}_summary.csv`, rows.join("\n"));
  closeModal("batchModal"); toast(`Exported ${items.length} row(s) to CSV`, "success");
}

function launchBatchBlastAllChecked() {
  const items = getExportItems(true);
  if (!items.length) { toast('No "Use"-checked sequences to BLAST', "warn"); return; }
  const fasta = items.map(it => `>${it.name.replace(/\s+/g, "_")}\n${getEffectiveConsensus(it).seq}`).join("\n");
  navigator.clipboard.writeText(fasta).catch(() => { });

  const form = document.createElement("form");
  form.method = "POST"; form.action = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"; form.target = "_blank"; form.style.display = "none";
  for (const [k, v] of Object.entries({ CMD: "Web", PAGE_TYPE: "BlastSearch", PROGRAM: "blastn", BLAST_PROGRAMS: "megaBlast", DATABASE: "core_nt", QUERY: fasta, JOB_TITLE: `${state.projectName} (${items.length} seqs)` })) {
    const inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; inp.value = v; form.appendChild(inp);
  }
  document.body.appendChild(form); form.submit(); form.remove();
  closeModal("batchModal");
  toast(`Submitted ${items.length} sequence(s) to NCBI BLASTn. Download XML when done and import it back!`, "success");
}

function triggerBlastXmlImport() { document.getElementById("fileInputBlastXml").click(); }
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
    const text = await file.text();
    const isXml = file.name.toLowerCase().endsWith(".xml") || text.trim().startsWith("<");
    const parsed = isXml ? parseBlastXml(text) : parseBlastHitTable(text);
    let updated = 0, noHit = 0, unmatched = 0;

    for (const r of parsed) {
      const item = findItemByBlastQueryName(r.queryName);
      if (!item) { unmatched++; continue; }
      item.notes = { ...emptyNotes(), ...(item.notes || {}) };

      if (!r.hits || !r.hits.length) {
        item.notes.taxon = "No significant hit";
        item.notes.blastHits = [];
        noHit++;
        continue;
      }

      // Keep top 10 hits
      item.notes.blastHits = r.hits.slice(0, 10);

      // Auto-fill primary fields from Hit #1
      const top = item.notes.blastHits[0];
      item.notes.taxon = top.taxon || item.notes.taxon;
      item.notes.accession = top.accession || item.notes.accession;
      item.notes.identity = top.identity || item.notes.identity;
      item.notes.coverage = top.coverage || item.notes.coverage;
      item.notes.evalue = top.evalue || item.notes.evalue;
      if (top.marker) item.notes.marker = top.marker;
      updated++;
    }

    renderTable(); persistDB(); closeModal("batchModal");
    toast(
      `BLAST Import: Updated ${updated} sample(s) (up to 10 hits each)${noHit ? `, ${noHit} no-hit` : ""}${unmatched ? `, ${unmatched} unmatched` : ""}.`,
      updated ? "success" : "warn"
    );
  } catch (err) {
    toast("Failed to parse BLAST file: " + err.message, "error");
  }
}

function parseBlastXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Malformed XML file");
  const results = [];

  for (const iter of doc.querySelectorAll("Iteration, Search")) {
    const qDef = iter.querySelector("Iteration_query-def")?.textContent || iter.querySelector("query-title")?.textContent || iter.querySelector("query-id")?.textContent || "";
    const qLen = parseFloat(iter.querySelector("Iteration_query-len")?.textContent || iter.querySelector("query-len")?.textContent || "0");
    const hitNodes = Array.from(iter.querySelectorAll("Hit")).slice(0, 10);

    const hits = hitNodes.map((hitNode, idx) => {
      const hitDef = hitNode.querySelector("Hit_def")?.textContent || hitNode.querySelector("description > HitDescr > title")?.textContent || "";
      const accession = hitNode.querySelector("Hit_accession")?.textContent || hitNode.querySelector("description > HitDescr > accession")?.textContent || "";
      const hsp = hitNode.querySelector("Hsp");
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

      return {
        rank: idx + 1,
        taxon: extractTaxonFromDef(hitDef),
        hitDef,
        accession,
        identity,
        coverage,
        evalue,
        marker: detectMarkerFromDef(hitDef)
      };
    });

    results.push({ queryName: qDef, hits });
  }
  return results;
}

function parseBlastHitTable(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("#"));
  const byQuery = new Map();

  for (const line of lines) {
    const cols = line.includes("\t") ? line.split("\t") : line.split(",");
    if (cols.length < 11) continue;
    const qName = cols[0].replace(/^"|"$/g, "").trim();
    if (!byQuery.has(qName)) byQuery.set(qName, []);
    const arr = byQuery.get(qName);
    if (arr.length >= 10) continue;

    const subj = cols[1].replace(/^"|"$/g, "").trim();
    arr.push({
      rank: arr.length + 1,
      taxon: subj,
      hitDef: subj,
      accession: subj,
      identity: parseFloat(cols[2]).toFixed(2) + "%",
      coverage: "",
      evalue: `${cols[10]} / ${Math.round(parseFloat(cols[11] || "0"))}`,
      marker: ""
    });
  }

  return Array.from(byQuery.entries()).map(([queryName, hits]) => ({ queryName, hits }));
}

/* ==========================================================================
   14. MODALS: PRIMERS, CUSTOM GENES, NOTES + GENBANK, BLAST, PRO, SHORTCUTS
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
  renderCustomPrimerLists(); renderCustomGeneList();
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

function renderCustomGeneList() {
  const el = document.getElementById("customGeneList"); if (!el) return;
  el.innerHTML = (state.settings.customGenes || []).map((g, i) => `<span class="tag-chip">${escapeHtml(g)}<button onclick="removeCustomGene(${i})">×</button></span>`).join("")
    || `<span class="hint-text">Built-in active: ${BUILTIN_GENES.slice(0, 10).join(", ")}…</span>`;
}

function addCustomGene() {
  const inp = document.getElementById("newCustomGene"), val = inp.value.trim();
  if (!val) return;
  if (!state.settings.customGenes.includes(val)) state.settings.customGenes.push(val);
  inp.value = ""; saveSettings(); persistDB(); renderCustomGeneList();
}

function removeCustomGene(idx) { state.settings.customGenes.splice(idx, 1); saveSettings(); persistDB(); renderCustomGeneList(); }

let notesTargetId = null;
function switchNotesTab(tab) {
  document.querySelectorAll(".modal-subtab").forEach(b => b.classList.toggle("active", b.dataset.ntab === tab));
  document.getElementById("notesTabBlast").style.display = tab === "blast" ? "block" : "none";
  document.getElementById("notesTabGenbank").style.display = tab === "genbank" ? "block" : "none";
}

function renderNotesBlastHits(hits) {
  const wrap = document.getElementById("noteBlastHitsWrap");
  const tbody = document.getElementById("noteBlastHitsBody");
  if (!wrap || !tbody) return;
  if (!Array.isArray(hits) || !hits.length) {
    wrap.style.display = "none";
    tbody.innerHTML = "";
    return;
  }
  wrap.style.display = "block";
  tbody.innerHTML = hits.map((h, i) => `
    <tr>
      <td>${h.rank || (i + 1)}</td>
      <td title="${escapeHtml(h.hitDef || h.taxon)}"><span class="notes-taxon">${escapeHtml(h.taxon)}</span></td>
      <td class="mono-muted">${escapeHtml(h.accession)}</td>
      <td>${escapeHtml(h.identity)}</td>
      <td>${escapeHtml(h.coverage || "-")}</td>
      <td class="mono-muted">${escapeHtml(h.evalue || "-")}</td>
      <td><button class="btn-sm" onclick="useBlastHitAsPrimary(${i})">Use</button></td>
    </tr>
  `).join("");
}

function useBlastHitAsPrimary(idx) {
  const obj = state.groups[notesTargetId] || state.samples[notesTargetId];
  const h = obj?.notes?.blastHits?.[idx];
  if (!h) return;
  document.getElementById("noteTaxon").value = h.taxon || "";
  document.getElementById("noteAccession").value = h.accession || "";
  document.getElementById("noteIdentity").value = h.identity || "";
  document.getElementById("noteCoverage").value = h.coverage || "";
  document.getElementById("noteEvalue").value = h.evalue || "";
  if (h.marker) document.getElementById("noteMarker").value = h.marker;
  toast(`Loaded Hit #${idx + 1} (${h.taxon}) into primary fields`, "success");
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
  renderNotesBlastHits(n.blastHits);
  switchNotesTab("blast"); openModal("notesModal");
  document.getElementById("noteTaxon").focus();
}

function saveNotesModal() {
  const obj = state.groups[notesTargetId] || state.samples[notesTargetId]; if (!obj) return;
  const existingHits = obj.notes?.blastHits || [];
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
    voucher: document.getElementById("noteVoucher").value.trim(),
    blastHits: existingHits
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
  navigator.clipboard.writeText(fasta).catch(() => { });

  if (!useUrlFallback) {
    try {
      const form = document.createElement("form");
      form.method = "POST"; form.action = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"; form.target = "_blank"; form.style.display = "none";
      for (const [k, v] of Object.entries({ CMD: "Web", PAGE_TYPE: "BlastSearch", PROGRAM: "blastn", BLAST_PROGRAMS: "megaBlast", DATABASE: db, QUERY: fasta, JOB_TITLE: item.name })) {
        const inp = document.createElement("input"); inp.type = "hidden"; inp.name = k; inp.value = v; form.appendChild(inp);
      }
      document.body.appendChild(form); form.submit(); form.remove();
      closeModal("blastModal"); toast("Submitted to NCBI BLASTn in new tab (sequence copied)", "success"); return;
    } catch (e) { }
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
    : `<div style="width:140px;height:140px;border-radius:8px;border:1px dashed var(--border-strong);display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;color:var(--text-muted);padding:8px;">Set <code>UPI_CONFIG.qrImageDataUrl</code> in core.js to show your QR image</div>`;

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
   15. CHUNKED BULK FILE IMPORT / EXPORT & DRAG-AND-DROP
   ========================================================================== */
async function handleFiles(fileList) {
  const files = Array.from(fileList || []); if (!files.length) return;
  const ab1Files = files.filter(f => f.name.toLowerCase().endsWith(".ab1"));
  const jsonFiles = files.filter(f => f.name.toLowerCase().endsWith(".json"));
  const xmlFiles = files.filter(f => f.name.toLowerCase().endsWith(".xml"));

  for (const jf of jsonFiles) { try { deserializeProject(JSON.parse(await jf.text())); toast(`Opened project ${jf.name}`, "success"); } catch (e) { toast(`Invalid project JSON: ${e.message}`, "error"); } }
  for (const xf of xmlFiles) await importBlastResultsFile(xf);
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

function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
function toast(msg, type = "info") { const el = document.createElement("div"); el.className = "toast " + type; el.textContent = msg; document.getElementById("toastContainer").appendChild(el); setTimeout(() => el.remove(), 3500); }

/* ==========================================================================
   16. CONTEXT-AWARE KEYBOARD SHORTCUTS (INPUT FOCUS SAFE)
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
  if (ctrl && shift && kl === "r") { e.preventDefault(); flipActiveContigOrientation(); return; }
  if (ctrl && k === ",") { e.preventDefault(); openPrimerModal(); return; }
  if (ctrl && kl === "m") { e.preventDefault(); autoGroupSamples(); return; }
  if (ctrl && k === "]") { e.preventDefault(); toggleAllGroups(true); return; }
  if (ctrl && k === "[") { e.preventDefault(); toggleAllGroups(false); return; }
  if (ctrl && ["1", "2", "3", "4"].includes(k)) { e.preventDefault(); sortTable({ "1": "name", "2": "notes", "3": "status", "4": "use" }[k]); return; }

  if (!inViewer) {
    if (ctrl && !shift && kl === "g") { e.preventDefault(); groupSelected(); return; }
    if (ctrl && shift && kl === "g") { e.preventDefault(); ungroupSelected(); return; }
    if (ctrl && !shift && kl === "r") { e.preventDefault(); swapSelectedDirection(); return; }
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
  const maxRow = ctxData.members.length;

  if (ctrl && kl === "f") { e.preventDefault(); toggleFindBar(); return; }
  if (ctrl && !shift && kl === "t") { e.preventDefault(); autoTrimCurrent(); return; }
  if (ctrl && shift && kl === "t") { e.preventDefault(); copyTrimmedConsensus(); return; }
  if (k === "F3") { e.preventDefault(); stepFind(shift ? -1 : 1); return; }
  if (ctrl && (k === "+" || k === "=")) { e.preventDefault(); adjustZoom(2); return; }
  if (ctrl && k === "-") { e.preventDefault(); adjustZoom(-2); return; }
  if (ctrl && k === "0") { e.preventDefault(); resetZoom(); return; }
  if (!ctrl && ["1", "2", "3", "4", "5"].includes(k)) { e.preventDefault(); setViewMode(parseInt(k)); return; }
  if (ctrl && kl === "g") { e.preventDefault(); openGotoModal(); return; }
  if (ctrl && kl === "e") { e.preventDefault(); openNotesModal(state.activeItemId); return; }
  if (k === "F8") { e.preventDefault(); jumpNextIssue("N", shift ? -1 : 1); return; }
  if (k === "F7") { e.preventDefault(); jumpNextIssue("lowQ", shift ? -1 : 1); return; }
  if ((ctrl && k === "ArrowLeft") || k === "[") { e.preventDefault(); jumpNextIssue("mismatch", -1); return; }
  if ((ctrl && k === "ArrowRight") || k === "]") { e.preventDefault(); jumpNextIssue("mismatch", 1); return; }
  if (ctrl && k === "ArrowUp") { e.preventDefault(); state.viewer.activeRow = (state.viewer.activeRow + maxRow) % (maxRow + 1); renderViewer(); return; }
  if (ctrl && k === "ArrowDown") { e.preventDefault(); state.viewer.activeRow = (state.viewer.activeRow + 1) % (maxRow + 1); renderViewer(); return; }
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
    const row = ctxData.cols[state.viewer.cursor];
    if (row) {
      const targetDir = kl.toUpperCase();
      const rIdx = ctxData.members.findIndex((m, idx) => m.direction === targetDir && row[idx] >= 0);
      if (rIdx >= 0) {
        e.preventDefault();
        editConsensusAt(state.viewer.cursor, ctxData.members[rIdx].seq[row[rIdx]]);
        state.viewer.cursor = Math.min(maxPos, state.viewer.cursor + 1);
        scrollCursorIntoView(); return;
      }
    }
  }

  if (!ctrl && k.length === 1 && IUPAC_CODES.has(k.toUpperCase())) {
    e.preventDefault();
    editConsensusAt(state.viewer.cursor, k.toUpperCase());
    state.viewer.cursor = Math.min(maxPos, state.viewer.cursor + 1);
    scrollCursorIntoView();
  }
});

/* ==========================================================================
   17. BOOTSTRAP
   ========================================================================== */
loadSettings();
updateProUI();
restoreDB();
renderTable();