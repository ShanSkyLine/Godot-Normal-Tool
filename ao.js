// ════════════════════════════════════════════════════════════
// ao.js — Ambient Occlusion map generation
// Algorithm: for each alpha pixel, samples surrounding pixels
// and darkens based on how much "mass" is nearby (SSAO-style).
// ════════════════════════════════════════════════════════════

let aoFrame=null;       // ImageData of AO map
let aoEnabled=false;

function genAO(src){
  const radius=+$('sAORadius').value||4;
  const strength=+$('sAOStr').value||0.8;
  const w=src.width,h=src.height;
  const pix=src.getContext('2d').getImageData(0,0,w,h);
  const out=new Uint8ClampedArray(w*h*4);
  const samples=12;
  const angles=Array.from({length:samples},(_, i)=>i*(Math.PI*2/samples));

  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const idx=(y*w+x)*4;
    const a=pix.data[idx+3];
    if(a===0){out[idx]=out[idx+1]=out[idx+2]=255;out[idx+3]=0;continue;}

    let occlusion=0;
    for(let s=0;s<samples;s++){
      const ang=angles[s];
      let blocked=false;
      for(let r=1;r<=radius&&!blocked;r++){
        const nx=Math.round(x+Math.cos(ang)*r), ny=Math.round(y+Math.sin(ang)*r);
        if(nx<0||nx>=w||ny<0||ny>=h){// edge → open
          break;
        }
        const na=(pix.data[(ny*w+nx)*4+3]);
        if(na>20)blocked=true;
      }
      if(!blocked)occlusion+=1; // open ray = less occlusion
    }
    // normalize: 1.0 = fully open, 0.0 = fully surrounded
    const ao=Math.pow(occlusion/samples,1.5); // 0..1
    const bright=Math.max(0,Math.min(255,Math.round((1-(1-ao)*strength)*255)));
    out[idx]=out[idx+1]=out[idx+2]=bright;
    out[idx+3]=a;
  }
  return new ImageData(out,w,h);
}

async function generateAO(){
  if(!App.frames.length){toast(t('load_sprite_first'));return;}
  setStatus('proc','AO…');showProg(true);
  await new Promise(r=>setTimeout(r,0));
  aoFrame=genAO(App.frames[App.curFrame].canvas);
  setProg(100);showProg(false);
  setStatus('rdy','AO ready');
  // draw in AO canvas
  const cv=$('cvAO');
  cv.width=aoFrame.width;cv.height=aoFrame.height;
  cv.getContext('2d').putImageData(aoFrame,0,0);
  $('aoExportBtn').style.display='flex';
  aoEnabled=true;
  $('boxAO').style.display='flex';
  applyZoomToCanvas('cvAO',aoFrame.width,aoFrame.height);
  toast(t('ao_ready'));
}

function exportAO(){
  if(!aoFrame)return;
  const c=document.createElement('canvas');c.width=aoFrame.width;c.height=aoFrame.height;
  c.getContext('2d').putImageData(aoFrame,0,0);
  dl(c,'ao_map.png');toast(t('ao_saved'));
}

