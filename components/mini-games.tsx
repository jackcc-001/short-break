"use client";
import { useEffect, useRef, useState } from 'react';
import { computerMove, Disc, flips, legalMoves, newPipes, newReversi, newSlide, newTen, pipeFlow, reversiMove, rotatePipe, slideMove, slideSolved } from '@/lib/leisure';
import { recordBest, useBest } from '@/lib/local-preferences';
import './mini-games.css';
const levels=['入门','进阶','高手'];
export type MiniKind='slide'|'ten'|'pipes'|'reversi';
const meta:Record<MiniKind,{name:string;rule:string;tip:string}>={slide:{name:'九宫挪挪乐',rule:'点击空格旁的数字，把它滑进空格。按从左到右、从上到下的顺序还原 1—8，右下角留空。',tip:'棋盘通过合法移动打乱，每局都有解。不用着急，先照顾第一行。'},ten:{name:'凑个十',rule:'选中两个数字，相加等于 10 就消除。清空二十张数字卡即可通关。',tip:'1 配 9、2 配 8……5 要找另一个 5。每局成对生成，不会留下死局。'},pipes:{name:'竹径接水',rule:'点击一节水管顺时针旋转。让左上角入口流出的水，连到右下角出口。蓝绿色表示已经通水。',tip:'只需接通起点和终点，不用让每一节水管都通水。'},reversi:{name:'黑白落子',rule:'你执黑先手，电脑执白。落子夹住一条直线上的对方棋子，就把它们翻过来。双方都无合法落点后，比棋子数量。',tip:'小圆点是可以落子的地方。没有可落点会自动跳过，角落是不错的位置。'}};
export default function MiniGames({kind}:{kind:MiniKind}){
 const [level,setLevel]=useState(0);
 const [seed,setSeed]=useState(17291),[moves,setMoves]=useState(0),[notice,setNotice]=useState('');
 const [slide,setSlide]=useState(()=>newSlide(17291,0)),[ten,setTen]=useState<(number|null)[]>(()=>newTen(17291,0)),[picked,setPicked]=useState<number|null>(null);
 const [pipes,setPipes]=useState(()=>newPipes(17291,0).board),[board,setBoard]=useState<Disc[]>(newReversi),[turn,setTurn]=useState<1|2>(1);
 const [copyNotice,setCopyNotice]=useState('');const recorded=useRef(false);const best=useBest(kind+':'+levels[level]);
 const flow=pipeFlow(pipes),black=board.filter(v=>v===1).length,white=board.filter(v=>v===2).length;
 const finished=kind==='slide'?slideSolved(slide):kind==='ten'?ten.every(v=>v===null):kind==='pipes'?flow.won:!legalMoves(board,1).length&&!legalMoves(board,2).length;
 const won=kind==='reversi'?finished&&black>white:finished;
 function reset(s=Math.floor(Math.random()*999999),d=level){recorded.current=false;setLevel(d);setSeed(s);setMoves(0);setNotice('');setCopyNotice('');setSlide(newSlide(s,d));setTen(newTen(s,d));setPicked(null);setPipes(newPipes(s,d).board);setBoard(newReversi());setTurn(1);}
 useEffect(()=>{if(won&&!recorded.current){recorded.current=true;recordBest(kind+':'+levels[level],kind==='reversi'?black:moves,kind==='reversi');}},[won,kind,black,moves,level]);
 useEffect(()=>{
  if(kind!=='reversi'||finished)return;
  const available=legalMoves(board,turn);
  if(!available.length){setNotice(`${turn===1?'你':'电脑'}暂无落点，自动跳过。`);setTurn(turn===1?2:1);return;}
  if(turn===2){const t=setTimeout(()=>{const id=computerMove(board,level);if(id!==null){setBoard(reversiMove(board,id,2));setTurn(1);setNotice('电脑已落子，轮到你执黑。')}},600);return()=>clearTimeout(t);}
 },[kind,board,turn,finished,level]);
 function selectNumber(id:number){if(finished||ten[id]===null)return;if(picked===null){setPicked(id);return}if(picked===id){setPicked(null);return}setMoves(v=>v+1);if(ten[picked]!+ten[id]===10){setTen(v=>v.map((n,i)=>i===picked||i===id?null:n));setNotice('正好是十，消除一对！')}else setNotice(`这两张合起来是 ${ten[picked]!+ten[id]!}，再找找。`);setPicked(null);}
 const text=finished?(kind==='reversi'?`终局：黑 ${black} : 白 ${white}，${black===white?'平局':black>white?'你赢了':'电脑获胜'}。`:`挑战成功！用了 ${moves}${kind==='ten'?'次配对':'步'}。`):notice;
 async function share(){const content=`【歇一会儿 · ${meta[kind].name}】\n${text||'来一起挑战吧'}\n${location.origin}/?play=${kind}`;try{await navigator.clipboard.writeText(content);setCopyNotice('结果与游戏链接已复制')}catch{setCopyNotice(content)}}
 return <section className="mini-layout" aria-label={meta[kind].name}><div className="mini-panel"><header><div><small>轻轻松松，玩一小局</small><h2>{meta[kind].name}</h2></div><span className="mini-count">{kind==='reversi'?`黑 ${black} · 白 ${white}`:`${moves} ${kind==='ten'?'次配对':'步'}`}</span></header><div className="difficulty-bar">{levels.map((d,i)=><button key={d} className={i===level?"active":""} aria-pressed={i===level} onClick={()=>{if(i!==level)reset(undefined,i)}}>{d}</button>)}<small>切换难度会开始新局</small></div><p className="mini-intro">{meta[kind].rule.replace('二十',String([12,20,30][level]))}</p>
 {kind==='slide'&&<div className="slide-grid">{slide.map((n,i)=><button key={i} className={n===0?'blank':''} aria-label={n?`移动数字 ${n}`:'空格'} disabled={n===0||finished} onClick={()=>{const next=slideMove(slide,i);if(next!==slide){setSlide(next);setMoves(v=>v+1)}else setNotice('只能移动空格旁的数字。')}}>{n||''}</button>)}</div>}
 {kind==='ten'&&<div className="ten-grid">{ten.map((n,i)=><button key={i} className={`${n===null?'gone':''} ${picked===i?'picked':''}`} disabled={n===null||finished} aria-label={n===null?'已消除':`第 ${i+1} 张数字 ${n}`} onClick={()=>selectNumber(i)}>{n??'✓'}</button>)}</div>}
 {kind==='pipes'&&<><div className="pipe-labels"><span>↘ 入口</span><span>出口 ↗</span></div><div className="pipe-grid">{pipes.map((mask,i)=><button aria-label={`旋转第 ${i+1} 节水管`} key={i} disabled={finished} className={flow.wet.includes(i)?'wet':''} onClick={()=>{setPipes(b=>b.map((n,j)=>j===i?rotatePipe(n):n));setMoves(n=>n+1)}}><svg viewBox="0 0 100 100" aria-hidden="true">{[[1,50,0],[2,100,50],[4,50,100],[8,0,50]].filter(([bit])=>mask&bit).map(([bit,x,y])=><line key={bit} x1="50" y1="50" x2={x} y2={y}/>)}<circle cx="50" cy="50" r="11"/></svg></button>)}</div></>}
 {kind==='reversi'&&<><p className="turn-note">{finished?'对局结束':turn===1?'你执黑 · 点提示圆点落子':'电脑执白 · 正在想一想…'}</p><div className="reversi-grid">{board.map((v,i)=><button key={i} disabled={finished||turn!==1||!!v||!flips(board,i,1).length} aria-label={`第 ${Math.floor(i/6)+1} 行第 ${i%6+1} 列${v===1?'黑棋':v===2?'白棋':flips(board,i,1).length?'可落子':'空格'}`} onClick={()=>{setBoard(reversiMove(board,i,1));setMoves(n=>n+1);setTurn(2)}}>{v?<i className={v===1?'black':'white'}/>:turn===1&&flips(board,i,1).length>0?<span>●</span>:null}</button>)}</div></>}

 <div className={`mini-feedback ${won?'win':''}`} role="status">{text||'不计时，按自己的节奏来。'}</div><div className="mini-actions"><button onClick={()=>reset()}>重新开一局</button>{['slide','pipes','ten'].includes(kind)&&<button onClick={()=>reset(seed)}>重玩这局</button>}<button disabled={!finished} onClick={share}>分享结果</button></div>{copyNotice&&<p className="mini-copy" role="status">{copyNotice}</p>}</div><aside className="mini-aside"><h3>{levels[level]}规则</h3><p>{kind==='slide'?`通过 ${[12,40,90][level]} 次合法移动打乱，保证有解。`:kind==='ten'?`${[12,20,30][level]} 张数字卡，需要消除 ${[6,10,15][level]} 对。`:kind==='pipes'?['一半水管打乱，保留更多正确朝向。','更多弯头被打乱，需规划路线。','所有管道都被旋转打乱。'][level]:['电脑按固定顺序落子，适合熟悉规则。','电脑优先角落并考虑翻子数量。','电脑向前搜索三步，考虑角落和可落点。'][level]}</p><h3>小提示</h3><p>{meta[kind].tip}</p><h3>我的最佳</h3><b>{best===null?'还没有记录':kind==='reversi'?`${best} 枚黑棋`:`${best}${kind==='ten'?'次配对':'步'}`}</b><p>只保存当前浏览器，不登录、不上传。</p><small>切换游戏会结束当前这一局。</small></aside></section>
}
