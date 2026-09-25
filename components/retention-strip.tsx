"use client";
import { useEffect, useState } from "react";

const tasks = ["完成一局游戏", "点亮一盏灯", "生成一张名帖"];
export function RetentionStrip(){const [done,setDone]=useState<boolean[]>([false,false,false]);useEffect(()=>{try{const raw=localStorage.getItem("wuxia-daily-tasks");if(raw)setDone(JSON.parse(raw))}catch{}},[]);const toggle=(i:number)=>setDone(v=>{const next=v.map((x,n)=>n===i?!x:x);try{localStorage.setItem("wuxia-daily-tasks",JSON.stringify(next))}catch{}return next});return <section className="retention-strip"><div><span className="arc-label">今日江湖 · 三件小事</span><h2>每天留下一点江湖痕迹</h2><p>完成任务，收集你的本周江湖印记。仅保存在当前浏览器。</p></div><div className="retention-tasks">{tasks.map((task,i)=><button key={task} className={done[i]?"done":""} onClick={()=>toggle(i)}><span>{done[i]?"✓":`0${i+1}`}</span><b>{task}</b><small>{done[i]?"已完成":"去完成 →"}</small></button>)}</div></section>}
