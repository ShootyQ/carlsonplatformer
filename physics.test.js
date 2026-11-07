import {test} from 'node:test';
import assert from 'node:assert/strict';
import {step,player,FLOOR} from './physics.js';
const tick=(p,input,n=120)=>{for(let i=0;i<n;i++)step(p,input,1/120);};
test('movement, direction and world bounds',()=>{const p=player();tick(p,{right:true});assert.ok(p.x>500);tick(p,{left:true},2000);assert.equal(p.x,40);assert.equal(p.facing,-1);tick(p,{right:true},2000);assert.equal(p.x,3160);});
test('jump leaves ground, lands, and held jump cannot auto-repeat',()=>{const p=player();step(p,{jump:true},1/120);assert.ok(p.y<FLOOR);assert.equal(p.grounded,false);tick(p,{jump:true},240);assert.equal(p.y,FLOOR);assert.equal(p.grounded,true);step(p,{jump:false},1/120);step(p,{jump:true},1/120);assert.equal(p.grounded,false);});
test('crouch walking is slower and jump exits crouch',()=>{const p=player();tick(p,{crouch:true,right:true});assert.equal(p.crouch,true);assert.ok(p.x>360 && p.x<370);step(p,{crouch:true,jump:true},1/120);assert.equal(p.crouch,false);assert.equal(p.grounded,false);});

test('running eases up to speed, stops and reverses without a velocity snap',()=>{const p=player();step(p,{right:true},1/120);assert.ok(p.vx>0 && p.vx<280);tick(p,{right:true});assert.equal(p.vx,280);step(p,{left:true},1/120);assert.ok(p.vx>0 && p.vx<280);tick(p,{left:true});assert.equal(p.vx,-280);tick(p,{});assert.equal(p.vx,0);});
