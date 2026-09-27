"use client";
import { useEffect, useRef } from 'react';
import { bambooPoint, SCENE_H as H, SCENE_W as W, SceneKind, sceneDynamics, gustAt } from '@/lib/scenery';
import { rng } from '@/lib/puzzles';
import './ambient-window.css';
const random=rng(582913);
const rain=Array.from({length:310},()=>({x:random(),phase:random(),depth:.4+random()*.6}));
const trees=Array.from({length:17},(_,i)=>({x:15+i*44+(random()-.5)*20,h:230+random()*145,lean:(random()-.5)*22,depth:i%3===0?.5:1,phase:random()*6}));
function landscape(c:CanvasRenderingContext2D,scene:SceneKind){
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,scene==='雨窗'?'#9eafb0':'#d9e5bf');bg.addColorStop(1,scene==='雨窗'?'#dbe1d6':'#a6bd93');c.fillStyle=bg;c.fillRect(0,0,W,H);
 for(let layer=0;layer<3;layer++){c.fillStyle=['#a6bbb3','#8aa59c','#69897e'][layer];c.globalAlpha=scene==='竹林'?.18:.5;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W+10;x+=12)c.lineTo(x,H-80+layer*25-Math.sin(x/130+layer*2)*34);c.lineTo(W,H);c.fill();}c.globalAlpha=1;
}
function drawRain(c:CanvasRenderingContext2D,time:number,intensity:number,travel:number){const m=sceneDynamics(intensity);landscape(c,'雨窗');
 c.fillStyle=`rgba(222,237,232,${.04+intensity*.16})`;c.fillRect(0,0,W,H);
 for(let i=0;i<m.rainCount;i++){const p=rain[i],y=((p.phase*(H+100)+travel*p.depth)%(H+100))-60,x=((p.x*(W+80)-time*m.rainTilt*p.depth)%(W+80)+W+80)%(W+80)-30;
 c.strokeStyle=`rgba(248,255,250,${m.rainOpacity*p.depth})`;c.lineWidth=.55+p.depth*.8;c.beginPath();c.moveTo(x,y);c.lineTo(x-m.rainTilt*.28,y+m.rainLength*p.depth);c.stroke();}
 // 框架固定在最前面，避免雨和窗一起飘动。
 c.fillStyle='#47645f';c.fillRect(0,0,15,H);c.fillRect(W-15,0,15,H);c.fillRect(0,0,W,12);c.fillRect(0,H-20,W,20);c.fillRect(W*.54,0,8,H);c.fillRect(0,H*.48,W,7);
 for(let i=0;i<m.splashes;i++){const p=rain[300-i],age=(time*(1.1+intensity)+p.phase)%1;if(age>.55)continue;c.strokeStyle=`rgba(242,253,243,${(.55-age)*(.3+intensity*.5)})`;c.lineWidth=1;c.beginPath();c.ellipse(24+p.x*(W-48),H-24,2+age*17,1+age*4,0,0,Math.PI*2);c.stroke();}
 // 玻璃挂雨采用缓慢、细小的纵向轨迹，与窗外快速雨幕区分。
 for(let i=0;i<Math.round(intensity*14);i++){const p=rain[i+100],x=30+p.x*(W-60),y=(p.phase*H+time*(4+intensity*12))%H;c.strokeStyle='#e8f2eb55';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+2,y+9,x+1,y+21);c.stroke();}
}
function leaf(c:CanvasRenderingContext2D,x:number,y:number,length:number,angle:number,alpha:number){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.fillStyle='#345f38';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(length*.45,-length*.18,length,0);c.quadraticCurveTo(length*.4,length*.17,0,0);c.fill();c.restore();}
function drawBamboo(c:CanvasRenderingContext2D,time:number,intensity:number){landscape(c,'竹林');
 const m=sceneDynamics(intensity);const ordered=[...trees].sort((a,b)=>a.depth-b.depth);
 for(const tree of ordered){const base=H+20,phase=tree.phase;c.strokeStyle=tree.depth<1?'#829f75':'#517747';c.lineWidth=tree.depth<1?5:8;c.lineCap='round';c.beginPath();for(let j=0;j<=18;j++){const p=bambooPoint(tree.x,base,tree.h,tree.lean,j/18,intensity,time,phase);if(j)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y)}c.stroke();
 for(let j=1;j<=7;j++){const t=j/8,p=bambooPoint(tree.x,base,tree.h,tree.lean,t,intensity,time,phase);c.strokeStyle=tree.depth<1?'#b4c9a1':'#91b177';c.lineWidth=2;c.beginPath();c.moveTo(p.x-4*tree.depth,p.y);c.lineTo(p.x+4*tree.depth,p.y-1);c.stroke();if(j<3||j%2===0)continue;
 const direction=(j+Math.floor(phase))%2?1:-1,branch=34*tree.depth;const flutter=m.leafSwing*(.6*Math.sin(time*1.6+phase+j)+.4*gustAt(time));
 c.strokeStyle=tree.depth<1?'#85a173':'#476e3f';c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+direction*branch*.5,p.y-9,p.x+direction*branch,p.y-17);c.stroke();
 for(let k=0;k<5;k++){const x=p.x+direction*(k*7+4)*tree.depth,y=p.y-(k*3+2);leaf(c,x,y,(16+k%2*9)*tree.depth,(direction===1?-.5:Math.PI+.4)+(k%2?.5:-.5)+flutter,tree.depth<1?.48:.88);}}
 }
 c.fillStyle='#d8e3c01c';c.fillRect(0,0,W,H);
}
export default function AmbientWindow({scene,intensity}:{scene:SceneKind;intensity:number}){
 const canvas=useRef<HTMLCanvasElement>(null),props=useRef({scene,intensity}),smoothed=useRef(intensity),localTime=useRef(0),previous=useRef(0),rainTravel=useRef(0);
 props.current={scene,intensity};
 useEffect(()=>{let frame=0;let visible=true;const node=canvas.current!;const observer=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);observer.observe(node);
 const paint=(stamp:number)=>{const dt=previous.current?Math.min((stamp-previous.current)/1000,.04):0;previous.current=stamp;const ctx=node.getContext('2d');if(ctx&&visible&&!document.hidden){localTime.current+=dt;smoothed.current+=(props.current.intensity-smoothed.current)*Math.min(1,dt*5);
 const ratio=Math.min(window.devicePixelRatio||1,2);if(node.width!==W*ratio){node.width=W*ratio;node.height=H*ratio}ctx.setTransform(ratio,0,0,ratio,0,0);rainTravel.current+=dt*sceneDynamics(smoothed.current).rainSpeed;if(props.current.scene==='雨窗')drawRain(ctx,localTime.current,smoothed.current,rainTravel.current);else drawBamboo(ctx,localTime.current,smoothed.current);node.dataset.visualIntensity=smoothed.current.toFixed(2);node.dataset.rainCount=String(sceneDynamics(smoothed.current).rainCount);node.dataset.tipBend=sceneDynamics(smoothed.current).bambooBend.toFixed(2);}
 frame=requestAnimationFrame(paint);};frame=requestAnimationFrame(paint);return()=>{cancelAnimationFrame(frame);observer.disconnect();};},[]);
 return <div className="ambient-window" data-scene={scene}><canvas ref={canvas} width={W} height={H} role="img" aria-label={`${scene}动态音景，强度 ${Math.round(intensity*100)}%`}/><span className="ambient-caption">{scene==='雨窗'?'雨在窗外，忙碌先放一边。':'风慢慢经过，你不用回答。'}</span><span className="ambient-level">{sceneDynamics(intensity).label} · {Math.round(intensity*100)}%</span></div>;
}
