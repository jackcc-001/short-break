export type ReminderSchedule={key:string;at:number|null;pending:boolean};
export function reminderKey(target:string,time:number){const d=new Date(time);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}:${target}`;}
export function targetTime(target:string,time:number){const d=new Date(time),[h,m]=target.split(':').map(Number);d.setHours(h,m,0,0);return d.getTime();}
export function validSchedule(raw:unknown):raw is ReminderSchedule{if(!raw||typeof raw!=='object')return false;const v=raw as ReminderSchedule;return typeof v.key==='string'&&(v.at===null||typeof v.at==='number'&&Number.isFinite(v.at))&&typeof v.pending==='boolean';}
export function advanceReminder(s:ReminderSchedule,time:number):ReminderSchedule{return s.at!==null&&time>=s.at?{...s,at:null,pending:true}:s;}
export function snoozeReminder(key:string,time:number):ReminderSchedule{return{key,at:time+5*60*1000,pending:false};}
