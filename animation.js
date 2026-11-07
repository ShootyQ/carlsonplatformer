// Measurements are in source pixels, independent of sheet cell dimensions.
// Calibrated across sheets using visible eye/face size, not cell height.
// Match held crouch and crouch walking by their measured 12px near-eye feature.
const rows = (heads, feet, centers) => heads.map((head, i) => ({ head, foot: feet[i], center: centers[i] }));
export const registration = {
  crouch: rows([128,128,130,132,138,136,130,128], [495,495,495,495,496,495,496,495], Array(8).fill(192)),
  'crouch-walk': rows(Array(8).fill(138), [412,412,412,410,412,413,413,413], Array(8).fill(260)),
  // Airborne sprite elevation is supplied by physics, not baked into the cell.
  jump: rows([132,132,132,132,132,132,132,128], [486,485,434,400,474,496,496,496], Array(8).fill(192)),
};
export const layouts = {crouch:{columns:4,rows:2,count:8},'crouch-walk':{columns:4,rows:2,count:8},jump:{columns:4,rows:2,count:8}};
export function placement(name, frame, width, height) {
  const m = registration[name][frame];
  const scale = 50 / m.head;
  return { width: width * scale, height: height * scale, x: -m.center * scale, y: -m.foot * scale, scale };
}
export function advanceAnimation(a, p, dt) {
  const target = p.crouch ? 1 : 0;
  a.crouch += Math.sign(target - a.crouch) * Math.min(Math.abs(target - a.crouch), dt / .2);
  // Link cadence to distance traveled. Stopping does not advance the gait.
  if (p.grounded && p.vx) a.stride = (a.stride + Math.abs(p.vx) * dt / (p.crouch ? 95 : 160)) % 1;
}
export function pose(a, p) {
  if (!p.grounded) return {name:'jump',frame:p.vy < -220 ? 2 : p.vy < 150 ? 3 : 4};
  if (p.landing > 0) return {name:'jump',frame:p.landing > .08 ? 6 : 7};
  if (a.crouch > .001 || p.crouch) {
    if (p.crouch && a.crouch > .98 && p.vx) return {name:'crouch-walk',frame:Math.floor(a.stride*8)};
    return {name:'crouch',frame:Math.min(4,Math.round(a.crouch*4))};
  }
  return p.vx ? {name:'run',frame:0} : {name:'crouch',frame:0};
}
