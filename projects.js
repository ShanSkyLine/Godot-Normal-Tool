// ════════════════════════════════════════════════════════════
// projects.js — multiple independent projects as tabs. Each tab owns its
// own sprites, lights, generation settings and view state; switching tabs
// snapshots the outgoing project and restores the incoming one.
// ════════════════════════════════════════════════════════════

// slider fields that live in the DOM as a single shared control per id —
// captured/restored per project so two tabs can have completely different
// generation settings without fighting over the same <input>
const PROJECT_SLIDERS = [
  { id:'sStr',      mid:'msStr',      vid:'vStr',      mvid:'mvStr',      dec:1 },
  { id:'sLevel',    mid:'msLevel',    vid:'vLevel',    mvid:'mvLevel',    dec:1 },
  { id:'sBlur',     mid:'msBlur',     vid:'vBlur',     mvid:'mvBlur',     dec:1 },
  { id:'sZ',        mid:'msZ',        vid:'vZ',        mvid:'mvZ',        dec:2 },
  { id:'sXDetail',  mid:'msXDetail',  vid:'vXDetail',  mvid:'mvXDetail',  dec:2 },
  { id:'sXVolume',  mid:'msXVolume',  vid:'vXVolume',  mvid:'mvXVolume',  dec:2 },
  { id:'sXShape',   mid:'msXShape',   vid:'vXShape',   mvid:'mvXShape',   dec:2 },
  { id:'sXSmooth',  mid:'msXSmooth',  vid:'vXSmooth',  mvid:'mvXSmooth',  dec:2 },
  { id:'sXCrisp',   mid:'msXCrisp',   vid:'vXCrisp',   mvid:'mvXCrisp',   dec:2 },
  { id:'sAORadius', mid:'msAORadius', vid:'vAORadius', mvid:'mvAORadius', dec:0 },
  { id:'sAOStr',    mid:'msAOStr',    vid:'vAOStr',    mvid:'mvAOStr',    dec:2 },
];
const PROJECT_NUMFIELDS = [
  { id:'cols', mid:'mCols' }, { id:'rows', mid:'mRows' },
  { id:'frameCount', mid:'mFC' }, { id:'startFrame', mid:'mSF' },
];
function captureSettings(){
  const s = {};
  PROJECT_SLIDERS.forEach(c => { const e = $(c.id); if (e) s[c.id] = e.value; });
  PROJECT_NUMFIELDS.forEach(c => { const e = $(c.id); if (e) s[c.id] = e.value; });
  return s;
}
function applySettings(s){
  if (!s) return;
  PROJECT_SLIDERS.forEach(c => {
    const v = s[c.id]; if (v == null) return;
    const e = $(c.id), me = $(c.mid); if (e) e.value = v; if (me) me.value = v;
    if ($(c.vid)) sv(c.vid, { value:v }, c.dec);
    if ($(c.mvid)) sv(c.mvid, { value:v }, c.dec);
  });
  PROJECT_NUMFIELDS.forEach(c => {
    const v = s[c.id]; if (v == null) return;
    const e = $(c.id), me = $(c.mid); if (e) e.value = v; if (me) me.value = v;
  });
}
function defaultSettings(){
  return { sStr:2.5, sLevel:7, sBlur:1, sZ:0.5, sXDetail:0.5, sXVolume:0.6, sXShape:0.4, sXSmooth:0.3,
    sXCrisp:0.25, sAORadius:4, sAOStr:0.8, cols:4, rows:4, frameCount:16, startFrame:0 };
}
function blankProjectState(){
  return {
    mode:'single', frames:[], normalFrames:[], curFrame:0, customNormal:null, sheetSrc:null,
    layers:[], nextLayerId:1, soloLayerId:null, layerW:0, layerH:0, layerOriginX:0, layerOriginY:0,
    lights:[{ id:1, name:'Main', color:'#ffffff', intensity:1.0, x:0.4, y:-0.4, z:0.82, enabled:true,
      profile:'custom', softness:0.1, highlight:0.45 }],
    nextLightId:2,
    viewMode:'split', zoomScale:1, zoomAuto:true,
    combinedViews:['orig','norm'], canvasSize:{ mode:'auto', w:512, h:512 },
    engine:'classic', xMode:'sprite', xSeamless:true, filterType:'sobel', invert:{ r:false, g:false, h:false }, fillShape:'radial',
    aoFrame:null, aoEnabled:false,
    settings: defaultSettings(),
  };
}
function captureProjectState(){
  return {
    mode: App.mode, frames: App.frames, normalFrames: App.normalFrames, curFrame: App.curFrame,
    customNormal: App.customNormal, sheetSrc: App.sheetSrc,
    layers: App.layers, nextLayerId: App.nextLayerId, soloLayerId: App.soloLayerId,
    layerW: App.layerW, layerH: App.layerH, layerOriginX: App.layerOriginX, layerOriginY: App.layerOriginY,
    lights: App.lights, nextLightId: App.nextLightId,
    viewMode: App.viewMode, zoomScale: App.zoomScale, zoomAuto: App.zoomAuto,
    combinedViews: [...App.combinedViews], canvasSize: { ...App.canvasSize },
    engine: App.engine, xMode: App.xMode, xSeamless: App.xSeamless,
    filterType: App.filterType, invert: { ...App.invert }, fillShape: App.fillShape,
    aoFrame: (typeof aoFrame !== 'undefined') ? aoFrame : null,
    aoEnabled: (typeof aoEnabled !== 'undefined') ? aoEnabled : false,
    settings: captureSettings(),
  };
}
function restoreProjectState(s){
  App.mode = s.mode; App.frames = s.frames; App.normalFrames = s.normalFrames; App.curFrame = s.curFrame;
  App.customNormal = s.customNormal; App.sheetSrc = s.sheetSrc;
  App.layers = s.layers; App.nextLayerId = s.nextLayerId; App.soloLayerId = s.soloLayerId;
  App.layerW = s.layerW; App.layerH = s.layerH; App.layerOriginX = s.layerOriginX; App.layerOriginY = s.layerOriginY;
  App.lights = s.lights; App.nextLightId = s.nextLightId;
  App.viewMode = s.viewMode; App.zoomScale = s.zoomScale; App.zoomAuto = s.zoomAuto;
  App.combinedViews = s.combinedViews ? [...s.combinedViews] : ['orig','norm'];
  App.canvasSize = s.canvasSize ? { ...s.canvasSize } : { mode:'auto', w:512, h:512 };
  App.engine = s.engine; App.xMode = s.xMode || 'sprite'; App.xSeamless = s.xSeamless !== false;
  App.filterType = s.filterType; App.invert = { ...s.invert }; App.fillShape = s.fillShape;
  aoFrame = s.aoFrame || null; aoEnabled = !!s.aoEnabled;
  applySettings(s.settings);
  refreshUIFromState();
}
// repaints every part of the UI from current App state, without triggering
// a fresh generation pass — used right after switching tabs
function refreshUIFromState(){
  $('engClassic').classList.toggle('on', App.engine==='classic');
  $('engX').classList.toggle('on', App.engine==='x');
  const me1 = $('mEngClassic'), me2 = $('mEngX');
  if (me1) me1.classList.toggle('on', App.engine==='classic');
  if (me2) me2.classList.toggle('on', App.engine==='x');
  $('xPanel').style.display = App.engine==='x' ? 'block' : 'none';
  const mx = $('mXPanel'); if (mx) mx.style.display = App.engine==='x' ? 'block' : 'none';
  // classic panel was previously left visible alongside the X panel (bug fix)
  $('classicPanel').style.display = App.engine==='x' ? 'none' : 'block';
  const mcp = $('mClassicPanel'); if (mcp) mcp.style.display = App.engine==='x' ? 'none' : 'block';
  setXMode(App.xMode || 'sprite');
  const sm = $('togSeamless'); if (sm) sm.classList.toggle('on', !!App.xSeamless);

  const fs = $('filtSobel'), fc = $('filtScharr');
  if (fs) fs.classList.toggle('on', App.filterType==='sobel');
  if (fc) fc.classList.toggle('on', App.filterType==='scharr');
  const mfs = $('mFiltSobel'), mfc = $('mFiltScharr');
  if (mfs) mfs.classList.toggle('on', App.filterType==='sobel');
  if (mfc) mfc.classList.toggle('on', App.filterType==='scharr');

  const invMap = { r:['invR','mInvR'], g:['invG','mInvG'], h:['invH','mInvH'] };
  Object.keys(invMap).forEach(k => {
    invMap[k].forEach(id => { const e = $(id); if (e) e.classList.toggle('on', !!App.invert[k]); });
  });
  const frB = $('fillRadial'), fcB = $('fillConic');
  if (frB) frB.classList.toggle('on', App.fillShape==='radial');
  if (fcB) fcB.classList.toggle('on', App.fillShape==='conic');
  qsa('.vtab').forEach(el => {
    const m = (el.getAttribute('onclick')||'').match(/setView\('(\w+)'/);
    el.classList.toggle('on', !!m && m[1] === App.viewMode);
  });

  qsa('.tab').forEach(el => el.classList.toggle('on', el.dataset.mode === App.mode));
  const sh = App.mode==='spritesheet', ly = App.mode==='layers';
  ['sheetCfg','shSheetCfg'].forEach(id => { const e = $(id); if (e) e.style.display = sh ? 'block' : 'none'; });
  ['layersCfg','shLayersCfg'].forEach(id => { const e = $(id); if (e) e.style.display = ly ? 'block' : 'none'; });
  $('fileInput').multiple = (App.mode==='frames'||App.mode==='layers');
  const fm = $('fileInputM'); if (fm) fm.multiple = (App.mode==='frames'||App.mode==='layers');

  $('clearNormalBtn').style.display = App.customNormal ? 'flex' : 'none';
  rebuildLayersUI(); rebuildLightUI();

  if (App.frames.length){
    $('emptyState').style.display = 'none'; $('previews').style.display = 'flex';
    updateDisplay(); buildStrip();
    const m = App.frames.length > 1;
    ['expSheet','expSheetM','expAll'].forEach(id => { const e = $(id); if (e) e.style.display = m ? 'flex' : 'none'; });
    $('playBtn').style.display = m ? 'flex' : 'none';
  } else {
    $('emptyState').style.display = 'flex'; $('previews').style.display = 'none';
    $('strip').classList.remove('on');
  }
  const av = $('cvAO'); if (av && aoFrame){ av.width = aoFrame.width; av.height = aoFrame.height; av.getContext('2d').putImageData(aoFrame, 0, 0); }
  const aoBtn = $('aoExportBtn'); if (aoBtn) aoBtn.style.display = aoFrame ? 'flex' : 'none';
  applyView(); applyZoom();
  updateLayerCanvasEditable();
}

function newProject(){
  closeAnyOpenModals();
  saveActiveProjectState();
  const id = App.nextProjectId++;
  App.projects.push({ id, name: t('project') + ' ' + id, state: blankProjectState() });
  App.activeProjectId = id;
  restoreProjectState(App.projects[App.projects.length-1].state);
  rebuildProjectTabs();
}
function closeAnyOpenModals(){
  const fm = $('fillModal'); if (fm && fm.classList.contains('open')) closeFill();
  ['tutModal','recentModal','spinRecentModal','tileModal','projSettingsModal','changelogModal','retroMsgBox'].forEach(id => { const el = $(id); if (el) el.classList.remove('open'); });
  if (typeof Spin !== 'undefined' && Spin.open) closeSpin();
}
function saveActiveProjectState(){
  // a running frame-playback interval reads/writes App.curFrame on a timer —
  // if left running across a project switch it would keep firing against
  // whichever project is active by the time it ticks, silently corrupting
  // its frame selection. Always stop it before handing off state.
  if (typeof App.playing !== 'undefined' && App.playing){
    App.playing = false; clearInterval(App.playIv);
    const ico = $('playIco'); if (ico) ico.textContent = 'play_arrow';
    const txt = $('playTxt'); if (txt) txt.textContent = t('play_label');
  }
  const p = App.projects.find(x => x.id === App.activeProjectId);
  if (p) p.state = captureProjectState();
}
function switchProject(id){
  if (id === App.activeProjectId) return;
  closeAnyOpenModals();
  saveActiveProjectState();
  const p = App.projects.find(x => x.id === id); if (!p) return;
  App.activeProjectId = id;
  restoreProjectState(p.state);
  rebuildProjectTabs();
}
function closeProject(id, ev){
  if (ev) ev.stopPropagation();
  if (App.projects.length <= 1){ toast(t('keep_one_project')); return; }
  const idx = App.projects.findIndex(x => x.id === id);
  if (idx === -1) return;
  const wasActive = App.activeProjectId === id;
  App.projects = App.projects.filter(x => x.id !== id);
  if (wasActive){
    const next = App.projects[Math.max(0, idx-1)];
    App.activeProjectId = next.id;
    restoreProjectState(next.state);
  }
  rebuildProjectTabs();
}
function startRenameTab(id, tabEl){
  const p = App.projects.find(x => x.id === id); if (!p) return;
  const nameSpan = tabEl.querySelector('.proj-tab-name'); if (!nameSpan) return;
  const inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'proj-tab-input'; inp.value = p.name; inp.maxLength = 30;
  nameSpan.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const commit = () => {
    if (done) return; done = true;
    p.name = inp.value.trim().slice(0, 30) || p.name;
    rebuildProjectTabs();
  };
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') inp.blur();
    if (e.key === 'Escape'){ inp.value = p.name; inp.blur(); }
  });
  inp.addEventListener('click', e => e.stopPropagation());
}
function rebuildProjectTabs(){
  const el = $('projectTabs'); if (!el) return; el.innerHTML = '';
  let activeTabEl = null;
  App.projects.forEach(p => {
    const tab = document.createElement('div');
    tab.className = 'proj-tab' + (p.id === App.activeProjectId ? ' on' : '');
    tab.innerHTML = `<span class="proj-tab-name">${escapeHtml(p.name)}</span>` +
      (App.projects.length > 1 ? `<button class="proj-tab-x" title="${escapeHtml(t('close_project'))}"><span class="mi">close</span></button>` : '');
    tab.onclick = () => { if (p.id === App.activeProjectId) startRenameTab(p.id, tab); else switchProject(p.id); };
    const xBtn = tab.querySelector('.proj-tab-x'); if (xBtn) xBtn.onclick = e => closeProject(p.id, e);
    el.appendChild(tab);
    if (p.id === App.activeProjectId) activeTabEl = tab;
  });
  // the active project's tab could otherwise sit scrolled out of view (mobile
  // complaint: "tabs are somewhere off to the left") — always bring it into sight
  if (activeTabEl) activeTabEl.scrollIntoView({ inline:'nearest', block:'nearest' });
}
function initProjects(){
  if (App.projects.length) return; // already initialized
  App.projects = [{ id: 1, name: t('project') + ' 1', state: captureProjectState() }];
  App.activeProjectId = 1; App.nextProjectId = 2;
  rebuildProjectTabs();
}

// ════════════ PROJECT SETTINGS ════════════
// Canvas size, combined-view layout, and a downloadable/loadable settings
// template — scoped to a single project, requested as a "project settings"
// feature separate from the app-wide Engine tab.
function openProjectSettings(){
  renderProjectSettings();
  $('projSettingsModal').classList.add('open');
}
function closeProjectSettings(){ $('projSettingsModal').classList.remove('open'); }
function renderProjectSettings(){
  const cs = App.canvasSize || { mode:'auto', w:512, h:512 };
  const a = $('csAuto'), c = $('csCustom'); if (a) a.classList.toggle('on', cs.mode==='auto');
  if (c) c.classList.toggle('on', cs.mode==='custom');
  const row = $('csWHRow'); if (row) row.style.display = cs.mode==='custom' ? 'grid' : 'none';
  if ($('csW')) $('csW').value = cs.w; if ($('csH')) $('csH').value = cs.h;
  const cv = App.combinedViews || ['orig','norm'];
  qsa('#combinedViewChks .chk').forEach(el => el.classList.toggle('on', cv.includes(el.dataset.key)));
}
function setCanvasSizeMode(mode){
  App.canvasSize.mode = mode;
  renderProjectSettings();
  saveActiveProjectState();
}
function setCanvasWH(){
  App.canvasSize.w = Math.max(1, Math.min(4096, +$('csW').value || 512));
  App.canvasSize.h = Math.max(1, Math.min(4096, +$('csH').value || 512));
  saveActiveProjectState();
}
function toggleCombinedView(key, el){
  const cv = App.combinedViews;
  const i = cv.indexOf(key);
  if (i === -1) cv.push(key);
  else if (cv.length > 1) cv.splice(i, 1);
  else { toast(t('combined_view_min')); }
  el.classList.toggle('on', cv.includes(key));
  if (App.viewMode === 'custom') applyView();
  saveActiveProjectState();
}
function downloadJSON(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function downloadTemplate(){
  const tpl = {
    normengineTemplate: 1,
    engine: App.engine, xMode: App.xMode, xSeamless: App.xSeamless,
    filterType: App.filterType, invert: { ...App.invert },
    canvasSize: { ...App.canvasSize }, combinedViews: [...App.combinedViews],
    viewMode: App.viewMode, fillShape: App.fillShape,
    lights: App.lights, settings: captureSettings(),
  };
  downloadJSON('normengine-template.json', tpl);
  toast(t('template_saved'));
}
function loadTemplateFile(files){
  const f = files && files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    let tpl;
    try { tpl = JSON.parse(e.target.result); } catch(err){ toast(t('template_invalid')); return; }
    if (!tpl || typeof tpl !== 'object' || !tpl.normengineTemplate){ toast(t('template_invalid')); return; }
    newProject();
    App.engine = tpl.engine || 'classic';
    App.xMode = tpl.xMode || 'sprite';
    App.xSeamless = tpl.xSeamless !== false;
    App.filterType = tpl.filterType || 'sobel';
    App.invert = tpl.invert ? { ...tpl.invert } : { r:false, g:false, h:false };
    App.canvasSize = tpl.canvasSize ? { ...tpl.canvasSize } : { mode:'auto', w:512, h:512 };
    App.combinedViews = (tpl.combinedViews && tpl.combinedViews.length) ? [...tpl.combinedViews] : ['orig','norm'];
    App.viewMode = tpl.viewMode || 'split';
    App.fillShape = tpl.fillShape || 'radial';
    if (tpl.lights && tpl.lights.length) App.lights = tpl.lights;
    if (tpl.settings) applySettings(tpl.settings);
    refreshUIFromState();
    rebuildLightUI();
    saveActiveProjectState();
    closeProjectSettings();
    toast(t('template_loaded'));
  };
  r.readAsText(f);
}
