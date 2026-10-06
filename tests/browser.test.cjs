const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
const browser=await chromium.launch({headless:true});
try{
for(const mobile of [false,true]){
const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{localStorage.setItem('ng_onboarded','1');localStorage.setItem('ng_tut_done','1');});
await page.goto('file://'+path.resolve('index.html'));
await page.evaluate(()=>{const src=document.createElement('canvas');src.width=32;src.height=32;const ctx=src.getContext('2d');ctx.fillStyle='red';ctx.beginPath();ctx.arc(16,16,12,0,Math.PI*2);ctx.fill();App.frames=[{canvas:src}];return processAll();});
assert.equal(await page.evaluate(()=>App.engine),'surface');
assert.deepEqual(await page.evaluate(()=>['','m'].map(prefix=>{
 const ids=prefix?['mEngClassic','mEngX','mEngSurface']:['engClassic','engX','engSurface'];
 return ids.filter(id=>$(id).classList.contains('on'));
})),[['engSurface'],['mEngSurface']],'fresh start selects exactly one engine');
assert.equal(await page.locator('#classicPanel').evaluate(e=>e.style.display),'none');
assert.equal(await page.locator('#mClassicPanel').evaluate(e=>e.style.display),'none');
for(const [theme,variant] of [['godot','dark'],['modern','light'],['modern','dark'],['retro','dark'],['space','dark']]){
 await page.evaluate(([theme,variant])=>{applyTheme(theme,variant);openSurfaceEditor();},[theme,variant]);
 const styles=await page.evaluate(()=>{
  const css=el=>getComputedStyle(el), button=document.querySelector('#surfaceEditor .surface-actions .btn'),select=$('surfaceBrush'),reference=$('cols'),modal=document.querySelector('#surfaceEditor .modal');
  return {buttonColor:css(button).color,referenceColor:css(reference).color,selectColor:css(select).color,selectBackground:css(select).backgroundColor,referenceBackground:css(reference).backgroundColor,font:css(select).fontFamily,referenceFont:css(reference).fontFamily,modalBackground:css(modal).backgroundColor,modalBorder:css(modal).borderRadius,referenceModalBackground:css(document.querySelector('#fillModal .modal')).backgroundColor,referenceModalBorder:css(document.querySelector('#fillModal .modal')).borderRadius,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert.equal(styles.buttonColor,styles.referenceColor,`${theme}/${variant}: themed button text`);
 assert.equal(styles.selectColor,styles.referenceColor,`${theme}/${variant}: themed select text`);
 assert.equal(styles.selectBackground,styles.referenceBackground,`${theme}/${variant}: themed select background`);
 assert.equal(styles.font,styles.referenceFont,`${theme}/${variant}: inherited font`);
 assert.equal(styles.modalBackground,styles.referenceModalBackground,`${theme}/${variant}: modal background`);
 assert.equal(styles.modalBorder,styles.referenceModalBorder,`${theme}/${variant}: modal chrome`);
 assert.equal(styles.overflow,false,`${theme}/${variant}: no horizontal page overflow`);
 await page.screenshot({animations:'disabled',path:`.test-output/ui-${mobile?'mobile':'desktop'}-${theme}-${variant}-editor.png`});
 await page.evaluate(()=>closeSurfaceEditor());
 if(mobile)await page.evaluate(()=>openSheet('shGen')); 
 await page.screenshot({animations:'disabled',path:`.test-output/ui-${mobile?'mobile':'desktop'}-${theme}-${variant}-panel.png`});
 if(mobile)await page.evaluate(()=>closeSheet());
}
await page.evaluate(()=>applyTheme('godot'));

assert.equal(await page.locator(mobile?'#msurfacePanel':'#surfacePanel').count(),1);
await page.evaluate(()=>{surfaceSetting('mode','sculpt');openSurfaceEditor();});
const box=await page.locator('#surfaceCanvas').boundingBox();
await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height/2);await page.mouse.up();
assert(await page.evaluate(()=>surfaceEditorSource._surfaceEdits.length)>0);
await page.evaluate(()=>undoSurface());assert.equal(await page.evaluate(()=>surfaceEditorSource._surfaceEdits.length),0);
await page.evaluate(()=>{closeSurfaceEditor();surfaceSetting('volume',0.37);saveActiveProjectState();newProject();});
assert.equal(await page.evaluate(()=>App.surface.volume),0.65);
await page.evaluate(()=>switchProject(App.projects[0].id));assert.equal(await page.evaluate(()=>App.surface.volume),0.37);
await page.evaluate(()=>{App.customNormal=new ImageData(32,32);App.customNormal.data[0]=234;});
assert.equal(await page.evaluate(()=>activeNormal(0).data[0]),234);
const [download]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>exportGodotPackage())]);
assert.equal(download.suggestedFilename(),'normengine_godot_0.8.0.zip');
for(const engine of ['classic','x','surface']){
 await page.evaluate(engine=>setEngine(engine),engine);
 assert.deepEqual(await page.evaluate(()=>['','m'].map(prefix=>{
 const ids=prefix?['mEngClassic','mEngX','mEngSurface']:['engClassic','engX','engSurface'];
 return ids.filter(id=>$(id).getAttribute('aria-pressed')==='true');
 })),[[{classic:'engClassic',x:'engX',surface:'engSurface'}[engine]],[{classic:'mEngClassic',x:'mEngX',surface:'mEngSurface'}[engine]]]);
}

assert.equal(await page.locator('#classicPanel').evaluate(e=>e.style.display),'none');
assert.equal(await page.locator('#xPanel').evaluate(e=>e.style.display),'none');
await page.evaluate(()=>{curLang='ru';applyI18n();refreshSurfaceUI();});
assert.equal(await page.locator('#surface_mode option[value="sculpt"]').textContent(),'Управляемая форма');
await page.waitForTimeout(400);assert.deepEqual(errors,[]);
console.log(`${mobile?'Mobile':'Desktop'}: init, generation, editor/undo, project isolation, custom export, engine switching, Russian UI passed.`);
await page.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
