"use client";
import { useEffect, useRef, useState } from 'react';
import { birdAt, birdLevels, climbConfig, climbLevels, levelPlatforms, batAt, pickupAt, CLIMB_HEIGHT as H, CLIMB_WIDTH as W, ClimbState, newClimb, platforms, stepClimb, SUMMIT } from '@/lib/climb';
import './climb-game.css';
import { readLocal, recordBest } from '@/lib/local-preferences';

function draw(ctx: CanvasRenderingContext2D, s: ClimbState) {
 const y=(height:number)=>H-(height-s.camera);
 const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,'#cce4d9');gradient.addColorStop(1,'#f2f4db');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 // 山峦与云层采用视差，不影响真实碰撞。
 for(let i=0;i<4;i++){ctx.fillStyle=['#bed4c7','#a9c6b5','#90b8a1','#7da88d'][i];ctx.beginPath();ctx.moveTo(-30,H);for(let x=-30;x<W+50;x+=30)ctx.lineTo(x,300+i*42+Math.sin(x/92+i*2)*62+(s.camera*.07)%55);ctx.lineTo(W+40,H);ctx.fill();}
 ctx.fillStyle='#fff9';for(let i=0;i<5;i++){const cy=((i*140+s.camera*.18)%650)-40;ctx.beginPath();ctx.ellipse((i*173+40)%470,cy,65,12,0,0,Math.PI*2);ctx.fill();}
 // 两侧树干与枝叶。
 for(const x of [4,460]){ctx.fillStyle='#416c55';ctx.fillRect(x,0,16,H);ctx.fillStyle='#345842';ctx.fillRect(x+4,0,4,H);for(let i=-1;i<8;i++){const ty=i*92+(s.camera*.5)%92;ctx.fillStyle='#638f70';ctx.beginPath();ctx.ellipse(x+8,ty,38,18,x===4?-.4:.4,0,Math.PI*2);ctx.fill();}}
 for(const p of levelPlatforms(s.difficulty)){const py=y(p.y);if(py< -25||py>H+25)continue;ctx.fillStyle=p.level===SUMMIT?'#c99148':'#795d3d';ctx.fillRect(p.x,py,p.width,12);ctx.fillStyle=p.level===SUMMIT?'#efd48b':'#719451';ctx.fillRect(p.x-3,py-3,p.width+6,6);ctx.fillStyle='#244d37';ctx.font='11px sans-serif';ctx.fillText(p.level===0?'起点':p.level===SUMMIT?'山巅':`第 ${p.level} 层`,p.x+6,py+27);
 if(p.level===SUMMIT){ctx.strokeStyle='#765c35';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x+90,py);ctx.lineTo(p.x+90,py-63);ctx.stroke();ctx.fillStyle='#b75537';ctx.beginPath();ctx.moveTo(p.x+90,py-63);ctx.lineTo(p.x+131,py-48);ctx.lineTo(p.x+90,py-33);ctx.fill();ctx.fillStyle='#fff3d5';ctx.font='15px serif';ctx.fillText('顶',p.x+98,py-43);}}
 for(const level of climbConfig[s.difficulty].birds){const b=birdAt(level,s.time*climbConfig[s.difficulty].speed),by=y(b.y);if(by< -40||by>H+40)continue;ctx.save();ctx.translate(b.x,by);ctx.scale(b.direction,1);ctx.fillStyle='#734e49';ctx.beginPath();ctx.ellipse(0,0,16,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#604649';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-12,-15-Math.sin(s.time*15)*8,-26,-10);ctx.moveTo(2,0);ctx.quadraticCurveTo(5,-18-Math.sin(s.time*15)*8,18,-9);ctx.stroke();ctx.fillStyle='#d99245';ctx.beginPath();ctx.moveTo(15,-2);ctx.lineTo(25,3);ctx.lineTo(14,5);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(9,-4,3,3);ctx.restore();}
 for(const r of s.rocks){if(r.warning>0){ctx.strokeStyle='#d37b44aa';ctx.setLineDash([5,8]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x,35);ctx.lineTo(r.x,H);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#a74627';ctx.font='bold 15px sans-serif';ctx.fillText('！落石',Math.max(25,Math.min(W-90,r.x-30)),30);}else{ctx.save();ctx.translate(r.x,y(r.y));ctx.rotate(s.time*2);ctx.fillStyle='#7b7465';ctx.beginPath();ctx.moveTo(-13,-8);ctx.lineTo(4,-15);ctx.lineTo(14,0);ctx.lineTo(8,13);ctx.lineTo(-11,9);ctx.closePath();ctx.fill();ctx.strokeStyle='#aea58b';ctx.stroke();ctx.restore();}}
 for(const level of climbConfig[s.difficulty].bats){const b=batAt(level,s.time),by=y(b.y);if(by< -40||by>H+40)continue;ctx.fillStyle='#705978';ctx.beginPath();ctx.moveTo(b.x-25,by-9);ctx.lineTo(b.x-9,by+12);ctx.lineTo(b.x,by+4);ctx.lineTo(b.x+9,by+12);ctx.lineTo(b.x+25,by-9);ctx.lineTo(b.x+5,by-3);ctx.lineTo(b.x,by-10);ctx.lineTo(b.x-5,by-3);ctx.fill();}
 for(const level of climbConfig[s.difficulty].items){if(s.collected.includes(level))continue;const item=pickupAt(level,s.difficulty),py=y(item.y);ctx.fillStyle=item.kind==='shield'?'#e1b359':'#82c9d4';ctx.beginPath();ctx.arc(item.x,py,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.fillText(item.kind==='shield'?'盾':'停',item.x-7,py+5);}
 if(s.shield||s.time<s.invulnerable){ctx.strokeStyle='#f9d586';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x,y(s.y)-25,25,36,0,0,Math.PI*2);ctx.stroke();}
 if(s.time<s.frozenUntil){ctx.fillStyle='#dcf4ef';ctx.font='14px sans-serif';ctx.fillText('定风珠生效 · 暂时免疫危险',24,24);}
 // 人物脚底坐标对应逻辑层的 y；脸、披风与肢体随起落变化。
 ctx.save();ctx.translate(s.x,y(s.y));ctx.scale(s.facing,1);ctx.fillStyle='#b35b3e';ctx.beginPath();ctx.moveTo(-6,-29);ctx.lineTo(-24,-17+(Math.sin(s.time*10)*4));ctx.lineTo(-6,-20);ctx.fill();ctx.strokeStyle='#274c3a';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-5,-13);ctx.lineTo(-9,-2);ctx.moveTo(5,-13);ctx.lineTo(9,-2);ctx.stroke();ctx.fillStyle='#397259';ctx.fillRect(-10,-28,20,17);ctx.strokeStyle='#efc595';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,-24);ctx.lineTo(-16,s.vy>0?-34:-16);ctx.moveTo(9,-24);ctx.lineTo(16,s.vy>0?-33:-17);ctx.stroke();ctx.fillStyle='#f5cc9b';ctx.beginPath();ctx.arc(0,-37,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#263e34';ctx.beginPath();ctx.arc(0,-40,12,Math.PI,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-2,-51,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#af5436';ctx.fillRect(-11,-42,22,4);ctx.fillStyle='#2c3e34';ctx.fillRect(4,-37,2,2);ctx.restore();
}
export default function ClimbGame(){
 const canvas=useRef<HTMLCanvasElement>(null),field=useRef<HTMLDivElement>(null),world=useRef(newClimb(0)),keys=useRef(new Set<string>()),touch=useRef(0),last=useRef(0);
 const [ui,setUi]=useState<ClimbState>(()=>newClimb(0)),[best,setBest]=useState(0),[copied,setCopied]=useState('');
 const update=(s:ClimbState)=>{world.current=s;setUi({...s});};
 const clear=()=>{keys.current.clear();touch.current=0;};
 const pause=()=>{clear();if(world.current.status==='running')update({...world.current,status:'paused'});};
 const start=()=>{clear();last.current=0;update({...newClimb(world.current.difficulty),status:'running'});field.current?.focus({preventScroll:true});};
 const resume=()=>{clear();last.current=0;update({...world.current,status:'running'});field.current?.focus({preventScroll:true});};
 useEffect(()=>{
  const saved=readLocal<number>('best:climb:入门',0);setBest(typeof saved==='number'?saved:0);let frame=0,tick=0;const loop=(time:number)=>{const dt=last.current?Math.min((time-last.current)/1000,1/30):0;last.current=time;
   const axis=touch.current||((keys.current.has('arrowright')||keys.current.has('d')?1:0)-(keys.current.has('arrowleft')||keys.current.has('a')?1:0));
   const previous=world.current;world.current=stepClimb(previous,axis,dt);if(world.current.level>previous.level)recordBest("climb:"+climbLevels[world.current.difficulty],world.current.level,true);
   const ctx=canvas.current?.getContext('2d');if(ctx)draw(ctx,world.current);
   if(++tick%6===0||world.current.status!==previous.status){setUi({...world.current});setBest(b=>Math.max(b,world.current.level));}
   frame=requestAnimationFrame(loop);
  };frame=requestAnimationFrame(loop);
  const hidden=()=>{if(document.hidden)pause();};const blur=()=>pause();document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',blur);
  const press=(e:KeyboardEvent)=>{
   const el=e.target instanceof HTMLElement ? e.target : null;
   if(el?.closest('input,textarea,select,[contenteditable="true"]'))return;
   const k=e.key.toLowerCase();
   if(!['arrowleft','arrowright','arrowup','arrowdown','a','d',' ','escape'].includes(k))return;
   const focused=!!field.current?.closest('.climb-layout')?.contains(document.activeElement);
   if(!focused && world.current.status!=='running')return;
   e.preventDefault();
   if(['arrowleft','arrowright','a','d'].includes(k)){if(world.current.status==='running')keys.current.add(k);return;}
   if(e.repeat)return;
   if(k==='arrowup') {if(world.current.status==='ready'||world.current.status==='lost'||world.current.status==='won')start();else if(world.current.status==='paused')resume();}
   else if(k==='arrowdown'||k==='escape')pause();
   else if(k===' '){if(world.current.status==='running')pause();else if(world.current.status==='paused')resume();}
  };
  const release=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());window.addEventListener('keydown',press);window.addEventListener('keyup',release);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',blur);window.removeEventListener('keydown',press);window.removeEventListener('keyup',release);clear();};
 },[]);
 const copy=async()=>{const text=`【歇一会儿 · 轻功登顶】${ui.status==='won'?'成功登顶！':`抵达第 ${ui.level} 层`}\n用时 ${Math.floor(ui.time)} 秒 · 目标 ${SUMMIT} 层\n${location.origin}/?play=climb`;try{await navigator.clipboard.writeText(text);setCopied('成绩已复制，可发给朋友')}catch{setCopied(text)}};
 return <section className="climb-layout" id="climb"><div className="climb-panel"><div className="climb-heading"><div><span className="arc-label">山林轻功挑战</span><h2>轻功登顶</h2></div><span className="climb-badge">左右移动 · 自动跳跃</span></div>
 <div className="difficulty-bar">{climbLevels.map((d,i)=><button key={d} className={ui.difficulty===i?'active':''} aria-pressed={ui.difficulty===i} onClick={()=>{clear();update(newClimb(i));setBest(readLocal<number>('best:climb:'+d,0));setCopied('')}}>{d}</button>)}<small>切换难度会重置本局</small></div><div className="climb-stats"><span>当前高度<b>{ui.level} / {SUMMIT} 层</b></span><span>本局用时<b>{Math.floor(ui.time)} 秒</b></span><span>历史最高<b>{best} 层</b></span></div><div className="climb-progress" aria-label={`登顶进度 ${ui.level}/${SUMMIT}`}><i style={{width:`${ui.level/SUMMIT*100}%`}}/></div>
 <div className="climb-stage" data-player-x={Math.round(ui.x)} data-player-y={Math.round(ui.y)} ref={field} tabIndex={0} role="region" aria-label="轻功登顶游戏区域，左右方向键移动，上键开始或继续，下键暂停">
 <canvas ref={canvas} width={W} height={H} aria-label="山林平台、轻功侠、巡山怪鸟和落石"/>
 {ui.status!=='running'&&<div className="climb-overlay"><div className="climb-overlay-card"><span>{ui.status==='won'?'登顶留名':ui.status==='lost'?'胜败乃江湖常事':ui.status==='paused'?'歇一会儿':'轻功初试'}</span><h3>{ui.status==='won'?'山巅，到了！':ui.status==='lost'?'差一点，再来！':ui.status==='paused'?'已暂停':'踏树梢，越云海'}</h3><p>{ui.status==='ready'?'人物会自动跳跃。左右移动，落在上方平台；越过怪鸟和落石，抵达第十八层。':ui.status==='paused'?'人物与危险都已停止。离开页面也会自动暂停。':ui.reason}</p><button className="arc-primary" onClick={ui.status==='paused'?resume:start}>{ui.status==='paused'?'继续闯关':ui.status==='ready'?'开始登山':'再闯一次'}</button></div></div>}
 </div><div className="climb-touch"><button aria-label="向左移动" onPointerDown={e=>{e.preventDefault();touch.current=-1; if(e.currentTarget.hasPointerCapture(e.pointerId)===false){try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}}}} onPointerUp={()=>touch.current=0} onPointerCancel={()=>touch.current=0} onLostPointerCapture={()=>touch.current=0}>← 按住向左</button><button aria-label="向右移动" onPointerDown={e=>{e.preventDefault();touch.current=1; if(e.currentTarget.hasPointerCapture(e.pointerId)===false){try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}}}} onPointerUp={()=>touch.current=0} onPointerCancel={()=>touch.current=0} onLostPointerCapture={()=>touch.current=0}>按住向右 →</button></div>
 <p className="climb-access">{climbLevels[ui.difficulty]} · {ui.shield?'护盾已装备，可抵挡一次碰撞':'暂无护盾'} · {ui.time<ui.frozenUntil?`定风效果剩余 ${Math.ceil(ui.frozenUntil-ui.time)} 秒`:'收集蓝色定风珠可免疫危险五秒'}</p><div className="climb-controls"><button disabled={ui.status!=='running'&&ui.status!=='paused'} onClick={ui.status==='paused'?resume:pause}>{ui.status==='paused'?'继续游戏':'暂停游戏'}</button><button onClick={()=>{clear();update(newClimb(world.current.difficulty));setCopied('')}}>重置本局</button><button disabled={ui.status!=='won'&&ui.status!=='lost'} onClick={copy}>分享成绩 ↗</button></div>{copied&&<p className="climb-copy" role="status">{copied}</p>}<p className="climb-access" role="status">{ui.status==='lost'?ui.reason:ui.status==='won'?'成功登顶，挑战完成':ui.status==='paused'?'游戏已暂停':ui.status==='ready'?'准备开始':`已抵达第 ${ui.level} 层，向山顶前进`}</p></div>
 <aside className="climb-aside"><section className="rules-panel"><div className="arc-label">一眼看懂</div><h3>跳上去，就离山顶更近</h3><p style={{fontSize:12,lineHeight:1.9,color:'#71876a'}}>{['入门：平台更宽、鸟更慢，落石预警更久，无蝙蝠。','进阶：标准平台，怪鸟加快，加入盘旋蝙蝠。','高手：窄平台、密集快鸟、更多蝙蝠、落石间隔缩短。'][ui.difficulty]} 金色盾抵挡一次碰撞；蓝色珠免疫危险五秒。踩空仍会失败。</p><ol><li><span>一</span><p>自动起跳，落地再跳。你只需要用 <b>← →</b> 或 <b>Ａ / Ｄ</b> 控制左右移动；<b>↑</b> 开始或继续，<b>↓</b> 暂停。</p></li><li><span>二</span><p>手机用下方按钮，按住移动、松手停止。下落踩到平台才算登上这一层。</p></li><li><span>三</span><p>怪鸟会横向巡逻。橙色虚线是落石预警，看到后离开那条竖线。</p></li><li><span>四</span><p>踩空落出画面、碰鸟、碰石都会失败。登上第十八层的旗台即通关。</p></li></ol><div className="arc-tip">留一手，别贪跳<p>起跳后先对准下一层，快落地时松开方向。空格切换暂停；切走页面也会自动停下。方向键不会滚动游戏页面。</p></div></section><section className="climb-notice"><b>本局只与你自己比</b><p>没有付费复活，没有体力等待。输了直接重来，累了随时暂停。</p><small>最高层数保存在当前浏览器，刷新仍可查看。</small></section></aside></section>
}
