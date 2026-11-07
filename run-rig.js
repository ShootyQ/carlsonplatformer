// Continuous two-bone animation. All coordinates are world units; y=0 is the ground.
export const STRIDE = 160;
export const THIGH = 41;
export const SHIN = 41;
const mix=(a,b,t)=>a+(b-a)*t;
export function solveLeg(hip, ankle) {
  const dx=ankle.x-hip.x,dy=ankle.y-hip.y;
  const distance=Math.hypot(dx,dy);
  const along=(THIGH*THIGH-SHIN*SHIN+distance*distance)/(2*distance);
  const height=Math.sqrt(Math.max(0,THIGH*THIGH-along*along));
  // Positive x bend: knees always bend forward, never backwards.
  return {x:hip.x+dx*along/distance+dy*height/distance,y:hip.y+dy*along/distance-dx*height/distance};
}
export function footAt(phase) {
  const t=((phase%1)+1)%1;
  if(t<.4) return {x:32-STRIDE*t,y:-10,angle:0,planted:true};
  const s=(t-.4)/.6;
  // Horizontal velocity is continuous at takeoff and touchdown (-STRIDE).
  // Hermite return curve swings forward between the two planted phases.
  const x=(-32)*(2*s**3-3*s*s+1)+32*(-2*s**3+3*s*s)-96*(2*s**3-3*s*s+s);
  return {x,y:-10-39*Math.sin(Math.PI*s)**2,angle:-.22*Math.sin(2*Math.PI*s),planted:false};
}
export function rigPose(phase) {
  const t=((phase%1)+1)%1;
  const hip={x:0,y:-78-1.8*(1-Math.cos(4*Math.PI*t))/2};
  const leg=offset=>{const foot=footAt(t+offset);return {hip,knee:solveLeg(hip,foot),ankle:foot};};
  const shoulder={x:-3,y:hip.y-49};
  const arm=offset=>{const angle=-.72*Math.cos(2*Math.PI*(t+offset));const elbow={x:shoulder.x+Math.sin(angle)*26,y:shoulder.y+Math.cos(angle)*26};return {shoulder,elbow,hand:{x:elbow.x+Math.sin(angle+1.45)*24,y:elbow.y+Math.cos(angle+1.45)*24}};};
  return {hip,near:leg(0),far:leg(.5),nearArm:arm(0),farArm:arm(.5)};
}
// Custom atlas rectangles include overlap at each joint. No animation frame swapping.
const parts={body:[95,8,346,570],upper:[709,128,115,313],fore:[1216,163,110,342],thigh:[190,642,160,367],shin:[708,640,120,361],shoe:[1134,755,291,144]};
function part(ctx,image,name,x,y,w,h){const s=parts[name];ctx.drawImage(image,...s,x,y,w,h);}
function bone(ctx,image,name,a,b,width){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);part(ctx,image,name,-width/2,-4,width,Math.hypot(b.x-a.x,b.y-a.y)+8);ctx.restore();}
function leg(ctx,image,l){bone(ctx,image,'thigh',l.hip,l.knee,14);bone(ctx,image,'shin',l.knee,l.ankle,11);ctx.save();ctx.translate(l.ankle.x,l.ankle.y);ctx.rotate(l.ankle.angle);part(ctx,image,'shoe',-7,-4,29,14);ctx.restore();}
function arm(ctx,image,a){bone(ctx,image,'upper',a.shoulder,a.elbow,9);bone(ctx,image,'fore',a.elbow,a.hand,8.5);}
export function drawRun(ctx,image,x,y,facing,phase){
  const pose=rigPose(phase);ctx.save();ctx.translate(x,y);ctx.scale(facing,1);
  ctx.save();ctx.filter='brightness(0.82)';leg(ctx,image,pose.far);arm(ctx,image,pose.farArm);ctx.restore();
  leg(ctx,image,pose.near);
  // Fixed head/body size. Hip and shoulder are hidden inside the dress and sleeve.
  ctx.save();ctx.translate(pose.hip.x,pose.hip.y);ctx.rotate(.045+.008*Math.sin(4*Math.PI*phase));const scale=50/224;part(ctx,image,'body',(95-277)*scale,(8-510)*scale,346*scale,570*scale);ctx.restore();
  arm(ctx,image,pose.nearArm);ctx.restore();
}
