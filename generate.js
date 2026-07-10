// ════════════════════════════════════════════════════════════
// generate.js — input, normal-map generation, display, zoom, export, fill
// ════════════════════════════════════════════════════════════

// ── drag & drop ──
function initDropZones(){
  const dz = $('dropZone');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag'); handleFiles(e.dataTransfer.files); });
  const dn = $('dropNormal');
  dn.addEventListener('dragover', e => { e.preventDefault(); dn.classList.add('drag'); });
  dn.addEventListener('dragleave', () => dn.classList.remove('drag'));
  dn.addEventListener('drop', e => { e.preventDefault(); dn.classList.remove('drag'); loadCustomNormal(e.dataTransfer.files); });
}

// ── file handling ──
function handleFiles(list){
  const files = [...list].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  if (App.mode === 'layers'){ addLayerFiles(files); return; }
  if (App.mode === 'frames' && files.length > 1) loadMulti(files); else loadOne(files[0]);
}
function loadOne(file){
  const r = new FileReader();
  r.onload = e => { const img = new Image(); img.onload = () => {
    App.sheetSrc = img; App.customNormal = null; $('clearNormalBtn').style.display = 'none';
    if (App.mode === 'spritesheet') parseSheet(); else { App.frames = [{ canvas: toC(img) }]; processAll(); }
  }; img.src = e.target.result; };
  r.readAsDataURL(file);
}
function loadMulti(files){
  App.frames = new Array(files.length); let done = 0;
  files.forEach((f, i) => { const r = new FileReader();
    r.onload = e => { const img = new Image(); img.onload = () => {
      App.frames[i] = { canvas: toC(img) }; if (++done === files.length) processAll();
    }; img.src = e.target.result; }; r.readAsDataURL(f); });
}
function parseSheet(){
  if (!App.sheetSrc) return;
  const cols = +$('cols').value || 4, rows = +$('rows').value || 4;
  const fc = +$('frameCount').value || cols*rows, sf = +$('startFrame').value || 0;
  const fw = Math.floor(App.sheetSrc.width/cols), fh = Math.floor(App.sheetSrc.height/rows);
  App.frames = [];
  for (let i = sf; i < Math.min(sf+fc, cols*rows); i++){
    const col = i%cols, row = Math.floor(i/cols);
    const c = document.createElement('canvas'); c.width = fw; c.height = fh;
    c.getContext('2d').drawImage(App.sheetSrc, col*fw, row*fh, fw, fh, 0, 0, fw, fh);
    App.frames.push({ canvas: c });
  }
  processAll();
}
function syncSheet(){
  ['cols','rows','frameCount','startFrame'].forEach((id, i) => {
    $(id).value = $(['mCols','mRows','mFC','mSF'][i]).value; });
  if (App.sheetSrc) parseSheet();
}

// ── custom normal load ──
function loadCustomNormal(list){
  const files = [...list].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  if (!App.frames.length){ toast(t('load_sprite_first')); return; }
  const r = new FileReader();
  r.onload = e => { const img = new Image(); img.onload = () => {
    const fc = App.frames[App.curFrame].canvas;
    const c = document.createElement('canvas'); c.width = fc.width; c.height = fc.height;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, fc.width, fc.height);
    App.customNormal = cx.getImageData(0, 0, fc.width, fc.height);
    $('clearNormalBtn').style.display = 'flex';
    setView('lit', document.querySelector('.vtab:nth-child(4)'));
    renderLit(); applyView();
    toast(t('custom_loaded'));
  }; img.src = e.target.result; };
  r.readAsDataURL(files[0]);
}
function clearCustomNormal(){
  App.customNormal = null; $('clearNormalBtn').style.display = 'none';
  renderLit(); toast(t('back_generated'));
}

// ── generation pipeline ──
async function processAll(){
  if (!App.frames.length) return;
  setStatus('proc', 'Processing…'); showProg(true); App.normalFrames = [];
  for (let i = 0; i < App.frames.length; i++){
    setProg((i / App.frames.length) * 100);
    await new Promise(r => setTimeout(r, 0));
    App.normalFrames.push(genNormal(App.frames[i].canvas));
  }
  setProg(100); App.curFrame = 0; updateDisplay(); buildStrip(); showProg(false);
  const f = App.frames[0].canvas;
  $('infoBox').innerHTML =
    `<b>Frames:</b> ${App.frames.length}<br><b>Size:</b> ${f.width}×${f.height}px<br><b>Mode:</b> ${App.mode}<br><b>Filter:</b> ${App.filterType}`;
  const m = App.frames.length > 1;
  ['expSheet','expSheetM','expAll'].forEach(id => { const e = $(id); if (e) e.style.display = m ? 'flex' : 'none'; });
  $('playBtn').style.display = m ? 'flex' : 'none';
  setStatus('rdy', `Ready · ${App.frames.length} frame${m ? 's' : ''}`);
  try { saveRecentNormal(App.normalFrames[0], App.frames[0].canvas); } catch(e){}
}

function genNormal(src){
  if (App.engine === 'x') return genNormalX(src);
  return genNormalClassic(src);
}
function genNormalClassic(src){
  const strength = +$('sStr').value;
  const level    = +$('sLevel').value;
  const blurAmt  = +$('sBlur').value;
  const zRange   = +$('sZ').value;
  const w = src.width, h = src.height;
  const pix = src.getContext('2d').getImageData(0, 0, w, h);

  let H = new Float32Array(w*h);
  for (let i = 0; i < w*h; i++){
    const a = pix.data[i*4+3]/255;
    H[i] = (0.299*pix.data[i*4] + 0.587*pix.data[i*4+1] + 0.114*pix.data[i*4+2]) / 255 * a;
  }
  if (App.invert.h) for (let i = 0; i < w*h; i++) H[i] = 1 - H[i];
  if (blurAmt > 0) H = blur(H, w, h, Math.max(1, Math.round(blurAmt)));

  const step = Math.max(1, Math.round(11 - level));
  const out = new Uint8ClampedArray(w*h*4);
  const S = (x, y) => H[Math.max(0,Math.min(h-1,y))*w + Math.max(0,Math.min(w-1,x))];

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const s00=S(x-step,y-step), s10=S(x,y-step), s20=S(x+step,y-step),
          s01=S(x-step,y),                        s21=S(x+step,y),
          s02=S(x-step,y+step), s12=S(x,y+step), s22=S(x+step,y+step);
    let dx, dy;
    if (App.filterType === 'scharr'){
      dx = (-3*s00-10*s01-3*s02 + 3*s20+10*s21+3*s22)/16;
      dy = (-3*s00-10*s10-3*s20 + 3*s02+10*s12+3*s22)/16;
    } else {
      dx = (-s00-2*s01-s02 + s20+2*s21+s22)/4;
      dy = (-s00-2*s10-s20 + s02+2*s12+s22)/4;
    }
    dx *= strength; dy *= strength;
    let nx = App.invert.r ? dx : -dx;
    let ny = App.invert.g ? -dy : dy;
    let nz = zRange;
    const len = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1; nx/=len; ny/=len; nz/=len;
    const i = (y*w+x)*4;
    out[i]   = Math.round((nx*.5+.5)*255);
    out[i+1] = Math.round((ny*.5+.5)*255);
    out[i+2] = Math.round((nz*.5+.5)*255);
    out[i+3] = pix.data[i+3];
  }
  return new ImageData(out, w, h);
}

// ── lit preview (static lights, used in main view) ──
function renderLit(){
  if (!App.frames.length) return;
  const src = App.frames[App.curFrame].canvas;
  const nd = App.customNormal || App.normalFrames[App.curFrame]; if (!nd) return;
  const w = src.width, h = src.height;
  const cl = $('cvLit'); cl.width = w; cl.height = h;
  const ctx = cl.getContext('2d');
  const sd = src.getContext('2d').getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const PL = App.lights.filter(l => l.enabled).map(l => {
    const lr = parseInt(l.color.slice(1,3),16)/255, lg = parseInt(l.color.slice(3,5),16)/255, lb = parseInt(l.color.slice(5,7),16)/255;
    const ll = Math.sqrt(l.x**2+l.y**2+l.z**2) || 1;
    return { r:lr, g:lg, b:lb, int:l.intensity, lx:l.x/ll, ly:l.y/ll, lz:l.z/ll };
  });
  const AMB = 0.14;
  for (let i = 0; i < w*h; i++){
    const idx = i*4;
    const nx = nd.data[idx]/255*2-1, ny = nd.data[idx+1]/255*2-1, nz = nd.data[idx+2]/255*2-1;
    const a = sd.data[idx+3]; if (a === 0){ out.data[idx+3]=0; continue; }
    let tr=AMB, tg=AMB, tb=AMB;
    PL.forEach(L => {
      const diff = Math.max(0, nx*L.lx+ny*L.ly+nz*L.lz) * L.int;
      const hx=L.lx, hy=L.ly, hz=L.lz+1, hl=Math.sqrt(hx*hx+hy*hy+hz*hz)||1;
      const sp = Math.pow(Math.max(0, nx*(hx/hl)+ny*(hy/hl)+nz*(hz/hl)), 24) * 0.35 * L.int;
      tr += diff*L.r+sp*L.r; tg += diff*L.g+sp*L.g; tb += diff*L.b+sp*L.b;
    });
    out.data[idx]   = Math.min(255, sd.data[idx]   * tr * 1.25);
    out.data[idx+1] = Math.min(255, sd.data[idx+1] * tg * 1.25);
    out.data[idx+2] = Math.min(255, sd.data[idx+2] * tb * 1.25);
    out.data[idx+3] = a;
  }
  ctx.putImageData(out, 0, 0); applyZoomToCanvas('cvLit', w, h);
  $('lightSrcLbl').textContent = App.customNormal ? 'using custom normal map' : '';
}

// ── zoom ──
function applyZoomToCanvas(id, w, h){
  const c = $(id);
  c.style.width = Math.round(w*App.zoomScale)+'px';
  c.style.height = Math.round(h*App.zoomScale)+'px';
}
function applyZoom(){
  if (!App.frames.length) return;
  const w = App.frames[App.curFrame].canvas.width, h = App.frames[App.curFrame].canvas.height;
  ['cvOrig','cvNorm','cvLit'].forEach(id => applyZoomToCanvas(id, w, h));
  $('zval').textContent = Math.round(App.zoomScale*100)+'%';
}
function zoom(d){
  const steps = [0.25,0.33,0.5,0.67,0.75,1,1.25,1.5,2,3,4,6,8];
  const c = steps.findIndex(s => Math.abs(s-App.zoomScale)<.01);
  App.zoomScale = steps[Math.max(0, Math.min(steps.length-1, (c===-1?5:c)+d))];
  App.zoomAuto = false; applyZoom();
}
function zoomFit(){
  if (!App.frames.length) return;
  const cw = $('cw'), aw = cw.clientWidth-40, ah = cw.clientHeight-40;
  const fw = App.frames[App.curFrame].canvas.width, fh = App.frames[App.curFrame].canvas.height;
  const boxes = App.viewMode==='split' ? 2 : 1, tw = fw*boxes+(boxes-1)*16;
  App.zoomScale = Math.max(0.1, Math.min(8, Math.min(aw/tw, ah/fh)));
  App.zoomAuto = false; applyZoom();
}
function zoomReset(){ App.zoomScale = 1; App.zoomAuto = false; applyZoom(); }
function autoZoom(){
  if (!App.frames.length) return;
  const fw = App.frames[App.curFrame].canvas.width, fh = App.frames[App.curFrame].canvas.height;
  if (fw < 200 || fh < 200) App.zoomScale = Math.min(8, 200/Math.min(fw, fh));
  else {
    const cw = $('cw'), aw = cw.clientWidth-40, ah = cw.clientHeight-40;
    const boxes = App.viewMode==='split' ? 2 : 1, tw = fw*boxes+(boxes-1)*16;
    App.zoomScale = Math.max(0.1, Math.min(8, Math.min(aw/tw, ah/fh)));
  }
  $('zval').textContent = Math.round(App.zoomScale*100)+'%';
}

// ── display ──
function updateDisplay(){
  if (!App.frames.length || !App.normalFrames.length) return;
  $('emptyState').style.display = 'none';
  $('previews').style.display = 'flex';
  const src = App.frames[App.curFrame].canvas, nd = App.normalFrames[App.curFrame], w = src.width, h = src.height;
  const co = $('cvOrig'); co.width = w; co.height = h; co.getContext('2d').drawImage(src, 0, 0);
  const cn = $('cvNorm'); cn.width = w; cn.height = h; cn.getContext('2d').putImageData(nd, 0, 0);
  renderLit();
  if (App.zoomAuto) autoZoom(); applyZoom(); applyView();
}
function applyView(){
  const b = { boxOrig:false, boxNorm:false, boxLit:false, boxAO:false };
  if (App.viewMode==='split'){ b.boxOrig=b.boxNorm=true; b.boxAO = (typeof aoEnabled!=='undefined' && aoEnabled); }
  else if (App.viewMode==='orig') b.boxOrig=true;
  else if (App.viewMode==='norm'){ b.boxNorm=true; b.boxAO = (typeof aoEnabled!=='undefined' && aoEnabled); }
  else if (App.viewMode==='lit') b.boxLit=true;
  Object.keys(b).forEach(k => { const e=$(k); if (e) e.style.display = b[k] ? 'flex' : 'none'; });
}

// ── frame strip ──
function buildStrip(){
  const strip = $('strip'), row = $('framesRow');
  row.innerHTML = ''; $('fcLbl').textContent = App.frames.length;
  if (App.frames.length <= 1){ strip.classList.remove('on'); return; }
  strip.classList.add('on');
  App.frames.forEach((f, i) => {
    const th = document.createElement('div'); th.className = 'fthumb' + (i===0?' on':'');
    const tc = document.createElement('canvas'); tc.width = f.canvas.width; tc.height = f.canvas.height;
    tc.getContext('2d').drawImage(f.canvas, 0, 0); th.appendChild(tc);
    const n = document.createElement('span'); n.className = 'fnum'; n.textContent = i; th.appendChild(n);
    th.onclick = () => selectFrame(i); row.appendChild(th);
  });
}
function selectFrame(i){
  App.curFrame = i; qsa('.fthumb').forEach((el, j) => el.classList.toggle('on', j===i)); updateDisplay();
}
function togglePlay(){
  App.playing = !App.playing;
  $('playIco').textContent = App.playing ? 'pause' : 'play_arrow';
  $('playTxt').textContent = App.playing ? 'Pause' : 'Play';
  if (App.playing){ const fps = +$('fpsIn').value || 8;
    App.playIv = setInterval(() => { App.curFrame = (App.curFrame+1) % App.frames.length; selectFrame(App.curFrame); }, 1000/fps);
  } else clearInterval(App.playIv);
}

// ── modes / views / filters ──
function setMode(m, btn){
  App.mode = m; qsa('.tab').forEach(el => el.classList.remove('on'));
  qsa('.tab').forEach(el => { const t = el.textContent.trim().toLowerCase();
    if ((m==='single'&&t==='single')||(m==='spritesheet'&&t==='sheet')||(m==='frames'&&t==='frames')||(m==='layers'&&t==='layers')) el.classList.add('on'); });
  const sh = m==='spritesheet', ly = m==='layers';
  ['sheetCfg','shSheetCfg'].forEach(id => { const e = $(id); if (e) e.style.display = sh ? 'block' : 'none'; });
  ['layersCfg','shLayersCfg'].forEach(id => { const e = $(id); if (e) e.style.display = ly ? 'block' : 'none'; });
  $('fileInput').multiple = (m==='frames'||m==='layers');
  const fm = $('fileInputM'); if (fm) fm.multiple = (m==='frames'||m==='layers');
  if (ly && App.layers.length) recomputeLayers();
  else updateLayerCanvasEditable();
}
function setView(v, btn){
  App.viewMode = v; qsa('.vtab').forEach(el => el.classList.remove('on'));
  if (btn) btn.classList.add('on'); applyView();
  if (App.zoomAuto) autoZoom(); applyZoom();
}
function setFilter(f, btn){
  App.filterType = f;
  $('filtSobel').classList.toggle('on', f==='sobel');
  $('filtScharr').classList.toggle('on', f==='scharr');
  const ms = $('mFiltSobel'), mc = $('mFiltScharr');
  if (ms) ms.classList.toggle('on', f==='sobel'); if (mc) mc.classList.toggle('on', f==='scharr');
  LP();
}
function toggleInv(k, el){
  App.invert[k] = !App.invert[k]; el.classList.toggle('on', App.invert[k]);
  const map = { r:['invR','mInvR'], g:['invG','mInvG'], h:['invH','mInvH'] };
  map[k].forEach(id => { const e = $(id); if (e) e.classList.toggle('on', App.invert[k]); });
  LP();
}
function resetGen(){
  const d = { sStr:2.5, sLevel:7, sBlur:1, sZ:0.5 };
  Object.entries(d).forEach(([id, v]) => { $(id).value = v; });
  sv('vStr', {value:2.5}, 1); sv('vLevel', {value:7}, 1); sv('vBlur', {value:1}, 1); sv('vZ', {value:0.5}, 2);
  ['msStr','msLevel','msBlur','msZ'].forEach((id, i) => { const e = $(id); if (e) e.value = [2.5,7,1,0.5][i]; });
  App.invert = { r:false, g:false, h:false };
  ['invR','invG','invH','mInvR','mInvG','mInvH'].forEach(id => { const e = $(id); if (e) e.classList.remove('on'); });
  setFilter('sobel'); LP(); toast(t('reset_done'));
}

// ── export ──
function exportSingle(){
  if (!App.normalFrames.length){ toast(t('generate_first')); return; }
  const c = document.createElement('canvas'); const nd = App.normalFrames[App.curFrame];
  c.width = nd.width; c.height = nd.height; c.getContext('2d').putImageData(nd, 0, 0);
  dl(c, `normal_${String(App.curFrame).padStart(4,'0')}.png`); toast(t('saved'));
}
function exportSpritesheet(){
  if (!App.normalFrames.length) return;
  const fw = App.normalFrames[0].width, fh = App.normalFrames[0].height;
  const cols = +$('cols').value || 4, rows = Math.ceil(App.normalFrames.length/cols);
  const c = document.createElement('canvas'); c.width = fw*cols; c.height = fh*rows;
  const ctx = c.getContext('2d');
  App.normalFrames.forEach((nd, i) => {
    const t = document.createElement('canvas'); t.width = fw; t.height = fh;
    t.getContext('2d').putImageData(nd, 0, 0); ctx.drawImage(t, (i%cols)*fw, Math.floor(i/cols)*fh);
  });
  dl(c, 'normal_spritesheet.png'); toast(t('saved_sheet'));
}
async function exportAll(){
  if (!App.normalFrames.length) return;
  for (let i = 0; i < App.normalFrames.length; i++){
    const c = document.createElement('canvas'); const nd = App.normalFrames[i];
    c.width = nd.width; c.height = nd.height; c.getContext('2d').putImageData(nd, 0, 0);
    await new Promise(r => setTimeout(r, 60)); dl(c, `normal_${String(i).padStart(4,'0')}.png`);
  }
  toast(t('all_saved'));
}
// ════════════ GODOT INTEGRATION ════════════
function hexToGdColor(hex){
  const r = (parseInt(hex.slice(1,3),16)/255).toFixed(3);
  const g = (parseInt(hex.slice(3,5),16)/255).toFixed(3);
  const b = (parseInt(hex.slice(5,7),16)/255).toFixed(3);
  return `Color(${r}, ${g}, ${b})`;
}
function genUid(){
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = 'uid://';
  for (let i = 0; i < 13; i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}
function godotBaseName(){
  if (App.mode === 'layers') return 'normal_layers_combined';
  if (App.frames.length > 1) return `normal_frame_${String(App.curFrame).padStart(4,'0')}`;
  return 'normal_map';
}
// Builds a GDScript body (tab-indented) recreating the lights configured
// in the app's own Lights panel — this is real app state, not a placeholder.
function godotLightsBody(){
  const lights = App.lights.filter(l => l.enabled);
  if (!lights.length){
    return `\tvar light := PointLight2D.new()\n\tlight.color = Color(1, 1, 1)\n\tlight.energy = 1.0\n\tadd_child(light)`;
  }
  return lights.map((l, i) => {
    const v = lights.length > 1 ? `light${i+1}` : 'light';
    return `\tvar ${v} := PointLight2D.new()\n\t${v}.color = ${hexToGdColor(l.color)}\n\t${v}.energy = ${l.intensity.toFixed(2)}\n\t${v}.position = Vector2(${Math.round(l.x*80)}, ${Math.round(-l.y*80)})\n\t${v}.shadow_enabled = true\n\tadd_child(${v})`;
  }).join('\n');
}
function copyGodot(){
  const s = `# Normal-Godot — Godot 4
# 1. Import the normal map PNG as a Texture2D
# 2. Sprite2D -> CanvasItemMaterial -> Normal Map -> assign the texture
# 3. Lights matching your current preview:
${godotLightsBody().replace(/\t/g, '')}`;
  copyToClipboard(s).then(() => toast(t('copied_snippet')), () => toast(t('copy_failed')));
}

// ════════════ FILL NORMALS TOOL ════════════
function openFill(){
  if (!App.frames.length){ toast(t('load_sprite_first'));
    $('htabGen').classList.add('on'); $('htabFill').classList.remove('on'); return; }
  $('fillModal').classList.add('open'); renderFillPreview();
}
function closeFill(){
  $('fillModal').classList.remove('open');
  $('htabGen').classList.add('on'); $('htabFill').classList.remove('on');
}
function setFillShape(s, btn){
  App.fillShape = s; $('fillRadial').classList.toggle('on', s==='radial');
  $('fillConic').classList.toggle('on', s==='conic'); renderFillPreview();
}
function genFill(){
  const src = App.frames[App.curFrame].canvas, w = src.width, h = src.height;
  const sd = src.getContext('2d').getImageData(0, 0, w, h);
  const curve = +$('sFillCurve').value, radMul = +$('sFillRad').value;
  let minX=w, maxX=0, minY=h, maxY=0, any=false;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){ if (sd.data[(y*w+x)*4+3]>20){ any=true;
    if (x<minX)minX=x; if (x>maxX)maxX=x; if (y<minY)minY=y; if (y>maxY)maxY=y; } }
  if (!any){ minX=0; maxX=w-1; minY=0; maxY=h-1; }
  const cx=(minX+maxX)/2, cy=(minY+maxY)/2, maxR=Math.max(maxX-cx, maxY-cy)*radMul || 1;
  const out = new Uint8ClampedArray(w*h*4);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){
    const i=(y*w+x)*4; const a=sd.data[i+3]; let nx=0,ny=0,nz=1;
    if (a>0){ const dx=(x-cx)/maxR, dy=(y-cy)/maxR;
      if (App.fillShape==='radial'){
        const d=Math.min(1, Math.sqrt(dx*dx+dy*dy)); const ang=Math.pow(d, curve); const dir=Math.atan2(dy, dx);
        nx=Math.cos(dir)*ang; ny=-Math.sin(dir)*ang; nz=Math.sqrt(Math.max(0.01, 1-nx*nx-ny*ny));
      } else {
        nx=Math.max(-1,Math.min(1,dx*curve)); ny=Math.max(-1,Math.min(1,-dy*curve)); nz=Math.sqrt(Math.max(0.01,1-nx*nx-ny*ny));
      }
      const l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1; nx/=l; ny/=l; nz/=l;
    }
    out[i]=Math.round((nx*.5+.5)*255); out[i+1]=Math.round((ny*.5+.5)*255);
    out[i+2]=Math.round((nz*.5+.5)*255); out[i+3]=a;
  }
  return new ImageData(out, w, h);
}
function renderFillPreview(){
  if (!App.frames.length) return; const fill = genFill();
  const c = $('cvFill'); c.width = fill.width; c.height = fill.height; c.getContext('2d').putImageData(fill, 0, 0);
}
function applyFill(){
  if (!App.frames.length) return; App.customNormal = genFill();
  $('clearNormalBtn').style.display = 'flex'; closeFill();
  setView('lit', document.querySelector('.vtab:nth-child(4)')); renderLit(); applyView(); toast(t('fill_applied'));
}
function downloadFill(){
  if (!App.frames.length) return; const fill = genFill();
  const c = document.createElement('canvas'); c.width = fill.width; c.height = fill.height;
  c.getContext('2d').putImageData(fill, 0, 0); dl(c, 'normal_fill.png'); toast(t('fill_saved'));
}

// ════════════ GODOT .import EXPORT ════════════
function godotImportConfig(base, isNormal){
  return `[remap]

importer="texture"
type="CompressedTexture2D"
uid="${genUid()}"
path="res://.godot/imported/${base}.png-generated.ctex"

[deps]

source_file="res://${base}.png"
dest_files=["res://.godot/imported/${base}.png-generated.ctex"]

[params]

compress/mode=0
compress/high_quality=false
compress/lossy_quality=0.7
compress/hdr_compression=1
compress/normal_map=${isNormal ? 1 : 0}
compress/channel_pack=0
mipmaps/generate=false
roughness/mode=0
process/fix_alpha_border=true
process/premult_alpha=false
process/normal_map_invert_y=false
detect_3d/compress_to=0
`;
}
function copyGodotImport(){
  if (!App.normalFrames.length){ toast(t('generate_first')); return; }
  const name = godotBaseName();
  copyToClipboard(godotImportConfig(name, true)).then(
    () => toast(`${t('copied_import')} — ${name}.png.import`),
    () => toast(t('copy_failed'))
  );
}

// ════════════ GODOT PACKAGE EXPORT (drop-in ready) ════════════
// Downloads a matched set of files that can be copied straight into a Godot
// 4 project: the original sprite, the generated normal map, correct .import
// configs for both (filenames match exactly, so Godot recognizes them),
// a CanvasTexture .tres wiring diffuse+normal together, a GDScript that
// recreates the exact lights configured in the app, and a short README.
function godotTres(name){
  return `[gd_resource type="CanvasTexture" load_steps=3 format=3]

[ext_resource type="Texture2D" path="res://${name}_diffuse.png" id="1"]
[ext_resource type="Texture2D" path="res://${name}.png" id="2"]

[resource]
diffuse_texture = ExtResource("1")
normal_texture = ExtResource("2")
`;
}
function godotLightsScript(){
  return `extends Node
# Generated by Normal-Godot — recreates the lights from your preview.
# Attach this to the Sprite2D (or a parent Node2D) and call setup_lights()
# from _ready(), or copy the body into your own script.

func setup_lights() -> void:
${godotLightsBody()}
`;
}
function godotReadme(name){
  return `Normal-Godot export package
============================

Files in this package:
  ${name}_diffuse.png        - your original sprite
  ${name}.png                - generated normal map
  ${name}_diffuse.png.import - import settings for the sprite
  ${name}.png.import         - import settings for the normal map (flagged as a normal map)
  ${name}_material.tres      - CanvasTexture combining both, ready to assign
  ${name}_lights.gd          - script recreating your current light setup

Setup in Godot 4:
  1. Copy ALL of these files into your project folder (e.g. res://sprites/).
  2. Focus the Godot editor - it re-imports the new files automatically.
     If you see a uid mismatch warning, ignore it: Godot regenerates uids
     on first import, this file just needs to exist.
  3. On your Sprite2D, set Texture = ${name}_material.tres
  4. Attach ${name}_lights.gd to the Sprite2D (or a parent Node2D), then
     call setup_lights() from _ready() - or copy its body into your own script.

Generated by Normal-Godot beta.
`;
}
async function exportGodotPackage(){
  if (!App.normalFrames.length){ toast(t('generate_first')); return; }
  const name = godotBaseName();
  const nd = App.normalFrames[App.curFrame];
  const srcCanvas = App.frames[App.curFrame].canvas;
  const normalC = document.createElement('canvas'); normalC.width = nd.width; normalC.height = nd.height;
  normalC.getContext('2d').putImageData(nd, 0, 0);

  toast(t('godot_pkg_building'));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  dl(srcCanvas, `${name}_diffuse.png`); await wait(180);
  dl(normalC, `${name}.png`); await wait(180);
  downloadText(`${name}_diffuse.png.import`, godotImportConfig(name + '_diffuse', false)); await wait(180);
  downloadText(`${name}.png.import`, godotImportConfig(name, true)); await wait(180);
  downloadText(`${name}_material.tres`, godotTres(name)); await wait(180);
  downloadText(`${name}_lights.gd`, godotLightsScript()); await wait(180);
  downloadText(`README_Godot.txt`, godotReadme(name));

  toast(t('godot_pkg_done'));
}

// ════════════ TILESHEET EXPORT (custom grid) ════════════
function exportTilesheet(){
  if (!App.normalFrames.length){ toast(t('generate_first')); return; }
  $('tileCount').value = Math.ceil(Math.sqrt(App.normalFrames.length));
  $('tileModal').classList.add('open');
}
function confirmTilesheet(){
  $('tileModal').classList.remove('open');
  let perRow = parseInt($('tileCount').value);
  if (!perRow || perRow < 1) perRow = Math.ceil(Math.sqrt(App.normalFrames.length));
  const fw = App.normalFrames[0].width, fh = App.normalFrames[0].height;
  const cols = Math.min(perRow, App.normalFrames.length);
  const rows = Math.ceil(App.normalFrames.length / cols);
  const c = document.createElement('canvas'); c.width = fw*cols; c.height = fh*rows;
  const ctx = c.getContext('2d');
  App.normalFrames.forEach((nd, i) => {
    const t2 = document.createElement('canvas'); t2.width = fw; t2.height = fh;
    t2.getContext('2d').putImageData(nd, 0, 0);
    ctx.drawImage(t2, (i%cols)*fw, Math.floor(i/cols)*fh);
  });
  dl(c, `normal_tilesheet_${cols}x${rows}.png`); toast(t('saved_sheet'));
}

// ════════════════════════════════════════════════════════════
// EXPERIMENTAL ENGINE (X) — multi-scale, alpha-aware generation
// ════════════════════════════════════════════════════════════
// Classic engine multiplies luminance by alpha: at the silhouette this creates
// a huge false gradient → a "halo" ring of tilted normals around every sprite.
// X engine: (1) bleeds edge colors outward and does NOT multiply by alpha,
// (2) blends three gradient octaves (fine/mid/coarse) for volume + detail,
// (3) optionally adds a smoothed distance-transform dome for body volume,
// (4) smooths the final normal field.

function bleedColors(pix, w, h, iterations){
  const data = new Uint8ClampedArray(pix.data);
  const filled = new Uint8Array(w*h);
  for (let i = 0; i < w*h; i++) filled[i] = pix.data[i*4+3] > 10 ? 1 : 0;
  for (let it = 0; it < iterations; it++){
    const prev = new Uint8Array(filled);
    const src = new Uint8ClampedArray(data);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const p = y*w+x;
      if (prev[p]) continue;
      let r=0,g=0,b=0,n=0;
      for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++){
        const nx=x+dx, ny=y+dy;
        if (nx<0||ny<0||nx>=w||ny>=h) continue;
        const q = ny*w+nx;
        if (prev[q]){ const j=q*4; r+=src[j]; g+=src[j+1]; b+=src[j+2]; n++; }
      }
      if (n){ const i=p*4; data[i]=r/n; data[i+1]=g/n; data[i+2]=b/n; filled[p]=1; }
    }
  }
  return data;
}

// smoothed chamfer distance dome (0..255), heavy blur kills faceting
function domeHeight(pix, w, h){
  const INF = 1e9;
  const dist = new Float32Array(w*h);
  for (let i = 0; i < w*h; i++) dist[i] = pix.data[i*4+3] > 20 ? INF : 0;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){ const i=y*w+x; if (dist[i]===0) continue; let m=dist[i];
    if (x>0) m=Math.min(m,dist[i-1]+1); if (y>0) m=Math.min(m,dist[i-w]+1);
    if (x>0&&y>0) m=Math.min(m,dist[i-w-1]+1.414); if (x<w-1&&y>0) m=Math.min(m,dist[i-w+1]+1.414); dist[i]=m; }
  for (let y=h-1;y>=0;y--) for (let x=w-1;x>=0;x--){ const i=y*w+x; if (dist[i]===0) continue; let m=dist[i];
    if (x<w-1) m=Math.min(m,dist[i+1]+1); if (y<h-1) m=Math.min(m,dist[i+w]+1);
    if (x<w-1&&y<h-1) m=Math.min(m,dist[i+w+1]+1.414); if (x>0&&y<h-1) m=Math.min(m,dist[i+w-1]+1.414); dist[i]=m; }
  let max=0; for (let i=0;i<w*h;i++) if (dist[i]<INF && dist[i]>max) max=dist[i];
  if (max<1) max=1;
  let out = new Float32Array(w*h);
  for (let i=0;i<w*h;i++){ const d = dist[i]>=INF ? 0 : dist[i]; out[i] = Math.sqrt(Math.min(1, d/max))*255; }
  out = blur(out,w,h,3); out = blur(out,w,h,3); out = blur(out,w,h,2);
  return out;
}

function scharrGrad(H, w, h, step){
  const S=(x,y)=>H[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];
  const DX=new Float32Array(w*h), DY=new Float32Array(w*h);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){
    const s00=S(x-step,y-step),s10=S(x,y-step),s20=S(x+step,y-step),
          s01=S(x-step,y),                     s21=S(x+step,y),
          s02=S(x-step,y+step),s12=S(x,y+step),s22=S(x+step,y+step);
    DX[y*w+x]=(-3*s00-10*s01-3*s02+3*s20+10*s21+3*s22)/16;
    DY[y*w+x]=(-3*s00-10*s10-3*s20+3*s02+10*s12+3*s22)/16;
  }
  return {DX,DY};
}

function genNormalX(src){
  const strength = +$('sStr').value;
  const zRange   = +$('sZ').value;
  const detail   = +$('sXDetail').value;
  const volume   = +$('sXVolume').value;
  const shapeAmt = +$('sXShape').value;
  const smooth   = +$('sXSmooth').value;
  const crisp    = +($('sXCrisp') ? $('sXCrisp').value : 0);
  const w = src.width, h = src.height;
  const pix = src.getContext('2d').getImageData(0, 0, w, h);

  // 1. alpha-aware height (bleed instead of alpha-multiply → no silhouette halo)
  // 10 iterations (up from 8) reaches further past the silhouette, further
  // reducing gradient noise right at sprite edges.
  const bled = bleedColors(pix, w, h, 10);
  let H = new Float32Array(w*h);
  for (let i = 0; i < w*h; i++)
    H[i] = (0.299*bled[i*4] + 0.587*bled[i*4+1] + 0.114*bled[i*4+2]) / 255;
  if (App.invert.h) for (let i = 0; i < w*h; i++) H[i] = 1 - H[i];

  // 2. multi-scale octaves
  const Hm = blur(H, w, h, 2);
  const Hc = blur(H, w, h, 6);
  const gF = scharrGrad(H,  w, h, 1);
  const gM = scharrGrad(Hm, w, h, 2);
  const gC = scharrGrad(Hc, w, h, 4);

  // 3. optional dome component
  let gD = null;
  if (shapeAmt > 0){
    const dome = domeHeight(pix, w, h);
    const Dn = new Float32Array(w*h);
    for (let i = 0; i < w*h; i++) Dn[i] = dome[i]/255;
    gD = scharrGrad(Dn, w, h, 2);
  }

  // 4. combine → normals in float buffers
  const NX = new Float32Array(w*h), NY = new Float32Array(w*h), NZ = new Float32Array(w*h);
  const midW = 0.5;
  for (let i = 0; i < w*h; i++){
    let dx = strength * (detail*gF.DX[i] + midW*gM.DX[i] + volume*gC.DX[i]);
    let dy = strength * (detail*gF.DY[i] + midW*gM.DY[i] + volume*gC.DY[i]);
    if (gD){ dx += strength * shapeAmt * 1.6 * gD.DX[i]; dy += strength * shapeAmt * 1.6 * gD.DY[i]; }
    let nx = App.invert.r ? dx : -dx;
    let ny = App.invert.g ? -dy : dy;
    let nz = zRange;
    const len = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
    NX[i]=nx/len; NY[i]=ny/len; NZ[i]=nz/len;
  }

  // 5. normal-field smoothing (rounds angular transitions)
  if (smooth > 0){
    const TX = blur(NX,w,h,1), TY = blur(NY,w,h,1), TZ = blur(NZ,w,h,1);
    for (let i = 0; i < w*h; i++){
      let nx = NX[i]*(1-smooth)+TX[i]*smooth;
      let ny = NY[i]*(1-smooth)+TY[i]*smooth;
      let nz = NZ[i]*(1-smooth)+TZ[i]*smooth;
      const l = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
      NX[i]=nx/l; NY[i]=ny/l; NZ[i]=nz/l;
    }
  }

  // 5b. micro-contrast — unsharp-mask the normal field back up. Smoothing
  // (step 5) rounds off fine surface texture; this restores crispness
  // without reintroducing the hard angular artifacts smoothing removed.
  if (crisp > 0){
    const BX = blur(NX,w,h,2), BY = blur(NY,w,h,2);
    for (let i = 0; i < w*h; i++){
      let nx = NX[i] + (NX[i]-BX[i])*crisp*1.5;
      let ny = NY[i] + (NY[i]-BY[i])*crisp*1.5;
      let nz = NZ[i];
      const l = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
      NX[i]=nx/l; NY[i]=ny/l; NZ[i]=nz/l;
    }
  }

  // 6. write with ORIGINAL alpha
  const out = new Uint8ClampedArray(w*h*4);
  for (let i = 0; i < w*h; i++){
    const idx = i*4;
    out[idx]   = Math.round((NX[i]*.5+.5)*255);
    out[idx+1] = Math.round((NY[i]*.5+.5)*255);
    out[idx+2] = Math.round((NZ[i]*.5+.5)*255);
    out[idx+3] = pix.data[idx+3];
  }
  return new ImageData(out, w, h);
}

// Quick-apply combos for the X sliders — a fast starting point that can
// still be fine-tuned afterwards.
function setXPreset(name){
  const P = {
    soft:     { detail:0.30, volume:0.70, shape:0.50, smooth:0.50, crisp:0.05 },
    balanced: { detail:0.50, volume:0.60, shape:0.40, smooth:0.30, crisp:0.25 },
    crisp:    { detail:0.85, volume:0.50, shape:0.30, smooth:0.10, crisp:0.55 },
  };
  const p = P[name]; if (!p) return;
  const ids = ['sXDetail','sXVolume','sXShape','sXSmooth','sXCrisp'];
  const mids = ['msXDetail','msXVolume','msXShape','msXSmooth','msXCrisp'];
  const vids = ['vXDetail','vXVolume','vXShape','vXSmooth','vXCrisp'];
  const mvids = ['mvXDetail','mvXVolume','mvXShape','mvXSmooth','mvXCrisp'];
  const vals = [p.detail, p.volume, p.shape, p.smooth, p.crisp];
  ids.forEach((id,i) => { const e=$(id); if (e) e.value = vals[i]; });
  mids.forEach((id,i) => { const e=$(id); if (e) e.value = vals[i]; });
  vids.forEach((id,i) => sv(id, {value:vals[i]}, 2));
  mvids.forEach((id,i) => sv(id, {value:vals[i]}, 2));
  LP(); toast(t('preset_applied'));
}
function setEngine(e, btn){
  App.engine = e;
  $('engClassic').classList.toggle('on', e==='classic');
  $('engX').classList.toggle('on', e==='x');
  const me1=$('mEngClassic'), me2=$('mEngX');
  if (me1) me1.classList.toggle('on', e==='classic');
  if (me2) me2.classList.toggle('on', e==='x');
  $('xPanel').style.display = e==='x' ? 'block' : 'none';
  const mx=$('mXPanel'); if (mx) mx.style.display = e==='x' ? 'block' : 'none';
  $('classicPanel').style.display = e==='x' ? 'none' : 'block';
  const mc=$('mClassicPanel'); if (mc) mc.style.display = e==='x' ? 'none' : 'block';
  LP();
}
