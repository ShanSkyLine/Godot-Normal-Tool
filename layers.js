// ════════════════════════════════════════════════════════════
// layers.js — multiple image layers, each with its own normal map,
// freely positioned relative to each other (drag with mouse/touch,
// or type exact X/Y). Preview any single layer solo, or view the
// combined result: every visible layer is normal-mapped
// independently and alpha-composited on top of each other —
// top of the list = top of the stack.
// ════════════════════════════════════════════════════════════

function addLayerFiles(list){
  const files = [...list].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  let remaining = files.length;
  files.forEach(f => {
    const r = new FileReader();
    r.onload = e => { const img = new Image(); img.onload = () => {
      // small cascade offset so newly added layers don't stack exactly
      // on top of each other and stay easy to grab individually
      const stagger = (App.layers.length % 6) * 16;
      App.layers.unshift({
        id: App.nextLayerId++,
        name: f.name.replace(/\.[a-zA-Z0-9]+$/, '').slice(0, 40),
        canvas: toC(img),
        enabled: true,
        x: stagger, y: stagger,
        _normalCache: null,
      });
      if (--remaining === 0){ rebuildLayersUI(); recomputeLayers(); }
    }; img.src = e.target.result; };
    r.readAsDataURL(f);
  });
}
function removeLayer(id){
  App.layers = App.layers.filter(l => l.id !== id);
  if (App.soloLayerId === id) App.soloLayerId = null;
  rebuildLayersUI();
  if (App.layers.length) recomputeLayers();
  else {
    App.frames = []; App.normalFrames = [];
    $('emptyState').style.display = 'flex'; $('previews').style.display = 'none';
    $('strip').classList.remove('on');
    setStatus('', t('no_layers'));
  }
}
function toggleLayerVisible(id){
  const l = App.layers.find(x => x.id === id); if (!l) return;
  l.enabled = !l.enabled; rebuildLayersUI();
  if (App.soloLayerId === null) recomputeLayers();
}
function setSoloLayer(id){
  App.soloLayerId = id; rebuildLayersUI(); recomputeLayers(); updateLayerCanvasEditable();
}
function moveLayer(id, dir){
  const i = App.layers.findIndex(l => l.id === id);
  const j = i + dir; if (i < 0 || j < 0 || j >= App.layers.length) return;
  [App.layers[i], App.layers[j]] = [App.layers[j], App.layers[i]];
  rebuildLayersUI();
  if (App.soloLayerId === null) recomputeLayers();
}
function setLayerPos(id, x, y){
  const l = App.layers.find(x2 => x2.id === id); if (!l) return;
  if (x !== null && !isNaN(x)) l.x = Math.round(x);
  if (y !== null && !isNaN(y)) l.y = Math.round(y);
  if (App.soloLayerId === null) recomputeLayers();
}

// ── UI ──
function rebuildLayersUI(){
  ['layerList', 'layerListM'].forEach(id => {
    const el = $(id); if (!el) return; el.innerHTML = '';
    if (!App.layers.length){
      el.innerHTML = `<div class="info-box" style="font-size:10px">${escapeHtml(t('no_layers'))}</div>`; return;
    }
    App.layers.forEach(l => el.appendChild(buildLayerItem(l)));
  });
  ['layerCount', 'layerCountM'].forEach(id => { const e = $(id); if (e) e.textContent = App.layers.length; });
}
function buildLayerItem(l){
  const div = document.createElement('div');
  div.className = 'layer-item' + (App.soloLayerId === l.id ? ' solo' : '') + (l.enabled ? '' : ' off');
  const thumb = document.createElement('canvas'); thumb.width = 28; thumb.height = 28;
  const tctx = thumb.getContext('2d');
  const scale = Math.min(28 / l.canvas.width, 28 / l.canvas.height);
  const tw = l.canvas.width * scale, th = l.canvas.height * scale;
  tctx.drawImage(l.canvas, (28 - tw) / 2, (28 - th) / 2, tw, th);
  const safeName = escapeHtml(l.name);
  div.innerHTML = `<div class="layer-item-hdr">
      <div class="tog ${l.enabled ? 'on' : ''}" data-act="vis" title="${escapeHtml(t('visible'))}"></div>
      <span class="layer-thumb-slot"></span>
      <span class="layer-name" title="${safeName}">${safeName}</span>
      <button class="lyr-btn" data-act="up" title="↑">↑</button>
      <button class="lyr-btn" data-act="down" title="↓">↓</button>
      <button class="del-btn" data-act="del"><span class="mi">close</span></button>
    </div>
    <div class="layer-row-xy">
      <label>X</label><input type="number" class="xy-input" data-act="x" value="${Math.round(l.x)}" step="1">
      <label>Y</label><input type="number" class="xy-input" data-act="y" value="${Math.round(l.y)}" step="1">
    </div>`;
  div.querySelector('.layer-thumb-slot').appendChild(thumb);
  div.querySelector('[data-act=vis]').onclick = e => { e.stopPropagation(); toggleLayerVisible(l.id); };
  div.querySelector('[data-act=up]').onclick = e => { e.stopPropagation(); moveLayer(l.id, -1); };
  div.querySelector('[data-act=down]').onclick = e => { e.stopPropagation(); moveLayer(l.id, 1); };
  div.querySelector('[data-act=del]').onclick = e => { e.stopPropagation(); removeLayer(l.id); };
  const xIn = div.querySelector('[data-act=x]'), yIn = div.querySelector('[data-act=y]');
  xIn.onclick = e => e.stopPropagation();
  yIn.onclick = e => e.stopPropagation();
  xIn.oninput = () => setLayerPos(l.id, +xIn.value, null);
  yIn.oninput = () => setLayerPos(l.id, null, +yIn.value);
  div.onclick = () => setSoloLayer(App.soloLayerId === l.id ? null : l.id);
  return div;
}

// ── canvas-space bounds + compositing (shared by full recompute and drag) ──
function computeLayerBounds(visible){
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  visible.forEach(l => {
    minX = Math.min(minX, l.x); minY = Math.min(minY, l.y);
    maxX = Math.max(maxX, l.x + l.canvas.width); maxY = Math.max(maxY, l.y + l.canvas.height);
  });
  return { minX, minY, W: Math.max(1, Math.round(maxX - minX)), H: Math.max(1, Math.round(maxY - minY)) };
}
// alpha-composites one layer's normal ImageData into a shared float buffer at (offX,offY)
function compositeNormalInto(combined, W, H, nd, offX, offY){
  const lw = nd.width, lh = nd.height;
  const x0 = Math.max(0, offX), y0 = Math.max(0, offY);
  const x1 = Math.min(W, offX + lw), y1 = Math.min(H, offY + lh);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++){
    const sx = x - offX, sy = y - offY;
    const si = (sy * lw + sx) * 4, di = (y * W + x) * 4;
    const sa = nd.data[si + 3] / 255; if (sa <= 0) continue;
    const da = combined[di + 3];
    const outA = sa + da * (1 - sa); if (outA <= 0) continue;
    combined[di]   = (nd.data[si]   * sa + combined[di]   * da * (1 - sa)) / outA;
    combined[di+1] = (nd.data[si+1] * sa + combined[di+1] * da * (1 - sa)) / outA;
    combined[di+2] = (nd.data[si+2] * sa + combined[di+2] * da * (1 - sa)) / outA;
    combined[di+3] = outA;
  }
}
// builds the diffuse composite + combined normal map for the given bounds.
// Reuses each layer's cached normal map (generated once per settings change)
// so repositioning during a drag is just cheap re-compositing, not regeneration.
function buildLayerComposite(visible, W, H, minX, minY){
  const stackBottomUp = [...visible].reverse();
  const origC = document.createElement('canvas'); origC.width = W; origC.height = H;
  const octx = origC.getContext('2d');
  const combined = new Float32Array(W * H * 4);
  stackBottomUp.forEach(l => {
    const dx = Math.round(l.x - minX), dy = Math.round(l.y - minY);
    octx.drawImage(l.canvas, dx, dy);
    if (!l._normalCache) l._normalCache = genNormal(l.canvas);
    compositeNormalInto(combined, W, H, l._normalCache, dx, dy);
  });
  const out = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++){
    const di = i * 4;
    out[di] = combined[di]; out[di+1] = combined[di+1]; out[di+2] = combined[di+2];
    out[di+3] = Math.round(combined[di+3] * 255);
  }
  return { origC, normalImageData: new ImageData(out, W, H) };
}

// ── generation ──
function recomputeLayers(){
  if (!App.layers.length) return;
  const solo = App.layers.find(l => l.id === App.soloLayerId);
  if (solo){
    App.frames = [{ canvas: solo.canvas }];
    processAll();
    return;
  }
  const visible = App.layers.filter(l => l.enabled);
  if (!visible.length){
    App.frames = []; App.normalFrames = [];
    $('emptyState').style.display = 'flex'; $('previews').style.display = 'none';
    $('strip').classList.remove('on');
    setStatus('', t('no_visible_layers'));
    return;
  }
  setStatus('proc', t('processing')); showProg(true);

  const { minX, minY, W, H } = computeLayerBounds(visible);
  App.layerOriginX = minX; App.layerOriginY = minY; App.layerW = W; App.layerH = H;
  const { origC, normalImageData } = buildLayerComposite(visible, W, H, minX, minY);

  App.frames = [{ canvas: origC }];
  App.normalFrames = [normalImageData];
  App.curFrame = 0;
  setProg(100); showProg(false);
  updateDisplay(); buildStrip();
  $('infoBox').innerHTML =
    `<b>${t('layers_sec')}:</b> ${visible.length}/${App.layers.length}<br><b>Size:</b> ${W}×${H}px<br><b>Mode:</b> ${t('combined')}`;
  ['expSheet','expSheetM','expAll'].forEach(id => { const e = $(id); if (e) e.style.display = 'none'; });
  $('playBtn').style.display = 'none';
  setStatus('rdy', `${t('ready')} · ${visible.length} ${t('layers_sec').toLowerCase()}`);
  try { saveRecentNormal(normalImageData, origC); } catch(e){}
  updateLayerCanvasEditable();
}
// Cheap re-composite for interactive dragging — reuses cached per-layer
// normal maps and the bounds frozen at drag-start, so it's just canvas
// draws + one alpha-composite pass, no gradient recomputation.
function dragComposite(){
  if (!App.layerW) return;
  const visible = App.layers.filter(l => l.enabled);
  if (!visible.length) return;
  const { origC, normalImageData } = buildLayerComposite(visible, App.layerW, App.layerH, App.layerOriginX, App.layerOriginY);
  App.frames = [{ canvas: origC }];
  App.normalFrames = [normalImageData];
  updateDisplay();
  drawLayerGizmo();
}

// ── drag-to-move on the preview canvases (mouse + touch) ──
function canvasPointToLayerSpace(cv, clientX, clientY){
  const r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return { x:0, y:0 };
  return { x: (clientX - r.left) * (cv.width / r.width), y: (clientY - r.top) * (cv.height / r.height) };
}
function hitTestLayerAt(px, py){
  if (!App.layerW) return null;
  for (const l of App.layers){ // list order = stacking order, top first
    if (!l.enabled) continue;
    const dx = l.x - App.layerOriginX, dy = l.y - App.layerOriginY;
    if (px >= dx && px < dx + l.canvas.width && py >= dy && py < dy + l.canvas.height) return l;
  }
  return null;
}
function layersEditableNow(){
  return App.mode === 'layers' && App.soloLayerId === null && App.layers.length > 0;
}
function updateLayerCanvasEditable(){
  const on = layersEditableNow();
  const cw = $('cw'); if (cw) cw.classList.toggle('layers-editable', on);
  drawLayerGizmo();
}
// Godot-style selection box drawn over the currently active Sprite2D node
// (whichever layer is being dragged, or the solo'd one) on every visible
// preview canvas, so it tracks regardless of which view tab is open.
function drawLayerGizmo(){
  const activeId = _layerDrag ? _layerDrag.id : App.soloLayerId;
  const l = activeId != null ? App.layers.find(x => x.id === activeId) : null;
  const show = App.mode === 'layers' && l && App.layerW;
  ['boxOrig','boxNorm','boxLit'].forEach(boxId => {
    const box = $(boxId); if (!box) return;
    const frame = box.querySelector('.cv-frame'); if (!frame) return;
    let giz = frame.querySelector('.layer-gizmo');
    if (!show){ if (giz) giz.style.display = 'none'; return; }
    if (!giz){
      giz = document.createElement('div'); giz.className = 'layer-gizmo';
      giz.innerHTML = '<i class="gz-h gz-tl"></i><i class="gz-h gz-tr"></i><i class="gz-h gz-bl"></i><i class="gz-h gz-br"></i>';
      frame.appendChild(giz);
    }
    giz.style.display = 'block';
    const dx = l.x - App.layerOriginX, dy = l.y - App.layerOriginY;
    giz.style.left = (dx / App.layerW * 100) + '%';
    giz.style.top = (dy / App.layerH * 100) + '%';
    giz.style.width = (l.canvas.width / App.layerW * 100) + '%';
    giz.style.height = (l.canvas.height / App.layerH * 100) + '%';
  });
}
let _layerDrag = null;
function wireLayerDragCanvas(cv){
  cv.addEventListener('pointerdown', e => {
    if (!layersEditableNow()) return;
    const p = canvasPointToLayerSpace(cv, e.clientX, e.clientY);
    const hit = hitTestLayerAt(p.x, p.y);
    if (!hit) return;
    e.preventDefault();
    cv.style.cursor = 'grabbing';
    _layerDrag = { id: hit.id, startPX: p.x, startPY: p.y, startX: hit.x, startY: hit.y, cv };
    try { cv.setPointerCapture(e.pointerId); } catch(_){}
    drawLayerGizmo();
  });
  cv.addEventListener('pointermove', e => {
    if (!_layerDrag || _layerDrag.cv !== cv) return;
    e.preventDefault();
    const p = canvasPointToLayerSpace(cv, e.clientX, e.clientY);
    const l = App.layers.find(x => x.id === _layerDrag.id); if (!l) return;
    l.x = Math.round(_layerDrag.startX + (p.x - _layerDrag.startPX));
    l.y = Math.round(_layerDrag.startY + (p.y - _layerDrag.startPY));
    dragComposite();
  });
  const endDrag = e => {
    if (!_layerDrag || _layerDrag.cv !== cv) return;
    try { cv.releasePointerCapture(e.pointerId); } catch(_){}
    cv.style.cursor = '';
    _layerDrag = null;
    recomputeLayers();
    rebuildLayersUI();
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
}
function initLayerDrag(){
  ['cvOrig','cvNorm','cvLit'].forEach(id => { const cv = $(id); if (cv) wireLayerDragCanvas(cv); });
}
