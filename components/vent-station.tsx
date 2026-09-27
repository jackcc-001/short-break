"use client";
import { useEffect, useRef, useState } from 'react';
import { useInferenceRun } from '@/lib/use-inference-run';

type Receipt={title:string;text:string;tag:string};
export default function VentStation(){
 const [text,setText]=useState(''),[online,setOnline]=useState(false),[consent,setConsent]=useState(false),[mode,setMode]=useState('陪我缓一缓'),[result,setResult]=useState<Receipt|null>(null),[notice,setNotice]=useState('');
 const {run,loading}=useInferenceRun();const epoch=useRef(0),input=useRef<HTMLTextAreaElement>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;epoch.current++}},[]);
 function invalidate(){epoch.current++;setResult(null);setNotice('')}
 function clear(){invalidate();setText('');setNotice('这段文字已从当前页面清空。不必现在就想通。');input.current?.focus();}
 async function send(){if(!consent||!text.trim()||loading)return;const request=++epoch.current;setNotice('');setResult(null);try{
 const task=await run('anthropic/claude-haiku-4-5',{text:`想说的话：${text}\n希望的回应：${mode}`,system_prompt:'你是温和的文字整理助手。只返回JSON：{"title":"不超过10字标题","text":"不超过100字的回应","tag":"不超过8字标签"}。承认感受，不强行积极、不说教、不诊断、不做治疗承诺，不攻击他人，不复述姓名或公司隐私。若是即时自伤危险，温和建议联系身边可信赖的人或当地紧急援助。'});
 if(!mounted.current||request!==epoch.current)return;const raw=(task.output as {response?:string}|null)?.response??'',clean=raw.replace(/```(?:json)?/g,'').trim();const obj=JSON.parse(clean.slice(clean.indexOf('{'),clean.lastIndexOf('}')+1));if(!obj||typeof obj.title!=='string'||typeof obj.text!=='string'||typeof obj.tag!=='string')throw new Error('返回格式不完整');setResult({title:obj.title.slice(0,40),text:obj.text.slice(0,500),tag:obj.tag.slice(0,30)});
 }catch{if(mounted.current&&request===epoch.current)setNotice('在线整理暂时不可用，这次没有生成结果。文字仍在这里，你可以自己留看一会儿，或清空。不会用固定安慰句冒充理解。');}}
 return <section className="vent-panel" id="vent"><div className="break-heading"><div><small>烦恼回收站</small><h2>先放这里，不必马上想通。</h2></div><span>{online?'在线整理 · 自愿发送':'仅在当前页面'}</span></div><p className="vent-intro">不需要组织好语言，也不用解释为什么累。这里不评分、不围观。</p><div className="vent-privacy-tabs"><button aria-pressed={!online} onClick={()=>{invalidate();setOnline(false);setConsent(false)}}>只想写下来</button><button aria-pressed={online} onClick={()=>{invalidate();setOnline(true);setConsent(false)}}>请帮我整理一下</button></div>
 <textarea ref={input} className="vent-input" aria-label="想说的话" value={text} maxLength={500} onChange={e=>{invalidate();setText(e.target.value)}} placeholder="今天有哪件事，让你有点喘不过气？也可以什么都不写。"/>
 <div className="vent-meta"><span>{text.length}/500 · 请勿填写姓名、公司机密或敏感信息</span><button onClick={clear}>清空文字</button></div>
 {!online?<div className="vent-local"><p>此模式不发送文字，不写入本地存储。刷新或离开摸鱼页后不会保留。</p><button className="vent-submit" disabled={!text.trim()} onClick={clear}>写完了，就放掉它</button></div>:<><div className="vent-modes">{['陪我缓一缓','帮我理一理','轻轻吐槽一下'].map(m=><button key={m} aria-pressed={mode===m} className={mode===m?'active':''} onClick={()=>{invalidate();setMode(m)}}>{m}</button>)}</div><label className="vent-consent"><input type="checkbox" checked={consent} onChange={e=>{epoch.current++;setConsent(e.target.checked)}}/><span>我了解：仅点击下方发送后，文字会交给第三方生成服务，服务可能留存请求。清空不能撤回已发送内容。</span></label><button className="vent-submit" disabled={!consent||!text.trim()||loading} onClick={send}>{loading?'正在整理，可随时清空…':'发送并在线整理'}</button></>}
 {result&&<div className="vent-receipt"><span>在线生成回应 · 不是专业心理建议</span><b>{result.title}</b><p>{result.text}</p><small>{result.tag}</small></div>}{notice&&<p className="vent-notice" role="status">{notice}</p>}</section>;
}
