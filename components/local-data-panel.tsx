"use client";
import "./local-data-panel.css";
import { useState } from 'react';
import { belongsToGroup, DataGroup } from '@/lib/data-groups';
import { LOCAL_EVENT } from '@/lib/local-preferences';
const groups:{id:DataGroup;name:string;desc:string}[]=[{id:'scores',name:'游戏成绩',desc:'各难度最佳成绩与最高层数。'},{id:'preferences',name:'使用偏好',desc:'外观、上次游戏、环境强度和提醒时间。'},{id:'work',name:'工作视图内容',desc:'本机项目表格和待办文字。不会清除真实工作文件。'}];
export default function LocalDataPanel(){const[open,setOpen]=useState(false),[chosen,setChosen]=useState<DataGroup|null>(null),[counts,setCounts]=useState<Record<string,number>>({}),[notice,setNotice]=useState('');
 function scan(){try{const keys=Object.keys(localStorage);setCounts(Object.fromEntries(groups.map(g=>[g.id,keys.filter(k=>belongsToGroup(k,g.id)).length])))}catch{setNotice('浏览器不允许访问本地存储。')}}
 function remove(){if(!chosen)return;try{Object.keys(localStorage).filter(k=>belongsToGroup(k,chosen)).forEach(k=>localStorage.removeItem(k));window.dispatchEvent(new Event(LOCAL_EVENT));window.dispatchEvent(new CustomEvent('rest-data-cleared',{detail:chosen}));setNotice('所选数据已清除。其他网站的数据和浏览历史不受影响。');setChosen(null);scan();}catch{setNotice('清除失败，请检查浏览器权限。')}}
 return <section className="data-panel"><button className="data-toggle" aria-expanded={open} onClick={()=>{setOpen(!open);setChosen(null);scan()}}>本机数据，随时由你做主 <span>{open?'收起 −':'查看与清理 ＋'}</span></button>{open&&<div className="data-content"><p>不登录、不跨设备同步。烦恼文字不会保存在这些数据中。删除不可撤销，也不会撤回已经发给在线服务的请求。</p><div className="data-groups">{groups.map(g=><div key={g.id}><b>{g.name} <small>{counts[g.id]??0} 项</small></b><p>{g.desc}</p><button onClick={()=>setChosen(g.id)}>清理{g.name}</button></div>)}</div>{chosen&&<div className="data-confirm" role="alert"><span>确认清除{groups.find(g=>g.id===chosen)?.name}？此操作不可撤销。</span><button onClick={remove}>确认清除</button><button onClick={()=>setChosen(null)}>保留数据</button></div>}<p role="status">{notice}</p></div>}</section>;
}
