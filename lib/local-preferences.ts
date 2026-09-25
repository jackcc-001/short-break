"use client";
import { useEffect, useState } from 'react';
export const LOCAL_EVENT='rest-local-change';
export function readLocal<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem('rest:'+key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
export function writeLocal(key:string,value:unknown){try{localStorage.setItem('rest:'+key,JSON.stringify(value));window.dispatchEvent(new Event(LOCAL_EVENT));return true}catch{return false}}
export function recordBest(key:string,value:number,higher=false){const old=readLocal<number|null>('best:'+key,null);if(typeof old!=='number'||(higher?value>old:value<old))writeLocal('best:'+key,value);}
export function useBest(key:string){const[best,setBest]=useState<number|null>(null);useEffect(()=>{const sync=()=>{const v=readLocal<unknown>('best:'+key,null);setBest(typeof v==='number'&&Number.isFinite(v)?v:null)};sync();window.addEventListener(LOCAL_EVENT,sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener(LOCAL_EVENT,sync);window.removeEventListener('storage',sync)}},[key]);return best;}
