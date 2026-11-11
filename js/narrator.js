/* Reads a page aloud with the browser's speech engine and reports which word is being spoken.
   Speaks one sentence at a time (avoids Chrome's long-utterance cutoff).
   If a voice doesn't report word timings, or speech is off, it estimates timings instead. */
BOOK.narrator = (function () {
  const synth = window.speechSynthesis || null;
  let voices = [], voice = null, preferredName = BOOK.util.store.get('voice', null);
  let rate = 0.92, enabled = true;
  let run = 0;          // increments to cancel any in-flight reading
  let keep = [];        // keep utterances referenced (Chrome GC bug drops onend)

  function scoreVoice(v) {
    let s = 0;
    if (/^en/i.test(v.lang)) s += 20; else return -1;
    if (/en[-_]US/i.test(v.lang)) s += 3;
    if (/en[-_]GB/i.test(v.lang)) s += 2;
    if (/natural/i.test(v.name)) s += 12;
    if (/aria|jenny|guy|libby|sonia|ryan|samantha|daniel|serena|ava|emma|andrew|brian/i.test(v.name)) s += 4;
    if (/google/i.test(v.name)) s += 1;      // nice sounding but often no word timings
    if (v.localService) s += 1;
    return s;
  }
  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter(v => scoreVoice(v) >= 0).sort((a, b) => scoreVoice(b) - scoreVoice(a));
    // online "Natural" voices need internet: when offline, stick to voices built into the device
    const pool = navigator.onLine ? voices : voices.filter(v => v.localService);
    voice = pool.find(v => v.name === preferredName) || pool[0] || voices[0] || null;
    if (api.onvoices) api.onvoices(voices, voice);
  }
  /** an online voice failed (e.g. lost connection): fall back to a device voice */
  function fallbackToLocal() {
    const local = voices.find(v => v.localService);
    if (local && voice !== local) { voice = local; return true; }
    return false;
  }
  addEventListener('online', () => loadVoices());
  addEventListener('offline', () => loadVoices());

  function setVoice(name) { preferredName = name; BOOK.util.store.set('voice', name); voice = voices.find(v => v.name === name) || voice; }

  /** Rough seconds needed to read some text at the current rate. */
  function estimate(text) {
    const chars = text.length;
    const pauses = (text.match(/[.!?]/g) || []).length * 0.35 + (text.match(/[,;:]/g) || []).length * 0.18;
    return chars / (14.5 * rate) + pauses;
  }

  /** Unlock speech on iOS: must be called inside a tap handler. */
  function unlock() {
    if (!synth) return;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) {}
  }

  function stop() {
    run++;
    if (synth) synth.cancel();
    keep = [];
  }

  /**
   * Read tokens.sentences starting at sentence index `from`.
   * cb.onWord(i)        – word i is being spoken
   * cb.onSentence(si)   – sentence si started
   * cb.onEnd()          – finished every sentence
   */
  function read(tokens, from, cb) {
    stop();
    const my = run;
    const { words, sentences } = tokens;
    let si = from || 0;

    const next = () => {
      if (my !== run) return;
      if (si >= sentences.length) { cb.onEnd && cb.onEnd(); return; }
      const s = sentences[si];
      cb.onSentence && cb.onSentence(si);
      speakSentence(s, words, cb, my, () => { si++; setTimeout(next, 120); });
    };
    next();
  }

  function speakSentence(s, words, cb, my, done) {
    const wantVoice = enabled && synth && voices.length;
    let finished = false, gotBoundary = false, timerRAF = 0, safety = 0;
    const est = estimate(s.text);

    // --- timed fallback highlighter ---
    const weights = [];
    for (let i = s.first; i <= s.last; i++) {
      const w = words[i].text;
      weights.push(w.length + 2 + (/[,;:]$/.test(w) ? 3 : 0) + (/[.!?]["”']?$/.test(w) ? 4 : 0));
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let t0 = 0, lastIdx = -1;
    function tick() {
      if (my !== run || finished || gotBoundary) return;
      const el = (performance.now() - t0) / 1000;
      let acc = 0, idx = s.first;
      const target = (el / est) * total;
      for (let k = 0; k < weights.length; k++) { if (acc + weights[k] * .35 > target) { idx = s.first + k; break; } acc += weights[k]; idx = s.first + k; }
      if (idx !== lastIdx) { lastIdx = idx; cb.onWord && cb.onWord(idx); }
      if (!wantVoice && el >= est) { finish(); return; }
      timerRAF = requestAnimationFrame(tick);
    }
    function startTimer() { t0 = performance.now(); tick(); }

    function finish() {
      if (finished || my !== run) return;
      finished = true;
      cancelAnimationFrame(timerRAF); clearTimeout(safety);
      cb.onWord && cb.onWord(s.last);
      done();
    }

    if (!wantVoice) { startTimer(); return; }

    const u = new SpeechSynthesisUtterance(s.text.trim());
    keep.push(u);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = rate; u.pitch = 1.0;
    const lead = s.text.length - s.text.trimStart().length;
    let fallbackTimer = 0;
    u.onstart = () => {
      if (my !== run) return;
      cb.onWord && cb.onWord(s.first);
      // if no word timings arrive soon, estimate them
      fallbackTimer = setTimeout(() => { if (!gotBoundary) startTimer(); }, 450);
    };
    u.onboundary = (e) => {
      if (my !== run || (e.name && e.name !== 'word')) return;
      gotBoundary = true; cancelAnimationFrame(timerRAF);
      const ci = s.start + lead + e.charIndex;
      let idx = s.first;
      for (let i = s.first; i <= s.last; i++) if (words[i].start <= ci) idx = i;
      cb.onWord && cb.onWord(idx);
    };
    // speech that "finishes" far too quickly is silent/broken: keep the page going on estimated timing
    const timedFinish = () => {
      if (finished || my !== run) return;
      gotBoundary = false; cancelAnimationFrame(timerRAF);
      if (!t0) startTimer(); else tick();
      clearTimeout(safety);
      safety = setTimeout(finish, Math.max(0, est * 1000 - (performance.now() - t0)) + 150);
    };
    u.onend = () => {
      clearTimeout(fallbackTimer);
      if (!gotBoundary && performance.now() - spokeAt < est * 350) timedFinish();
      else finish();
    };
    u.onerror = (e) => {
      clearTimeout(fallbackTimer);
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      // a cloud voice that can't reach the internet: retry this sentence with a device voice
      if (!finished && my === run && !s.retried && voice && !voice.localService && fallbackToLocal()) {
        s.retried = true; finished = true; clearTimeout(safety); cancelAnimationFrame(timerRAF);
        speakSentence(s, words, cb, my, done);
        return;
      }
      timedFinish();
    };
    // safety net if the engine never fires onend
    safety = setTimeout(finish, est * 2500 + 4000);
    let spokeAt = performance.now();
    setTimeout(() => { if (my === run) { spokeAt = performance.now(); synth.speak(u); } }, 40);
  }

  /** say a single word (when a reader taps it), then call done */
  function sayWord(text, done) {
    stop();
    const my = run;
    if (!(enabled && synth && voices.length)) { setTimeout(() => { if (my === run) done(); }, 700); return; }
    const u = new SpeechSynthesisUtterance(text);
    keep.push(u);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = Math.min(rate, .85);
    let fired = false;
    const fin = () => { if (fired || my !== run) return; fired = true; setTimeout(() => { if (my === run) done(); }, 350); };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, 4000);
    setTimeout(() => { if (my === run) synth.speak(u); }, 40);
  }

  const api = {
    read, stop, unlock, estimate, setVoice, sayWord,
    get voices() { return voices; },
    get voice() { return voice; },
    setRate(r) { rate = r; },
    setEnabled(e) { enabled = e; if (!e) stop(); },
    get available() { return !!synth; },
    onvoices: null
  };
  if (synth) {
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 800);
  }
  return api;
})();
