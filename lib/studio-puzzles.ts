// 本站独立实现的四套轻量益智规则；生成器同时给出可验证的解。
import { rng, shuffle } from './puzzles';
export type StudioKind='twins'|'courier'|'balance'|'bento';
export type Dir='up'|'right'|'down'|'left';
export const dirs:Dir[]=['up','right','down','left'];
const delta:Record<Dir,[number,number]>={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
export function nextCell(id:number,dir:Dir,size:number){const [dx,dy]=delta[dir],x=id%size+dx,y=Math.floor(id/size)+dy;return x<0||x>=size||y<0||y>=size?id:y*size+x;}
export type TwinState=[number,number];
export function moveTwins(state:TwinState,dir:Dir,walls:number[],size:number):TwinState{const to=state.map(id=>{const n=nextCell(id,dir,size);return walls.includes(n)?id:n}) as TwinState;
 if(to[0]===to[1]||(to[0]===state[1]&&to[1]===state[0]))return state;
 return to[0]===state[0]&&to[1]===state[1]?state:to;
}
export function newTwins(seed:number,level:number){const random=rng(seed),size=5,target=[4,7,10][level];for(let attempt=0;attempt<100;attempt++){
 const order=shuffle(Array.from({length:25},(_,i)=>i),random),walls=order.slice(0,5+level),start=order.slice(5+level,7+level) as TwinState;
 const queue:{state:TwinState;path:Dir[]}[]=[{state:start,path:[]}],seen=new Set([start.join(',')]);for(let i=0;i<queue.length;i++){const cur=queue[i];if(cur.path.length===target)return{size,walls,start,goal:cur.state,solution:cur.path};for(const d of dirs){const next=moveTwins(cur.state,d,walls,size),key=next.join(',');if(!seen.has(key)){seen.add(key);queue.push({state:next,path:[...cur.path,d]})}}}
 }
 throw new Error('双星关卡生成失败，请换一局');
}
export function newCourier(seed:number,level:number){const random=rng(seed),size=[4,5,6][level],length=[8,14,21][level];let route:number[]=[];
 for(let attempt=0;attempt<100;attempt++){route=[0];while(route.length<length){const options=shuffle(dirs.map(d=>nextCell(route.at(-1)!,d,size)).filter(n=>!route.includes(n)),random);if(!options.length)break;route.push(options[0]);}if(route.length===length)break;}
 if(route.length<length){route=Array.from({length:size*size},(_,i)=>{const row=Math.floor(i/size),col=i%size;return row*size+(row%2?size-1-col:col)}).slice(0,length);}
 const routeSet=new Set(route),extra=shuffle(Array.from({length:size*size},(_,i)=>i).filter(i=>!routeSet.has(i)),random).slice(0,[2,4,8][level]);extra.forEach(n=>routeSet.add(n));
 const walls=Array.from({length:size*size},(_,i)=>i).filter(i=>!routeSet.has(i));const count=level+2,stamps=Array.from({length:count},(_,i)=>route[Math.floor((i+1)*(route.length-1)/(count+1))]);
 return{size,walls,start:route[0],goal:route.at(-1)!,stamps,budget:route.length-1,solution:route};
}
export function courierStep(path:number[],id:number,p:ReturnType<typeof newCourier>){const current=path.at(-1)!;if(path.includes(id)||p.walls.includes(id)||!dirs.some(d=>nextCell(current,d,p.size)===id))return{path,error:'只能走相邻的空格，已经走过的路不能重复。'};if(path.length-1>=p.budget)return{path,error:'步数用完了，悔一步或重新规划吧。'};if(id===p.goal&&!p.stamps.every(s=>path.includes(s)))return{path,error:'信件还没收齐，先去盖好所有邮戳。'};return{path:[...path,id],error:''};}
export function newBalance(seed:number,level:number){const random=rng(seed),count=[4,6,8][level],half=count/2;const left=Array.from({length:half},()=>1+Math.floor(random()*7));const right=[...left];for(let k=0;k<8;k++){const a=Math.floor(random()*half),b=Math.floor(random()*half);if(a!==b&&right[a]>1&&right[b]<12){right[a]--;right[b]++;}}const objects=[...left.map((weight)=>({weight,side:1})),...right.map((weight)=>({weight,side:2}))];const order=shuffle(objects,random);return{weights:order.map(o=>o.weight),solution:order.map(o=>o.side)};}
export function balanceTotals(weights:number[],slots:number[]){return{left:weights.reduce((s,w,i)=>s+(slots[i]===1?w:0),0),right:weights.reduce((s,w,i)=>s+(slots[i]===2?w:0),0)};}
export function latinCandidates(board:number[],id:number,size:number){if(board[id])return[];const row=Math.floor(id/size),col=id%size;return Array.from({length:size},(_,i)=>i+1).filter(n=>!board.some((v,j)=>v===n&&(Math.floor(j/size)===row||j%size===col)));}
export function latinCount(board:number[],size:number,limit=2):number{const b=[...board];function visit():number{let at=-1,options:number[]=[];for(let i=0;i<b.length;i++){if(b[i])continue;const c=latinCandidates(b,i,size);if(!c.length)return 0;if(at<0||c.length<options.length){at=i;options=c}}if(at<0)return 1;let count=0;for(const n of options){b[at]=n;count+=visit();b[at]=0;if(count>=limit)return count}return count}return visit();}
export function latinSolved(board:number[],size:number){return board.every(n=>n>=1&&n<=size)&&Array.from({length:size},(_,r)=>new Set(board.slice(r*size,r*size+size)).size===size&&new Set(board.filter((_,i)=>i%size===r)).size===size).every(Boolean);}
export function newBento(seed:number,level:number){const random=rng(seed),size=[3,4,5][level],rows=shuffle(Array.from({length:size},(_,i)=>i),random),cols=shuffle(Array.from({length:size},(_,i)=>i),random),numbers=shuffle(Array.from({length:size},(_,i)=>i+1),random);const solution=rows.flatMap(r=>cols.map(c=>numbers[(r+c)%size])),board=[...solution],wanted=[4,8,14][level];let removed=0;for(const i of shuffle(Array.from({length:size*size},(_,i)=>i),random)){const v=board[i];board[i]=0;if(latinCount(board,size)!==1)board[i]=v;else removed++;if(removed>=wanted)break;}return{size,board,solution};}
