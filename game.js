import { drawRun } from './run-rig.js?v=0.4.0';
import { step, player, FLOOR } from './physics.js?v=0.4.0';
import { placement, advanceAnimation, pose, layouts } from './animation.js?v=0.4.0';
const VERSION = '0.4.0';
document.querySelector('#version').textContent = `v${VERSION}`;
const animation = { crouch:0, stride:0 };
const canvas=document.querySelector('canvas'), ctx=canvas.getContext('2d');
const start=document.querySelector('#start'), welcome=document.querySelector('#welcome');
const sheets={}; const p=player(); let running=false,time=0,last=0,accumulator=0,viewWidth=1000;
const keys=new Set(), touches=new Map();
const mapping={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowDown:'crouch',s:'crouch',ArrowUp:'jump',w:'jump',' ':'jump'};
function clear(){keys.clear();touches.clear();document.querySelectorAll('[data-action]').forEach(b=>b.classList.remove('active'));}
function inputs(){const held=new Set([...keys,...touches.values()]);return Object.fromEntries(['left','right','crouch','jump'].map(k=>[k,held.has(k)]));}
addEventListener('keydown',e=>{const action=mapping[e.key];if(action&&running){e.preventDefault();keys.add(action);}});
addEventListener('keyup',e=>{if(mapping[e.key])keys.delete(mapping[e.key]);});
addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{clear();last=0;accumulator=0;});
for(const button of document.querySelectorAll('[data-action]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(!running)return;button.setPointerCapture(e.pointerId);touches.set(e.pointerId,button.dataset.action);button.classList.add('active');});
 const release=e=>{touches.delete(e.pointerId);if(![...touches.values()].includes(button.dataset.action))button.classList.remove('active');};
 button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
async function fullscreen(){try{if(!document.fullscreenElement){if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else if(document.documentElement.webkitRequestFullscreen)document.documentElement.webkitRequestFullscreen();}if(screen.orientation?.lock)await screen.orientation.lock('landscape');}catch{/* Rotation overlay supports browsers without orientation locking. */}}
document.querySelector('#fullscreen').onclick=fullscreen;
start.onclick=()=>{running=true;welcome.hidden=true;last=0;fullscreen();};
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);viewWidth=innerWidth/innerHeight*600;clear();}addEventListener('resize',resize);resize();
function cloud(x,y,s){ctx.fillStyle='#ffffffc9';ctx.beginPath();ctx.ellipse(x,y,65*s,20*s,0,0,Math.PI*2);ctx.ellipse(x-25*s,y-12*s,29*s,25*s,0,0,Math.PI*2);ctx.ellipse(x+13*s,y-22*s,35*s,31*s,0,0,Math.PI*2);ctx.fill();}
function draw(){ctx.setTransform(canvas.width/viewWidth,0,0,canvas.height/600,0,0);const camera=Math.max(0,Math.min(3200-viewWidth,p.x-viewWidth*.4));
 const sky=ctx.createLinearGradient(0,0,0,FLOOR);sky.addColorStop(0,'#83cbed');sky.addColorStop(1,'#e6f5db');ctx.fillStyle=sky;ctx.fillRect(0,0,viewWidth,600);
 ctx.fillStyle='#fff3ae';ctx.beginPath();ctx.arc(viewWidth-130,100,39,0,Math.PI*2);ctx.fill();
 for(let i=-1;i<8;i++)cloud(i*440-camera*.2,95+(i%3)*35,0.7+(i%2)*.25);
 for(let i=-1;i<12;i++){const x=i*400-camera*.35;ctx.fillStyle=i%2?'#a5cf93':'#b8dca5';ctx.beginPath();ctx.ellipse(x,520,330,150+(i%3)*24,0,Math.PI,0);ctx.fill();}
 ctx.fillStyle='#80b963';ctx.fillRect(0,FLOOR,viewWidth,90);ctx.fillStyle='#b58a58';ctx.fillRect(0,FLOOR+15,viewWidth,85);ctx.fillStyle='#76ac50';ctx.fillRect(0,FLOOR,viewWidth,16);
 for(let i=Math.floor(camera/26);i<(camera+viewWidth)/26+1;i++){const x=i*26-camera;ctx.strokeStyle='#548f40';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,FLOOR+5);ctx.lineTo(x-3,FLOOR-4-(i%3)*2);ctx.moveTo(x,FLOOR+5);ctx.lineTo(x+4,FLOOR-2);ctx.stroke();if(i%7===0){ctx.fillStyle=i%2?'#fff4c7':'#f4b9a7';ctx.beginPath();ctx.arc(x+4,FLOOR-7,3,0,Math.PI*2);ctx.fill();}}
 const {name,frame}=pose(animation,p);
 if(name==='run' && sheets.rig){drawRun(ctx,sheets.rig,p.x-camera,p.y,p.facing,animation.stride);return;}
 const im=sheets[name];if(im){const layout=layouts[name];const sw=im.width/layout.columns,sh=im.height/layout.rows;const box=placement(name,frame,sw,sh);ctx.save();ctx.translate(p.x-camera,p.y);ctx.scale(p.facing,1);ctx.drawImage(im,(frame%layout.columns)*sw,Math.floor(frame/layout.columns)*sh,sw,sh,box.x,box.y,box.width,box.height);ctx.restore();}

}
function loop(t){const dt=last?Math.min((t-last)/1000,.1):0;last=t;const landscape=innerWidth>innerHeight;if(running&&landscape&&!document.hidden){accumulator+=dt;while(accumulator>=1/120){step(p,inputs(),1/120);advanceAnimation(animation,p,1/120);time+=1/120;accumulator-=1/120;}}else accumulator=0;draw();requestAnimationFrame(loop);}
Promise.all(['rig','crouch','crouch-walk','jump'].map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{sheets[name]=im;resolve();};im.onerror=()=>reject(new Error(name));im.src=`assets/${name==='rig'?'run-rig':name}.png?v=${VERSION}`;}))).then(()=>{start.disabled=false;start.textContent='Let’s play!';}).catch(()=>{start.textContent='Couldn’t load artwork. Please reload.';});
requestAnimationFrame(loop);
