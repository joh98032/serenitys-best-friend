/* Synthesized sound effects + generated holiday music (Web Audio, no files). */
BOOK.audio = (function () {
  let ctx = null, master, sfxBus, musicBus, musicDuck, ambBus, noiseBuf;
  let musicVol = 0.5, sfxVol = 0.8, muted = false;
  let mood = 'calm', musicTimer = null, nextNoteTime = 0;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol * 0.22;
    musicDuck = ctx.createGain(); musicDuck.gain.value = 1;
    musicBus.connect(musicDuck); musicDuck.connect(master);
    ambBus = ctx.createGain(); ambBus.gain.value = musicVol * 1.4; ambBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  /* ---------- building blocks ---------- */
  const now = () => ctx.currentTime;
  function env(g, t, a, peak, dec, sustain = 0.0001) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t + a + dec);
  }
  function noise(t, dur, out) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    s.connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    return s;
  }
  function osc(type, freq, t, dur, out) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    o.connect(out); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function gain(out, v = 1) { const g = ctx.createGain(); g.gain.value = v; g.connect(out); return g; }
  function filter(type, freq, q, out) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1; f.connect(out); return f; }

  /** a little shake of sleigh bells: several tiny metallic jingles */
  function jingle(t, v, out, count = 4) {
    for (let k = 0; k < count; k++) {
      const ct = t + k * 0.012 + Math.random() * 0.02;
      const g = gain(out); env(g, ct, .002, v * (0.5 + Math.random() * .5), .09 + Math.random() * .08);
      noise(ct, .2, filter('bandpass', 6500 + Math.random() * 2500, 6, g));
      [3100, 4700, 5900].forEach(f => { const pg = gain(out); env(pg, ct, .002, v * .12, .12); osc('sine', f * (0.97 + Math.random() * .06), ct, .2, pg); });
    }
  }

  /* ---------- sound effects ---------- */
  const S = {
    whoosh() {
      const t = now();
      const g = gain(sfxBus); env(g, t, 0.15, 0.5, 0.45);
      const bp = filter('bandpass', 400, 1.5, g);
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(2200, t + .25); bp.frequency.exponentialRampToValueAtTime(500, t + .6);
      noise(t, .7, bp);
    },
    flip() {
      const t = now();
      [0, .16].forEach((o, i) => {
        const g = gain(sfxBus); env(g, t + o, 0.03, i ? .25 : .4, .22);
        const bp = filter('bandpass', 2600, .6, g);
        bp.frequency.setValueAtTime(1500, t + o); bp.frequency.linearRampToValueAtTime(4200, t + o + .2);
        noise(t + o, .3, bp);
      });
    },
    sparkle() {
      const t = now();
      [1568, 2093, 2637, 3136, 3951].forEach((f, i) => {
        const g = gain(sfxBus); env(g, t + i * .06, .005, .12, .5);
        osc('sine', f, t + i * .06, .6, g);
      });
    },
    pop() {
      const t = now(); const g = gain(sfxBus); env(g, t, .005, .4, .15);
      const o = osc('sine', 500, t, .2, g); o.frequency.exponentialRampToValueAtTime(1300, t + .1);
    },
    boing() {
      const t = now(); const g = gain(sfxBus); env(g, t, .005, .45, .9);
      const o = osc('triangle', 180, t, 1, g);
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(420, t + .08); o.frequency.exponentialRampToValueAtTime(240, t + .9);
      osc('sine', 14, t, 1, gain(o.frequency, 60));
    },
    /** soft plush squeak, for hops */
    squeak() {
      const t = now(); const g = gain(sfxBus); env(g, t, .01, .22, .16);
      const o = osc('sine', 900, t, .22, filter('lowpass', 2600, 1, g));
      o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(1500, t + .07); o.frequency.exponentialRampToValueAtTime(1100, t + .18);
    },
    /** two rising chimes, for hearts */
    heart() {
      const t = now();
      [[784, 0], [1175, .12], [1568, .24]].forEach(([f, o]) => {
        const g = gain(sfxBus); env(g, t + o, .005, .16, .7);
        osc('sine', f, t + o, .8, g); osc('sine', f * 2, t + o, .5, gain(g, .2));
      });
    },
    /** warm "awww" swell, for the hug */
    hug() {
      const t = now(); const g = gain(sfxBus);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .5); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
      const lp = filter('lowpass', 1400, .7, g);
      [261.6, 329.6, 392, 523.3].forEach((f, i) => { osc('triangle', f, t + i * .05, 2.3, gain(lp, .5)); osc('sine', f * 1.005, t, 2.3, gain(lp, .3)); });
    },
    jingle() { const t = now(); for (let k = 0; k < 6; k++) jingle(t + k * .11, .35, sfxBus, 3); },
    crunch() { // footstep in snow
      const t = now(); const g = gain(sfxBus); env(g, t, .01, .2, .14);
      noise(t, .18, filter('bandpass', 1800, .8, g));
    },
    thud() {
      const t = now(); const g = gain(sfxBus); env(g, t, .005, .5, .25);
      const o = osc('sine', 140, t, .3, g); o.frequency.exponentialRampToValueAtTime(60, t + .2);
    },
    cheer() { // small happy "yay": quick rising voices
      const t = now();
      for (let k = 0; k < 6; k++) {
        const ct = t + Math.random() * .3, f = 420 + Math.random() * 260, vg = gain(sfxBus); env(vg, ct, .04, .05, .45);
        const o = osc('sawtooth', f, ct, .5, filter('bandpass', 1300, 2, vg)); o.frequency.linearRampToValueAtTime(f * 1.4, ct + .35);
      }
    },
    magic() {
      const t = now();
      for (let i = 0; i < 8; i++) {
        const g = gain(sfxBus); env(g, t + i * .09, .01, .09, .6);
        osc('sine', 600 * Math.pow(2, (i * 3) / 12) * (i % 2 ? 1.5 : 1), t + i * .09, .7, g);
      }
    }
  };

  function sfx(name) {
    if (!ctx || muted || !S[name]) return;
    try { S[name](); } catch (e) { console.warn('sfx', name, e); }
  }

  /* ---------- music: a little holiday band (celesta, glockenspiel, sleigh bells, plucked bass, soft pad) ----------
     Each mood has two 4-bar phrases (A then B), 8 eighth-notes per bar.
     Numbers are scale degrees (0 = root), n = rest. Mood changes wait for the next bar.
     The tunes are original. */
  const n = null;
  const MODES = { major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10] };
  const ROOT = 174.61; // F3
  const MOODS = {
    calm: { // music box: gentle and twinkly
      bpm: 76, mode: 'major', lead: 'celesta', vol: 1,
      A: [0, n, 2, n, 4, n, 7, n, 6, n, 4, n, 5, n, n, n, 4, n, 2, n, 0, n, 2, n, 1, n, n, n, n, n, n, n],
      B: [4, n, 5, n, 7, n, 9, n, 8, n, 7, n, 5, n, n, n, 7, n, 5, n, 4, n, 2, n, 0, n, n, n, n, n, n, n],
      bassA: [0, 5, 3, 4], bassB: [3, 4, 0, 4], bells: null
    },
    jolly: { // bouncy and festive, with sleigh bells
      bpm: 112, mode: 'major', lead: 'celesta', doubleB: 'glock', vol: 1,
      A: [0, 2, 4, n, 4, 5, 7, n, 9, 7, 5, n, 4, n, n, n, 5, 4, 2, n, 2, 4, 5, n, 4, 2, 1, n, 4, n, n, n],
      B: [7, n, 9, 7, 5, n, 4, n, 5, n, 7, 5, 4, n, 2, n, 4, n, 5, 4, 2, n, 1, n, 0, n, n, n, n, n, n, n],
      bassA: [0, 3, 4, 4], bassB: [3, 0, 4, 0], bells: [1, n, 1, 1, 1, n, 1, 1], walk: true
    },
    shy: { // soft and a little wistful
      bpm: 70, mode: 'dorian', lead: 'celesta', vol: .85,
      A: [4, n, n, n, 3, n, 2, n, 1, n, n, n, n, n, n, n, 2, n, n, n, 3, n, 4, n, 0, n, n, n, n, n, n, n],
      B: [5, n, n, n, 4, n, 3, n, 4, n, n, n, n, n, n, n, 2, n, n, n, 1, n, 2, n, 4, n, n, n, n, n, n, n],
      bassA: [0, 6, 5, 4], bassB: [3, 0, 6, 4], bells: null
    },
    joy: { // the big happy moments
      bpm: 126, mode: 'major', lead: 'glock', doubleA: 'celesta', doubleB: 'celesta', vol: 1,
      A: [7, n, 4, n, 7, n, 9, n, 7, n, n, 4, 5, n, n, n, 4, 5, 7, n, 4, n, 2, n, 4, n, n, n, n, n, n, n],
      B: [9, n, 9, n, 10, n, 9, n, 7, n, n, n, 5, n, 4, n, 5, n, 7, n, 4, n, 2, n, 0, n, n, n, n, n, n, n],
      bassA: [0, 4, 5, 4], bassB: [3, 4, 0, 0], bells: [1, 1, 1, 1, 1, 1, 1, 1], walk: true
    }
  };
  const freqOf = (mode, deg, octave = 1) => {
    const sc = MODES[mode], o = Math.floor(deg / 7), s = sc[((deg % 7) + 7) % 7];
    return ROOT * Math.pow(2, octave + o + s / 12);
  };

  /* instruments */
  function celesta(f, t, dur, v) {
    [[1, 1], [2, .45], [3, .12], [4.2, .08]].forEach(([m, a]) => {
      const g = gain(musicBus); env(g, t, .004, v * a * .7, 1.3 / Math.sqrt(m) + dur * .3);
      osc('sine', f * m, t, 1.8, g);
    });
  }
  function glock(f, t, dur, v) {
    [[2, 1], [5.4, .3], [8.9, .12]].forEach(([m, a]) => {
      const g = gain(musicBus); env(g, t, .002, v * a * .55, 1.6 / Math.sqrt(m));
      osc('sine', f * m, t, 1.8, g);
    });
  }
  function pluck(f, t, dur, v) { // pizzicato-ish bass
    const g = gain(musicBus); env(g, t, .005, v, Math.max(dur * .7, .2));
    const lp = filter('lowpass', f * 4, 1, g); lp.frequency.exponentialRampToValueAtTime(f * 1.2, t + dur);
    osc('triangle', f, t, dur + .1, lp);
    osc('sine', f * 2, t, dur + .1, gain(lp, .25));
  }
  function pad(mode, deg, t, dur, v) { // soft chord built on a scale degree: root, third, fifth
    [0, 2, 4].forEach((k, i) => {
      const g = gain(musicBus);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * (i ? .6 : 1), t + dur * .35); g.gain.linearRampToValueAtTime(.0001, t + dur + .2);
      osc('triangle', freqOf(mode, deg + k, 0), t, dur + .3, filter('lowpass', 900, .7, g));
    });
  }
  const INST = { celesta, glock };

  let bar = 0, eighth = 0, pendingMood = null;
  function schedule() {
    if (!ctx) return;
    while (nextNoteTime < ctx.currentTime + 0.3) {
      if (eighth === 0 && pendingMood) { mood = pendingMood; pendingMood = null; bar = 0; }
      const m = MOODS[mood] || MOODS.calm;
      const spb = 60 / m.bpm / 2;
      const phraseB = Math.floor(bar / 4) % 2 === 1, barIn = bar % 4;
      const mel = phraseB ? m.B : m.A, idx = barIn * 8 + eighth;
      const note = mel[idx];
      if (note !== null) {
        let len = 1; while (len < 4 && idx + len < 32 && mel[idx + len] === null) len++;
        const dur = spb * len * 1.05, f = freqOf(m.mode, note, 1);
        const lead = (phraseB && m.leadB) || m.lead;
        INST[lead](f, nextNoteTime, dur, .3 * m.vol);
        const dbl = phraseB ? m.doubleB : m.doubleA;
        if (dbl) INST[dbl](f * (dbl === 'glock' ? .5 : 1), nextNoteTime, dur, .14 * m.vol);
      }
      const bassDeg = (phraseB ? m.bassB : m.bassA)[barIn];
      if (eighth === 0) pad(m.mode, bassDeg, nextNoteTime, spb * 8, .07 * m.vol);
      if (eighth === 0 || eighth === 4) pluck(freqOf(m.mode, bassDeg, -1), nextNoteTime, spb * 2.5, .32 * m.vol);
      if (m.walk && (eighth === 2 || eighth === 6)) pluck(freqOf(m.mode, bassDeg + 4, -1), nextNoteTime, spb * 1.5, .18 * m.vol);
      if (m.bells && m.bells[eighth]) jingle(nextNoteTime, (eighth % 2 ? .07 : .12) * m.vol, musicBus, 2);
      nextNoteTime += spb;
      eighth = (eighth + 1) % 8; if (eighth === 0) bar++;
    }
  }
  function startMusic() {
    if (!ctx || musicTimer) return;
    nextNoteTime = ctx.currentTime + .1; bar = 0; eighth = 0;
    musicTimer = setInterval(schedule, 60);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
  function setMood(m) { if (MOODS[m] && m !== mood) { if (musicTimer) pendingMood = m; else mood = m; } }
  function duck(on) {
    if (!ctx) return;
    musicDuck.gain.setTargetAtTime(on ? 0.4 : 1, ctx.currentTime, 0.3);
  }

  /* ---------- ambience: quiet background beds per place ---------- */
  let amb = null, ambName = null;
  function ambEvents(dest) {
    const t0 = () => ctx.currentTime;
    const tone = (f1, f2, t, dur, v, type = 'sine') => {
      const g = ctx.createGain(); g.connect(dest); env(g, t, .01, v, dur);
      const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      o.connect(g); o.start(t); o.stop(t + dur + .05);
    };
    return {
      chickadee() { const t = t0(); tone(3800, 3600, t, .12, .03); tone(3000, 2900, t + .18, .2, .03); },
      crackle() { const t = t0(); for (let i = 0; i < 3 + Math.random() * 4; i++) { const ct = t + Math.random() * .4, g = ctx.createGain(); g.connect(dest); env(g, ct, .001, .05 + Math.random() * .06, .02); noise(ct, .03, filter('highpass', 2500, 1, g)); } },
      murmur() { const t = t0(), g = ctx.createGain(); g.connect(dest); env(g, t, .3, .035, 1.2); const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 220 + Math.random() * 160; o.connect(filter('bandpass', 900, 3, g)); o.start(t); o.stop(t + 1.6); },
      giggle() { const t = t0(), b = 520 + Math.random() * 200; for (let i = 0; i < 3; i++) tone(b * 1.2, b, t + i * .12, .09, .02, 'triangle'); },
      clink() { const t = t0(), f = 2600 + Math.random() * 1200; tone(f, f, t, .25, .03); tone(f * 1.5, f * 1.5, t + .01, .2, .015); },
      chime() { const t = t0(); for (let i = 0; i < 3; i++) tone(2093 * Math.pow(2, i / 6), 2093 * Math.pow(2, i / 6), t + i * .15, .6, .012); }
    };
  }
  const AMB = {
    // [noise bed: type, freq, Q, volume, lfoRate, lfoAmount] + [event, minGap, maxGap]
    snow:  { bed: [['lowpass', 500, .4, .05, .09, .035]], ev: [['chime', 8, 16]] },
    yard:  { bed: [['lowpass', 520, .4, .045, .08, .03]], ev: [['chickadee', 5, 12], ['giggle', 4, 10]] },
    home:  { bed: [['lowpass', 200, .7, .05, .05, .02]], ev: [['crackle', .5, 1.8]] },
    class: { bed: [['bandpass', 800, .8, .025, .2, .01]], ev: [['murmur', .8, 2.4], ['giggle', 5, 12]] },
    diner: { bed: [['bandpass', 900, .8, .04, .3, .02], ['highpass', 5000, .7, .012, .4, .008]], ev: [['murmur', .4, 1.4], ['clink', 2, 6]] }
  };
  function makeAmb(name) {
    const spec = AMB[name]; if (!spec) return null;
    const out = ctx.createGain(); out.gain.value = .0001; out.connect(ambBus);
    out.gain.setTargetAtTime(1, ctx.currentTime, .8);
    const nodes = [], timers = [];
    spec.bed.forEach(([type, f, q, v, lr, la]) => {
      const g = ctx.createGain(); g.gain.value = v; g.connect(out);
      const fl = filter(type, f, q, g);
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.connect(fl); s.start(); nodes.push(s);
      if (lr) { const l = ctx.createOscillator(); l.frequency.value = lr; const lg = ctx.createGain(); lg.gain.value = la; l.connect(lg); lg.connect(g.gain); l.start(); nodes.push(l); }
    });
    const E = ambEvents(out);
    spec.ev.forEach(([ev, a, b]) => {
      const h = {}; timers.push(h);
      const loop = () => { if (ctx.state === 'running') E[ev](); h.t = setTimeout(loop, (a + Math.random() * (b - a)) * 1000); };
      h.t = setTimeout(loop, Math.random() * b * 1000);
    });
    return {
      stop() {
        out.gain.setTargetAtTime(.0001, ctx.currentTime, .5);
        timers.forEach(h => clearTimeout(h.t));
        setTimeout(() => { nodes.forEach(nd => { try { nd.stop(); } catch (e) {} }); out.disconnect(); }, 3000);
      }
    };
  }
  function setAmbience(name) {
    if (!ctx || name === ambName) return;
    ambName = name;
    if (amb) amb.stop();
    amb = name ? makeAmb(name) : null;
  }

  function setMuted(m) {
    muted = m;
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05);
  }
  function setMusicVol(v) { musicVol = v; if (ctx) { musicBus.gain.setTargetAtTime(v * 0.22, ctx.currentTime, .1); ambBus.gain.setTargetAtTime(v * 1.4, ctx.currentTime, .1); } }
  function setSfxVol(v) { sfxVol = v; if (ctx) sfxBus.gain.setTargetAtTime(v, ctx.currentTime, .1); }
  function suspend(s) { if (!ctx) return; s ? ctx.suspend() : ctx.resume(); }

  return { init, sfx, startMusic, stopMusic, setMood, setAmbience, duck, setMuted, setMusicVol, setSfxVol, suspend };
})();
