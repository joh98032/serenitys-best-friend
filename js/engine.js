/* The storybook engine: page lifecycle, transitions, parallax camera, captions, controls. */
(function () {
  const { store, tokenize, clamp, lerp, ease } = BOOK.util;
  const audio = BOOK.audio, narrator = BOOK.narrator;
  const pages = BOOK.story.pages;
  const $ = s => document.querySelector(s);
  const app = $('#app'), stage = $('#stage'), capText = $('#caption-text');

  /* ---------- settings ---------- */
  const S = Object.assign({
    auto: true, rate: 0.92, pause: 1.5, music: 0.45, sfx: 0.8, voiceOn: true, tilt: true, muted: false, fx: 'auto', textSize: 'normal'
  }, store.get('settings', {}));
  const save = () => store.set('settings', S);

  /* ---------- motion & performance ---------- */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weakDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  let autoLite = store.get('autoLite', false) || weakDevice;
  function applyFx() {
    const lite = S.fx === 'lite' || (S.fx === 'auto' && autoLite);
    app.classList.toggle('lite', lite);
    app.classList.toggle('reduce-motion', reduceMotion);
  }
  applyFx();
  const applyText = () => { ['large', 'huge'].forEach(k => app.classList.toggle('text-' + k, S.textSize === k)); };
  applyText();
  // watch frame times while reading; if the device struggles, switch to light effects automatically
  const frameTimes = [];
  function trackFrame(dt) {
    if (S.fx !== 'auto' || autoLite || !playing || busy || document.hidden) return;
    // a browser that is throttling an unfocused or background window delivers frames ~1 s apart;
    // that says nothing about how heavy the page is, so ignore those gaps (and throw away the batch)
    if (dt > 250) { frameTimes.length = 0; return; }
    frameTimes.push(dt);
    if (frameTimes.length < 120) return;
    const sorted = frameTimes.slice().sort((a, b) => a - b), median = sorted[60];
    frameTimes.length = 0;
    if (median > 28) { autoLite = true; store.set('autoLite', true); applyFx(); console.info('Switched to light effects (median frame ' + median.toFixed(1) + 'ms)'); }
  }

  /* ---------- state ---------- */
  let index = 0;
  let cur = null;               // current page record
  let leaving = [];             // pages animating out
  let playing = false, started = false;
  let busy = false;             // during a transition
  let advanceTimer = 0;

  /* ---------- pointer / tilt input for parallax ---------- */
  const input = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    input.tx = (e.clientX / innerWidth) * 2 - 1;
    input.ty = (e.clientY / innerHeight) * 2 - 1;
  });
  function onTilt(e) {
    if (!S.tilt || e.gamma == null) return;
    const portrait = innerHeight > innerWidth;
    const g = portrait ? e.gamma : e.beta, b = portrait ? e.beta - 45 : -e.gamma - 45;
    input.tx = clamp(g / 25, -1, 1);
    input.ty = clamp(b / 30, -1, 1);
  }
  function enableTilt() {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return;
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(r => { if (r === 'granted') addEventListener('deviceorientation', onTilt); }).catch(() => {});
    } else addEventListener('deviceorientation', onTilt);
  }

  /* ---------- building a page ---------- */
  const SVG_OPEN = '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';

  function buildPage(i) {
    const def = pages[i];
    const make = BOOK.scenes[def.scene] || BOOK.scenes.placeholder;
    const sc = make(def, i);
    const el = document.createElement('div');
    el.className = 'page';
    el.style.setProperty('--bg', sc.bg || '#222');
    const shaker = document.createElement('div'); shaker.className = 'shaker';
    const cam = document.createElement('div'); cam.className = 'camera';
    shaker.appendChild(cam); el.appendChild(shaker);
    const layers = sc.layers.map(L => {
      const d = document.createElement('div');
      d.className = 'layer' + (L.cut !== false ? ' cut' : '') + (L.cls ? ' ' + L.cls : '');
      if (L.sh != null) d.style.setProperty('--sh', L.sh + 'px');
      d.innerHTML = SVG_OPEN + (L.svg || '') + '</svg>';
      cam.appendChild(d);
      return { el: d, depth: L.depth || 0, pan: L.pan != null ? L.pan : (L.depth || 0) };
    });
    // a byline (writers' credit) is read after the title and shown on its own line
    const tokens = tokenize(def.byline ? def.text + '. ' + def.byline + '.' : def.text);
    const titleWords = tokenize(def.text).words.length;
    // resolve word cues to word indexes
    const cues = (def.cues || []).map(c => {
      if (c.w == null) return Object.assign({ idx: -1 }, c);
      let n = c.n || 1, idx = -1;
      for (let k = 0; k < tokens.words.length; k++) if (tokens.words[k].norm === c.w.toLowerCase() && --n === 0) { idx = k; break; }
      if (idx < 0) console.warn('cue word not found:', c.w, 'page', i + 1);
      return Object.assign({ idx, fired: false }, c);
    });
    const rec = {
      i, def, sc, el, cam, shaker, layers, tokens, cues, titleWords,
      timers: [], born: performance.now(),
      dur: Math.max(5, narrator.estimate(def.text + (def.byline || '')) + S.pause + 1.5),
      glide: 0, wordIdx: -1, sentence: 0, readDone: false
    };
    const c0 = sc.cam || {};
    rec.look = { x: c0.x != null ? c0.x : 800, y: c0.y != null ? c0.y : 430, s: c0.s || 1.05 };
    rec.lookT = Object.assign({}, rec.look);
    rec.lookN = c0.n ? Object.assign({}, rec.look, c0.n) : null;
    rec.lookSnap = true;
    rec.panOn = sc.panStart !== false; rec.panPos = 0; rec.panVel = rec.panOn ? 1 : 0; rec.lastT = 0;
    rec.ctx = makeCtx(rec);
    return rec;
  }

  function makeCtx(rec) {
    const ctx = {
      el: rec.el, page: rec.def, index: rec.i,
      q: s => rec.el.querySelector(s),
      qa: s => Array.from(rec.el.querySelectorAll(s)),
      sfx: n => audio.sfx(n),
      later(fn, ms) { const t = setTimeout(() => { if (rec.alive !== false) fn(); }, ms); rec.timers.push(t); return t; },
      add(s, c) { ctx.qa(s).forEach(e => e.classList.add(c)); },
      remove(s, c) { ctx.qa(s).forEach(e => e.classList.remove(c)); },
      /** re-trigger a one-shot CSS animation class */
      pulse(s, c, ms) {
        ctx.qa(s).forEach(e => { e.classList.remove(c); void e.getBoundingClientRect(); e.classList.add(c); });
        if (ms) ctx.later(() => ctx.remove(s, c), ms);
      },
      /** move the camera to look at viewBox point (x, y), optionally zooming */
      look(x, y, s, narrow) {
        rec.lookT.x = x; rec.lookT.y = y; if (s) rec.lookT.s = s;
        // optional separate target for narrow (phone-portrait) screens
        rec.lookN = narrow ? Object.assign({ x, y, s: s || rec.lookT.s }, narrow) : null;
      },
      /** start/stop the scenery scrolling past (for walking scenes) */
      pan(on) { rec.panOn = on; },
      get narrow() { return rec.narrow; },
      shake() { if (reduceMotion) return; rec.shaker.classList.remove('shake'); void rec.shaker.offsetWidth; rec.shaker.classList.add('shake'); },
      /** append SVG markup to the layer containing selector (or layer index) and remove it after ms */
      fx(layer, markup, ms) {
        const L = typeof layer === 'number' ? rec.layers[layer].el : ctx.q(layer).closest('.layer');
        const svg = L.querySelector('svg');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = markup; svg.appendChild(g);
        ctx.later(() => g.remove(), ms || 2000);
        return g;
      },
      act(name) { const f = rec.sc.act && rec.sc.act[name]; if (f) f(ctx); else console.warn('no action', name); }
    };
    return ctx;
  }

  function destroy(rec) {
    rec.alive = false;
    rec.timers.forEach(clearTimeout);
    rec.el.remove();
  }

  /* ---------- caption ---------- */
  function setCaption(rec, instant) {
    const fill = () => {
      capText.classList.toggle('title', !!rec.def.title);
      const span = (w, k) => `<span class="w" data-i="${k}">${escapeHtml(rec.def.byline && (k < rec.titleWords || k === rec.tokens.words.length - 1) ? w.text.replace(/\.$/, '') : w.text)}</span>`;
      const ws = rec.tokens.words.map(span);
      capText.innerHTML = rec.def.byline
        // each credit sentence ("Written by…", "Inspired by…") gets its own line
        ? ws.slice(0, rec.titleWords).join(' ') + `<span class="byline">${ws.slice(rec.titleWords).map((h, j) => {
            const w = rec.tokens.words[rec.titleWords + j].text;
            return h + (/\.$/.test(w) && rec.titleWords + j < rec.tokens.words.length - 1 ? '<br>' : ' ');
          }).join('').replace(/\.<\/span><br>/g, '</span><br>')}</span>`
        : ws.join(' ');
      fitCaption();
      capText.classList.remove('swap');
    };
    if (instant) fill();
    else { capText.classList.add('swap'); setTimeout(fill, 300); }
  }
  function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
  function fitCaption() {
    const box = $('#caption');
    const maxH = box.clientHeight - parseFloat(getComputedStyle(box).paddingTop) * 2;
    const scale = { normal: 1, large: 1.35, huge: 1.75 }[S.textSize] || 1;
    let size = Math.round((cur && cur.def.title ? 64 : 34) * scale);
    capText.style.fontSize = size + 'px';
    while (size > 12 && capText.scrollHeight > maxH) { size -= 1; capText.style.fontSize = size + 'px'; }
  }
  function highlight(idx) {
    const spans = capText.querySelectorAll('.w');
    spans.forEach((s, k) => { s.classList.toggle('on', k === idx); s.classList.toggle('done', k < idx); });
  }
  function clearHighlight(all) {
    capText.querySelectorAll('.w').forEach(s => { s.classList.remove('on'); s.classList.toggle('done', !!all); });
  }

  /* ---------- reading ---------- */
  function narrate(fromSentence) {
    if (!cur) return;
    const rec = cur;
    clearTimeout(advanceTimer);
    $('#btn-next').classList.remove('waiting');
    narrator.setRate(S.rate);
    narrator.setEnabled(S.voiceOn && !S.muted);
    audio.duck(true);
    if (!rec.narrationStarted) { rec.narrationStarted = true; rec.sc.start && rec.sc.start(rec.ctx); }
    narrator.read(rec.tokens, fromSentence || 0, {
      onSentence: si => { rec.sentence = si; },
      onWord: idx => {
        if (rec !== cur) return;
        rec.wordIdx = idx; highlight(idx);
        rec.cues.forEach(c => { if (!c.fired && c.idx >= 0 && idx >= c.idx) { c.fired = true; rec.ctx.act(c.act); } });
      },
      onEnd: () => {
        if (rec !== cur) return;
        rec.readDone = true;
        audio.duck(false);
        rec.cues.forEach(c => { if (!c.fired && c.at === 'end') { c.fired = true; rec.ctx.act(c.act); } });
        rec.sc.end && rec.sc.end(rec.ctx);
        setTimeout(() => { if (rec === cur) highlight(-1), clearHighlight(true); }, 700);
        scheduleAdvance();
      }
    });
  }

  function scheduleAdvance() {
    clearTimeout(advanceTimer);
    if (!playing || !cur || !cur.readDone) return;
    if (index >= pages.length - 1) { advanceTimer = setTimeout(showReadAgain, 3500); return; }
    if (S.auto) advanceTimer = setTimeout(() => go(index + 1), S.pause * 1000);
    else $('#btn-next').classList.add('waiting');
  }

  function showReadAgain() {
    const st = $('#start');
    st.classList.remove('leaving'); st.hidden = false;
    $('#btn-continue').hidden = true;
    $('#btn-begin').lastChild.textContent = ' Read it again';
    $('#btn-begin').onclick = () => begin(0);
    store.set('page', 0);
  }

  /* ---------- navigation & transitions ---------- */
  function go(target, opts = {}) {
    if (target < 0 || target >= pages.length) return;
    if (busy && !opts.force) return;
    clearTimeout(advanceTimer);
    narrator.stop();
    $('#btn-next').classList.remove('waiting');
    const forward = target > index || !cur;
    const old = cur;
    index = target;
    store.set('page', index);
    cur = buildPage(index);
    audio.setMood(cur.def.mood || cur.sc.mood || 'calm');
    audio.setAmbience(cur.def.ambience || (BOOK.story.ambience || {})[cur.def.scene] || null);
    updateChrome();

    let type = !old ? 'none' : (forward ? (cur.def.transition || 'curl') : 'curl');
    if (!['none', 'curl', 'glide', 'fade', 'sparkle', 'snow', 'glow'].includes(type)) type = 'curl';   // unknown → page curl
    if (reduceMotion && type !== 'none') type = 'fade';
    busy = true;
    let delay = 0;

    if (type === 'none') {
      stage.appendChild(cur.el);
    } else if (type === 'curl') {
      audio.sfx('flip');
      if (forward) {
        stage.insertBefore(cur.el, old.el);
        cur.el.classList.add('under');
        old.el.classList.add('flip-out');
      } else {
        stage.appendChild(cur.el);
        cur.el.classList.add('flip-in');
        old.el.classList.add('under');
      }
      delay = 1050;
    } else if (type === 'glide') {
      audio.sfx('whoosh');
      stage.appendChild(cur.el);
      cur.glideFrom = performance.now(); cur.glideDir = 1;
      old.glideFrom = performance.now(); old.glideDir = -1;
      delay = 1500;
    } else if (type === 'fade') {
      stage.insertBefore(cur.el, old.el);
      cur.el.style.opacity = 0;
      old.el.classList.add('fade-out');
      setTimeout(() => { cur.el.style.opacity = ''; cur.el.classList.add('fade-in'); }, 850);
      delay = 1700;
    } else if (type === 'sparkle' || type === 'snow' || type === 'glow') {
      // sparkle: the old page glows white and bursts into stars and hearts
      // snow:    a swirl of snowflakes sweeps across while the old page whites out
      // glow:    the old page melts into a warm golden glow
      audio.sfx(type === 'snow' ? 'jingle' : type === 'glow' ? 'magic' : 'sparkle');
      stage.insertBefore(cur.el, old.el);
      old.el.classList.add(type + '-out');
      const sp = document.createElement('div'); sp.className = 'wipe ' + type + '-wipe';
      const n = type === 'glow' ? 14 : type === 'snow' ? 60 : 26;
      for (let k = 0; k < n; k++) {
        const s = document.createElement('i');
        let x, y, dx, dy;
        if (type === 'snow') { x = -10 - Math.random() * 30; y = Math.random() * 100; dx = 90 + Math.random() * 70; dy = (Math.random() - .5) * 60; }
        else { const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 60; x = 50 + Math.cos(a) * 6; y = 45 + Math.sin(a) * 6; dx = Math.cos(a) * r; dy = Math.sin(a) * r; }
        s.style.cssText = `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;--dx:${dx.toFixed(1)}vmax;--dy:${dy.toFixed(1)}vmax;animation-delay:${(Math.random() * (type === 'snow' ? .5 : .25)).toFixed(2)}s;font-size:${(14 + Math.random() * 30).toFixed(0)}px`;
        s.textContent = type === 'snow' ? (Math.random() < .5 ? '❄' : '●') : type === 'glow' ? '✦' : (Math.random() < .3 ? '♥' : '✦');
        sp.appendChild(s);
      }
      stage.appendChild(sp);
      setTimeout(() => sp.remove(), 2200);
      delay = type === 'glow' ? 1600 : 1300;
    }
    if (old) { leaving.push(old); setTimeout(() => { destroy(old); leaving = leaving.filter(r => r !== old); }, delay + 50); }

    setCaption(cur, !old);
    cur.sc.enter && cur.sc.enter(cur.ctx);
    const rec = cur;
    setTimeout(() => {
      busy = false;
      rec.el.classList.remove('under', 'flip-in', 'fade-in');
      if (rec === cur && playing) narrate(0);
    }, delay + (old ? 250 : 400));
  }

  /* ---------- per-frame camera + parallax ---------- */
  const portraitLayout = () => matchMedia('(orientation: portrait) and (max-aspect-ratio: 4/5)').matches;
  let capCache = 0, capAt = 0;
  function capCover() { // how much of the stage the caption band covers, from the bottom
    const now = performance.now();
    if (now - capAt > 500) { const b = $('#caption').getBoundingClientRect(); capCache = Math.max(0, stage.clientHeight - b.top); capAt = now; }
    return capCache;
  }
  let lastFrame = 0;
  function frame(now) {
    input.x += (input.tx - input.x) * 0.06;
    input.y += (input.ty - input.y) * 0.06;
    const W = stage.clientWidth;
    const drawRec = rec => {
      const sc = rec.sc;
      const p = clamp((now - rec.born) / (rec.dur * 1000), 0, 1);
      const e = ease(p);
      // camera: smoothly follow the scene's look-at point (viewBox units), slow zoom over the page
      const camW = rec.cam.offsetWidth, camH = rec.cam.offsetHeight;
      const k = Math.max(camW / 1600, camH / 900);
      rec.narrow = W / (k * rec.look.s) < 1050;   // less than ~2/3 of the scene fits on screen
      const L = rec.look, T = (rec.narrow && rec.lookN) ? rec.lookN : rec.lookT;
      const dt = rec.lastT ? Math.min(now - rec.lastT, 100) : 16; rec.lastT = now;
      const sm = rec.lookSnap ? 1 : 1 - Math.pow(1 - 0.035, dt / 16.7); rec.lookSnap = false;
      L.x += (T.x - L.x) * sm; L.y += (T.y - L.y) * sm; L.s += (T.s - L.s) * sm;
      const s = L.s * (1 + (sc.cam && sc.cam.z != null ? sc.cam.z : 0.06) * e);
      const visCenter = (W > 0 && !portraitLayout()) ? (stage.clientHeight - capCover()) / 2 : stage.clientHeight / 2;
      const tx = -(L.x - 800) * k * s, ty = -(L.y - 450) * k * s + (visCenter - stage.clientHeight / 2);
      rec.cam.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
      // glide transition offset (+1 → 0 for incoming, 0 → -1 for outgoing)
      let g = 0;
      if (rec.glideFrom) {
        const gp = clamp((now - rec.glideFrom) / 1500, 0, 1), ge = ease(gp);
        g = rec.glideDir > 0 ? 1 - ge : -ge;
        rec.el.style.transform = `translate3d(${g * 100}%, 0, 0)`;
        if (gp >= 1 && rec.glideDir > 0) { rec.glideFrom = 0; rec.el.style.transform = ''; g = 0; }
      }
      const pan = (sc.pan || 0) * W;
      if (!app.classList.contains('paused')) {
        rec.panVel += ((rec.panOn ? 1 : 0) - rec.panVel) * Math.min(1, dt / 400);   // ease in/out of walking
        rec.panPos += rec.panVel * dt / (rec.dur * 1000);
      }
      const t = now / 1000;
      const m = reduceMotion ? 0 : 1;
      const dx = Math.sin(t * 0.23) * 0.35, dy = Math.cos(t * 0.17) * 0.25;
      rec.layers.forEach(L => {
        const d = L.depth;
        const x = (-(input.x + dx) * d * 28 - pan * rec.panPos * L.pan) * m + g * W * (d - 0.5) * 0.5;
        const y = -(input.y + dy) * d * 12 * m;
        L.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    };
    if (lastFrame) trackFrame(now - lastFrame);
    lastFrame = now;
    if (cur) drawRec(cur);
    leaving.forEach(drawRec);
    requestAnimationFrame(frame);
  }

  /* ---------- controls ---------- */
  function updateChrome() {
    $('#counter-n').textContent = (index + 1) + ' / ' + pages.length;
    $('#btn-prev').disabled = index === 0;
    $('#btn-next').disabled = index === pages.length - 1;
    $('#btn-auto').setAttribute('aria-pressed', String(S.auto));
    app.classList.toggle('muted', S.muted);
    app.classList.toggle('paused', started && !playing);
    $('#btn-play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    const sel = $('#set-page'); if (sel) sel.value = index;
  }

  function setPlaying(p) {
    if (p === playing) return;
    playing = p;
    updateChrome();
    if (!cur) return;
    if (!p) {
      clearTimeout(advanceTimer);
      narrator.stop();
      audio.duck(false);
      audio.suspend(true);
    } else {
      audio.suspend(false);
      if (cur.readDone) scheduleAdvance();
      else if (!busy) narrate(cur.sentence || 0);
    }
  }

  function begin(fromPage) {
    audio.init();
    narrator.unlock();
    if (S.tilt) enableTilt();
    audio.setMuted(S.muted); audio.setMusicVol(S.music); audio.setSfxVol(S.sfx);
    audio.startMusic();
    started = true; playing = true;
    $('#start').classList.add('leaving');
    setTimeout(() => $('#start').hidden = true, 650);
    // rebuild the page so its entrance animations play now, not behind the start screen
    if (cur) { destroy(cur); cur = null; }
    go(fromPage, { force: true });
  }

  const params = new URLSearchParams(location.search);
  const startAt = clamp((parseInt(params.get('page'), 10) || 1) - 1, 0, pages.length - 1);
  const saved = store.get('page', 0);
  if (saved > 0 && !params.get('page')) {
    $('#btn-continue').hidden = false;
    $('#continue-n').textContent = saved + 1;
  }
  $('#btn-begin').onclick = () => begin(startAt);
  $('#btn-continue').onclick = () => begin(saved);

  $('#btn-prev').onclick = () => { go(index - 1); kick(); };
  $('#btn-next').onclick = () => { go(index + 1); kick(); };
  $('#btn-play').onclick = () => setPlaying(!playing);
  $('#btn-replay').onclick = () => {
    if (!cur) return;
    go(index, { force: true });
  };
  $('#btn-auto').onclick = () => { S.auto = !S.auto; save(); updateChrome(); $('#btn-next').classList.remove('waiting'); scheduleAdvance(); };
  $('#btn-mute').onclick = () => {
    S.muted = !S.muted; save(); audio.setMuted(S.muted); updateChrome();
    if (cur && playing && !cur.readDone) narrate(cur.sentence);
  };
  const full = $('#btn-full');
  if (!document.documentElement.requestFullscreen) full.hidden = true;
  full.onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  /* settings sheet */
  const sheet = $('#settings');
  const vSel = $('#set-voice'), pSel = $('#set-page');
  pSel.innerHTML = pages.map((p, k) => `<option value="${k}">${k + 1}. ${escapeHtml(p.text.slice(0, 38))}${p.text.length > 38 ? '…' : ''}</option>`).join('');
  function fillVoices() {
    const vs = narrator.voices;
    vSel.innerHTML = vs.length ? vs.map(v => `<option>${escapeHtml(v.name)}</option>`).join('') : '<option>(no voices found — text only)</option>';
    if (narrator.voice) vSel.value = narrator.voice.name;
  }
  narrator.onvoices = fillVoices; fillVoices();
  let wasPlaying = false;
  $('#btn-settings').onclick = () => {
    wasPlaying = playing; setPlaying(false);
    $('#set-rate').value = S.rate; $('#set-pause').value = S.pause; $('#set-music').value = S.music; $('#set-sfx').value = S.sfx;
    $('#set-voiceon').checked = S.voiceOn; $('#set-tilt').checked = S.tilt; pSel.value = index;
    $('#set-text').value = S.textSize; $('#set-fx').value = S.fx;
    fillVoices(); sheet.hidden = false;
  };
  vSel.onchange = () => narrator.setVoice(vSel.value);
  $('#set-rate').oninput = e => { S.rate = +e.target.value; save(); };
  $('#set-pause').oninput = e => { S.pause = +e.target.value; save(); };
  $('#set-music').oninput = e => { S.music = +e.target.value; audio.setMusicVol(S.music); save(); };
  $('#set-sfx').oninput = e => { S.sfx = +e.target.value; audio.setSfxVol(S.sfx); save(); };
  $('#set-voiceon').onchange = e => { S.voiceOn = e.target.checked; save(); };
  $('#set-text').onchange = e => { S.textSize = e.target.value; save(); applyText(); capAt = 0; setTimeout(fitCaption, 50); };
  $('#set-fx').onchange = e => { S.fx = e.target.value; if (S.fx !== 'auto') { autoLite = false; store.set('autoLite', false); } save(); applyFx(); };

  /* tap a word in the caption to hear it again */
  capText.addEventListener('click', e => {
    const w = e.target.closest('.w');
    if (!w || !cur || busy) return;
    const word = cur.tokens.words[+w.dataset.i].text.replace(/^[^\w]+|[^\w']+$/g, '');
    if (!word) return;
    w.classList.add('tapped'); setTimeout(() => w.classList.remove('tapped'), 900);
    clearTimeout(advanceTimer);
    const rec = cur;
    narrator.setEnabled(S.voiceOn && !S.muted);
    narrator.sayWord(word, () => {
      if (rec !== cur || !playing) return;
      if (!rec.readDone) narrate(rec.sentence || 0); else scheduleAdvance();
    });
    kick();
  });

  /* page strip: small pictures of every page */
  const pagesSheet = $('#pages'), thumbs = $('#thumbs');
  let thumbsBuilt = false, wasPlayingPages = false;
  function buildThumbs() {
    if (thumbsBuilt) return; thumbsBuilt = true;
    pages.forEach((p, k) => {
      const b = document.createElement('button');
      b.className = 'thumb'; b.dataset.i = k;
      b.innerHTML = `<span class="thumb-art"></span><span class="thumb-label"><b>${k + 1}</b>${escapeHtml(p.text)}</span>`;
      b.onclick = () => { pagesSheet.hidden = true; go(k, { force: true }); setPlaying(true); };
      thumbs.appendChild(b);
      // draw the pictures a few at a time so opening the sheet stays snappy
      setTimeout(() => {
        try {
          const sc = (BOOK.scenes[p.scene] || BOOK.scenes.placeholder)(p, k);
          b.firstChild.innerHTML = sc.layers.map(L => SVG_OPEN + (L.svg || '') + '</svg>').join('');
          b.firstChild.style.background = sc.bg || '#222';
        } catch (err) { console.warn('thumb', k, err); }
      }, 30 + k * 25);
    });
  }
  $('#counter').onclick = () => {
    wasPlayingPages = playing; setPlaying(false);
    buildThumbs(); pagesSheet.hidden = false;
    thumbs.querySelectorAll('.thumb').forEach(t => t.classList.toggle('current', +t.dataset.i === index));
    const curT = thumbs.querySelector('.thumb.current'); if (curT) curT.scrollIntoView({ block: 'center' });
  };
  $('#pages-close').onclick = () => { pagesSheet.hidden = true; if (wasPlayingPages) setPlaying(true); };
  $('#set-tilt').onchange = e => { S.tilt = e.target.checked; save(); if (S.tilt) enableTilt(); else { input.tx = input.ty = 0; } };
  pSel.onchange = () => { sheet.hidden = true; wasPlaying = true; go(+pSel.value, { force: true }); setPlaying(true); };
  $('#set-close').onclick = () => {
    sheet.hidden = true;
    if (cur && !cur.readDone) cur.sentence = cur.sentence || 0;
    if (wasPlaying) setPlaying(true);
  };

  /* keyboard */
  addEventListener('keydown', e => {
    if (!started || !sheet.hidden || !$('#pages').hidden) return;
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === ' ') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'f') full.onclick();
    kick();
  });

  /* swipe / tap on the picture */
  let sx = 0, sy = 0, st = 0;
  stage.parentElement.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = Date.now(); kick(); });
  stage.parentElement.addEventListener('pointerup', e => {
    if (!started || e.target.closest('button, .sheet, #caption')) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - st < 800) go(index + (dx < 0 ? 1 : -1));
    else if (!S.auto && cur && cur.readDone && Math.abs(dx) < 10) go(index + 1);
  });

  /* hide the controls when idle */
  let idleT = 0;
  function kick() { app.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => { if (playing) app.classList.add('idle'); }, 3500); }
  addEventListener('pointermove', kick);

  addEventListener('resize', () => fitCaption());
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlaying(false); });

  /* show the starting page behind the start screen */
  index = startAt;
  cur = buildPage(index);
  stage.appendChild(cur.el);
  setCaption(cur, true);
  cur.sc.enter && cur.sc.enter(cur.ctx);
  updateChrome();
  requestAnimationFrame(frame);
  // handy for testing from the console: BOOK.debug.go(9), BOOK.debug.act('rise')
  BOOK.debug = { go: i => go(i, { force: true }), act: n => cur && cur.ctx.act(n), get cur() { return cur; }, setPlaying };
  if (document.fonts) document.fonts.ready.then(fitCaption);
})();
