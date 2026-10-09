/* ===================== Perspex Studio ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ils = n => '₪' + Math.round(n).toLocaleString('he-IL');
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };

const THICK = [3, 5, 8, 10, 15, 20, 25, 30];
const MATERIALS = [
  { id: 'clear', n: 'שקוף קריסטל', col: '#ffffff', kind: 'clear', mult: 1 },
  { id: 'frost', n: 'חלבי מט', col: '#f3f5f8', kind: 'frost', mult: 1.12 },
  { id: 'smoke', n: 'מעושן', col: '#5d626c', kind: 'tint', mult: 1.15 },
  { id: 'bronze', n: 'ברונזה', col: '#a5682d', kind: 'tint', mult: 1.15 },
  { id: 'blue', n: 'כחול שקוף', col: '#2563d6', kind: 'tint', mult: 1.15 },
  { id: 'gold', n: 'מראה זהב', col: '#d6b046', kind: 'mirror', mult: 1.65 },
  { id: 'silver', n: 'מראה כסף', col: '#dfe3e8', kind: 'mirror', mult: 1.55 },
  { id: 'black', n: 'שחור מבריק', col: '#0e0f13', kind: 'opaque', mult: 1.08 },
  { id: 'white', n: 'לבן חלב', col: '#f4f4f0', kind: 'opaque', mult: 1.08 },
  { id: 'navy', n: 'כחול צי', col: '#16285a', kind: 'opaque', mult: 1.12 },
  { id: 'fgreen', n: 'זוהר ירוק', col: '#7cf35a', kind: 'fluo', mult: 1.3 },
  { id: 'forange', n: 'זוהר כתום', col: '#ff8b2b', kind: 'fluo', mult: 1.3 },
];
const BASES = [
  { id: 'none', n: 'ללא מעמד', sub: 'עומד על הצורה עצמה' },
  { id: 'wood', n: 'בסיס עץ אלון', sub: 'עץ מלא עם חריץ' },
  { id: 'black', n: 'אקריל שחור', sub: 'בלוק מבריק' },
  { id: 'clear', n: 'אקריל שקוף', sub: 'בלוק קריסטל' },
  { id: 'led', n: 'בסיס LED מואר', sub: 'מאיר את החריטה' },
  { id: 'metal', n: 'מתכת מוברשת', sub: 'נירוסטה' },
  { id: 'easel', n: 'רגל תמיכה', sub: 'משענת אקריל אחורית' },
  { id: 'standoff', n: 'תלייה על קיר', sub: '4 ברגי נירוסטה' },
  { id: 'pocket', n: 'כיס אקריל שקוף', sub: 'הלוח נכנס לכיס ומתחלף' },
  { id: 'wedge', n: 'טרפז עץ שחור', sub: 'חזית משופעת עם הדפסה' },
  { id: 'crystal', n: 'בסיס קריסטל משופע', sub: 'אקריל עבה עם שיפוע' },
  { id: 'yahrzeit', n: 'מגש נר נשמה', sub: 'מראה זהב, נר נשמה ונר טי' },
  { id: 'shabbat', n: 'מגש נרות שבת', sub: 'מראה זהב ושני פמוטים' },
];
/* Thickness range each base can hold (mm). The slot is cut to the sheet thickness, so the two always change together. */
const BASE_FIT = { none: [15, 30], wood: [3, 30], black: [3, 30], clear: [3, 30], led: [5, 20], metal: [3, 15], easel: [3, 10], standoff: [3, 20], pocket: [3, 6], wedge: [3, 30], crystal: [3, 30], yahrzeit: [3, 10], shabbat: [3, 10] };
const fitOK = (t, b) => { const f = BASE_FIT[b] || [3, 30]; return t >= f[0] && t <= f[1]; };
const fitText = b => { const f = BASE_FIT[b] || [3, 30]; return f[0] + '–' + f[1] + ' מ״מ'; };
function slotDims(T, H) { return { w: +(T + 0.4).toFixed(1), d: clamp(Math.round(H * 0.05), 6, 20) + (T >= 20 ? 4 : 0) }; }
const FONTS = [
  ['Frank Ruhl Libre', 'פרנק ריהל'], ['David Libre', 'דוד'], ['Heebo', 'חיבו'], ['Rubik', 'רוביק'], ['Assistant', 'אסיסטנט'],
  ['Secular One', 'סקולר'], ['Suez One', 'סואץ'], ['Amatic SC', 'אמטיק'], ['Karantina', 'קרנטינה'], ['Bellefair', 'בלפייר'], ['Varela Round', 'וראלה']
];
/* Opaque sheets can't be read through, so their 'back' print goes on the front. */
const opaqueMat = (st = S) => { const m = MATERIALS.find(x => x.id === st.mat); return !!m && (m.kind === 'opaque' || m.kind === 'mirror'); };
const finOf = (el, st = S) => el.fin === 'back' && opaqueMat(st) ? 'front' : el.fin;
const FIN = { back: 'הדפסה מאחור', front: 'הדפסה מקדימה', engrave: 'חריטת לייזר', mirror: 'מראה זהב מודבק' };
const BG_PRESETS = [['תכלת ישראל', '#0038b8', '#7fb0ff'], ['זהב', '#9c7424', '#f3d98a'], ['לילה', '#0b1430', '#33478f'], ['אבן ירושלים', '#cdb98e', '#f1e7cf'], ['שקיעה', '#ff7a45', '#ffd36b'], ['כסף', '#8d96a3', '#eef1f5']];
const BG_DEF = { type: 'none', c1: '#0038b8', c2: '#7fb0ff', ang: 90, src: '', side: 'back', inset: 4, op: 1 };
const SIZES = [
  { id: 's', n: 'קטן', sub: 'כ־10×15 ס״מ', w: 100 },
  { id: 'm', n: 'בינוני', sub: 'כ־15×20 ס״מ', w: 150 },
  { id: 'l', n: 'גדול', sub: 'כ־20×30 ס״מ', w: 200 },
  { id: 'xl', n: 'ענק', sub: 'כ־30×40 ס״מ', w: 300 },
];
const QTYS = [{ v: 1, n: 'יחידה אחת' }, { v: 5, n: '2–10' }, { v: 25, n: '11–50' }, { v: 100, n: '51–200' }, { v: 250, n: 'מעל 200' }];
const RUSH = [{ id: 'normal', n: 'רגיל', sub: '7–10 ימי עסקים' }, { id: 'fast', n: 'מהיר', sub: '3–5 ימי עסקים' }, { id: 'urgent', n: 'דחוף', sub: 'תוך 48 שעות' }];

const DEF_RATES = {
  sheet: { 3: 260, 5: 390, 8: 590, 10: 720, 15: 1080, 20: 1450, 25: 1850, 30: 2250 }, waste: 1.15,
  cutPerM: 14, setup: 60, uvPerM2: 950, uvMin: 18, white: 0.3, reverse: 0.1, engPerCm2: 0.4, engMin: 20,
  plaque: 28, gift: 16, ledAdd: 75, mirPerCm2: 0.5, mirMin: 30, minUnit: 79, vat: 0.18, rush: { normal: 0, fast: 0.2, urgent: 0.4 },
  disc: [[1, 0], [2, 0.07], [11, 0.15], [51, 0.22], [201, 0.3]],
  bases: { none: [0, 0], wood: [38, 2.6], black: [32, 2.2], clear: [44, 3], led: [110, 3.2], metal: [75, 3.5], easel: [14, 0], standoff: [32, 0], pocket: [45, 1.6], wedge: [52, 3.2], crystal: [60, 3.6], yahrzeit: [95, 3], shabbat: [85, 3] }
};
let R = Object.assign(JSON.parse(JSON.stringify(DEF_RATES)), store.get('ps-rates', {})); if (R.ledAdd == null) R.ledAdd = DEF_RATES.ledAdd; R.sheet = Object.assign({}, DEF_RATES.sheet, R.sheet); R.bases = Object.assign({}, DEF_RATES.bases, R.bases);

/* ---------- Templates per occasion ---------- */
const T_ = (text, o) => Object.assign({ id: uid(), type: 'text', text, font: 'Frank Ruhl Libre', weight: 700, s: 0.07, color: '#1c2c5b', fin: 'back', fx: 0.5, fy: 0.5, rot: 0, align: 'center', outline: 0, ocolor: '#ffffff' }, o);
const SYM = (shape, o) => Object.assign({ id: uid(), type: 'symbol', shape, s: 0.2, color: '#a8812c', fin: 'back', fx: 0.5, fy: 0.2, rot: 0 }, o);
const OCCASIONS = [
  { id: 'staff', n: 'הוקרה לעובד/ת', sub: 'מצוינות, ותק, פרישה' },
  { id: 'hanukkah', n: 'חנוכה', sub: 'מתנה לחג, אירוע חברה' },
  { id: 'independence', n: 'יום העצמאות', sub: 'ציון, מפת ישראל' },
  { id: 'mitzvah', n: 'בר/בת מצווה', sub: 'מתנה אישית' },
  { id: 'memorial', n: 'הנצחה ותרומה', sub: 'לוח תורמים, זיכרון' },
  { id: 'corporate', n: 'אירוע חברה', sub: 'כנס, יום הוקרה, VIP' },
  { id: 'roshhashana', n: 'ראש השנה', sub: 'סימני החג בכיס אקריל' },
  { id: 'vaward', n: 'גביע V יוקרתי', sub: 'משולש עם פסי זהב' },
  { id: 'patent', n: 'פטנט והישג', sub: 'משושים על טרפז עץ' },
  { id: 'israelmap', n: 'מפת ישראל ודגל', sub: 'פרספקס שחור או שקוף' },
  { id: 'yahrzeit', n: 'נר נשמה והנצחה', sub: 'תמונה, הקדשה ומגש נרות' },
  { id: 'shabbat', n: 'נרות שבת', sub: 'מגש זהב לשני פמוטים' },
];
function template(id, w) {
  const base = { shape: 'rrect', w, lock: true, h: 0, t: 10, mat: 'clear', base: { type: 'wood', w: 0, d: 60, h: 24, plaque: '', led: '#7cc4ff', ledOn: false }, white: true };
  switch (id) {
    case 'hanukkah': return Object.assign(base, { shape: 'hanukkiah', base: { ...base.base, type: 'led', h: 30, plaque: 'חג אורים שמח · תשפ״ז', led: '#ffc66b' }, els: [T_('נס גדול היה פה', { fin: 'engrave', fy: 0.89, s: 0.04, font: 'Suez One' })] });
    case 'independence': return Object.assign(base, { shape: 'israel-map', w: Math.round(w * 0.55), t: 15, base: { ...base.base, type: 'black', plaque: 'עם ישראל חי · 78 שנות עצמאות' }, els: [T_('78', { fin: 'engrave', fy: 0.42, s: 0.42, font: 'Suez One', weight: 400 })] });
    case 'mitzvah': return Object.assign(base, { shape: 'tablets', t: 10, base: { ...base.base, type: 'wood' }, els: [T_('מזל טוב', { fy: 0.36, s: 0.085, font: 'Suez One', weight: 400 }), T_('לבר המצווה של', { fy: 0.5, s: 0.05, font: 'Assistant', weight: 600 }), T_('נועם', { fy: 0.66, s: 0.13, weight: 900, color: '#0038b8' }), T_('פרשת לך לך · תשפ״ז', { fy: 0.84, s: 0.04, font: 'Assistant' })] });
    case 'memorial': return Object.assign(base, { shape: 'arch', t: 15, base: { ...base.base, type: 'black' }, els: [SYM('dstar', { fy: 0.2, s: 0.16, fin: 'engrave' }), T_('לזכר', { fy: 0.38, s: 0.07, fin: 'engrave' }), T_('משה בן אברהם ז״ל', { fy: 0.52, s: 0.085, weight: 900, fin: 'engrave' }), T_('נתרם באהבה על ידי\nמשפחת כהן', { fy: 0.74, s: 0.05, font: 'Assistant', weight: 600, fin: 'engrave' })] });
    case 'corporate': return Object.assign(base, { shape: 'rrect-wide', t: 10, base: { ...base.base, type: 'metal' }, els: [T_('אירוע ההוקרה השנתי 2026', { fy: 0.22, s: 0.045, font: 'Assistant', weight: 800, color: '#a8812c' }), T_('תודה על שותפות', { fy: 0.45, s: 0.075, weight: 900 }), T_('ישראלה ישראלי', { fy: 0.66, s: 0.06, font: 'Heebo', weight: 700, color: '#0038b8' }), T_('הנהלת החברה', { fy: 0.84, s: 0.035, font: 'Assistant' })] });
    case 'roshhashana': return Object.assign(base, { shape: 'rect', t: 5, base: { ...base.base, type: 'pocket' }, els: [SYM('frame-line', { fy: 0.5, s: 0.93, color: '#c9a24a' }), T_('סימני ראש השנה', { fy: 0.12, s: 0.085, font: 'Suez One', weight: 400, color: '#c9a24a', plate: true }),
      T_('רימון: שנרבה זכויות כרימון\nתמרים: שיתמו אויבינו\nתפוח בדבש: שתתחדש עלינו שנה טובה ומתוקה\nכרתי: שיכרתו שונאינו\nסלק: שיסתלקו אויבינו\nראש דג: שנהיה לראש ולא לזנב', { fy: 0.47, s: 0.042, font: 'Frank Ruhl Libre', weight: 700, color: '#2b2b2b' }), T_('שנה טובה', { fy: 0.83, s: 0.11, font: 'Suez One', weight: 400, color: '#d6b046', fin: 'mirror', plate: true })] });
    case 'vaward': return Object.assign(base, { shape: 'v-award', w: Math.round(w * 0.9), t: 15, base: { ...base.base, type: 'crystal', d: 70, h: 30 }, els: [SYM('v-award', { fy: 0.5, s: 1, color: '#c9a033' }), SYM('v-award', { fy: 0.36, s: 0.62, color: '#e9ebee' }), T_('דנה כהן', { fy: 0.12, s: 0.07, font: 'Secular One', weight: 400, color: '#1c1c1c' }), T_('מעריכים ומוקירים\nאת פועלך רב השנים', { fy: 0.25, s: 0.038, font: 'Heebo', weight: 700, color: '#1c1c1c' }), T_('בהוקרה,\nהנהלת החברה', { fy: 0.4, s: 0.03, font: 'Assistant', weight: 600, color: '#1c1c1c' })] });
    case 'patent': return Object.assign(base, { shape: 'hex-trio', w: Math.round(w * 1.4), t: 20, base: { ...base.base, type: 'wedge', d: 90, h: 50, plaque: 'ישראל ישראלי · ממציא' }, els: [T_('פטנט רשום', { fy: 0.12, s: 0.055, font: 'Heebo', weight: 900, color: '#0038b8' }), T_('12345678\n15/03/2026', { fy: 0.27, s: 0.036, font: 'Assistant', weight: 700, color: '#1c2c5b' }), T_('מערכת ושיטה\nלתכנון אופטי', { fy: 0.66, fx: 0.215, s: 0.038, font: 'Heebo', weight: 700, color: '#1c2c5b' }), T_('ישראל ישראלי', { fy: 0.66, fx: 0.785, s: 0.042, font: 'Heebo', weight: 900, color: '#0038b8' }), SYM('gear', { fy: 0.43, s: 0.07, color: '#1c2c5b' })] });
    case 'yahrzeit': return Object.assign(base, { shape: 'arabesque', w: Math.max(240, Math.round(w * 1.4)), t: 8, base: { ...base.base, type: 'yahrzeit', plaque: 'רבות בנות עשו חיל\nואת עלית על כולנה' }, els: [SYM('arabesque-line', { fy: 0.5, s: 1, color: '#d6b046', fin: 'mirror' }), { id: uid(), type: 'image', src: samplePortrait(), sample: true, s: 0.36, fin: 'back', fx: 0.27, fy: 0.6, rot: 0, mono: false, color: '#4a2e1a' },
      T_('לעילוי נשמת אשת חיל', { fx: 0.69, fy: 0.33, s: 0.042, font: 'Frank Ruhl Libre', weight: 700, color: '#2a1c10' }), T_('שרה כהן ז״ל', { fx: 0.69, fy: 0.45, s: 0.075, font: 'Frank Ruhl Libre', weight: 900, color: '#2a1c10' }), T_('בת אסתר ואברהם', { fx: 0.69, fy: 0.56, s: 0.04, font: 'Frank Ruhl Libre', weight: 700, color: '#2a1c10' }), T_('נלב״ע ה׳ בחשוון תשפ״ז', { fx: 0.69, fy: 0.65, s: 0.04, font: 'Frank Ruhl Libre', weight: 700, color: '#2a1c10' })] });
    case 'shabbat': return Object.assign(base, { shape: 'arabesque', w: Math.max(240, Math.round(w * 1.4)), t: 8, base: { ...base.base, type: 'shabbat', plaque: 'שמור וזכור בדיבור אחד' }, els: [SYM('arabesque-line', { fy: 0.5, s: 1, color: '#d6b046', fin: 'mirror' }), SYM('shabbat-candles', { fy: 0.36, s: 0.24, color: '#b8902c' }), T_('לכבוד שבת קודש', { fy: 0.66, s: 0.08, font: 'Suez One', weight: 400, color: '#1c2c5b' }), T_('משפחת לוי', { fy: 0.8, s: 0.06, font: 'Frank Ruhl Libre', weight: 900, color: '#a8812c' })] });
    case 'israelmap': return Object.assign(base, { shape: 'israel-map', w: Math.round(w * 0.5), t: 10, mat: 'clear', base: { ...base.base, type: 'black', d: 60, h: 24 }, els: [SYM('rect', { fy: 0.17, fx: 0.56, s: 0.36, color: '#ffffff', fin: 'back' }), SYM('flag-print', { fy: 0.17, fx: 0.56, s: 0.36, color: '#0038b8', fin: 'back' }), T_('ישראל ישראלי\nאבירי הדרך', { fy: 0.38, fx: 0.5, s: 0.07, font: 'Frank Ruhl Libre', weight: 900, color: '#a8812c', fin: 'back' }), T_('בהוקרה ובהערכה\nעל מסירות\nותרומה רבה', { fy: 0.58, fx: 0.47, s: 0.045, font: 'Assistant', weight: 700, color: '#1c2c5b', fin: 'back' })] });
    default: return Object.assign(base, { shape: 'rrect', els: [SYM('dstar', { fy: 0.14, s: 0.13 }), T_('תעודת הוקרה', { fy: 0.3, s: 0.1, weight: 900 }), T_('ישראל ישראלי', { fy: 0.48, s: 0.085, font: 'Heebo', weight: 700, color: '#0038b8' }), T_('על מסירות, מקצועיות\nותרומה יוצאת דופן', { fy: 0.66, s: 0.05, font: 'Assistant', weight: 600 }), T_('תשפ״ז', { fy: 0.86, s: 0.04, font: 'Assistant' })] });
  }
}

/* ---------- State ---------- */
let S = store.get('ps-design', null);
function fresh() { return Object.assign(template('staff', 150), { bg: Object.assign({}, BG_DEF), qty: 1, rush: 'normal', gift: false, occasion: 'staff', sizeId: 'm', notes: '', custom: null }); }
if (!S || !S.els) S = fresh();
S.bg = Object.assign({}, BG_DEF, S.bg || {});
let sel = null, tab = 'shape', cat = 'all', query = '';
const hist = { stack: [], i: -1 };
function snap() { return JSON.stringify(S); }
function pushHist() { const s = snap(); if (hist.stack[hist.i] === s) return; hist.stack = hist.stack.slice(0, hist.i + 1); hist.stack.push(s); if (hist.stack.length > 60) hist.stack.shift(); hist.i = hist.stack.length - 1; updUndo(); }
let histT = 0; function histSoon() { clearTimeout(histT); histT = setTimeout(pushHist, 450); }
function updUndo() { $('#bUndo').disabled = hist.i <= 0; $('#bRedo').disabled = hist.i >= hist.stack.length - 1; }
function undo(d) { const j = hist.i + d; if (j < 0 || j >= hist.stack.length) return; hist.i = j; S = JSON.parse(hist.stack[j]); S.bg = Object.assign({}, BG_DEF, S.bg || {}); if (!S.els.find(e => e.id === sel)) sel = null; rebuildAll(); renderPanel(); updUndo(); }

/* ---------- Raster + contour tracing ---------- */
const shapeById = id => SHAPES.find(s => s.id === id);
function rasterDef(def, R = 560, pad = 0.14) {
  const uw = 100 * def.a, s = R / Math.max(uw, 100), p = Math.round(R * pad);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(uw * s) + 2 * p; cv.height = Math.ceil(100 * s) + 2 * p;
  const g = cv.getContext('2d'); g.translate(p, p); g.scale(s, s); g.fillStyle = g.strokeStyle = '#000'; def.d(g, uw); return cv;
}
function traceCanvas(cv) {
  const W = cv.width, H = cv.height, d = cv.getContext('2d').getImageData(0, 0, W, H).data, WH = W * H, T = 0.5;
  const v = new Float32Array(WH); for (let i = 0; i < WH; i++) v[i] = d[i * 4 + 3] / 255;
  const segA = [], segB = [], adj = new Int32Array(WH * 4).fill(-1);
  const add = (a, b) => { const s = segA.length; segA.push(a); segB.push(b); for (const e of [a, b]) { if (adj[e * 2] < 0) adj[e * 2] = s; else adj[e * 2 + 1] = s; } };
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    const i = y * W + x, tl = v[i], tr = v[i + 1], br = v[i + W + 1], bl = v[i + W];
    const k = (tl >= T ? 8 : 0) | (tr >= T ? 4 : 0) | (br >= T ? 2 : 0) | (bl >= T ? 1 : 0);
    if (k === 0 || k === 15) continue;
    const eT = i, eB = i + W, eL = WH + i, eR = WH + i + 1;
    switch (k) {
      case 1: add(eL, eB); break; case 2: add(eB, eR); break; case 3: add(eL, eR); break; case 4: add(eT, eR); break;
      case 5: if ((tl + tr + br + bl) / 4 >= T) { add(eT, eL); add(eB, eR); } else { add(eT, eR); add(eL, eB); } break;
      case 6: add(eT, eB); break; case 7: add(eT, eL); break; case 8: add(eT, eL); break; case 9: add(eT, eB); break;
      case 10: if ((tl + tr + br + bl) / 4 >= T) { add(eT, eR); add(eL, eB); } else { add(eT, eL); add(eB, eR); } break;
      case 11: add(eT, eR); break; case 12: add(eL, eR); break; case 13: add(eB, eR); break; case 14: add(eL, eB); break;
    }
  }
  const pt = e => { if (e < WH) { const a = v[e], b = v[e + 1], t = (T - a) / ((b - a) || 1e-6); return [e % W + t, Math.floor(e / W)]; } const f = e - WH, a = v[f], b = v[f + W], t = (T - a) / ((b - a) || 1e-6); return [f % W, Math.floor(f / W) + t]; };
  const seen = new Uint8Array(segA.length), loops = [];
  for (let s0 = 0; s0 < segA.length; s0++) {
    if (seen[s0]) continue; seen[s0] = 1; const start = segA[s0]; let cur = segB[s0], s = s0; const pts = [pt(start)]; let guard = 0;
    while (cur !== start && guard++ < 2e6) { pts.push(pt(cur)); const n1 = adj[cur * 2], n2 = adj[cur * 2 + 1]; const ns = n1 === s ? n2 : n1; if (ns < 0 || seen[ns]) break; seen[ns] = 1; s = ns; cur = segA[ns] === cur ? segB[ns] : segA[ns]; }
    if (pts.length > 6) loops.push(pts);
  }
  return loops;
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]; let md = 0, mi = 0; const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L; if (d > md) { md = d; mi = i; } }
  if (md > eps) { const a = rdp(pts.slice(0, mi + 1), eps), b = rdp(pts.slice(mi), eps); return a.slice(0, -1).concat(b); }
  return [pts[0], pts[pts.length - 1]];
}
function simplifyLoop(pts, eps) { let far = 0, fd = 0; for (let i = 1; i < pts.length; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } } const a = rdp(pts.slice(0, far + 1), eps), b = rdp(pts.slice(far).concat([pts[0]]), eps); return a.slice(0, -1).concat(b.slice(0, -1)); }
function area(p) { let s = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) s += (p[j][0] - p[i][0]) * (p[j][1] + p[i][1]); return s / 2; }
function inside(pt, p) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][1] > pt[1]) !== (p[j][1] > pt[1])) && (pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c; } return c; }
function buildShapeData(cv) {
  let loops = traceCanvas(cv).map(l => simplifyLoop(l, 0.45)).filter(l => l.length >= 3 && Math.abs(area(l)) > 12);
  if (!loops.length) return null;
  const info = loops.map(p => ({ p, a: Math.abs(area(p)) })).sort((a, b) => b.a - a.a);
  info.forEach((L, i) => { L.parent = null; for (let j = i - 1; j >= 0; j--) { if (inside(L.p[0], info[j].p)) { if (!L.parent || info[j].a < L.parent.a) L.parent = info[j]; } } L.depth = L.parent ? L.parent.depth + 1 : 0; });
  const outers = []; info.forEach(L => { if (L.depth % 2 === 0) { L.holes = []; outers.push(L); } });
  info.forEach(L => { if (L.depth % 2 === 1 && L.parent) L.parent.holes.push(L.p); });
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; outers.forEach(o => o.p.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
  const bb = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  const mask = document.createElement('canvas'); const mk = 900 / Math.max(bb.w, bb.h); mask.width = Math.max(2, Math.round(bb.w * mk)); mask.height = Math.max(2, Math.round(bb.h * mk));
  mask.getContext('2d').drawImage(cv, bb.x, bb.y, bb.w, bb.h, 0, 0, mask.width, mask.height);
  let fill = 0; outers.forEach(o => { fill += o.a; o.holes.forEach(h => fill -= Math.abs(area(h))); });
  return { outers: outers.map(o => ({ p: o.p, holes: o.holes })), bb, aspect: bb.w / bb.h, mask, fill: fill / (bb.w * bb.h) };
}
const SD = new Map();
function shapeData(id) {
  if (id === 'custom') { if (!S.custom) return shapeData('rrect'); const k = 'custom:' + S.custom.key; if (!SD.has(k)) return SD.get('custom-last') || shapeData('rrect'); return SD.get(k); }
  if (!SD.has(id)) SD.set(id, buildShapeData(rasterDef(shapeById(id) || shapeById('rrect'))));
  return SD.get(id);
}
function dims() { const sd = shapeData(S.shape); const W = S.w, H = S.lock || !S.h ? Math.round(S.w / sd.aspect) : S.h; return { W, H, T: S.t, sd }; }
function perimeterMm(sd, W, H) { const sx = W / sd.bb.w, sy = H / sd.bb.h; let L = 0; const run = p => { for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; L += Math.hypot((b[0] - a[0]) * sx, (b[1] - a[1]) * sy); } }; sd.outers.forEach(o => { run(o.p); o.holes.forEach(run); }); return L; }

/* ---------- Custom shapes (PNG contour / free text) ---------- */
const IMG = new Map();
function loadImg(src) { if (IMG.has(src)) return IMG.get(src); const im = new Image(); const p = { im, ok: false }; im.onload = () => { p.ok = true; scheduleDraw(); }; im.src = src; IMG.set(src, p); return p; }
function dilate(cv, r) {
  if (r <= 0) return cv; const o = document.createElement('canvas'); o.width = cv.width + r * 2; o.height = cv.height + r * 2; const g = o.getContext('2d');
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; g.drawImage(cv, r + Math.cos(a) * r, r + Math.sin(a) * r); } g.drawImage(cv, r, r);
  for (let k = 1; k < 3; k++) for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.drawImage(cv, r + Math.cos(a) * r * k / 3, r + Math.sin(a) * r * k / 3); }
  return o;
}
function silhouetteFromImage(im, marginMm, widthMm) {
  const R = 560, s = R / Math.max(im.width, im.height), w = Math.max(2, Math.round(im.width * s)), h = Math.max(2, Math.round(im.height * s)), p = 40;
  const cv = document.createElement('canvas'); cv.width = w + p * 2; cv.height = h + p * 2; const g = cv.getContext('2d'); g.drawImage(im, p, p, w, h);
  const id = g.getImageData(0, 0, cv.width, cv.height), d = id.data; let transparent = false;
  for (let i = 3; i < d.length; i += 16) if (d[i] < 200) { transparent = true; break; }
  for (let i = 0; i < d.length; i += 4) { const a = transparent ? d[i + 3] : (255 - (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2])) > 40 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = a > 110 ? 255 : 0; }
  g.putImageData(id, 0, 0);
  const rpx = Math.round(marginMm * Math.max(w, h) / Math.max(10, widthMm));
  let out = dilate(cv, rpx); if (rpx > 0) { const f = document.createElement('canvas'); f.width = out.width; f.height = out.height; const fg = f.getContext('2d'); fg.filter = 'blur(2px)'; fg.drawImage(out, 0, 0); out = f; }
  return out;
}
function textSilhouette(str, font, mode) {
  const def = { a: 1, d: null }; const m = document.createElement('canvas').getContext('2d'); m.font = `900 100px "${font}"`; const wpx = m.measureText(str || 'א').width;
  def.a = clamp((wpx * 0.78 + 30) / 100, 0.8, 8); def.d = (g, W) => outlineText(g, str || 'שם', W, font, 900, mode !== 'solid');
  return rasterDef(def, 900);
}
function applyCustom(c) {
  let cv;
  if (c.kind === 'png') { const p = loadImg(c.src); if (!p.ok) { p.im.addEventListener('load', () => applyCustom(c), { once: true }); return; } cv = silhouetteFromImage(p.im, c.margin, S.w); }
  else cv = textSilhouette(c.text, c.font, c.mode);
  const sd = buildShapeData(cv); if (!sd) { toast('לא נמצא קו מתאר בקובץ. נסו PNG עם רקע שקוף.'); return; }
  SD.set('custom:' + c.key, sd); SD.set('custom-last', sd); rebuildAll();
}

/* ---------- Three.js scene ---------- */
let frameHook = null, fixedSize = false;
let backdrop, backdropTex, snapX = false, snapY = false, renderer, scene, camera, controls, pmrem, envTex, floorMat, pieceGroup, baseGroup, acrylic, planes = {}, canv = {}, hitPlane, blob, ledLight, spin = false;
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function initScene() {
  const cv = $('#gl');
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.physicallyCorrectLights = true; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();
  pmrem = new THREE.PMREMGenerator(renderer); envTex = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture; scene.environment = envTex;
  camera = new THREE.PerspectiveCamera(32, 1, 5, 20000);
  controls = new THREE.OrbitControls(camera, cv); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI / 2 - 0.05; controls.minPolarAngle = 0.3; controls.minDistance = 80; controls.maxDistance = 3000;
  /* a small product: no panning, gentle rotation, the piece always stays centred */
  controls.enablePan = false; controls.rotateSpeed = 0.65; controls.zoomSpeed = 0.7; controls.screenSpacePanning = false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a93a6, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-260, 520, 420); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -500, right: 500, top: 500, bottom: -500, near: 10, far: 2000 }); key.shadow.bias = -0.0005; key.shadow.radius = 6; scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 1.2); rim.position.set(380, 260, -420); scene.add(rim);
  floorMat = new THREE.MeshStandardMaterial({ color: 0xdfe4ec, roughness: 0.92, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6000, 64), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const bc = document.createElement('canvas'); bc.width = bc.height = 128; const bg = bc.getContext('2d'); const gr = bg.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); bg.fillStyle = gr; bg.fillRect(0, 0, 128, 128);
  blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.3; scene.add(blob);
  const bdc = document.createElement('canvas'); bdc.width = 16; bdc.height = 256; backdropTex = new THREE.CanvasTexture(bdc); backdropTex.encoding = THREE.sRGBEncoding;
  backdrop = new THREE.Mesh(new THREE.CylinderGeometry(1500, 1500, 2400, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshBasicMaterial({ map: backdropTex, side: THREE.BackSide, fog: false })); backdrop.position.set(0, 1190, 300); scene.add(backdrop);
  pieceGroup = new THREE.Group(); baseGroup = new THREE.Group(); scene.add(pieceGroup, baseGroup);
  ledLight = new THREE.PointLight(0xffc66b, 0, 400, 2); scene.add(ledLight);
  ['front', 'back', 'backw', 'engrave', 'mirror', 'guide'].forEach(k => { canv[k] = document.createElement('canvas'); const t = new THREE.CanvasTexture(canv[k]); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; canv[k].tex = t; });
  planes.front = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: canv.front.tex, transparent: true, alphaTest: 0.02, depthWrite: false, roughness: 0.45, metalness: 0 }));
  planes.back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: canv.back.tex, alphaTest: 0.45, alphaToCoverage: true, roughness: 0.5 }));
  planes.backw = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: canv.backw.tex, alphaTest: 0.45, alphaToCoverage: true, roughness: 0.7 })); planes.backw.rotation.y = Math.PI;
  planes.engrave = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: canv.engrave.tex, transparent: true, depthWrite: false, opacity: 0.72, roughness: 1, color: 0xffffff, emissive: 0x000000, emissiveMap: canv.engrave.tex }));
  planes.mirror = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshPhysicalMaterial({ map: canv.mirror.tex, alphaTest: 0.4, metalness: 1, roughness: 0.14, envMapIntensity: 1.8, clearcoat: 1, emissive: 0xffffff, emissiveMap: canv.mirror.tex, emissiveIntensity: 0.32 }));
  planes.guide = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: canv.guide.tex, transparent: true, depthTest: false, depthWrite: false }));
  planes.guide.renderOrder = 10; planes.engrave.renderOrder = 5; planes.front.renderOrder = 6;
  Object.values(planes).forEach(p => pieceGroup.add(p)); hitPlane = planes.guide;
  applyTheme(); matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(resize).observe($('#stage')); resize();
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
  controls.addEventListener('start', () => { if (spin) toggleSpin(false); });
  $('#loading').hidden = true;
  (function loop() { requestAnimationFrame(loop); if (spin) { pieceGroup.rotation.y += 0.008; baseGroup.rotation.y = pieceGroup.rotation.y; } if (frameHook) frameHook(performance.now()); else { controls.update(); renderer.render(scene, camera); } })();
}
function applyTheme() { if (!scene) return; const bg = new THREE.Color(cssVar('--scene-bg') || '#e7ebf2'); scene.background = bg; scene.fog = new THREE.Fog(bg, 1400, 4200); floorMat.color.set(cssVar('--scene-floor') || '#dfe4ec');
  const c = backdropTex.image, g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); const dark = bg.getHSL({}).l < 0.4;
  gr.addColorStop(0, dark ? '#05070c' : '#7d899c'); gr.addColorStop(0.45, dark ? '#141a28' : '#b7c1cf'); gr.addColorStop(0.92, '#' + floorMat.color.getHexString()); gr.addColorStop(1, '#' + floorMat.color.getHexString()); g.fillStyle = gr; g.fillRect(0, 0, 16, 256);
  g.fillStyle = dark ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.9)'; g.fillRect(0, 60, 16, 10); g.fillRect(0, 120, 16, 4); backdropTex.needsUpdate = true; }
function resize() { if (fixedSize) return; const st = $('#stage'), showing = document.body.classList.contains('showing'), w = showing ? renderer.domElement.clientWidth : st.clientWidth, h = showing ? renderer.domElement.clientHeight : st.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }

function acrylicMaterial(m, T) {
  const c = new THREE.Color(m.col), base = { envMapIntensity: 1.25 };
  switch (m.kind) {
    case 'clear': return new THREE.MeshPhysicalMaterial({ ...base, color: 0xffffff, roughness: 0.02, transmission: 1, thickness: T, ior: 1.49, attenuationColor: new THREE.Color('#cfeee6'), attenuationDistance: 95, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1 });
    case 'frost': return new THREE.MeshPhysicalMaterial({ ...base, color: 0xffffff, roughness: 0.42, transmission: 1, thickness: T, ior: 1.49, specularIntensity: 0.6 });
    case 'tint': return new THREE.MeshPhysicalMaterial({ ...base, color: c, roughness: 0.03, transmission: 0.96, thickness: T, ior: 1.49, attenuationColor: c, attenuationDistance: 22, clearcoat: 1, clearcoatRoughness: 0.03 });
    case 'mirror': return new THREE.MeshPhysicalMaterial({ ...base, color: c, metalness: 1, roughness: 0.07, envMapIntensity: 1.6 });
    case 'fluo': return new THREE.MeshPhysicalMaterial({ ...base, color: c, roughness: 0.05, transmission: 0.65, thickness: T, ior: 1.49, attenuationColor: c, attenuationDistance: 30, emissive: c, emissiveIntensity: 0.18, clearcoat: 1 });
    default: return new THREE.MeshPhysicalMaterial({ ...base, color: c, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04 });
  }
}
function woodTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#b98a57'; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 140; i++) { const y = Math.random() * 256, a = 0.05 + Math.random() * 0.12; g.strokeStyle = `rgba(${90 + Math.random() * 40},${55 + Math.random() * 25},25,${a})`; g.lineWidth = 0.6 + Math.random() * 2.5; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 3 + Math.sin(x / 23) * 0.8); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
let WOOD = null;
function disposeGroup(gr) { gr.children.slice().forEach(o => { gr.remove(o); o.geometry && o.geometry.dispose(); if (o.material && o.material.map && o.material.map !== WOOD && !o.material.map._keep) o.material.map.dispose(); o.material && o.material.dispose && o.material.dispose(); }); }

function baseWidth(W) { return S.base.w ? S.base.w : Math.round(clamp(W * 1.08, 80, W + 50)); }
function ledOn(st = S) { return st.base.type === 'led' || (!!st.base.ledOn && isBlock(st.base.type)); }
function baseDims() {
  const { W, H, T } = dims(), sl = slotDims(T, H), minD = Math.round(clamp(Math.max(T * 2 + 30, H * 0.2), 40, 180)), minH = sl.d + 8 + (ledOn() ? 6 : 0);
  return { bw: baseWidth(W), bd: Math.max(S.base.d, minD), bh: Math.max(S.base.type === 'led' ? Math.max(S.base.h, 28) : S.base.h, minH), minD, minH, slot: sl };
}
function baseHeight() { return baseDims().bh; }
/* Explicit choices: a thickness click moves the base, a base click moves the thickness. */
function setThickness(t) { S.t = t; const was = S.base.type; if (!fitOK(t, was)) { S.base.type = 'wood'; toast(`${BASES.find(b => b.id === was).n} מחזיק עובי ${fitText(was)}. המעמד הוחלף לבסיס עץ שמתאים ל־${t} מ״מ.`); } rebuildAll(); renderPanel(); }
function setBase(b) { const f = BASE_FIT[b] || [3, 30]; S.base.type = b; if (!fitOK(S.t, b)) { const nt = THICK.filter(x => x >= f[0] && x <= f[1]).reduce((a, x) => Math.abs(x - S.t) < Math.abs(a - S.t) ? x : a); toast(`${BASES.find(x => x.id === b).n} מתאים לעובי ${fitText(b)}. העובי עודכן ל־${nt} מ״מ.`); S.t = nt; } rebuildAll(); renderPanel(); }
function enforceFit() { if (!fitOK(S.t, S.base.type)) S.base.type = 'wood'; }
const isTray = t => t === 'yahrzeit' || t === 'shabbat';
function trayDims(W, T) { const TW = Math.round(S.base.type === 'shabbat' ? W + 230 : Math.max(W * 1.25, W + 80)), TD = Math.round(clamp(W * 0.6, 140, 260)); return { TW, TD, H: 9, pz: -TD / 2 + Math.max(20, T + 12) }; }
function isBlock(t) { return ['wood', 'black', 'clear', 'led', 'metal', 'wedge', 'crystal'].includes(t); }

let lastKey = '';
function rebuildAll() { enforceFit(); rebuildPiece(); rebuildBase(); scheduleDraw(); updateHud(); store.set('ps-design', S); histSoon(); }
function rebuildPiece() {
  const { W, H, T, sd } = dims(); const m = MATERIALS.find(x => x.id === S.mat) || MATERIALS[0];
  if (acrylic) { pieceGroup.remove(acrylic); acrylic.geometry.dispose(); acrylic.material.dispose(); }
  const sx = W / sd.bb.w, sy = H / sd.bb.h, toV = ([x, y]) => new THREE.Vector2((x - sd.bb.x) * sx - W / 2, (sd.bb.y + sd.bb.h - y) * sy);
  const shapes = sd.outers.map(o => { const sh = new THREE.Shape(o.p.map(toV)); o.holes.forEach(h => sh.holes.push(new THREE.Path(h.map(toV)))); return sh; });
  const bev = Math.min(0.45, T * 0.12);
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: T - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -(T - bev * 2) / 2);
  acrylic = new THREE.Mesh(geo, acrylicMaterial(m, T)); acrylic.castShadow = m.kind === 'opaque' || m.kind === 'mirror'; acrylic.receiveShadow = false; pieceGroup.add(acrylic);
  Object.values(planes).forEach(p => { p.scale.set(W, H, 1); p.position.set(0, H / 2, 0); });
  planes.front.position.z = T / 2 + 0.08; planes.engrave.position.z = T / 2 + 0.12; planes.guide.position.z = T / 2 + 1.9; planes.mirror.position.z = T / 2 + 1.6; planes.back.position.z = -T / 2 - 0.08; planes.backw.position.z = -T / 2 - 0.16;
  const t = S.base.type, bh = isBlock(t) ? baseHeight() : 0;
  pieceGroup.position.z = isTray(t) ? trayDims(W, T).pz : 0;
  pieceGroup.position.y = t === 'standoff' ? 40 : t === 'pocket' ? 8 : isTray(t) ? trayDims(W, T).H : (bh ? bh - baseDims().slot.d : 0);
  pieceGroup.rotation.x = 0;
  const top = pieceGroup.position.y + H, dist = Math.max(W * 1.25, top * 1.1, 160) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.62;
  const key = Math.round(W) + 'x' + Math.round(top);
  controls.target.set(0, top / 2, 0);
  if (key !== lastKey) { if (!lastKey) setView('angle', dist); else { const dir = camera.position.clone().sub(controls.target).normalize(); camera.position.copy(controls.target).addScaledVector(dir, dist); } lastKey = key; }
  camera.userData.dist = dist; controls.minDistance = dist * 0.55; controls.maxDistance = dist * 1.6;
  blob.scale.set(W * 1.4, Math.max(T * 6, 60), 1); blob.visible = !isBlock(t) && t !== 'standoff' && t !== 'pocket' && !isTray(t);
  updateEngraveGlow();
}
function rebuildBase() {
  disposeGroup(baseGroup); ledLight.intensity = 0;
  const { W, H, T } = dims(), t = S.base.type; if (t === 'none') return;
  const bdm = baseDims(), bw = bdm.bw, bd = bdm.bd, bh = bdm.bh, led = ledOn();
  const addMesh = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; baseGroup.add(m); return m; };
  if (isBlock(t)) {
    let mat;
    if (t === 'wood') { if (!WOOD) { WOOD = woodTexture(); WOOD._keep = true; } mat = new THREE.MeshStandardMaterial({ map: WOOD, roughness: 0.62, metalness: 0 }); }
    else if (t === 'black' || t === 'led') mat = new THREE.MeshPhysicalMaterial({ color: 0x0c0d11, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 });
    else if (t === 'clear') mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transmission: 1, thickness: bh, ior: 1.49, attenuationColor: new THREE.Color('#dff7f0'), attenuationDistance: 200 });
    else if (t === 'crystal') mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: bh, ior: 1.49, attenuationColor: new THREE.Color('#d2f2ea'), attenuationDistance: 160, clearcoat: 1, clearcoatRoughness: 0.02 });
    else if (t === 'wedge') { if (!WOOD) { WOOD = woodTexture(); WOOD._keep = true; } const tx = WOOD.clone(); tx.needsUpdate = true; tx.repeat.set(1 / 420, 1 / 110); mat = new THREE.MeshStandardMaterial({ map: tx, color: 0x0d0d0f, roughness: 0.45 }); }
    else mat = new THREE.MeshPhysicalMaterial({ color: 0xc9ccd2, metalness: 1, roughness: 0.32 });
    const td = Math.max(T + 18, bd * (t === 'wedge' ? 0.42 : 0.62));
    let body;
    if (t === 'wedge' || t === 'crystal') {
      const pr = t === 'wedge' ? [[-bd / 2, 0], [bd / 2, 0], [td / 2, bh], [-td / 2, bh]] : [[-bd / 2, 0], [bd / 2, 0], [bd / 2, bh * 0.5], [td / 2, bh], [-td / 2, bh], [-bd / 2, bh * 0.5]];
      const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pr.map(([x, y]) => new THREE.Vector2(x, y))), { depth: bw, bevelEnabled: false }); geo.translate(0, 0, -bw / 2); geo.rotateY(Math.PI / 2);
      body = addMesh(geo, mat, 0, 0, 0); if (t === 'crystal') body.castShadow = false;
    } else { body = addMesh(new THREE.BoxGeometry(bw, bh, bd), mat, 0, bh / 2, 0); if (t === 'clear') body.castShadow = false; }
    addMesh(new THREE.BoxGeometry(Math.min(W + 4, bw - 6), 0.6, bdm.slot.w), new THREE.MeshBasicMaterial({ color: led ? new THREE.Color(S.base.led) : 0x111111 }), 0, bh + 0.05, 0).castShadow = false;
    if (led && t !== 'led') { const strip = addMesh(new THREE.BoxGeometry(Math.min(W + 4, bw - 6) + 6, 3, bdm.slot.w + 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(S.base.led).lerp(new THREE.Color('#ffffff'), 0.35) }), 0, bh - 1.2, 0); strip.castShadow = false; }
    if (led) { ledLight.color.set(S.base.led); ledLight.intensity = 2500; ledLight.distance = Math.max(300, H * 2); ledLight.position.set(0, bh + 8, T); }
    if (S.base.plaque && t === 'wedge') {
      const dz = (bd - td) / 2, slant = Math.hypot(dz, bh), pw = bw * 0.84, ph = slant * 0.62, c = document.createElement('canvas'), k = 8; c.width = Math.round(pw * k); c.height = Math.round(ph * k); const g = c.getContext('2d');
      g.fillStyle = '#ffffff'; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = c.height * 0.62; g.font = `700 ${fs}px "Heebo"`; const mw = g.measureText(S.base.plaque).width; if (mw > c.width * 0.92) { fs *= c.width * 0.92 / mw; g.font = `700 ${fs}px "Heebo"`; } g.fillText(S.base.plaque, c.width / 2, c.height / 2);
      const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
      const pl = addMesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.6, depthWrite: false }), 0, bh / 2, (bd + td) / 4 + 0.3); pl.rotation.x = -Math.atan2(dz, bh); pl.castShadow = false;
    } else if (S.base.plaque) {
      const pw = Math.min(bw * 0.78, 220), ph = Math.min(bh * 0.62, 26), c = document.createElement('canvas'), k = 8; c.width = Math.round(pw * k); c.height = Math.round(ph * k); const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, c.width, c.height); gr.addColorStop(0, '#c9a24a'); gr.addColorStop(0.5, '#f1d58b'); gr.addColorStop(1, '#b08a36'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#3a2a0b'; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = c.height * 0.5; g.font = `700 ${fs}px "Frank Ruhl Libre"`; const mw = g.measureText(S.base.plaque).width; if (mw > c.width * 0.9) { fs *= c.width * 0.9 / mw; g.font = `700 ${fs}px "Frank Ruhl Libre"`; } g.fillText(S.base.plaque, c.width / 2, c.height / 2 + fs * 0.05);
      const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
      addMesh(new THREE.PlaneGeometry(pw, t === 'crystal' ? Math.min(ph, bh * 0.36) : ph), new THREE.MeshStandardMaterial({ map: tex, metalness: 0.75, roughness: 0.3 }), 0, t === 'crystal' ? bh * 0.25 : bh / 2, bd / 2 + 0.15).castShadow = false;
    }
  } else if (isTray(t)) {
    const { TW, TD, H: TH, pz } = trayDims(W, T), rc = Math.min(28, TD * 0.18), sh = new THREE.Shape();
    sh.moveTo(-TW / 2 + rc, -TD / 2); sh.lineTo(TW / 2 - rc, -TD / 2); sh.absarc(TW / 2, -TD / 2, rc, Math.PI, Math.PI / 2, true); sh.lineTo(TW / 2, TD / 2 - rc); sh.absarc(TW / 2, TD / 2, rc, -Math.PI / 2, -Math.PI, true);
    sh.lineTo(-TW / 2 + rc, TD / 2); sh.absarc(-TW / 2, TD / 2, rc, 0, -Math.PI / 2, true); sh.lineTo(-TW / 2, -TD / 2 + rc); sh.absarc(-TW / 2, -TD / 2, rc, Math.PI / 2, 0, true);
    const plate = (d, y, mat) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 12 }); geo.rotateX(-Math.PI / 2); return addMesh(geo, mat, 0, y, 0); };
    const gold = new THREE.MeshPhysicalMaterial({ color: 0xe2bd55, metalness: 1, roughness: 0.16, clearcoat: 1, envMapIntensity: 1.7, emissive: 0x3a2806 });
    plate(TH - 3, 0, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transmission: 1, thickness: 6, ior: 1.49, attenuationColor: new THREE.Color('#d2f2ea'), attenuationDistance: 160 })).castShadow = false; plate(3, TH - 3, gold);
    [1, -1].forEach(s => addMesh(new THREE.BoxGeometry(W + 12, 9, 3), gold, 0, TH + 4.5, pz + s * (T / 2 + 1.6)));
    const lit = !S.base.unlit, flames = [];
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: 4, ior: 1.5 }), wax = new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.6 }), tin = new THREE.MeshPhysicalMaterial({ color: 0xc9ccd2, metalness: 1, roughness: 0.3 });
    const cyl = (r, h, mat, x, y, z, rt = r) => addMesh(new THREE.CylinderGeometry(rt, r, h, 32), mat, x, y + h / 2, z);
    const fz = TD * 0.16, side = t === 'shabbat' ? TW / 2 - 55 : TW / 2 - Math.max(46, TW * 0.16);
    if (t === 'yahrzeit') {
      addMesh(new THREE.BoxGeometry(68, 4, 68), glass, -side, TH + 2, fz).castShadow = false; cyl(26, 62, new THREE.MeshPhysicalMaterial({ color: 0x4a3f8f, metalness: 0.4, roughness: 0.35, clearcoat: 0.6 }), -side, TH + 4, fz); cyl(24, 2, wax, -side, TH + 64, fz); flames.push([-side, TH + 66, fz]);
      addMesh(new THREE.BoxGeometry(56, 38, 56), glass, side, TH + 19, fz).castShadow = false; cyl(19, 12, tin, side, TH + 6, fz); cyl(17, 1, wax, side, TH + 17.5, fz); flames.push([side, TH + 19, fz]);
    } else [-side, side].forEach(x => { cyl(11, 26, glass, x, TH, fz, 16).castShadow = false; cyl(9, 110, wax, x, TH + 24, fz); flames.push([x, TH + 134, fz]); });
    if (lit) flames.forEach(([x, y, z]) => {
      const f = addMesh(new THREE.ConeGeometry(3.6, 15, 16), new THREE.MeshBasicMaterial({ color: 0xffd58a }), x, y + 8, z); f.castShadow = false; f.geometry.scale(1, 1, 1);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xffb35c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.position.set(x, y + 9, z); sp.scale.setScalar(34); baseGroup.add(sp);
      const L = new THREE.PointLight(0xffa24d, 900, 0, 2); L.position.set(x, y + 14, z); baseGroup.add(L);
    });
    if (S.base.plaque) {
      const pw = t === 'shabbat' ? W * 0.9 : Math.max(80, 2 * side - 80), ph = TD * 0.42, c = document.createElement('canvas'), k = 7; c.width = Math.round(pw * k); c.height = Math.round(ph * k); const g = c.getContext('2d');
      const lines = S.base.plaque.split(/\n| \/ /); g.fillStyle = '#4a3410'; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = Math.min(c.height / lines.length * 0.78, c.height * 0.4); g.font = `700 ${fs}px "Frank Ruhl Libre"`;
      const mw = Math.max(...lines.map(l => g.measureText(l).width)); if (mw > c.width * 0.94) { fs *= c.width * 0.94 / mw; g.font = `700 ${fs}px "Frank Ruhl Libre"`; }
      lines.forEach((l, i) => g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.2));
      const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
      const pl = addMesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshStandardMaterial({ map: tex, transparent: true, metalness: 0.3, roughness: 0.5, depthWrite: false }), 0, TH + 0.25, fz + 4); pl.rotation.x = -Math.PI / 2; pl.castShadow = false;
    }
  } else if (t === 'pocket') {
    const ph = Math.round(clamp(H * 0.34, 35, 150)), pw = W + 14, gap = T + 1.5, wall = 4, footD = Math.max(64, T + 54);
    const clr = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: 5, ior: 1.49, attenuationColor: new THREE.Color('#d2f2ea'), attenuationDistance: 160, clearcoat: 1 });
    [addMesh(new THREE.BoxGeometry(pw + 34, 8, footD), clr, 0, 4, 0), addMesh(new THREE.BoxGeometry(pw, ph, wall), clr, 0, 8 + ph / 2, gap / 2 + wall / 2), addMesh(new THREE.BoxGeometry(pw, ph, wall), clr, 0, 8 + ph / 2, -gap / 2 - wall / 2),
     addMesh(new THREE.BoxGeometry(wall, ph, gap + wall * 2), clr, -pw / 2 + wall / 2, 8 + ph / 2, 0), addMesh(new THREE.BoxGeometry(wall, ph, gap + wall * 2), clr, pw / 2 - wall / 2, 8 + ph / 2, 0)].forEach(m => m.castShadow = false);
  } else if (t === 'easel') {
    const sw = Math.min(W * 0.32, 70), sh = H * 0.62, m = acrylicMaterial(MATERIALS[0], T);
    const strut = addMesh(new THREE.BoxGeometry(sw, sh, T), m, 0, 0, 0); strut.geometry.translate(0, sh / 2, 0); strut.position.set(0, 0, -T / 2 - sh * Math.sin(0.35) / 2); strut.rotation.x = -0.35; strut.castShadow = false;
  } else if (t === 'standoff') {
    const wall = addMesh(new THREE.BoxGeometry(Math.max(W * 2.2, 500), Math.max(H * 1.8 + 80, 400), 8), new THREE.MeshStandardMaterial({ color: new THREE.Color(cssVar('--scene-floor') || '#dfe4ec'), roughness: 0.95 }), 0, Math.max(H * 1.8 + 80, 400) / 2, -T / 2 - 24); wall.castShadow = false;
    const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe6e8ec, metalness: 1, roughness: 0.15 });
    const inset = Math.min(W, H) * 0.12 + 6;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const x = sx * (W / 2 - inset), y = 40 + H / 2 + sy * (H / 2 - inset);
      const c1 = addMesh(new THREE.CylinderGeometry(6, 6, 20 + T + 6, 32), chrome, x, y, -T / 2 - 20 + (20 + T + 6) / 2); c1.rotation.x = Math.PI / 2;
    });
  }
}
function updateEngraveGlow() { const led = ledOn(); const m = planes.engrave.material; m.emissive.set(led ? S.base.led : '#000000'); m.emissiveIntensity = led ? 1.6 : 0; m.opacity = led ? 0.9 : 0.72; m.needsUpdate = true; }
function setView(v, dist) {
  dist = dist || camera.userData.dist || 600; const t = controls.target; pieceGroup.rotation.y = baseGroup.rotation.y = 0;
  const dirs = { front: [0, 0.06, 1], angle: [-0.55, 0.32, 0.85], side: [1, 0.12, 0.08], back: [0.2, 0.15, -1] }; const d = new THREE.Vector3(...dirs[v]).normalize();
  camera.position.copy(t).addScaledVector(d, dist); camera.lookAt(t);
}
function toggleSpin(on) { spin = on; $('#bSpin').setAttribute('aria-pressed', on); if (!on) { pieceGroup.rotation.y = baseGroup.rotation.y = 0; } }

/* ---------- Print layers (UV / reverse / engraving) ---------- */
let drawQueued = false, boxes = {};
function scheduleDraw() { if (drawQueued) return; drawQueued = true; requestAnimationFrame(() => { drawQueued = false; drawPrint(); }); }
const fontReady = new Set();
function ensureFont(f, w) { const k = w + ' ' + f; if (fontReady.has(k)) return true; if (document.fonts && document.fonts.check(`${w} 40px "${f}"`)) { fontReady.add(k); return true; } document.fonts && document.fonts.load(`${w} 40px "${f}"`, 'אבג').then(() => { fontReady.add(k); scheduleDraw(); rebuildBase(); }).catch(() => fontReady.add(k)); return false; }
const tintCache = new Map();
function tinted(src, key, color) { const k = key + color; if (tintCache.has(k)) return tintCache.get(k); const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); if (tintCache.size > 60) tintCache.clear(); tintCache.set(k, c); return c; }
function drawElement(g, el, cw, ch, forEngrave) {
  const x = el.fx * cw, y = el.fy * ch, rot = (el.rot || 0) * Math.PI / 180; let hw = 0, hh = 0;
  g.save(); g.translate(x, y); g.rotate(rot);
  const col = forEngrave ? '#ffffff' : el.color;
  if (el.type === 'text') {
    const px = el.s * cw; ensureFont(el.font, el.weight); g.font = `${el.weight} ${px}px "${el.font}"`; g.direction = 'rtl'; g.textBaseline = 'middle';
    const lines = String(el.text || '').split('\n'), lh = px * 1.18; let mw = 0; lines.forEach(l => mw = Math.max(mw, g.measureText(l).width));
    const ax = el.align === 'right' ? mw / 2 : el.align === 'left' ? -mw / 2 : 0; g.textAlign = el.align || 'center';
    if (el.plate) {
      const pad = px * 0.35, pw = mw + pad * 2, ph = lh * lines.length + pad * 1.2, pc = document.createElement('canvas'); pc.width = Math.ceil(pw); pc.height = Math.ceil(ph); const q = pc.getContext('2d');
      q.fillStyle = col; rrPath(q, 0, 0, pw, ph, px * 0.12); q.fill(); q.globalCompositeOperation = 'destination-out'; q.font = g.font; q.direction = 'rtl'; q.textBaseline = 'middle'; q.textAlign = el.align || 'center';
      lines.forEach((l, i) => q.fillText(l, pw / 2 + ax, ph / 2 - lh * lines.length / 2 + lh * (i + 0.5)));
      g.drawImage(pc, -pw / 2, -ph / 2); g.restore(); hw = pw / 2; hh = ph / 2;
      const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)), ex = hw * c + hh * s, ey = hw * s + hh * c;
      return { x0: (x - ex) / cw, x1: (x + ex) / cw, y0: (y - ey) / ch, y1: (y + ey) / ch, hw: hw / cw, hh: hh / ch, rot };
    }
    lines.forEach((l, i) => { const ly = -lh * lines.length / 2 + lh * (i + 0.5); if (el.outline > 0 && !forEngrave) { g.lineJoin = 'round'; g.lineWidth = el.outline * px * 0.08; g.strokeStyle = el.ocolor; g.strokeText(l, ax, ly); } g.fillStyle = col; g.fillText(l, ax, ly); });
    hw = mw / 2; hh = lh * lines.length / 2;
  } else if (el.type === 'image') {
    const p = loadImg(el.src); if (p.ok) { const w = el.s * cw, h = w * p.im.height / p.im.width; hw = w / 2; hh = h / 2; const src = forEngrave || el.mono ? tinted(p.im, el.src.slice(-40) + el.src.slice(90, 170) + el.src.length, forEngrave ? '#ffffff' : el.color) : p.im; g.drawImage(src, -hw, -hh, w, h); }
  } else if (el.type === 'symbol') {
    const sd = shapeData(el.shape); if (sd) { const w = el.s * cw, h = w / sd.aspect; hw = w / 2; hh = h / 2; g.drawImage(tinted(sd.mask, 'sym:' + el.shape, col), -hw, -hh, w, h); }
  } else if (el.type === 'badge') {
    const w = el.s * cw; hw = hh = w / 2; g.drawImage(badgeCanvas(el, forEngrave, Math.min(2400, Math.max(320, Math.ceil(w / 160) * 160))), -hw, -hw, w, w);
  }
  g.restore();
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)), ex = hw * c + hh * s, ey = hw * s + hh * c;
  return { x0: (x - ex) / cw, x1: (x + ex) / cw, y0: (y - ey) / ch, y1: (y + ey) / ch, hw: hw / cw, hh: hh / ch, rot };
}
const erodeCache = new Map();
function drawBg(cw, ch, k, sd) {
  const b = S.bg, c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
  if (b.type === 'color') { g.fillStyle = b.c1; g.fillRect(0, 0, cw, ch); }
  else if (b.type === 'gradient') { const a = b.ang * Math.PI / 180, r = Math.hypot(cw, ch) / 2, gr = g.createLinearGradient(cw / 2 - Math.cos(a) * r, ch / 2 - Math.sin(a) * r, cw / 2 + Math.cos(a) * r, ch / 2 + Math.sin(a) * r); gr.addColorStop(0, b.c1); gr.addColorStop(1, b.c2); g.fillStyle = gr; g.fillRect(0, 0, cw, ch); }
  else if (b.type === 'image' && b.src) { const p = loadImg(b.src); if (p.ok) { const s = Math.max(cw / p.im.width, ch / p.im.height); g.drawImage(p.im, (cw - p.im.width * s) / 2, (ch - p.im.height * s) / 2, p.im.width * s, p.im.height * s); } }
  const r = Math.round((b.inset || 0) * k), key = S.shape + (S.custom ? S.custom.key : '') + cw + 'x' + ch + ':' + r;
  let m = erodeCache.get(key);
  if (!m) { const base = document.createElement('canvas'); base.width = cw; base.height = ch; base.getContext('2d').drawImage(sd.mask, 0, 0, cw, ch); m = base;
    if (r > 0) { m = document.createElement('canvas'); m.width = cw; m.height = ch; const mg = m.getContext('2d'); mg.drawImage(base, 0, 0); mg.globalCompositeOperation = 'destination-in'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; mg.drawImage(base, Math.cos(a) * r, Math.sin(a) * r); } for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mg.drawImage(base, Math.cos(a) * r / 2, Math.sin(a) * r / 2); } }
    if (erodeCache.size > 8) erodeCache.clear(); erodeCache.set(key, m); }
  g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0); g.globalCompositeOperation = 'source-over';
  if (b.op < 1) { const o = document.createElement('canvas'); o.width = cw; o.height = ch; const og = o.getContext('2d'); og.globalAlpha = b.op; og.drawImage(c, 0, 0); return o; }
  return c;
}
function drawPrint() {
  if (!renderer) return; const { W, H, sd } = dims(); const k = Math.min(1600 / W, 1600 / H, 9), cw = Math.max(8, Math.round(W * k)), ch = Math.max(8, Math.round(H * k));
  Object.values(canv).forEach(c => { if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; c.tex.dispose(); } const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cw, ch); });
  boxes = {};
  if (S.bg.type !== 'none') { const tc = drawBg(cw, ch, k, sd); canv[S.bg.side === 'front' || opaqueMat() ? 'front' : 'back'].getContext('2d').drawImage(tc, 0, 0); }
  S.els.forEach(el => { if (el.hidden) return; const f = finOf(el), c = canv[f] || canv.front; boxes[el.id] = drawElement(c.getContext('2d'), el, cw, ch, f === 'engrave'); });
  ['front', 'back', 'engrave', 'mirror'].forEach(n => { const g = canv[n].getContext('2d'); g.globalCompositeOperation = 'destination-in'; g.drawImage(sd.mask, 0, 0, cw, ch); g.globalCompositeOperation = 'source-over'; });
  { const g = canv.backw.getContext('2d'); g.drawImage(canv.back, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, cw, ch); g.globalCompositeOperation = 'source-over'; }
  const fm = planes.front.material; fm.opacity = S.white ? 1 : 0.82;
  const gg = canv.guide.getContext('2d'); const b = sel && boxes[sel];
  if (b) { gg.save(); gg.translate((b.x0 + b.x1) / 2 * cw, (b.y0 + b.y1) / 2 * ch); gg.rotate(b.rot); const w = b.hw * cw + 10, h = b.hh * ch + 10; gg.setLineDash([12, 8]); gg.lineWidth = Math.max(3, cw / 400); gg.strokeStyle = '#0038b8'; gg.strokeRect(-w, -h, w * 2, h * 2); gg.setLineDash([]); gg.fillStyle = '#0038b8'; [[-w, -h], [w, -h], [-w, h], [w, h]].forEach(([x, y]) => gg.fillRect(x - 6, y - 6, 12, 12)); gg.restore(); }
  if (drag && (snapX || snapY)) { gg.save(); gg.strokeStyle = '#e0245e'; gg.lineWidth = Math.max(2, cw / 600); gg.beginPath(); if (snapX) { gg.moveTo(cw / 2, 0); gg.lineTo(cw / 2, ch); } if (snapY) { gg.moveTo(0, ch / 2); gg.lineTo(cw, ch / 2); } gg.stroke(); gg.restore(); }
  Object.values(canv).forEach(c => { c.tex.image = c; c.tex.needsUpdate = true; });
  const hasBack = S.els.some(e => finOf(e) === 'back') || (S.bg.type !== 'none' && S.bg.side !== 'front' && !opaqueMat()); planes.back.visible = hasBack; planes.backw.visible = hasBack && S.white; planes.engrave.visible = S.els.some(e => e.fin === 'engrave'); planes.mirror.visible = S.els.some(e => e.fin === 'mirror');
  drawPrintPreview(); updateHud(); if (ed2On) ed2Draw();
}
function drawPrintPreview() {
  const pv = $('#pfPrev'); if (!pv) return; const src = canv.back, s = Math.min(1, 320 / src.width), w = Math.max(2, Math.round(src.width * s)), h = Math.max(2, Math.round(src.height * s)); pv.width = w; pv.height = h;
  const g = pv.getContext('2d'); g.clearRect(0, 0, w, h); g.save(); g.globalAlpha = 0.18; g.drawImage(shapeData(S.shape).mask, 0, 0, w, h); g.restore(); g.save(); g.translate(w, 0); g.scale(-1, 1); g.drawImage(src, 0, 0, w, h); g.restore();
}

/* ---------- Pointer: drag elements directly on the piece ---------- */
let drag = null, downAt = null;
function hit(e) { const r = e.target.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, camera); const h = ray.intersectObject(hitPlane, false)[0]; return h && h.uv ? { u: h.uv.x, v: 1 - h.uv.y } : null; }
function onDown(e) {
  downAt = [e.clientX, e.clientY]; const h = hit(e); if (!h) return;
  for (let i = S.els.length - 1; i >= 0; i--) { const el = S.els[i], b = boxes[el.id]; if (b && h.u >= b.x0 && h.u <= b.x1 && h.v >= b.y0 && h.v <= b.y1) { sel = el.id; drag = { el, ox: el.fx - h.u, oy: el.fy - h.v }; controls.enabled = false; e.target.setPointerCapture(e.pointerId); scheduleDraw(); if (tab !== 'design') { tab = 'design'; } renderPanel(); return; } }
}
function onMove(e) { if (!drag) return; const h = hit(e); if (!h) return; let fx = clamp(h.u + drag.ox, 0, 1), fy = clamp(h.v + drag.oy, 0, 1); snapX = Math.abs(fx - 0.5) < 0.015; snapY = Math.abs(fy - 0.5) < 0.015; if (snapX) fx = 0.5; if (snapY) fy = 0.5; drag.el.fx = fx; drag.el.fy = fy; scheduleDraw(); }
function onUp(e) {
  if (drag) { drag = null; snapX = snapY = false; scheduleDraw(); controls.enabled = true; store.set('ps-design', S); histSoon(); renderPanel(); return; }
  if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4 && sel) { const h = hit(e); if (!h) { sel = null; scheduleDraw(); renderPanel(); } }
  downAt = null;
}

/* ---------- Pricing ---------- */
function discFor(q) { let d = 0; R.disc.forEach(([m, v]) => { if (q >= m) d = v; }); return d; }
function calc(st = S, opt = {}) {
  const sd = shapeData(st.shape); const W = st.w, H = st.lock || !st.h ? Math.round(st.w / sd.aspect) : st.h, T = st.t;
  const m = MATERIALS.find(x => x.id === st.mat) || MATERIALS[0];
  const lines = []; const L = (n, v, d) => { if (v > 0.004) lines.push({ n, v, d }); };
  const areaM2 = W * H / 1e6 * R.waste; L('לוח פרספקס ' + T + ' מ״מ · ' + m.n, areaM2 * (R.sheet[T] || 700) * m.mult, (W / 10).toFixed(1) + '×' + (H / 10).toFixed(1) + ' ס״מ');
  const per = perimeterMm(sd, W, H); L('חיתוך לייזר וליטוש קצוות', per / 1000 * R.cutPerM * Math.max(1, T / 5), (per / 10).toFixed(0) + ' ס״מ קו חיתוך');
  let uvA = 0, engA = 0, mirA = 0, back = false;
  if (opt.uvArea != null) { uvA = opt.uvArea; engA = opt.engArea || 0; }
  else st.els.forEach(el => { const b = boxes[el.id]; if (!b || el.hidden) return; const a = (b.x1 - b.x0) * W * (b.y1 - b.y0) * H * (el.type === 'symbol' && shapeData(el.shape) ? shapeData(el.shape).fill : 1); const f = finOf(el, st); if (f === 'engrave') engA += a; else if (f === 'mirror') mirA += a; else { uvA += a; if (f === 'back') back = true; } });
  if (st.bg && st.bg.type !== 'none' && opt.uvArea == null) { uvA += sd.fill * W * H; if (st.bg.side !== 'front' && !opaqueMat(st)) back = true; }
  uvA = Math.min(uvA, W * H); engA = Math.min(engA, W * H);
  if (uvA > 0) L('הדפסת UV ישירה' + (st.white ? ' + שכבת לבן' : '') + (back ? ' (מאחור)' : ''), Math.max(R.uvMin, uvA / 1e6 * R.uvPerM2 * (1 + (st.white ? R.white : 0) + (back ? R.reverse : 0))), Math.round(uvA / 100) + ' סמ״ר');
  if (mirA > 0) L('אפליקציית פרספקס מראה מודבקת', Math.max(R.mirMin, mirA / 100 * R.mirPerCm2), Math.round(mirA / 100) + ' סמ״ר');
  if (engA > 0) L('חריטת לייזר', Math.max(R.engMin, engA / 100 * R.engPerCm2), Math.round(engA / 100) + ' סמ״ר');
  const bt = st.base.type, bb = R.bases[bt] || [0, 0], bw = st.base.w || Math.round(clamp(W * 1.08, 80, W + 50));
  if (bt !== 'none') L('מעמד: ' + BASES.find(b => b.id === bt).n, bb[0] + bb[1] * (isBlock(bt) || bt === 'pocket' || isTray(bt) ? (isTray(bt) ? trayDims(W, T).TW : bw) / 10 : 0), isBlock(bt) || bt === 'pocket' || isTray(bt) ? ((isTray(bt) ? trayDims(W, T).TW : bw) / 10).toFixed(1) + ' ס״מ רוחב' : '');
  if (st.base.ledOn && bt !== 'led' && isBlock(bt)) L('תאורת LED בבסיס', R.ledAdd, 'פס לד מתחת לחריץ + ספק כוח');
  if (st.base.plaque && isBlock(bt)) L(bt === 'wedge' ? 'הדפסה על חזית הבסיס' : 'לוחית מתכת חרוטה על הבסיס', R.plaque);
  if (st.gift) L('קופסת מתנה מרופדת', R.gift);
  const raw = lines.reduce((a, l) => a + l.v, 0), q = Math.max(1, st.qty | 0), disc = discFor(q), rush = R.rush[st.rush] || 0;
  const unit = Math.max(R.minUnit, raw * (1 - disc) * (1 + rush));
  const sub = unit * q + R.setup, vat = sub * R.vat;
  return { lines, raw, disc, rush, unit, q, setup: R.setup, sub, vat, total: sub + vat, unitVat: unit * (1 + R.vat), W, H, T };
}
function updateHud() {
  if (!renderer) return; const c = calc(), { W, H, T } = dims();
  $('#dims').textContent = `${W} × ${H} × ${T} מ״מ`;
  $('#ticket').innerHTML = `<div><div class="k">מחיר ליחידה כולל מע״מ</div><div class="v">${ils(c.unitVat)}</div></div><div class="sep"></div><div><div class="k">${c.q} יח׳${c.disc ? ' · הנחת כמות ' + Math.round(c.disc * 100) + '%' : ''}${c.rush ? ' · תוספת דחיפות' : ''}</div><div class="v">${ils(c.total)} <small>סה״כ</small></div></div><button class="btn gold sm" id="bTicket">פירוט</button>`;
  $('#bTicket').onclick = openQuote;
}

/* ---------- Panels ---------- */
const thumbs = new Map();
function thumb(def) { if (thumbs.has(def.id)) return thumbs.get(def.id); const c = rasterDef(def, 120, 0.1); thumbs.set(def.id, c); return c; }
function drawThumbs() {
  $$('canvas[data-th]').forEach(cv => {
    const def = shapeById(cv.dataset.th); if (!def) return; const src = thumb(def), g = cv.getContext('2d'); cv.width = cv.height = 120; g.clearRect(0, 0, 120, 120);
    const s = Math.min(108 / src.width, 108 / src.height); const ink = cssVar('--fg') || '#141b2d';
    g.drawImage(tinted(src, 'th:' + def.id + document.fonts.status, ink), (120 - src.width * s) / 2, (120 - src.height * s) / 2, src.width * s, src.height * s);
  });
}
function panelShape() {
  const list = SHAPES.filter(s => (cat === 'all' || s.c === cat) && (!query || s.n.includes(query)));
  return `<div class="sec"><h3>${SHAPES.length} צורות לחיתוך לייזר</h3>
  <div class="chips">${CATS.map(c => `<button class="chip" data-cat="${c.id}" aria-pressed="${cat === c.id}">${c.name} <small>${c.id === 'all' ? SHAPES.length : SHAPES.filter(s => s.c === c.id).length}</small></button>`).join('')}</div>
  <input type="text" id="q" placeholder="חיפוש צורה: מנורה, מפה, לב…" value="${esc(query)}">
  <div class="grid-shapes">${list.map(s => `<button class="shp" data-shape="${s.id}" aria-pressed="${S.shape === s.id}" title="${esc(s.n)}"><canvas data-th="${s.id}" width="120" height="120"></canvas><small>${esc(s.n)}</small></button>`).join('') || '<p class="hint">לא נמצאו צורות.</p>'}</div></div>
  <div class="sec"><h3>צורה משלכם</h3>
   <div class="upl"><b>חיתוך לפי קו מתאר של PNG</b><p class="hint">לוגו או איור עם רקע שקוף. נחתוך סביבו ונדפיס אותו על הפרספקס.</p>
    <input type="file" id="pngShape" accept="image/png,image/webp,image/jpeg">
    <div class="field"><label for="margin">שוליים</label><input type="range" id="margin" min="0" max="15" step="1" value="${S.custom && S.custom.kind === 'png' ? S.custom.margin : 4}"><span>${S.custom && S.custom.kind === 'png' ? S.custom.margin : 4} מ״מ</span></div></div>
   <div class="upl"><b>חיתוך שם או מילה</b>
    <input type="text" id="ctext" value="${esc(S.custom && S.custom.kind === 'text' ? S.custom.text : 'משפחת לוי')}">
    <div class="row"><select id="cfont">${FONTS.map(([f, n]) => `<option value="${f}" ${(S.custom && S.custom.font === f) ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <select id="cmode"><option value="holes">אותיות חלולות</option><option value="solid" ${S.custom && S.custom.mode === 'solid' ? 'selected' : ''}>מתאר מלא</option></select>
    <button class="btn sm primary" id="cgo">צור צורה</button></div></div></div>`;
}
function panelSize() {
  const { W, H } = dims();
  return `<div class="sec"><h3>מידות (מ״מ)</h3>
   <div class="field"><label for="w">רוחב</label><input type="range" id="w" min="40" max="600" step="5" value="${W}"><input type="number" id="wn" min="40" max="1200" value="${W}"></div>
   <div class="field"><label for="h">גובה</label><input type="range" id="h" min="40" max="900" step="5" value="${H}" ${S.lock ? 'disabled' : ''}><input type="number" id="hn" min="40" max="1500" value="${H}" ${S.lock ? 'disabled' : ''}></div>
   <label class="row"><input type="checkbox" id="lock" ${S.lock ? 'checked' : ''}> שמירה על פרופורציות הצורה</label>
   <div class="chips">${[[100, 'A6'], [150, 'A5'], [210, 'A4'], [300, 'A3']].map(([w, n]) => `<button class="chip" data-w="${w}">${n} · ${w / 10} ס״מ</button>`).join('')}</div></div>
  <div class="sec"><h3>עובי הפרספקס</h3><div class="chips">${THICK.map(t => `<button class="chip${fitOK(t, S.base.type) ? '' : ' off'}" data-t="${t}" aria-pressed="${S.t === t}" title="${fitOK(t, S.base.type) ? '' : 'יחליף את המעמד לבסיס עץ'}">${t} מ״מ</button>`).join('')}</div>
   <p class="hint">${esc(BASES.find(b => b.id === S.base.type).n)} מחזיק עובי ${fitText(S.base.type)}. עובי מחוץ לטווח יחליף את המעמד אוטומטית, והחריץ במעמד נחתך תמיד לפי העובי (${slotDims(S.t, dims().H).w} מ״מ).</p>
   <p class="hint">10 מ״מ הוא העובי הנפוץ למגני הוקרה. 20–30 מ״מ נותנים מראה של בלוק זכוכית אקרילית מלאה.</p></div>
  <div class="sec"><h3>צבע וחומר</h3><div class="swatches">${MATERIALS.map(m => `<button class="sw" data-mat="${m.id}" aria-pressed="${S.mat === m.id}"><i style="background:${m.kind === 'clear' ? 'linear-gradient(135deg,#ffffff,#d8eef0)' : m.kind === 'frost' ? 'linear-gradient(135deg,#f6f7f9,#dfe3ea)' : m.kind === 'mirror' ? `linear-gradient(135deg,${m.col},#fff,${m.col})` : m.col};opacity:${m.kind === 'tint' ? 0.75 : 1}"></i>${m.n}</button>`).join('')}</div></div>`;
}
function elLabel(e) { return e.type === 'text' ? (e.text || '').split('\n')[0] || 'טקסט' : e.type === 'image' ? 'תמונה' : e.type === 'badge' ? 'סמל: ' + e.title : 'סמל: ' + (shapeById(e.shape) || {}).n; }
function panelDesign() {
  const e = S.els.find(x => x.id === sel);
  let ed = '';
  if (e) {
    const common = `<div class="row"><label>גימור</label><div class="chips">${Object.entries(FIN).map(([k, n]) => `<button class="chip" data-fin="${k}" aria-pressed="${e.fin === k}">${n}</button>`).join('')}</div></div>
     <div class="field"><label for="e_s">גודל</label><input type="range" id="e_s" min="0.01" max="${e.type === 'text' ? 0.5 : 1.2}" step="0.005" value="${e.s}"><span>${Math.round(e.s * S.w)} מ״מ</span></div>
     <div class="field"><label for="e_fx">אופקי</label><input type="range" id="e_fx" min="0" max="1" step="0.005" value="${e.fx}"><span></span></div>
     <div class="field"><label for="e_fy">אנכי</label><input type="range" id="e_fy" min="0" max="1" step="0.005" value="${e.fy}"><span></span></div>
     <div class="field"><label for="e_rot">סיבוב</label><input type="range" id="e_rot" min="-180" max="180" step="1" value="${e.rot}"><span>${e.rot}°</span></div>`;
    let specific = '';
    if (e.type === 'text') specific = `<textarea id="e_text" dir="rtl" aria-label="טקסט">${esc(e.text)}</textarea>
     <div class="row"><select id="e_font" aria-label="גופן">${FONTS.map(([f, n]) => `<option value="${f}" ${e.font === f ? 'selected' : ''} style="font-family:'${f}'">${n}</option>`).join('')}</select>
      <select id="e_weight" aria-label="משקל"><option value="400" ${e.weight == 400 ? 'selected' : ''}>רגיל</option><option value="700" ${e.weight == 700 ? 'selected' : ''}>מודגש</option><option value="900" ${e.weight == 900 ? 'selected' : ''}>שחור</option></select>
      <input type="color" id="e_color" value="${e.color}" aria-label="צבע" ${e.fin === 'engrave' ? 'disabled' : ''}></div>
     <div class="row"><label>יישור</label><div class="chips">${[['right', 'ימין'], ['center', 'מרכז'], ['left', 'שמאל']].map(([a, n]) => `<button class="chip" data-align="${a}" aria-pressed="${e.align === a}">${n}</button>`).join('')}</div></div>
     <label class="row"><input type="checkbox" id="e_plate" ${e.plate ? 'checked' : ''}> לוחית עם טקסט חלול (כמו שלט זהב)</label>
     <div class="field"><label for="e_outline">קו מתאר</label><input type="range" id="e_outline" min="0" max="3" step="0.1" value="${e.outline}"><input type="color" id="e_ocolor" value="${e.ocolor}" aria-label="צבע קו מתאר"></div>`;
    else if (e.type === 'image') specific = `<div class="row"><button class="btn sm gold" id="e_fx">✦ אפקט שחור־לבן להנצחה</button></div><div class="row"><input type="file" id="e_img" accept="image/*" aria-label="החלפת תמונה"></div><label class="row"><input type="checkbox" id="e_mono" ${e.mono ? 'checked' : ''}> צבע אחיד</label><div class="row"><label>צבע</label><input type="color" id="e_color" value="${e.color || '#1c2c5b'}"></div>`;
    else if (e.type === 'badge') specific = `<input type="text" id="e_title" value="${esc(e.title)}" aria-label="שם בסמל"><input type="text" id="e_sub" value="${esc(e.sub || '')}" aria-label="שורה תחתונה"><div class="row"><label>צבעים</label><input type="color" id="e_c1" value="${e.c1}" aria-label="רקע הסמל"><input type="color" id="e_c2" value="${e.c2}" aria-label="צבע הסמל"></div>`;
    else specific = `<div class="row"><label>סמל</label><select id="e_shape">${SHAPES.filter(s => s.c !== 'basic').map(s => `<option value="${s.id}" ${e.shape === s.id ? 'selected' : ''}>${s.n}</option>`).join('')}</select><input type="color" id="e_color" value="${e.color}" aria-label="צבע" ${e.fin === 'engrave' ? 'disabled' : ''}></div>`;
    ed = `<div class="editor"><div class="row" style="justify-content:space-between"><b>${esc(elLabel(e))}</b><div class="row"><button class="btn sm" id="e_up" title="קדימה">↑</button><button class="btn sm" id="e_down" title="אחורה">↓</button><button class="btn sm" id="e_dup">שכפול</button><button class="btn sm danger" id="e_del">מחיקה</button></div></div>${specific}${common}<div class="row"><label>מיקום</label><button class="btn sm" data-pos="h">מרכז אופקי</button><button class="btn sm" data-pos="v">מרכז אנכי</button><button class="btn sm" data-pos="fit">התאמה לרוחב</button></div></div>`;
  }
  return `<div class="sec"><h3>הוספה</h3><div class="row"><button class="btn" id="addText">＋ טקסט</button><label class="btn" for="addImg">＋ תמונת PNG</label><button class="btn gold" id="addFx">＋ תמונת הנצחה</button><input type="file" id="addImg" accept="image/*" class="sr"><button class="btn" id="addSym">＋ סמל</button></div>
   <p class="hint">גררו כל אלמנט ישירות על הפרספקס בתצוגה. ההדפסה נחתכת אוטומטית לפי קו המתאר.</p></div>
  <div class="sec"><h3>שכבות</h3><div class="layers">${S.els.slice().reverse().map(x => `<button class="layer" data-sel="${x.id}" aria-pressed="${x.id === sel}"><span class="t">${esc(elLabel(x))}</span><span class="tagf">${FIN[x.fin]}</span></button>`).join('') || '<p class="hint">אין עדיין אלמנטים. הוסיפו טקסט, תמונה או סמל.</p>'}</div></div>
  ${ed}
  <div class="sec"><h3>רקע להדפסה</h3>
   <div class="chips">${[['none', 'ללא (שקוף)'], ['color', 'צבע'], ['gradient', 'מעבר צבע'], ['image', 'תמונה']].map(([v, n]) => `<button class="chip" data-bgt="${v}" aria-pressed="${S.bg.type === v}">${n}</button>`).join('')}</div>
   ${S.bg.type === 'gradient' || S.bg.type === 'color' ? `<div class="chips">${BG_PRESETS.map((p, i) => `<button class="chip" data-bgp="${i}" style="background:linear-gradient(90deg,${p[1]},${p[2]});color:#fff;text-shadow:0 1px 2px #0008">${p[0]}</button>`).join('')}</div>
   <div class="row"><label>צבעים</label><input type="color" id="bg_c1" value="${S.bg.c1}" aria-label="צבע ראשון">${S.bg.type === 'gradient' ? `<input type="color" id="bg_c2" value="${S.bg.c2}" aria-label="צבע שני"><input type="range" id="bg_ang" min="0" max="360" step="5" value="${S.bg.ang}" aria-label="כיוון" style="flex:1">` : ''}</div>` : ''}
   ${S.bg.type === 'image' ? `<input type="file" id="bg_img" accept="image/*" aria-label="תמונת רקע"><p class="hint">התמונה ממלאת את כל הצורה ונחתכת לפי קו המתאר.</p>` : ''}
   ${S.bg.type !== 'none' ? `<div class="field"><label for="bg_inset">שוליים שקופים</label><input type="range" id="bg_inset" min="0" max="25" step="1" value="${S.bg.inset}"><span>${S.bg.inset} מ״מ</span></div>
   <div class="field"><label for="bg_op">אטימות</label><input type="range" id="bg_op" min="0.2" max="1" step="0.05" value="${S.bg.op}"><span>${Math.round(S.bg.op * 100)}%</span></div>
   <div class="row"><label>צד</label><div class="chips"><button class="chip" data-bgside="back" aria-pressed="${S.bg.side !== 'front'}">מאחור (מומלץ)</button><button class="chip" data-bgside="front" aria-pressed="${S.bg.side === 'front'}">מקדימה</button></div></div>` : ''}</div>
  <div class="sec"><h3>הדפסת UV ישירה מאחור</h3>
   <div class="pfwrap"><canvas id="pfPrev" width="10" height="10" aria-label="קובץ ההדפסה לגב, הפוך במראה"></canvas><div><b>קובץ ההדפסה לגב</b><p class="hint">מודפס הפוך במראה על הגב. מקדימה רואים את עומק הפרספקס השקוף (${S.t} מ״מ) ומאחוריו את ההדפסה, קריאה ומוגנת משריטות.</p></div></div>
   ${opaqueMat() ? '<p class="note">החומר שבחרתם אטום, ולכן ההדפסה עוברת אוטומטית לחזית. לפרספקס שקוף ההדפסה חוזרת לגב.</p>' : ''}
   <label class="row"><input type="checkbox" id="white" ${S.white ? 'checked' : ''}> שכבת לבן מאחורי הצבע (צבעים אטומים וחיים)</label>
   <p class="hint">חריטת לייזר יוצרת מראה חלבי ומאירה על בסיס LED. "הדפסה מקדימה" רק כשצריך, למשל על חומר אטום.</p></div>`;
}
function panelBase() {
  const { W, T } = dims(); const blk = isBlock(S.base.type), bd = baseDims(), led = ledOn();
  return `<div class="sec"><h3>סוג המעמד</h3><div class="cards">${BASES.map(b => `<button class="card" data-base="${b.id}" aria-pressed="${S.base.type === b.id}"><b>${b.n}</b><small>${b.sub} · ${fitText(b.id)}</small></button>`).join('')}</div></div>
  ${blk ? `<div class="sec"><h3>התאמה לעובי ${T} מ״מ</h3><dl class="fit"><dt>חריץ</dt><dd>${bd.slot.w} × ${bd.slot.d} מ״מ (רוחב × עומק)</dd><dt>עומק בסיס מינימלי</dt><dd>${bd.minD} מ״מ</dd><dt>גובה בסיס מינימלי</dt><dd>${bd.minH} מ״מ</dd></dl>
   <p class="hint">עובי עבה או צורה גבוהה מעמיקים את החריץ ומרחיבים את הבסיס כדי שהמעמד יעמוד יציב.</p></div>
  <div class="sec"><h3>מידות הבסיס (מ״מ)</h3>
   <div class="field"><label for="bw">רוחב</label><input type="range" id="bw" min="60" max="700" step="5" value="${bd.bw}"><span>${bd.bw}</span></div>
   <div class="field"><label for="bd">עומק</label><input type="range" id="bd" min="${bd.minD}" max="200" step="5" value="${bd.bd}"><span>${bd.bd}</span></div>
   <div class="field"><label for="bh">גובה</label><input type="range" id="bh" min="${bd.minH}" max="70" step="1" value="${bd.bh}"><span>${bd.bh}</span></div></div>
  <div class="sec"><h3>תאורת LED</h3>
   ${S.base.type === 'led' ? '<p class="hint">בסיס LED כולל תאורה מובנית.</p>' : `<label class="row"><input type="checkbox" id="ledOn" ${led ? 'checked' : ''}> הוספת פס LED מתחת לחריץ (+${ils(R.ledAdd)})</label>`}
   <p class="hint">האור עולה דרך עובי הפרספקס ומאיר את החריטה והקצוות. ${S.base.type === 'led' ? '' : 'מומלץ עם חריטת לייזר.'}</p>
   ${led ? `<div class="row"><label for="led">צבע תאורה</label><input type="color" id="led" value="${S.base.led}"><div class="chips">${['#ffc66b', '#ffffff', '#7cc4ff', '#0038b8', '#ff5aa5', '#7cf35a'].map(c => `<button class="chip" data-led="${c}" style="background:${c};width:28px;height:28px;padding:0" aria-label="${c}"></button>`).join('')}</div></div>` : ''}
  </div>
  <div class="sec"><h3>לוחית חרוטה על הבסיס</h3><input type="text" id="plaque" placeholder="לדוגמה: בהוקרה ובהערכה · 2026" value="${esc(S.base.plaque)}"></div>` : ''}
  ${isTray(S.base.type) ? `<div class="sec"><h3>טקסט חרוט על המגש</h3><textarea id="plaque" dir="rtl" placeholder="פסוק או הקדשה, שורה לכל שורה">${esc(S.base.plaque)}</textarea>
   <label class="row"><input type="checkbox" id="lit" ${S.base.unlit ? '' : 'checked'}> נרות דולקים בהדמיה</label>
   <p class="hint">המגש עשוי פרספקס שקוף עם שכבת מראה זהב, עם ${S.base.type === 'yahrzeit' ? 'מושב לנר נשמה ומחזיק זכוכית לנר טי' : 'שני מחזיקים לנרות שבת'}. הנרות להמחשה בלבד.</p></div>` : ''}`;
}
function panelOrder() {
  return `<div class="sec"><h3>כמות</h3><div class="field"><label for="qty">יחידות</label><input type="range" id="qty" min="1" max="300" step="1" value="${S.qty}"><input type="number" id="qtyn" min="1" max="10000" value="${S.qty}"></div>
   <p class="hint">הנחות כמות: ${R.disc.filter(d => d[1] > 0).map(([m, v]) => `מ־${m} יח׳ ${Math.round(v * 100)}%`).join(' · ')}</p></div>
  <div class="sec"><h3>מועד אספקה</h3><div class="cards">${RUSH.map(r => `<button class="card" data-rush="${r.id}" aria-pressed="${S.rush === r.id}"><b>${r.n}${R.rush[r.id] ? ' +' + Math.round(R.rush[r.id] * 100) + '%' : ''}</b><small>${r.sub}</small></button>`).join('')}</div></div>
  <div class="sec"><h3>תוספות</h3><label class="row"><input type="checkbox" id="gift" ${S.gift ? 'checked' : ''}> קופסת מתנה מרופדת (${ils(R.gift)})</label></div>
  <div class="sec"><h3>הערות להזמנה</h3><textarea id="notes" placeholder="שמות לכל יחידה, תאריך האירוע, כתובת למשלוח">${esc(S.notes || '')}</textarea></div>
  <div class="sec"><button class="btn primary" id="bFinish2">סיום עיצוב והצעת מחיר</button><button class="btn ghost" id="bReset">התחלה מחדש</button></div>`;
}
function renderPanel() {
  $$('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
  const body = $('#pbody'), st = body.scrollTop;
  body.innerHTML = { shape: panelShape, size: panelSize, design: panelDesign, lib: panelLib, base: panelBase, order: panelOrder }[tab]();
  if (tab === 'shape' || tab === 'lib') drawThumbs(); if (tab === 'lib') drawBadgeThumbs(); if (tab === 'design') drawPrintPreview();
  body.scrollTop = st; if (typeof ed2On !== 'undefined' && ed2On) e2Props();
}

/* ---------- Panel events ---------- */
function readFile(f, cb) { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(f); }
function shrinkImage(src, max, cb) { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)); if (s === 1) return cb(src); const c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/png')); }; im.src = src; }
function selEl() { return S.els.find(x => x.id === sel); }
function changed(full) { if (full) rebuildAll(); else { scheduleDraw(); store.set('ps-design', S); histSoon(); } }
function onPanelClick(e) {
  const b = e.target.closest('button'); if (!b) return; const d = b.dataset, el = selEl();
  if (d.cat) { cat = d.cat; renderPanel(); }
  else if (d.shape) { const o = dims(), mx = Math.max(o.W, o.H); S.shape = d.shape; S.h = 0; const a = shapeData(S.shape).aspect; S.w = Math.round(a >= 1 ? mx : mx * a); rebuildAll(); $$('.shp').forEach(x => x.setAttribute('aria-pressed', x.dataset.shape === S.shape)); }
  else if (d.w) { S.w = +d.w; rebuildAll(); renderPanel(); }
  else if (d.t) setThickness(+d.t);
  else if (d.mat) { S.mat = d.mat; rebuildAll(); renderPanel(); }
  else if (d.base) setBase(d.base);
  else if (d.led) { S.base.led = d.led; rebuildAll(); renderPanel(); }
  else if (d.rush) { S.rush = d.rush; changed(); updateHud(); renderPanel(); }
  else if (d.sel) { sel = d.sel; scheduleDraw(); renderPanel(); }
  else if (d.fin && el) { el.fin = d.fin; changed(); renderPanel(); }
  else if (d.pos && el) { if (d.pos === 'h') el.fx = 0.5; else if (d.pos === 'v') el.fy = 0.5; else { const b = boxes[el.id]; if (b && b.hw > 0) el.s = el.s * 0.42 / b.hw; } changed(); renderPanel(); }
  else if (d.bgt) { S.bg.type = d.bgt; changed(); updateHud(); renderPanel(); }
  else if (d.bgp != null) { const p = BG_PRESETS[+d.bgp]; Object.assign(S.bg, { type: 'gradient', c1: p[1], c2: p[2] }); changed(); updateHud(); renderPanel(); }
  else if (d.bgside) { S.bg.side = d.bgside; changed(); updateHud(); renderPanel(); }
  else if (d.align && el) { el.align = d.align; changed(); renderPanel(); }
  else if (b.id === 'addText') { const t = T_('טקסט חדש', { fy: 0.5, s: 0.07 }); S.els.push(t); sel = t.id; changed(); renderPanel(); }
  else if (b.id === 'addSym') { const t = SYM('dstar', { fy: 0.5, s: 0.2 }); S.els.push(t); sel = t.id; changed(); renderPanel(); }
  else if (b.id === 'e_del' && el) { S.els = S.els.filter(x => x !== el); sel = null; changed(); renderPanel(); }
  else if (b.id === 'e_dup' && el) { const c = Object.assign({}, el, { id: uid(), fy: clamp(el.fy + 0.08, 0, 1) }); S.els.push(c); sel = c.id; changed(); renderPanel(); }
  else if ((b.id === 'e_up' || b.id === 'e_down') && el) { const i = S.els.indexOf(el), j = clamp(i + (b.id === 'e_up' ? 1 : -1), 0, S.els.length - 1); S.els.splice(i, 1); S.els.splice(j, 0, el); changed(); renderPanel(); }
  else if (b.id === 'cgo') { S.custom = { kind: 'text', key: uid(), text: $('#ctext').value.trim() || 'שם', font: $('#cfont').value, mode: $('#cmode').value }; S.shape = 'custom'; S.h = 0; applyCustom(S.custom); }
  else if (b.id === 'bFinish2') openQuote();
  else if (b.id === 'addFx') openMemorialFx();
  else if (b.id === 'e_fx' && el) openMemorialFx(el);
  else if (b.id === 'bReset') { S = fresh(); sel = null; rebuildAll(); renderPanel(); openQuiz(); }
}
function onPanelInput(e) {
  const t = e.target, id = t.id, v = t.type === 'checkbox' ? t.checked : t.value, n = parseFloat(v), el = selEl();
  const sync = (a, b) => { const o = $('#' + b); if (o && o !== t) o.value = v; };
  switch (id) {
    case 'q': query = v.trim(); { const pos = t.selectionStart; renderPanel(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); } return;
    case 'w': case 'wn': if (n >= 20) { S.w = n; sync(id, id === 'w' ? 'wn' : 'w'); rebuildAll(); const { H } = dims(); if (S.lock) { $('#h').value = H; $('#hn').value = H; } } return;
    case 'h': case 'hn': if (n >= 20) { S.h = n; sync(id, id === 'h' ? 'hn' : 'h'); rebuildAll(); } return;
    case 'lock': S.lock = v; if (!v) S.h = dims().H; rebuildAll(); renderPanel(); return;
    case 'margin': t.nextElementSibling.textContent = v + ' מ״מ'; if (S.custom && S.custom.kind === 'png' && e.type === 'change') { S.custom.margin = n; S.custom.key = uid(); applyCustom(S.custom); } return;
    case 'bw': S.base.w = n; t.nextElementSibling.textContent = v; rebuildBase(); changed(); updateHud(); return;
    case 'bd': S.base.d = n; t.nextElementSibling.textContent = v; rebuildAll(); return;
    case 'bh': S.base.h = n; t.nextElementSibling.textContent = v; rebuildAll(); return;
    case 'led': S.base.led = v; rebuildAll(); return;
    case 'ledOn': S.base.ledOn = v; rebuildAll(); renderPanel(); return;
    case 'plaque': S.base.plaque = v; rebuildBase(); changed(); updateHud(); return;
    case 'lit': S.base.unlit = !v; rebuildBase(); changed(); return;
    case 'qty': case 'qtyn': if (n >= 1) { S.qty = Math.round(n); sync(id, id === 'qty' ? 'qtyn' : 'qty'); changed(); updateHud(); } return;
    case 'gift': S.gift = v; changed(); updateHud(); return;
    case 'notes': S.notes = v; store.set('ps-design', S); return;
    case 'white': S.white = v; changed(); return;
    case 'bg_c1': S.bg.c1 = v; changed(); return;
    case 'bg_c2': S.bg.c2 = v; changed(); return;
    case 'bg_ang': S.bg.ang = n; changed(); return;
    case 'bg_inset': S.bg.inset = n; t.nextElementSibling.textContent = v + ' מ״מ'; changed(); return;
    case 'bg_op': S.bg.op = n; t.nextElementSibling.textContent = Math.round(n * 100) + '%'; changed(); return;
  }
  if (!el) return;
  const k = id.slice(2);
  if (['s', 'fx', 'fy', 'rot', 'outline'].includes(k)) { el[k] = n; const sp = t.nextElementSibling; if (sp && sp.tagName === 'SPAN') sp.textContent = k === 's' ? Math.round(n * S.w) + ' מ״מ' : k === 'rot' ? n + '°' : ''; changed(); }
  else if (['text', 'font', 'color', 'ocolor', 'shape', 'title', 'sub', 'c1', 'c2'].includes(k)) { el[k] = v; changed(); if (k === 'text' || k === 'shape' || k === 'title') { const L = $(`.layer[data-sel="${el.id}"] .t`); if (L) L.textContent = elLabel(el); } }
  else if (k === 'weight') { el.weight = +v; changed(); }
  else if (k === 'mono' || k === 'plate') { el[k] = v; changed(); }
}
function onPanelChange(e) {
  const t = e.target;
  if (t.id === 'pngShape' && t.files[0]) readFile(t.files[0], src => shrinkImage(src, 1400, s2 => { S.custom = { kind: 'png', key: uid(), src: s2, margin: +$('#margin').value }; S.shape = 'custom'; S.h = 0; const im = { id: uid(), type: 'image', src: s2, s: 1, fin: 'back', fx: 0.5, fy: 0.5, rot: 0, mono: false, color: '#1c2c5b' }; applyCustom(S.custom); S.els = S.els.filter(x => !x.auto); im.auto = true; S.els.unshift(im); sel = im.id; changed(); toast('הצורה נוצרה מהקובץ. התמונה נוספה כהדפסת UV.'); }));
  else if (t.id === 'addImg' && t.files[0]) readFile(t.files[0], src => shrinkImage(src, 1400, s2 => { const im = { id: uid(), type: 'image', src: s2, s: 0.4, fin: 'back', fx: 0.5, fy: 0.5, rot: 0, mono: false, color: '#1c2c5b' }; S.els.push(im); sel = im.id; changed(); renderPanel(); }));
  else if (t.id === 'bg_img' && t.files[0]) readFile(t.files[0], src => shrinkImage(src, 2000, s2 => { S.bg.src = s2; S.bg.type = 'image'; changed(); updateHud(); }));
  else if (t.id === 'e_img' && t.files[0]) readFile(t.files[0], src => shrinkImage(src, 1400, s2 => { const el = selEl(); if (el) { el.src = s2; changed(); } }));
  else if (t.id === 'margin') onPanelInput(e);
}

/* ---------- Modals: questionnaire, quote, rates ---------- */
function modal(html, onClose) {
  const root = $('#modalRoot'); root.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="dialog">${html}</div></div>`;
  const m = root.firstElementChild; m.addEventListener('click', e => { if (e.target === m) close(); });
  function close() { root.innerHTML = ''; onClose && onClose(); }
  document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
  return { el: m, close };
}
let quizA = { occasion: S.occasion || 'staff', size: S.sizeId || 'm', qty: S.qty || 1, rush: S.rush || 'normal' };
function openQuiz(step = 0) {
  const steps = [
    { k: 'occasion', q: 'לאיזה אירוע המעמד?', opts: OCCASIONS.map(o => ({ v: o.id, n: o.n, sub: o.sub })) },
    { k: 'size', q: 'באיזה גודל בערך?', opts: SIZES.map(o => ({ v: o.id, n: o.n, sub: o.sub })) },
    { k: 'qty', q: 'כמה יחידות?', opts: QTYS.map(o => ({ v: o.v, n: o.n, sub: o.v > 1 ? 'הנחת כמות ' + Math.round(discFor(o.v) * 100) + '%' : 'ללא הנחה' })) },
    { k: 'rush', q: 'מתי צריך את זה?', opts: RUSH.map(o => ({ v: o.id, n: o.n, sub: o.sub + (R.rush[o.id] ? ' · +' + Math.round(R.rush[o.id] * 100) + '%' : '') })) },
  ];
  if (step >= steps.length) return quizResult();
  const s = steps[step];
  const m = modal(`<div class="steps">${steps.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>
   <div><p class="lead">שאלה ${step + 1} מתוך ${steps.length}</p><h2>${s.q}</h2></div>
   <div class="opts">${s.opts.map(o => `<button class="opt" data-v="${o.v}" aria-pressed="${quizA[s.k] == o.v}"><b>${o.n}</b><small>${o.sub}</small></button>`).join('')}</div>
   <div class="actions">${step ? '<button class="btn" id="qBack">חזרה</button>' : ''}<button class="btn ghost" id="qSkip">דילוג ישר לסטודיו</button></div>`);
  m.el.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) { quizA[s.k] = s.k === 'qty' ? +b.dataset.v : b.dataset.v; openQuiz(step + 1); } if (e.target.id === 'qBack') openQuiz(step - 1); if (e.target.id === 'qSkip') m.close(); });
}
function estimateFor(thick, base) {
  const sz = SIZES.find(s => s.id === quizA.size) || SIZES[1]; const st = JSON.parse(JSON.stringify(S));
  Object.assign(st, { shape: 'rrect', w: sz.w, lock: true, h: 0, t: thick, mat: 'clear', qty: quizA.qty, rush: quizA.rush, gift: false, white: true }); st.base = { type: base, w: 0, d: 60, h: 24, plaque: '', ledOn: false };
  const H = sz.w / 0.75; return calc(st, { uvArea: sz.w * H * 0.3, engArea: 0 });
}
function quizResult() {
  const occ = OCCASIONS.find(o => o.id === quizA.occasion), sz = SIZES.find(s => s.id === quizA.size);
  const cols = ['none', 'wood', 'led'], rows = [5, 10, 20, 30];
  const m = modal(`<div class="steps"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div>
   <div><p class="lead">${occ.n} · ${sz.n} (${sz.sub}) · ${quizA.qty} יח׳ · אספקה ${RUSH.find(r => r.id === quizA.rush).n}</p><h2>מחירון משוער ליחידה</h2></div>
   <div class="tablewrap"><table class="price"><thead><tr><th>עובי</th>${cols.map(c => `<th class="num">${BASES.find(b => b.id === c).n}</th>`).join('')}</tr></thead>
   <tbody>${rows.map(t => `<tr><td>${t} מ״מ</td>${cols.map(c => `<td class="num">${ils(estimateFor(t, c).unitVat)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <p class="note">מחיר ליחידה כולל מע״מ, לפרספקס שקוף עם הדפסת UV על כשליש מהשטח${quizA.qty > 1 ? ' ואחרי הנחת כמות' : ''}. הכנת קובץ והגדרת מכונה (${ils(R.setup)}) נוספים פעם אחת להזמנה. המחיר הסופי מחושב שוב בסיום העיצוב.</p>
   <div class="actions"><button class="btn primary" id="qGo">פתחו לי תבנית ${esc(occ.n)}</button><button class="btn" id="qKeep">המשך עם העיצוב הנוכחי</button><button class="btn ghost" id="qBack">חזרה לשאלון</button></div>`);
  m.el.addEventListener('click', e => {
    if (e.target.id === 'qGo') { Object.assign(S, { qty: quizA.qty, rush: quizA.rush }); m.close(); applyTemplate(quizA.occasion, quizA.size); }
    if (e.target.id === 'qKeep') { Object.assign(S, { qty: quizA.qty, rush: quizA.rush, occasion: quizA.occasion, sizeId: quizA.size }); m.close(); rebuildAll(); renderPanel(); }
    if (e.target.id === 'qBack') openQuiz(0);
  });
}
function cutSVG() {
  const { W, H, sd } = dims(), sx = W / sd.bb.w, sy = H / sd.bb.h, f = p => p.map(([x, y], i) => (i ? 'L' : 'M') + ((x - sd.bb.x) * sx).toFixed(2) + ' ' + ((y - sd.bb.y) * sy).toFixed(2)).join(' ') + ' Z';
  const d = sd.outers.map(o => [f(o.p)].concat(o.holes.map(f)).join(' ')).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="#ff0000" stroke-width="0.1"/></svg>`;
}
function summaryText(c) {
  const { W, H, T } = dims(), m = MATERIALS.find(x => x.id === S.mat), b = BASES.find(x => x.id === S.base.type), shp = S.shape === 'custom' ? 'צורה מותאמת' : shapeById(S.shape).n;
  return [`הזמנת מעמד פרספקס בעיצוב אישי`, `צורה: ${shp}`, `מידות: ${W}×${H} מ״מ, עובי ${T} מ״מ`, `חומר: ${m.n}`, `מעמד: ${b.n}${ledOn() ? ' + תאורת LED' : ''}${S.base.plaque ? ' + לוחית: ' + S.base.plaque : ''}`, isBlock(S.base.type) ? `חריץ במעמד: ${baseDims().slot.w}×${baseDims().slot.d} מ״מ, בסיס ${baseDims().bw}×${baseDims().bd}×${baseDims().bh} מ״מ` : '',
    `אלמנטים: ${S.els.map(e => elLabel(e) + ' (' + FIN[e.fin] + ')').join(', ') || 'ללא'}`, `כמות: ${c.q} · אספקה: ${RUSH.find(r => r.id === S.rush).n}`,
    ...c.lines.map(l => `${l.n}: ${ils(l.v)}`), `מחיר ליחידה: ${ils(c.unit)} + מע״מ`, `הכנה והגדרת מכונה: ${ils(c.setup)}`, `סה״כ כולל מע״מ: ${ils(c.total)}`, S.notes ? `הערות: ${S.notes}` : ''].filter(Boolean).join('\n');
}
async function copy(text, okMsg) { try { await navigator.clipboard.writeText(text); toast(okMsg); } catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(okMsg); } catch (_) { toast('ההעתקה נחסמה. סמנו את הטקסט והעתיקו ידנית.'); } ta.remove(); } }
function openQuote() {
  const prevSel = sel; sel = null; drawPrint(); const keep = camera.position.clone(); setView('angle'); controls.update(); renderer.render(scene, camera);
  const img = renderer.domElement.toDataURL('image/jpeg', 0.9); camera.position.copy(keep); sel = prevSel; scheduleDraw();
  const c = calc(), { W, H, T } = dims(), m = MATERIALS.find(x => x.id === S.mat), b = BASES.find(x => x.id === S.base.type);
  const md = modal(`<div><p class="lead">סיום עיצוב</p><h2>הצעת מחיר</h2></div>
   <div class="quote"><img src="${img}" alt="תצוגת המעמד"><dl class="spec">
    <dt>צורה</dt><dd>${S.shape === 'custom' ? 'צורה מותאמת' : esc(shapeById(S.shape).n)}</dd><dt>מידות</dt><dd>${W}×${H} מ״מ</dd><dt>עובי</dt><dd>${T} מ״מ</dd>
    <dt>חומר</dt><dd>${m.n}</dd><dt>מעמד</dt><dd>${b.n}${ledOn() ? ' + LED' : ''}${isBlock(S.base.type) ? ' · חריץ ' + baseDims().slot.w + ' מ״מ' : ''}</dd><dt>הדפסה</dt><dd>${[...new Set(S.els.map(e => FIN[e.fin]))].join(', ') || 'ללא'}</dd><dt>כמות</dt><dd>${c.q} יח׳</dd><dt>אספקה</dt><dd>${RUSH.find(r => r.id === S.rush).n}</dd></dl></div>
   <div class="tablewrap"><table class="price"><thead><tr><th>רכיב</th><th></th><th class="num">ליחידה</th></tr></thead><tbody>
    ${c.lines.map(l => `<tr><td>${esc(l.n)}</td><td><small>${l.d || ''}</small></td><td class="num">${ils(l.v)}</td></tr>`).join('')}
    ${c.disc ? `<tr class="sub"><td>הנחת כמות</td><td>${Math.round(c.disc * 100)}%</td><td class="num">−${ils(c.raw * c.disc)}</td></tr>` : ''}
    ${c.rush ? `<tr class="sub"><td>תוספת דחיפות</td><td>${Math.round(c.rush * 100)}%</td><td class="num">+${ils(c.raw * (1 - c.disc) * c.rush)}</td></tr>` : ''}
    <tr><td><b>מחיר ליחידה</b></td><td>${c.unit === R.minUnit ? '<small>מחיר מינימום</small>' : ''}</td><td class="num"><b>${ils(c.unit)}</b></td></tr>
    <tr class="sub"><td>× ${c.q} יח׳ + הכנת קובץ והגדרת מכונה</td><td></td><td class="num">${ils(c.unit * c.q)} + ${ils(c.setup)}</td></tr>
    <tr class="sub"><td>מע״מ ${Math.round(R.vat * 100)}%</td><td></td><td class="num">${ils(c.vat)}</td></tr>
    <tr class="total"><td>סה״כ לתשלום</td><td></td><td class="num">${ils(c.total)}</td></tr></tbody></table></div>
   <p class="note">המחירים מבוססים על המחירון שבכפתור "מחירון", כרגע מחירי דוגמה. ההצעה תקפה לאחר אישור הגרפיקה.</p>
   <div class="actions"><button class="btn gold" id="qShow">✨ תצוגה מדהימה</button><button class="btn" id="qHD">רינדור Full HD</button><button class="btn primary" id="qCopy">העתקת סיכום ההזמנה</button><button class="btn" id="qSvg">העתקת קובץ חיתוך SVG</button><button class="btn" id="qFiles">קבצי ייצור (300 DPI)</button><button class="btn ghost" id="qEdit">חזרה לעריכה</button></div>`);
  md.el.addEventListener('click', e => { if (e.target.id === 'qCopy') copy(summaryText(c), 'סיכום ההזמנה הועתק'); if (e.target.id === 'qSvg') copy(cutSVG(), 'קובץ החיתוך הועתק (SVG במילימטרים)'); if (e.target.id === 'qEdit') md.close(); if (e.target.id === 'qHD') renderHD(); if (e.target.id === 'qShow') { md.close(); openShow(); } if (e.target.id === 'qFiles') openPrintFiles(); });
}
function openRates() {
  const F = (path, label, step = 1) => { const v = path.split('.').reduce((o, k) => o[k], R); return `<label for="r_${path}">${label}</label><input type="number" step="${step}" id="r_${path}" data-path="${path}" value="${v}">`; };
  const md = modal(`<div><p class="lead">הגדרות העסק</p><h2>מחירון</h2></div>
   <p class="note">אלה מחירי דוגמה. עדכנו אותם למחירון העסק שלכם; הם נשמרים בדפדפן הזה ומתעדכנים מיד בכל החישובים.</p>
   <div class="rates"><h4>לוח פרספקס שקוף (₪ למ״ר)</h4>${THICK.map(t => F('sheet.' + t, t + ' מ״מ')).join('')}${F('waste', 'מקדם פחת', 0.01)}
    <h4>ייצור</h4>${F('cutPerM', 'חיתוך לייזר (₪ למטר, עובי 5 מ״מ)')}${F('setup', 'הכנת קובץ והגדרה (להזמנה)')}${F('minUnit', 'מחיר מינימום ליחידה')}
    <h4>הדפסה וחריטה</h4>${F('uvPerM2', 'הדפסת UV (₪ למ״ר)')}${F('uvMin', 'מינימום הדפסה')}${F('white', 'תוספת שכבת לבן (שבר)', 0.05)}${F('reverse', 'תוספת הדפסה הפוכה (שבר)', 0.05)}${F('engPerCm2', 'חריטה (₪ לסמ״ר)', 0.05)}${F('engMin', 'מינימום חריטה')}${F('mirPerCm2', 'אפליקציית מראה (₪ לסמ״ר)', 0.05)}${F('mirMin', 'מינימום אפליקציית מראה')}${F('ledAdd', 'תוספת תאורת LED')}
    <h4>מעמדים (קבוע · לכל ס״מ רוחב)</h4>${BASES.filter(b => b.id !== 'none').map(b => F('bases.' + b.id + '.0', b.n + ' · קבוע') + F('bases.' + b.id + '.1', b.n + ' · לס״מ', 0.1)).join('')}
    <h4>שונות</h4>${F('plaque', 'לוחית חרוטה')}${F('gift', 'קופסת מתנה')}${F('vat', 'מע״מ (שבר)', 0.01)}${F('rush.fast', 'תוספת אספקה מהירה', 0.05)}${F('rush.urgent', 'תוספת אספקה דחופה', 0.05)}</div>
   <div class="actions"><button class="btn primary" id="rDone">שמירה</button><button class="btn ghost" id="rReset">שחזור מחירי הדוגמה</button></div>`);
  md.el.addEventListener('input', e => { const p = e.target.dataset.path; if (!p) return; const ks = p.split('.'), last = ks.pop(), o = ks.reduce((a, k) => a[k], R); const n = parseFloat(e.target.value); if (!isNaN(n)) { o[last] = n; store.set('ps-rates', R); updateHud(); } });
  md.el.addEventListener('click', e => { if (e.target.id === 'rDone') { md.close(); renderPanel(); toast('המחירון נשמר'); } if (e.target.id === 'rReset') { R = JSON.parse(JSON.stringify(DEF_RATES)); store.set('ps-rates', R); md.close(); openRates(); updateHud(); } });
}
function renderHD() {
  const W0 = 1920, H0 = 1080, prevSel = sel; sel = null; drawPrint(); planes.guide.visible = false;
  const size = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio();
  renderer.setPixelRatio(2); renderer.setSize(W0, H0, false); camera.aspect = W0 / H0; camera.updateProjectionMatrix(); renderer.render(scene, camera);
  const out = document.createElement('canvas'); out.width = W0; out.height = H0; const og = out.getContext('2d'); og.imageSmoothingQuality = 'high'; og.drawImage(renderer.domElement, 0, 0, W0, H0);
  renderer.setPixelRatio(pr); renderer.setSize(size.x, size.y, false); camera.aspect = size.x / size.y; camera.updateProjectionMatrix(); planes.guide.visible = true; sel = prevSel; scheduleDraw();
  const url = out.toDataURL('image/png'), framed = window.self !== window.top;
  const md = modal(`<div><p class="lead">1920×1080 פיקסלים</p><h2>הדמיית Full HD</h2></div><img src="${url}" alt="הדמיית המעמד ב־Full HD" style="width:100%;border-radius:10px;border:1px solid var(--line)">
   <p class="note">${framed ? 'לשמירה: לחיצה ימנית על התמונה ובחירה ב"שמירת תמונה" (בטלפון: לחיצה ארוכה).' : 'אפשר להוריד את הקובץ או ללחוץ עליו לחיצה ימנית לשמירה.'} שנו זווית בתצוגה ורנדרו שוב לזווית אחרת.</p>
   <div class="actions"><button class="btn primary" id="hdSave" hidden>שמירת PNG</button><button class="btn" id="hdClose">חזרה לעריכה</button></div>`);
  canSave().then(ok => { const b = $('#hdSave'); if (b) b.hidden = !ok; });
  md.el.addEventListener('click', e => { if (e.target.id === 'hdClose') md.close(); if (e.target.id === 'hdSave') out.toBlob(bl => saveFile('perspex-render-fullhd.png', bl), 'image/png'); });
}
let dlP = null;
function downloadsNS() { if (!dlP) dlP = (window.claude && window.claude.use) ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null); return dlP; }
async function canSave() { if (window.self === window.top) return true; return !!(await downloadsNS()); }
async function saveFile(filename, data) {
  const dl = window.self === window.top ? null : await downloadsNS();
  if (dl) { try { await dl.save({ filename, data }); toast('הקובץ נשמר'); } catch (e) { if (e && e.code !== 'declined') toast('השמירה לא הצליחה בתצוגה הזו. אפשר ללחוץ לחיצה ימנית על התמונה.'); } return; }
  const u = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); const a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
}
let toastT; function toast(msg) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }

/* ---------- Boot ---------- */
function boot() {
  $('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; renderPanel(); } });
  const pb = $('#pbody'); pb.addEventListener('click', onPanelClick); pb.addEventListener('input', onPanelInput); pb.addEventListener('change', onPanelChange);
  $$('[data-view]').forEach(b => b.onclick = () => { toggleSpin(false); setView(b.dataset.view); });
  $('#bSpin').onclick = () => toggleSpin(!spin); $('#bHD').onclick = renderHD; $('#bShow').onclick = openShow;
  $('#bFinish').onclick = openQuote; $('#bRates').onclick = openRates; $('#bQuiz').onclick = () => openQuiz(0);
  $('#bUndo').onclick = () => undo(-1); $('#bRedo').onclick = () => undo(1);
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(e.shiftKey ? 1 : -1); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); undo(1); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { S.els = S.els.filter(x => x.id !== sel); sel = null; changed(); renderPanel(); }
    else if (sel && e.key.startsWith('Arrow')) { const el = selEl(), st = e.shiftKey ? 0.02 : 0.004; if (e.key === 'ArrowLeft') el.fx -= st; if (e.key === 'ArrowRight') el.fx += st; if (e.key === 'ArrowUp') el.fy -= st; if (e.key === 'ArrowDown') el.fy += st; e.preventDefault(); changed(); }
  });
  initScene(); initEd2();
  if (S.shape === 'custom' && S.custom) applyCustom(S.custom);
  rebuildAll(); pushHist(); renderPanel();
  if (document.fonts) document.fonts.ready.then(() => { thumbs.clear(); tintCache.clear(); SHAPES.filter(s => /chai|shalom|am-israel|jerusalem-word|tablets-letters|mezuzah/.test(s.id)).forEach(s => SD.delete(s.id)); if (tab === 'shape' || tab === 'lib') drawThumbs(); badgeCache.clear(); rebuildAll(); });
  openWelcome();
}

