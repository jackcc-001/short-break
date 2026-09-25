// 纯规则函数：游戏生成、判定与电脑落子，不依赖界面。
import { rng, shuffle } from './puzzles';
export function slideMove(board:number[],index:number){const z=board.indexOf(0);if(index<0||index>=9||Math.abs(Math.floor(z/3)-Math.floor(index/3))+Math.abs(z%3-index%3)!==1)return board;const b=[...board];[b[z],b[index]]=[b[index],b[z]];return b;}
export const slideSolved=(b:number[])=>b.every((n,i)=>n===(i+1)%9);
export function newSlide(seed:number, difficulty=1){const random=rng(seed);let b=[1,2,3,4,5,6,7,8,0],previous=-1;for(let n=0;n<[12,40,90][difficulty];n++){const z=b.indexOf(0);const available=b.map((_,i)=>i).filter(i=>i!==previous&&slideMove(b,i)!==b);const i=available[Math.floor(random()*available.length)];previous=z;b=slideMove(b,i);}return slideSolved(b)?slideMove(b,7):b;}
export function newTen(seed:number, difficulty=1){const random=rng(seed),nums:number[]=[];for(let i=0;i<[6,10,15][difficulty];i++){const a=1+Math.floor(random()*9);nums.push(a,10-a);}return shuffle(nums,random);}
// 水管位掩码：上1、右2、下4、左8。
export function rotatePipe(mask:number){return ((mask<<1)&15)|(mask>>3);}
export const waterRoute=[0,1,5,4,8,9,10,6,7,11,15];
export function newPipes(seed:number, difficulty=1){const random=rng(seed);const solution=Array.from({length:16},()=>[3,5,6,9,10,12][Math.floor(random()*6)]);for(let i=0;i<waterRoute.length;i++){const id=waterRoute[i];let m=0;for(const other of [waterRoute[i-1],waterRoute[i+1]]){if(other===undefined)continue;m|=other===id-4?1:other===id+1?2:other===id+4?4:8;}if(i===0)m|=8;if(i===waterRoute.length-1)m|=2;solution[id]=m;}
 const board=solution.map((m,i)=>{const active=difficulty===2||i%2===0||difficulty===1&&i%3===0;for(let k=active?1+Math.floor(random()*3):0;k>0;k--)m=rotatePipe(m);return m;});if(pipeFlow(board).won)board[0]=rotatePipe(board[0]);return{board,solution};}
export function pipeFlow(board:number[]){if(!(board[0]&8))return{wet:[] as number[],won:false};const wet=[0],seen=new Set(wet),dirs=[[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]];for(let i=0;i<wet.length;i++){const id=wet[i];for(const [dx,dy,bit,back]of dirs){const x=id%4+dx,y=Math.floor(id/4)+dy;if(x<0||x>3||y<0||y>3)continue;const n=y*4+x;if((board[id]&bit)&&(board[n]&back)&&!seen.has(n)){seen.add(n);wet.push(n);}}}return{wet,won:seen.has(15)&&!!(board[15]&2)};}
export type Disc=0|1|2;
export function newReversi():Disc[]{const b:Disc[]=Array(36).fill(0);b[14]=2;b[15]=1;b[20]=1;b[21]=2;return b;}
export function flips(board:Disc[],id:number,who:Disc){if(who===0||board[id]!==0)return[];const result:number[]=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;let x=id%6+dx,y=Math.floor(id/6)+dy;const line:number[]=[];while(x>=0&&x<6&&y>=0&&y<6&&board[y*6+x]===3-who){line.push(y*6+x);x+=dx;y+=dy;}if(line.length&&x>=0&&x<6&&y>=0&&y<6&&board[y*6+x]===who)result.push(...line);}return result;}
export const legalMoves=(b:Disc[],who:Disc)=>b.map((_,i)=>i).filter(i=>flips(b,i,who).length>0);
export function reversiMove(b:Disc[],id:number,who:Disc){const f=flips(b,id,who);if(!f.length)return b;const n=[...b];n[id]=who;f.forEach(i=>n[i]=who);return n;}
function evaluateBoard(b:Disc[]){let score=0;b.forEach((v,i)=>{if(v)score+=(v===2?1:-1)*([0,5,30,35].includes(i)?45:1)});return score+3*(legalMoves(b,2).length-legalMoves(b,1).length);}
function searchBoard(b:Disc[],who:1|2,depth:number):number{const moves=legalMoves(b,who);if(!depth||!moves.length&&!legalMoves(b,(3-who) as Disc).length)return evaluateBoard(b);if(!moves.length)return searchBoard(b,(3-who) as 1|2,depth-1);const values=moves.map(id=>searchBoard(reversiMove(b,id,who),(3-who) as 1|2,depth-1));return who===2?Math.max(...values):Math.min(...values);}
export function computerMove(b:Disc[],difficulty=1){const m=legalMoves(b,2);if(difficulty===0)return m[0]??null;return m.sort((a,c)=>{const score=(id:number)=>difficulty===2?searchBoard(reversiMove(b,id,2),1,2):flips(b,id,2).length+([0,5,30,35].includes(id)?50:0);return score(c)-score(a)||a-c})[0]??null;}
