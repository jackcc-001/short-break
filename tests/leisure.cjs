const assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs');
function load(name){const m={exports:{}};const source=fs.readFileSync(require('node:path').join(__dirname,'../lib/'+name+'.ts'),'utf8');const out=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;new Function('exports','module','require',out)(m.exports,m,id=>load(id.replace('./','')));return m.exports;}
const p=load('leisure');
for(let seed=0;seed<300;seed++){
 const b=p.newSlide(seed);assert.equal(b.length,9);assert.equal(new Set(b).size,9);assert(!p.slideSolved(b));let inversions=0;for(let i=0;i<9;i++)for(let j=i+1;j<9;j++)if(b[i]&&b[j]&&b[i]>b[j])inversions++;assert.equal(inversions%2,0,'slide must be solvable');
 const ten=p.newTen(seed);for(let i=1;i<=9;i++)if(i===5)assert.equal(ten.filter(n=>n===5).length%2,0);else assert.equal(ten.filter(n=>n===i).length,ten.filter(n=>n===10-i).length);
 const pipes=p.newPipes(seed);assert(p.pipeFlow(pipes.solution).won);assert(!p.pipeFlow(pipes.board).won);for(let i=0;i<16;i++){let x=pipes.board[i],reachable=false;for(let n=0;n<4;n++){if(x===pipes.solution[i])reachable=true;x=p.rotatePipe(x)}assert(reachable);assert.equal(x,pipes.board[i]);}
}
let b=p.newReversi();assert.equal(p.legalMoves(b,1).length,4);assert.equal(p.legalMoves(b,2).length,4);assert.equal(p.reversiMove(b,0,1),b);const first=p.legalMoves(b,1)[0];b=p.reversiMove(b,first,1);assert.equal(b.filter(n=>n===1).length,4);
for(let game=0;game<60;game++){let board=p.newReversi(),who=1,turns=0;while(p.legalMoves(board,1).length||p.legalMoves(board,2).length){const moves=p.legalMoves(board,who);if(moves.length){const id=who===2?p.computerMove(board):moves[(game+turns)%moves.length];assert(moves.includes(id));board=p.reversiMove(board,id,who);}who=3-who;assert(++turns<75);}assert(board.every(n=>[0,1,2].includes(n)));}
console.log('PASS: 300 solvable slides; 300 paired ten decks; 300 rotatable connected pipes; 60 complete reversi games and legal AI moves');
for(let d=0;d<3;d++)for(let seed=0;seed<60;seed++){const slide=p.newSlide(seed,d);assert(!p.slideSolved(slide));const deck=p.newTen(seed,d);assert.equal(deck.length,[12,20,30][d]);const pipes=p.newPipes(seed,d);assert(!p.pipeFlow(pipes.board).won);assert(p.pipeFlow(pipes.solution).won);const b=p.newReversi(),move=p.computerMove(b,d);assert(p.legalMoves(b,2).includes(move));}
console.log('PASS: actual difficulty generators and legal AI strategies');
