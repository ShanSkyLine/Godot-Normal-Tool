// ════════════════════════════════════════════════════════════
// core.js — shared state, utilities, recent-normals pool
// ════════════════════════════════════════════════════════════

// Global app state (attached to window so modules can share)
const App = {
  mode: 'single',
  frames: [],          // [{canvas}]
  normalFrames: [],    // [ImageData]
  curFrame: 0,
  viewMode: 'split',
  playing: false, playIv: null,
  lpTimer: null, sheetSrc: null,
  zoomScale: 1, zoomAuto: true,
  filterType: 'sobel',
  engine: 'classic',
  invert: { r:false, g:false, h:false },
  customNormal: null,  // ImageData
  fillShape: 'radial',
  lights: [{ id:1, name:'Main', color:'#ffffff', intensity:1.0, x:0.4, y:-0.4, z:0.82, enabled:true }],
  nextLightId: 2,
  recentPairs: [],     // {id,name,sprite,normal,w,h}
  layers: [],          // [{id,name,canvas,enabled,x,y,_normalCache}] — top of array = top of stack
  nextLayerId: 1,
  soloLayerId: null,   // null = combined view, otherwise preview a single layer
  layerW: 0, layerH: 0, layerOriginX: 0, layerOriginY: 0, // last composited layer canvas bounds
};
const LC = ['#ffffff','#4488ff','#ff8844','#44ffaa','#ff44aa','#ffee44'];

// ── DOM/format helpers ──
function $(id){ return document.getElementById(id); }
function qsa(s){ return document.querySelectorAll(s); }
function sv(vid, el, dec){ $(vid).textContent = parseFloat(el.value).toFixed(dec); }
function msync(mId, dId, mVid, dVid, dec){
  const v = $(mId).value; $(dId).value = v;
  sv(mVid, {value:v}, dec); sv(dVid, {value:v}, dec);
}
function toC(img){
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0); return c;
}
function imgFromURL(url){
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
}
// Escapes text before it's dropped into innerHTML — matters for things like
// layer names, which come from user-uploaded file names.
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function dl(canvas, name){
  const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = name; a.click();
}
function downloadText(filename, content){
  const blob = new Blob([content], { type:'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
// Clipboard with a manual fallback (mobile browsers / non-secure contexts
// often lack navigator.clipboard, so this never silently fails)
function copyToClipboard(text){
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext){
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try{
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('execCommand copy failed'));
    } catch(e){ reject(e); }
  });
}

// ── status / toast / progress ──
function setStatus(t, txt){
  const d = $('sdot');
  d.className = 'sdot' + (t==='rdy' ? ' rdy' : t==='proc' ? ' proc' : '');
  $('stxt').textContent = txt;
}
function showProg(s){ $('progWrap').style.display = s ? 'block' : 'none'; }
function setProg(p){ $('progFill').style.width = p + '%'; }
let _toastTm;
function toast(msg){
  const el = $('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(_toastTm); _toastTm = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── live preview debounce ──
function LP(){
  clearTimeout(App.lpTimer);
  App.lpTimer = setTimeout(() => {
    if (App.mode === 'layers'){
      if (App.layers.length){ App.layers.forEach(l => { l._normalCache = null; }); recomputeLayers(); }
    }
    else if (App.frames.length) processAll();
  }, 220);
}

// ── shared box blur (used by generate + fill) ──
function blur(d, w, h, r){
  let t = new Float32Array(d.length), o = new Float32Array(d.length);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){ let s=0,c=0;
    for (let dx=-r;dx<=r;dx++){ s+=d[y*w+Math.max(0,Math.min(w-1,x+dx))]; c++; } t[y*w+x]=s/c; }
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){ let s=0,c=0;
    for (let dy=-r;dy<=r;dy++){ s+=t[Math.max(0,Math.min(h-1,y+dy))*w+x]; c++; } o[y*w+x]=s/c; }
  return o;
}

// ════════════ RECENT NORMALS POOL ════════════
function saveRecentNormal(normalImageData, spriteCanvas){
  const nc = document.createElement('canvas');
  nc.width = normalImageData.width; nc.height = normalImageData.height;
  nc.getContext('2d').putImageData(normalImageData, 0, 0);
  const pair = {
    id: Date.now(),
    name: (curLang==='ru'?'Генерация ':'Generated ') + new Date().toLocaleTimeString(),
    sprite: spriteCanvas.toDataURL('image/png'),
    normal: nc.toDataURL('image/png'),
    w: spriteCanvas.width, h: spriteCanvas.height
  };
  App.recentPairs.unshift(pair);
  if (App.recentPairs.length > 12) App.recentPairs = App.recentPairs.slice(0, 12);
  try { localStorage.setItem('ng_recent', JSON.stringify(App.recentPairs.slice(0, 8))); } catch(e){}
}
function loadRecent(){
  try { const r = localStorage.getItem('ng_recent'); if (r) App.recentPairs = JSON.parse(r); } catch(e){}
}
loadRecent();
