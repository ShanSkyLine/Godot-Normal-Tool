// ════════════════════════════════════════════════════════════
// lights.js — light sources for the main lit preview
// ════════════════════════════════════════════════════════════

function addLight(){
  App.lights.push({
    id: App.nextLightId++, name: 'Light ' + App.lights.length,
    color: LC[App.lights.length % LC.length],
    intensity: 0.8, x: Math.random()-.5, y: -(Math.random()*.6+.3), z: 0.7, enabled: true
  });
  rebuildLightUI(); if (App.normalFrames.length || App.customNormal) renderLit();
}
function removeLight(id){
  if (App.lights.length <= 1){ toast(t('keep_one_light')); return; }
  App.lights = App.lights.filter(l => l.id !== id); rebuildLightUI(); renderLit();
}
function rebuildLightUI(){
  ['lightList','lightListM'].forEach(lid => {
    const el = $(lid); if (!el) return; el.innerHTML = '';
    App.lights.forEach(l => el.appendChild(buildLightItem(l, lid)));
  });
}
function buildLightItem(l, listId){
  const suffix = listId === 'lightListM' ? 'm' : 'd'; // unique pad id per list
  const div = document.createElement('div'); div.className = 'light-item';
  div.innerHTML = `<div class="light-item-hdr">
      <div class="light-dot" style="background:${l.color}"></div>
      <span class="light-item-name">${l.name}</span>
      <div class="tog ${l.enabled?'on':''}" onclick="toggleLight(${l.id},this)"></div>
      <button class="del-btn" onclick="removeLight(${l.id})"><span class="mi">close</span></button></div>
    <div class="light-row">
      <input type="color" value="${l.color}" oninput="setLightColor(${l.id},this.value,this)">
      <input type="range" min="0" max="2" step="0.05" value="${l.intensity}" style="flex:1;margin:0"
        oninput="App.lights.find(x=>x.id===${l.id}).intensity=+this.value;renderLit()"></div>
    <div class="lpad" id="lpad-${suffix}-${l.id}" style="max-width:88px;touch-action:none">
      <div class="lpad-x"></div><div class="lpad-y"></div>
      <div class="lpad-dot" id="ldot-${suffix}-${l.id}" style="left:${(l.x/2+.5)*100}%;top:${(-l.y/2+.5)*100}%"></div></div>`;
  setTimeout(() => setupLightPad(l.id, suffix), 0); return div;
}
function setLightColor(id, val, inp){
  App.lights.find(x => x.id === id).color = val;
  inp.closest('.light-item').querySelector('.light-dot').style.background = val; renderLit();
}
function toggleLight(id, t){
  const l = App.lights.find(x => x.id === id); l.enabled = !l.enabled;
  t.classList.toggle('on', l.enabled); renderLit();
}

// ── Light-pad drag: per-pad pointer capture (works inside bottom sheets) ──
function setupLightPad(id, suffix){
  const pad = $(`lpad-${suffix}-${id}`); if (!pad || pad._wired) return;
  pad._wired = true;
  const dot = $(`ldot-${suffix}-${id}`);

  const apply = (clientX, clientY) => {
    const r = pad.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const py = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    const l = App.lights.find(x => x.id === id); if (!l) return;
    l.x = (px-.5)*2; l.y = (py-.5)*-2;
    const rad = Math.sqrt(l.x**2 + l.y**2); l.z = rad < 1 ? Math.sqrt(1-rad**2) : .05;
    // sync BOTH desktop and mobile dots for this light
    ['d','m'].forEach(sfx => {
      const d = $(`ldot-${sfx}-${id}`);
      if (d){ d.style.left = (px*100)+'%'; d.style.top = (py*100)+'%'; }
    });
    renderLit();
  };

  // Pointer Events unify mouse + touch and support setPointerCapture,
  // which keeps tracking even when the finger leaves the pad — and crucially
  // stops the parent bottom-sheet from stealing the gesture.
  pad.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    pad.setPointerCapture(e.pointerId);
    apply(e.clientX, e.clientY);
  });
  pad.addEventListener('pointermove', e => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return; // not dragging
    if (!pad.hasPointerCapture(e.pointerId)) return;
    e.preventDefault(); e.stopPropagation();
    apply(e.clientX, e.clientY);
  });
  pad.addEventListener('pointerup', e => {
    try { pad.releasePointerCapture(e.pointerId); } catch(_){}
  });
  // block touch scrolling on the pad explicitly
  pad.addEventListener('touchmove', e => e.preventDefault(), { passive:false });
}
