export type DataGroup='scores'|'preferences'|'work';
const preferences=['character','last-game','break-scene','break-volume','break-time','offwork-seen','offwork-schedule-v2'];
export function belongsToGroup(key:string,group:DataGroup){if(!key.startsWith('rest:'))return false;const name=key.slice(5);return group==='scores'?name.startsWith('best:'):group==='work'?['work-rows','work-todos'].includes(name):preferences.includes(name);}
