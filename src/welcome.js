
/* ---------- Welcome screen ---------- */
function applyTemplate(id, sizeId) {
  const sz = SIZES.find(s => s.id === (sizeId || S.sizeId || 'm')) || SIZES[1], tp = template(id, sz.w);
  Object.assign(S, tp, { occasion: id, sizeId: sz.id, custom: null }); S.bg = Object.assign({}, BG_DEF, tp.bg || {}); S.els = tp.els; sel = null; lastKey = ''; rebuildAll(); tab = 'design'; renderPanel();
}
const OCC_SHAPE = { staff: 'rrect', hanukkah: 'hanukkiah', independence: 'israel-map', mitzvah: 'tablets', memorial: 'arch', corporate: 'rrect-wide', roshhashana: 'pomegranate', vaward: 'v-award', patent: 'hex-trio', israelmap: 'israel-map-star', yahrzeit: 'ner-neshama', shabbat: 'shabbat-candles' };
function openWelcome() {
  const w = $('#welcome'), saved = !!store.get('ps-design', null);
  w.innerHTML = `<div class="wl">
   <div><p class="eyebrow">סטודיו פרספקס</p><h2>מעמד הוקרה מפרספקס,<br>בעיצוב שלכם.</h2>
    <p class="sub">חיתוך לייזר בכל צורה, הדפסת UV מאחור דרך עומק הפרספקס השקוף, ותצוגה תלת־ממדית חיה עם מחיר מיידי.</p>
    ${saved ? '<button class="btn primary resume" data-w="resume">המשך מהעיצוב האחרון</button>' : ''}</div>
   <div class="go">
    <button class="ai" data-w="ai"><span class="ic"><svg class="i"><use href="#i-spark"/></svg></span><b>עיצוב עם AI</b><span>כתבו הקדשה, שמות ותאריך. המחולל יעצב בשבילכם.</span></button>
    <button data-w="quiz"><span class="ic"><svg class="i"><use href="#i-list"/></svg></span><b>שאלון קצר ומחיר</b><span>ארבע שאלות ומחירון משוער לפי עובי ומעמד.</span></button>
    <button data-w="blank"><span class="ic"><svg class="i"><use href="#i-plus"/></svg></span><b>התחלה מאפס</b><span>בחירת צורה מתוך ${SHAPES.length} צורות ועיצוב חופשי.</span></button>
   </div>
   <div><h3>או התחילו מתבנית</h3><div class="tpls">${OCCASIONS.map(o => `<button class="tpl" data-tpl="${o.id}"><canvas data-th="${OCC_SHAPE[o.id] || 'rrect'}" width="120" height="120"></canvas><b>${o.n}</b><small>${o.sub}</small></button>`).join('')}</div></div>
   <p class="foot">המחירים במחשבון הם מחירי דוגמה עד לעדכון המחירון.</p></div>`;
  w.hidden = false; drawThumbs(); w.scrollTop = 0;
}
function closeWelcome() { $('#welcome').hidden = true; }
$('#welcome').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tpl) { applyTemplate(b.dataset.tpl); closeWelcome(); return; }
  const k = b.dataset.w; if (!k) return; closeWelcome();
  if (k === 'ai') openAI(); else if (k === 'quiz') openQuiz(0); else if (k === 'blank') { S.els = []; sel = null; S.shape = 'rrect'; S.h = 0; S.bg = Object.assign({}, BG_DEF); lastKey = ''; rebuildAll(); tab = 'shape'; renderPanel(); }
});
$('#bHome').onclick = openWelcome;
