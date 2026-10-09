/* ===== Shape library: 100 laser-cut silhouettes, drawn on canvas in a 100-unit-high design space ===== */
const TAU = Math.PI * 2, PI = Math.PI;
function P(g, pts, close = true) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); if (close) g.closePath(); }
function fp(g, pts) { P(g, pts); g.fill(); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); }
function rrPath(g, x, y, w, h, r = 0) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function rr(g, x, y, w, h, r = 0) { rrPath(g, x, y, w, h, r); g.fill(); }
function ngonPts(cx, cy, n, r, rot = -PI / 2) { const a = []; for (let i = 0; i < n; i++) { const t = rot + i * TAU / n; a.push(cx + Math.cos(t) * r, cy + Math.sin(t) * r); } return a; }
function ngon(g, cx, cy, n, r, rot) { fp(g, ngonPts(cx, cy, n, r, rot)); }
function starPts(cx, cy, n, ro, ri, rot = -PI / 2) { const a = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, t = rot + i * PI / n; a.push(cx + Math.cos(t) * r, cy + Math.sin(t) * r); } return a; }
function star(g, cx, cy, n, ro, ri, rot) { fp(g, starPts(cx, cy, n, ro, ri, rot)); }
function dstar(g, cx, cy, r) { ngon(g, cx, cy, 3, r, -PI / 2); ngon(g, cx, cy, 3, r, PI / 2); }
function dstarLine(g, cx, cy, r, lw, join = 'miter') { g.lineWidth = lw; g.lineJoin = join; g.miterLimit = 10; P(g, ngonPts(cx, cy, 3, r, -PI / 2)); g.stroke(); P(g, ngonPts(cx, cy, 3, r, PI / 2)); g.stroke(); }
function cut(g, fn) { g.save(); g.globalCompositeOperation = 'destination-out'; fn(); g.restore(); }
function sl(g, pts, lw, cap = 'round') { g.lineWidth = lw; g.lineCap = cap; g.lineJoin = 'round'; P(g, pts, false); g.stroke(); }
function heart(g, cx, cy, s) { const w = s / 2; g.beginPath(); g.moveTo(cx, cy + w * 0.95); g.bezierCurveTo(cx - w * 1.25, cy + w * 0.1, cx - w * 0.95, cy - w * 0.95, cx, cy - w * 0.45); g.bezierCurveTo(cx + w * 0.95, cy - w * 0.95, cx + w * 1.25, cy + w * 0.1, cx, cy + w * 0.95); g.fill(); }
function flame(g, cx, by, w, h) { g.beginPath(); g.moveTo(cx, by - h); g.bezierCurveTo(cx + w * 0.2, by - h * 0.6, cx + w / 2, by - h * 0.45, cx + w / 2, by - w / 2); g.arc(cx, by - w / 2, w / 2, 0, PI); g.bezierCurveTo(cx - w / 2, by - h * 0.45, cx - w * 0.2, by - h * 0.6, cx, by - h); g.fill(); }
function leaf(g, x, y, len, wid, ang) { ell(g, x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2, len / 2, wid / 2, ang); }
function branch(g, x0, y0, cx1, cy1, x1, y1, n, ll, lw, stem = 2.4) {
  g.lineWidth = stem; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx1, cy1, x1, y1); g.stroke();
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), u = 1 - t;
    const px = u * u * x0 + 2 * u * t * cx1 + t * t * x1, py = u * u * y0 + 2 * u * t * cy1 + t * t * y1;
    const dx = 2 * u * (cx1 - x0) + 2 * t * (x1 - cx1), dy = 2 * u * (cy1 - y0) + 2 * t * (y1 - cy1);
    const a = Math.atan2(dy, dx); leaf(g, px, py, ll, lw, a + (i % 2 ? 0.75 : -0.75));
  }
  leaf(g, x1, y1, ll, lw, Math.atan2(y1 - cy1, x1 - cx1));
}
function txt(g, str, cx, cy, size, fam, weight = 900) { g.font = `${weight} ${size}px "${fam}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText(str, cx, cy); }
/* Outline text: dilated contour with the letters cut out (a classic laser-cut word sign) */
function outlineText(g, str, W, fam = 'Frank Ruhl Libre', weight = 900, holes = true) {
  g.font = `${weight} 100px "${fam}"`; g.direction = 'rtl';
  const m = g.measureText(str); const size = Math.min(78, 100 * (W - 22) / Math.max(1, m.width));
  g.font = `${weight} ${size}px "${fam}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = Math.max(10, size * 0.32); g.strokeText(str, W / 2, 52); g.fillText(str, W / 2, 52);
  rr(g, 8, 52 + size * 0.28, W - 16, Math.max(7, size * 0.16), 4);
  if (holes) cut(g, () => g.fillText(str, W / 2, 52));
}
function drawMenorah(g, c, top, s, flames = true) {
  g.save(); g.translate(c, top); g.scale(s, s); g.lineCap = 'butt'; g.lineWidth = 4.5; g.strokeStyle = g.fillStyle;
  [13, 26, 39].forEach(r => { g.beginPath(); g.arc(0, 44, r, 0, PI); g.stroke(); rr(g, -r - 2.25, 16, 4.5, 28.5); rr(g, r - 2.25, 16, 4.5, 28.5); });
  rr(g, -2.5, 16, 5, 72);
  [-39, -26, -13, 0, 13, 26, 39].forEach(dx => { fp(g, [dx - 5, 10, dx + 5, 10, dx + 2.5, 17, dx - 2.5, 17]); if (flames) flame(g, dx, 11, 4.6, 10.5); });
  fp(g, [-6, 84, 6, 84, 14, 92, -14, 92]); rr(g, -22, 91.5, 44, 8.5, 2);
  g.restore();
}
function israelPts(W) {
  const ll = [[35.105, 33.09], [35.2, 33.08], [35.35, 33.07], [35.5, 33.1], [35.57, 33.28], [35.64, 33.25], [35.7, 33.26], [35.8, 33.33], [35.84, 33.2], [35.88, 32.95], [35.8, 32.75], [35.65, 32.69], [35.57, 32.62], [35.55, 32.4], [35.56, 32.2], [35.55, 31.9], [35.53, 31.75], [35.49, 31.45], [35.43, 31.2], [35.4, 31.08], [35.32, 30.85], [35.2, 30.5], [35.15, 30.25], [35.08, 29.95], [34.96, 29.55], [34.9, 29.49], [34.73, 29.95], [34.52, 30.4], [34.4, 30.8], [34.25, 31.22], [34.23, 31.31], [34.38, 31.45], [34.49, 31.59], [34.55, 31.67], [34.65, 31.82], [34.73, 31.98], [34.75, 32.06], [34.79, 32.15], [34.84, 32.3], [34.87, 32.4], [34.92, 32.55], [34.95, 32.7], [34.955, 32.825], [34.99, 32.83], [35.05, 32.86], [35.075, 32.93], [35.09, 33.0]];
  const k = 100 / (33.36 - 29.47), a = [];
  ll.forEach(([lo, la]) => a.push(2 + (lo - 34.21) * 0.853 * k, (33.36 - la) * k));
  return a;
}
function israelXY(lo, la) { const k = 100 / (33.36 - 29.47); return [2 + (lo - 34.21) * 0.853 * k, (33.36 - la) * k]; }
/* Moroccan frame: concave corners and an onion point on top, as on memorial and Shabbat stands */
function arabesque(g, W) { const c = W / 2; g.beginPath(); g.moveTo(0, 100); g.lineTo(0, 36); g.bezierCurveTo(12, 36, 15, 25, 15, 18); g.lineTo(c - 24, 18); g.bezierCurveTo(c - 12, 18, c - 9, 5, c, 0); g.bezierCurveTo(c + 9, 5, c + 12, 18, c + 24, 18); g.lineTo(W - 15, 18); g.bezierCurveTo(W - 15, 25, W - 12, 36, W, 36); g.lineTo(W, 100); g.closePath(); g.fill(); }
function arabesqueLine(g, W, t) { arabesque(g, W); cut(g, () => { g.save(); g.translate(W / 2, 50); g.scale((W - t * 2) / W, (100 - t * 2) / 100); g.translate(-W / 2, -50); arabesque(g, W); g.restore(); }); }
function candlestick(g, c, s) { ell(g, c, 97, 13 * s, 3); rr(g, c - 2.5, 66, 5, 31); fp(g, [c - 9 * s, 60, c + 9 * s, 60, c + 4, 68, c - 4, 68]); rr(g, c - 5 * s, 22, 10 * s, 39, 1); flame(g, c, 20, 9 * s, 19); }
function wavyFlag(g, W, holes) {
  const N = 40, top = [], bot = [];
  for (let i = 0; i <= N; i++) { const x = 6 + (W - 6) * i / N, s = Math.sin(i / N * TAU) * 5; top.push(x, 10 + s); bot.push(x, 88 + s); }
  const pts = top.slice(); for (let i = N; i >= 0; i--) pts.push(bot[i * 2], bot[i * 2 + 1]); fp(g, pts); rr(g, 0, 2, 6, 98, 2);
  if (!holes) return;
  cut(g, () => {
    [[19, 29], [69, 79]].forEach(([a, b]) => { const p = []; for (let i = 2; i <= N - 2; i++) { const x = 6 + (W - 6) * i / N, s = Math.sin(i / N * TAU) * 5; p.push(x, a + s); } for (let i = N - 2; i >= 2; i--) { const x = 6 + (W - 6) * i / N, s = Math.sin(i / N * TAU) * 5; p.push(x, b + s); } fp(g, p); });
    dstar(g, 6 + (W - 6) / 2, 49, 15);
  });
}

const CATS = [
  { id: 'all', name: 'הכל' }, { id: 'jewish', name: 'יהדות' }, { id: 'memorial', name: 'זיכרון ושבת' }, { id: 'israel', name: 'ישראל וציונות' },
  { id: 'idf', name: 'צבא וביטחון' }, { id: 'award', name: 'הוקרה ופרסים' }, { id: 'basic', name: 'גיאומטרי' }
];

const SHAPES = [
  /* ---------- יהדות ---------- */
  { id: 'dstar', n: 'מגן דוד', c: 'jewish', a: 0.87, d: (g, W) => dstar(g, W / 2, 50, 50) },
  { id: 'dstar-line', n: 'מגן דוד חלול', c: 'jewish', a: 0.87, d: (g, W) => dstarLine(g, W / 2, 52, 44, 9) },
  { id: 'dstar-circle', n: 'מגן דוד בעיגול', c: 'jewish', a: 1, d: (g, W) => { circ(g, 50, 50, 50); cut(g, () => dstar(g, 50, 50, 36)); } },
  { id: 'dstar-round', n: 'מגן דוד מעוגל', c: 'jewish', a: 0.87, d: (g, W) => { g.lineJoin = 'round'; g.lineWidth = 12; P(g, ngonPts(W / 2, 52, 3, 40, -PI / 2)); g.stroke(); g.fill(); P(g, ngonPts(W / 2, 48, 3, 40, PI / 2)); g.stroke(); g.fill(); } },
  { id: 'dstar-woven', n: 'מגן דוד שזור', c: 'jewish', a: 0.87, d: (g, W) => { dstarLine(g, W / 2, 52, 43, 6.5, 'round'); cut(g, () => dstar(g, W / 2, 52, 13)); } },
  { id: 'dstar-hex', n: 'מגן דוד במשושה', c: 'jewish', a: 1.15, d: (g, W) => { ngon(g, W / 2, 50, 6, 57, 0); cut(g, () => dstar(g, W / 2, 50, 38)); } },
  { id: 'menorah', n: 'מנורת המקדש', c: 'jewish', a: 0.95, d: (g, W) => drawMenorah(g, W / 2, 0, 1) },
  { id: 'menorah-olive', n: 'מנורה וענפי זית', c: 'jewish', a: 1.25, d: (g, W) => { drawMenorah(g, W / 2, 10, 0.86); branch(g, W / 2 - 14, 98, 6, 92, 14, 18, 9, 10, 4.6); branch(g, W / 2 + 14, 98, W - 6, 92, W - 14, 18, 9, 10, 4.6); rr(g, W / 2 - 30, 93, 60, 6, 3); } },
  { id: 'emblem', n: 'מגן עם מנורה', c: 'jewish', a: 0.8, d: (g, W) => { P(g, [3, 3, W - 3, 3, W - 3, 50], false); g.quadraticCurveTo(W - 3, 84, W / 2, 98); g.quadraticCurveTo(3, 84, 3, 50); g.closePath(); g.fill(); cut(g, () => drawMenorah(g, W / 2, 14, 0.62, false)); } },
  { id: 'hanukkiah', n: 'חנוכייה קלאסית', c: 'jewish', a: 1.02, d: (g, W) => {
    const c = W / 2; g.lineWidth = 4; g.lineCap = 'butt';
    [10, 20, 30, 40].forEach(r => { g.beginPath(); g.arc(c, 48, r, 0, PI); g.stroke(); rr(g, c - r - 2, 22, 4, 26.5); rr(g, c + r - 2, 22, 4, 26.5); });
    rr(g, c - 2.5, 10, 5, 76);
    [-40, -30, -20, -10, 10, 20, 30, 40].forEach(dx => { fp(g, [c + dx - 4.5, 17, c + dx + 4.5, 17, c + dx + 2, 23, c + dx - 2, 23]); flame(g, c + dx, 18, 4.2, 10); });
    fp(g, [c - 4.5, 5, c + 4.5, 5, c + 2, 11, c - 2, 11]); flame(g, c, 6, 4.2, 6.5);
    fp(g, [c - 6, 84, c + 6, 84, c + 14, 92, c - 14, 92]); rr(g, c - 24, 91.5, 48, 8.5, 2);
  } },
  { id: 'hanukkiah-row', n: 'חנוכייה ישרה', c: 'jewish', a: 1.5, d: (g, W) => {
    rr(g, 8, 58, W - 16, 8, 2);
    for (let i = 0; i < 9; i++) { const x = 15 + i * 15, sh = i === 4, top = sh ? 22 : 34; rr(g, x - 3.2, top, 6.4, 60 - top, 1.5); flame(g, x, top + 1, 5, 12); }
    fp(g, [W / 2 - 14, 64, W / 2 + 14, 64, W / 2 + 26, 92, W / 2 - 26, 92]); rr(g, W / 2 - 36, 91, 72, 9, 2);
  } },
  { id: 'hanukkiah-steps', n: 'חנוכייה מדורגת', c: 'jewish', a: 1.35, d: (g, W) => {
    for (let i = 0; i < 9; i++) { const x = 9 + i * 14, top = 26 + Math.abs(i - 4) * 6 - (i === 4 ? 8 : 0); rr(g, x - 7, top, 14, 90 - top); flame(g, x, top + 1, 6, 14); }
    rr(g, 0, 88, W, 10, 2);
  } },
  { id: 'candle', n: 'נר דולק', c: 'jewish', a: 0.5, d: (g, W) => { const c = W / 2; rr(g, c - 10, 36, 20, 54, 3); flame(g, c, 40, 15, 36); ell(g, c, 93, 22, 6); rr(g, c - 22, 92, 44, 6, 3); } },
  { id: 'tablets', n: 'לוחות הברית', c: 'jewish', a: 1, d: (g, W) => {
    [[3, 48], [49, 48]].forEach(([x, w]) => { g.beginPath(); g.moveTo(x, 100); g.lineTo(x, 24); g.arc(x + w / 2, 24, w / 2, PI, 0); g.lineTo(x + w, 100); g.closePath(); g.fill(); });
    cut(g, () => rr(g, 48.3, 10, 1.6, 74));
  } },
  { id: 'tablets-letters', n: 'לוחות עם אותיות', c: 'jewish', a: 1, d: (g, W) => {
    [[3, 48], [49, 48]].forEach(([x, w]) => { g.beginPath(); g.moveTo(x, 100); g.lineTo(x, 24); g.arc(x + w / 2, 24, w / 2, PI, 0); g.lineTo(x + w, 100); g.closePath(); g.fill(); });
    cut(g, () => { rr(g, 48.3, 10, 1.6, 74); const R = 'אבגדה', L = 'וזחטי'; for (let i = 0; i < 5; i++) { txt(g, R[i], 73, 30 + i * 14, 12, 'Frank Ruhl Libre', 700); txt(g, L[i], 27, 30 + i * 14, 12, 'Frank Ruhl Libre', 700); } });
  } },
  { id: 'torah', n: 'ספר תורה', c: 'jewish', a: 0.9, d: (g, W) => {
    [18, 72].forEach(x => { rr(g, x - 2.5, 0, 5, 100, 2.5); rr(g, x - 8, 10, 16, 80, 7); circ(g, x, 4, 4.5); circ(g, x, 96, 4.5); });
    rr(g, 20, 14, 50, 72); cut(g, () => { for (let i = 0; i < 6; i++) rr(g, 30, 24 + i * 9.5, 30, 2.2, 1); });
  } },
  { id: 'torah-crown', n: 'כתר תורה', c: 'jewish', a: 1, d: (g, W) => {
    fp(g, [12, 64, 12, 30, 27, 46, 38, 20, 50, 40, 62, 20, 73, 46, 88, 30, 88, 64]);
    [[12, 27], [38, 17], [62, 17], [88, 27]].forEach(([x, y]) => circ(g, x, y, 5)); circ(g, 50, 30, 6); rr(g, 46.5, 4, 7, 26); circ(g, 50, 6, 5);
    rr(g, 10, 62, 80, 16, 2); rr(g, 6, 78, 88, 12, 3); cut(g, () => dstar(g, 50, 70, 6.5));
  } },
  { id: 'kiddush', n: 'גביע קידוש', c: 'jewish', a: 0.62, d: (g, W) => {
    const c = W / 2; g.beginPath(); g.moveTo(c - 25, 4); g.lineTo(c + 25, 4); g.bezierCurveTo(c + 25, 40, c + 12, 52, c + 4, 54); g.lineTo(c - 4, 54); g.bezierCurveTo(c - 12, 52, c - 25, 40, c - 25, 4); g.fill();
    rr(g, c - 3.5, 50, 7, 34); ell(g, c, 66, 6, 4); fp(g, [c - 6, 82, c + 6, 82, c + 22, 94, c - 22, 94]); rr(g, c - 24, 93, 48, 6, 2);
    cut(g, () => dstar(g, c, 25, 11));
  } },
  { id: 'pomegranate', n: 'רימון', c: 'jewish', a: 0.85, d: (g, W) => { const c = W / 2; circ(g, c, 60, 38); fp(g, [c - 14, 28, c - 17, 6, c - 7, 16, c, 2, c + 7, 16, c + 17, 6, c + 14, 28]); } },
  { id: 'hamsa', n: 'חמסה', c: 'jewish', a: 0.8, d: (g, W) => {
    const c = W / 2; rr(g, c - 19, 16, 11, 44, 5.5); rr(g, c - 5.5, 6, 11, 50, 5.5); rr(g, c + 8, 16, 11, 44, 5.5);
    ell(g, 15, 54, 7, 17, -0.5); ell(g, W - 15, 54, 7, 17, 0.5); rr(g, c - 26, 40, 52, 30, 10); ell(g, c, 74, 27, 24);
  } },
  { id: 'hamsa-star', n: 'חמסה ומגן דוד', c: 'jewish', a: 0.8, d: (g, W) => {
    const c = W / 2; rr(g, c - 19, 16, 11, 44, 5.5); rr(g, c - 5.5, 6, 11, 50, 5.5); rr(g, c + 8, 16, 11, 44, 5.5);
    ell(g, 15, 54, 7, 17, -0.5); ell(g, W - 15, 54, 7, 17, 0.5); rr(g, c - 26, 40, 52, 30, 10); ell(g, c, 74, 27, 24);
    cut(g, () => dstar(g, c, 68, 14));
  } },
  { id: 'shofar', n: 'שופר', c: 'jewish', a: 1.8, d: (g, W) => {
    for (let i = 0; i <= 160; i++) { const t = i / 160, u = 1 - t; const x = u * u * u * 12 + 3 * u * u * t * 60 + 3 * u * t * t * 130 + t * t * t * 162, y = u * u * u * 20 + 3 * u * u * t * 100 + 3 * u * t * t * 96 + t * t * t * 30; circ(g, x, y, 3.5 + 13 * t * t); }
    ell(g, 162, 30, 12, 20, 0.5);
  } },
  { id: 'mezuzah', n: 'מזוזה', c: 'jewish', a: 0.3, d: (g, W) => { rr(g, 2, 2, W - 4, 96, 9); cut(g, () => txt(g, 'ש', W / 2, 24, 18, 'Frank Ruhl Libre', 900)); } },
  { id: 'tree-life', n: 'עץ החיים', c: 'jewish', a: 1, d: (g, W) => {
    fp(g, [43, 94, 57, 94, 54, 52, 46, 52]); rr(g, 24, 91, 52, 8, 4);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; circ(g, 50 + Math.cos(a) * 25, 36 + Math.sin(a) * 22, 14); } circ(g, 50, 36, 22);
    cut(g, () => { for (let i = 0; i < 5; i++) { const a = -PI / 2 + i / 5 * TAU; leaf(g, 50 + Math.cos(a) * 6, 36 + Math.sin(a) * 6, 13, 5, a); } });
  } },
  { id: 'wheat', n: 'שיבולת חיטה', c: 'jewish', a: 0.45, d: (g, W) => {
    const c = W / 2; sl(g, [c, 99, c, 38], 3.4);
    for (let i = 0; i < 7; i++) { const y = 16 + i * 7.5; ell(g, c - 5, y, 3.6, 7, -0.45); ell(g, c + 5, y, 3.6, 7, 0.45); sl(g, [c - 7, y - 5, c - 14, y - 16], 1.2); sl(g, [c + 7, y - 5, c + 14, y - 16], 1.2); }
    ell(g, c, 9, 3.4, 7.5); sl(g, [c, 3, c, -8], 1.2); leaf(g, c, 86, 30, 6, -2.2); leaf(g, c, 80, 30, 6, -0.9);
  } },
  { id: 'grapes', n: 'אשכול ענבים', c: 'jewish', a: 0.78, d: (g, W) => {
    const c = W / 2; [[4, 34], [3, 48], [2, 62], [1, 76]].forEach(([n, y]) => { for (let i = 0; i < n; i++) circ(g, c + (i - (n - 1) / 2) * 15, y, 8.6); });
    sl(g, [c, 26, c + 5, 6], 3.4); leaf(g, c + 4, 14, 26, 14, -0.3);
  } },
  { id: 'palm', n: 'עץ תמר', c: 'jewish', a: 0.95, d: (g, W) => {
    const c = W / 2; for (let i = 0; i <= 60; i++) { const t = i / 60, u = 1 - t, x = u * u * (c - 6) + 2 * u * t * (c - 10) + t * t * (c + 3), y = u * u * 99 + 2 * u * t * 70 + t * t * 34; circ(g, x, y, 5.6 - t * 2); }
    [-2.9, -2.45, -2.0, -1.55, -1.1, -0.65, -0.2].forEach(a => leaf(g, c + 3, 32, 40, 9, a + (Math.abs(a + 1.55) > 1 ? 0.25 * Math.sign(a + 1.55) : 0)));
    [[-5, 40], [0, 43], [5, 40], [10, 43]].forEach(([dx, y]) => circ(g, c + 3 + dx, y, 3.2));
    rr(g, c - 22, 93, 44, 7, 3);
  } },
  { id: 'arabesque', n: 'מסגרת מרוקאית', c: 'memorial', a: 1.25, d: (g, W) => arabesque(g, W) },
  { id: 'arabesque-tall', n: 'מרוקאית גבוהה', c: 'memorial', a: 0.78, d: (g, W) => arabesque(g, W) },
  { id: 'arabesque-line', n: 'מסגרת מרוקאית לקו', c: 'memorial', a: 1.25, d: (g, W) => arabesqueLine(g, W, 3.2) },
  { id: 'ner-neshama', n: 'נר נשמה', c: 'memorial', a: 0.5, d: (g, W) => { const c = W / 2; rr(g, c - 17, 42, 34, 55, 4); cut(g, () => rr(g, c - 12, 52, 24, 3)); flame(g, c, 40, 14, 38); } },
  { id: 'shabbat-candles', n: 'נרות שבת', c: 'memorial', a: 0.9, d: (g, W) => { candlestick(g, W * 0.28, 1); candlestick(g, W * 0.72, 1); } },
  { id: 'flame-dstar', n: 'להבה ומגן דוד', c: 'memorial', a: 0.66, d: (g, W) => { flame(g, W / 2, 100, W * 0.98, 100); cut(g, () => dstarLine(g, W / 2, 68, 14, 3.4)); } },
  { id: 'rose', n: 'ורד', c: 'memorial', a: 0.58, d: (g, W) => { const c = W / 2; circ(g, c, 22, 20); cut(g, () => { g.lineWidth = 2.2; g.beginPath(); g.arc(c, 22, 12, 0.3, 5.2); g.stroke(); g.beginPath(); g.arc(c + 2, 21, 6, 2, 7.5); g.stroke(); }); sl(g, [c, 40, c - 2, 70, c, 100], 4); leaf(g, c - 1, 66, 20, 9, -2.6); leaf(g, c, 80, 18, 8, -0.5); } },
  { id: 'tear-heart', n: 'לב ודמעה', c: 'memorial', a: 0.95, d: (g, W) => { heart(g, W / 2, 56, 88); cut(g, () => { g.beginPath(); g.moveTo(W / 2, 30); g.bezierCurveTo(W / 2 + 10, 46, W / 2 + 10, 58, W / 2, 60); g.bezierCurveTo(W / 2 - 10, 58, W / 2 - 10, 46, W / 2, 30); g.fill(); }); } },
  { id: 'yizkor', n: 'יזכור', c: 'memorial', a: 1.9, d: (g, W) => outlineText(g, 'יזכור', W) },
  { id: 'shabbat-word', n: 'שבת שלום', c: 'memorial', a: 2.6, d: (g, W) => outlineText(g, 'שבת שלום', W, 'Suez One', 400) },
  { id: 'chai', n: 'חי', c: 'jewish', a: 1.15, d: (g, W) => outlineText(g, 'חי', W) },
  { id: 'shalom', n: 'שלום', c: 'jewish', a: 2.1, d: (g, W) => outlineText(g, 'שלום', W) },
  { id: 'shield-star', n: 'מגן עם מגן דוד', c: 'jewish', a: 0.82, d: (g, W) => { P(g, [4, 4, W - 4, 4, W - 4, 46], false); g.quadraticCurveTo(W - 4, 82, W / 2, 98); g.quadraticCurveTo(4, 82, 4, 46); g.closePath(); g.fill(); cut(g, () => dstar(g, W / 2, 44, 22)); } },
  { id: 'apple', n: 'תפוח בדבש', c: 'jewish', a: 0.95, d: (g, W) => { circ(g, 33, 58, 30); circ(g, 62, 58, 30); ell(g, 47.5, 72, 30, 25); sl(g, [47.5, 32, 52, 12], 3.6); leaf(g, 51, 16, 22, 10, -0.5); } },
  { id: 'dove', n: 'יונת שלום', c: 'jewish', a: 1.3, d: (g, W) => {
    ell(g, 62, 58, 34, 17, -0.15); circ(g, 94, 40, 12); fp(g, [104, 36, 118, 41, 104, 46]); fp(g, [34, 56, 4, 44, 9, 60, 3, 74, 34, 68]);
    fp(g, [48, 52, 62, 6, 76, 2, 72, 22, 84, 14, 82, 34, 90, 46]); sl(g, [112, 44, 122, 64], 2); leaf(g, 116, 52, 11, 5, 0.3); leaf(g, 119, 58, 11, 5, -0.6); leaf(g, 122, 64, 11, 5, 1.2);
    cut(g, () => circ(g, 97, 37, 2));
  } },
  /* ---------- ישראל וציונות ---------- */
  { id: 'israel-map', n: 'מפת ישראל', c: 'israel', a: 0.38, d: (g, W) => fp(g, israelPts(W)) },
  { id: 'israel-map-star', n: 'מפה עם מגן דוד', c: 'israel', a: 0.38, d: (g, W) => { fp(g, israelPts(W)); const [x, y] = israelXY(34.88, 31.25); cut(g, () => dstar(g, x, y, 7)); } },
  { id: 'israel-map-heart', n: 'מפה עם לב', c: 'israel', a: 0.38, d: (g, W) => { fp(g, israelPts(W)); const [x, y] = israelXY(34.9, 31.3); cut(g, () => heart(g, x, y, 13)); } },
  { id: 'israel-map-base', n: 'מפה על פס', c: 'israel', a: 0.5, d: (g, W) => { g.save(); g.translate(6, 0); g.scale(0.9, 0.9); fp(g, israelPts(W)); g.restore(); rr(g, 0, 88, W, 12, 3); } },
  { id: 'flag', n: 'דגל ישראל', c: 'israel', a: 1.375, d: (g, W) => { rr(g, 0, 0, W, 100, 2); cut(g, () => { rr(g, 7, 12, W - 14, 12); rr(g, 7, 76, W - 14, 12); dstar(g, W / 2, 50, 20); }); } },
  { id: 'flag-wave', n: 'דגל מתנופף', c: 'israel', a: 1.45, d: (g, W) => wavyFlag(g, W, true) },
  { id: 'am-israel-chai', n: 'עם ישראל חי', c: 'israel', a: 3.4, d: (g, W) => outlineText(g, 'עם ישראל חי', W) },
  { id: 'jerusalem-word', n: 'ירושלים', c: 'israel', a: 2.7, d: (g, W) => outlineText(g, 'ירושלים', W) },
  { id: 'old-walls', n: 'חומות ירושלים', c: 'israel', a: 1.6, d: (g, W) => {
    rr(g, 0, 46, W, 54); for (let x = 0; x < W; x += 10) rr(g, x, 39, 6, 8);
    [18, 116].forEach(x => { rr(g, x, 22, 26, 30); for (let i = 0; i < 4; i++) rr(g, x + i * 7, 15, 4, 8); });
    rr(g, 62, 30, 36, 20); for (let i = 0; i < 5; i++) rr(g, 62 + i * 8, 24, 4, 7);
    cut(g, () => { g.beginPath(); g.moveTo(70, 100); g.lineTo(70, 72); g.arc(80, 72, 10, PI, 0); g.lineTo(90, 100); g.fill(); [26, 34, 124, 132].forEach(x => rr(g, x, 30, 3, 7, 1.5)); });
  } },
  { id: 'david-tower', n: 'מגדל דוד', c: 'israel', a: 0.5, d: (g, W) => {
    const c = W / 2; rr(g, 3, 64, W - 6, 36); rr(g, 12, 30, 26, 36); rr(g, 8, 27, 34, 5); rr(g, 15, 14, 20, 15); ell(g, c, 14, 10, 7); rr(g, c - 1.2, 0, 2.4, 9); circ(g, c, 2.5, 2.4);
    cut(g, () => { rr(g, c - 2.5, 40, 5, 12, 2.5); rr(g, c - 4, 76, 8, 14, 4); });
  } },
  { id: 'jaffa-gate', n: 'שער יפו', c: 'israel', a: 1, d: (g, W) => {
    rr(g, 5, 20, 90, 80); for (let i = 0; i < 8; i++) rr(g, 6 + i * 11.6, 11, 7, 10);
    cut(g, () => { g.beginPath(); g.moveTo(32, 100); g.lineTo(32, 60); g.arc(50, 60, 18, PI, 0); g.lineTo(68, 100); g.fill(); rr(g, 16, 34, 6, 11, 3); rr(g, 78, 34, 6, 11, 3); });
  } },
  { id: 'kotel', n: 'הכותל המערבי', c: 'israel', a: 1.5, d: (g, W) => {
    rr(g, 0, 10, W, 90); [[18, 10, 6], [52, 9, 5], [96, 10, 6], [128, 9, 5]].forEach(([x, y, r]) => circ(g, x, y, r));
    cut(g, () => { for (let j = 0; j < 7; j++) { const y = 15 + j * 12; for (let x = -12 * (j % 2); x < W; x += 24) { const x0 = Math.max(x + 1, 4), x1 = Math.min(x + 23, W - 4); if (x1 - x0 > 5) rr(g, x0, y, x1 - x0, 10, 1.5); } } });
  } },
  { id: 'windmill', n: 'טחנת הרוח', c: 'israel', a: 0.88, d: (g, W) => {
    const c = W / 2; fp(g, [c - 15, 100, c + 15, 100, c + 9, 42, c - 9, 42]); circ(g, c, 40, 11);
    for (let k = 0; k < 4; k++) { g.save(); g.translate(c, 38); g.rotate(PI / 4 + k * PI / 2); rr(g, 4, -5, 36, 10); g.restore(); } circ(g, c, 38, 5);
    cut(g, () => { g.save(); g.translate(c, 38); for (let k = 0; k < 4; k++) { g.save(); g.rotate(PI / 4 + k * PI / 2); for (let i = 0; i < 3; i++) rr(g, 10 + i * 10, -2.6, 7.5, 5.2); g.restore(); } g.restore(); rr(g, c - 5, 86, 10, 14, 5); });
  } },
  { id: 'sabra', n: 'צבר', c: 'israel', a: 0.9, d: (g, W) => { ell(g, 45, 66, 18, 24); ell(g, 28, 40, 13, 18, -0.5); ell(g, 62, 38, 13, 19, 0.4); ell(g, 45, 22, 10, 14); [[23, 24], [33, 22], [56, 19], [70, 22], [45, 8]].forEach(([x, y]) => circ(g, x, y, 4.2)); fp(g, [26, 86, 64, 86, 60, 100, 30, 100]); } },
  { id: 'anemone', n: 'כלנית', c: 'israel', a: 0.75, d: (g, W) => { const c = W / 2; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - PI / 2; ell(g, c + Math.cos(a) * 14, 30 + Math.sin(a) * 14, 13, 9, a); } sl(g, [c, 40, c, 99], 3.6); leaf(g, c, 82, 26, 7, -2.6); leaf(g, c, 74, 26, 7, -0.5); cut(g, () => circ(g, c, 30, 5)); } },
  { id: 'olive', n: 'ענף זית', c: 'israel', a: 1.6, d: (g, W) => { branch(g, 6, 74, 80, 20, W - 8, 46, 11, 18, 7, 3); [[52, 52], [92, 44], [118, 54]].forEach(([x, y]) => ell(g, x, y, 4.5, 6, 0.4)); } },
  { id: 'heart-star', n: 'לב ישראלי', c: 'israel', a: 1.12, d: (g, W) => { heart(g, W / 2, 50, 100); cut(g, () => dstar(g, W / 2, 42, 18)); } },
  { id: 'zion-rays', n: 'מגן דוד וקרניים', c: 'israel', a: 1, d: (g, W) => { for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; fp(g, [50 + Math.cos(a - 0.05) * 18, 50 + Math.sin(a - 0.05) * 18, 50 + Math.cos(a) * (i % 2 ? 42 : 50), 50 + Math.sin(a) * (i % 2 ? 42 : 50), 50 + Math.cos(a + 0.05) * 18, 50 + Math.sin(a + 0.05) * 18]); } circ(g, 50, 50, 33); cut(g, () => dstar(g, 50, 50, 25)); } },
  { id: 'knesset', n: 'בניין הכנסת', c: 'israel', a: 2, d: (g, W) => { rr(g, 8, 22, W - 16, 10); rr(g, 20, 30, W - 40, 54); rr(g, 10, 84, W - 20, 6); rr(g, 0, 90, W, 10); cut(g, () => { for (let i = 0; i < 10; i++) rr(g, 26.5 + i * 15.4, 38, 9, 40); }); } },
  { id: 'paratrooper', n: 'כנפיים', c: 'israel', a: 2.4, d: (g, W) => {
    const c = W / 2; circ(g, c, 42, 18);
    [1, -1].forEach(s => fp(g, [c + s * 12, 32, c + s * 112, 10, c + s * 102, 24, c + s * 114, 30, c + s * 98, 40, c + s * 110, 48, c + s * 90, 54, c + s * 98, 62, c + s * 62, 62, c + s * 12, 54]));
    cut(g, () => dstar(g, c, 42, 11));
  } },
  /* ---------- צבא וביטחון (סמלים מקוריים כלליים, לא סמלים רשמיים) ---------- */
  { id: 'dogtag', n: 'דיסקית', c: 'idf', a: 0.62, d: (g, W) => { rr(g, 2, 8, W - 4, 90, 26); cut(g, () => circ(g, W / 2, 20, 4.5)); sl(g, [W / 2, 20, W / 2 - 14, 0, W / 2 + 14, 0, W / 2, 20], 2.4); } },
  { id: 'beret', n: 'כומתה', c: 'idf', a: 1.7, d: (g, W) => { ell(g, 92, 50, 80, 34, -0.12); rr(g, 20, 62, 130, 18, 9); circ(g, 128, 22, 6); cut(g, () => star(g, 46, 66, 5, 7, 3)); } },
  { id: 'helmet', n: 'קסדה', c: 'idf', a: 1.25, d: (g, W) => { g.beginPath(); g.moveTo(6, 80); g.bezierCurveTo(6, 10, W - 6, 10, W - 6, 80); g.closePath(); g.fill(); rr(g, 0, 74, W, 12, 6); cut(g, () => { for (let i = 0; i < 4; i++) rr(g, 22 + i * 22, 44, 12, 3, 1.5); }); } },
  { id: 'tank', n: 'טנק', c: 'idf', a: 2.1, d: (g, W) => { rr(g, 8, 58, W - 16, 30, 15); fp(g, [24, 58, 40, 40, 150, 40, 176, 58]); rr(g, 64, 22, 64, 22, 8); rr(g, 120, 28, 82, 7, 3); cut(g, () => { for (let i = 0; i < 7; i++) circ(g, 30 + i * 25, 73, 7); }); } },
  { id: 'jet', n: 'מטוס קרב', c: 'idf', a: 1.15, d: (g, W) => { const c = W / 2; g.beginPath(); g.moveTo(c, 0); g.bezierCurveTo(c + 7, 14, c + 7, 30, c + 6, 40); g.lineTo(W, 64); g.lineTo(W, 72); g.lineTo(c + 6, 66); g.lineTo(c + 5, 84); g.lineTo(c + 22, 96); g.lineTo(c + 22, 100); g.lineTo(c - 22, 100); g.lineTo(c - 22, 96); g.lineTo(c - 5, 84); g.lineTo(c - 6, 66); g.lineTo(0, 72); g.lineTo(0, 64); g.lineTo(c - 6, 40); g.bezierCurveTo(c - 7, 30, c - 7, 14, c, 0); g.fill(); cut(g, () => ell(g, c, 22, 2.6, 7)); } },
  { id: 'ship', n: 'ספינת קרב', c: 'idf', a: 2.2, d: (g, W) => { fp(g, [0, 60, W, 60, W - 22, 92, 18, 92]); rr(g, 60, 40, 90, 22, 2); rr(g, 86, 18, 34, 24, 2); rr(g, 101, 0, 4, 20); rr(g, 92, 6, 22, 3); rr(g, 150, 46, 40, 5, 2); cut(g, () => { for (let i = 0; i < 4; i++) circ(g, 70 + i * 22, 51, 3.5); }); } },
  { id: 'anchor', n: 'עוגן', c: 'idf', a: 0.85, d: (g, W) => { const c = W / 2; g.lineWidth = 8; g.beginPath(); g.arc(c, 12, 8, 0, TAU); g.stroke(); rr(g, c - 4, 18, 8, 74); rr(g, c - 22, 30, 44, 8, 4); g.beginPath(); g.arc(c, 58, 34, 0.1 * PI, 0.9 * PI); g.stroke(); fp(g, [c - 40, 58, c - 28, 66, c - 40, 72]); fp(g, [c + 40, 58, c + 28, 66, c + 40, 72]); } },
  { id: 'parachute', n: 'מצנח', c: 'idf', a: 1.05, d: (g, W) => { const c = W / 2; g.beginPath(); g.moveTo(2, 40); g.bezierCurveTo(2, -10, W - 2, -10, W - 2, 40); for (let i = 4; i >= 0; i--) g.quadraticCurveTo(i * W / 5 + W / 10, 32, i * W / 5, 40); g.fill(); [[6, 40], [c - 20, 38], [c + 20, 38], [W - 6, 40]].forEach(([x, y]) => sl(g, [x, y, c, 78], 2)); rr(g, c - 8, 74, 16, 22, 6); circ(g, c, 70, 7); } },
  { id: 'chevrons', n: 'דרגות', c: 'idf', a: 0.9, d: (g, W) => { const c = W / 2; for (let i = 0; i < 3; i++) { const y = 8 + i * 28; fp(g, [2, y + 26, c, y, W - 2, y + 26, W - 2, y + 44, c, y + 18, 2, y + 44]); } } },
  { id: 'unit-shield', n: 'מגן יחידה', c: 'idf', a: 0.82, d: (g, W) => { P(g, [4, 4, W - 4, 4, W - 4, 46], false); g.quadraticCurveTo(W - 4, 82, W / 2, 98); g.quadraticCurveTo(4, 82, 4, 46); g.closePath(); g.fill(); cut(g, () => { fp(g, [14, 30, W / 2, 14, W - 14, 30, W - 14, 40, W / 2, 24, 14, 40]); dstar(g, W / 2, 58, 16); }); } },
  { id: 'binoculars', n: 'משקפת', c: 'idf', a: 1.3, d: (g, W) => { rr(g, 8, 30, 46, 62, 14); rr(g, W - 54, 30, 46, 62, 14); rr(g, 20, 10, 26, 26, 6); rr(g, W - 46, 10, 26, 26, 6); rr(g, 50, 44, W - 100, 22, 4); cut(g, () => { circ(g, 31, 74, 11); circ(g, W - 31, 74, 11); }); } },
  { id: 'medic', n: 'לב ודופק', c: 'idf', a: 1.12, d: (g, W) => { heart(g, W / 2, 50, 100); cut(g, () => { g.lineWidth = 5; g.lineJoin = 'round'; g.strokeStyle = '#000'; P(g, [14, 46, 38, 46, 46, 28, 56, 66, 64, 40, 70, 46, W - 14, 46], false); g.stroke(); }); } },
  { id: 'gear', n: 'גלגל שיניים', c: 'idf', a: 1, d: (g, W) => { for (let i = 0; i < 10; i++) { g.save(); g.translate(50, 50); g.rotate(i * TAU / 10); rr(g, -7, -50, 14, 20, 2); g.restore(); } circ(g, 50, 50, 38); cut(g, () => circ(g, 50, 50, 15)); } },
  { id: 'antenna', n: 'אנטנה וקשר', c: 'idf', a: 0.9, d: (g, W) => { const c = W / 2; fp(g, [c - 6, 30, c + 6, 30, c + 22, 100, c - 22, 100]); circ(g, c, 24, 8); g.lineWidth = 5; [16, 28, 40].forEach(r => { g.beginPath(); g.arc(c, 24, r, -0.8 * PI, -0.2 * PI); g.stroke(); }); cut(g, () => { fp(g, [c - 2, 46, c + 2, 46, c + 12, 92, c - 12, 92]); }); } },
  { id: 'eye', n: 'עין', c: 'idf', a: 1.7, d: (g, W) => { const c = W / 2; g.beginPath(); g.moveTo(2, 50); g.quadraticCurveTo(c, -18, W - 2, 50); g.quadraticCurveTo(c, 118, 2, 50); g.fill(); cut(g, () => { circ(g, c, 50, 26); }); circ(g, c, 50, 17); cut(g, () => circ(g, c + 6, 44, 5)); } },
  { id: 'cannon', n: 'תותח', c: 'idf', a: 1.8, d: (g, W) => { g.save(); g.translate(60, 50); g.rotate(-0.42); rr(g, -10, -9, 122, 18, 6); rr(g, -14, -13, 30, 26, 6); g.restore(); circ(g, 58, 70, 26); cut(g, () => { circ(g, 58, 70, 14); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; circ(g, 58 + Math.cos(a) * 20, 70 + Math.sin(a) * 20, 2.5); } }); rr(g, 70, 82, 70, 10, 5); } },
  { id: 'bridge', n: 'גשר', c: 'idf', a: 2, d: (g, W) => { rr(g, 0, 40, W, 12); rr(g, 20, 52, 14, 48); rr(g, W - 34, 52, 14, 48); g.lineWidth = 5; g.beginPath(); g.moveTo(27, 40); g.quadraticCurveTo(W / 2, -30, W - 27, 40); g.stroke(); for (let i = 1; i < 10; i++) { const x = 27 + i * (W - 54) / 10, t = (x - 27) / (W - 54), y = 40 - 70 * 2 * t * (1 - t) * 0.5 * 2 * 0.5; sl(g, [x, 40, x, Math.max(6, 40 - 140 * t * (1 - t))], 2); } } },
  { id: 'truck', n: 'משאית', c: 'idf', a: 1.9, d: (g, W) => { rr(g, 0, 18, 120, 58, 4); fp(g, [124, 34, 160, 34, 186, 56, 186, 80, 124, 80]); rr(g, 0, 70, W, 12, 3); circ(g, 34, 86, 13); circ(g, 154, 86, 13); cut(g, () => { fp(g, [132, 40, 156, 40, 174, 56, 132, 56]); circ(g, 34, 86, 5); circ(g, 154, 86, 5); }); } },
  { id: 'paw', n: 'כף רגל כלב', c: 'idf', a: 1, d: (g, W) => { ell(g, 50, 68, 26, 22); ell(g, 18, 40, 10, 13, -0.4); ell(g, 38, 22, 10, 14, -0.1); ell(g, 62, 22, 10, 14, 0.1); ell(g, 82, 40, 10, 13, 0.4); } },
  { id: 'skyline', n: 'קו רקיע עירוני', c: 'israel', a: 2.2, d: (g, W) => { [[0, 60, 18], [16, 40, 14], [28, 22, 16], [42, 48, 12], [52, 10, 18], [68, 34, 14], [80, 52, 12], [90, 28, 16], [104, 44, 14], [116, 4, 20], [134, 38, 12], [144, 56, 14], [156, 30, 16], [170, 46, 14], [182, 62, 20]].forEach(([x, y, w]) => rr(g, x, y, w, 100 - y, 1)); rr(g, 125, 0, 2, 6); cut(g, () => { for (let x = 4; x < W - 4; x += 6) for (let y = 66; y < 92; y += 8) if ((x * 7 + y) % 3) rr(g, x, y, 2.4, 3.6); }); } },
  /* ---------- הוקרה ופרסים ---------- */
  { id: 'star5', n: 'כוכב', c: 'award', a: 1.05, d: (g, W) => star(g, W / 2, 53, 5, 53, 22) },
  { id: 'star8', n: 'כוכב 8 קצוות', c: 'award', a: 1, d: (g, W) => star(g, 50, 50, 8, 50, 26) },
  { id: 'sun', n: 'שמש', c: 'award', a: 1, d: (g, W) => { star(g, 50, 50, 16, 50, 38); circ(g, 50, 50, 40); } },
  { id: 'trophy', n: 'גביע ניצחון', c: 'award', a: 0.92, d: (g, W) => {
    const c = W / 2; g.beginPath(); g.moveTo(c - 24, 4); g.lineTo(c + 24, 4); g.bezierCurveTo(c + 24, 36, c + 14, 52, c, 54); g.bezierCurveTo(c - 14, 52, c - 24, 36, c - 24, 4); g.fill();
    g.lineWidth = 4.5; g.beginPath(); g.arc(c - 24, 20, 12, PI / 2, 3 * PI / 2); g.stroke(); g.beginPath(); g.arc(c + 24, 20, 12, -PI / 2, PI / 2); g.stroke();
    rr(g, c - 4, 50, 8, 22); ell(g, c, 62, 8, 4); rr(g, c - 18, 72, 36, 10, 2); rr(g, c - 25, 82, 50, 16, 2); cut(g, () => star(g, c, 24, 5, 11, 4.5));
  } },
  { id: 'flame', n: 'להבה', c: 'award', a: 0.62, d: (g, W) => { flame(g, W / 2, 99, 60, 99); cut(g, () => flame(g, W / 2, 92, 26, 52)); } },
  { id: 'torch', n: 'לפיד', c: 'award', a: 0.5, d: (g, W) => { const c = W / 2; fp(g, [c - 6, 100, c + 6, 100, c + 12, 54, c - 12, 54]); rr(g, c - 16, 47, 32, 9, 2); flame(g, c, 52, 28, 52); } },
  { id: 'medal', n: 'מדליה עם סרט', c: 'award', a: 0.72, d: (g, W) => { const c = W / 2; fp(g, [c - 27, 0, c - 11, 0, c + 4, 48, c - 12, 48]); fp(g, [c + 27, 0, c + 11, 0, c - 4, 48, c + 12, 48]); circ(g, c, 68, 31); cut(g, () => star(g, c, 69, 5, 17, 7)); } },
  { id: 'banner', n: 'סרט באנר', c: 'award', a: 2.6, d: (g, W) => { rr(g, 30, 18, W - 60, 52); fp(g, [0, 34, 40, 34, 40, 86, 0, 86, 13, 60]); fp(g, [W, 34, W - 40, 34, W - 40, 86, W, 86, W - 13, 60]); } },
  { id: 'crown', n: 'כתר', c: 'award', a: 1.3, d: (g, W) => { fp(g, [5, 92, 5, 32, 20, 58, 35, 22, 50, 58, 65, 8, 80, 58, 95, 22, 110, 58, 125, 32, 125, 92]); [[5, 30], [35, 20], [65, 6], [95, 20], [125, 30]].forEach(([x, y]) => circ(g, x, y, 6)); cut(g, () => [30, 65, 100].forEach(x => circ(g, x, 76, 5.5))); } },
  { id: 'laurel', n: 'זר דפנה', c: 'award', a: 1.1, d: (g, W) => {
    const c = W / 2, R = 40; g.lineWidth = 3.2; g.beginPath(); g.arc(c, 52, R, -0.36 * PI, 1.36 * PI); g.stroke();
    for (let i = 0; i < 8; i++) { const t = 0.5 + i * 0.12; [1, -1].forEach(s => { const ang = PI / 2 + s * t * PI * 0.88, x = c + Math.cos(ang) * R, y = 52 + Math.sin(ang) * R, tan = ang + s * PI / 2; leaf(g, x, y, 17, 7, tan - s * 0.55); leaf(g, x, y, 15, 6, tan + s * 0.55 + PI * 0.15 * s); }); }
    cut(g, () => {}); star(g, c, 52, 5, 20, 8);
    g.lineWidth = 3; g.beginPath(); g.moveTo(c, 92); g.lineTo(c, 72); g.stroke();
  } },
  { id: 'shield', n: 'מגן הרלדי', c: 'award', a: 0.82, d: (g, W) => { P(g, [4, 4, W - 4, 4, W - 4, 46], false); g.quadraticCurveTo(W - 4, 82, W / 2, 98); g.quadraticCurveTo(4, 82, 4, 46); g.closePath(); g.fill(); } },
  { id: 'obelisk', n: 'אובליסק', c: 'award', a: 0.36, d: (g, W) => { fp(g, [8, 100, 28, 100, 25, 14, 18, 0, 11, 14]); rr(g, 0, 90, W, 10, 1); } },
  { id: 'tower', n: 'מגדל יהלום', c: 'award', a: 0.4, d: (g, W) => fp(g, [0, 100, 0, 22, W / 2, 0, W, 22, W, 100]) },
  { id: 'heart', n: 'לב', c: 'award', a: 1.12, d: (g, W) => heart(g, W / 2, 50, 100) },
  { id: 'bubble', n: 'בועת דיבור', c: 'award', a: 1.3, d: (g, W) => { rr(g, 4, 4, W - 8, 70, 18); fp(g, [30, 70, 24, 98, 54, 70]); } },
  { id: 'bookmark', n: 'סימניה', c: 'award', a: 0.35, d: (g, W) => { fp(g, [0, 0, W, 0, W, 100, W / 2, 82, 0, 100]); cut(g, () => circ(g, W / 2, 10, 3.5)); } },
  { id: 'tag', n: 'תווית', c: 'award', a: 1.7, d: (g, W) => { g.lineJoin = 'round'; g.lineWidth = 8; P(g, [32, 4, W - 4, 4, W - 4, 96, 32, 96, 4, 50]); g.fill(); g.stroke(); cut(g, () => circ(g, 30, 50, 8)); } },
  { id: 'bulb', n: 'נורה', c: 'award', a: 0.68, d: (g, W) => { const c = W / 2; circ(g, c, 33, 32); fp(g, [c - 17, 56, c + 17, 56, c + 13, 78, c - 13, 78]); rr(g, c - 13, 77, 26, 16, 3); rr(g, c - 8, 92, 16, 8, 3); cut(g, () => { for (let i = 0; i < 3; i++) rr(g, c - 11, 80 + i * 4.4, 22, 1.6); }); } },
  { id: 'drop', n: 'טיפה', c: 'award', a: 0.7, d: (g, W) => flame(g, W / 2, 100, 70, 100) },
  { id: 'book', n: 'ספר פתוח', c: 'award', a: 1.5, d: (g, W) => {
    const c = W / 2; [1, -1].forEach(s => { g.beginPath(); g.moveTo(c, 22); g.bezierCurveTo(c - s * 25, 8, c - s * 55, 10, c - s * 72, 18); g.lineTo(c - s * 72, 88); g.bezierCurveTo(c - s * 55, 80, c - s * 25, 80, c, 94); g.closePath(); g.fill(); });
    cut(g, () => { rr(g, c - 0.8, 24, 1.6, 66); [1, -1].forEach(s => { for (let i = 0; i < 5; i++) { const y = 32 + i * 10; rr(g, s > 0 ? c - 60 : c + 12, y, 48, 2.2, 1); } }); });
  } },
  { id: 'gradcap', n: 'כובע סיום', c: 'award', a: 1.4, d: (g, W) => { const c = W / 2; fp(g, [c, 4, W - 4, 30, c, 56, 4, 30]); fp(g, [c - 38, 38, c + 38, 38, c + 34, 74, c - 34, 74]); sl(g, [c, 30, W - 14, 36, W - 14, 70], 3); rr(g, W - 19, 66, 10, 18, 2); } },
  { id: 'gem', n: 'יהלום', c: 'award', a: 1.25, d: (g, W) => { fp(g, [20, 0, W - 20, 0, W, 30, W / 2, 100, 0, 30]); cut(g, () => { fp(g, [26, 6, 40, 6, 32, 24]); fp(g, [W - 26, 6, W - 40, 6, W - 32, 24]); }); } },
  { id: 'house', n: 'בית', c: 'award', a: 0.9, d: (g, W) => { const c = W / 2; fp(g, [c, 2, 88, 42, 80, 42, 80, 100, 10, 100, 10, 42, 2, 42]); rr(g, 62, 10, 10, 22); cut(g, () => { rr(g, c - 9, 68, 18, 32, 2); rr(g, 20, 52, 13, 13, 1); rr(g, 57, 52, 13, 13, 1); }); } },
  { id: 'wave', n: 'בלוק גלי', c: 'award', a: 1.4, d: (g, W) => { const p = [0, 100, 0, 40]; for (let i = 0; i <= 40; i++) { const x = W * i / 40; p.push(x, 28 + 14 * Math.sin(i / 40 * TAU * 1.25)); } p.push(W, 100); fp(g, p); } },
  { id: 'rocket', n: 'רקטה', c: 'award', a: 0.6, d: (g, W) => { const c = W / 2; g.beginPath(); g.moveTo(c, 0); g.bezierCurveTo(c + 22, 20, c + 16, 60, c + 12, 76); g.lineTo(c - 12, 76); g.bezierCurveTo(c - 16, 60, c - 22, 20, c, 0); g.fill(); fp(g, [c - 12, 52, c - 28, 82, c - 10, 76]); fp(g, [c + 12, 52, c + 28, 82, c + 10, 76]); flame(g, c, 100, 14, 30); cut(g, () => circ(g, c, 34, 7)); } },
  { id: 'mountain', n: 'פסגה', c: 'award', a: 1.5, d: (g, W) => { fp(g, [0, 100, 52, 18, 72, 48, 96, 8, W, 100]); rr(g, 94, 0, 2.4, 20); fp(g, [96.4, 1, 112, 6, 96.4, 11]); cut(g, () => fp(g, [52, 26, 62, 40, 56, 38, 50, 44, 44, 36])); } },
  /* ---------- גיאומטרי ---------- */
  { id: 'rect', n: 'מלבן', c: 'basic', a: 0.75, d: (g, W) => rr(g, 0, 0, W, 100) },
  { id: 'square', n: 'ריבוע', c: 'basic', a: 1, d: (g, W) => rr(g, 0, 0, W, 100) },
  { id: 'rrect', n: 'מלבן מעוגל', c: 'basic', a: 0.75, d: (g, W) => rr(g, 0, 0, W, 100, 8) },
  { id: 'rrect-wide', n: 'מלבן מעוגל רחב', c: 'basic', a: 1.45, d: (g, W) => rr(g, 0, 0, W, 100, 10) },
  { id: 'circle', n: 'עיגול', c: 'basic', a: 1, d: (g, W) => circ(g, 50, 50, 50) },
  { id: 'oval', n: 'אליפסה', c: 'basic', a: 0.75, d: (g, W) => ell(g, W / 2, 50, W / 2, 50) },
  { id: 'arch', n: 'קשת', c: 'basic', a: 0.72, d: (g, W) => { g.beginPath(); g.moveTo(0, 100); g.lineTo(0, W / 2); g.arc(W / 2, W / 2, W / 2, PI, 0); g.lineTo(W, 100); g.closePath(); g.fill(); } },
  { id: 'gothic', n: 'קשת גותית', c: 'basic', a: 0.65, d: (g, W) => { g.beginPath(); g.moveTo(0, 100); g.lineTo(0, 45); g.quadraticCurveTo(0, 10, W / 2, 0); g.quadraticCurveTo(W, 10, W, 45); g.lineTo(W, 100); g.closePath(); g.fill(); } },
  { id: 'v-award', n: 'משולש V הפוך', c: 'award', a: 1.0, d: (g, W) => fp(g, [0, 0, W, 0, W / 2 + 3, 100, W / 2 - 3, 100]) },
  { id: 'hex-trio', n: 'שלושה משושים', c: 'award', a: 1.7, d: (g, W) => { const r = 33.5, dx = r * 1.5, dy = r * Math.sqrt(3) / 2; ngon(g, W / 2, dy, 6, r, 0); ngon(g, W / 2 - dx, dy * 2, 6, r, 0); ngon(g, W / 2 + dx, dy * 2, 6, r, 0); } },
  { id: 'flag-print', n: 'פסי דגל להדפסה', c: 'israel', a: 1.375, d: (g, W) => { rr(g, 7, 12, W - 14, 12); rr(g, 7, 76, W - 14, 12); dstarLine(g, W / 2, 50, 21, 4.2); } },
  { id: 'triangle', n: 'משולש', c: 'basic', a: 1.1, d: (g, W) => fp(g, [W / 2, 0, W, 100, 0, 100]) },
  { id: 'pentagon', n: 'מחומש', c: 'basic', a: 1.05, d: (g, W) => ngon(g, W / 2, 54, 5, 54) },
  { id: 'hexagon', n: 'משושה', c: 'basic', a: 1.15, d: (g, W) => ngon(g, W / 2, 50, 6, 58, 0) },
  { id: 'octagon', n: 'מתומן', c: 'basic', a: 1, d: (g, W) => ngon(g, 50, 50, 8, 54, PI / 8) },
  { id: 'diamond', n: 'מעוין', c: 'basic', a: 0.7, d: (g, W) => fp(g, [W / 2, 0, W, 50, W / 2, 100, 0, 50]) },
  { id: 'trapezoid', n: 'טרפז', c: 'basic', a: 1.2, d: (g, W) => fp(g, [20, 0, W - 20, 0, W, 100, 0, 100]) },
  { id: 'chamfer', n: 'פינות קטומות', c: 'basic', a: 0.8, d: (g, W) => fp(g, [12, 0, W - 12, 0, W, 12, W, 88, W - 12, 100, 12, 100, 0, 88, 0, 12]) },
  { id: 'notched', n: 'פינות קעורות', c: 'basic', a: 0.8, d: (g, W) => { rr(g, 0, 0, W, 100); cut(g, () => [[0, 0], [W, 0], [0, 100], [W, 100]].forEach(([x, y]) => circ(g, x, y, 12))); } },
  { id: 'ticket', n: 'כרטיס', c: 'basic', a: 1.6, d: (g, W) => { rr(g, 0, 0, W, 100, 6); cut(g, () => { circ(g, 0, 50, 12); circ(g, W, 50, 12); }); } },
  { id: 'scallop', n: 'עיגול מסולסל', c: 'basic', a: 1, d: (g, W) => { circ(g, 50, 50, 42); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; circ(g, 50 + Math.cos(a) * 42, 50 + Math.sin(a) * 42, 8.5); } } },
  { id: 'frame-rect', n: 'מסגרת מלבנית', c: 'basic', a: 0.75, d: (g, W) => { rr(g, 0, 0, W, 100, 6); cut(g, () => rr(g, 12, 12, W - 24, 76, 3)); } },
  { id: 'frame-line', n: 'מסגרת דקה', c: 'basic', a: 0.75, d: (g, W) => { rr(g, 0, 0, W, 100, 3); cut(g, () => rr(g, 3.2, 3.2, W - 6.4, 93.6, 1.5)); } },
  { id: 'ring', n: 'טבעת', c: 'basic', a: 1, d: (g, W) => { circ(g, 50, 50, 50); cut(g, () => circ(g, 50, 50, 34)); } },
  { id: 'cloud', n: 'ענן', c: 'basic', a: 1.55, d: (g, W) => { circ(g, 40, 62, 26); circ(g, 70, 44, 32); circ(g, 108, 58, 28); circ(g, 130, 72, 20); rr(g, 18, 62, 124, 36, 18); } },
  { id: 'halfcircle', n: 'חצי עיגול', c: 'basic', a: 2, d: (g, W) => { g.beginPath(); g.moveTo(0, 100); g.arc(W / 2, 100, W / 2, PI, 0); g.closePath(); g.fill(); } },
];
