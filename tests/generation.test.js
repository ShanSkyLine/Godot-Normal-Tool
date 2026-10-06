const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{style:{},classList:{},value:4});return elements.get(id);};
const c=vm.createContext({console,setTimeout,clearTimeout,document:{getElementById:element},ImageData:class{}});
vm.runInContext(fs.readFileSync('surface.js','utf8')+fs.readFileSync('core.js','utf8')+fs.readFileSync('generate.js','utf8'),c);
vm.runInContext(`t=x=>x;genNormal=src=>({id:src.id});updateDisplay=()=>{};buildStrip=()=>{};pluralFrames=()=>'';saveRecentNormal=()=>{};App.frames=[{canvas:{id:'old',width:2,height:2}},{canvas:{id:'old2',width:2,height:2}}];`,c);
(async()=>{
const a=vm.runInContext('processAll()',c);
vm.runInContext(`App.frames=[{canvas:{id:'new',width:2,height:2}}];`,c);
const b=vm.runInContext('processAll()',c);await Promise.all([a,b]);
assert.equal(vm.runInContext('App.normalFrames.length',c),1);assert.equal(vm.runInContext('App.normalFrames[0].id',c),'new');
vm.runInContext(`App.frames.push({canvas:{id:'second',width:2,height:2}});App.curFrame=1;`,c);await vm.runInContext('processAll()',c);
assert.equal(vm.runInContext('App.curFrame',c),1);
vm.runInContext(`App.customNormal={width:2,height:2,id:'custom'};`,c);
assert.equal(vm.runInContext('activeNormal(1).id',c),'custom');assert.equal(vm.runInContext('activeNormal(0).id',c),'new');
vm.runInContext('App.customNormal.width=3',c);assert.equal(vm.runInContext('activeNormal(1).id',c),'second');
console.log('Generation: stale run cancellation, atomic frames, frame selection and active export map passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
