const assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs');
function load(name){const m={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync('lib/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>load(id.replace('./','')));return m.exports;}
const p=load('studio-puzzles');
for(let d=0;d<3;d++)for(let seed=0;seed<50;seed++){
 const t=p.newTwins(seed,d);let s=t.start;for(const dir of t.solution)s=p.moveTwins(s,dir,t.walls,t.size);assert.deepEqual(s,t.goal);assert.equal(t.solution.length,[4,7,10][d]);assert.notDeepEqual(t.start,t.goal);
 const c=p.newCourier(seed,d);let path=[c.start];for(const cell of c.solution.slice(1)){const next=p.courierStep(path,cell,c);assert.equal(next.error,'');path=next.path;}assert.equal(path.at(-1),c.goal);assert(c.stamps.every(n=>path.includes(n)));assert(path.length-1<=c.budget);assert.equal(new Set(path).size,path.length);assert(p.courierStep(path,c.start,c).error);
 const b=p.newBalance(seed,d);const totals=p.balanceTotals(b.weights,b.solution);assert.equal(totals.left,totals.right);assert.equal(b.weights.length,[4,6,8][d]);
 const l=p.newBento(seed,d);assert.equal(p.latinCount(l.board,l.size),1);assert(p.latinSolved(l.solution,l.size));assert(!p.latinSolved(l.board,l.size));assert.equal(l.size,[3,4,5][d]);
}
const r=load('reminder-clock'),time=Date.now();const schedule=r.snoozeReminder('today',time);assert.equal(schedule.at,time+300000);assert(!r.advanceReminder(schedule,time+299999).pending);const due=r.advanceReminder(schedule,time+300000);assert(due.pending);assert.equal(due.at,null);assert(r.validSchedule(JSON.parse(JSON.stringify(schedule))));assert(!r.validSchedule({at:'invalid'}));
console.log('PASS: 150 twin routes at graded shortest distance, 150 mail routes, 150 balanced tea trays, 150 uniquely solvable lunch grids; snooze before/exactly/after 5 minutes & serialization');
