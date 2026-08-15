// ════════════════════════════════════════════════════════════
// themes.js — visual style system (Godot / Modern / Retro / Space),
// first-run style picker, and the Engine control tab (keybinds +
// appearance). Added in v0.7.0.
// ════════════════════════════════════════════════════════════

const THEME_LIST = [
  { id:'godot',  icon:'grid_view',     nameKey:'theme_godot',  descKey:'theme_godot_desc',  variant:false },
  { id:'modern', icon:'dashboard',     nameKey:'theme_modern', descKey:'theme_modern_desc', variant:true  },
  { id:'retro',  icon:'history',       nameKey:'theme_retro',  descKey:'theme_retro_desc',  variant:false },
  { id:'space',  icon:'blur_circular', nameKey:'theme_space',  descKey:'theme_space_desc',  variant:false },
];
const KEYBINDS = [
  { combo:'F1',  key:'kb_tab_fill' },
  { combo:'F2',  key:'kb_tab_spin' },
  { combo:'F3',  key:'kb_tab_engine' },
  { combo:'Esc', key:'kb_escape' },
  { combo:'+',   key:'kb_zoom_in' },
  { combo:'−',   key:'kb_zoom_out' },
  { combo:'0',   key:'kb_zoom_fit' },
  { combo:'L',   key:'kb_lang' },
];

// ── apply / persist ──
function applyTheme(theme, variant){
  document.documentElement.dataset.theme = theme;
  if (theme === 'modern' && variant) document.documentElement.dataset.variant = variant;
  else delete document.documentElement.dataset.variant;
  try {
    localStorage.setItem('ng_theme', theme);
    if (theme === 'modern' && variant) localStorage.setItem('ng_theme_variant', variant);
  } catch(e){}
  if (typeof renderEngineTab === 'function') renderEngineTab();
}
function loadSavedTheme(){
  let theme = 'godot', variant = 'dark';
  try {
    theme = localStorage.getItem('ng_theme') || 'godot';
    variant = localStorage.getItem('ng_theme_variant') || 'dark';
  } catch(e){}
  applyTheme(theme, variant);
  return theme;
}

// ── Engine tab (keybinds + appearance) ──
function renderEngineTab(){
  const kb = $('kbList');
  if (kb) kb.innerHTML = KEYBINDS.map(k =>
    `<div class="kb-row"><kbd>${k.combo}</kbd><span>${t(k.key)}</span></div>`).join('');

  const grid = $('themeGrid');
  if (grid){
    const cur = document.documentElement.dataset.theme || 'godot';
    grid.innerHTML = THEME_LIST.map(th => `
      <button class="theme-card ${th.id===cur?'on':''}" onclick="chooseTheme('${th.id}')">
        <div class="theme-swatch theme-swatch-${th.id}"><span class="mi">${th.icon}</span></div>
        <b>${t(th.nameKey)}</b><span>${t(th.descKey)}</span>
      </button>`).join('');
    if (typeof renderAllIcons === 'function') renderAllIcons(grid);
  }
  const cur = document.documentElement.dataset.theme || 'godot';
  const vrow = $('themeVariantRow');
  if (vrow){
    vrow.style.display = cur === 'modern' ? 'flex' : 'none';
    const curVariant = document.documentElement.dataset.variant || 'dark';
    const lb = $('themeVarLight'), db = $('themeVarDark');
    if (lb) lb.classList.toggle('on', curVariant === 'light');
    if (db) db.classList.toggle('on', curVariant === 'dark');
  }
}
function chooseTheme(id){
  const th = THEME_LIST.find(x => x.id === id); if (!th) return;
  if (th.variant){
    applyTheme('modern', document.documentElement.dataset.variant || 'dark');
  } else {
    applyTheme(id);
    toast(t('theme_applied'));
  }
  renderEngineTab();
}
function pickThemeVariant(v){
  applyTheme('modern', v);
  renderEngineTab();
  toast(t('theme_applied'));
}

// ── first-run onboarding: Godot vs Modern, then (if Modern) light/dark ──
let _onboardChoice = null;
function maybeShowOnboarding(){
  let seen = true;
  try { seen = !!localStorage.getItem('ng_onboarded'); } catch(e){}
  if (seen) return;
  $('onboardModal').classList.add('open');
}
function onboardPick(id){
  if (id === 'godot'){
    applyTheme('godot');
    finishOnboarding();
    return;
  }
  // Modern needs a light/dark follow-up choice before it can be applied
  _onboardChoice = 'modern';
  qsa('.onboard-card').forEach(c => c.classList.toggle('on', c.dataset.themeId === 'modern'));
  $('onboardVariant').style.display = 'block';
  onboardPickVariant('dark'); // sensible default, user can still switch below
}
function onboardPickVariant(v){
  $('onbVarLight').classList.toggle('on', v === 'light');
  $('onbVarDark').classList.toggle('on', v === 'dark');
  applyTheme('modern', v); // live-preview the choice behind the modal
  _onboardChoice = { theme:'modern', variant:v };
}
function onboardConfirm(){ finishOnboarding(); }
function finishOnboarding(){
  try { localStorage.setItem('ng_onboarded', '1'); } catch(e){}
  $('onboardModal').classList.remove('open');
  renderEngineTab();
  // chain into the existing feature tutorial right after
  if (typeof openTutorial === 'function') setTimeout(openTutorial, 200);
}

// ── changelog ──
function openChangelog(){
  if (typeof renderChangelog === 'function') renderChangelog();
  $('changelogModal').classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  renderEngineTab();
  maybeShowOnboarding();
});

// ── Retro window controls — a light touch of real behaviour behind the
// clickable Windows-XP-style buttons, added on request ("they should be
// clickable, sort of pressable"). ──
function retroMinimize(){
  document.body.classList.toggle('compact-mode');
}
function retroMaximize(){
  if (!document.fullscreenElement){
    document.documentElement.requestFullscreen?.().catch(()=>{});
  } else {
    document.exitFullscreen?.().catch(()=>{});
  }
}
function retroClose(){
  $('retroMsgBox').classList.add('open');
}
