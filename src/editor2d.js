/* ===================== Full-screen 2D editor (flat, Canva-like) ===================== */
let ed2On = false, ed2Mir = false, ed2Z = 0, ed2Fit = 1, ed2Pan = [0, 0], ed2Act = null, ed2Guides = [], ed2Hover = null, ed2Ptrs = new Map(), ed2Off = null;
const ED_NOOP = () => {};
function ed2Geo() {
  const st = $('#e2Stage'), cw = st.clientWidth, ch = st.clientHeight, { W, H } = dims();
  ed2Fit = Math.max(0.05, Math.min((cw - 64) / W, (ch - 96) / H)); if (!ed2Z) ed2Z = ed2Fit;
  const z = ed2Z, ox = cw / 2 - W * z / 2 + ed2Pan[0], oy = ch / 2 - H * z / 2 + ed2Pan[1] + 8;
  return { cw, ch, W, H, z, ox, oy };
}
function e2S(G, u, v) { return [G.ox + (ed2Mir ? 1 - u : u) * G.W * G.z, G.oy + v * G.H * G.z]; }
function e2U(G, x, y) { let u = (x - G.ox) / (G.W * G.z); if (ed2Mir) u = 1 - u; return [u, (y - G.oy) / (G.H * G.z)]; }
/* box of an element in mm: centre, half extents, rotation */
function e2Box(G, id) { const b = boxes[id]; if (!b) return null; return { cx: (b.x0 + b.x1) / 2 * G.W, cy: (b.y0 + b.y1) / 2 * G.H, hw: b.hw * G.W, hh: b.hh * G.H, rot: b.rot, ax0: b.x0 * G.W, ax1: b.x1 * G.W, ay0: b.y0 * G.H, ay1: b.y1 * G.H }; }
function e2Pt(G, B, lx, ly) { const c = Math.cos(B.rot), s = Math.sin(B.rot); return e2S(G, (B.cx + lx * c - ly * s) / G.W, (B.cy + lx * s + ly * c) / G.H); }
function e2Local(G, B, x, y) { const [u, v] = e2U(G, x, y), dx = u * G.W - B.cx, dy = v * G.H - B.cy, c = Math.cos(-B.rot), s = Math.sin(-B.rot); return [dx * c - dy * s, dx * s + dy * c]; }
function e2Handles(G, B) {
  const p = 3 / G.z, w = B.hw + p, h = B.hh + p, r = { tl: e2Pt(G, B, -w, -h), tr: e2Pt(G, B, w, -h), bl: e2Pt(G, B, -w, h), br: e2Pt(G, B, w, h), rot: e2Pt(G, B, 0, -h - 26 / G.z), top: e2Pt(G, B, 0, -h) };
  return r;
}
function e2Pick(G, x, y) {
  for (let i = S.els.length - 1; i >= 0; i--) { const el = S.els[i]; if (el.hidden || el.locked) continue; const B = e2Box(G, el.id); if (!B) continue; const [lx, ly] = e2Local(G, B, x, y), pad = 4 / G.z; if (Math.abs(lx) <= B.hw + pad && Math.abs(ly) <= B.hh + pad) return el; }
  return null;
}

function ed2Draw() {
  if (!ed2On) return; const cv = $('#e2cv'), G = ed2Geo(), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(G.cw * dpr) || cv.height !== Math.round(G.ch * dpr)) { cv.width = Math.round(G.cw * dpr); cv.height = Math.round(G.ch * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, G.cw, G.ch);
  const dark = matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light' || document.documentElement.dataset.theme === 'dark';
  /* dotted work surface */
  g.fillStyle = dark ? '#151517' : '#f2f2f5'; g.fillRect(0, 0, G.cw, G.ch);
  g.fillStyle = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'; for (let x = 12; x < G.cw; x += 22) for (let y = 12; y < G.ch; y += 22) g.fillRect(x, y, 1.4, 1.4);
  const { sd } = dims(), m = MATERIALS.find(x => x.id === S.mat) || MATERIALS[0], pw = G.W * G.z, ph = G.H * G.z;
  /* the plate, rendered offscreen at device resolution */
  const ow = Math.max(4, Math.round(pw * dpr)), oh = Math.max(4, Math.round(ph * dpr));
  if (!ed2Off) ed2Off = document.createElement('canvas'); const o = ed2Off; o.width = ow; o.height = oh; const q = o.getContext('2d');
  if (m.kind === 'opaque' || m.kind === 'mirror') { q.fillStyle = m.col; q.fillRect(0, 0, ow, oh); }
  else { const t = Math.max(6, Math.round(9 * dpr)); for (let y = 0; y < oh; y += t) for (let x = 0; x < ow; x += t) { q.fillStyle = ((x / t + y / t) & 1) ? (dark ? '#2a2c31' : '#ffffff') : (dark ? '#232529' : '#eef0f3'); q.fillRect(x, y, t, t); }
    q.fillStyle = m.kind === 'clear' ? 'rgba(160,205,220,.18)' : m.kind === 'frost' ? 'rgba(255,255,255,.55)' : m.col + '55'; q.fillRect(0, 0, ow, oh); }
  q.save(); if (ed2Mir) { q.translate(ow, 0); q.scale(-1, 1); }
  const layers = ed2Mir ? ['backw', 'back'] : ['back', 'engrave', 'front', 'mirror'];
  layers.forEach(n => { const c = canv[n]; if (!c || !planes[n] || (!planes[n].visible && n !== 'front')) return; if (n === 'engrave') { const t = document.createElement('canvas'); t.width = ow; t.height = oh; const tg = t.getContext('2d'); tg.drawImage(c, 0, 0, ow, oh); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = dark ? '#c9d2dc' : '#8d99a8'; tg.fillRect(0, 0, ow, oh); q.drawImage(t, 0, 0); } else if (n === 'backw') { q.globalAlpha = 0.5; q.drawImage(c, 0, 0, ow, oh); q.globalAlpha = 1; } else q.drawImage(c, 0, 0, ow, oh); });
  q.restore();
  q.globalCompositeOperation = 'destination-in'; q.save(); if (ed2Mir) { q.translate(ow, 0); q.scale(-1, 1); } q.drawImage(sd.mask, 0, 0, ow, oh); q.restore(); q.globalCompositeOperation = 'source-over';
  g.save(); g.shadowColor = 'rgba(0,0,0,.16)'; g.shadowBlur = 28; g.shadowOffsetY = 10; g.drawImage(o, G.ox, G.oy, pw, ph); g.restore();
  /* laser cut line */
  g.save(); g.beginPath(); const bb = sd.bb;
  sd.outers.forEach(ou => [ou.p, ...ou.holes].forEach(pts => pts.forEach(([x, y], i) => { const [sx, sy] = e2S(G, (x - bb.x) / bb.w, (y - bb.y) / bb.h); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); })) );
  g.closePath(); g.strokeStyle = '#ff2d55'; g.lineWidth = 1.3; g.stroke(); g.restore();
  /* snap guides */
  g.save(); g.strokeStyle = '#ff2d92'; g.lineWidth = 1; g.setLineDash([5, 4]);
  ed2Guides.forEach(([ax, val]) => { g.beginPath(); if (ax === 'x') { const [sx] = e2S(G, val / G.W, 0); g.moveTo(sx, G.oy - 20); g.lineTo(sx, G.oy + ph + 20); } else { const [, sy] = e2S(G, 0, val / G.H); g.moveTo(G.ox - 20, sy); g.lineTo(G.ox + pw + 20, sy); } g.stroke(); });
  g.restore();
  /* hover + selection */
  const poly = (B, col, wdt, dash) => { const H_ = e2Handles(G, B); g.save(); g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath(); [H_.tl, H_.tr, H_.br, H_.bl].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke(); g.restore(); return H_; };
  if (ed2Hover && ed2Hover !== sel) { const B = e2Box(G, ed2Hover); if (B) poly(B, 'rgba(0,113,227,.55)', 1.2); }
  const B = sel && e2Box(G, sel), ctx = $('#e2Ctx');
  if (B) {
    const H_ = poly(B, '#0071e3', 1.6);
    g.save(); g.strokeStyle = '#0071e3'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...H_.top); g.lineTo(...H_.rot); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(H_.rot[0], H_.rot[1], 9, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = '#0071e3'; g.lineWidth = 1.6; g.beginPath(); g.arc(H_.rot[0], H_.rot[1], 4.2, -2.4, 1.6); g.stroke();
    [H_.tl, H_.tr, H_.bl, H_.br].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 6.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 1.6; g.stroke(); });
    g.restore();
    const ys = [H_.tl, H_.tr, H_.bl, H_.br].map(p => p[1]), xs = [H_.tl, H_.tr, H_.bl, H_.br].map(p => p[0]);
    const lab = `${Math.round(B.hw * 2)} × ${Math.round(B.hh * 2)} מ״מ${(selEl() || {}).rot ? ' · ' + Math.round(selEl().rot) + '°' : ''}`;
    g.save(); g.font = '600 12px ' + cssVar('--f-ui'); g.direction = 'rtl'; const tw = g.measureText(lab).width + 16, lx = (Math.min(...xs) + Math.max(...xs)) / 2, ly = Math.max(...ys) + 18;
    g.fillStyle = 'rgba(29,29,31,.86)'; rrPath(g, lx - tw / 2, ly - 11, tw, 22, 11); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, lx, ly + 0.5); g.restore();
    if (!ed2Act || ed2Act.kind === 'none') { ctx.hidden = false; const el = selEl(); ctx.querySelector('[data-e2="text"]').hidden = !el || el.type !== 'text'; const r = ctx.getBoundingClientRect(); let top = Math.min(...ys) - r.height - 18; if (top < 8) top = Math.max(...ys) + 36; ctx.style.left = clamp(lx - r.width / 2, 8, G.cw - r.width - 8) + 'px'; ctx.style.top = clamp(top, 8, G.ch - r.height - 8) + 'px'; }
    else ctx.hidden = true;
  } else ctx.hidden = true;
  $('#e2ZoomV').textContent = Math.round(ed2Z / ed2Fit * 100) + '%';
  $('#e2Dims').textContent = `${Math.round(G.W)} × ${Math.round(G.H)} מ״מ · ${S.t} מ״מ עובי`;
  $('#e2Mir').setAttribute('aria-pressed', ed2Mir); $('#e2MirNote').hidden = !ed2Mir;
}

/* ---------- pointer ---------- */
function e2Pos(e) { const r = $('#e2cv').getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function e2Down(e) {
  if (ed2Edit) e2EndText();
  const cv = $('#e2cv'); cv.setPointerCapture(e.pointerId); ed2Ptrs.set(e.pointerId, e2Pos(e));
  if (ed2Ptrs.size === 2) { const [a, b] = [...ed2Ptrs.values()]; ed2Act = { kind: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]), z0: ed2Z }; return; }
  const G = ed2Geo(), [x, y] = e2Pos(e), B = sel && e2Box(G, sel), el = selEl();
  if (B && el) {
    const H_ = e2Handles(G, B), near = p => Math.hypot(p[0] - x, p[1] - y) < 14;
    if (near(H_.rot)) { const [u, v] = e2U(G, x, y); ed2Act = { kind: 'rot', el, a0: Math.atan2(v * G.H - B.cy, u * G.W - B.cx), r0: el.rot || 0 }; return; }
    for (const k of ['tl', 'tr', 'bl', 'br']) if (near(H_[k])) { const [u, v] = e2U(G, x, y); ed2Act = { kind: 'scale', el, d0: Math.hypot(u * G.W - B.cx, v * G.H - B.cy), s0: el.s }; return; }
  }
  const hit = e2Pick(G, x, y);
  if (hit) { const [u, v] = e2U(G, x, y); if (sel !== hit.id) { sel = hit.id; if (tab !== 'design') tab = 'design'; renderPanel(); } ed2Act = { kind: 'move', el: hit, ou: hit.fx - u, ov: hit.fy - v, moved: false }; scheduleDraw(); return; }
  if (sel) { sel = null; renderPanel(); }
  ed2Act = { kind: 'pan', x0: x, y0: y, p0: ed2Pan.slice() }; scheduleDraw();
}
function e2Move(e) {
  const P = e2Pos(e); if (ed2Ptrs.has(e.pointerId)) ed2Ptrs.set(e.pointerId, P);
  const G = ed2Geo(), [x, y] = P;
  if (!ed2Act) { const h = e2Pick(G, x, y), id = h ? h.id : null; if (id !== ed2Hover) { ed2Hover = id; ed2Draw(); } $('#e2cv').style.cursor = h ? 'move' : 'default'; return; }
  const A = ed2Act, [u, v] = e2U(G, x, y);
  if (A.kind === 'pinch' && ed2Ptrs.size === 2) { const [a, b] = [...ed2Ptrs.values()]; ed2Zoom(A.z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / A.d0, true); return; }
  if (A.kind === 'pan') { if (ed2Z <= ed2Fit * 1.02) return; const lim = [G.W * G.z / 2, G.H * G.z / 2]; ed2Pan = [clamp(A.p0[0] + x - A.x0, -lim[0], lim[0]), clamp(A.p0[1] + y - A.y0, -lim[1], lim[1])]; ed2Draw(); return; }
  const el = A.el, B = e2Box(G, el.id); if (!B) return;
  if (A.kind === 'move') {
    let fx = clamp(u + A.ou, 0, 1), fy = clamp(v + A.ov, 0, 1); A.moved = true;
    /* snap to plate centre, edges of other elements and their centres (6px) */
    const thr = 6 / G.z, ex = (B.ax1 - B.ax0) / 2, ey = (B.ay1 - B.ay0) / 2, cx = fx * G.W, cy = fy * G.H, tx = [G.W / 2], ty = [G.H / 2]; ed2Guides = [];
    S.els.forEach(o => { if (o === el || o.hidden) return; const b = e2Box(G, o.id); if (!b) return; tx.push(b.cx, b.ax0, b.ax1); ty.push(b.cy, b.ay0, b.ay1); });
    const snap = (c, e_, ts, ax) => { let best = null; [[c, 0], [c - e_, e_], [c + e_, -e_]].forEach(([p, off]) => ts.forEach(t => { const d = Math.abs(p - t); if (d < thr && (!best || d < best.d)) best = { d, c: t + off, t }; })); if (best) { ed2Guides.push([ax, best.t]); return best.c; } return c; };
    const nx = snap(cx, ex, tx, 'x'), ny = snap(cy, ey, ty, 'y'); el.fx = nx / G.W; el.fy = ny / G.H;
  } else if (A.kind === 'scale') {
    const d = Math.hypot(u * G.W - B.cx, v * G.H - B.cy); el.s = clamp(A.s0 * d / Math.max(1, A.d0), 0.008, 1.6);
  } else if (A.kind === 'rot') {
    let r = A.r0 + (Math.atan2(v * G.H - B.cy, u * G.W - B.cx) - A.a0) * 180 / Math.PI; if (ed2Mir) r = A.r0 - (r - A.r0);
    r = ((r % 360) + 540) % 360 - 180; const sn = Math.round(r / 15) * 15; if (Math.abs(r - sn) < 4 && !e.shiftKey) r = sn; el.rot = Math.round(r * 10) / 10;
  }
  scheduleDraw();
}
function e2Up(e) {
  ed2Ptrs.delete(e.pointerId); const A = ed2Act; if (!A) return;
  if (A.kind === 'pinch') { if (ed2Ptrs.size < 2) ed2Act = null; return; }
  ed2Act = null; ed2Guides = [];
  if (A.kind === 'move' || A.kind === 'scale' || A.kind === 'rot') { if (A.kind !== 'move' || A.moved) { store.set('ps-design', S); histSoon(); } renderPanel(); }
  scheduleDraw();
}
function ed2Zoom(z, keep) { ed2Z = clamp(z, ed2Fit * 0.6, ed2Fit * 5); if (ed2Z <= ed2Fit * 1.02) ed2Pan = [0, 0]; ed2Draw(); }
function e2Wheel(e) { e.preventDefault(); ed2Zoom(ed2Z * Math.exp(-e.deltaY * 0.0015)); }

/* ---------- inline text editing (double-click a text) ---------- */
let ed2Edit = null;
function e2StartText(el) {
  const G = ed2Geo(), B = e2Box(G, el.id); if (!B) return; const ta = $('#e2Text'), [cx, cy] = e2S(G, B.cx / G.W, B.cy / G.H);
  ed2Edit = el; ta.hidden = false; ta.value = el.text; const fs = Math.max(14, el.s * G.W * G.z);
  Object.assign(ta.style, { left: cx - Math.max(160, B.hw * G.z + 20) + 'px', top: cy - Math.max(fs * 0.9, B.hh * G.z + 10) + 'px', width: Math.max(320, B.hw * 2 * G.z + 40) + 'px', height: Math.max(fs * 1.8, B.hh * 2 * G.z + 20) + 'px', fontSize: fs + 'px', fontFamily: `"${el.font}"`, fontWeight: el.weight, color: el.color, textAlign: el.align || 'center' });
  ta.focus(); ta.select();
}
function e2EndText() { if (!ed2Edit) return; ed2Edit = null; $('#e2Text').hidden = true; renderPanel(); store.set('ps-design', S); histSoon(); }

/* ---------- open / close ---------- */
function openEd2() {
  if (document.body.classList.contains('showing')) return; ed2On = true; ed2Z = 0; ed2Pan = [0, 0];
  const ov = $('#ed2'); ov.hidden = false; $('#e2Side').appendChild($('aside.panel'));
  if (!frameHook) frameHook = ED_NOOP; if (tab === 'shape') { tab = 'design'; } renderPanel(); document.body.classList.add('ed2open'); if (innerWidth <= 900) e2SetDrawer(false); e2Props();
  requestAnimationFrame(() => { ed2Geo(); drawPrint(); });
}
function closeEd2() {
  e2EndText(); ed2On = false; $('#ed2').hidden = true; $('.main').insertBefore($('aside.panel'), $('#stage')); document.body.classList.remove('ed2open');
  if (frameHook === ED_NOOP) frameHook = null; if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  resize(); scheduleDraw(); renderPanel();
}
function ed2Cmd(c) {
  const el = selEl();
  if (c === 'close') closeEd2();
  else if (c === 'zin') ed2Zoom(ed2Z * 1.25); else if (c === 'zout') ed2Zoom(ed2Z / 1.25); else if (c === 'fit') { ed2Pan = [0, 0]; ed2Zoom(ed2Fit); }
  else if (c === 'mir') { ed2Mir = !ed2Mir; ed2Draw(); }
  else if (c === 'full') { const ov = $('#ed2'); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else if (ov.requestFullscreen) ov.requestFullscreen().catch(() => toast('הדפדפן לא מאפשר מסך מלא כאן. העורך כבר פרוש על כל החלון.')); else toast('העורך כבר פרוש על כל החלון.'); }
  else if (c === 'undo') undo(-1); else if (c === 'redo') undo(1);
  else if (c === 'addText') { const t = T_('טקסט חדש', { fy: 0.5, s: 0.08 }); S.els.push(t); sel = t.id; tab = 'design'; changed(); renderPanel(); setTimeout(() => e2StartText(t), 60); }
  else if (c === 'addIcon') { tab = 'lib'; libTab = 'free'; e2SetDrawer(true); renderPanel(); }
  else if (c === 'drawer') e2SetDrawer(!ed2Drawer);
  else if (c === 'addFx') openMemorialFx();
  else if (c === 'png') { const src = canv.back, o = document.createElement('canvas'); o.width = src.width; o.height = src.height; const g = o.getContext('2d'); g.translate(o.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); o.toBlob(b => saveFile('uv-back-print-mirrored.png', b), 'image/png'); }
  else if (!el) return;
  else if (c === 'text') e2StartText(el);
  else if (c === 'dup') { const d = Object.assign({}, el, { id: uid(), fx: clamp(el.fx + 0.04, 0, 1), fy: clamp(el.fy + 0.04, 0, 1) }); S.els.push(d); sel = d.id; changed(); renderPanel(); }
  else if (c === 'del') { S.els = S.els.filter(x => x !== el); sel = null; changed(); renderPanel(); }
  else if (c === 'up' || c === 'down') { const i = S.els.indexOf(el), j = clamp(i + (c === 'up' ? 1 : -1), 0, S.els.length - 1); S.els.splice(i, 1); S.els.splice(j, 0, el); changed(); renderPanel(); }
  else if (c === 'center') { el.fx = 0.5; changed(); }
  else if (c === 'rot0') { el.rot = 0; changed(); }
}
function initEd2() {
  const cv = $('#e2cv');
  cv.addEventListener('pointerdown', e2Down); cv.addEventListener('pointermove', e2Move); cv.addEventListener('pointerup', e2Up); cv.addEventListener('pointercancel', e2Up);
  cv.addEventListener('pointerleave', () => { if (ed2Hover && !ed2Act) { ed2Hover = null; ed2Draw(); } });
  cv.addEventListener('wheel', e2Wheel, { passive: false });
  cv.addEventListener('dblclick', e => { const G = ed2Geo(), h = e2Pick(G, ...e2Pos(e)); if (h && h.type === 'text') e2StartText(h); });
  $('#ed2').addEventListener('click', e => { const b = e.target.closest('[data-e2]'); if (b) ed2Cmd(b.dataset.e2); });
  const ta = $('#e2Text');
  ta.addEventListener('input', () => { if (ed2Edit) { ed2Edit.text = ta.value; scheduleDraw(); } });
  ta.addEventListener('blur', e2EndText);
  ta.addEventListener('keydown', e => { if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); ta.blur(); } });
  $('#e2Img').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; readFile(f, src => shrinkImage(src, 1400, s2 => { const im = { id: uid(), type: 'image', src: s2, s: 0.4, fin: 'back', fx: 0.5, fy: 0.5, rot: 0, mono: false, color: '#1c2c5b' }; S.els.push(im); sel = im.id; tab = 'design'; changed(); renderPanel(); })); e.target.value = ''; });
  new ResizeObserver(() => { if (ed2On) { const f = ed2Z / (ed2Fit || 1); ed2Z = 0; ed2Geo(); ed2Z = ed2Fit * f; ed2Draw(); } }).observe($('#e2Stage'));
  document.addEventListener('keydown', e => { if (ed2On && e.key === 'Escape' && !ed2Edit && !$('#modalRoot').children.length) closeEd2(); });
  $('#b2D').onclick = openEd2; initE2Props();
}

/* ---------- Canva-style properties sidebar (right side) ---------- */
const E2_SW = ['#1c2c5b', '#0038b8', '#111827', '#ffffff', '#b8862b', '#d6b046', '#7a1f2b', '#c0392b', '#2f6b4f', '#5a3d22', '#6e6e73', '#8e44ad'];
let ed2Drawer = true;
function e2Swatches(cur, key) { return `<div class="e2sw">${E2_SW.map(c => `<button data-pc="${key}" data-v="${c}" style="background:${c}" aria-label="צבע ${c}" aria-pressed="${(cur || '').toLowerCase() === c}"></button>`).join('')}<label class="e2swc" title="צבע אחר"><input type="color" data-p="${key}" value="${cur || '#1c2c5b'}" aria-label="בחירת צבע"></label></div>`; }
function e2Props() {
  const box = $('#e2Props'); if (!box || !ed2On) return; if (box.contains(document.activeElement) && document.activeElement.matches('textarea,input[type=text]')) return;
  const e = selEl(), W = dims().W, mm = v => Math.round(v * W);
  if (!e) {
    const { W: w, H } = dims(), m = MATERIALS.find(x => x.id === S.mat) || MATERIALS[0];
    box.innerHTML = `<div class="e2ph"><b>הלוח</b></div>
      <div class="e2pc"><div class="e2kv"><span>מידות</span><b>${Math.round(w)} × ${Math.round(H)} מ״מ</b></div><div class="e2kv"><span>עובי</span><b>${S.t} מ״מ</b></div><div class="e2kv"><span>חומר</span><b>${m.n}</b></div>
      <p class="hint">בחרו פריט על הלוח כדי לערוך אותו כאן: גופן, גודל, צבע, יישור וגימור.</p></div>
      <div class="e2pc"><h4>שכבות</h4><div class="e2layers">${S.els.slice().reverse().map(x => `<button data-pa="sel" data-v="${x.id}"><span>${esc(elLabel(x))}</span><small>${FIN[finOf(x)]}</small></button>`).join('') || '<p class="hint">אין עדיין פריטים.</p>'}</div></div>`;
    return;
  }
  let h = `<div class="e2ph"><b>${esc(elLabel(e))}</b><button class="e2x" data-pa="desel" aria-label="סגירה" title="סגירה">✕</button></div>`;
  if (e.type === 'text') h += `<div class="e2pc"><textarea data-p="text" dir="rtl" rows="2" aria-label="טקסט">${esc(e.text)}</textarea></div>
    <div class="e2pc"><h4>גופן</h4><div class="e2fonts">${FONTS.map(([f, n]) => `<button data-pa="font" data-v="${f}" aria-pressed="${e.font === f}" style="font-family:'${f}'">${n}</button>`).join('')}</div></div>
    <div class="e2pc"><h4>גודל אות</h4><div class="e2step"><button data-pa="sz" data-v="-1" aria-label="הקטנה">−</button><input type="number" data-p="mm" value="${mm(e.s)}" min="2" max="300" aria-label="גובה אות במ״מ"><span>מ״מ</span><button data-pa="sz" data-v="1" aria-label="הגדלה">+</button></div>
      <div class="e2seg">${[[400, 'רגיל'], [700, 'מודגש'], [900, 'שחור']].map(([w, n]) => `<button data-pa="weight" data-v="${w}" aria-pressed="${+e.weight === w}">${n}</button>`).join('')}</div>
      <div class="e2seg">${[['right', 'ימין'], ['center', 'מרכז'], ['left', 'שמאל']].map(([a, n]) => `<button data-pa="align" data-v="${a}" aria-pressed="${(e.align || 'center') === a}">${n}</button>`).join('')}</div></div>
    <div class="e2pc"><h4>צבע</h4>${e2Swatches(e.color, 'color')}</div>
    <div class="e2pc"><h4>קו מתאר</h4><input type="range" data-p="outline" min="0" max="3" step="0.1" value="${e.outline || 0}">${e.outline > 0 ? e2Swatches(e.ocolor, 'ocolor') : ''}
      <label class="e2chk"><input type="checkbox" data-p="plate" ${e.plate ? 'checked' : ''}> לוחית עם טקסט חלול</label></div>`;
  else {
    h += `<div class="e2pc"><h4>גודל</h4><div class="e2step"><button data-pa="sz" data-v="-2" aria-label="הקטנה">−</button><input type="number" data-p="mm" value="${mm(e.s)}" min="3" max="600" aria-label="רוחב במ״מ"><span>מ״מ רוחב</span><button data-pa="sz" data-v="2" aria-label="הגדלה">+</button></div></div>`;
    if (e.type === 'image') h += `<div class="e2pc"><button class="btn gold" data-pa="fx">✦ אפקט שחור־לבן להנצחה</button><label class="e2chk"><input type="checkbox" data-p="mono" ${e.mono ? 'checked' : ''}> צבע אחיד</label>${e.mono ? e2Swatches(e.color, 'color') : ''}</div>`;
    else if (e.type === 'badge') h += `<div class="e2pc"><input type="text" data-p="title" value="${esc(e.title)}" aria-label="שם בסמל"><input type="text" data-p="sub" value="${esc(e.sub || '')}" aria-label="שורה תחתונה"></div>`;
    else h += `<div class="e2pc"><h4>צבע</h4>${e2Swatches(e.color, 'color')}</div>`;
  }
  h += `<div class="e2pc"><h4>גימור</h4><div class="e2fin">${Object.entries(FIN).map(([k, n]) => `<button data-pa="fin" data-v="${k}" aria-pressed="${e.fin === k}">${n}</button>`).join('')}</div></div>
    <div class="e2pc"><h4>סיבוב <small>${Math.round(e.rot || 0)}°</small></h4><input type="range" data-p="rot" min="-180" max="180" step="1" value="${e.rot || 0}"></div>
    <div class="e2pc"><h4>מיקום ושכבה</h4><div class="e2grid">
      <button data-pa="aL">יישור לשמאל</button><button data-pa="aR">יישור לימין</button>
      <button data-pa="aT">יישור למעלה</button><button data-pa="aB">יישור למטה</button>
      <button data-pa="ch">מרכז אופקי</button><button data-pa="cv">מרכז אנכי</button>
      <button data-pa="up">שכבה קדימה</button><button data-pa="down">שכבה אחורה</button>
      <button data-pa="dup">שכפול</button><button data-pa="del" class="dng">מחיקה</button></div></div>`;
  box.innerHTML = h;
}
function e2PropClick(ev) {
  const b = ev.target.closest('button'); if (!b) return; const a = b.dataset.pa, pc = b.dataset.pc, v = b.dataset.v, el = selEl();
  if (a === 'sel') { sel = v; tab = 'design'; renderPanel(); scheduleDraw(); return; }
  if (a === 'desel') { sel = null; renderPanel(); scheduleDraw(); return; }
  if (!el) return; const W = dims().W;
  if (pc) { el[pc] = v; changed(); }
  else if (a === 'font') { el.font = v; changed(); }
  else if (a === 'sz') el.s = clamp(el.s + (+v) / W, 0.008, 1.6), changed();
  else if (a === 'weight') { el.weight = +v; changed(); }
  else if (a === 'align') { el.align = v; changed(); }
  else if (a === 'fin') { el.fin = v; changed(); }
  else if (a === 'fx') { openMemorialFx(el); return; }
  else if (a[0] === 'a' && a.length === 2) { const b = boxes[el.id]; if (!b) return; if (a === 'aL') el.fx -= b.x0; else if (a === 'aR') el.fx += 1 - b.x1; else if (a === 'aT') el.fy -= b.y0; else el.fy += 1 - b.y1; changed(); }
  else if (a === 'ch') { el.fx = 0.5; changed(); } else if (a === 'cv') { el.fy = 0.5; changed(); }
  else if (a === 'up' || a === 'down' || a === 'dup' || a === 'del') { ed2Cmd(a); return; }
  renderPanel();
}
function e2PropInput(ev) {
  const t = ev.target, k = t.dataset.p, el = selEl(); if (!k || !el) return; const v = t.type === 'checkbox' ? t.checked : t.value, n = parseFloat(v);
  if (k === 'mm') { if (n > 0) { el.s = clamp(n / dims().W, 0.008, 1.6); changed(); } return; }
  if (k === 'rot' || k === 'outline') { el[k] = n; changed(); const s = t.parentElement.querySelector('h4 small'); if (s && k === 'rot') s.textContent = Math.round(n) + '°'; if (k === 'outline' && ev.type === 'change') renderPanel(); return; }
  if (k === 'mono' || k === 'plate') { el[k] = v; changed(); renderPanel(); return; }
  el[k] = v; changed();
  if (k === 'text' || k === 'title') { const L = $(`.layer[data-sel="${el.id}"] .t`); if (L) L.textContent = elLabel(el); }
}
function e2SetDrawer(on) { ed2Drawer = on; $('#ed2').classList.toggle('nodrawer', !on); $('#e2DrawerBtn').setAttribute('aria-pressed', on); requestAnimationFrame(ed2Draw); }
function initE2Props() {
  const p = $('#e2Props'); p.addEventListener('click', e2PropClick); p.addEventListener('input', e2PropInput); p.addEventListener('change', e2PropInput);
  p.addEventListener('focusout', () => setTimeout(() => { if (!p.contains(document.activeElement)) e2Props(); }, 0));
}
