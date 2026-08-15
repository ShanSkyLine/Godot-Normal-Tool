// ════════════════════════════════════════════════════════════
// ui.js — tabs, mobile sheets, tutorial, tooltips, hotkeys
// ════════════════════════════════════════════════════════════

function setActiveTab(id){
  ['htabGen','htabFill','htabSpin','htabEngine'].forEach(t=>{const e=$(t);if(e)e.classList.toggle('on',t===id)});
}
function switchTool(tl){
  // Closing a workspace must never choose a tab itself.  Doing that here in
  // one place prevents Fill/Spin/Engine from racing each other back to Generate.
  setActiveTab(tl==='generate'?'htabGen':tl==='fill'?'htabFill':tl==='spin'?'htabSpin':'htabEngine');
  if(tl==='fill'){if(Spin.open)closeSpin();closeEngineTab();openFill();}
  else if(tl==='spin'){closeFill();closeEngineTab();openSpin();}
  else if(tl==='engine'){closeFill();if(Spin.open)closeSpin();openEngineTab();}
  else{closeFill();if(Spin.open)closeSpin();closeEngineTab();}
}
function openEngineTab(){
  if(typeof renderEngineTab==='function')renderEngineTab();
  $('engineOverlay').classList.add('open');
}
function closeEngineTab(){
  const el=$('engineOverlay'); if(el)el.classList.remove('open');
}

// ════════════ MOBILE SHEETS ════════════
// Rebuilt in v0.7.0: the old drag handler wrote inline max-height directly
// and only ever cleared it on a "clean" pointerup, so a cancelled or
// interrupted drag (very common on mobile — the browser steals the
// gesture for scrolling, or another touch lands) left the sheet pinned at
// a random inline height forever, no longer responding to open/close.
// This version drives everything through a single CSS class + a transform
// used ONLY transiently while actively dragging, always cleared on both
// pointerup AND pointercancel.
let activeSheet=null;
function openSheet(id,btn){
  // tapping a bottom-nav item always returns to the main workspace first —
  // otherwise Spin/Engine stayed open underneath and the tap seemed to do
  // nothing (this was the "mobile nav doesn't listen" bug)
  if(typeof Spin!=='undefined'&&Spin.open)closeSpin();
  closeEngineTab();
  setActiveTab('htabGen');
  if(activeSheet&&activeSheet!==id)closeSheet();
  const s=$(id);
  if(s.classList.contains('open')){closeSheet();return;}
  s.style.transform='';
  s.classList.add('open');activeSheet=id;
  $('sheetBackdrop').classList.add('open');
  qsa('.mnav').forEach(el=>el.classList.remove('on'));
  if(btn)btn.classList.add('on');
}
function closeSheet(){
  if(!activeSheet)return;
  const s=$(activeSheet);
  s.classList.remove('open'); s.style.transform=''; s.style.transition='';
  activeSheet=null;
  $('sheetBackdrop').classList.remove('open');
  qsa('.mnav').forEach(el=>el.classList.remove('on'));
}
// tap outside (backdrop) also closes — kept in addition to the dedicated
// backdrop click handler so taps on the mobile nav itself still register
document.addEventListener('pointerdown',e=>{
  if(!activeSheet)return;
  if(e.target.closest('.lpad')||e.target.closest('.spin-orbit-pad'))return;
  const s=$(activeSheet);
  if(!s.contains(e.target)&&!e.target.closest('.mob-nav'))closeSheet();
});

// Sheet drag handle — grab to dismiss with a swipe-down. Only the handle
// starts a drag, body controls (sliders etc.) are never intercepted.
function initSheetDrag(){
  document.querySelectorAll('.sheet-handle').forEach(handle=>{
    let startY=0,dragging=false,curDy=0;
    const sheet=handle.closest('.sheet');
    const end=(commit)=>{
      if(!dragging)return; dragging=false;
      sheet.style.transition='';
      sheet.style.transform='';
      // a decisive downward flick (>70px) dismisses; anything smaller snaps back
      if(commit && curDy>70) closeSheet();
      curDy=0;
    };
    handle.addEventListener('pointerdown',e=>{
      dragging=true;startY=e.clientY;curDy=0;
      sheet.style.transition='none';
      try{handle.setPointerCapture(e.pointerId);}catch(_){}
    });
    handle.addEventListener('pointermove',e=>{
      if(!dragging)return;
      curDy=Math.max(0,e.clientY-startY); // only allow dragging DOWN (to dismiss)
      sheet.style.transform=`translateY(${curDy}px)`;
    });
    handle.addEventListener('pointerup',e=>{
      try{handle.releasePointerCapture(e.pointerId);}catch(_){}
      end(true);
    });
    // a cancelled gesture (browser stole it for scroll, incoming call, etc.)
    // must still fully release the drag state — this is the fix for
    // sheets that used to freeze mid-drag and stop responding to taps
    handle.addEventListener('pointercancel',()=>end(false));
    handle.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
  });
}

// ════════════ TOOLTIPS ════════════
let TIPS={};
function refreshTips(){
  TIPS={sStr:t('tip_str'),sLevel:t('tip_level'),sBlur:t('tip_blur'),sZ:t('tip_z'),sAO:t('tip_ao'),sAOStr:t('tip_aostr'),sXDetail:t('tip_xdetail'),sXVolume:t('tip_xvolume'),sXShape:t('tip_xshape'),sXSmooth:t('tip_xsmooth'),sXCrisp:t('tip_xcrisp'),xSeam:t('tip_xseam')};
}
const tipEl=document.createElement('div');tipEl.className='tooltip';document.body.appendChild(tipEl);
let tipTimeout;
function showTip(id,x,y){
  if(!TIPS[id])return;clearTimeout(tipTimeout);
  tipEl.innerHTML=TIPS[id];
  tipEl.style.left=Math.min(x+14,window.innerWidth-240)+'px';
  tipEl.style.top=Math.max(y-50,8)+'px';
  tipEl.classList.add('show');
}
function hideTip(){tipTimeout=setTimeout(()=>tipEl.classList.remove('show'),120);}
function initTooltips(){
  document.querySelectorAll('.tip-icon').forEach(el=>{
    const id=el.dataset.tip;
    el.addEventListener('mouseenter',e=>showTip(id,e.clientX,e.clientY));
    el.addEventListener('mousemove',e=>showTip(id,e.clientX,e.clientY));
    el.addEventListener('mouseleave',hideTip);
    el.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='mouse'){e.stopPropagation();showTip(id,e.clientX,e.clientY);setTimeout(hideTip,2600);}
    });
  });
}

// ════════════ TUTORIAL ════════════
let tutStep=0;
function curTutSteps(){return TUT_STEPS_I18N[curLang]||TUT_STEPS_I18N.en;}
function openTutorial(){$('tutModal').classList.add('open');tutStep=0;renderTutStep();}
function closeTutorial(){$('tutModal').classList.remove('open');try{localStorage.setItem('ng_tut_done','1');}catch(e){}}
function renderTutStep(){
  const steps=curTutSteps();const s=steps[tutStep];
  $('tutIcon').textContent=s.icon;$('tutTitle').textContent=s.title;$('tutText').innerHTML=s.text;
  $('tutPrev').style.visibility=tutStep>0?'visible':'hidden';
  $('tutPrev').textContent=t('tut_back');
  $('tutNext').textContent=tutStep===steps.length-1?t('tut_start'):t('tut_next');
  $('tutSkip').textContent=t('tut_skip');
  const dotsEl=$('tutDots');dotsEl.innerHTML='';
  steps.forEach((_,i)=>{const d=document.createElement('div');d.className='tut-dot'+(i===tutStep?' on':'');
    d.onclick=()=>{tutStep=i;renderTutStep()};dotsEl.appendChild(d);});
  $('tutCounter').textContent=`${tutStep+1} / ${steps.length}`;
}
function tutNext(){const steps=curTutSteps();if(tutStep===steps.length-1){closeTutorial();return;}tutStep++;renderTutStep();}
function tutPrev(){if(tutStep>0){tutStep--;renderTutStep();}}

// ════════════ HOTKEYS ════════════
document.addEventListener('keydown',e=>{
  // never hijack typing in a text field, number input, or textarea
  const typing = e.target.matches('input,textarea,select,[contenteditable]');

  if(e.key==='F1'){e.preventDefault();$('fillModal').classList.contains('open')?switchTool('generate'):switchTool('fill');}
  if(e.key==='F2'){e.preventDefault();Spin.open?switchTool('generate'):switchTool('spin');}
  if(e.key==='F3'){e.preventDefault();$('engineOverlay').classList.contains('open')?switchTool('generate'):switchTool('engine');}
  if(e.key==='Escape'){closeFill();if(typeof Spin!=='undefined'&&Spin.open)closeSpin();closeEngineTab();
    ['tutModal','recentModal','spinRecentModal','tileModal','changelogModal','retroMsgBox'].forEach(id=>{const el=$(id);if(el)el.classList.remove('open');});
    closeSheet();setActiveTab('htabGen');}
  if(!typing){
    if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1);}
    if(e.key==='-'||e.key==='_'){e.preventDefault();zoom(-1);}
    if(e.key==='0'){e.preventDefault();zoomFit();}
    if(e.key==='l'||e.key==='L'){e.preventDefault();toggleLang();}
  }
});


// ════════════ UX: full-window drop, view hotkeys, ctrl+wheel zoom ════════════
function initUX(){
  // Full-window drag & drop — drop a sprite anywhere
  let dragDepth=0;
  document.addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;document.body.style.outline='2px dashed var(--dim)';document.body.style.outlineOffset='-4px';});
  document.addEventListener('dragleave',e=>{e.preventDefault();if(--dragDepth<=0){dragDepth=0;document.body.style.outline='';}});
  document.addEventListener('dragover',e=>e.preventDefault());
  document.addEventListener('drop',e=>{
    e.preventDefault();dragDepth=0;document.body.style.outline='';
    if(e.target.closest('.drop'))return; // zone handlers already fired
    if(e.dataTransfer.files.length)handleFiles(e.dataTransfer.files);
  });
  // View hotkeys 1-4
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;
    const views={'1':'split','2':'orig','3':'norm','4':'lit'};
    if(views[e.key]){
      const idx={'1':1,'2':2,'3':3,'4':4}[e.key];
      setView(views[e.key],document.querySelector(`.vbar .vtab:nth-child(${idx})`));
    }
  });
  // Ctrl+wheel zoom on canvas area
  $('cw').addEventListener('wheel',e=>{
    if(!e.ctrlKey)return;
    e.preventDefault();
    zoom(e.deltaY<0?1:-1);
  },{passive:false});
  // Double-tap canvas area on mobile = fit
  let lastTap=0;
  $('cw').addEventListener('touchend',e=>{
    const now=Date.now();
    if(now-lastTap<300)zoomFit();
    lastTap=now;
  });
}

// ════════════ INIT ════════════
window.addEventListener('DOMContentLoaded',()=>{
  curLang=detectLang();
  applyI18n();
  const lb=$('langBtn');if(lb)lb.textContent=curLang==='en'?'RU':'EN';
  initDropZones();
  rebuildLightUI();
  rebuildLayersUI();
  initLayerDrag();
  refreshTips();
  initTooltips();
  initSheetDrag();
  initUX();
  // manual rotation-pivot picking on the Spin canvas (was never wired up)
  const scv=$('spinCv'); if(scv) scv.addEventListener('pointerdown', spinCenterPick);
  window.addEventListener('resize', ()=>{ if(typeof Spin!=='undefined'&&Spin.open) resizeSpin(); });
  initProjects();
  // First-ever visit: themes.js shows the style-onboarding modal first, and
  // chains into this tutorial itself once that's dismissed. Only auto-open
  // here for a returning user who saw onboarding before but skipped the tour.
  try{
    const onboarded = !!localStorage.getItem('ng_onboarded');
    if (onboarded && !localStorage.getItem('ng_tut_done')) openTutorial();
  }catch(e){openTutorial();}
});
