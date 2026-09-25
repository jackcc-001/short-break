const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../lib/puzzles.ts'),'utf8');
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};new Function('exports','module',output)(mod.exports,mod);const p=mod.exports;
for(let id=0;id<81;id++) for(const n of p.neighbors(id)) assert(p.neighbors(n).includes(id),'hex neighbors must be symmetric');
assert.equal(p.escapePath(40,p.neighbors(40)),null);
assert.equal(p.escapePath(40,[]).length,5);
const ring=p.neighbors(40);
const state={actor:40,walls:ring.slice(1),moves:0,status:'playing'};
assert.equal(p.trapTurn(state,ring[0]).status,'win');
assert.equal(p.trapTurn(state,40),state);
const escape={actor:1,walls:[],moves:0,status:'playing'};
assert.equal(p.trapTurn(escape,40).status,'lose');
for(const d of p.difficulties)for(let seed=0;seed<200;seed++){
 const t=p.newTrap(seed,d);assert(t.walls.length===[20,13,7][p.difficulties.indexOf(d)]);assert(p.escapePath(40,t.walls));assert.equal(new Set(t.walls).size,t.walls.length);
 const l=p.newLights(seed,d);assert(!l.board.every(Boolean));let b=l.board;for(const move of l.solution)b=p.flipLights(b,move,l.size);assert(b.every(Boolean),'generated puzzle must solve');
 const twice=p.flipLights(p.flipLights(l.board,0,l.size),0,l.size);assert.deepEqual(twice,l.board);
 const deck=p.newMemory(seed,d);for(const item of new Set(deck))assert.equal(deck.filter(x=>x===item).length,2);
 assert.deepEqual(p.newMemory(seed,d),deck);
}
console.log('PASS: hex symmetry, shortest path, trap win/loss, invalid move, 600 solvable light boards, 600 memory decks, deterministic seeds');
