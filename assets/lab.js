/* =========================================================
   LABORATUVAR — altı interaktif matematik deneyi
   Bağımlılık yok; her deney kendi canvas'ında çalışır.
   ========================================================= */

const AMBER = '#e8a33d';
const TEAL = '#3fb8a6';
const VIOLET = '#8b7bf7';
const ROSE = '#e0645e';
const GRID = 'rgba(255,255,255,0.07)';

function makeLoop(canvas, onFrame) {
  let raf = null;
  let running = true;
  let w = 400;
  let h = 260;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || 400;
    h = canvas.clientHeight || 260;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const tick = (ts) => {
    if (!running) return;
    const ctx = canvas.getContext('2d');
    onFrame(ctx, w, h, ts);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    },
    get w() { return w; },
    get h() { return h; },
    resize,
  };
}

function backdrop(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#070a0e');
  g.addColorStop(1, '#0a0f16');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/* ---------------------------------------------------------
   1. FOURIER ÇARKLARI
   --------------------------------------------------------- */
function fourier(canvas, state, setReadout) {
  let t = 0;
  const wave = [];
  const loop = makeLoop(canvas, (ctx, w, h) => {
    backdrop(ctx, w, h);

    const terms = state.terms;
    const scale = Math.min(h * 0.15, w * 0.09);
    const cx = w * 0.27;
    const cy = h * 0.5;
    const waveX = w * 0.5;
    const amp = Math.min(h * 0.3, 74);

    let px = cx;
    let py = cy;

    ctx.lineWidth = 1;
    for (let k = 0; k < terms; k++) {
      const n = 2 * k + 1;
      const r = (4 / (Math.PI * n)) * scale;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(232,163,61,${0.42 - k * 0.01})`;
      ctx.arc(px, py, Math.max(r, 0.4), 0, Math.PI * 2);
      ctx.stroke();

      const nx = px + r * Math.cos(n * t);
      const ny = py + r * Math.sin(n * t);

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      px = nx;
      py = ny;
    }

    // zincirin ucu → dalga
    const y = py - cy;
    wave.unshift(y);
    const maxLen = Math.max(2, Math.floor((w - waveX - 12) / 1.5));
    if (wave.length > maxLen) wave.length = maxLen;

    ctx.beginPath();
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.8;
    wave.forEach((v, i) => {
      const x = waveX + i * 1.5;
      const yy = cy + v;
      if (i === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = AMBER;
    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // hedef kare dalga (soluk referans)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([3, 4]);
    ctx.moveTo(waveX, cy - amp * 0.785);
    ctx.lineTo(w - 6, cy - amp * 0.785);
    ctx.moveTo(waveX, cy + amp * 0.785);
    ctx.lineTo(w - 6, cy + amp * 0.785);
    ctx.stroke();
    ctx.setLineDash([]);

    t += 0.022 * state.speed;
    setReadout(`terim = ${terms} · f(x) ≈ (4/π) · Σ sin((2k−1)x)/(2k−1)`);
  });

  return () => loop.stop();
}

/* ---------------------------------------------------------
   2. ULAM SPİRALİ
   --------------------------------------------------------- */
function ulam(canvas, state, setReadout) {
  let stopped = false;

  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 400;
    const h = canvas.clientHeight || 260;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    backdrop(ctx, w, h);

    const n = state.n;
    const sieve = new Uint8Array(n + 1).fill(1);
    sieve[0] = 0;
    if (n >= 1) sieve[1] = 0;
    for (let i = 2; i * i <= n; i++) {
      if (sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = 0;
    }

    // spiral koordinatları
    const xs = new Int32Array(n + 1);
    const ys = new Int32Array(n + 1);
    let x = 0, y = 0, k = 1;
    xs[1] = 0; ys[1] = 0;
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // sağ, yukarı, sol, aşağı (ekran y'si ters)
    let dir = 0, run = 1;
    while (k < n) {
      for (let rep = 0; rep < 2 && k < n; rep++) {
        const [dx, dy] = dirs[dir % 4];
        for (let s = 0; s < run && k < n; s++) {
          x += dx; y += dy; k++;
          xs[k] = x; ys[k] = y;
        }
        dir++;
      }
      run++;
    }

    let maxAbs = 1;
    for (let i = 1; i <= n; i++) {
      maxAbs = Math.max(maxAbs, Math.abs(xs[i]), Math.abs(ys[i]));
    }

    const pad = 14;
    const cell = Math.min((w - pad * 2) / (2 * maxAbs + 1), (h - pad * 2) / (2 * maxAbs + 1));
    const ox = w / 2;
    const oy = h / 2;
    const size = Math.max(cell * 0.92, 0.9);

    let primes = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 1; i <= n; i++) {
      if (sieve[i]) continue;
      ctx.fillRect(ox + xs[i] * cell - size / 2, oy + ys[i] * cell - size / 2, size, size);
    }
    ctx.fillStyle = AMBER;
    for (let i = 1; i <= n; i++) {
      if (!sieve[i]) continue;
      primes++;
      const s = Math.max(size, 1.4);
      ctx.fillRect(ox + xs[i] * cell - s / 2, oy + ys[i] * cell - s / 2, s, s);
    }

    if (!stopped) {
      const ratio = ((primes / n) * 100).toFixed(1);
      setReadout(`n = ${n.toLocaleString('tr-TR')} · asal = ${primes.toLocaleString('tr-TR')} (%${ratio}) · 1/ln(n) ≈ ${(1 / Math.log(n) * 100).toFixed(1)}%`);
    }
  };

  draw();
  window.addEventListener('resize', draw);
  return { stop: () => { stopped = true; window.removeEventListener('resize', draw); }, redraw: draw };
}

/* ---------------------------------------------------------
   3. PASCAL ÜÇGENİ (mod p)
   --------------------------------------------------------- */
function pascal(canvas, state, setReadout) {
  let stopped = false;

  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 400;
    const h = canvas.clientHeight || 260;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    backdrop(ctx, w, h);

    const rows = state.rows;
    const p = state.p;
    const cell = Math.min((w - 20) / rows, (h - 16) / (rows * 0.92));
    const top = 8;
    const cx = w / 2;
    const hueBase = 32;

    let nonzero = 0;
    let row = [1];
    for (let n = 0; n < rows; n++) {
      const y = top + n * cell * 0.92;
      const rowW = row.length * cell;
      const x0 = cx - rowW / 2;
      for (let k = 0; k < row.length; k++) {
        const v = row[k] % p;
        if (v !== 0) {
          nonzero++;
          const alpha = 0.35 + 0.65 * (v / Math.max(p - 1, 1));
          ctx.fillStyle = `hsla(${hueBase + (v - 1) * 26}, 72%, 60%, ${alpha})`;
          ctx.fillRect(x0 + k * cell, y, Math.max(cell * 0.9, 0.8), Math.max(cell * 0.9, 0.8));
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(x0 + k * cell, y, Math.max(cell * 0.9, 0.8), Math.max(cell * 0.9, 0.8));
        }
      }
      // sonraki satır (mod p)
      const next = [1];
      for (let k = 1; k < row.length; k++) next.push((row[k - 1] + row[k]) % p);
      next.push(1);
      row = next;
    }

    if (!stopped) {
      const total = (rows * (rows + 1)) / 2;
      setReadout(`mod ${p} · ${rows} satır · sıfırdan farklı ${nonzero.toLocaleString('tr-TR')} / ${total.toLocaleString('tr-TR')} hücre (p asal iken fraktal çıkar)`);
    }
  };

  draw();
  window.addEventListener('resize', draw);
  return { stop: () => { stopped = true; window.removeEventListener('resize', draw); }, redraw: draw };
}

/* ---------------------------------------------------------
   4. GALTON TAHTASI
   --------------------------------------------------------- */
function galton(canvas, state, setReadout) {
  let balls = [];
  let counts = [];
  let rows = state.rows;
  let lastSpawn = 0;
  let total = 0;

  const reset = () => {
    rows = state.rows;
    counts = new Array(rows + 1).fill(0);
    balls = [];
    total = 0;
  };
  reset();

  const spawn = (w, h) => {
    const gap = Math.min(46, (w - 60) / (rows + 1));
    const topY = h * 0.16;
    const rowH = (h * 0.58) / rows;
    const cx = w / 2;
    const path = [{ x: cx, y: topY - rowH * 1.4 }];
    let x = cx;
    let right = 0;
    for (let r = 0; r < rows; r++) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (dir === 1) right++;
      x += dir * gap / 2;
      path.push({ x, y: topY + r * rowH });
    }
    path.push({ x, y: topY + rows * rowH + rowH * 0.35 });
    balls.push({ path, p: 0, bin: right });
  };

  const loop = makeLoop(canvas, (ctx, w, h, ts) => {
    if (state.rows !== rows) { rows = state.rows; reset(); }
    backdrop(ctx, w, h);

    const gap = Math.min(46, (w - 60) / (rows + 1));
    const topY = h * 0.16;
    const rowH = (h * 0.58) / rows;
    const cx = w / 2;
    const floorY = topY + rows * rowH + rowH * 0.35;

    // çiviler
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let r = 0; r < rows; r++) {
      for (let j = 0; j <= r; j++) {
        const px = cx + (j - r / 2) * gap;
        const py = topY + r * rowH;
        ctx.beginPath();
        ctx.arc(px, py, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // histogram
    const maxCount = Math.max(1, ...counts);
    const barW = Math.max(3, gap * 0.8);
    for (let i = 0; i <= rows; i++) {
      const bh = (counts[i] / maxCount) * (h * 0.2);
      const bx = cx + (i - rows / 2) * gap;
      ctx.fillStyle = `rgba(232,163,61,${0.35 + 0.55 * (counts[i] / maxCount)})`;
      ctx.fillRect(bx - barW / 2, h - 8 - bh, barW, bh);
    }

    // toplar
    if (ts - lastSpawn > Math.max(18, 110 - state.speed * 90)) {
      spawn(w, h);
      lastSpawn = ts;
    }

    for (const b of balls) {
      b.p += Math.max(0.7, state.speed * 1.4);
      const idx = Math.floor(b.p);
      if (idx >= b.path.length - 1) {
        counts[b.bin]++;
        total++;
        b.done = true;
        continue;
      }
      const a = b.path[idx];
      const c = b.path[idx + 1];
      const f = b.p - idx;
      const x = a.x + (c.x - a.x) * f;
      const y = a.y + (c.y - a.y) * f;
      ctx.beginPath();
      ctx.fillStyle = TEAL;
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    balls = balls.filter((b) => !b.done);

    // beklenen binom eğrisi
    setReadout(`${total.toLocaleString('tr-TR')} top · ${rows} sıra · dağılım binom(≈normal, μ=${(rows / 2).toFixed(1)})`);
  });

  return () => loop.stop();
}

/* ---------------------------------------------------------
   5. RİEMANN TOPLAMI
   --------------------------------------------------------- */
function riemann(canvas, state, setReadout) {
  const f = (x) => x * x;
  const A = 0, B = 2;
  const exact = (B ** 3 - A ** 3) / 3;

  const loop = makeLoop(canvas, (ctx, w, h) => {
    backdrop(ctx, w, h);

    const pad = { l: 36, r: 16, t: 18, b: 26 };
    const pw = w - pad.l - pad.r;
    const ph = h - pad.t - pad.b;
    const yMax = 4.4;

    const X = (x) => pad.l + ((x - A) / (B - A)) * pw;
    const Y = (y) => pad.t + ph - (y / yMax) * ph;

    // eksenler
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + ph);
    ctx.lineTo(pad.l + pw, pad.t + ph);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px ui-monospace, monospace';
    for (let x = 0; x <= 2; x += 0.5) {
      ctx.fillText(x.toFixed(1), X(x) - 6, h - 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(X(x), pad.t);
      ctx.lineTo(X(x), pad.t + ph);
      ctx.stroke();
    }

    const n = state.n;
    const dx = (B - A) / n;
    const method = state.method;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      const xl = A + i * dx;
      const xr = xl + dx;
      let xs;
      if (method === 'left') xs = xl;
      else if (method === 'right') xs = xr;
      else xs = (xl + xr) / 2;
      const hgt = f(xs);
      sum += hgt * dx;

      ctx.fillStyle = 'rgba(63,184,166,0.16)';
      ctx.fillRect(X(xl), Y(hgt), (X(xr) - X(xl)), Y(0) - Y(hgt));
      ctx.strokeStyle = 'rgba(63,184,166,0.45)';
      ctx.strokeRect(X(xl), Y(hgt), X(xr) - X(xl), Y(0) - Y(hgt));
    }

    // eğri
    ctx.beginPath();
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2.2;
    for (let i = 0; i <= 240; i++) {
      const x = A + ((B - A) * i) / 240;
      const px = X(x);
      const py = Y(f(x));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const err = Math.abs(sum - exact);
    const pct = (err / exact) * 100;
    setReadout(`n = ${n} · ${method === 'mid' ? 'orta' : method === 'left' ? 'sol' : 'sağ'} toplam = ${sum.toFixed(5)} · gerçek = ${exact.toFixed(5)} · hata %${pct.toFixed(2)}`);
  });

  return () => loop.stop();
}

/* ---------------------------------------------------------
   6. JULIA KÜMESİ
   --------------------------------------------------------- */
function julia(canvas, state, setReadout) {
  let stopped = false;
  let pending = false;

  const draw = () => {
    if (stopped) return;
    pending = false;
    const W = 380;
    const H = 250;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(W, H);
    const data = img.data;

    const cr = state.cr;
    const ci = state.ci;
    const maxIter = 90;
    const zoom = 1.6;

    let inside = 0;
    for (let py = 0; py < H; py++) {
      const wy = ((py / H) * 2 - 1) * zoom * (H / W);
      for (let px = 0; px < W; px++) {
        let zx = ((px / W) * 2 - 1) * zoom;
        let zy = wy;
        let it = 0;
        while (zx * zx + zy * zy <= 4 && it < maxIter) {
          const t = zx * zx - zy * zy + cr;
          zy = 2 * zx * zy + ci;
          zx = t;
          it++;
        }
        const o = (py * W + px) * 4;
        if (it >= maxIter) {
          inside++;
          data[o] = 8; data[o + 1] = 12; data[o + 2] = 20; data[o + 3] = 255;
        } else {
          const s = it / maxIter;
          const r = Math.round(20 + 230 * Math.pow(s, 0.55));
          const g = Math.round(18 + 150 * Math.pow(s, 1.1));
          const b = Math.round(30 + 120 * (1 - s) + 60 * Math.pow(s, 0.3));
          data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    setReadout(`c = ${cr.toFixed(2)} ${ci >= 0 ? '+' : '−'} ${Math.abs(ci).toFixed(2)}i · içeride kalan %${((inside / (W * H)) * 100).toFixed(1)}`);
  };

  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(draw);
  };

  draw();
  return { stop: () => { stopped = true; }, schedule };
}

/* ---------------------------------------------------------
   DENEY TANIMLARI
   --------------------------------------------------------- */
const EXPERIMENTS = [
  {
    id: 'fourier',
    title: 'Fourier Çarkları',
    sub: 'Bir kare dalga, dönen çemberlerin toplamıdır.',
    tag: 'Analiz',
    note: '<b>Nerede işe yarar:</b> ses sıkıştırma (MP3), görüntü işleme (JPEG), MRI, radar, kablosuz iletişim. Karmaşık bir sinyali basit dönüşlere ayırmak modern mühendisliğin temel hamlesidir.',
    controls: [
      { key: 'terms', label: 'Çark sayısı', min: 1, max: 25, step: 1, value: 5 },
      { key: 'speed', label: 'Hız', min: 0.2, max: 3, step: 0.1, value: 1 },
    ],
    create: fourier,
  },
  {
    id: 'ulam',
    title: 'Ulam Spirali',
    sub: 'Sayıları spirale dizince asallar çapraz çizgiler kurar.',
    tag: 'Sayılar',
    note: '<b>Nerede işe yarar:</b> Görünürde rastgele olan bir dizide saklı yapı aramak. Bu “desen avcılığı” kriptografiden veri bilimine kadar her yerde kullanılır. Kimse bu çizgilerin neden oluştuğunu tam olarak açıklayamıyor — açık problem!',
    controls: [
      { key: 'n', label: 'Sayı adedi', min: 500, max: 40000, step: 500, value: 12000 },
    ],
    create: ulam,
  },
  {
    id: 'pascal',
    title: 'Pascal Fraktalı',
    sub: 'Binom katsayılarını mod p\'de boyarsan kendini tekrar eden bir örüntü çıkar.',
    tag: 'Kombinatorik',
    note: '<b>Nerede işe yarar:</b> Lucas teoremi sayesinde “C(n,k) p’ye bölünür mü?” sorusu tek tek hesaplamadan yanıtlanır. Aynı fraktal, hücresel otomat ve kaos teorisinde karşımıza çıkar.',
    controls: [
      { key: 'p', label: 'Mod (p)', min: 2, max: 12, step: 1, value: 2 },
      { key: 'rows', label: 'Satır', min: 8, max: 128, step: 4, value: 64 },
    ],
    create: pascal,
  },
  {
    id: 'galton',
    title: 'Galton Tahtası',
    sub: 'Her top yazı tura atar; yine de hepsi çan eğrisine dizilir.',
    tag: 'Olasılık',
    note: '<b>Nerede işe yarar:</b> Merkezi limit teoreminin gözle görülür hâli. Anket hataları, üretim toleransları, aktüerya riskleri — hepsi bu eğrinin etrafında konuşur.',
    controls: [
      { key: 'rows', label: 'Sıra sayısı', min: 6, max: 16, step: 1, value: 11 },
      { key: 'speed', label: 'Top hızı', min: 0.4, max: 3, step: 0.1, value: 1.4 },
    ],
    create: galton,
  },
  {
    id: 'riemann',
    title: 'Riemann Toplamı',
    sub: 'Eğrinin altındaki alanı dikdörtgenlerle kapla; dilimi incelt, hatayı gör.',
    tag: 'Kalkülüs',
    note: '<b>Nerede işe yarar:</b> İntegralin tanımı budur. Fizik simülasyonları, olasılık yoğunlukları, makine öğrenmesinde beklenen değer hesapları — hepsi “sonsuz küçük dilim” fikrine dayanır.',
    controls: [
      { key: 'n', label: 'Dilim sayısı', min: 1, max: 120, step: 1, value: 8 },
      { key: 'method', label: 'Yöntem', type: 'select', options: [['mid', 'Orta nokta'], ['left', 'Sol uç'], ['right', 'Sağ uç']], value: 'mid' },
    ],
    create: riemann,
  },
  {
    id: 'julia',
    title: 'Julia Kümesi',
    sub: 'Tek bir c sayısını değiştir; sonsuz çeşitlilikte sınırlar doğsun.',
    tag: 'Kaos',
    note: '<b>Nerede işe yarar:</b> Basit kural + tekrar = karmaşık yapı. Fraktal sıkıştırma, desen üretimi, kaotik sistemlerin modellenmesi. Ayrıca “basit kurallardan doğan karmaşıklık” fikrinin en güzel kanıtı.',
    controls: [
      { key: 'cr', label: 'Re(c)', min: -1, max: 1, step: 0.01, value: -0.4 },
      { key: 'ci', label: 'Im(c)', min: -1, max: 1, step: 0.01, value: 0.6 },
    ],
    create: julia,
  },
];

/* ---------------------------------------------------------
   MONTAJ
   --------------------------------------------------------- */
export function mountLabs(host) {
  const cleanups = [];
  const allSetters = [];

  EXPERIMENTS.forEach((exp, index) => {
    const card = document.createElement('article');
    card.className = 'lab-card';
    card.innerHTML = `
      <div class="lab-head">
        <div>
          <h3>${exp.title}</h3>
          <p>${exp.sub}</p>
        </div>
        <span class="lab-tag">${exp.tag}</span>
      </div>
      <div class="lab-canvas-wrap"><canvas aria-label="${exp.title} görselleştirmesi"></canvas></div>
      <div class="lab-controls"></div>
      <div class="lab-controls" style="padding-top:0">
        <p class="lab-readout"></p>
        <p class="lab-note">${exp.note}</p>
      </div>
    `;

    const canvas = card.querySelector('canvas');
    const ctrlHost = card.querySelector('.lab-controls');
    const readout = card.querySelector('.lab-readout');
    const state = {};
    const setters = [];

    const setReadout = (txt) => { if (readout.textContent !== txt) readout.textContent = txt; };

    exp.controls.forEach((c) => {
      state[c.key] = c.value;
      const row = document.createElement('div');
      row.className = 'ctrl';

      if (c.type === 'select') {
        row.style.gridTemplateColumns = '130px 1fr';
        const sel = document.createElement('select');
        sel.style.cssText = 'background:#161d28;color:#eef1f6;border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:6px 8px;font-family:inherit;font-size:.8rem';
        c.options.forEach(([v, label]) => {
          const o = document.createElement('option');
          o.value = v;
          o.textContent = label;
          sel.appendChild(o);
        });
        sel.value = c.value;
        sel.addEventListener('change', () => {
          state[c.key] = sel.value;
          setters.forEach((fn) => fn());
        });
        row.innerHTML = `<span>${c.label}</span>`;
        row.appendChild(sel);
      } else {
        const out = document.createElement('output');
        out.textContent = c.value;
        const input = document.createElement('input');
        input.type = 'range';
        input.min = c.min;
        input.max = c.max;
        input.step = c.step;
        input.value = c.value;
        input.addEventListener('input', () => {
          state[c.key] = parseFloat(input.value);
          out.textContent = input.value;
          setters.forEach((fn) => fn());
        });
        row.innerHTML = `<span>${c.label}</span>`;
        row.appendChild(input);
        row.appendChild(out);
      }
      ctrlHost.appendChild(row);
    });

    host.appendChild(card);

    const created = exp.create(canvas, state, setReadout);
    const setter = (created && (created.redraw || created.schedule)) || null;
    if (setter) { setters.push(setter); allSetters.push(setter); }
    const stopper = typeof created === 'function' ? created : (created && created.stop) || null;
    if (stopper) cleanups.push(stopper);

    const activate = () => {
      host.querySelectorAll('.lab-card').forEach((el) => el.classList.remove('active'));
      card.classList.add('active');
    };
    card.addEventListener('mouseenter', activate);
    card.addEventListener('click', activate);
  });

  window.addEventListener('resize', () => allSetters.forEach((fn) => fn()));

  return () => cleanups.forEach((fn) => fn());
}
