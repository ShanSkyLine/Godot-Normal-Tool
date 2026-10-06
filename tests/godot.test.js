const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const c=vm.createContext({console,Blob,TextEncoder,Uint8Array,Uint32Array,DataView,App:{lights:[]}});
vm.runInContext(fs.readFileSync('generate.js','utf8')+fs.readFileSync('godot-export.js','utf8'),c);
const crc=data=>vm.runInContext('zipCRC',c)(data);
assert.equal(crc(Buffer.from('123456789')),0xcbf43926,'standard CRC32 vector');
function png(normal=false){
 const chunk=(name,data)=>{const len=Buffer.alloc(4),type=Buffer.from(name),check=Buffer.alloc(4);len.writeUInt32BE(data.length);check.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([len,type,data,check]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(8,0);ihdr.writeUInt32BE(8,4);ihdr[8]=8;ihdr[9]=6;
 const rows=Buffer.alloc(8*(1+8*4));for(let y=0;y<8;y++)for(let x=0;x<8;x++){const i=y*33+1+x*4;rows[i]=normal?128:220;rows[i+1]=normal?128:90;rows[i+2]=normal?255:60;rows[i+3]=255;}
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
const lights=[{enabled:true,color:'#ff8844',intensity:1.25,x:0.5,y:-0.4,z:0.7},{enabled:false,color:'#ffffff',intensity:1,x:0,y:0,z:1}];
function smoke(animated){return `extends SceneTree
func _initialize() -> void:
\tvar scene := load("res://asset/demo.tscn") as PackedScene
\tassert(scene != null)
\tvar instance := scene.instantiate()
\troot.add_child(instance)
\tvar sprite = instance.get_node("Sprite")
\tvar texture: CanvasTexture
${animated?'\tassert(sprite is AnimatedSprite2D)\n\tassert(sprite.sprite_frames.get_frame_count("default") == 2)\n\tassert(sprite.sprite_frames.get_animation_speed("default") == 9)\n\ttexture = sprite.sprite_frames.get_frame_texture("default", 0)':'\tassert(sprite is Sprite2D)\n\ttexture = sprite.texture'}
\tassert(texture.diffuse_texture != null)
\tassert(texture.normal_texture != null)
\tassert(texture.get_width() == 8)
\tassert(instance._generated_lights.size() == 1)
\tassert(instance._generated_lights[0].texture != null)
\tassert(instance._generated_lights[0].height > 0)
\tinstance.setup_lights()
\tassert(instance._generated_lights.size() == 1)
\tassert(instance._generated_lights[0].get_parent() == instance)
\tprint("GODOT_EXPORT_OK")
\tquit()
`;}
(async()=>{
const build=vm.runInContext('godotPackageFiles',c),zip=vm.runInContext('zipStored',c);
for(const animated of [false,true]){
 const frames=Array.from({length:animated?2:1},()=>({source:{width:8,height:8,normal:false},normal:{width:8,height:8,normal:true}}));
 const files=await build({frames,lights,fps:9},async canvas=>png(canvas.normal));
 assert(files.some(f=>f.name==='asset/demo.tscn'));assert.equal(files.some(f=>f.name==='asset/animation.tres'),animated);assert(!files.some(f=>f.name.endsWith('.import')));
 const script=files.find(f=>f.name==='asset/lights.gd').data;assert(script.includes('light.texture = light_texture'));assert(script.includes('func _ready()'));assert(!script.includes('Color(1.000, 1.000, 1.000)'));
 const texts=files.filter(f=>typeof f.data==='string');
 for(const f of texts)for(const m of f.data.matchAll(/\[ext_resource[^\]]*path="([^"]+)"/g)){
  assert(!m[1].startsWith('res://'));const target=path.posix.join(path.posix.dirname(f.name),m[1]);assert(files.some(f=>f.name===target),`Missing resource ${target}`);
 }
 const dir=path.join('.test-output',animated?'animation':'single');fs.mkdirSync(dir,{recursive:true});
 for(const f of files){const dest=path.join(dir,f.name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,f.data);}
 fs.writeFileSync(path.join(dir,'smoke.gd'),smoke(animated));
 fs.writeFileSync(path.join(dir,'package.zip'),Buffer.from(await zip(files).arrayBuffer()));
 if(animated){const relocated=path.join('.test-output','relocated');fs.mkdirSync(relocated,{recursive:true});fs.cpSync(path.join(dir,'asset'),path.join(relocated,'nested','asset'),{recursive:true});fs.writeFileSync(path.join(relocated,'project.godot'),files.find(f=>f.name==='project.godot').data.replace('res://asset/','res://nested/asset/'));fs.writeFileSync(path.join(relocated,'smoke.gd'),smoke(true).replace('res://asset/','res://nested/asset/'));}
}
console.log('Godot export: ZIP/CRC, frame pairs, animation, light texture, relative references and standalone/relocated fixtures passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
