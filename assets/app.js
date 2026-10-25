/* =========================================================
   İKİGAİ × MATEMATİK — uygulama mantığı
   ========================================================= */
import { AXES, AXIS_ORDER, LIKERT, QUESTIONS, FIELDS, LIBRARY } from './data.js';
import { mountLabs } from './lab.js';
import { QUESTIONS as BANK, CATEGORIES } from './questions.js';

const KEY = 'ikigai-math-v1';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const DEFAULT_STATE = {
  answers: {},
  result: null,
  trainer: { solved: 0, correct: 0, byCat: {}, streak: 0, last: '', history: [] },
  roadmap: { field: '', minutes: 30 },
  libraryFilter: 'Tümü',
};

const clone = (o) => JSON.parse(JSON.stringify(o));

let S = load();
let activeField = null;
let session = null;
let timerId = null;

/* ---------------- depolama ---------------- */
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...clone(DEFAULT_STATE), ...parsed, trainer: { ...DEFAULT_STATE.trainer, ...(parsed.trainer || {}) }, roadmap: { ...DEFAULT_STATE.roadmap, ...(parsed.roadmap || {}) } };
  } catch {
    return clone(DEFAULT_STATE);
  }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* sessiz */ }
}

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------------- yönlendirme ---------------- */
const ROUTES = ['pusula', 'laboratuvar', 'antrenman', 'yol', 'kutuphane'];

function route(name, push = true) {
  if (!ROUTES.includes(name)) name = 'pusula';
  ROUTES.forEach((r) => {
    const view = document.getElementById(`view-${r}`);
    if (view) view.hidden = r !== name;
  });
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === name));
  if (push && location.hash !== `#${name}`) history.pushState(null, '', `#${name}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ---------------- pusula: eksen kartları ---------------- */
function renderAxisCards() {
  $('#axisCards').innerHTML = AXIS_ORDER.map((k) => {
    const a = AXES[k];
    return `<div class="axis-card">
      <h4><span class="dot" style="background:${a.color}"></span>${a.name}</h4>
      <p>${a.blurb}</p>
    </div>`;
  }).join('');
}

/* ---------------- pusula: anket ---------------- */
function renderAssessment() {
  const host = $('#assessment');
  let n = 0;
  host.innerHTML = AXIS_ORDER.map((axisKey) => {
    const a = AXES[axisKey];
    const qs = QUESTIONS.filter((q) => q.axis === axisKey);
    return `<div class="qgroup" data-axis="${axisKey}">
      <div class="qgroup-label"><i style="background:${a.color}"></i>${a.name}</div>
      ${qs.map((q) => {
        n += 1;
        const val = S.answers[q.id];
        return `<div class="q ${val ? 'answered' : ''}" data-qid="${q.id}">
          <div class="q-text"><span class="q-num">${String(n).padStart(2, '0')}</span>${q.text}</div>
          <div class="likert" role="group" aria-label="${q.text}">
            ${LIKERT.map((l) => `<button type="button" data-val="${l.value}" class="${val === l.value ? 'on' : ''}" title="${l.label}">${l.value}</button>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  host.querySelectorAll('.q').forEach((row) => {
    row.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-val]');
      if (!btn) return;
      const qid = row.dataset.qid;
      S.answers[qid] = parseInt(btn.dataset.val, 10);
      row.classList.add('answered');
      row.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === btn));
      save();
      updateAssessProgress();
    });
  });
  updateAssessProgress();
}

function updateAssessProgress() {
  const total = QUESTIONS.length;
  const done = QUESTIONS.filter((q) => S.answers[q.id]).length;
  $('#assessProgress').style.width = `${(done / total) * 100}%`;
  $('#assessCount').textContent = `${done} / ${total}`;
  const btn = $('#computeBtn');
  btn.disabled = done < total;
  $('#computeHint').textContent = done < total
    ? `${total - done} ifade kaldı.`
    : 'Hazır. Sonuç tarayıcında kalır, hiçbir yere gönderilmez.';
}

/* ---------------- pusula: hesaplama ---------------- */
function computeResult() {
  const scores = {};
  AXIS_ORDER.forEach((axisKey) => {
    const qs = QUESTIONS.filter((q) => q.axis === axisKey);
    const sum = qs.reduce((s, q) => s + (S.answers[q.id] || 3), 0);
    scores[axisKey] = Math.round(((sum - 4) / 16) * 100);
  });

  const mean = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const vec = AXIS_ORDER.map((k) => Math.max(scores[k] / 100, 0.04));
  const uBar = mean(vec);
  const centered = vec.map((v) => v - uBar);
  const uNorm = Math.hypot(...centered);

  const matches = FIELDS.map((f) => {
    const fv = AXIS_ORDER.map((k) => f.axes[k]);
    const fBar = mean(fv);
    const fc = fv.map((v) => v - fBar);
    const fNorm = Math.hypot(...fc);

    // Profilin ŞEKLİ: merkezlenmiş vektörlerin korelasyonu (Pearson).
    // “Neye daha çok değer veriyorsun?” sorusunu ölçer, “ne kadar yüksek puan verdin?” değil.
    const corr = uNorm < 1e-6 || fNorm < 1e-6 ? 0 : centered.reduce((s, v, i) => s + v * fc[i], 0) / (uNorm * fNorm);
    // DÜZEY uyumu: mutlak puanların alan profiline yakınlığı.
    const level = 1 - vec.reduce((a, v, i) => a + Math.abs(v - fv[i]), 0) / vec.length;
    const fit = 0.85 * corr + 0.15 * (level * 2 - 1);
    return { id: f.id, field: f, fit, corr, score: Math.max(30, Math.min(99, Math.round(50 + 49 * fit))) };
  }).sort((a, b) => b.fit - a.fit);

  const ordered = [...AXIS_ORDER].sort((a, b) => scores[b] - scores[a]);
  const index = Math.round(Math.pow(AXIS_ORDER.reduce((p, k) => p * Math.max(scores[k], 2), 1), 1 / 4));
  const spread = Math.max(...Object.values(scores)) - Math.min(...Object.values(scores));
  const margin = matches[0].fit - matches[1].fit;
  const confidence = spread < 12 || margin < 0.06 ? 'düşük' : spread < 25 || margin < 0.15 ? 'orta' : 'yüksek';

  S.result = { scores, matches, top: matches[0].id, index, strong: ordered[0], weak: ordered[ordered.length - 1], confidence, spread, margin, at: Date.now() };
  if (!S.roadmap.custom) S.roadmap.field = matches[0].id;
  save();
  renderResults();
  renderRoadmap();
}

/* ---------------- pusula: sonuç ---------------- */
function radarSVG(scores) {
  const cx = 170, cy = 152, R = 112;
  const angle = { sev: -Math.PI / 2, yet: 0, dunya: Math.PI / 2, ekonomi: Math.PI };
  const pt = (k, r) => [cx + Math.cos(angle[k]) * r, cy + Math.sin(angle[k]) * r];
  const poly = (r) => AXIS_ORDER.map((k) => pt(k, r).map((v) => v.toFixed(1)).join(',')).join(' ');

  const dataPoly = AXIS_ORDER.map((k) => pt(k, (Math.max(scores[k], 2) / 100) * R).map((v) => v.toFixed(1)).join(',')).join(' ');

  const rings = [0.25, 0.5, 0.75, 1].map((f) => `<polygon class="grid-line" points="${poly(R * f)}" />`).join('');
  const spokes = AXIS_ORDER.map((k) => {
    const [x, y] = pt(k, R);
    return `<line class="axis-line" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`;
  }).join('');

  const labels = AXIS_ORDER.map((k) => {
    const [x, y] = pt(k, R + 26);
    const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end';
    return `<text class="lbl" x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}" fill="${AXES[k].color}">${AXES[k].short}</text>
            <text class="val" x="${x.toFixed(1)}" y="${(y + 16).toFixed(1)}" text-anchor="${anchor}">${scores[k]}</text>`;
  }).join('');

  const points = AXIS_ORDER.map((k) => {
    const [x, y] = pt(k, (Math.max(scores[k], 2) / 100) * R);
    return `<circle class="point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" />`;
  }).join('');

  return `<svg class="radar" viewBox="0 0 340 320" role="img" aria-label="İkigai puan dağılımı">
    ${rings}${spokes}
    <polygon class="shape" points="${dataPoly}" />
    ${points}${labels}
    <text x="${cx}" y="146" text-anchor="middle" fill="#98a2b3" style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.16em">İKİGAİ</text>
    <text x="${cx}" y="170" text-anchor="middle" fill="#e8a33d" style="font-family:Georgia,serif;font-size:22px">${S.result.index}</text>
  </svg>`;
}

function manifesto(r) {
  const top = FIELDS.find((f) => f.id === r.top);
  const strong = AXES[r.strong];
  const weak = AXES[r.weak];
  const project = top.projects[0].toLowerCase();
  return `<p>${r.confidence === 'düşük' ? 'Şu an dört dairem birbirine çok yakın; yani henüz tek bir yön değil, birkaç yön beni çağırıyor. Bu yüzden planı bir deneme olarak kuruyorum. ' : ''}“${strong.name} tarafım ${r.scores[r.strong]}/100 ile en güçlü halkam; ${weak.name.toLowerCase()} tarafım ise ${r.scores[r.weak]}/100 ile en kırılgan noktam.
  Bu yüzden <b>${top.name}</b> bana hem yakın hem sürdürülebilir geliyor: ${top.tagline.toLowerCase()}
  Önümüzdeki 90 günde amacım ${project} üretmek — mükemmel olması değil, <b>bitmiş</b> olması yeter.”</p>
  <span class="sign">kişisel matematik manifestosu · ${new Date().toLocaleDateString('tr-TR')}</span>`;
}

function renderResults() {
  const host = $('#results');
  if (!S.result) {
    host.innerHTML = '';
    $('#assessmentPanel').hidden = false;
    return;
  }
  const r = S.result;
  const top = FIELDS.find((f) => f.id === r.top);

  host.innerHTML = `
    <div class="result-top">
      <div class="panel radar-card">
        <div>
          <p class="eyebrow">İkigai haritan</p>
          ${radarSVG(r.scores)}
          <div class="score-rows">
            ${AXIS_ORDER.map((k) => `
              <div class="score-row">
                <span style="color:${AXES[k].color}">${AXES[k].short}</span>
                <span class="bar"><i style="width:${r.scores[k]}%;background:${AXES[k].color}"></i></span>
                <b>${r.scores[k]}</b>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="panel">
        <p class="eyebrow">Adım 2 / 2 · eşleşme tamam</p>
        <h2 style="margin-bottom:.35em">Senin alanın:<br /><em>${top.name}</em></h2>
        <p class="muted">${top.tagline}</p>
        <p class="small" style="margin:0 0 14px">
          Eşleşme gücü: <b style="color:${r.confidence === 'yüksek' ? '#3fb8a6' : r.confidence === 'orta' ? '#e8a33d' : '#e0645e'}">${r.confidence}</b>
          <span class="muted"> · eksenler arası fark ${r.spread} puan</span>
          ${r.confidence === 'düşük' ? '<br /><span class="muted">Cevapların birbirine yakın; bu sonucu bir etiket değil, deneyeceğin alanların listesi olarak oku.</span>' : ''}
        </p>
        <div class="manifesto">${manifesto(r)}</div>
        <div class="pill-row" style="margin-top:16px">
          <button class="btn btn-primary btn-sm" id="goRoadmap">90 günlük planı aç</button>
          <button class="btn btn-ghost btn-sm" id="copyManifest">Manifestoyu kopyala</button>
          <button class="btn btn-ghost btn-sm" id="retake">Pusulayı yenile</button>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:22px">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Eşleşme sıralaması</p>
          <h2 style="font-size:1.5rem">Sekiz alan, tek bir vektör</h2>
          <p class="muted small" style="margin:.4em 0 0">Puan, dört eksendeki profilin ile alanın profili arasındaki <b>korelasyondan</b> gelir: “neye daha çok değer veriyorsun?” sorusuna bakar. Bir alana tıkla: ne öğreneceğini ve ilk adımını gör.</p>
        </div>
      </div>
      <div class="match-list">
        ${r.matches.map((m, i) => `
          <div class="match ${i === 0 ? 'top' : ''}" data-field="${m.id}">
            <div class="match-icon">${m.field.icon}</div>
            <div>
              <h4>${m.field.short} ${i === 0 ? '<span class="pill accent" style="margin-left:6px;font-size:.64rem">en uygun</span>' : ''}</h4>
              <p>${m.field.tagline}</p>
            </div>
            <div class="match-score">${m.score}<small>UYUM</small></div>
          </div>`).join('')}
      </div>
    </div>

    <div id="fieldDetail"></div>
  `;

  $('#goRoadmap').addEventListener('click', () => {
    S.roadmap.field = top.id;
    save();
    route('yol');
  });
  $('#copyManifest').addEventListener('click', async () => {
    const text = $('#results .manifesto').innerText + `\n\n${top.name} — uyum ${r.matches[0].score}/100 · ikigai indeksi ${r.index}/100`;
    try {
      await navigator.clipboard.writeText(text);
      toast('Manifesto panoya kopyalandı');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('Manifesto panoya kopyalandı'); } catch { toast('Kopyalama desteklenmiyor'); }
      ta.remove();
    }
  });
  $('#retake').addEventListener('click', () => {
    S.answers = {};
    S.result = null;
    save();
    renderAssessment();
    renderResults();
    syncStartBtn();
    $('#assessmentPanel').hidden = false;
    $('#assessmentPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  host.querySelectorAll('.match').forEach((el) => {
    el.addEventListener('click', () => showField(el.dataset.field, true));
  });

  showField(r.top, false);
}

function showField(id, scroll) {
  const f = FIELDS.find((x) => x.id === id);
  if (!f) return;
  activeField = id;
  const host = $('#fieldDetail');
  host.innerHTML = `
    <div class="detail-card panel" style="border:none;background:transparent;padding:0">
      <div style="display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;align-items:flex-end">
        <div>
          <p class="eyebrow">Alan dosyası</p>
          <h2>${f.name}</h2>
          <p class="muted" style="margin:0">${f.tagline}</p>
        </div>
        <div class="pill-row">${f.careers.map((c) => `<span class="pill">${c}</span>`).join('')}</div>
      </div>

      <div class="mini-card" style="margin-top:20px;border-color:rgba(232,163,61,.4);background:rgba(232,163,61,.06)">
        <h5 style="color:#e8a33d">İlk adım — bugün, 15 dakika</h5>
        <p style="margin:0;font-size:.94rem">${f.first}</p>
      </div>

      <div class="detail-grid">
        <div class="mini-card">
          <h5>Temel (ilk 4 hafta)</h5>
          <ul>${f.foundation.map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div class="mini-card">
          <h5>Çekirdek (5–8. hafta)</h5>
          <ul>${f.core.map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div class="mini-card">
          <h5>Üretim (9–12. hafta)</h5>
          <ul>${[...f.applied, ...f.projects.slice(0, 2)].map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
      </div>

      <div class="mini-card">
        <h5>Portföy çıktıları</h5>
        <ul>${f.projects.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>

      <div class="pill-row" style="margin-top:18px">
        <button class="btn btn-primary btn-sm" data-act="roadmap">Bu alanla 90 günlük plan</button>
        <a class="btn btn-ghost btn-sm" href="#laboratuvar">Laboratuvarda dene</a>
        <button class="btn btn-ghost btn-sm" data-act="train">Antrenmana başla</button>
      </div>
    </div>
  `;

  host.querySelector('[data-act="roadmap"]').addEventListener('click', () => {
    S.roadmap.field = f.id;
    save();
    route('yol');
    renderRoadmap();
  });
  host.querySelector('[data-act="train"]').addEventListener('click', () => route('antrenman'));

  if (scroll) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------- antrenman ---------------- */
function catStats(cat) {
  const c = S.trainer.byCat[cat];
  if (!c || !c.a) return { acc: 0, answered: 0 };
  return { acc: c.c / c.a, answered: c.a };
}

function renderTrainerStats() {
  const t = S.trainer;
  const today = new Date().toISOString().slice(0, 10);
  $('#trStreak').textContent = t.streak || 0;
  $('#trToday').textContent = t.last === today ? 'evet ✓' : 'hayır';
  $('#trSolved').textContent = t.solved || 0;
  $('#trAcc').textContent = t.solved ? `${Math.round((t.correct / t.solved) * 100)}%` : '—';
  $('#topStreak').innerHTML = `🔥 <b>${t.streak || 0}</b>`;

  const days = [];
  for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const activeDays = new Set((t.history || []).map((h) => h.at));
  if (t.last) activeDays.add(t.last);
  $('#heatmap').innerHTML = days.map((d) => `<i class="${activeDays.has(d) ? 'on' : ''}" title="${d}"></i>`).join('');

  $('#catBars').innerHTML = CATEGORIES.map((c) => {
    const s = catStats(c.key);
    const pct = Math.round(s.acc * 100);
    return `<div class="catbar">
      <span>${c.label}</span>
      <span class="bar"><i style="width:${s.answered ? pct : 0}%;background:${s.answered ? (pct >= 70 ? '#3fb8a6' : pct >= 40 ? '#e8a33d' : '#e0645e') : 'rgba(255,255,255,.15)'}"></i></span>
      <b>${s.answered ? pct + '%' : '—'}</b>
    </div>`;
  }).join('');
}

function pickQuestions(n = 10) {
  const pool = BANK.map((q) => {
    const s = catStats(q.cat);
    const weight = s.answered < 2 ? 1.35 : 1 + 2.2 * (1 - s.acc);
    return { q, weight: weight * (0.75 + Math.random() * 0.5) };
  });
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const chosen = [];
  const usedCats = {};
  // önce çeşitlilik, sonra ağırlık
  for (const item of shuffled) {
    if (chosen.length >= Math.min(4, n)) break;
    if ((usedCats[item.q.cat] || 0) >= 1) continue;
    usedCats[item.q.cat] = 1;
    chosen.push(item);
  }
  const rest = shuffled.filter((i) => !chosen.includes(i)).sort((a, b) => b.weight - a.weight);
  while (chosen.length < n && rest.length) chosen.push(rest.shift());
  return chosen.sort(() => Math.random() - 0.5).map((i) => i.q);
}

function startSession() {
  session = { qs: pickQuestions(10), i: 0, correct: 0, answered: false, started: Date.now(), qStart: Date.now() };
  $('#trainerIdle').hidden = true;
  $('#trainerPlay').hidden = false;
  renderQuestion();
  clearInterval(timerId);
  timerId = setInterval(() => {
    const el = $('#qTimer');
    if (el && session) el.textContent = `${Math.floor((Date.now() - session.started) / 1000)} sn`;
  }, 500);
}

function renderQuestion() {
  const host = $('#trainerPlay');
  const q = session.qs[session.i];
  session.answered = false;
  session.qStart = Date.now();
  const cat = CATEGORIES.find((c) => c.key === q.cat);
  host.innerHTML = `
    <div class="q-head">
      <div style="display:flex;gap:10px;align-items:center">
        <span class="q-badge">${cat.label}</span>
        <span class="muted small">Soru ${session.i + 1} / ${session.qs.length}</span>
      </div>
      <span class="q-timer" id="qTimer">0 sn</span>
    </div>
    <p class="q-stem">${q.q}</p>
    <div class="answers">
      ${q.options.map((o, i) => `<button class="answer" data-i="${i}"><span class="key">${i + 1}</span><span>${o}</span></button>`).join('')}
    </div>
    <div id="fb"></div>
    <div class="q-foot">
      <span class="kbd-hint"><kbd>1</kbd>–<kbd>4</kbd> cevap · <kbd>Enter</kbd> sonraki</span>
      <button class="btn btn-primary btn-sm" id="nextBtn" hidden>Sonraki →</button>
    </div>
  `;
  host.querySelectorAll('.answer').forEach((b) => b.addEventListener('click', () => answer(parseInt(b.dataset.i, 10))));
}

function answer(idx) {
  if (!session || session.answered) return;
  session.answered = true;
  const q = session.qs[session.i];
  const ok = idx === q.a;
  if (ok) session.correct += 1;

  const btns = $$('#trainerPlay .answer');
  btns.forEach((b, i) => {
    b.disabled = true;
    if (i === q.a) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });

  const fb = $('#fb');
  fb.className = `feedback ${ok ? 'ok' : 'no'}`;
  fb.innerHTML = `<div class="fb-title">${ok ? 'Doğru ✓' : 'Doğru cevap: ' + q.options[q.a]}</div><div>${q.why}</div>`;

  const next = $('#nextBtn');
  next.hidden = false;
  next.textContent = session.i === session.qs.length - 1 ? 'Seansı bitir →' : 'Sonraki →';
  next.onclick = nextQuestion;
  next.focus({ preventScroll: true });

  // istatistik
  const t = S.trainer;
  t.solved += 1;
  if (ok) t.correct += 1;
  const c = t.byCat[q.cat] || { a: 0, c: 0 };
  c.a += 1;
  if (ok) c.c += 1;
  t.byCat[q.cat] = c;
  save();
}

function nextQuestion() {
  if (!session) return;
  if (session.i < session.qs.length - 1) {
    session.i += 1;
    renderQuestion();
  } else {
    finishSession();
  }
}

function finishSession() {
  clearInterval(timerId);
  const total = session.qs.length;
  const acc = Math.round((session.correct / total) * 100);
  const secs = Math.round((Date.now() - session.started) / 1000);

  const t = S.trainer;
  const today = new Date();
  const key = today.toISOString().slice(0, 10);
  const yest = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  if (t.last !== key) {
    t.streak = t.last === yest ? (t.streak || 0) + 1 : 1;
    t.last = key;
  }
  t.history = [...(t.history || []), { at: key, correct: session.correct, total, secs }].slice(-30);
  save();

  const weakCat = CATEGORIES.map((c) => ({ c, s: catStats(c.key) }))
    .filter((x) => x.s.answered > 0)
    .sort((a, b) => a.s.acc - b.s.acc)[0];

  $('#trainerPlay').innerHTML = `
    <p class="eyebrow">Seans tamamlandı</p>
    <h3>${session.correct} / ${total} doğru</h3>
    <p class="muted">${secs} saniye · ${(secs / total).toFixed(1)} sn/soru · seri: ${t.streak} gün</p>
    <div class="summary-grid">
      <div><b>${acc}%</b><span>doğruluk</span></div>
      <div><b>${t.streak}</b><span>gün seri</span></div>
      <div><b>${t.solved}</b><span>toplam soru</span></div>
    </div>
    ${weakCat ? `<p class="muted small">En çok zorlandığın alan: <b>${weakCat.c.label}</b> (%${Math.round(weakCat.s.acc * 100)}). Bir sonraki seansta bu alan daha sık gelecek.</p>` : ''}
    <div class="pill-row" style="margin-top:16px">
      <button class="btn btn-primary btn-sm" id="againBtn">Yeni seans</button>
      <a class="btn btn-ghost btn-sm" href="#yol">Yol haritası</a>
    </div>
  `;
  $('#againBtn').addEventListener('click', startSession);
  session = null;
  renderTrainerStats();
  toast(`Seans bitti · %${acc} doğruluk · ${t.streak} gün seri`);
}

/* ---------------- yol haritası ---------------- */
const MINUTE_OPTIONS = [15, 30, 60, 120];

function weekTasks(topic, minutes, mode, field, idx) {
  if (minutes <= 15) {
    return [
      `${topic} — 1 video/bölüm izle veya oku`,
      mode === 'üretim' ? `Küçük uygulama: ${field.applied[idx % field.applied.length]}` : 'Tek bir örnek problemi elle çöz',
    ];
  }
  if (minutes <= 30) {
    return [
      `${topic} — teoriyi oku/izle, örnekleri kendin tekrar et`,
      '5 alıştırma: 2 kolay, 2 orta, 1 zor',
      mode === 'üretim' ? `Uygulama: ${field.applied[idx % field.applied.length]}` : 'Günlük 3 satır not: bugün ne öğrendim?',
    ];
  }
  if (minutes <= 60) {
    return [
      `${topic} — teori + ispat/çıkarım adımlarını kendin kur`,
      '8–10 alıştırma; takıldıklarını işaretle, ertesi gün geri dön',
      mode === 'üretim' ? `Uygulama: ${field.applied[idx % field.applied.length]}` : 'Hafta sonu: konuyu birine 5 dakikada anlat',
      '1 sayfa özet + cevaplanmamış 1 soru yaz',
    ];
  }
  return [
    `${topic} — derin okuma: kaynak + notlar`,
    '12–15 alıştırma, zor problemlere ayrı zaman',
    `Uygulama/proje: ${field.applied[idx % field.applied.length]}`,
    'Hafta sonu: 20 dakikalık anlatım provası (kamera/arkadaş)',
    '1 sayfa özet + sonraki haftanın sorusunu belirle',
  ];
}

function phaseOutputs(field, phase, idx) {
  if (phase === 0) return `1 sayfalık özet + 3 çözülmüş problem (${field.foundation[idx]})`;
  if (phase === 1) return `İspat/çıkarım notu + 1 grafik veya kod denemesi`;
  return field.projects[idx % field.projects.length];
}

function buildWeeks(field, minutes) {
  const phases = [
    { key: 'temel', label: 'Faz 1 · Temel', desc: 'Sağlamlaştır', topics: field.foundation },
    { key: 'core', label: 'Faz 2 · Derinleşme', desc: 'Çekirdeğe gir', topics: field.core },
    { key: 'uretim', label: 'Faz 3 · Üretim', desc: 'Görünür çıktı ver', topics: [...field.applied, field.projects[0]] },
  ];
  const weeks = [];
  let n = 0;
  phases.forEach((ph, pi) => {
    const list = [];
    for (let i = 0; i < 4; i++) {
      const topic = ph.topics[i % ph.topics.length];
      n += 1;
      list.push({
        no: n,
        title: topic,
        tasks: weekTasks(topic, minutes, ph.key, field, i),
        output: phaseOutputs(field, pi, i),
      });
    }
    weeks.push({ ...ph, weeks: list });
  });
  return weeks;
}

function renderRoadmap() {
  const host = $('#roadmapHost');
  const field = FIELDS.find((f) => f.id === S.roadmap.field) || FIELDS.find((f) => f.id === (S.result && S.result.top)) || FIELDS[0];
  S.roadmap.field = field.id;
  const minutes = S.roadmap.minutes || 30;

  const phases = buildWeeks(field, minutes);
  const totalHours = (minutes * 6 * 12) / 60;
  const totalTasks = phases.reduce((s, p) => s + p.weeks.reduce((a, w) => a + w.tasks.length, 0), 0);

  host.innerHTML = `
    <div class="rm-controls">
      <label>Alan
        <select id="rmField">
          ${FIELDS.map((f) => `<option value="${f.id}" ${f.id === field.id ? 'selected' : ''}>${f.short}</option>`).join('')}
        </select>
      </label>
      <label>Günlük süre
        <select id="rmMinutes">
          ${MINUTE_OPTIONS.map((m) => `<option value="${m}" ${m === minutes ? 'selected' : ''}>${m} dakika</option>`).join('')}
        </select>
      </label>
      <label style="flex-direction:row;align-items:center;gap:10px">
        <span class="muted small">Haftada 6 gün çalışma varsayımı</span>
        <button class="btn btn-ghost btn-sm" id="printPlan">Yazdır / PDF</button>
      </label>
    </div>

    <div class="rm-summary">
      <div><b>${field.short}</b><span>seçili alan</span></div>
      <div><b>${minutes} dk</b><span>günlük</span></div>
      <div><b>${totalHours.toFixed(0)} sa</b><span>toplam süre</span></div>
      <div><b>${totalTasks}</b><span>görev</span></div>
      <div><b>12</b><span>hafta</span></div>
    </div>

    ${phases.map((ph) => `
      <div class="phase">
        <div class="phase-label">
          <span>${ph.label}</span>
          <i></i>
          <h3>${ph.desc}</h3>
        </div>
        <div class="weeks">
          ${ph.weeks.map((w) => `
            <article class="week">
              <header><b>Hafta ${w.no}</b><span class="muted small">${minutes} dk/gün</span></header>
              <h4>${w.title}</h4>
              <ul>${w.tasks.map((t) => `<li>${t}</li>`).join('')}</ul>
              <div class="output"><b>Çıktı:</b> ${w.output}</div>
            </article>`).join('')}
          </div>
      </div>`).join('')}

    <div class="panel" style="margin-top:8px">
      <p class="eyebrow">Plan nasıl çalışır</p>
      <p style="margin:0" class="muted">Her hafta <b>6 gün</b> çalışma, 1 gün serbest. Faz atlamak yok: temel oturmadan çekirdeğe geçmek, çatısı olmayan duvar örmeye benzer.
      Bir haftayı kaçırırsan planı baştan başlatma — kaldığın yerden devam et; süreklilik mükemmellikten önce gelir.</p>
    </div>

    <div class="panel" style="margin-top:18px">
      <p class="eyebrow">Bu alan için kaynaklar</p>
      <div class="pill-row">${field.resources.map((r) => `<span class="pill accent">${r}</span>`).join('')}</div>
      <p class="muted small" style="margin:14px 0 0">Alıştırma çözmeden video izlemek öğrenme değil, tanıdıklık hissidir. Kural: her 10 dakika içerik için 20 dakika problem.</p>
    </div>
  `;

  $('#rmField').addEventListener('change', (e) => {
    S.roadmap.field = e.target.value;
    S.roadmap.custom = true;
    save();
    renderRoadmap();
  });
  $('#rmMinutes').addEventListener('change', (e) => {
    S.roadmap.minutes = parseInt(e.target.value, 10);
    save();
    renderRoadmap();
    toast('Plan süreye göre yeniden kuruldu');
  });
  $('#printPlan').addEventListener('click', () => window.print());
}

/* ---------------- kütüphane ---------------- */
function renderLibrary() {
  const types = ['Tümü', ...Array.from(new Set(LIBRARY.map((l) => l.type)))];
  const current = types.includes(S.libraryFilter) ? S.libraryFilter : 'Tümü';

  $('#libFilters').innerHTML = types.map((t) => `<button class="chip ${t === current ? 'on' : ''}" data-type="${t}">${t}</button>`).join('');
  $$('#libFilters .chip').forEach((b) => b.addEventListener('click', () => {
    S.libraryFilter = b.dataset.type;
    save();
    renderLibrary();
  }));

  const list = LIBRARY.filter((l) => current === 'Tümü' || l.type === current);
  $('#libGrid').innerHTML = list.map((l) => `
    ${l.url ? `<a class="lib-card" href="${l.url}" target="_blank" rel="noopener">` : `<div class="lib-card">`}
      <div class="lib-top">
        <span class="type">${l.type}</span>
        ${l.free ? '<span class="free">ücretsiz</span>' : ''}
      </div>
      <h4>${l.name}</h4>
      <p>${l.why}</p>
    ${l.url ? '</a>' : '</div>'}
  `).join('');
}

function syncStartBtn() {
  const btn = $('#startAssessment');
  if (!btn) return;
  btn.innerHTML = S.result
    ? 'Sonucumu gör <span aria-hidden="true">→</span>'
    : 'Pusulamı oluştur <span aria-hidden="true">→</span>';
}

/* ---------------- başlat ---------------- */
function init() {
  renderAxisCards();
  renderAssessment();
  renderTrainerStats();
  renderRoadmap();
  renderLibrary();
  mountLabs($('#labGrid'));
  renderResults();

  if (S.result) {
    $('#assessmentPanel').hidden = true;
    $$('.q').forEach((row) => {
      const v = S.answers[row.dataset.qid];
      if (v) row.querySelectorAll('button').forEach((b) => b.classList.toggle('on', parseInt(b.dataset.val, 10) === v));
    });
    updateAssessProgress();
  }

  syncStartBtn();
  $('#startAssessment').addEventListener('click', () => {
    if (S.result) {
      $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    $('#assessmentPanel').hidden = false;
    $('#assessmentPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#computeBtn').addEventListener('click', () => {
    computeResult();
    $('#assessmentPanel').hidden = true;
    $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('Pusulan hesaplandı');
  });
  $('#startSession').addEventListener('click', startSession);

  $('#nav').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-route]');
    if (!a) return;
    e.preventDefault();
    route(a.dataset.route);
  });

  window.addEventListener('hashchange', () => route(location.hash.replace('#', ''), false));
  route(location.hash.replace('#', '') || 'pusula', false);

  document.addEventListener('keydown', (e) => {
    if (!session || !$('#trainerPlay') || $('#view-antrenman').hidden) return;
    if (e.key >= '1' && e.key <= '4') {
      const idx = parseInt(e.key, 10) - 1;
      if (!session.answered) answer(idx);
    }
    if (e.key === 'Enter' && session.answered) {
      if (e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      nextQuestion();
    }
  });

  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Tüm cevaplar, antrenman geçmişi ve plan silinecek. Emin misin?')) return;
    localStorage.removeItem(KEY);
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', init);

// Çevrimdışı destek (yalnızca http/https üzerinde çalışır)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sessiz: dosya:// veya kısıtlı ortam */ });
  });
}
