import {test} from 'node:test';
import assert from 'node:assert/strict';
import {placement,registration,advanceAnimation,pose} from './animation.js';
import {player} from './physics.js';
test('all poses preserve head scale and put measured soles at the physics anchor',()=>{
 for(const [name,frames] of Object.entries(registration)) for(let f=0;f<8;f++){
  const box=placement(name,f,440,510),m=frames[f];
  assert.ok(Math.abs(m.head*box.scale-50)<1e-8);
  assert.ok(Math.abs(box.y+m.foot*box.scale)<1e-8);
 }
 const standing=placement('crouch',0,384,512),low=placement('crouch',4,384,512);
 assert.ok((496-117)*low.scale < (495-11)*standing.scale*.8);
});
test('crouch uses intermediate poses and reverses without snapping',()=>{const a={crouch:0,stride:0},p=player();p.crouch=true;advanceAnimation(a,p,.1);assert.equal(pose(a,p).frame,2);p.crouch=false;advanceAnimation(a,p,.05);assert.equal(pose(a,p).frame,1);advanceAnimation(a,p,.1);assert.equal(pose(a,p).frame,0);});
test('run cadence follows distance and freezes while idle or airborne',()=>{const a={crouch:0,stride:0},p=player();advanceAnimation(a,p,.1);assert.equal(a.stride,0);p.vx=280;advanceAnimation(a,p,.1);assert.ok(Math.abs(a.stride-.175)<1e-8);p.grounded=false;advanceAnimation(a,p,.1);assert.ok(Math.abs(a.stride-.175)<1e-8);});

test('crouch walking face and total height do not grow versus held crouch',()=>{
 const held=placement('crouch',4,384,512);
 // Near-eye iris bounds measured in the actual source sheets: 12px versus 12px.
 const heldEye=12*held.scale;
 for(let i=0;i<8;i++){const moving=placement('crouch-walk',i,443.5,443.5);
  assert.ok(12*moving.scale<=heldEye*1.02);
  assert.ok((registration['crouch-walk'][i].foot-50)*moving.scale < (496-117)*held.scale);
 }
});
