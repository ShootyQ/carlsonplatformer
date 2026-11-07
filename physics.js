export const FLOOR = 510;
export function step(p, input, dt) {
  p.crouch = input.crouch && p.grounded;
  const direction = Number(!!input.right) - Number(!!input.left);
  const targetSpeed = direction * (p.crouch ? 110 : 280);
  // Ease into and out of a stride instead of instantly snapping to full speed.
  const acceleration = p.grounded ? 2400 : 1500;
  p.vx += Math.sign(targetSpeed - p.vx) * Math.min(Math.abs(targetSpeed - p.vx), acceleration * dt);
  if (direction) p.facing = direction;
  if (input.jump && !p.jumpHeld && p.grounded) { p.vy = -640; p.grounded = false; p.crouch = false; }
  p.jumpHeld = input.jump;
  const nextX = p.x + p.vx * dt;
  p.x = Math.max(40, Math.min(3160, nextX));
  if (p.x !== nextX) p.vx = 0;
  p.vy += 1700 * dt;
  p.y += p.vy * dt;
  if (p.y >= FLOOR) { if (!p.grounded) p.landing = 0.18; p.y = FLOOR; p.vy = 0; p.grounded = true; }
  p.landing = Math.max(0, p.landing - dt);
}
export function player() { return { x:260,y:FLOOR,vx:0,vy:0,facing:1,grounded:true,crouch:false,jumpHeld:false,landing:0 }; }
