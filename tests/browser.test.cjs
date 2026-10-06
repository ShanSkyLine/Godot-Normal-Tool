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
await page.evaluate(()=>{setEngine('classic');setEngine('x');setEngine('surface');});
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
