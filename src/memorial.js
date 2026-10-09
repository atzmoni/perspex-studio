
/* ---------- Memorial portrait effect: photo → stencil / black-and-white ink on transparent ---------- */
const FX_STYLES = [['stencil', 'סטנסיל (צ׳ה גווארה)'], ['stencil3', 'סטנסיל 3 גוונים'], ['bw', 'שחור־לבן צילומי'], ['engrave', 'חריטת לייזר']];
const FX_COLORS = [['#111111', 'שחור'], ['#4a2e1a', 'חום ספיה'], ['#8a6a2a', 'זהב עתיק'], ['#1c2c5b', 'כחול לילה'], ['#9b1b1b', 'אדום']];
const FX_DEF = { style: 'stencil', th: 0.5, smooth: 1.5, contrast: 1.35, bg: true, oval: false, color: '#4a2e1a' };

function fxProcess(im, o) {
  const s = Math.min(1, 1100 / Math.max(im.width, im.height)), w = Math.max(2, Math.round(im.width * s)), h = Math.max(2, Math.round(im.height * s));
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.filter = `grayscale(1) blur(${o.smooth}px)`; g.drawImage(im, 0, 0, w, h); g.filter = 'none';
  const id = g.getImageData(0, 0, w, h), d = id.data, N = w * h, V = new Float32Array(N), hist = new Uint32Array(256);
  let opaque = 0; for (let i = 0; i < N; i++) if (d[i * 4 + 3] > 20) { hist[d[i * 4]]++; opaque++; }
  let lo = 0, hi = 255, acc = 0; for (let k = 0; k < 256; k++) { acc += hist[k]; if (acc > opaque * 0.02) { lo = k; break; } } acc = 0; for (let k = 255; k >= 0; k--) { acc += hist[k]; if (acc > opaque * 0.02) { hi = k; break; } }
  const span = Math.max(8, hi - lo); for (let i = 0; i < N; i++) { const v = clamp((d[i * 4] - lo) / span, 0, 1); V[i] = clamp((v - 0.5) * o.contrast + 0.5, 0, 1); }
  const bg = new Uint8Array(N);
  if (o.bg) {
    // flood from the border through pixels close to the border's typical tone
    const edge = []; for (let x = 0; x < w; x++) edge.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) edge.push(y * w, y * w + w - 1);
    const ev = edge.map(i => V[i]).sort((a, b) => a - b), ref = ev[Math.floor(ev.length / 2)], tol = 0.16, q = new Int32Array(N); let qh = 0, qt = 0;
    edge.forEach(i => { if (!bg[i] && Math.abs(V[i] - ref) < tol) { bg[i] = 1; q[qt++] = i; } });
    while (qh < qt) { const i = q[qh++], x = i % w; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) if (j >= 0 && j < N && !bg[j] && Math.abs(V[j] - ref) < tol) { bg[j] = 1; q[qt++] = j; } }
  }
  const col = new THREE.Color(o.color), R = Math.round(col.r * 255), G = Math.round(col.g * 255), B = Math.round(col.b * 255);
  for (let i = 0; i < N; i++) {
    let a = 0; const v = V[i];
    if (!bg[i] && d[i * 4 + 3] > 20) {
      if (o.style === 'stencil3') a = v < o.th - 0.13 ? 255 : v < o.th + 0.13 ? 125 : 0;
      else if (o.style === 'bw') a = 255 * Math.pow(1 - v, 0.85);
      else a = v < o.th ? 255 : 0;
    }
    if (o.oval) { const x = (i % w) / w - 0.5, y = Math.floor(i / w) / h - 0.5, r = Math.hypot(x / 0.48, y / 0.48); a *= clamp((1 - r) / 0.12, 0, 1); }
    d[i * 4] = R; d[i * 4 + 1] = G; d[i * 4 + 2] = B; d[i * 4 + 3] = a;
  }
  g.putImageData(id, 0, 0);
  if (o.style !== 'bw') { const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const g2 = c2.getContext('2d'); g2.filter = 'blur(0.6px)'; g2.drawImage(c, 0, 0); return c2; }
  return c;
}

/* A neutral stand-in portrait for templates until the customer uploads a photo */
let SAMPLE_PORTRAIT = null;
function samplePortrait() {
  if (SAMPLE_PORTRAIT) return SAMPLE_PORTRAIT; const c = document.createElement('canvas'); c.width = 600; c.height = 800; const g = c.getContext('2d'); g.fillStyle = '#4a2e1a';
  g.beginPath(); g.ellipse(300, 300, 200, 240, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(300, 820, 290, 250, 0, 0, Math.PI * 2); g.fill(); rr(g, 120, 330, 70, 330, 30); rr(g, 410, 330, 70, 330, 30);
  g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(300, 345, 118, 152, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(240, 480); g.lineTo(360, 480); g.lineTo(380, 640); g.lineTo(220, 640); g.fill(); g.beginPath(); g.moveTo(300, 600); g.lineTo(390, 800); g.lineTo(210, 800); g.fill(); g.restore();
  g.beginPath(); g.ellipse(300, 235, 120, 50, 0, Math.PI, Math.PI * 2); g.fill();
  g.lineWidth = 9; g.lineCap = 'round'; g.strokeStyle = '#4a2e1a'; [255, 345].forEach(x => { g.beginPath(); g.ellipse(x, 335, 30, 22, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(x, 337, 9, 7, 0, 0, Math.PI * 2); g.fill(); });
  g.beginPath(); g.moveTo(285, 336); g.lineTo(315, 336); g.stroke(); g.beginPath(); g.moveTo(300, 360); g.quadraticCurveTo(292, 395, 306, 402); g.stroke(); g.beginPath(); g.arc(300, 405, 42, 0.35, Math.PI - 0.35); g.stroke();
  SAMPLE_PORTRAIT = c.toDataURL('image/png'); return SAMPLE_PORTRAIT;
}

function openMemorialFx(target) {
  const o = Object.assign({}, FX_DEF, (target && target.mfx) || store.get('ps-fx', {}));
  let src = target && !target.sample ? (target.orig || target.src) : null, im = null, out = null;
  const md = modal(`<div><p class="lead">מחולל אפקט להנצחה</p><h2>תמונה בשחור־לבן לפרספקס</h2></div>
   <div class="fxwrap"><div class="fxprev"><canvas id="fxCv" width="10" height="10" aria-label="תצוגה מקדימה"></canvas><p class="hint" id="fxEmpty">בחרו תמונה כדי להתחיל. תמונת פנים על רקע אחיד נותנת את התוצאה הטובה ביותר.</p></div>
    <div class="fxctl"><label class="btn" for="fxFile">בחירת תמונה</label><input type="file" id="fxFile" accept="image/*" class="sr">
     <div class="chips">${FX_STYLES.map(([k, n]) => `<button class="chip" data-fxs="${k}" aria-pressed="${o.style === k}">${n}</button>`).join('')}</div>
     <div class="field"><label for="fxTh">סף כהות</label><input type="range" id="fxTh" min="0.2" max="0.8" step="0.01" value="${o.th}"></div>
     <div class="field"><label for="fxSm">החלקה</label><input type="range" id="fxSm" min="0" max="5" step="0.25" value="${o.smooth}"></div>
     <div class="field"><label for="fxCo">ניגודיות</label><input type="range" id="fxCo" min="0.6" max="2.4" step="0.05" value="${o.contrast}"></div>
     <label class="row"><input type="checkbox" id="fxBg" ${o.bg ? 'checked' : ''}> הסרת רקע אחיד</label>
     <label class="row"><input type="checkbox" id="fxOval" ${o.oval ? 'checked' : ''}> מסגרת אובאלית רכה</label>
     <div class="row"><label>צבע דיו</label><div class="chips">${FX_COLORS.map(([c, n]) => `<button class="chip" data-fxc="${c}" aria-pressed="${o.color === c}" title="${n}" style="background:${c};width:28px;height:28px;padding:0"></button>`).join('')}</div></div></div></div>
   <p class="note">התמונה הופכת לדיו בצבע אחד על רקע שקוף, בלי רקע מודפס. בהדפסה מאחור על פרספקס שקוף היא נראית כמו בתמונה לדוגמה; בחריטה היא יוצאת חלבית ומוארת.</p>
   <div class="actions"><button class="btn primary" id="fxGo" disabled>${target ? 'עדכון התמונה בעיצוב' : 'הוספה לעיצוב'}</button><button class="btn ghost" id="fxClose">ביטול</button></div>`);
  const cv = $('#fxCv', md.el);
  function render() {
    if (!im) return; out = fxProcess(im, o); const mw = 420, s = Math.min(1, mw / out.width); cv.width = Math.round(out.width * s); cv.height = Math.round(out.height * s);
    const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(out, 0, 0, cv.width, cv.height); $('#fxEmpty', md.el).hidden = true; $('#fxGo', md.el).disabled = false;
  }
  let rt = 0; const soon = () => { clearTimeout(rt); rt = setTimeout(render, 60); };
  function load(s) { src = s; const i = new Image(); i.onload = () => { im = i; render(); }; i.src = s; }
  if (src) load(src);
  md.el.addEventListener('change', e => { if (e.target.id === 'fxFile' && e.target.files[0]) readFile(e.target.files[0], s => shrinkImage(s, 1400, load)); });
  md.el.addEventListener('input', e => { const t = e.target; if (t.id === 'fxTh') o.th = +t.value; else if (t.id === 'fxSm') o.smooth = +t.value; else if (t.id === 'fxCo') o.contrast = +t.value; else if (t.id === 'fxBg') o.bg = t.checked; else if (t.id === 'fxOval') o.oval = t.checked; else return; soon(); });
  md.el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.fxs) { o.style = b.dataset.fxs; $$('[data-fxs]', md.el).forEach(x => x.setAttribute('aria-pressed', x === b)); soon(); }
    else if (b.dataset.fxc) { o.color = b.dataset.fxc; $$('[data-fxc]', md.el).forEach(x => x.setAttribute('aria-pressed', x === b)); soon(); }
    else if (b.id === 'fxClose') md.close();
    else if (b.id === 'fxGo' && out) {
      store.set('ps-fx', o); const png = out.toDataURL('image/png'), fin = o.style === 'engrave' ? 'engrave' : 'back';
      const oi = new Image(); oi.onload = () => { const k = Math.min(1, 800 / Math.max(oi.width, oi.height)), oc = document.createElement('canvas'); oc.width = Math.round(oi.width * k); oc.height = Math.round(oi.height * k); const og = oc.getContext('2d'); og.fillStyle = '#fff'; og.fillRect(0, 0, oc.width, oc.height); og.drawImage(oi, 0, 0, oc.width, oc.height); const small = oc.toDataURL('image/jpeg', 0.85);
        let el = target && S.els.includes(target) ? target : null;
        if (el) Object.assign(el, { src: png, orig: small, mfx: Object.assign({}, o), sample: false, fin, mono: false });
        else { el = { id: uid(), type: 'image', src: png, orig: small, mfx: Object.assign({}, o), s: 0.36, fin, fx: 0.28, fy: 0.55, rot: 0, mono: false, color: o.color }; S.els.push(el); }
        sel = el.id; md.close(); changed(); tab = 'design'; renderPanel(); toast('תמונת ההנצחה נוספה. אפשר לגרור אותה על הפרספקס.');
      }; oi.src = src;
    }
  });
}
