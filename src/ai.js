
/* ===================== Library: IDF units, cities, icons, my PNGs ===================== */
/* Unit and city badges are original generic designs (icon + name + palette), not official insignia or municipal emblems. */
const UNITS = [
  ['golani', 'גולני', 'חטיבת חי״ר', 'unit-shield', '#5a3d22', '#e8c46a'], ['givati', 'גבעתי', 'חטיבת חי״ר', 'unit-shield', '#55267f', '#e1c7ff'],
  ['tzanhanim', 'צנחנים', 'חטיבת חי״ר', 'parachute', '#7a1f2b', '#f6cfcf'], ['nahal', 'נח״ל', 'חטיבת חי״ר', 'unit-shield', '#4f7d2e', '#e6f2c8'],
  ['kfir', 'כפיר', 'חטיבת חי״ר', 'unit-shield', '#5d6233', '#efe9bd'], ['shiryon', 'שריון', 'חיל השריון', 'tank', '#1f2328', '#d5dae2'],
  ['totchanim', 'תותחנים', 'חיל התותחנים', 'cannon', '#0f6e78', '#c8f0f4'], ['handasa', 'הנדסה קרבית', 'חיל ההנדסה', 'bridge', '#4d545e', '#e6e9ee'],
  ['avir', 'חיל האוויר', 'זרוע האוויר', 'jet', '#1d4e89', '#d6e6fa'], ['yam', 'חיל הים', 'זרוע הים', 'anchor', '#0e2756', '#cfdcf3'],
  ['modiin', 'מודיעין', 'אגף המודיעין', 'eye', '#2c2f6b', '#dcdcff'], ['tikshuv', 'תקשוב', 'אגף התקשוב', 'antenna', '#234d6e', '#d2e7f5'],
  ['refua', 'חיל הרפואה', 'רפואה צבאית', 'medic', '#9b1c2a', '#ffdfe2'], ['tal', 'טכנולוגיה ואחזקה', 'חיל הטנ״א', 'gear', '#6a4b1f', '#f3e1bd'],
  ['logistika', 'לוגיסטיקה', 'אגף הטכנולוגיה והלוגיסטיקה', 'truck', '#59482c', '#efe2c6'], ['mp', 'משטרה צבאית', 'חיל המשטרה הצבאית', 'unit-shield', '#1f3f8a', '#e4eaff'],
  ['oref', 'פיקוד העורף', 'חילוץ והצלה', 'helmet', '#b8530f', '#ffe3c8'], ['hinuch', 'חינוך ונוער', 'חיל החינוך', 'book', '#2f6b4f', '#d9f3e6'],
  ['oketz', 'עוקץ', 'יחידת הכלבנים', 'paw', '#363636', '#e6e6e6'], ['shayetet', 'קומנדו ימי', 'כוחות מיוחדים', 'anchor', '#0b1f3a', '#a9c0e0'],
  ['sayeret', 'סיירת', 'יחידת סיור', 'binoculars', '#3d4a2a', '#e3ebcd'], ['miluim', 'מילואים', 'גאים במילואימניקים', 'dogtag', '#4b5320', '#eceed6'],
  ['mahlaka', 'מחלקה', 'פלוגה · מחלקה', 'chevrons', '#33402a', '#e9edd9'], ['kravi', 'לוחמים', 'יחידה קרבית', 'beret', '#3c4a2c', '#e7e2c3'],
].map(([id, n, sub, icon, c1, c2]) => ({ id, n, sub, icon, c1, c2, kind: 'unit' }));
const CITIES = [
  ['jerusalem', 'ירושלים', 'בירת ישראל', 'david-tower', '#7a5c2e', '#f3e6c4'], ['telaviv', 'תל אביב־יפו', 'העיר ללא הפסקה', 'skyline', '#0d4f8b', '#d4ecff'],
  ['haifa', 'חיפה', 'עיר הכרמל והנמל', 'ship', '#165a55', '#d2f1ec'], ['beersheva', 'באר שבע', 'בירת הנגב', 'palm', '#a0561b', '#ffe7c7'],
  ['eilat', 'אילת', 'עיר הים והשמש', 'sun', '#d1691a', '#fff0c9'], ['tiberias', 'טבריה', 'עיר הכנרת', 'wave', '#1f6fa3', '#d7efff'],
  ['safed', 'צפת', 'עיר המקובלים', 'old-walls', '#3b4f8f', '#e2e8ff'], ['netanya', 'נתניה', 'פנינת השרון', 'wave', '#0f7c8c', '#d1f5f8'],
  ['ashdod', 'אשדוד', 'עיר הנמל', 'anchor', '#12407a', '#d6e5fb'], ['rishon', 'ראשון לציון', 'ראשונה לציון', 'grapes', '#6e2148', '#f8d9e8'],
  ['modiin', 'מודיעין', 'עיר המכבים', 'menorah', '#25586b', '#d8eef5'], ['rehovot', 'רחובות', 'עיר המדע', 'bulb', '#5a4a1a', '#f5ebc6'],
].map(([id, n, sub, icon, c1, c2]) => ({ id, n, sub, icon, c1, c2, kind: 'city' }));
const badgeCache = new Map();
function badgeCanvas(b, mono, size = 640) {
  const key = [b.title, b.sub, b.icon, b.c1, b.c2, mono, size, document.fonts && document.fonts.status].join('|'); if (badgeCache.has(key)) return badgeCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), k = size / 600; g.scale(k, k);
  const cx = 300, R = 292, c1 = mono ? '#ffffff' : b.c1, c2 = mono ? '#ffffff' : b.c2;
  if (mono) { g.strokeStyle = '#fff'; g.lineWidth = 14; g.beginPath(); g.arc(cx, cx, R - 7, 0, TAU); g.stroke(); }
  else { g.fillStyle = c1; g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.fill(); }
  g.strokeStyle = c2; g.lineWidth = 6; g.beginPath(); g.arc(cx, cx, R - 64, 0, TAU); g.stroke();
  const sd = shapeData(b.icon); if (sd) { const bw = 250, bh = 210, s = Math.min(bw / sd.mask.width, bh / sd.mask.height), w = sd.mask.width * s, h = sd.mask.height * s; g.drawImage(tinted(sd.mask, 'bdg:' + b.icon, c2), cx - w / 2, 278 - h / 2 - 8, w, h); }
  g.fillStyle = c2; g.textBaseline = 'middle';
  const title = String(b.title || ''), Rt = R - 32; let fs = 50; g.font = `800 ${fs}px "Heebo","Assistant",sans-serif`;
  let ws = [...title].map(ch => g.measureText(ch).width), tot = ws.reduce((a, x) => a + x, 0) + 3 * ws.length;
  if (tot / Rt > PI * 0.9) { fs *= PI * 0.9 * Rt / tot; g.font = `800 ${fs}px "Heebo","Assistant",sans-serif`; ws = [...title].map(ch => g.measureText(ch).width); tot = ws.reduce((a, x) => a + x, 0) + 3 * ws.length; }
  let a = -PI / 2 + tot / Rt / 2; g.textAlign = 'center';
  [...title].forEach((ch, i) => { a -= ws[i] / 2 / Rt; g.save(); g.translate(cx + Math.cos(a) * Rt, cx + Math.sin(a) * Rt); g.rotate(a + PI / 2); g.fillText(ch, 0, 0); g.restore(); a -= (ws[i] / 2 + 3) / Rt; });
  if (b.sub) { let f2 = 34; g.font = `600 ${f2}px "Assistant","Heebo",sans-serif`; g.direction = 'rtl'; const m = g.measureText(b.sub).width; if (m > 330) { f2 *= 330 / m; g.font = `600 ${f2}px "Assistant","Heebo",sans-serif`; } g.fillText(b.sub, cx, 440); }
  [[-1], [1]].forEach(([s]) => star(g, cx + s * 205, 440, 5, 12, 5));
  if (badgeCache.size > 80) badgeCache.clear(); badgeCache.set(key, c); return c;
}
const libItem = (it) => ({ type: 'badge', title: it.n, sub: it.sub, icon: it.icon, c1: it.c1, c2: it.c2 });
let libTab = 'units', freeSet = 'solid';
const FREE_SETS = [['solid', 'סמלים מלאים'], ['line', 'קו דק'], ['color', 'צבעוני']];
function freeSvg(set, it, color = '#111827') {
  const b = 'xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"';
  const svg = set === 'solid' ? `<svg ${b} viewBox="0 0 256 256" fill="${color}">${it[2]}</svg>` : set === 'line' ? `<svg ${b} viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${it[2]}</svg>` : `<svg ${b} viewBox="0 0 36 36">${it[2]}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function myLib() { return store.get('ps-lib', []); }
function panelLib() {
  const tabs = [['units', 'יחידות צה״ל', UNITS.length], ['cities', 'ערים', CITIES.length], ['free', 'אייקונים חינמיים', FREE_ICONS.solid.length + FREE_ICONS.line.length + FREE_ICONS.color.length], ['icons', 'צורות', SHAPES.length], ['mine', 'התמונות שלי', myLib().length]];
  let grid = '';
  if (libTab === 'units' || libTab === 'cities') grid = (libTab === 'units' ? UNITS : CITIES).map(u => `<div class="shp lib"><button class="libmain" data-libadd="${libTab}:${u.id}" title="הוספה לעיצוב"><canvas data-bdg="${libTab}:${u.id}" width="120" height="120"></canvas><small>${esc(u.n)}</small></button><button class="btn sm ghost libpng" data-libpng="${libTab}:${u.id}">PNG</button></div>`).join('');
  else if (libTab === 'icons') grid = SHAPES.map(s => `<div class="shp lib"><button class="libmain" data-libadd="icons:${s.id}" title="הוספה כסמל מודפס"><canvas data-th="${s.id}" width="120" height="120"></canvas><small>${esc(s.n)}</small></button><button class="btn sm ghost libpng" data-libpng="icons:${s.id}">PNG</button></div>`).join('');
  else if (libTab === 'free') grid = FREE_ICONS[freeSet].map((it, i) => `<div class="shp lib"><button class="libmain" data-libadd="free:${freeSet}:${i}" title="הוספה לעיצוב"><img src="${freeSvg(freeSet, it)}" alt="" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:contain;padding:14%"><small>${esc(it[1])}</small></button><button class="btn sm ghost libpng" data-libpng="free:${freeSet}:${i}">PNG</button></div>`).join('');
  else grid = myLib().map((m, i) => `<div class="shp lib"><button class="libmain" data-libadd="mine:${i}"><img src="${m.src}" alt="" style="width:100%;aspect-ratio:1;object-fit:contain"><small>${esc(m.n)}</small></button><button class="btn sm ghost danger libpng" data-libdel="${i}">מחיקה</button></div>`).join('') || '<p class="hint">עדיין אין כאן תמונות. העלו לוגו, סמל או איור ב־PNG שקוף.</p>';
  return `<div class="sec"><h3>מאגר סמלים ותמונות</h3>
   <div class="chips">${tabs.map(([id, n, c]) => `<button class="chip" data-libtab="${id}" aria-pressed="${libTab === id}">${n} <small>${c}</small></button>`).join('')}</div>
   ${libTab === 'free' ? `<div class="chips">${FREE_SETS.map(([id, n]) => `<button class="chip" data-freeset="${id}" aria-pressed="${freeSet === id}">${n} <small>${FREE_ICONS[id].length}</small></button>`).join('')}</div>` : ''}
   ${libTab === 'mine' ? `<div class="upl"><label for="libUp"><b>העלאה למאגר</b></label><input type="file" id="libUp" accept="image/png,image/webp,image/svg+xml,image/jpeg" multiple><p class="hint">נשמר בדפדפן הזה בלבד.</p></div>` : ''}
   <p class="hint">${libTab === 'free' ? (freeSet === 'color' ? 'אייקונים צבעוניים מ־Twemoji (רישיון CC-BY 4.0, עם קרדיט). מודפסים בצבע מלא, ללא רקע.' : 'אייקונים וקטוריים מ־' + (freeSet === 'solid' ? 'Phosphor' : 'Tabler') + ' (רישיון MIT, חינם לשימוש מסחרי). מקבלים כל צבע, חריטה או מראה זהב.') + ' כפתור PNG שומר קובץ שקוף ברזולוציה 2048.' : libTab === 'icons' ? 'לחיצה מוסיפה את האייקון כהדפסה. PNG שומר קובץ שקוף.' : libTab === 'mine' ? 'לחיצה מוסיפה את התמונה לעיצוב.' : 'סמלים מקוריים בהשראת היחידות והערים, לא הסמלים הרשמיים. סמל רשמי (באישור) אפשר להעלות ל"התמונות שלי".'}</p>
   <div class="grid-shapes">${grid}</div></div>`;
}
function drawBadgeThumbs() { $$('canvas[data-bdg]').forEach(cv => { const [t, id] = cv.dataset.bdg.split(':'); const it = (t === 'units' ? UNITS : CITIES).find(x => x.id === id); const g = cv.getContext('2d'); g.clearRect(0, 0, 120, 120); g.drawImage(badgeCanvas(libItem(it), false, 240), 4, 4, 112, 112); }); }
function libLookup(ref) { const [t, id, j] = ref.split(':'); if (t === 'free') return FREE_ICONS[id] && FREE_ICONS[id][+j]; if (t === 'units') return UNITS.find(x => x.id === id); if (t === 'cities') return CITIES.find(x => x.id === id); if (t === 'icons') return shapeById(id); if (t === 'mine') return myLib()[+id]; }
function iconPNG(ref) {
  const [t, set] = ref.split(':'), it = libLookup(ref); if (!it) return;
  if (t === 'free') { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 2048; c.getContext('2d').drawImage(im, 0, 0, 2048, 2048); c.toBlob(b => saveFile(`icon-${it[0]}.png`, b), 'image/png'); }; im.src = freeSvg(set, it); return; }
  if (t === 'units' || t === 'cities') return badgeCanvas(libItem(it), false, 1600).toBlob(b => saveFile(`badge-${it.id}.png`, b), 'image/png');
  const sd = shapeData(it.id), s = 1600 / Math.max(sd.mask.width, sd.mask.height), c = document.createElement('canvas'); c.width = Math.round(sd.mask.width * s); c.height = Math.round(sd.mask.height * s);
  c.getContext('2d').drawImage(tinted(sd.mask, 'png:' + it.id, '#111827'), 0, 0, c.width, c.height); c.toBlob(b => saveFile(`icon-${it.id}.png`, b), 'image/png');
}
function onLibClick(e) {
  const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
  if (d.libtab) { libTab = d.libtab; renderPanel(); }
  else if (d.freeset) { freeSet = d.freeset; renderPanel(); }
  else if (d.libpng) iconPNG(d.libpng);
  else if (d.libdel != null) { const l = myLib(); l.splice(+d.libdel, 1); store.set('ps-lib', l); renderPanel(); }
  else if (d.libadd) {
    const [t] = d.libadd.split(':'), it = libLookup(d.libadd); if (!it) return; let el;
    if (t === 'units' || t === 'cities') el = Object.assign(libItem(it), { id: uid(), s: 0.42, fin: 'back', fx: 0.5, fy: 0.3, rot: 0 });
    else if (t === 'free') { const set = d.libadd.split(':')[1]; el = { id: uid(), type: 'image', src: freeSvg(set, it, '#000000'), s: 0.22, fin: 'back', fx: 0.5, fy: 0.3, rot: 0, mono: set !== 'color', color: '#1c2c5b', icon: it[0] }; }
    else if (t === 'icons') el = SYM(it.id, { s: 0.25, fy: 0.3, color: '#1c2c5b' });
    else el = { id: uid(), type: 'image', src: it.src, s: 0.35, fin: 'back', fx: 0.5, fy: 0.3, rot: 0, mono: false, color: '#1c2c5b' };
    S.els.push(el); sel = el.id; changed(); toast('נוסף לעיצוב. גררו אותו למקום.');
  }
}
function onLibChange(e) {
  if (e.target.id !== 'libUp') return; const files = [...e.target.files];
  files.forEach(f => readFile(f, src => shrinkImage(src, 900, s2 => { const l = myLib(); l.push({ n: f.name.replace(/\.[^.]+$/, '').slice(0, 24), src: s2 }); store.set('ps-lib', l); if (JSON.stringify(store.get('ps-lib', [])).length < 10) toast('אין מקום בדפדפן לתמונה נוספת'); renderPanel(); })));
}

/* ===================== Shape-aware auto layout ===================== */
function interiorRows(sd, rows = 200) {
  const ar = sd.aspect, w = Math.max(20, Math.round(rows * ar)), c = document.createElement('canvas'); c.width = w; c.height = rows; const g = c.getContext('2d'); g.drawImage(sd.mask, 0, 0, w, rows);
  const d = g.getImageData(0, 0, w, rows).data, out = [];
  for (let y = 0; y < rows; y++) { let best = [0, 0], st = -1; for (let x = 0; x <= w; x++) { const on = x < w && d[(y * w + x) * 4 + 3] > 128; if (on && st < 0) st = x; if (!on && st >= 0) { if (x - st > best[1] - best[0]) best = [st, x]; st = -1; } } out.push({ x0: best[0] / w, x1: best[1] / w, w: (best[1] - best[0]) / w, c: (best[0] + best[1]) / 2 / w }); }
  return out;
}
const ROLE_W = { symbol: 1.3, badge: 2.4, title: 1.35, name: 1.6, dedication: 1, date: 0.6, sub: 0.8, signature: 0.75 };
const ROLE_MAX = { title: 0.13, name: 0.16, dedication: 0.065, date: 0.045, sub: 0.06, signature: 0.055 };
function autoLayout(items) {
  const { W, H, sd } = dims(), rows = interiorRows(sd), N = rows.length, maxw = Math.max(...rows.map(r => r.w));
  const good = rows.map(r => r.w >= maxw * 0.42); let y0 = good.indexOf(true), y1 = good.lastIndexOf(true); if (y0 < 0) { y0 = 0; y1 = N - 1; }
  const pad = Math.round((y1 - y0) * 0.07); y0 += pad; y1 -= pad; if (S.base.type !== 'none' && S.base.type !== 'standoff') y1 = Math.min(y1, Math.round(N * (1 - 9 / H)));
  const wt = it => (ROLE_W[it.role] || 1) * (it.type === 'text' ? Math.max(1, String(it.text).split('\n').length * 0.8) : 1);
  const total = items.reduce((a, it) => a + wt(it), 0); let acc = y0; const m = document.createElement('canvas').getContext('2d');
  items.forEach(it => {
    const h = (y1 - y0) * wt(it) / total, a = Math.round(acc), b = Math.max(a + 1, Math.round(acc + h)); acc += h;
    const seg = rows.slice(a, b).filter(r => r.w > 0); const minw = seg.length ? Math.min(...seg.map(r => r.w)) : 0.5, cx = seg.length ? seg.reduce((s, r) => s + r.c, 0) / seg.length : 0.5;
    const hf = (b - a) / N; it.fx = cx; it.fy = (a + b) / 2 / N;
    if (it.type === 'text') {
      const lines = String(it.text).split('\n'); m.font = `${it.weight} 100px "${it.font}"`; const wr = Math.max(...lines.map(l => m.measureText(l).width)) / 100 || 1;
      const sW = 0.86 * minw / wr, sH = hf * (H / W) / (lines.length * 1.2) * 0.9; it.s = Math.max(0.018, Math.min(sW, sH, ROLE_MAX[it.role] || 0.1));
    } else {
      const ia = it.type === 'badge' ? 1 : (shapeData(it.shape) || { aspect: 1 }).aspect; it.s = Math.max(0.05, Math.min(minw * 0.78, 0.88 * hf * ia * H / W, it.type === 'badge' ? 0.62 : 0.4));
    }
  });
  return items;
}

/* ===================== AI auto-designer ===================== */
const SHAPE_WORDS = [[/מרוקאי|ערבסק/, 'arabesque'], [/נרות שבת|פמוטים/, 'arabesque'], [/משולש V|V הפוך|צורת V/i, 'v-award'], [/משושים|כוורת|פטנט/, 'hex-trio'], [/לב/, 'heart'], [/מגן דוד|כוכב דוד/, 'dstar-circle'], [/חנוכי/, 'hanukkiah'], [/מנור/, 'menorah'], [/מפ[הת]|ארץ ישראל/, 'israel-map'], [/דגל/, 'flag-wave'], [/לוחות|בר מצו|בת מצו/, 'tablets'], [/עיגול|עגול/, 'circle'], [/קשת/, 'arch'], [/כוכב/, 'star5'], [/גביע/, 'trophy'], [/כתר/, 'crown'], [/יונ/, 'dove'], [/חמס/, 'hamsa'], [/ירושלים|חומות/, 'old-walls'], [/משושה/, 'hexagon'], [/דיסקית/, 'dogtag'], [/טנק|שריון/, 'tank'], [/מטוס|טייס/, 'jet'], [/מצנח/, 'parachute'], [/להבה|לפיד/, 'flame'], [/בית|חנוכת בית/, 'house'], [/עץ החיים/, 'tree-life'], [/אליפס/, 'oval'], [/מלבן/, 'rrect'], [/ריבוע/, 'square']];
const EXAMPLES = [
  { p: 'לב 20 ס״מ, פרספקס 10 מ״מ, בסיס עץ. הקדשה: לאמא הכי טובה בעולם, באהבה גדולה. נועה, איתי ומאיה. 12.10.2026', spec: { shape: 'heart', size_cm: 20, thickness_mm: 10, material: 'clear', base: 'wood', plaque: '', background: null, items: [{ type: 'text', role: 'title', text: 'לאמא', font: 'Suez One', weight: 400, color: '#b0284b' }, { type: 'text', role: 'dedication', text: 'הכי טובה בעולם\nבאהבה גדולה', font: 'Assistant', weight: 600, color: '#3a1d2b' }, { type: 'text', role: 'name', text: 'נועה · איתי · מאיה', font: 'Frank Ruhl Libre', weight: 700, color: '#b0284b' }, { type: 'text', role: 'date', text: '12.10.2026', font: 'Assistant', weight: 400, color: '#3a1d2b' }] } },
  { p: 'מעמד פרידה למפקד מחלקה בגולני, 25 ס״מ, 15 מ״מ, בסיס שחור. "למפקד שלנו, סגן עידו כהן", מחלקה 2, פלוגה ב׳, תשפ״ז', spec: { shape: 'shield', size_cm: 25, thickness_mm: 15, material: 'clear', base: 'black', plaque: 'מחלקה 2 · פלוגה ב׳ · תשפ״ז', background: null, items: [{ type: 'badge', unit: 'golani' }, { type: 'text', role: 'title', text: 'למפקד שלנו', font: 'Secular One', weight: 400, color: '#5a3d22' }, { type: 'text', role: 'name', text: 'סגן עידו כהן', font: 'Heebo', weight: 900, color: '#1f2328' }, { type: 'text', role: 'sub', text: 'תודה על הדרך, האמונה והאחווה', font: 'Assistant', weight: 600, color: '#5a3d22' }] } },
  { p: 'חנוכייה מתנה לעובדי החברה, 30 ס״מ רוחב, 10 מ״מ, בסיס LED, כתוב "חג אורים שמח" ובבסיס שם החברה: אלקטרה', spec: { shape: 'hanukkiah', size_cm: 30, thickness_mm: 10, material: 'clear', base: 'led', plaque: 'אלקטרה מאחלת חג אורים שמח', background: null, items: [{ type: 'text', role: 'title', text: 'חג אורים שמח', font: 'Suez One', weight: 400, color: '#ffffff', finish: 'engrave' }] } },
  { p: 'בר מצווה לאריאל, לוחות הברית, 20 ס״מ, פרשת וירא, כ״ב בחשוון תשפ״ז', spec: { shape: 'tablets', size_cm: 20, thickness_mm: 10, material: 'clear', base: 'wood', plaque: '', background: null, items: [{ type: 'text', role: 'title', text: 'מזל טוב', font: 'Suez One', weight: 400, color: '#0038b8' }, { type: 'text', role: 'sub', text: 'לבר המצווה של', font: 'Assistant', weight: 600, color: '#1c2c5b' }, { type: 'text', role: 'name', text: 'אריאל', font: 'Frank Ruhl Libre', weight: 900, color: '#0038b8' }, { type: 'text', role: 'date', text: 'פרשת וירא · כ״ב בחשוון תשפ״ז', font: 'Assistant', weight: 400, color: '#1c2c5b' }] } },
  { p: 'מגן הוקרה מעיריית ירושלים למתנדבת השנה, רחל לוי, קשת 25 ס״מ, 20 מ״מ, עם רקע מלא בגווני אבן ירושלים', spec: { shape: 'arch', size_cm: 25, thickness_mm: 20, material: 'clear', base: 'black', plaque: 'עיריית ירושלים · תשפ״ז', background: { type: 'gradient', c1: '#cdb98e', c2: '#f1e7cf' }, items: [{ type: 'badge', city: 'jerusalem' }, { type: 'text', role: 'title', text: 'מתנדבת השנה', font: 'Frank Ruhl Libre', weight: 900, color: '#5b4320' }, { type: 'text', role: 'name', text: 'רחל לוי', font: 'Heebo', weight: 800, color: '#2b2113' }, { type: 'text', role: 'dedication', text: 'בהוקרה על נתינה ללא גבול\nלמען תושבי העיר', font: 'Assistant', weight: 600, color: '#5b4320' }] } },
];
function aiPrompt(req) {
  return `You are the layout designer of a personalized laser-cut perspex (clear acrylic) award studio in Israel. Turn the customer's free-text request (Hebrew) into ONE design as JSON.
RULES:
- Default: clear acrylic, UV print on the BACK of the piece, NO background (transparent). Add "background" ONLY if the customer explicitly asks for full coverage / background.
- Keep the customer's exact words for names, dedication and dates. Fix only obvious spelling. Hebrew text, no English.
- 2-5 items, top to bottom. Roles: title, name, dedication, sub, date, signature. Optionally one "symbol" (shape id) or one "badge" (unit id or city id) at the top.
- Pick the shape from the request; if none is given, pick the shape that best fits the topic. size_cm is the longest side (default 20). thickness_mm one of 3,5,8,10,15,20,25,30 (default 10).
- Colors: 1 accent + 1 dark ink. Military: unit palette, solid fonts (Heebo 900, Secular One). Family/love: warm rose. Jewish holidays: gold/tekhelet. Memorial: engrave finish, Frank Ruhl Libre.
- finish per item optional: "back" (default), "front", "engrave", "mirror" (gold mirror acrylic glued on the front; good for a short title like "שנה טובה").
- Bases also include pocket (clear sleeve, 3-6 mm sheets, holiday blessing cards), wedge (black wood trapezoid with printed slope, plaque text printed white), crystal (thick bevelled clear block).
- base: none|wood|black|clear|led|metal|easel|standoff|pocket|wedge|crystal|yahrzeit|shabbat. yahrzeit = gold-mirror tray holding a memorial candle and tealight, for memorial (the plaque becomes a verse engraved on the tray, e.g. "רבות בנות עשו חיל" for a woman); shabbat = tray with two candlesticks. Use shape arabesque with both, and a mirror-finish arabesque-line symbol at s 1 as a gold border. plaque: short text for the base plate or "".
SHAPES (id:name): ${SHAPES.map(s => s.id + ':' + s.n).join(', ')}
UNITS (id:name): ${UNITS.map(u => u.id + ':' + u.n).join(', ')}
CITIES (id:name): ${CITIES.map(u => u.id + ':' + u.n).join(', ')}
FONTS: ${FONTS.map(f => f[0]).join(', ')}
JSON SHAPE: {"shape":id,"size_cm":n,"thickness_mm":n,"material":"clear|frost|smoke|bronze|blue|gold|silver|black|white|navy","base":id,"plaque":str,"background":null|{"type":"gradient|color","c1":hex,"c2":hex},"items":[{"type":"text","role":..,"text":..,"font":..,"weight":400|700|900,"color":hex,"finish"?:..}|{"type":"symbol","shape":id,"color":hex}|{"type":"badge","unit"?:id,"city"?:id}]}
EXAMPLES:
${EXAMPLES.map(e => 'REQUEST: ' + e.p + '\nJSON: ' + JSON.stringify(e.spec)).join('\n')}
Reply with only the JSON object.
REQUEST: ${req}`;
}
function localSpec(text) {
  const t = text.replace(/\s+/g, ' ').trim(), spec = { items: [], base: 'wood', material: 'clear', background: null, plaque: '' };
  for (const [re, id] of SHAPE_WORDS) if (re.test(t)) { spec.shape = id; break; }
  const cm = t.match(/(\d+(?:\.\d+)?)\s*(?:ס["״'׳]?מ|סנטימטר|cm)/i); if (cm) spec.size_cm = +cm[1];
  const mm = t.match(/(\d+)\s*(?:מ["״'׳]?מ|מילימטר|mm)/i); if (mm) spec.thickness_mm = +mm[1];
  if (/נר נשמה|יארצייט|אזכרה|הנצחה|לעילוי נשמת|לזכר/.test(t)) spec.base = 'yahrzeit'; else if (/שבת/.test(t)) spec.base = 'shabbat'; else if (/כיס/.test(t)) spec.base = 'pocket'; else if (/טרפז/.test(t)) spec.base = 'wedge'; else if (/קריסטל/.test(t)) spec.base = 'crystal'; else if (/LED|לד|מואר/i.test(t)) spec.base = 'led'; else if (/מתכת/.test(t)) spec.base = 'metal'; else if (/בסיס שחור|מעמד שחור/.test(t)) spec.base = 'black'; else if (/ללא מעמד|בלי מעמד/.test(t)) spec.base = 'none'; else if (/קיר/.test(t)) spec.base = 'standoff';
  const unit = UNITS.find(u => t.includes(u.n)), city = CITIES.find(c => t.includes(c.n.split('־')[0]));
  if (unit) { spec.items.push({ type: 'badge', unit: unit.id }); if (!spec.shape) spec.shape = 'shield'; }
  if (!spec.shape && isTray(spec.base)) spec.shape = 'arabesque';
  else if (city) spec.items.push({ type: 'badge', city: city.id });
  if (spec.shape === 'unit-shield' || spec.shape === 'dstar-circle') spec.shape = spec.shape === 'unit-shield' ? 'shield' : spec.shape;
  const pal = unit ? [unit.c1, '#1f2328'] : city ? [city.c1, '#1f2328'] : spec.shape === 'heart' ? ['#b0284b', '#3a1d2b'] : ['#0038b8', '#1c2c5b'];
  if (/רקע מלא|כיסוי מלא|רקע צבעוני|עם רקע|בגווני/.test(t)) { const p = /אבן ירושלים/.test(t) ? ['#cdb98e', '#f1e7cf'] : /זהב/.test(t) ? ['#9c7424', '#f3d98a'] : /לילה|כהה/.test(t) ? ['#0b1430', '#33478f'] : /תכלת|כחול/.test(t) ? ['#0038b8', '#7fb0ff'] : [pal[0], '#ffffff']; spec.background = { type: 'gradient', c1: p[0], c2: p[1] }; }
  let r = ' ' + t + ' ';
  const dates = []; r = r.replace(/\d{1,2}[./]\d{1,2}[./]\d{2,4}|(?:[א-ת]{1,2}[״"׳'][א-ת]?\s+ב?[א-ת]+\s+)?תש[״"]?פ[״"]?[א-ת]/g, m => { dates.push(m.trim()); return ' , '; });
  const plaq = r.match(/(?:בבסיס|על הבסיס|לוחית)[^:：]*[:：]\s*([^.,]+)/); if (plaq) { spec.plaque = plaq[1].trim(); r = r.replace(plaq[0], ' , '); }
  const quoted = []; r = r.replace(/["“”]([^"“”]{2,})["“”]/g, (m, q) => { quoted.push(q.trim()); return ' . '; });
  const lab = {}; [['title', 'כותרת'], ['ded', 'הקדשה|כיתוב|נוסח'], ['names', 'שמות|שם'], ['date', 'תאריך']].forEach(([k, re]) => { const m = r.match(new RegExp('(?:' + re + ')\\s*[:：]\\s*([^.;]+?)(?=\\s*,?\\s*(?:כותרת|הקדשה|כיתוב|נוסח|שמות|שם|תאריך)\\s*[:：]|[.;]|$)')); if (m) { lab[k] = m[1].trim().replace(/[,\s]+$/, ''); r = r.replace(m[0], ' . '); } });
  if (lab.date) dates.unshift(lab.date);
  let title = lab.title || '', names = lab.names || '', ded = lab.ded || '';
  const mz = t.match(/(?:בר|בת) מצו[ו]?ה ל([א-ת]+)/); if (mz && !names) names = mz[1];
  const role = t.match(/(מתנדב(?:ת)? השנה|עובד(?:ת)? השנה|מנהל(?:ת)? השנה|איש השנה|אשת השנה|מצטיינ(?:ת|ים)? [א-ת]+|מצטיין(?:ת)?)/);
  if (quoted.length) { const q = quoted[0].split(/,\s*/); title = title || q[0]; if (q.length > 1 && !names) names = q.slice(1).join(', '); quoted.slice(1).forEach(x => ded += (ded ? '\n' : '') + x); }
  const PARAM = /ס["״'׳]?מ|מ["״'׳]?מ|מעמד|בסיס|פרספקס|עובי|צורת|רקע|גוונ|LED|רוחב|גובה|^\s*(?:בחירה|מתנה|עם|כתוב|ו?עליו|הכיתוב|ו)\s*$/i;
  const cands = [];
  r.split(/[.;\n]+/).forEach(sen => { const keep = sen.split(',').map(x => x.trim()).filter(x => x.length > 1 && !PARAM.test(x) && !SHAPE_WORDS.some(([re]) => re.test(x)) && !(unit && x.includes(unit.n)) && !(city && x.includes(city.n.split('־')[0])) && !(mz && x.includes(mz[0]))); if (keep.length) cands.push(keep.join(', ')); });
  if (!names) { const i = cands.findIndex(c => c.split(' ').length <= 5 && (/,|\sו[א-ת]/.test(c) || c.split(' ').length <= 3)); if (i >= 0) names = cands.splice(i, 1)[0]; }
  ded = [ded, ...cands].filter(Boolean).join('\n').replace(/,\s*/g, '\n');
  if (!title && !role && !mz && ded && ded.split('\n')[0].split(' ').length <= 4) { const L = ded.split('\n'); title = L.shift(); ded = L.join('\n'); }
  if (!title) title = role ? role[1] : mz ? 'מזל טוב' : /חנוכ/.test(t) ? 'חג אורים שמח' : unit ? unit.n : /אמא/.test(t) ? 'לאמא' : /אבא/.test(t) ? 'לאבא' : /סבתא/.test(t) ? 'לסבתא' : /סבא/.test(t) ? 'לסבא' : names ? 'בהוקרה ובהערכה' : '';
  if (ded && title && ded.startsWith(title)) ded = ded.slice(title.length).replace(/^[\s,\n]+/, '');
  if (title) spec.items.push({ type: 'text', role: 'title', text: title, font: unit ? 'Secular One' : 'Suez One', weight: 400, color: pal[0] });
  if (mz) spec.items.push({ type: 'text', role: 'sub', text: /בת מצו/.test(t) ? 'לבת המצווה של' : 'לבר המצווה של', font: 'Assistant', weight: 600, color: pal[1] });
  if (names) spec.items.push({ type: 'text', role: 'name', text: names.replace(/,\s*/g, ' · '), font: 'Frank Ruhl Libre', weight: 900, color: pal[0] });
  if (ded) spec.items.push({ type: 'text', role: 'dedication', text: ded.split('\n').slice(0, 4).join('\n'), font: 'Assistant', weight: 600, color: pal[1] });
  if (dates.length) spec.items.push({ type: 'text', role: 'date', text: dates.join(' · '), font: 'Assistant', weight: 400, color: pal[1] });
  if (!spec.items.some(i => i.type === 'text')) spec.items.push({ type: 'text', role: 'title', text: t.slice(0, 40), font: 'Suez One', weight: 400, color: pal[0] });
  return spec;
}
function applySpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('bad spec');
  if (spec.shape && shapeById(spec.shape)) { S.shape = spec.shape; S.custom = null; }
  const sd = shapeData(S.shape), L = clamp((+spec.size_cm || 20) * 10, 50, 900); S.lock = true; S.h = 0; S.w = Math.round(sd.aspect >= 1 ? L : L * sd.aspect);
  if (spec.thickness_mm) S.t = THICK.reduce((a, b) => Math.abs(b - spec.thickness_mm) < Math.abs(a - spec.thickness_mm) ? b : a, 10);
  if (MATERIALS.find(m => m.id === spec.material)) S.mat = spec.material;
  if (BASES.find(b => b.id === spec.base)) S.base.type = spec.base;
  S.base.plaque = typeof spec.plaque === 'string' ? spec.plaque.slice(0, 60) : '';
  const bgd = spec.background; S.bg = Object.assign({}, BG_DEF, bgd && bgd.type && bgd.type !== 'none' ? { type: bgd.type === 'color' ? 'color' : 'gradient', c1: bgd.c1 || '#0038b8', c2: bgd.c2 || '#ffffff' } : {});
  const hex = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#1c2c5b', fin = f => ['back', 'front', 'engrave', 'mirror'].includes(f) ? f : 'back';
  const items = (Array.isArray(spec.items) ? spec.items : []).slice(0, 7).map(it => {
    if (it.type === 'badge') { const u = UNITS.find(x => x.id === it.unit) || CITIES.find(x => x.id === it.city); return u ? Object.assign(libItem(u), { id: uid(), role: 'badge', fin: fin(it.finish), rot: 0 }) : null; }
    if (it.type === 'symbol') return shapeById(it.shape) ? SYM(it.shape, { role: 'symbol', color: hex(it.color), fin: fin(it.finish) }) : null;
    if (it.type === 'text' && it.text) return T_(String(it.text).slice(0, 160), { role: ROLE_W[it.role] ? it.role : 'sub', font: FONTS.find(f => f[0] === it.font) ? it.font : 'Assistant', weight: [400, 700, 900].includes(+it.weight) ? +it.weight : 700, color: hex(it.color), fin: fin(it.finish) });
    return null;
  }).filter(Boolean);
  if (!items.length) throw new Error('empty');
  if (sd.fill < 0.45) { const txt = items.filter(i => i.type === 'text' && i.fin !== 'engrave'); if (txt.length) { if (S.base.type === 'none' || !isBlock(S.base.type)) S.base.type = 'wood'; S.base.plaque = [txt.map(i => i.text.replace(/\n/g, ' ')).join(' · '), S.base.plaque].filter(Boolean).join(' · ').slice(0, 70); txt.forEach(i => items.splice(items.indexOf(i), 1)); } if (!items.length) { S.els = []; sel = null; lastKey = ''; rebuildAll(); tab = 'design'; renderPanel(); return; } }
  rebuildPiece(); S.els = autoLayout(items); sel = null; lastKey = ''; rebuildAll(); tab = 'design'; renderPanel();
}
async function geminiJSON(prompt) {
  const key = store.get('ps-gkey', ''), model = store.get('ps-gmodel', 'gemini-2.5-flash'); if (!key) throw { code: 'nokey' };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.9 } }) });
  if (!r.ok) throw { code: 'http', message: 'Gemini ' + r.status };
  const j = await r.json(), txt = (((j.candidates || [])[0] || {}).content || { parts: [] }).parts.map(p => p.text || '').join('');
  return JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
}
let sampleP = null;
function sampleNS() { if (!sampleP) sampleP = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null); return sampleP; }
const framed = window.self !== window.top;
function openAI() {
  const last = store.get('ps-ai-last', ''), eng = store.get('ps-ai-engine', 'claude');
  const md = modal(`<div><p class="lead">מעצב AI · כתבו מה צריך, והמחולל מעצב לבד</p><h2>עיצוב אוטומטי</h2></div>
   <textarea id="aiText" dir="rtl" style="min-height:110px" placeholder="לדוגמה: לב 20 ס״מ, פרספקס 10 מ״מ, בסיס עץ. הקדשה: לאמא הכי טובה בעולם. נועה, איתי ומאיה. 12.10.2026">${esc(last)}</textarea>
   <div class="sec"><h3>5 דוגמאות שהמחולל לומד מהן</h3><div class="chips">${EXAMPLES.map((e, i) => `<button class="chip" data-ex="${i}">${['לב לאמא', 'פרידה ממפקד בגולני', 'חנוכייה לעובדים', 'בר מצווה', 'הוקרה מעירייה'][i]}</button>`).join('')}</div></div>
   <div class="sec"><h3>מנוע</h3><div class="cards">
    <button class="card" data-eng="claude" aria-pressed="${eng === 'claude'}" id="engClaude"><b>Claude</b><small>מובנה בעמוד, ללא מפתח</small></button>
    <button class="card" data-eng="gemini" aria-pressed="${eng === 'gemini'}"><b>Gemini של Google</b><small>${framed ? 'עובד בקובץ העצמאי במחשב שלך' : 'עם מפתח API אישי'}</small></button>
    <button class="card" data-eng="local" aria-pressed="${eng === 'local'}"><b>מהיר ללא AI</b><small>זיהוי מילים וחוקי עיצוב</small></button></div>
    <div id="gemBox" ${eng === 'gemini' ? '' : 'hidden'} class="upl"><div class="row"><label for="gKey">מפתח API</label><input type="password" id="gKey" value="${esc(store.get('ps-gkey', ''))}" placeholder="AIza…" style="flex:1"></div><div class="row"><label for="gModel">מודל</label><input type="text" id="gModel" value="${esc(store.get('ps-gmodel', 'gemini-2.5-flash'))}" style="flex:1"></div>
    <p class="hint">${framed ? 'בתצוגה הזו הדפדפן חוסם חיבור ישיר ל־Google. פתחו את perspex-studio.html במחשב כדי להשתמש ב־Gemini.' : 'המפתח נשמר רק בדפדפן הזה. מפתח חינמי: aistudio.google.com.'}</p></div></div>
   <p class="note" id="aiStatus">התוצאה: צורה, מידות, עובי, טקסטים במיקום וגודל שמותאמים לצורה, הדפסה מאחור וללא רקע אלא אם ביקשתם רקע מלא. אחר כך אפשר לערוך הכל.</p>
   <div class="actions"><button class="btn primary" id="aiGo">✦ עצב לי</button><button class="btn" id="aiAgain" hidden>עוד גרסה</button><button class="btn ghost" id="aiClose">סגירה</button></div>`);
  let engine = eng; const st = $('#aiStatus');
  sampleNS().then(s => { if (!s) { const c = $('#engClaude'); if (c) { c.disabled = true; c.querySelector('small').textContent = 'זמין רק בתוך Claude'; } if (engine === 'claude') { engine = 'local'; $$('[data-eng]').forEach(b => b.setAttribute('aria-pressed', b.dataset.eng === engine)); } } });
  const run = async (fresh) => {
    const req = $('#aiText').value.trim(); if (!req) { st.textContent = 'כתבו קודם מה צריך לעצב.'; return; }
    store.set('ps-ai-last', req); const go = $('#aiGo'); go.disabled = true; st.textContent = engine === 'local' ? 'מעצב…' : 'המחולל חושב על העיצוב…';
    try {
      let spec;
      if (engine === 'claude') { const s = await sampleNS(); if (!s) throw { code: 'unavailable' }; spec = await s.json(aiPrompt(req) + (fresh ? '\n(Give a different, fresh variation: other shape or fonts or palette.)' : ''), { modelTier: 'default', cache: fresh ? false : true }); }
      else if (engine === 'gemini') { store.set('ps-gkey', $('#gKey').value.trim()); store.set('ps-gmodel', $('#gModel').value.trim() || 'gemini-2.5-flash'); spec = await geminiJSON(aiPrompt(req) + (fresh ? '\n(Fresh variation.)' : '')); }
      else spec = localSpec(req);
      applySpec(spec); st.textContent = 'העיצוב מוכן בתצוגה. אפשר לבקש עוד גרסה או לסגור ולערוך.'; $('#aiAgain').hidden = engine === 'local';
    } catch (e) {
      const why = e && e.code === 'nokey' ? 'חסר מפתח Gemini.' : e && e.code === 'not_granted' ? 'לא אושר שימוש ב־Claude בעמוד הזה.' : e && e.code === 'rate_limited' ? 'יותר מדי בקשות כרגע. נסו שוב בעוד רגע.' : e && e.code === 'http' ? 'Google החזיר שגיאה (' + e.message + '). בדקו את המפתח והמודל.' : engine === 'gemini' && framed ? 'החיבור ל־Google חסום בתצוגה הזו.' : 'המנוע לא החזיר עיצוב תקין.';
      try { applySpec(localSpec(req)); st.textContent = why + ' יצרתי עיצוב במנוע המהיר במקום.'; } catch (_) { st.textContent = why; }
    } finally { go.disabled = false; }
  };
  md.el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ex != null) $('#aiText').value = EXAMPLES[+b.dataset.ex].p;
    else if (b.dataset.eng) { engine = b.dataset.eng; store.set('ps-ai-engine', engine); $$('[data-eng]').forEach(x => x.setAttribute('aria-pressed', x.dataset.eng === engine)); $('#gemBox').hidden = engine !== 'gemini'; }
    else if (b.id === 'aiGo') run(false); else if (b.id === 'aiAgain') run(true); else if (b.id === 'aiClose') md.close();
  });
}

/* ===================== Production print files (300 dpi, back layer mirrored) ===================== */
function openPrintFiles() {
  const { W, H, sd } = dims(), k = Math.min(11.811, 9000 / Math.max(W, H)), cw = Math.round(W * k), ch = Math.round(H * k), files = [];
  ['back', 'front', 'engrave', 'mirror'].forEach(side => {
    const els = S.els.filter(e => finOf(e) === side && !e.hidden), hasBg = (side === 'back' || side === 'front') && S.bg.type !== 'none' && ((S.bg.side === 'front' || opaqueMat()) === (side === 'front'));
    if (!els.length && !hasBg) return;
    const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
    if (hasBg) g.drawImage(drawBg(cw, ch, k, sd), 0, 0); els.forEach(el => drawElement(g, el, cw, ch, side === 'engrave'));
    g.globalCompositeOperation = 'destination-in'; g.drawImage(sd.mask, 0, 0, cw, ch);
    if (side === 'engrave' || side === 'mirror') { g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); }
    let out = c; if (side === 'back') { out = document.createElement('canvas'); out.width = cw; out.height = ch; const o = out.getContext('2d'); o.translate(cw, 0); o.scale(-1, 1); o.drawImage(c, 0, 0); }
    files.push({ n: side === 'back' ? 'הדפסה מאחור (מראה, צבע)' : side === 'front' ? 'הדפסה מקדימה (צבע)' : side === 'mirror' ? 'חיתוך פרספקס מראה להדבקה (צללית)' : 'חריטת לייזר (שחור)', f: `print-${side}${side === 'back' ? '-mirrored' : ''}-300dpi.png`, c: out });
    if ((side === 'back' || side === 'front') && S.white) { const w = document.createElement('canvas'); w.width = cw; w.height = ch; const wg = w.getContext('2d'); wg.drawImage(out, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = '#000'; wg.fillRect(0, 0, cw, ch); files.push({ n: 'שכבת לבן ל' + (side === 'back' ? 'גב (מראה)' : 'חזית'), f: `white-${side}-300dpi.png`, c: w }); }
  });
  const md = modal(`<div><p class="lead">${W}×${H} מ״מ · 300 DPI · ${cw}×${ch} פיקסלים</p><h2>קבצי ייצור</h2></div>
   <div class="tablewrap"><table class="price"><tbody>${files.map((x, i) => `<tr><td>${x.n}</td><td><small>${x.f}</small></td><td class="num"><button class="btn sm" data-pf="${i}">שמירה</button></td></tr>`).join('') || '<tr><td>אין שכבות הדפסה בעיצוב.</td></tr>'}
   <tr><td>קו חיתוך לייזר</td><td><small>perspex-cut.svg</small></td><td class="num"><button class="btn sm" data-pf="svg">שמירה</button></td></tr></tbody></table></div>
   <p class="note">שכבת ההדפסה מאחור כבר הפוכה (מראה), כך שבמבט מקדימה הטקסט נקרא נכון. קבצי PNG שקופים, בגודל אמיתי ב־300 DPI.</p>
   <div class="actions"><button class="btn ghost" id="pfClose">סגירה</button></div>`);
  md.el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'pfClose') md.close(); else if (b.dataset.pf === 'svg') saveFile('perspex-cut.svg', cutSVG()); else if (b.dataset.pf != null) { const x = files[+b.dataset.pf]; x.c.toBlob(bl => saveFile(x.f, bl), 'image/png'); } });
}

/* ---------- wire up ---------- */
$('#pbody').addEventListener('click', onLibClick); $('#pbody').addEventListener('change', onLibChange);
$('#bAI').onclick = openAI;
if (window.THREE && THREE.OrbitControls) boot(); else window.addEventListener('load', () => { if (window.THREE && THREE.OrbitControls) boot(); else $('#loading').textContent = 'לא הצלחנו לטעון את מנוע התלת־ממד. בדקו את החיבור לאינטרנט ורעננו.'; });
