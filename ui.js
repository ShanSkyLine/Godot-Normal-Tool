// ════════════════════════════════════════════════════════════
// ui.js — tabs, mobile sheets, tutorial, tooltips, hotkeys
// ════════════════════════════════════════════════════════════

function setActiveTab(id){
  ['htabGen','htabFill'].forEach(t=>{const e=$(t);if(e)e.classList.toggle('on',t===id)});
}
function switchTool(tl){
  $('htabGen').classList.toggle('on',tl==='generate');
  $('htabFill').classList.toggle('on',tl==='fill');
  if(tl==='fill')openFill();else closeFill();
}

// ════════════ MOBILE SHEETS ════════════
let activeSheet=null;
function openSheet(id,btn){
  if(activeSheet&&activeSheet!==id)closeSheet();
  const s=$(id);
  if(s.classList.contains('open')){closeSheet();return;}
  s.classList.add('open');activeSheet=id;
  qsa('.mnav').forEach(el=>el.classList.remove('on'));
  if(btn)btn.classList.add('on');
}
function closeSheet(){
  if(!activeSheet)return;
  $(activeSheet).classList.remove('open');activeSheet=null;
  qsa('.mnav').forEach(el=>el.classList.remove('on'));
}
// tap outside closes — but ignore taps that originate on a light pad
document.addEventListener('pointerdown',e=>{
  if(!activeSheet)return;
  if(e.target.closest('.lpad')||e.target.closest('.spin-orbit-pad'))return;
  const s=$(activeSheet);
  if(!s.contains(e.target)&&!e.target.closest('.mob-nav'))closeSheet();
});

// Sheet drag handle (only the handle triggers drag, never the body controls)
function initSheetDrag(){
  document.querySelectorAll('.sheet-handle').forEach(handle=>{
    let startY=0,startH=0,isDrag=false;
    const sheet=handle.closest('.sheet');
    const getH=()=>sheet.getBoundingClientRect().height;
    handle.addEventListener('pointerdown',e=>{
      isDrag=true;startY=e.clientY;startH=getH();
      sheet.style.transition='none';handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove',e=>{
      if(!isDrag)return;
      const dy=startY-e.clientY;
      const newH=Math.max(80,Math.min(window.innerHeight*0.85,startH+dy));
      sheet.style.maxHeight=newH+'px';
    });
    handle.addEventListener('pointerup',e=>{
      if(!isDrag)return;isDrag=false;sheet.style.transition='';
      try{handle.releasePointerCapture(e.pointerId);}catch(_){}
      if(getH()<110){closeSheet();sheet.style.maxHeight='';}
    });
  });
}

// ════════════ TOOLTIPS ════════════
let TIPS={};
function refreshTips(){
  TIPS={sStr:t('tip_str'),sLevel:t('tip_level'),sBlur:t('tip_blur'),sZ:t('tip_z'),sAO:t('tip_ao'),sAOStr:t('tip_aostr'),sXDetail:t('tip_xdetail'),sXVolume:t('tip_xvolume'),sXShape:t('tip_xshape'),sXSmooth:t('tip_xsmooth'),sXCrisp:t('tip_xcrisp')};
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
  if(e.key==='F1'){e.preventDefault();$('fillModal').classList.contains('open')?closeFill():switchTool('fill');}
  if(e.key==='Escape'){closeFill();
    ['tutModal','recentModal'].forEach(id=>{const el=$(id);if(el)el.classList.remove('open');});}
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
  try{if(!localStorage.getItem('ng_tut_done'))openTutorial();}catch(e){openTutorial();}
});
