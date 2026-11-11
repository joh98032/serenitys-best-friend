/* Shared helpers. Everything lives on window.BOOK so the book works from file:// (no modules). */
window.BOOK = window.BOOK || {};

BOOK.util = (function () {
  /** Small seeded random generator so scenes look identical every time. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('serenity.' + key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('serenity.' + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  /** Split text into words (with char offsets) and sentences. */
  function tokenize(text) {
    const words = [];
    const re = /\S+/g; let m;
    while ((m = re.exec(text))) {
      words.push({ text: m[0], start: m.index, end: m.index + m[0].length, norm: m[0].toLowerCase().replace(/[^a-z0-9']/g, '') });
    }
    const sentences = [];
    const sre = /[^.!?]+[.!?]+["”']?\s*|[^.!?]+$/g;
    while ((m = sre.exec(text))) {
      if (!m[0].trim()) continue;
      const start = m.index, end = m.index + m[0].length;
      const idx = words.map((w, i) => i).filter(i => words[i].start >= start && words[i].start < end);
      sentences.push({ text: m[0], start, end, first: idx[0], last: idx[idx.length - 1] });
    }
    return { words, sentences };
  }

  return { rng, clamp, lerp, ease, store, tokenize };
})();
