// Surface engine v0.8: geometry, texture detail, authored relief and height maps.
// No semantic/AI inference: silhouette volume is independent of painted colour.
function surfaceDefaults(){ return { mode:'silhouette', volume:0.65, detail:0, smooth:2, darkRaised:false }; }
function cleanSurface(s={}){
  const d=surfaceDefaults();
  for(const k of ['volume','detail','smooth']) if(Number.isFinite(+s[k])) d[k]=Math.max(0,Math.min(k==='smooth'?8:1,+s[k]));
  if(['silhouette','texture','sculpt','height'].includes(s.mode)) d.mode=s.mode;
  d.darkRaised=!!s.darkRaised; return d;
}
// Two-pass chamfer distance with a virtual transparent border, including opaque images.
function surfaceDistance(p,w,h){
  const d=new Float32Array(w*h), diag=Math.SQRT2;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const i=y*w+x; d[i]=p[i*4+3]>20?Math.min(x+1,y+1,w-x,h-y):0;
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const i=y*w+x;
    if(x) d[i]=Math.min(d[i],d[i-1]+1);
    if(y){d[i]=Math.min(d[i],d[i-w]+1);if(x)d[i]=Math.min(d[i],d[i-w-1]+diag);if(x+1<w)d[i]=Math.min(d[i],d[i-w+1]+diag);}
  }
  for(let y=h-1;y>=0;y--) for(let x=w-1;x>=0;x--){
    const i=y*w+x;
    if(x+1<w)d[i]=Math.min(d[i],d[i+1]+1);
    if(y+1<h){d[i]=Math.min(d[i],d[i+w]+1);if(x)d[i]=Math.min(d[i],d[i+w-1]+diag);if(x+1<w)d[i]=Math.min(d[i],d[i+w+1]+diag);}
  }
  return d;
}
function surfaceHeight(p,w,h,cfg,heightMap){
  const n=w*h, lum=new Float32Array(n), dist=surfaceDistance(p,w,h), H=new Float32Array(n);
  for(let i=0;i<n;i++) lum[i]=(p[i*4]*0.2126+p[i*4+1]*0.7152+p[i*4+2]*0.0722)/255;
  // Propagate valid colour into transparent pixels; their arbitrary RGB must not create rims.
  const owner=new Int32Array(n).fill(-1), queue=new Int32Array(n);let tail=0;
  for(let i=0;i<n;i++)if(p[i*4+3]>20){owner[i]=i;queue[tail++]=i;}
  for(let head=0;head<tail;head++){
    const i=queue[head],x=i%w;
    for(const j of [x?i-1:-1,x+1<w?i+1:-1,i-w,i+w])if(j>=0&&j<n&&owner[j]===-1){owner[j]=owner[i];queue[tail++]=j;}
  }
  for(let i=0;i<n;i++)if(owner[i]>=0)lum[i]=lum[owner[i]];
  const fine=cfg.smooth?blur(lum,w,h,Math.round(cfg.smooth)):lum;
  const coarse=blur(fine,w,h,Math.max(2,Math.round(Math.min(w,h)/32)));
  const scale=Math.max(1,Math.min(w,h)*0.12);
  for(let i=0;i<n;i++){
    const body=scale*Math.sqrt(Math.max(0,1-Math.pow(1-Math.min(1,dist[i]/scale),2)))*cfg.volume;
    const sign=cfg.darkRaised?-1:1;
    if(cfg.mode==='height') H[i]=heightMap?heightMap.data[i]*(cfg.darkRaised?-1:1)*scale:0;
    else if(cfg.mode==='texture')H[i]=sign*(fine[i]-0.5)*cfg.detail*scale;
    else H[i]=body+sign*(fine[i]-coarse[i])*cfg.detail*scale;
  }
  return H;
}
function genNormalSurface(src){
  const w=src.width,h=src.height,p=src.getContext('2d').getImageData(0,0,w,h).data;
  const cfg=cleanSurface(App.surface), map=src._surfaceHeight;
  const validMap=map&&map.w===w&&map.h===h?map:null;
  const H=surfaceHeight(p,w,h,cfg,validMap), edits=cfg.mode==='sculpt'?(src._surfaceEdits||[]):[];
  // Each stamp has a smooth, compact footprint; flat/direction stamps override normals below.
  for(const e of edits){
    if(e.tool!=='raise'&&e.tool!=='dent')continue;
    const r=e.r, sign=e.tool==='raise'?1:-1;
    for(let y=Math.max(0,Math.floor(e.y-r));y<Math.min(h,Math.ceil(e.y+r+1));y++)for(let x=Math.max(0,Math.floor(e.x-r));x<Math.min(w,Math.ceil(e.x+r+1));x++){
      const q=Math.hypot(x-e.x,y-e.y)/r;if(q<1)H[y*w+x]+=sign*e.power*r*0.35*Math.pow(1-q*q,2);
    }
  }
  const out=new Uint8ClampedArray(w*h*4), strength=+$('sStr').value, z=+$('sZ').value;
  const sample=(x,y,i)=>{x=Math.max(0,Math.min(w-1,x));y=Math.max(0,Math.min(h-1,y));const j=y*w+x;return p[j*4+3]>20?H[j]:H[i];};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x;let nx=-(sample(x+1,y,i)-sample(x-1,y,i))*0.5*strength,ny=(sample(x,y+1,i)-sample(x,y-1,i))*0.5*strength,nz=z;
    for(const e of edits){
      if(e.tool==='raise'||e.tool==='dent')continue;
      const q=Math.hypot(x-e.x,y-e.y)/e.r;if(q>=1)continue;
      const a=Math.pow(1-q*q,2)*e.power, targets={flat:[0,0],left:[-z,0],right:[z,0],up:[0,z],down:[0,-z]}, v=targets[e.tool];
      if(v){nx=nx*(1-a)+v[0]*a;ny=ny*(1-a)+v[1]*a;}
    }
    if(App.invert.h){nx=-nx;ny=-ny;}if(App.invert.r)nx=-nx;if(App.invert.g)ny=-ny;
    if(!p[i*4+3]){nx=0;ny=0;nz=1;}
    const len=Math.hypot(nx,ny,nz)||1;
    out[i*4]=Math.round((nx/len*0.5+0.5)*255);out[i*4+1]=Math.round((ny/len*0.5+0.5)*255);out[i*4+2]=Math.round((nz/len*0.5+0.5)*255);out[i*4+3]=p[i*4+3];
  }
  return new ImageData(out,w,h);
}
function surfaceSetting(key,value){
  App.surface=cleanSurface({...App.surface,[key]:value});
  if(key==='mode' && value==='texture' && App.surface.detail===0)App.surface.detail=0.5;
  refreshSurfaceUI();LP();
}
function refreshSurfaceUI(){
  if(!App.surface)App.surface=surfaceDefaults();
  for(const prefix of ['', 'm']){
    const panel=$(prefix+'surfacePanel');if(!panel)continue;
    panel.style.display=App.engine==='surface'?'block':'none';
    for(const key of ['mode','volume','detail','smooth','darkRaised']){
      const el=$(prefix+'surface_'+key);if(!el)continue;
      if(key==='darkRaised')el.checked=App.surface[key];else el.value=App.surface[key];
    }
    const btn=$(prefix?'mEngSurface':'engSurface');if(btn)btn.classList.toggle('on',App.engine==='surface');
    const hint=$(prefix+'surfaceHint');if(hint)hint.textContent=t(App.surface.mode==='height'?'surface_height_hint':'surface_hint');
  }
}
function surfacePanelHTML(prefix){
  return `<div id="${prefix}surfacePanel" class="surface-panel">
    <label data-i18n="surface_category">Category</label>
    <select id="${prefix}surface_mode" onchange="surfaceSetting('mode',this.value)">
      <option value="silhouette" data-i18n="surface_silhouette">Silhouette volume</option><option value="texture" data-i18n="surface_texture">Texture relief</option><option value="sculpt" data-i18n="surface_sculpt">Authored form</option><option value="height" data-i18n="surface_height">Height map</option>
    </select>
    <p id="${prefix}surfaceHint" class="surface-hint"></p>
    <label data-i18n="surface_volume">Body volume</label><input aria-label="Body volume" id="${prefix}surface_volume" type="range" min="0" max="1" step="0.01" oninput="surfaceSetting('volume',+this.value)">
    <label data-i18n="surface_detail">Colour detail (0 ignores colour)</label><input aria-label="Colour detail" id="${prefix}surface_detail" type="range" min="0" max="1" step="0.01" oninput="surfaceSetting('detail',+this.value)">
    <label data-i18n="surface_smooth">Detail smoothing</label><input aria-label="Detail smoothing" id="${prefix}surface_smooth" type="range" min="0" max="8" step="1" oninput="surfaceSetting('smooth',+this.value)">
    <label><input id="${prefix}surface_darkRaised" type="checkbox" onchange="surfaceSetting('darkRaised',this.checked)"><span data-i18n="surface_dark">Dark = raised (texture / height)</span></label>
    <button class="btn" onclick="openSurfaceEditor()" data-i18n="surface_edit">Edit current frame / layer</button>
    <label class="btn"><span data-i18n="surface_load">Load height map for current frame / layer</span><input type="file" accept="image/*" onchange="loadSurfaceHeight(this.files);this.value=''" style="max-width:100%"></label>
  </div>`;
}
function surfaceSource(){
  if(App.mode==='layers'){
    const l=App.layers.find(l=>l.id===App.soloLayerId);return l?l.canvas:null;
  }
  return App.frames[App.curFrame]?.canvas||null;
}
function surfaceChanged(){
  if(App.mode==='layers'){App.layers.forEach(l=>l._normalCache=null);}
  LP();
}
async function loadSurfaceHeight(files){
  const file=files?.[0],src=surfaceSource();if(!file)return;
  if(!src){toast(t('surface_select'));return;}
  const url=URL.createObjectURL(file);
  try{
    const img=await imgFromURL(url);
    if(img.width!==src.width||img.height!==src.height){toast(t('surface_size'));return;}
    const p=toC(img).getContext('2d').getImageData(0,0,img.width,img.height).data, data=new Float32Array(img.width*img.height);
    for(let i=0;i<data.length;i++)data[i]=(p[i*4]*0.2126+p[i*4+1]*0.7152+p[i*4+2]*0.0722)/255;
    src._surfaceHeight={w:img.width,h:img.height,data};
    App.surface.mode='height';setEngine('surface');refreshSurfaceUI();surfaceChanged();
  }catch(e){toast(t('surface_invalid'));}finally{URL.revokeObjectURL(url);}
}
let surfaceEditorSource=null, surfaceStroke=null;
function openSurfaceEditor(){
  const src=surfaceSource();if(!src){toast(t('surface_select'));return;}
  App.surface.mode='sculpt';setEngine('surface');refreshSurfaceUI();
  if(App.playing)togglePlay();
  surfaceEditorSource=src;src._surfaceEdits ||= [];
  $('surfaceEditor').hidden=false;drawSurfaceEditor();$('surfaceClose').focus();
}
function closeSurfaceEditor(){surfaceStroke=null;surfaceEditorSource=null;$('surfaceEditor').hidden=true;}
function drawSurfaceEditor(){
  const src=surfaceEditorSource;if(!src)return;
  const c=$('surfaceCanvas');c.width=src.width;c.height=src.height;const ctx=c.getContext('2d');
  if($('surfacePreview').checked)ctx.putImageData(genNormalSurface(src),0,0);else ctx.drawImage(src,0,0);
  if(!$('surfacePreview').checked)for(const e of src._surfaceEdits){ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fillStyle=e.tool==='dent'?'#ff556622':'#44aaff22';ctx.fill();}
}
function surfaceStamp(e){
  const src=surfaceEditorSource;if(!src)return;const rect=$('surfaceCanvas').getBoundingClientRect();
  const x=(e.clientX-rect.left)*src.width/rect.width,y=(e.clientY-rect.top)*src.height/rect.height,r=Math.max(1,Math.min(256,+$('surfaceRadius').value||12));
  const last=surfaceStroke?.at(-1);if(last&&Math.hypot(x-last.x,y-last.y)<Math.max(1,r/3))return;
  if(src._surfaceEdits.length>=4000){toast(t('surface_limit'));return;}
  const stamp={x,y,r,power:Math.max(0.05,Math.min(1,+$('surfacePower').value||0.6)),tool:$('surfaceBrush').value};
  // Stroke ID is numeric; never store cyclic references on the artwork.
  stamp.stroke=surfaceStroke.id;surfaceStroke.push({x,y});src._surfaceEdits.push(stamp);drawSurfaceEditor();
}
function initSurface(){
  for(const prefix of ['', 'm']){
    const anchor=$(prefix?'mEngX':'engX');
    const b=document.createElement('button');b.id=prefix?'mEngSurface':'engSurface';b.textContent='Surface';b.onclick=()=>setEngine('surface');anchor.parentElement.appendChild(b);
    const panel=document.createElement('div');panel.innerHTML=surfacePanelHTML(prefix);anchor.parentElement.parentElement.after(panel);
  }
  const editor=document.createElement('div');editor.id='surfaceEditor';editor.hidden=true;editor.className='surface-editor';editor.setAttribute('role','dialog');editor.setAttribute('aria-modal','true');editor.setAttribute('aria-label','Surface editor');
  editor.innerHTML=`<div class="surface-dialog"><div class="surface-toolbar"><b data-i18n="surface_edit">Edit current frame / layer</b><button id="surfaceClose" onclick="closeSurfaceEditor()" data-i18n="close">Close</button></div>
    <p data-i18n="surface_editor_hint">Paint on the artwork. Edits affect only this frame/layer and stay with this project tab.</p>
    <div class="surface-toolbar"><select id="surfaceBrush">${['raise','dent','flat','left','right','up','down'].map(k=>`<option value="${k}" data-i18n="surface_${k}">${k}</option>`).join('')}</select>
    <label><span data-i18n="surface_radius">Radius (px)</span><input id="surfaceRadius" type="number" min="1" max="256" value="12"></label><label><span data-i18n="strength">Strength</span><input id="surfacePower" type="range" min="0.05" max="1" step="0.05" value="0.6"></label>
    <button onclick="undoSurface()" data-i18n="surface_undo">Undo stroke</button><button onclick="clearSurface()" data-i18n="surface_clear">Clear edits</button><label><input type="checkbox" id="surfacePreview" onchange="drawSurfaceEditor()"><span data-i18n="surface_preview">Normal preview</span></label></div>
    <div class="surface-canvas-wrap"><canvas id="surfaceCanvas"></canvas></div></div>`;
  document.body.appendChild(editor);const c=$('surfaceCanvas');
  c.addEventListener('pointerdown',e=>{if(e.button!==0)return;c.setPointerCapture(e.pointerId);surfaceStroke=[];surfaceStroke.id=Date.now()+Math.random();surfaceStamp(e);});
  c.addEventListener('pointermove',e=>{if(surfaceStroke)surfaceStamp(e);});
  const finish=()=>{if(surfaceStroke){surfaceStroke=null;surfaceChanged();}};
  c.addEventListener('pointerup',finish);c.addEventListener('pointercancel',finish);c.addEventListener('lostpointercapture',finish);
  document.addEventListener('keydown',e=>{if(!editor.hidden){if(e.key==='Escape')closeSurfaceEditor();e.stopImmediatePropagation();}},true);
  refreshSurfaceUI();
}
function undoSurface(){const s=surfaceEditorSource;if(!s)return;const id=s._surfaceEdits.at(-1)?.stroke;s._surfaceEdits=s._surfaceEdits.filter(e=>e.stroke!==id);drawSurfaceEditor();surfaceChanged();}
function clearSurface(){if(!surfaceEditorSource)return;surfaceEditorSource._surfaceEdits=[];drawSurfaceEditor();surfaceChanged();}
