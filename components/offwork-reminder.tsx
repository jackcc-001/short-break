"use client";
import { useEffect, useRef, useState } from 'react';
import { readLocal, writeLocal } from '@/lib/local-preferences';
import { advanceReminder, reminderKey, ReminderSchedule, snoozeReminder, targetTime, validSchedule } from '@/lib/reminder-clock';
export default function OffworkReminder({target,work}:{target:string;now:Date|null;work:boolean}){
 const [schedule,setSchedule]=useState<ReminderSchedule|null>(null),[preview,setPreview]=useState(false),[clock,setClock]=useState(0),[storageWarning,setStorageWarning]=useState('');
 const state=useRef<ReminderSchedule|null>(null),button=useRef<HTMLButtonElement>(null),oldFocus=useRef<HTMLElement|null>(null);
 function save(s:ReminderSchedule){state.current=s;setSchedule(s);if(!writeLocal('offwork-schedule-v2',s))setStorageWarning('浏览器不允许本地保存，刷新后延后提醒可能丢失。');}
 useEffect(()=>{
  const check=()=>{const time=Date.now(),key=reminderKey(target,time);setClock(time);
   let s=state.current;
   if(!s||s.key!==key){const stored=readLocal<unknown>('offwork-schedule-v2',null);if(validSchedule(stored)&&stored.key===key)s=stored;else s={key,at:null,pending:false};state.current=s;setSchedule(s);}
   const advanced=advanceReminder(s,time);
   if(advanced!==s){save(advanced);writeLocal('offwork-seen',key);return;}
   if(s.pending||s.at!==null)return;
   if(time>=targetTime(target,time)&&readLocal('offwork-seen','')!==key){save({...s,pending:true});writeLocal('offwork-seen',key);}
  };
  check();const timer=setInterval(check,1000);const visible=()=>{if(!document.hidden)check()};const sync=()=>{state.current=null;check()};document.addEventListener('visibilitychange',visible);window.addEventListener('focus',check);window.addEventListener('storage',sync);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visible);window.removeEventListener('focus',check);window.removeEventListener('storage',sync)};
 },[target]);
 const open=preview||!!schedule?.pending;
 function close(){setPreview(false);if(state.current){save({...state.current,pending:false,at:null});writeLocal('offwork-seen',state.current.key)}}
 function snooze(){const s=snoozeReminder(reminderKey(target,Date.now()),Date.now());setClock(Date.now());setPreview(false);save(s);writeLocal('offwork-seen',s.key)}
 useEffect(()=>{if(!open||work)return;oldFocus.current=document.activeElement as HTMLElement;button.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopImmediatePropagation();close()}if(e.key==='Tab'){const nodes=[...document.querySelectorAll<HTMLButtonElement>('.offwork-dialog button')];if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus()}}};window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);if(oldFocus.current?.isConnected)oldFocus.current.focus()}},[open,work]);
 const left=schedule?.at?Math.max(0,Math.ceil((schedule.at-clock)/1000)):0;
 if(work)return open?<div className="work-reminder">到点提醒已记录，返回休息页后查看。</div>:null;
 return <><button className="reminder-test" onClick={()=>setPreview(true)}>预览到点提醒</button>{schedule?.at&&<div className="reminder-snooze" role="status">将在 {new Date(schedule.at).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} 再提醒 · 剩余 {Math.floor(left/60)} 分 {left%60} 秒 <button onClick={()=>save({...schedule,at:null,pending:false})}>取消延后</button><small>刷新后继续计时；后台可能延迟，返回后补提醒。关闭网页期间不能弹窗。</small></div>}{storageWarning&&<p className="reminder-snooze">{storageWarning}</p>}{open&&<div className="offwork-backdrop"><section className="offwork-dialog" role="dialog" aria-modal="true" aria-labelledby="offwork-title"><span>今天也辛苦了</span><h2 id="offwork-title">收工时间到啦 ☀</h2><p>把没做完的事留一张便签，<br/>把剩下的时间还给自己。</p><small>你设定的时间：{target} · 不自动播放声音</small><div><button ref={button} onClick={close}>知道啦，准备收工</button><button onClick={snooze}>五分钟后提醒</button></div></section></div>}</>;
}
