// 原创轻量平台跳跃规则。逻辑与绘制分离，便于测试。
export const CLIMB_WIDTH = 480;
export const CLIMB_HEIGHT = 560;
export const SUMMIT = 18;
export const GRAVITY = 1080;
export const JUMP = 640;
export const SPEED = 225;
export type Platform = { x: number; y: number; width: number; level: number };
export const platforms: Platform[] = Array.from({ length: SUMMIT + 1 }, (_, level) => ({
  level, x: level === 0 ? 35 : [84, 247, 123, 265, 70, 225][(level - 1) % 6],
  y: 48 + level * 112, width: level === 0 ? 410 : level === SUMMIT ? 150 : 130,
}));
export type Rock = { id: number; x: number; y: number; vy: number; warning: number };
export const climbLevels=['入门','进阶','高手'];
export const climbConfig=[{width:155,birds:[6,12,16],speed:.65,interval:7,warning:1.6,bats:[],items:[2,7,12]}, {width:130,birds:[3,6,9,12,15,17],speed:1,interval:4.6,warning:1.15,bats:[8,14],items:[2,8,13]}, {width:103,birds:[2,4,6,8,10,12,14,16,17],speed:1.4,interval:3,warning:.85,bats:[5,9,13,16],items:[3,10]}];
export function levelPlatforms(d:number){return platforms.map(p=>p.level===0||p.level===SUMMIT?p:{...p,x:p.x+(p.width-climbConfig[d].width)/2,width:climbConfig[d].width});}
export function batAt(level:number,time:number){const p=platforms[level];return{x:p.x+65+75*Math.sin(time*1.4+level),y:p.y+65+30*Math.cos(time*2+level)};}
export function pickupAt(level:number,d:number){const p=levelPlatforms(d)[level];return{x:p.x+p.width/2,y:p.y+28,kind:level%2===0?'shield':'freeze'};}
export type ClimbState = {
  difficulty:number; shield:number; invulnerable:number; frozenUntil:number; collected:number[];
  status: 'ready' | 'running' | 'paused' | 'won' | 'lost';
  x: number; y: number; vy: number; camera: number; level: number; time: number;
  rocks: Rock[]; nextRock: number; rockId: number; reason: string; facing: number;
};
export function newClimb(difficulty=1): ClimbState {
  return { difficulty,shield:0,invulnerable:0,frozenUntil:0,collected:[],status:'ready', x:149, y:48, vy:JUMP, camera:0, level:0, time:0, rocks:[], nextRock:4.5, rockId:0, reason:'', facing:1 };
}
export function birdAt(level: number, time: number) {
  return { x: 240 + 173 * Math.sin(time * .9 + level * 1.3), y: platforms[level].y + 54, direction: Math.cos(time * .9 + level * 1.3) >= 0 ? 1 : -1, level };
}
export const birdLevels = [3, 6, 9, 12, 15, 17];
export function stepClimb(state: ClimbState, input: number, delta: number, hazards = true): ClimbState {
  if (state.status !== 'running') return state;
  const dt = Math.min(Math.max(delta,0),1/30);
  const s: ClimbState = {...state, rocks:state.rocks.map(r=>({...r}))};
  s.time += dt;const config=climbConfig[s.difficulty];
  s.x = Math.max(22,Math.min(CLIMB_WIDTH-22,s.x+input*SPEED*dt));
  if(input) s.facing = input > 0 ? 1 : -1;
  s.vy -= GRAVITY*dt;
  const prevY=s.y;
  s.y += s.vy*dt;
  // 单向平台：上升穿过，下落踩稳后自动再跳。
  if(s.vy<=0){
    for(const p of [...levelPlatforms(s.difficulty)].reverse()){
      if(prevY>=p.y && s.y<=p.y && s.x+11>=p.x && s.x-11<=p.x+p.width){
        s.y=p.y; s.vy=JUMP; s.level=Math.max(s.level,p.level);
        if(p.level===SUMMIT){s.status='won';s.reason='云海在脚下，山巅有你的名字。';return s;}
        break;
      }
    }
  }
  s.camera=Math.max(s.camera,s.y-250,0);
  if(s.y<s.camera-45){s.status='lost';s.reason='脚下踩空了。看准下一块平台再横移。';return s;}
  for(const level of config.items){if(s.collected.includes(level))continue;const item=pickupAt(level,s.difficulty);if(Math.abs(s.x-item.x)<27&&Math.abs(s.y+22-item.y)<35){s.collected=[...s.collected,level];if(item.kind==='shield')s.shield=1;else s.frozenUntil=s.time+5;}}
  function hit(reason:string){if(s.time<s.invulnerable)return false;if(s.shield){s.shield=0;s.invulnerable=s.time+1.5;return false;}s.status='lost';s.reason=reason;return true;}
  if(hazards && s.time>=s.frozenUntil){
    for(const level of config.birds){const b=birdAt(level,s.time*config.speed);
      if(Math.abs(s.x-b.x)<28 && Math.abs(s.y+22-b.y)<22){if(hit('撞上了巡山怪鸟！先看清它的横飞方向。'))return s;}
    }
    for(const level of config.bats){const b=batAt(level,s.time);if(Math.abs(s.x-b.x)<24&&Math.abs(s.y+22-b.y)<22&&hit('被盘旋的蝙蝠碰到了，试着等它绕开。'))return s;}
    if(s.level>=4 && s.time>=s.nextRock){s.rocks.push({id:s.rockId++,x:s.x,y:s.y+360,vy:0,warning:config.warning});s.nextRock=s.time+config.interval;}
    s.rocks=s.rocks.filter(r=>r.y>s.camera-70);
    for(const rock of s.rocks){
      if(rock.warning>0){rock.warning-=dt;continue;}
      rock.vy-=720*dt;rock.y+=rock.vy*dt;
      if(Math.abs(s.x-rock.x)<23 && Math.abs(s.y+22-rock.y)<27){if(hit('被落石击中了。看到橙色预警线，及时横移躲开。'))return s;}
    }
  }
  return s;
}
