// 音景动画的纯参数与形变函数；音频和画面使用同一阵风包络。
export type SceneKind = '雨窗' | '竹林';
export const SCENE_W = 720;
export const SCENE_H = 360;
export const clampIntensity = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function sceneDynamics(value: number) {
 const v = clampIntensity(value);
 return { rainCount: Math.round(18 + 282 * v * v), rainSpeed: 170 + 650 * v, rainLength: 7 + 32 * v,
  rainOpacity: .2 + .42 * v, rainTilt: 4 + 25 * v, splashes: Math.round(3 + 35 * v),
  bambooBend: .35 + 21 * v * v, leafSwing: .007 + .24 * v * v,
  label: v < .34 ? '轻柔' : v < .7 ? '适中' : '充沛' };
}
export function gustAt(seconds:number){return .53 + .25*Math.sin(seconds*.42)+.14*Math.sin(seconds*.91+1.3)+.07*Math.sin(seconds*.17+2.1);}
export function bambooPoint(baseX:number,baseY:number,height:number,lean:number,t:number,intensity:number,time:number,phase:number){
 const bend = sceneDynamics(intensity).bambooBend;
 const gust = gustAt(time-phase*.27);
 const drift = bend * (gust + .18*Math.sin(time*.62+phase));
 return {x:baseX+lean*t+drift*t*t*t,y:baseY-height*t};
}
