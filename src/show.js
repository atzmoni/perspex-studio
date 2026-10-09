
/* ---------- Showcase: laser cut → UV print → assembly → at home ---------- */
const ezz = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mix = (a, b, t) => a + (b - a) * t;
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
let SH = null;

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,200,120,.85)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function honeyTex() {
  const r = 9, w = Math.round(Math.sqrt(3) * r * 12), h = r * 3 * 8, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = '#25272c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#44474f'; g.lineWidth = 1.6;
  for (let row = -1; row <= 17; row++) for (let col = -1; col <= 13; col++) {
    const cx = col * Math.sqrt(3) * r + (row % 2 ? Math.sqrt(3) * r / 2 : 0), cy = row * r * 1.5; g.beginPath();
    for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t;
}
function artTex() {
  const c = document.createElement('canvas'); c.width = 520; c.height = 360; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 360);
  gr.addColorStop(0, '#f3dcb5'); gr.addColorStop(0.6, '#e9b98a'); gr.addColorStop(1, '#c98b62'); g.fillStyle = gr; g.fillRect(0, 0, 520, 360);
  g.fillStyle = '#f7efe1'; g.beginPath(); g.arc(360, 130, 46, 0, Math.PI * 2); g.fill();
  [['#b0775a', 250, 0.012], ['#8d5a45', 285, 0.018], ['#6c4436', 320, 0.009]].forEach(([col, y, f]) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, 360); for (let x = 0; x <= 520; x += 10) g.lineTo(x, y + Math.sin(x * f + y) * 22); g.lineTo(520, 360); g.fill(); });
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
let NIGHT_ENV = null;
function nightEnv() {
  if (NIGHT_ENV) return NIGHT_ENV; const env = new THREE.RoomEnvironment(), warm = new THREE.Color(1, 0.82, 0.62);
  env.traverse(o => { if (o.material) { o.material = o.material.clone(); if (o.material.color) o.material.color.multiplyScalar(0.12).multiply(warm); } });
  NIGHT_ENV = pmrem.fromScene(env, 0.04).texture; return NIGHT_ENV;
}
function disposeDeep(o) { o.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) [].concat(c.material).forEach(m => { if (m.map && m.map !== WOOD && !m.map._keep) m.map.dispose(); m.dispose(); }); }); }
function woodMat(tint, rough = 0.5) { if (!WOOD) { WOOD = woodTexture(); WOOD._keep = true; } return new THREE.MeshStandardMaterial({ map: WOOD, color: tint, roughness: rough }); }
function box(gr, w, h, d, mat, x, y, z, shadow = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; gr.add(m); return m; }

/* A bedside table in the evening, with a warm lamp and a few books. */
function buildNightstand(bw, bd) {
  const gr = new THREE.Group(), NW = Math.max(bw + 460, 560), ND = Math.max(bd + 230, 400), FH = 560, legH = 110;
  const walnut = woodMat(0x9a6a48, 0.45), dark = new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.8 }), brass = new THREE.MeshPhysicalMaterial({ color: 0xc8a25a, metalness: 1, roughness: 0.28 });
  box(gr, NW, 26, ND, walnut, 0, FH - 13, 0);
  const ch = FH - 26 - legH; box(gr, NW - 16, ch, ND - 16, walnut, 0, legH + ch / 2, 0);
  box(gr, NW - 40, 3, 3, dark, 0, legH + ch * 0.5, ND / 2 - 7, false);
  [0.25, 0.75].forEach(f => { const k = new THREE.Mesh(new THREE.SphereGeometry(10, 20, 12), brass); k.position.set(0, legH + ch * f, ND / 2 - 2); k.castShadow = true; gr.add(k); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(13, 8, legH, 16), walnut); l.position.set(sx * (NW / 2 - 34), legH / 2, sz * (ND / 2 - 34)); l.castShadow = true; gr.add(l); });
  const lx = Math.min(NW / 2 - 85, bw / 2 + 150), ceramic = new THREE.MeshPhysicalMaterial({ color: 0xe9e2d6, roughness: 0.25, clearcoat: 0.6 });
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(52, 60, 22, 32), ceramic); lb.position.set(lx, FH + 11, -ND * 0.12); lb.castShadow = true; gr.add(lb);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 300, 12), brass); st.position.set(lx, FH + 172, -ND * 0.12); gr.add(st);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(78, 118, 170, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xf3e3c6, emissive: 0xffc988, emissiveIntensity: 0.85, roughness: 0.9, side: THREE.DoubleSide }));
  shade.position.set(lx, FH + 330, -ND * 0.12); gr.add(shade);
  const bulb = new THREE.PointLight(0xffb468, 0, 0, 2); bulb.position.set(lx, FH + 300, -ND * 0.12 + 20); gr.add(bulb);
  const bx = -Math.min(NW / 2 - 90, bw / 2 + 150);
  [['#33415c', 210, 34], ['#8a3b2e', 190, 28], ['#d9cbb0', 200, 24]].forEach(([c, w, h], i, a) => { const y = FH + a.slice(0, i).reduce((s, x) => s + x[2], 0) + h / 2; const b = box(gr, w, h, 150, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }), bx, y, -ND * 0.05); b.rotation.y = (i - 1) * 0.12; });
  const wallZ = -ND / 2 - 40, wall = new THREE.Mesh(new THREE.PlaneGeometry(6000, 3400), new THREE.MeshStandardMaterial({ color: 0xc9b49a, roughness: 1 })); wall.position.set(0, 1700, wallZ); wall.receiveShadow = true; gr.add(wall);
  return { gr, FH, wallZ, lamp: bulb, lampI: 900000, floor: '#4d3424', bg: '#120d0a', light: [0.12, 0.18, 0.1], exp: 1.15, night: true };
}
/* A living-room sideboard in daylight, with a framed print and a vase. */
function buildCabinet(bw, bd) {
  const gr = new THREE.Group(), CW = Math.max(bw + 1000, 1500), CD = Math.max(bd + 250, 450), FH = 780, legH = 150;
  const oak = woodMat(0xe6c7a0, 0.5), lac = new THREE.MeshPhysicalMaterial({ color: 0xf1ece4, roughness: 0.35, clearcoat: 0.5 }), groove = new THREE.MeshStandardMaterial({ color: 0x8e877c, roughness: 0.9 }), brass = new THREE.MeshPhysicalMaterial({ color: 0xc8a25a, metalness: 1, roughness: 0.28 });
  box(gr, CW + 24, 26, CD + 20, oak, 0, FH - 13, 0);
  const ch = FH - 26 - legH; box(gr, CW, ch, CD, lac, 0, legH + ch / 2, 0);
  [-1, 1].forEach(s => { box(gr, 3, ch - 30, 3, groove, s * CW / 6, legH + ch / 2, CD / 2 + 1, false); box(gr, 7, 130, 12, brass, s * CW / 6 + s * -22, legH + ch * 0.58, CD / 2 + 6); });
  box(gr, 7, 130, 12, brass, CW / 2 - 60, legH + ch * 0.58, CD / 2 + 6); box(gr, 7, 130, 12, brass, -CW / 2 + 60, legH + ch * 0.58, CD / 2 + 6);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(14, 9, legH, 16), oak); l.position.set(sx * (CW / 2 - 50), legH / 2, sz * (CD / 2 - 50)); l.castShadow = true; gr.add(l); });
  const vx = -(bw / 2 + 280), pts = [[0, 0], [70, 0], [95, 60], [100, 140], [70, 230], [42, 300], [48, 330]].map(([x, y]) => new THREE.Vector2(x, y));
  const vase = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), new THREE.MeshPhysicalMaterial({ color: 0xb8664a, roughness: 0.55, clearcoat: 0.3 })); vase.position.set(vx, FH, -CD * 0.1); vase.castShadow = true; gr.add(vase);
  const stemM = new THREE.MeshStandardMaterial({ color: 0x6b5a3c, roughness: 0.9 }), leafM = new THREE.MeshStandardMaterial({ color: 0x8c9a6b, roughness: 0.8 });
  [-0.25, 0.05, 0.3].forEach((a, i) => { const L = 330 + i * 60, s = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, L, 6), stemM); s.position.set(vx + Math.sin(a) * L / 2, FH + 320 + Math.cos(a) * L / 2, -CD * 0.1); s.rotation.z = -a; gr.add(s); for (let k = 0; k < 6; k++) { const f = 0.45 + k * 0.1, lf = new THREE.Mesh(new THREE.SphereGeometry(14, 10, 8), leafM); lf.scale.set(1, 0.45, 0.6); lf.position.set(vx + Math.sin(a) * L * f + (k % 2 ? 12 : -12), FH + 320 + Math.cos(a) * L * f, -CD * 0.1); gr.add(lf); } });
  const px = bw / 2 + 300, pot = new THREE.Mesh(new THREE.CylinderGeometry(70, 55, 120, 32), new THREE.MeshPhysicalMaterial({ color: 0x2f3437, roughness: 0.4 })); pot.position.set(px, FH + 60, -CD * 0.05); pot.castShadow = true; gr.add(pot);
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, lf = new THREE.Mesh(new THREE.SphereGeometry(42, 14, 10), new THREE.MeshStandardMaterial({ color: k % 2 ? 0x4f7a45 : 0x5f8c4f, roughness: 0.7 })); lf.scale.set(0.5, 1.3, 0.35); lf.position.set(px + Math.cos(a) * 40, FH + 160 + (k % 3) * 22, -CD * 0.05 + Math.sin(a) * 40); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); lf.castShadow = true; gr.add(lf); }
  const wallZ = -CD / 2 - 30, wall = new THREE.Mesh(new THREE.PlaneGeometry(7000, 3600), new THREE.MeshStandardMaterial({ color: 0xb4c2bb, roughness: 1 })); wall.position.set(0, 1800, wallZ); wall.receiveShadow = true; gr.add(wall);
  return { gr, FH, wallZ, art: { x: 0, z: wallZ }, lamp: null, floor: '#a98a68', bg: '#c5ccc6', light: [0.85, 0.95, 0.8], exp: 0.95, addArt(top) { const fr = box(gr, 600, 440, 24, new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.5 }), 0, FH + top + 360, wallZ + 12); const art = new THREE.Mesh(new THREE.PlaneGeometry(540, 380), new THREE.MeshStandardMaterial({ map: artTex(), roughness: 0.9 })); art.position.set(0, FH + top + 360, wallZ + 25); gr.add(art); fr.castShadow = false; } };
}

function showTimeline(led) {
  const t = { cut0: 0.9, cut1: 5.6, sep1: 6.8, flip1: 8.1, prt1: 11.3, asm1: 14.1 }; t.led1 = t.asm1 + (led ? 1.7 : 0.7); t.c1 = t.led1 + 0.6; t.c2 = t.c1 + 6.2; t.end = t.c2 + 6.2; return t;
}
function showCaption(t, T) {
  const L = SH.L, bt = S.base.type;
  if (t < L.cut0) return ['שלב 1', `לוח פרספקס ${S.t} מ״מ`];
  if (t < L.sep1) return ['שלב 1', 'חיתוך לייזר לפי הצורה'];
  if (t < L.flip1) return ['שלב 2', 'ליטוש קצוות והיפוך לגב'];
  if (t < L.prt1) return ['שלב 3', 'הדפסת UV ישירה מאחור'];
  if (t < L.asm1) return ['שלב 4', bt === 'none' ? 'המוצר עומד בזכות עצמו' : bt === 'easel' ? 'חיבור רגל התמיכה' : bt === 'standoff' ? 'חיבור התושבות לקיר' : 'הרכבה בחריץ המעמד'];
  if (t < L.c1) return SH.led ? ['שלב 5', 'הדלקת תאורת LED'] : ['מוכן', 'המוצר המוגמר'];
  if (t < L.c2) return ['המוצר המוגמר', bt === 'standoff' ? 'על הקיר בחדר השינה' : 'על שולחן הלילה'];
  return ['המוצר המוגמר', bt === 'standoff' ? 'על הקיר בסלון' : 'על הארונית בסלון'];
}

function buildShow() {
  const { W, H, T, sd } = dims(), m = MATERIALS.find(x => x.id === S.mat) || MATERIALS[0];
  const D = Math.max(W, H, 120), bt = S.base.type, blk = isBlock(bt), led = ledOn(), y0 = pieceGroup.position.y, top = y0 + H;
  const bw = blk ? baseDims().bw : W, bd = blk ? baseDims().bd : 60;
  const g = new THREE.Group(); scene.add(g);
  const sx = W / sd.bb.w, sy = H / sd.bb.h, toV = ([x, y]) => new THREE.Vector2((x - sd.bb.x) * sx - W / 2, (sd.bb.y + sd.bb.h - y) * sy);
  const pivot = new THREE.Group(); scene.add(pivot); pivot.add(pieceGroup); pieceGroup.position.set(0, -H / 2, 0); pieceGroup.rotation.set(0, 0, 0); baseGroup.rotation.set(0, 0, 0);

  /* contour to cut: inner holes first, then the outline, at constant speed */
  const loops = []; sd.outers.forEach(o => o.holes.forEach(h => loops.push(h))); sd.outers.forEach(o => loops.push(o.p));
  const zc = T / 2 + 0.3, pos = [], cum = []; let total = 0;
  loops.forEach(l => { for (let i = 0; i < l.length; i++) { const a = toV(l[i]), b = toV(l[(i + 1) % l.length]); pos.push(a.x, a.y, zc, b.x, b.y, zc); total += a.distanceTo(b); cum.push(total); } });
  const cutGeo = new THREE.BufferGeometry(); cutGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cutGeo.setDrawRange(0, 0);
  const cutLine = new THREE.LineSegments(cutGeo, new THREE.LineBasicMaterial({ color: 0xff7a3a, transparent: true, depthTest: false })); cutLine.renderOrder = 12; pieceGroup.add(cutLine);

  /* the offcut: the sheet with the shape removed */
  const mg = Math.max(14, D * 0.07), fr = new THREE.Shape([new THREE.Vector2(-W / 2 - mg, -mg), new THREE.Vector2(W / 2 + mg, -mg), new THREE.Vector2(W / 2 + mg, H + mg), new THREE.Vector2(-W / 2 - mg, H + mg)]);
  sd.outers.forEach(o => fr.holes.push(new THREE.Path(o.p.map(toV))));
  const frGeo = new THREE.ExtrudeGeometry(fr, { depth: T, bevelEnabled: false, curveSegments: 4 }); frGeo.translate(0, 0, -T / 2);
  const frame = new THREE.Mesh(frGeo, acrylicMaterial(m, T)); pieceGroup.add(frame);

  /* laser bed, laser head, UV printer */
  const flatY = 6 + T / 2 + 0.3, bedW = W + mg * 2 + 160, bedD = H + mg * 2 + 160, bed = new THREE.Group(); g.add(bed);
  const ht = honeyTex(); ht.repeat.set(bedW / 210, bedD / 216);
  box(bed, bedW, 6, bedD, new THREE.MeshStandardMaterial({ map: ht, roughness: 0.6, metalness: 0.4 }), 0, 3, 0, false);
  const railM = new THREE.MeshPhysicalMaterial({ color: 0x9aa0a8, metalness: 1, roughness: 0.35 });
  [-1, 1].forEach(s => box(bed, 22, 34, bedD + 40, railM, s * (bedW / 2 + 11), 17, 0));
  const laser = new THREE.Group(); g.add(laser);
  const gantry = box(laser, bedW + 44, 16, 24, new THREE.MeshPhysicalMaterial({ color: 0x2b2f38, metalness: 0.7, roughness: 0.35 }), 0, 0, 0);
  const head = box(laser, 36, 34, 36, new THREE.MeshPhysicalMaterial({ color: 0xd6dade, metalness: 0.8, roughness: 0.25 }), 0, 0, 0);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(9, 4, 16, 16), new THREE.MeshPhysicalMaterial({ color: 0x8a6a2a, metalness: 1, roughness: 0.3 })); laser.add(nozzle);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1, 8), new THREE.MeshBasicMaterial({ color: 0xff4a24, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); laser.add(beam);
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xffb070, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); spark.scale.setScalar(Math.max(16, D * 0.09)); laser.add(spark);
  const sparkL = new THREE.PointLight(0xff7a30, 0, 0, 2); g.add(sparkL);
  const printer = new THREE.Group(); g.add(printer);
  box(printer, 34, 26, bedD + 40, new THREE.MeshPhysicalMaterial({ color: 0x2b2f38, metalness: 0.7, roughness: 0.35 }), 0, 0, 0);
  box(printer, 44, 30, 70, new THREE.MeshPhysicalMaterial({ color: 0xe8eaee, metalness: 0.2, roughness: 0.3 }), 0, -4, 0);
  const uv = box(printer, 8, 4, H + 20, new THREE.MeshBasicMaterial({ color: 0x9a7bff }), 26, -12, 0, false);
  const uvL = new THREE.PointLight(0x8f6bff, 0, 0, 2); g.add(uvL);

  /* print layers are revealed by a moving clip plane as the head passes */
  const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -1e5);
  ['front', 'back', 'backw', 'engrave', 'mirror'].forEach(k => { planes[k].material.clippingPlanes = [clip]; planes[k].material.needsUpdate = true; });
  renderer.localClippingEnabled = true; planes.guide.visible = false; blob.visible = false;

  /* rooms */
  const rooms = [buildNightstand(bw, bd), buildCabinet(bw, bd)]; rooms[1].addArt(top);
  rooms.forEach(r => { r.gr.visible = false; g.add(r.gr); });
  const hemi = scene.children.find(o => o.isHemisphereLight), dirs = scene.children.filter(o => o.isDirectionalLight), key = dirs.find(o => o.castShadow), rim = dirs.find(o => !o.castShadow);
  const orig = { hemi: hemi.intensity, key: key.intensity, rim: rim.intensity, keyPos: key.position.clone(), exp: renderer.toneMappingExposure, led: ledLight.intensity, ledPos: ledLight.position.clone(), eng: planes.engrave.material.emissiveIntensity };
  ledLight.intensity = 0; planes.engrave.material.emissiveIntensity = 0; scene.fog = null;

  SH = { pz: isTray(S.base.type) ? trayDims(W, T).pz : 0, g, pivot, cutLine, cutGeo, cum, total, pos, frame, bed, laser, gantry, head, nozzle, beam, spark, sparkL, printer, uv, uvL, clip, rooms, hemi, key, rim, orig,
    W, H, T, D, mg, y0, top, flatY, bedW, bedD, bt, led, L: showTimeline(led), zc, room: -1, t0: performance.now(), rec: null, chunks: null };
}

function pathPoint(d) {
  const { cum, pos } = SH; let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < d) lo = mid + 1; else hi = mid; }
  const prev = lo ? cum[lo - 1] : 0, f = (d - prev) / ((cum[lo] - prev) || 1), i = lo * 6;
  return { i: lo, v: new THREE.Vector3(mix(pos[i], pos[i + 3], f), mix(pos[i + 1], pos[i + 4], f), pos[i + 2]) };
}
function setRoom(k) {
  if (SH.room === k) return; SH.room = k;
  const { rooms, hemi, key, rim, orig } = SH;
  rooms.forEach((r, i) => { r.gr.visible = i === k; if (r.lamp) r.lamp.intensity = i === k ? r.lampI : 0; });
  SH.bed.visible = k < 0; backdrop.visible = k < 0;
  const solo = SH.bt === 'standoff' && baseGroup.children[0]; if (solo) solo.visible = k < 0;
  scene.environment = k >= 0 && rooms[k].night ? nightEnv() : envTex;
  if (k < 0) { applyTheme(); scene.fog = null; hemi.intensity = orig.hemi; key.intensity = orig.key; rim.intensity = orig.rim; key.position.copy(orig.keyPos); key.target.position.set(0, 0, 0); renderer.toneMappingExposure = orig.exp; }
  else { const r = rooms[k]; scene.background = new THREE.Color(r.bg); floorMat.color.set(r.floor); hemi.intensity = orig.hemi * r.light[0]; key.intensity = orig.key * r.light[1]; rim.intensity = orig.rim * r.light[2]; key.target.position.set(0, r.FH, 0); key.position.copy(orig.keyPos).add(new THREE.Vector3(0, r.FH, 0)); renderer.toneMappingExposure = r.exp; }
  key.target.updateMatrixWorld();
}
function placeProduct(dy, dz) {
  baseGroup.position.set(0, dy, dz); SH.pivot.position.set(0, SH.y0 + SH.H / 2 + dy, dz + SH.pz); SH.pivot.rotation.set(0, 0, 0);
  ledLight.position.copy(SH.orig.ledPos).add(new THREE.Vector3(0, dy, dz));
}

function showFrame(now) {
  if (!SH) return;
  const L = SH.L, t = Math.min((now - SH.t0) / 1000, L.end), { pivot, W, H, T, D, flatY, top } = SH;
  const roomK = t < L.c1 ? -1 : t < L.c2 ? 0 : 1; setRoom(roomK);
  let camP, camT;
  if (roomK < 0) {
    /* -------- workshop -------- */
    const cutP = span(t, L.cut0, L.cut1), cutting = t >= L.cut0 - 0.2 && t <= L.cut1 + 0.25;
    // pivot pose
    let rx = -Math.PI / 2, py = flatY;
    if (t >= L.cut1 && t < L.flip1) { const u = ezz(span(t, L.sep1 - 0.2, L.flip1)); rx = mix(-Math.PI / 2, Math.PI / 2, u); py = flatY + Math.sin(Math.PI * u) * (H / 2 + D * 0.15); }
    else if (t >= L.flip1 && t < L.prt1) rx = Math.PI / 2;
    else if (t >= L.prt1) {
      const a = ezz(span(t, L.prt1, L.prt1 + 1.4)), b = ezz(span(t, L.prt1 + 1.4, L.asm1)), finalY = SH.y0 + H / 2, hover = finalY + Math.max(30, D * 0.22);
      rx = mix(Math.PI / 2, 0, a); py = b > 0 ? mix(hover, finalY, b) : mix(flatY, hover, a);
    }
    pivot.rotation.set(rx, 0, 0); pivot.position.set(0, py, t >= L.prt1 ? SH.pz : 0);
    // cutting
    const d = cutP * SH.total, pp = pathPoint(Math.max(0.001, d)); SH.cutGeo.setDrawRange(0, cutP >= 1 ? SH.cum.length * 2 : pp.i * 2);
    SH.cutLine.material.opacity = t < L.cut1 ? 1 : 1 - span(t, L.cut1, L.sep1);
    SH.cutLine.visible = t < L.sep1;
    SH.frame.visible = t < L.sep1; SH.frame.position.x = ezz(span(t, L.cut1 + 0.1, L.sep1)) * (W + SH.mg * 2 + 60);
    pieceGroup.updateMatrixWorld(true);
    const wp = pp.v.clone().applyMatrix4(pieceGroup.matrixWorld), headY = flatY + T / 2 + 46, park = span(t, L.cut1, L.cut1 + 0.6);
    SH.laser.visible = t < L.sep1 + 0.2;
    const hx = cutting ? wp.x : mix(wp.x, -SH.bedW / 2 + 40, park), hz = cutting ? wp.z : mix(wp.z, -SH.bedD / 2 + 40, park);
    SH.head.position.set(hx, headY + 17, hz); SH.nozzle.position.set(hx, headY - 8, hz); SH.gantry.position.set(0, headY + 26, hz);
    const firing = cutting && cutP > 0 && cutP < 1, bl = headY - 16 - wp.y;
    SH.beam.visible = SH.spark.visible = firing; SH.beam.scale.set(1, Math.max(1, bl), 1); SH.beam.position.set(wp.x, wp.y + bl / 2, wp.z); SH.spark.position.copy(wp).y += 0.6;
    SH.sparkL.position.copy(wp).y += 8; SH.sparkL.intensity = firing ? 2200 * (0.75 + Math.random() * 0.5) : 0;
    // printing
    const pr = span(t, L.flip1 + 0.3, L.prt1 - 0.25), printing = t > L.flip1 && t < L.prt1, hx2 = mix(-W / 2 - 30, W / 2 + 30, pr);
    SH.clip.constant = t < L.flip1 ? -1e5 : t >= L.prt1 ? 1e5 : hx2 - 14;
    SH.printer.visible = printing; SH.printer.position.set(hx2, flatY + T / 2 + 30, 0); SH.uvL.position.set(hx2 + 26, flatY + T / 2 + 14, 0); SH.uvL.intensity = printing ? 1400 : 0;
    // base arrives, bed sinks
    const k = span(t, L.prt1, L.prt1 + 0.8); SH.bed.position.y = -k * 60; SH.bed.visible = k < 1;
    baseGroup.visible = t >= L.prt1; baseGroup.position.set(mix(-D * 1.8 - 200, 0, ezz(span(t, L.prt1 + 0.2, L.prt1 + 1.3))), 0, 0);
    const lf = SH.led ? ezz(span(t, L.asm1, L.led1)) : 0; ledLight.position.copy(SH.orig.ledPos); ledLight.intensity = SH.orig.led * lf; planes.engrave.material.emissiveIntensity = SH.orig.eng * lf;
    // camera: high over the bed, then a 3/4 product view
    const R = D * 1.6 + 220, a = mix(-0.32, 0.32, span(t, 0, L.prt1)), tY = Math.max(flatY, pivot.position.y);
    const bedP = new THREE.Vector3(Math.sin(a) * R * 0.8, tY + R * 0.9, Math.cos(a) * R * 0.8), bedT = new THREE.Vector3(0, tY, 0);
    const dist = camera.userData.dist || 600, oa = mix(-0.5, -0.2, span(t, L.prt1, L.c1)), dir = new THREE.Vector3(oa, 0.24, 0.86).normalize();
    const prodT = new THREE.Vector3(0, top / 2, 0), prodP = prodT.clone().addScaledVector(dir, dist * 0.95), u = ezz(span(t, L.prt1, L.prt1 + 1.8));
    camP = bedP.lerp(prodP, u); camT = bedT.lerp(prodT, u);
  } else {
    /* -------- at home -------- */
    const r = SH.rooms[roomK], wall = SH.bt === 'standoff', dy = wall ? r.FH + 260 : r.FH, dz = wall ? r.wallZ + T / 2 + 20 : 0;
    placeProduct(dy, dz); baseGroup.visible = true; SH.laser.visible = SH.printer.visible = false; SH.sparkL.intensity = SH.uvL.intensity = 0; SH.clip.constant = 1e5;
    if (SH.led) { ledLight.intensity = SH.orig.led; planes.engrave.material.emissiveIntensity = SH.orig.eng; }
    const S0 = Math.max(top, W, 200), p = roomK === 0 ? span(t, L.c1, L.c2) : span(t, L.c2, L.end), e = ezz(p);
    const ang = roomK === 0 ? mix(0.55, 0.12, e) : mix(-0.5, -0.08, e), dist = roomK === 0 ? mix(S0 * 2.6, S0 * 4.6, e) : mix(S0 * 5.2, S0 * 2.7, e), el = roomK === 0 ? mix(0.3, 0.2, e) : mix(0.16, 0.24, e);
    camT = new THREE.Vector3(0, dy + top * 0.42, dz); camP = camT.clone().add(new THREE.Vector3(Math.sin(ang), el, Math.cos(ang)).normalize().multiplyScalar(dist));
  }
  camera.position.copy(camP); camera.lookAt(camT);
  const fade = Math.max(1 - Math.min(1, t / 0.5), 1 - Math.min(1, Math.abs(t - L.c1) / 0.35), 1 - Math.min(1, Math.abs(t - L.c2) / 0.35));
  renderer.render(scene, camera);
  const [step, text] = showCaption(t);
  if (SH.capKey !== step + text) { SH.capKey = step + text; $('#capStep').textContent = step; $('#capText').textContent = text; }
  $('#showFade').style.opacity = fade.toFixed(3); $('#showProg').style.width = (t / L.end * 100).toFixed(1) + '%';
  if (SH.rc) { const g = SH.rg, w = SH.rc.width, h = SH.rc.height; g.drawImage(renderer.domElement, 0, 0, w, h);
    g.save(); g.direction = 'rtl'; g.textAlign = 'right'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = h * 0.02; g.fillStyle = 'rgba(255,255,255,.82)'; g.font = `600 ${Math.round(h * 0.024)}px Assistant, sans-serif`; g.fillText(step, w * 0.96, h * 0.07);
    g.fillStyle = '#fff'; g.font = `900 ${Math.round(h * 0.052)}px "Frank Ruhl Libre", serif`; g.fillText(text, w * 0.96, h * 0.07 + h * 0.06); g.restore();
    if (fade > 0.001) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, w, h); }
    if (now - SH.t0 > (L.end + 0.6) * 1000 && SH.rec && SH.rec.state === 'recording') SH.rec.stop(); }
}

function openShow() {
  if (!renderer || SH) return;
  $('#modalRoot').innerHTML = ''; toggleSpin(false); sel = null; drawPrint(); lastKey = ''; rebuildAll(); renderPanel();
  document.body.classList.add('showing'); resize();
  buildShow(); controls.enabled = false; frameHook = showFrame;
  $('#sSave').hidden = true; $('#showRec').hidden = true; $('#sRec720').disabled = $('#sRec1080').disabled = !(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream);
}
function closeShow() {
  if (!SH) return; if (SH.rec && SH.rec.state === 'recording') { SH.rec.onstop = null; SH.rec.stop(); }
  frameHook = null; const { g, pivot, cutLine, frame, orig, hemi, key, rim } = SH;
  scene.add(pieceGroup); pieceGroup.remove(cutLine); pieceGroup.remove(frame); disposeDeep(cutLine); disposeDeep(frame);
  scene.remove(pivot); scene.remove(g); disposeDeep(g);
  ['front', 'back', 'backw', 'engrave', 'mirror'].forEach(k => { planes[k].material.clippingPlanes = null; planes[k].material.needsUpdate = true; });
  renderer.localClippingEnabled = false; planes.guide.visible = true; backdrop.visible = true; baseGroup.visible = true; baseGroup.position.set(0, 0, 0);
  hemi.intensity = orig.hemi; key.intensity = orig.key; rim.intensity = orig.rim; key.position.copy(orig.keyPos); key.target.position.set(0, 0, 0); key.target.updateMatrixWorld(); renderer.toneMappingExposure = orig.exp;
  fixedSize = false; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  scene.environment = envTex; SH = null; document.body.classList.remove('showing'); controls.enabled = true; applyTheme(); lastKey = ''; rebuildAll(); resize(); scheduleDraw();
}
function replayShow() { if (!SH) return; SH.t0 = performance.now(); SH.room = -2; }
function recordShow(h) {
  if (!SH || (SH.rec && SH.rec.state === 'recording')) return;
  const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(x => MediaRecorder.isTypeSupported(x));
  if (!mime) { toast('הדפדפן הזה לא תומך בהקלטת וידאו. נסו Chrome או Edge.'); return; }
  const w = Math.round(h * 16 / 9); fixedSize = true; renderer.setPixelRatio(1); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  SH.rc = document.createElement('canvas'); SH.rc.width = w; SH.rc.height = h; SH.rg = SH.rc.getContext('2d');
  const chunks = [], rec = new MediaRecorder(SH.rc.captureStream(30), { mimeType: mime, videoBitsPerSecond: h >= 1080 ? 14e6 : 7e6 });
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    if (!SH) return; if (!chunks.length) { SH.rc = null; SH.rec = null; fixedSize = false; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); resize(); $('#showRec').hidden = true; $('#sRec720').disabled = $('#sRec1080').disabled = false; toast('ההקלטה לא הצליחה בדפדפן הזה. נסו Chrome או Edge במחשב.'); return; } SH.video = new Blob(chunks, { type: mime.split(';')[0] }); SH.ext = mime.includes('mp4') ? 'mp4' : 'webm'; SH.rc = null; SH.rec = null;
    fixedSize = false; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); resize();
    $('#showRec').hidden = true; $('#sRec720').disabled = $('#sRec1080').disabled = false; canSave().then(ok => { $('#sSave').hidden = !ok; toast(ok ? 'הסרטון מוכן. לחצו "שמירת הסרטון".' : 'השמירה לא זמינה בתצוגה הזו. פתחו את הקובץ העצמאי כדי לשמור.'); });
  };
  SH.rec = rec; $('#showRec').hidden = false; $('#sSave').hidden = true; $('#sRec720').disabled = $('#sRec1080').disabled = true;
  replayShow(); rec.start(500);
}
function saveShow() { if (SH && SH.video) saveFile('perspex-showcase-' + (S.shape || 'design') + '.' + SH.ext, SH.video); }
(function wireShow() {
  $('#sReplay').onclick = replayShow; $('#sClose').onclick = closeShow; $('#sSave').onclick = saveShow;
  $('#sRec720').onclick = () => recordShow(720); $('#sRec1080').onclick = () => recordShow(1080);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && SH) closeShow(); });
})();
