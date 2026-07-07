// ════════════════════════════════════════════════════════════
// spin.js — Spin Preview
//
// Physics: when the SPRITE spins, lights stay FIXED in world space.
// We achieve this by rotating each normal vector by -angle before lighting,
// so a world-space light correctly "slides" its highlight across the surface.
// When LIGHT orbits, the sprite stays still and each light's direction is
// rotated around the sprite center.
// ════════════════════════════════════════════════════════════

const Spin = {
  open: false,
  sprite: null,        // canvas
  normal: null,        // canvas
  raf: null,
  angle: 0,
  mode: 'object',      // 'object' = sprite spins | 'light' = lights orbit
  lights: [{ color:'#ffffff', intensity:1.0, x:0.4, y:-0.4, z:0.82, orbit:false, mirror:false, phase:0 }],
  centerMode: 'auto',  // 'auto' | 'manual'
  center: { x:0.5, y:0.5 }, // normalized 0..1 within sprite
  bgColor: '#808080',
  bgTransparent: false,
};

function openSpin(){
  Spin.open = true; $('spinOverlay').classList.add('open'); setActiveTab('htabSpin');
  resizeSpin(); rebuildSpinLights(); spinLoop();
}
function closeSpin(){
  Spin.open = false; cancelAnimationFrame(Spin.raf);
  $('spinOverlay').classList.remove('open'); setActiveTab('htabGen');
}
function resizeSpin(){
  const cv = $('spinCv');
  const stage = cv.parentElement;
  const avail = Math.min(stage.clientWidth-24, stage.clientHeight-24);
  const sz = Math.max(200, Math.min(avail, 600)); // up to 600px, fits large sprites
  cv.width = sz; cv.height = sz;
}

// ── source loading ──
function spinUseCurrent(){
  if (!App.frames.length || !App.normalFrames.length){ toast(t('generate_first')); return; }
  Spin.sprite = App.frames[App.curFrame].canvas;
  const nc = document.createElement('canvas'); const nd = App.normalFrames[App.curFrame];
  nc.width = nd.width; nc.height = nd.height; nc.getContext('2d').putImageData(nd, 0, 0);
  Spin.normal = nc; autoCenter(); toast(t('loaded_current'));
}
function spinFileSprite(files){
  const f = [...files].find(x => x.type.startsWith('image/')); if (!f) return;
  const r = new FileReader();
  r.onload = e => imgFromURL(e.target.result).then(img => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0); Spin.sprite = c;
    $('spinSpriteName').textContent = f.name; autoCenter();
  }); r.readAsDataURL(f);
}
function spinFileNormal(files){
  const f = [...files].find(x => x.type.startsWith('image/')); if (!f) return;
  const r = new FileReader();
  r.onload = e => imgFromURL(e.target.result).then(img => {
    const base = Spin.sprite || img;
    const c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); Spin.normal = c;
    $('spinNormalName').textContent = f.name;
  }); r.readAsDataURL(f);
}
function spinFromRecent(){
  const list = $('spinRecentList'); list.innerHTML = '';
  if (!App.recentPairs.length) list.innerHTML = '<p style="font-size:11px;color:var(--muted);padding:10px">No recent normals.</p>';
  App.recentPairs.forEach(p => {
    const d = document.createElement('div'); d.className = 'recent-item';
    d.innerHTML = `<img src="${p.sprite}"><span>${p.name}</span>`;
    d.onclick = async () => {
      const s = await imgFromURL(p.sprite), n = await imgFromURL(p.normal);
      const sc = document.createElement('canvas'); sc.width = s.width; sc.height = s.height; sc.getContext('2d').drawImage(s, 0, 0); Spin.sprite = sc;
      const ncv = document.createElement('canvas'); ncv.width = n.width; ncv.height = n.height; ncv.getContext('2d').drawImage(n, 0, 0); Spin.normal = ncv;
      $('spinRecentModal').classList.remove('open'); autoCenter(); toast(t('loaded_recent'));
    };
    list.appendChild(d);
  });
  $('spinRecentModal').classList.add('open');
}

// ── center (auto from alpha bbox, or manual pick) ──
function autoCenter(){
  if (Spin.centerMode !== 'auto' || !Spin.sprite) return;
  const w = Spin.sprite.width, h = Spin.sprite.height;
  const d = Spin.sprite.getContext('2d').getImageData(0,0,w,h).data;
  let minX=w,maxX=0,minY=h,maxY=0,any=false;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){ if (d[(y*w+x)*4+3]>20){ any=true;
    if (x<minX)minX=x; if (x>maxX)maxX=x; if (y<minY)minY=y; if (y>maxY)maxY=y; } }
  if (any){ Spin.center.x = ((minX+maxX)/2)/w; Spin.center.y = ((minY+maxY)/2)/h; }
  else { Spin.center.x = 0.5; Spin.center.y = 0.5; }
  updateCenterMarker();
}
function spinSetCenterMode(m){
  Spin.centerMode = m;
  $('centerAuto').classList.toggle('on', m==='auto');
  $('centerManual').classList.toggle('on', m==='manual');
  $('centerPickHint').style.display = m==='manual' ? 'block' : 'none';
  if (m==='auto') autoCenter();
  updateCenterMarker();
}
function updateCenterMarker(){
  const mk = $('centerMarker'); if (!mk || !Spin.sprite) return;
  const cv = $('spinCv'); const sw = Spin.sprite.width, sh = Spin.sprite.height;
  const scale = Math.min(cv.width*0.9/sw, cv.width*0.9/sh);
  // sprite is drawn centered; compute marker screen pos relative to sprite center pixel
  const offX = (Spin.center.x - 0.5) * sw * scale;
  const offY = (Spin.center.y - 0.5) * sh * scale;
  mk.style.left = (cv.offsetLeft + cv.width/2 + offX) + 'px';
  mk.style.top  = (cv.offsetTop + cv.height/2 + offY) + 'px';
  mk.style.display = Spin.centerMode==='manual' ? 'block' : 'none';
}
function spinCenterPick(e){
  if (Spin.centerMode !== 'manual' || !Spin.sprite) return;
  const cv = $('spinCv'), r = cv.getBoundingClientRect();
  const cl = e.touches ? e.touches[0] : e;
  const sx = cl.clientX - r.left, sy = cl.clientY - r.top;
  const sw = Spin.sprite.width, sh = Spin.sprite.height;
  const scale = Math.min(cv.width*0.9/sw, cv.width*0.9/sh);
  // inverse of draw transform
  Spin.center.x = Math.max(0, Math.min(1, (sx - cv.width/2)/(sw*scale) + 0.5));
  Spin.center.y = Math.max(0, Math.min(1, (sy - cv.height/2)/(sh*scale) + 0.5));
  updateCenterMarker();
}

// ── mode ──
function spinSetMode(m){
  Spin.mode = m;
  $('spinModeObj').classList.toggle('on', m==='object');
  $('spinModeLight').classList.toggle('on', m==='light');
}

// ── lights (each with own position, orbit toggle, mirror) ──
function rebuildSpinLights(){
  const el = $('spinLightList'); el.innerHTML = '';
  Spin.lights.forEach((l, i) => {
    const d = document.createElement('div'); d.className = 'spin-light-item';
    d.innerHTML = `
      <div class="spin-light-hdr">
        <div class="light-dot" style="background:${l.color}"></div>
        <span>Light ${i+1}</span>
        ${Spin.lights.length>1 ? `<button class="del-btn" onclick="Spin.lights.splice(${i},1);rebuildSpinLights()"><span class="mi">close</span></button>` : ''}
      </div>
      <div class="light-row">
        <input type="color" value="${l.color}" oninput="Spin.lights[${i}].color=this.value;rebuildSpinLights()">
        <input type="range" min="0" max="2" step="0.05" value="${l.intensity}" style="flex:1;margin:0" oninput="Spin.lights[${i}].intensity=+this.value">
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">
        <label style="font-size:10px;color:var(--muted)">Orbit</label>
        <div class="tog ${l.orbit?'on':''}" onclick="Spin.lights[${i}].orbit=!Spin.lights[${i}].orbit;rebuildSpinLights()" style="width:28px;height:16px"></div>
        <label style="font-size:10px;color:var(--muted);margin-left:8px">Mirror</label>
        <div class="tog ${l.mirror?'on':''}" onclick="Spin.lights[${i}].mirror=!Spin.lights[${i}].mirror" style="width:28px;height:16px"></div>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start">
        <div class="spin-orbit-pad" id="sorbit-${i}">
          <div class="spin-orbit-center"></div>
          <div class="spin-orbit-dot" id="sodot-${i}" style="background:${l.color};left:${(l.x/2+.5)*100}%;top:${(-l.y/2+.5)*100}%"></div>
        </div>
        <div style="font-size:9px;color:var(--muted);line-height:1.5">Drag to set<br>light position</div>
      </div>`;
    el.appendChild(d);
    setTimeout(() => setupSpinOrbitPad(i), 0);
  });
}
function spinAddLight(){
  if (Spin.lights.length >= 4){ toast(t('max_lights')); return; }
  Spin.lights.push({ color: LC[Spin.lights.length % LC.length], intensity:0.8,
    x: Math.random()-.5, y: -(Math.random()*.6+.3), z:0.7, orbit:false, mirror:false, phase: Math.random()*Math.PI*2 });
  rebuildSpinLights();
}
function setupSpinOrbitPad(i){
  const pad = $('sorbit-'+i); if (!pad || pad._wired) return;
  pad._wired = true;
  pad.style.touchAction = 'none';
  const apply = (clientX, clientY) => {
    const r = pad.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX-r.left)/r.width));
    const py = Math.max(0, Math.min(1, (clientY-r.top)/r.height));
    const l = Spin.lights[i]; if (!l) return;
    l.x = (px-.5)*2; l.y = (py-.5)*-2;
    const rad = Math.sqrt(l.x**2+l.y**2); l.z = rad < 1 ? Math.sqrt(1-rad**2) : .05;
    const dot = $('sodot-'+i); if (dot){ dot.style.left=(px*100)+'%'; dot.style.top=(py*100)+'%'; }
    l.phase = Math.atan2(l.y, l.x);
  };
  pad.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    pad.setPointerCapture(e.pointerId); apply(e.clientX, e.clientY);
  });
  pad.addEventListener('pointermove', e => {
    if (!pad.hasPointerCapture(e.pointerId)) return;
    e.preventDefault(); apply(e.clientX, e.clientY);
  });
  pad.addEventListener('pointerup', e => { try { pad.releasePointerCapture(e.pointerId); } catch(_){} });
  pad.addEventListener('touchmove', e => e.preventDefault(), { passive:false });
}

// ── background ──
function spinSetBg(val){ Spin.bgColor = val; }
function spinToggleTransparent(tog){
  Spin.bgTransparent = !Spin.bgTransparent; tog.classList.toggle('on', Spin.bgTransparent);
  $('spinBgColor').disabled = Spin.bgTransparent;
}

// ════════════ RENDER ════════════
// angle: current rotation. For 'object' mode the sprite image is rotated AND
// each normal is counter-rotated so world-space lights stay put.
function renderSpinFrame(angle, forExport){
  const cv = $('spinCv'), ctx = cv.getContext('2d');
  const size = cv.width;
  ctx.clearRect(0, 0, size, size);
  // Background: in live preview always show something; transparent uses checker-less clear.
  if (!Spin.bgTransparent){ ctx.fillStyle = Spin.bgColor; ctx.fillRect(0, 0, size, size); }
  if (!Spin.sprite){
    ctx.fillStyle = '#999'; ctx.font = '13px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Load a sprite →', size/2, size/2); return;
  }
  const sw = Spin.sprite.width, sh = Spin.sprite.height;
  // Fit sprite to canvas: never exceed canvas, but fill it well
  const padding = 0.9;
  const scale = Math.min((size*padding)/sw, (size*padding)/sh);
  const useSmoothing = scale < 1; // only smooth when downscaling

  // Build the lit sprite at native resolution.
  const lit = document.createElement('canvas'); lit.width = sw; lit.height = sh;
  const lctx = lit.getContext('2d');
  const sd = Spin.sprite.getContext('2d').getImageData(0, 0, sw, sh);
  const out = lctx.createImageData(sw, sh);
  const nd = Spin.normal ? Spin.normal.getContext('2d').getImageData(0, 0, sw, sh) : null;
  const AMB = 0.16;

  // Normal counter-rotation when the sprite spins (object mode).
  // World light stays fixed → in sprite-local space we rotate normals by -angle.
  const objSpin = (Spin.mode === 'object');
  const ca = Math.cos(-angle), sa = Math.sin(-angle);

  // Precompute light directions.
  const PL = Spin.lights.map(l => {
    let lx = l.x, ly = l.y;
    if (Spin.mode === 'light' && l.orbit){
      // orbit the light around center
      const dir = l.mirror ? -angle : angle;
      const base = Math.atan2(l.y, l.x);
      const rad = Math.sqrt(l.x*l.x + l.y*l.y) || 0.6;
      lx = Math.cos(base + dir) * rad;
      ly = Math.sin(base + dir) * rad;
    } else if (Spin.mode === 'light' && !l.orbit){
      // static light, sprite static → no change
    }
    const ll = Math.sqrt(lx*lx + ly*ly + l.z*l.z) || 1;
    const lr = parseInt(l.color.slice(1,3),16)/255, lg = parseInt(l.color.slice(3,5),16)/255, lb = parseInt(l.color.slice(5,7),16)/255;
    return { r:lr, g:lg, b:lb, int:l.intensity, lx:lx/ll, ly:ly/ll, lz:l.z/ll };
  });

  for (let i = 0; i < sw*sh; i++){
    const idx = i*4; const a = sd.data[idx+3];
    if (a === 0){ out.data[idx+3] = 0; continue; }
    let nx = 0, ny = 0, nz = 1;
    if (nd){ nx = nd.data[idx]/255*2-1; ny = nd.data[idx+1]/255*2-1; nz = nd.data[idx+2]/255*2-1; }
    // counter-rotate normal so world light is fixed while sprite spins
    if (objSpin){ const rx = nx*ca - ny*sa, ry = nx*sa + ny*ca; nx = rx; ny = ry; }
    let tr = AMB, tg = AMB, tb = AMB;
    PL.forEach(L => {
      const diff = Math.max(0, nx*L.lx + ny*L.ly + nz*L.lz) * L.int;
      const hx = L.lx, hy = L.ly, hz = L.lz+1, hl = Math.sqrt(hx*hx+hy*hy+hz*hz) || 1;
      const sp = Math.pow(Math.max(0, nx*(hx/hl)+ny*(hy/hl)+nz*(hz/hl)), 24) * 0.35 * L.int;
      tr += diff*L.r+sp*L.r; tg += diff*L.g+sp*L.g; tb += diff*L.b+sp*L.b;
    });
    out.data[idx]   = Math.min(255, sd.data[idx]   * tr * 1.25);
    out.data[idx+1] = Math.min(255, sd.data[idx+1] * tg * 1.25);
    out.data[idx+2] = Math.min(255, sd.data[idx+2] * tb * 1.25);
    out.data[idx+3] = a;
  }
  lctx.putImageData(out, 0, 0);

  // Draw: rotate around the chosen center (object mode), static (light mode).
  ctx.save();
  ctx.translate(size/2, size/2);
  if (objSpin) ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = useSmoothing;
  // shift so the rotation pivots around Spin.center instead of image center
  const pivotX = (Spin.center.x - 0.5) * sw;
  const pivotY = (Spin.center.y - 0.5) * sh;
  ctx.translate(-pivotX, -pivotY);
  ctx.drawImage(lit, -sw/2, -sh/2);
  ctx.restore();
}

function spinLoop(){
  if (!Spin.open) return;
  const speed = +$('spinSpeed').value;
  Spin.angle += speed * 0.02;
  renderSpinFrame(Spin.angle, false);
  if (Spin.centerMode === 'manual') updateCenterMarker();
  Spin.raf = requestAnimationFrame(spinLoop);
}

// ── export PNG (500×500, no quality loss for small sprites) ──
function spinExportPNG(){
  if (!Spin.sprite){ toast(t('load_sprite_first')); return; }
  const size = 500;
  const out = document.createElement('canvas'); out.width = size; out.height = size;
  const octx = out.getContext('2d');
  if (!Spin.bgTransparent){ octx.fillStyle = Spin.bgColor; octx.fillRect(0, 0, size, size); }
  // re-render current frame directly at 500 for crispness
  const tmpAngle = Spin.angle;
  const sw = Spin.sprite.width, sh = Spin.sprite.height;
  // Fit sprite to canvas: never exceed canvas, but fill it well
  const padding = 0.9;
  const scale = Math.min((size*padding)/sw, (size*padding)/sh);
  const useSmoothing = scale < 1; // only smooth when downscaling
  // build lit at native then draw scaled
  const litCanvas = buildSpinLit(tmpAngle);
  octx.save(); octx.translate(size/2, size/2);
  if (Spin.mode === 'object') octx.rotate(tmpAngle);
  octx.scale(scale, scale); octx.imageSmoothingEnabled = scale < 1;
  const pivotX = (Spin.center.x - 0.5) * sw, pivotY = (Spin.center.y - 0.5) * sh;
  octx.translate(-pivotX, -pivotY);
  octx.drawImage(litCanvas, -sw/2, -sh/2); octx.restore();
  dl(out, 'spin_frame.png'); toast(t('png_saved'));
}
// helper to build lit canvas at native res for a given angle (used by PNG export)
function buildSpinLit(angle){
  const sw = Spin.sprite.width, sh = Spin.sprite.height;
  const lit = document.createElement('canvas'); lit.width = sw; lit.height = sh;
  const lctx = lit.getContext('2d');
  const sd = Spin.sprite.getContext('2d').getImageData(0,0,sw,sh);
  const out = lctx.createImageData(sw, sh);
  const nd = Spin.normal ? Spin.normal.getContext('2d').getImageData(0,0,sw,sh) : null;
  const AMB = 0.16, objSpin = (Spin.mode==='object');
  const ca = Math.cos(-angle), sa = Math.sin(-angle);
  const PL = Spin.lights.map(l => {
    let lx=l.x, ly=l.y;
    if (Spin.mode==='light'&&l.orbit){ const dir=l.mirror?-angle:angle; const base=Math.atan2(l.y,l.x);
      const rad=Math.sqrt(l.x*l.x+l.y*l.y)||0.6; lx=Math.cos(base+dir)*rad; ly=Math.sin(base+dir)*rad; }
    const ll=Math.sqrt(lx*lx+ly*ly+l.z*l.z)||1;
    const lr=parseInt(l.color.slice(1,3),16)/255,lg=parseInt(l.color.slice(3,5),16)/255,lb=parseInt(l.color.slice(5,7),16)/255;
    return {r:lr,g:lg,b:lb,int:l.intensity,lx:lx/ll,ly:ly/ll,lz:l.z/ll};
  });
  for (let i=0;i<sw*sh;i++){ const idx=i*4; const a=sd.data[idx+3]; if(a===0){out.data[idx+3]=0;continue;}
    let nx=0,ny=0,nz=1; if(nd){nx=nd.data[idx]/255*2-1;ny=nd.data[idx+1]/255*2-1;nz=nd.data[idx+2]/255*2-1;}
    if(objSpin){const rx=nx*ca-ny*sa,ry=nx*sa+ny*ca;nx=rx;ny=ry;}
    let tr=AMB,tg=AMB,tb=AMB;
    PL.forEach(L=>{const diff=Math.max(0,nx*L.lx+ny*L.ly+nz*L.lz)*L.int;
      const hx=L.lx,hy=L.ly,hz=L.lz+1,hl=Math.sqrt(hx*hx+hy*hy+hz*hz)||1;
      const sp=Math.pow(Math.max(0,nx*(hx/hl)+ny*(hy/hl)+nz*(hz/hl)),24)*0.35*L.int;
      tr+=diff*L.r+sp*L.r;tg+=diff*L.g+sp*L.g;tb+=diff*L.b+sp*L.b;});
    out.data[idx]=Math.min(255,sd.data[idx]*tr*1.25);out.data[idx+1]=Math.min(255,sd.data[idx+1]*tg*1.25);
    out.data[idx+2]=Math.min(255,sd.data[idx+2]*tb*1.25);out.data[idx+3]=a;}
  lctx.putImageData(out,0,0); return lit;
}

// ── export video (WebM via MediaRecorder) ──
async function spinExportVideo(){
  if (!Spin.sprite){ toast(t('load_sprite_first')); return; }
  const dur = Math.min(10, +$('spinDuration').value) * 1000;
  const cv = $('spinCv');
  if (!cv.captureStream){ toast(t('video_unsupported')); return; }
  const stream = cv.captureStream(30);
  let mime = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
  const rec = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    const blob = new Blob(chunks, { type:'video/webm' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'spin.webm'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); toast(t('video_saved'));
    $('spinRecBtn').innerHTML = '<span class="mi">videocam</span>Record video';
  };
  $('spinRecBtn').innerHTML = '<span class="mi">stop</span>Recording…';
  rec.start(); setTimeout(() => rec.stop(), dur);
}
