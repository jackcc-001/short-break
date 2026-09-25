const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../lib/climb.ts'),'utf8');
const out=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};new Function('exports','module',out)(mod.exports,mod);const p=mod.exports;
const paused={...p.newClimb(),status:'paused'};assert.equal(p.stepClimb(paused,1,.016),paused);
let s={...p.newClimb(),status:'running'};
for(let i=0;i<60*100 && s.status==='running';i++){
 const goal=p.platforms[Math.min(s.level+1,p.SUMMIT)];
 const center=goal.x+goal.width/2;
 const axis=Math.abs(center-s.x)>4?Math.sign(center-s.x):0;
 s=p.stepClimb(s,axis,1/60,false);
}
assert.equal(s.status,'won','all platforms must be reachable without hazards');
console.log(`PASS: reachable summit at ${s.time.toFixed(1)} seconds`);
let moving=p.stepClimb({...p.newClimb(),status:'running'},1,1/60,false);assert(moving.x>149);assert(moving.y>48);
const fell=p.stepClimb({...p.newClimb(),status:'running',y:100,camera:400},0,1/60,false);assert.equal(fell.status,'lost');
const time=1,bird=p.birdAt(3,time+1/60);
const hit=p.stepClimb({...p.newClimb(),status:'running',time,x:bird.x,y:bird.y-22,vy:0},0,1/60,true);assert.equal(hit.status,'lost');assert(hit.reason.includes('怪鸟'));
const rock=p.stepClimb({...p.newClimb(),status:'running',y:300,rocks:[{id:1,x:149,y:322,vy:0,warning:0}]},0,1/60,true);assert.equal(rock.status,'lost');assert(rock.reason.includes('落石'));
const warn=p.stepClimb({...p.newClimb(),status:'running',y:300,rocks:[{id:1,x:149,y:322,vy:0,warning:1}]},0,1/60,true);assert.equal(warn.status,'running');
console.log('PASS: movement, pause, falling loss, bird collision, rock collision, warning safety');
for(let difficulty=0;difficulty<3;difficulty++){
 let state={...p.newClimb(difficulty),status:'running'};
 for(let n=0;n<6000&&state.status==='running';n++){const goal=p.levelPlatforms(difficulty)[Math.min(state.level+1,p.SUMMIT)],center=goal.x+goal.width/2;state=p.stepClimb(state,Math.abs(center-state.x)>4?Math.sign(center-state.x):0,1/60,false)}
 assert.equal(state.status,'won');
 const level=p.climbConfig[difficulty].items[0],item=p.pickupAt(level,difficulty);const got=p.stepClimb({...p.newClimb(difficulty),status:'running',x:item.x,y:item.y-22,vy:0},0,1/60,false);assert(got.collected.includes(level));assert(got.shield===1||got.frozenUntil>0);
}
const protectedState=p.stepClimb({...p.newClimb(),status:'running',shield:1,y:300,rocks:[{id:1,x:149,y:322,vy:0,warning:0}]},0,1/60,true);assert.equal(protectedState.status,'running');assert.equal(protectedState.shield,0);assert(protectedState.invulnerable>0);
const frozen=p.stepClimb({...p.newClimb(),status:'running',frozenUntil:5,y:300,rocks:[{id:1,x:149,y:322,vy:0,warning:0}]},0,1/60,true);assert.equal(frozen.status,'running');
console.log('PASS: all difficulty platforms reachable, pickups, shield and freeze effect');
