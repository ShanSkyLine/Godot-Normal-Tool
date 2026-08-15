// ════════════════════════════════════════════════════════════
// lights.js — PointLight2D nodes for the main lit preview.
// Each light can use a quick Profile preset (Soft/Hard/Pastel/Rim/
// Ambient) or be tuned manually, which switches it to "Custom".
// ════════════════════════════════════════════════════════════

const LIGHT_PROFILES = {
  soft:    { intensity:0.75, z:0.80, softness:0.85, highlight:0.15 },
  hard:    { intensity:1.15, z:0.30, softness:0.00, highlight:0.75 },
  pastel:  { intensity:0.55, z:0.75, softness:0.70, highlight:0.10, desat:0.35 },
  rim:     { intensity:1.35, z:0.08, softness:0.15, highlight:0.55 },
  ambient: { intensity:0.45, z:0.95, softness:1.00, highlight:0.02 },
};
function blendToWhite(hex, amt){
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const mix = c => Math.round(c + (255-c)*amt);
  return '#' + [mix(r),mix(g),mix(b)].map(v => v.toString(16).padStart(2,'0')).join('');
}
function setLightProfile(id, profile){
  const l = App.lights.find(x => x.id === id); if (!l) return;
  l.profile = profile;
  const p = LIGHT_PROFILES[profile];
  if (p){
    l.intensity = p.intensity; l.z = p.z; l.softness = p.softness; l.highlight = p.highlight;
    if (p.desat) l.color = blendToWhite(l.color, p.desat);
  }
  rebuildLightUI(); renderLit();
}
// Only the "shape of the light" sliders (Energy/Height/Softness/Highlight)
// invalidate a profile — direction and color are independent of which
// preset is active, so dragging the pad or repainting the color keeps
// whatever profile was selected (Rim pointed left is still Rim).
function markLightCustom(id){
  const l = App.lights.find(x => x.id === id); if (!l || l.profile === 'custom') return;
  l.profile = 'custom';
  ['d','m'].forEach(sfx => { const el = $('lprof-'+sfx+'-'+id); if (el) el.value = 'custom'; });
}

function addLight(){
  App.lights.push({
    id: App.nextLightId++, name: 'Light ' + App.lights.length,
    color: LC[App.lights.length % LC.length],
    intensity: 0.8, x: Math.random()-.5, y: -(Math.random()*.6+.3), z: 0.7, enabled: true,
    profile: 'custom', softness: 0.15, highlight: 0.45,
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
  const suffix = listId === 'lightListM' ? 'm' : 'd'; // unique control ids per list
  const div = document.createElement('div'); div.className = 'light-item';
  const profile = l.profile || 'custom';
  const safeName = escapeHtml(l.name);
  const opt = (val, label) => `<option value="${val}"${profile===val?' selected':''}>${escapeHtml(label)}</option>`;
  const slider = (field, label, val, min, max, step) => `
    <div class="sl-row"><span>${escapeHtml(label)}</span><span class="sl-val" id="lval-${field}-${suffix}-${l.id}">${(+val).toFixed(2)}</span></div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${val}"
      oninput="setLightParam(${l.id},'${field}',this.value,'${suffix}')">`;
  div.innerHTML = `<div class="light-item-hdr">
      <span class="mi node-ico node-ico-light" style="font-size:14px">wb_incandescent</span>
      <div class="light-dot" style="background:${l.color}"></div>
      <span class="light-item-name" title="PointLight2D — ${safeName}">${safeName}</span>
      <div class="tog ${l.enabled?'on':''}" onclick="toggleLight(${l.id},this)"></div>
      <button class="del-btn" onclick="removeLight(${l.id})"><span class="mi">close</span></button></div>
    <select class="light-profile" id="lprof-${suffix}-${l.id}" onchange="setLightProfile(${l.id}, this.value)">
      ${opt('soft', t('profile_soft'))}${opt('hard', t('profile_hard'))}${opt('pastel', t('profile_pastel'))}
      ${opt('rim', t('profile_rim'))}${opt('ambient', t('profile_ambient'))}${opt('custom', t('profile_custom'))}
    </select>
    <div class="light-row">
      ${profile === 'custom' ? `<label data-i18n="light_color">${escapeHtml(t('light_color'))}</label><input type="color" value="${l.color}" aria-label="${escapeHtml(t('light_color'))}" oninput="setLightColor(${l.id},this.value,this)">` : ''}
      <input type="range" min="0" max="2" step="0.05" value="${l.intensity}" style="flex:1;margin:0"
        oninput="setLightParam(${l.id},'intensity',this.value,'${suffix}')"></div>
    ${slider('z', t('light_height'), l.z, 0, 1, 0.02)}
    ${slider('softness', t('light_softness'), l.softness != null ? l.softness : 0, 0, 1, 0.02)}
    ${slider('highlight', t('light_highlight'), l.highlight != null ? l.highlight : 0.45, 0, 1, 0.02)}
    <div class="lpad" id="lpad-${suffix}-${l.id}" style="max-width:88px;touch-action:none">
      <div class="lpad-x"></div><div class="lpad-y"></div>
      <div class="lpad-dot" id="ldot-${suffix}-${l.id}" style="left:${(l.x/2+.5)*100}%;top:${(-l.y/2+.5)*100}%"></div></div>`;
  setTimeout(() => setupLightPad(l.id, suffix), 0); return div;
}
// generic setter for any numeric light field driven by a slider — keeps
// the numeric readout in sync without rebuilding the whole list (which
// would kill the slider's drag under the pointer)
function setLightParam(id, field, val, suffix){
  const l = App.lights.find(x => x.id === id); if (!l) return;
  l[field] = +val;
  markLightCustom(id);
  const valEl = $('lval-'+field+'-'+suffix+'-'+id); if (valEl) valEl.textContent = (+val).toFixed(2);
  renderLit();
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
// Controls direction (X/Y) only now — Height (Z) is its own explicit slider
// above, so it's always visible and tunable instead of being silently
// derived from how close to the pad's edge you drag.
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
    // Direction is orthogonal to "what kind of light is this" — Rim stays
    // Rim no matter which way it's pointed, so this does NOT mark Custom.
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
