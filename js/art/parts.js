/* Reusable plush SVG pieces. Every function returns an SVG markup string.
   Scene coordinate space is 1600 x 900; the ground is usually around y = 650 (above the caption).
   Things that animate with CSS never carry a transform attribute themselves —
   they sit inside a positioned <g>, so CSS transforms don't fight SVG ones.
   Gradient/filter ids must be unique per page, so builders take a `uid`. */
BOOK.parts = (function () {
  const { rng } = BOOK.util;
  const f1 = n => Math.round(n * 10) / 10;

  /* ---------- shared defs ---------- */
  /** soft plush shading: light from the upper left */
  const plushGrad = (id, light, mid, dark) =>
    `<radialGradient id="${id}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;

  /* ---------- fur ----------
     Fur is drawn as geometry, not with live SVG filters (those are too slow to redraw every frame):
     - outlines are traced with little pointed hair tufts all the way around
     - a tiled pattern of short light and dark hair strands is laid over each furry shape */
  /** closed path through outline points, with a hair tuft poking outward between each pair */
  function hairy(pts, hair, seed) {
    const r = rng(seed), n = pts.length;
    let cx = 0, cy = 0; pts.forEach(p => { cx += p[0] / n; cy += p[1] / n; });
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
      if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }     // point away from the middle
      const h = hair * (0.55 + r() * 0.9), lean = (r() - .5) * hair * .8;
      d += ` Q${f1(mx + nx * h * 2 + ny * lean)} ${f1(my + ny * h * 2 - nx * lean)} ${f1(b[0])} ${f1(b[1])}`;
    }
    return d + ' Z';
  }
  /** points around an ellipse, spaced about `step` apart */
  function ellipsePts(cx, cy, rx, ry, step = 11) {
    const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    const n = Math.max(14, Math.round(per / step)), pts = [];
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
    return pts;
  }
  /** points around a tall bunny ear (base at 0,0, tip at 0,-h) */
  function earPts(w, h, step = 10) {
    const pts = ellipsePts(0, -h / 2, w / 2, h / 2, step);
    return pts.map(([x, y]) => { const k = Math.max(0, (-h / 2 - y) / (h / 2)); return [x * (1 - .6 * k * k), y]; });
  }
  /** tile of short curved hair strands, light and dark.
      Drawn once onto a canvas and used as an image: much cheaper to repaint every frame than dozens of vector strokes. */
  const furTiles = {};
  function furTile(light, dark, seed) {
    const key = light + dark + seed;
    if (furTiles[key]) return furTiles[key];
    const S = 2, cv = document.createElement('canvas'); cv.width = cv.height = 64 * S;
    const g = cv.getContext('2d'); g.scale(S, S); g.lineCap = 'round';
    const r = rng(seed);
    for (let i = 0; i < 46; i++) {
      const x = r() * 64, y = r() * 64, l = 7 + r() * 9, bend = (r() - .5) * 7, lightOne = i % 3 !== 0, w = 1.3 + r() * 1.1;
      // draw each strand at its spot and wrapped around the tile edges so the tile repeats seamlessly
      for (const [ox, oy] of [-64, 0, 64].flatMap(a => [-64, 0, 64].map(b => [a, b]))) {
        g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + bend, y + oy + l / 2, x + ox + bend * .4, y + oy + l);
        g.strokeStyle = lightOne ? light : dark; g.globalAlpha = lightOne ? .55 : .35; g.lineWidth = w; g.stroke();
      }
    }
    return (furTiles[key] = cv.toDataURL('image/png'));
  }
  function furPattern(id, light, dark, seed) {
    const rot = f1((rng(seed + 1)() - .5) * 20);
    return `<pattern id="${id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})"><image href="${furTile(light, dark, seed)}" width="64" height="64"/></pattern>`;
  }

  /* ---------- Labubu ----------
     Origin at the feet. About 420 tall at s = 1 (ears included).
     o: { uid, x, y, s, facing:'left'|'right', id, cls, who, colors, glitterEyes, greenTooth, sparkleToes, book } */
  const PAL = {
    serenity: { fur: '#8fdcb6', light: '#c9f4de', dark: '#5fb994', face: '#dcf9ea', inner: '#ffc2d6', belly: '#c4f0da',
      iris: '#7cc8f4', irisDark: '#3d8fd1', nose: '#2fbf71', tooth: '#3fd17f', blush: '#ff9cb8', mouth: '#5b2b3d',
      strandLight: '#e9fff4', strandDark: '#3f9a74',
      toes: ['#2fbf71', '#7fe39a', '#1f9d5b', '#b0f2bf', '#4fd486', '#95e8a8'] },
    love: { fur: '#e2453f', light: '#ff8a80', dark: '#a8231f', face: '#ffb3ab', inner: '#ff6f68', belly: '#f26a60',
      iris: '#f2b33d', irisDark: '#c2791a', nose: '#9e1b25', tooth: '#fffaf2', blush: '#ff7f9a', mouth: '#5a1a22',
      strandLight: '#ffc2bb', strandDark: '#7d1416',
      toes: ['#b81f2b', '#ff7a70', '#d93535', '#ff9b8f', '#8f1820', '#f05a50'],
      tufts: ['#ff8a80', '#b3261e', '#f26a60', '#8f1820', '#ff6f68', '#c9302a'] },
    mom: null // filled in below (a grown-up Serenity: same green)
  };
  PAL.mom = Object.assign({}, PAL.serenity, { tooth: '#fffaf2' });
  /** a plain Labubu palette from a few colors (classmates, teacher) */
  const pal = (fur, light, dark, face, inner, iris, irisDark) => ({ fur, light, dark, face, inner, belly: light, iris, irisDark,
    nose: dark, tooth: '#fffaf2', blush: '#ff9cb8', mouth: '#4a2a3a', strandLight: '#ffffff', strandDark: dark, toes: [dark, light, dark, light, dark, light] });
  PAL.pink = pal('#f7a8c8', '#ffd3e4', '#d97ba3', '#ffe6ef', '#ff8fb8', '#8a6ad8', '#5a3fae');
  PAL.lavender = pal('#c7b2f0', '#e6dbff', '#9c86cf', '#f1ebff', '#ffb8d6', '#5aaa7a', '#2f7a50');
  PAL.peach = pal('#ffc49a', '#ffe1c8', '#e09a66', '#fff0e2', '#ff9fb0', '#4f8fd8', '#2a5ea8');
  PAL.sky = pal('#9fd3f5', '#d3ecfc', '#6aaad6', '#eaf6fe', '#ffb8d6', '#c27a3a', '#8a4f1e');
  PAL.teacher = pal('#f3ead6', '#fffaf0', '#cbbd9e', '#fffdf6', '#ffc2d6', '#6d8a5a', '#45603a');

  function labubu(o) {
    const C = Object.assign({}, PAL[o.who] || PAL.serenity, o.colors || {});
    const uid = o.uid + '-' + (o.id || 'lb');
    const s = o.s || 1;
    const sx = (o.facing === 'left' ? -1 : 1) * s;
    const furG = `url(#g-${uid})`, strands = `url(#fp-${uid})`;
    const defs = `<defs>${plushGrad('g-' + uid, C.light, C.fur, C.dark)}${furPattern('fp-' + uid, C.strandLight, C.strandDark, 17)}` +
      `<radialGradient id="ir-${uid}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${C.iris}"/><stop offset="1" stop-color="${C.irisDark}"/></radialGradient></defs>`;
    let seed = 100;
    /** a furry shape: hair-tufted outline, filled, with hair strands on top */
    const fur = (pts, fill, hair = 7, strandsOn = true, extra = '') => {
      const d = hairy(pts, hair, seed++);
      return `<path d="${d}" fill="${fill}"${extra}/>` + (strandsOn ? `<path d="${d}" fill="${strands}"${extra}/>` : '');
    };

    // ears: tall bunny ears with pointed tips
    const ear = (side) => {
      const x = side * 40, rot = side * 13;
      return `<g transform="translate(${x} -256) rotate(${rot})"><g class="lb-ear${side < 0 ? 'L' : 'R'}">` +
        fur(earPts(64, 160), furG, 5) +
        `<path d="M0 -6 C-17 -28 -15 -96 0 -126 C15 -96 17 -28 0 -6 Z" fill="${C.inner}" opacity=".9"/>` +
        `</g></g>`;
    };
    // arms: hang from the shoulder; CSS rotates .lb-armL / .lb-armR around the shoulder
    const arm = (side) =>
      `<g transform="translate(${side * 48} -124)"><g class="lb-arm${side < 0 ? 'L' : 'R'}"><g transform="rotate(${side * -22})">` +
      fur(ellipsePts(0, 31, 15, 40, 9), furG, 5) +
      `<ellipse cx="0" cy="62" rx="12" ry="9" fill="${C.light}" opacity=".5"/></g></g></g>`;
    // toenails: several greens (or reds) with a sparkle
    const toes = (cx) => {
      let t = '';
      [-15, 0, 15].forEach((dx, k) => {
        const col = C.toes[(k + (cx > 0 ? 3 : 0)) % C.toes.length];
        t += `<ellipse cx="${cx + dx}" cy="-7" rx="6.5" ry="5" fill="${col}" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>`;
      });
      if (o.sparkleToes) t += `<path class="lb-glint" style="animation-delay:${cx > 0 ? '-1.1s' : '0s'}" d="M${cx + 9} -16 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#fff"/>`;
      return t;
    };
    // the signature Labubu grin: a closed, wide crescent smile filled with nine interlocking pointed teeth
    // (five upper teeth pointing down, four lower teeth pointing up). o.greenTooth picks an upper tooth (0–4).
    const MW = 46, MY = -171;
    const qy = (x, c) => { const t = (x + MW) / (2 * MW); return MY + 2 * t * (1 - t) * (c - MY); };
    const top = x => qy(x, -159), bot = x => qy(x, -137);
    const zx = k => -MW + k * (2 * MW) / 10;          // 11 zigzag points across the smile
    const zy = k => (k % 2 ? bot(zx(k)) : top(zx(k)));
    let teeth = '';
    if (o.greenTooth != null) {
      const k = o.greenTooth * 2;
      teeth += `<path d="M${f1(zx(k))} ${f1(zy(k))} Q${f1(zx(k + 1))} ${f1(top(zx(k + 1)) - 1.5)} ${f1(zx(k + 2))} ${f1(zy(k + 2))} L${f1(zx(k + 1))} ${f1(zy(k + 1))} Z" fill="${C.tooth}"/>`;
      teeth += `<path class="lb-glint" d="M${f1(zx(k + 1) + 1)} ${f1(top(zx(k + 1)) - 2)} l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 z" fill="#fff"/>`;
    }
    let zig = `M${f1(zx(0))} ${f1(zy(0))}`;
    for (let k = 1; k <= 10; k++) zig += ` L${f1(zx(k))} ${f1(zy(k))}`;
    const smile = `<path d="M${-MW} ${MY} Q0 -159 ${MW} ${MY} Q0 -137 ${-MW} ${MY} Z" fill="#fffaf2"/>` + teeth +
      `<path d="${zig}" fill="none" stroke="${C.mouth}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M${-MW} ${MY} Q0 -159 ${MW} ${MY} Q0 -137 ${-MW} ${MY} Z" fill="none" stroke="${C.mouth}" stroke-width="3.2" stroke-linejoin="round"/>` +
      // little upturned corners: the mischievous part of the smile
      `<path d="M${-MW - 1} ${MY + 1} q-6 -2 -8 -8 M${MW + 1} ${MY + 1} q6 -2 8 -8" stroke="${C.mouth}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    // eyes: big and round; Serenity's sparkle like glitter
    const eye = (cx) => {
      let g = '';
      if (o.glitterEyes) {
        const r = rng(cx > 0 ? 11 : 5);
        for (let k = 0; k < 7; k++) g += `<circle cx="${f1(cx - 9 + r() * 18)}" cy="${f1(-212 + r() * 14)}" r="${f1(.9 + r() * 1.3)}" fill="#fff" class="a-twinkle" style="--dur:${f1(.8 + r() * 1.4)}s;animation-delay:${f1(-r() * 2)}s"/>`;
      }
      return `<ellipse cx="${cx}" cy="-208" rx="20" ry="23" fill="#fff"/>` +
        `<g class="lb-pupils"><circle cx="${cx + 2}" cy="-206" r="15" fill="url(#ir-${uid})"/>${g}<circle cx="${cx + 3}" cy="-205" r="7.5" fill="#1d1a2a"/>` +
        `<circle cx="${cx - 3}" cy="-213" r="4.5" fill="#fff"/><circle cx="${cx + 7}" cy="-200" r="2" fill="#fff" opacity=".8"/></g>`;
    };
    // Love: tufts in every kind of red
    let tufts = '', bodyTufts = '';
    if (C.tufts) {
      const r = rng(31);
      const tuft = ([x, y], k) => fur(ellipsePts(x, y, 10 + r() * 8, 8 + r() * 6, 7), C.tufts[k % C.tufts.length], 4, false, ' opacity=".9"');
      tufts = [[-70, -232], [-58, -258], [62, -240], [74, -214], [-66, -170], [70, -176], [-20, -272], [26, -276]].map(tuft).join('');
      bodyTufts = [[-46, -118], [44, -58], [-40, -40], [46, -122], [-50, -76], [50, -92]].map((p, k) => tuft(p, k + 3)).join('');
    }
    const book = o.book ? `<g class="lb-book" transform="translate(0 -96)"><rect x="-40" y="-28" width="80" height="56" rx="6" fill="${o.book}"/>` +
      `<rect x="-36" y="-24" width="72" height="48" rx="4" fill="#fffaf0"/><path d="M0 -24 V24" stroke="#d9cbb0" stroke-width="2"/>` +
      `<path d="M-22 -10 h16 M-22 -2 h14 M-22 6 h16 M6 -10 h16 M6 -2 h12 M6 6 h16" stroke="#b9ab94" stroke-width="2.4" stroke-linecap="round"/></g>` : '';

    return `<g transform="translate(${o.x} ${o.y})"><g class="lb-mover" ${o.id ? `id="${o.id}-mover"` : ''} ${o.moverStyle ? `style="${o.moverStyle}"` : ''}><g transform="scale(${f1(sx * 100) / 100} ${s})">${defs}
  <g class="lb ${o.cls || ''}" ${o.id ? `id="${o.id}"` : ''}>
   <ellipse cx="0" cy="2" rx="74" ry="12" fill="#3a4a7a" opacity=".2"/>
   <g class="lb-body">
    ${o.backpack ? `<rect x="-72" y="-150" width="144" height="110" rx="36" fill="${o.backpack}"/><rect x="-62" y="-104" width="124" height="40" rx="16" fill="#000" opacity=".12"/>` : ''}
    ${fur(ellipsePts(-30, -16, 31, 18, 9), furG, 4)}${fur(ellipsePts(30, -16, 31, 18, 9), furG, 4)}
    ${toes(-30)}${toes(30)}
    ${fur(ellipsePts(0, -80, 60, 66), furG, 8)}
    ${bodyTufts}
    ${fur(ellipsePts(0, -72, 37, 42, 9), C.belly, 4, true, ' opacity=".9"')}
    ${o.backpack ? `<path d="M-46 -140 Q-40 -90 -44 -40 M46 -140 Q40 -90 44 -40" stroke="${o.backpack}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-46 -140 Q-40 -90 -44 -40 M46 -140 Q40 -90 44 -40" stroke="#000" stroke-opacity=".15" stroke-width="12" fill="none" stroke-linecap="round"/>` : ''}
    <g class="lb-head">
     ${ear(-1)}${ear(1)}
     ${fur(ellipsePts(0, -206, 88, 76), furG, 8)}
     ${tufts}
     ${fur(ellipsePts(0, -196, 66, 54, 9), C.face, 4)}
     <ellipse cx="-54" cy="-176" rx="12" ry="7" fill="${C.blush}" opacity=".55"/><ellipse cx="54" cy="-176" rx="12" ry="7" fill="${C.blush}" opacity=".55"/>
     <g class="lb-eyesopen"><g class="a-blink" style="--dur:${f1(4 + (o.x % 7) / 3)}s">${eye(-28)}${eye(28)}</g></g>
     <g class="lb-closed"><path d="M-46 -206 Q-28 -192 -10 -206 M10 -206 Q28 -192 46 -206" stroke="${C.mouth}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
     <g class="lb-brows"><path d="M-46 -238 Q-32 -246 -16 -236 M16 -236 Q32 -246 46 -238" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linecap="round"/></g>
     ${o.glasses ? `<g fill="none" stroke="${o.glasses}" stroke-width="4"><circle cx="-28" cy="-208" r="27"/><circle cx="28" cy="-208" r="27"/><path d="M-1 -210 Q0 -214 1 -210"/><path d="M-55 -212 L-74 -218 M55 -212 L74 -218"/></g>` : ''}
     <path d="M-9 -186 Q0 -193 9 -186 Q5 -175 0 -173 Q-5 -175 -9 -186 Z" fill="${C.nose}"/>
     ${o.greenTooth != null ? `<path class="lb-glint" style="animation-delay:-1.2s" d="M5 -190 l1.4 3.4 l3.4 1.4 l-3.4 1.4 l-1.4 3.4 l-1.4 -3.4 l-3.4 -1.4 l3.4 -1.4 z" fill="#fff"/>` : `<ellipse cx="-3" cy="-187" rx="3" ry="1.6" fill="#fff" opacity=".6"/>`}
     <g class="lb-mouth">${smile}</g>
    </g>
    ${o.scarf ? `<path d="M-62 -150 Q0 -124 62 -150 L64 -132 Q0 -104 -64 -132 Z" fill="${o.scarf}"/><path d="M24 -128 L40 -70 L62 -76 L48 -132 Z" fill="${o.scarf}"/><path d="M28 -84 l6 10 M38 -86 l6 10 M48 -88 l6 10" stroke="#fff" stroke-width="3" opacity=".6"/>` : ''}
    ${arm(-1)}${arm(1)}
    ${book}
    ${o.prop || ''}
   </g>
  </g></g></g></g>`;
  }

  /* ---------- winter world ---------- */
  function sky(id, stops) {
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient></defs>` +
      `<rect x="-800" y="-300" width="3200" height="1500" fill="url(#${id})"/>`;
  }
  function glow(id, x, y, r, color, op = .8) {
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`;
  }
  /** soft rolling snow hills */
  function hills({ y, amp = 40, color, seed = 1, step = 260, x0 = -700, x1 = 2300, bottom = 1100 }) {
    const r = rng(seed); const pts = [];
    for (let x = x0; x <= x1 + step; x += step) pts.push([x, y + (r() * 2 - 1) * amp]);
    let d = `M${x0} ${bottom} L${pts[0][0]} ${f1(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [xa, ya] = pts[i], [xb, yb] = pts[i + 1];
      d += ` Q${xa} ${f1(ya)} ${f1((xa + xb) / 2)} ${f1((ya + yb) / 2)}`;
    }
    return `<path d="${d} L${x1 + step} ${bottom} Z" fill="${color}"/>`;
  }
  /** plush evergreen with snow on each tier */
  function snowyPine(x, y, h, color, snow = '#ffffff') {
    let s = '';
    for (let k = 0; k < 3; k++) {
      const top = y - h + k * h * .25, bot = top + h * .45, hw = h * (.17 + k * .08);
      s += `<path d="M${f1(x)} ${f1(top)} Q${f1(x + hw * .5)} ${f1(top + h * .2)} ${f1(x + hw)} ${f1(bot)} Q${f1(x)} ${f1(bot + h * .06)} ${f1(x - hw)} ${f1(bot)} Q${f1(x - hw * .5)} ${f1(top + h * .2)} ${f1(x)} ${f1(top)} Z" fill="${color}"/>` +
        `<path d="M${f1(x)} ${f1(top)} Q${f1(x + hw * .3)} ${f1(top + h * .1)} ${f1(x + hw * .55)} ${f1(top + h * .2)} Q${f1(x + hw * .2)} ${f1(top + h * .16)} ${f1(x)} ${f1(top + h * .2)} Q${f1(x - hw * .2)} ${f1(top + h * .16)} ${f1(x - hw * .55)} ${f1(top + h * .2)} Q${f1(x - hw * .3)} ${f1(top + h * .1)} ${f1(x)} ${f1(top)} Z" fill="${snow}"/>`;
    }
    return `<rect x="${f1(x - h * .04)}" y="${f1(y - h * .08)}" width="${f1(h * .08)}" height="${f1(h * .08)}" rx="3" fill="#8a6a58"/>` + s;
  }
  function pineRow({ y, x0 = -600, x1 = 2200, gap = 140, hmin = 120, hmax = 200, color, snow, seed = 7 }) {
    const r = rng(seed); let s = '';
    for (let x = x0; x < x1; x += gap * (0.6 + r() * 0.8)) s += snowyPine(x, y + r() * 16, hmin + r() * (hmax - hmin), color, snow);
    return s;
  }
  /** falling snow: n flakes spread over the scene, each drifting at its own pace */
  function snowfall(seed, n, { size = [3, 7], color = '#ffffff', op = .9, x0 = -300, x1 = 1900, speed = [9, 16] } = {}) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), rr = size[0] + r() * (size[1] - size[0]), dur = speed[0] + r() * (speed[1] - speed[0]);
      s += `<g transform="translate(${f1(x)} 0)"><circle class="a-snow" r="${f1(rr)}" fill="${color}" opacity="${f1(op * (.6 + r() * .4))}" style="--dur:${f1(dur)}s;--sx:${f1((r() - .5) * 90)}px;animation-delay:${f1(-r() * dur)}s"/></g>`;
    }
    return s;
  }
  /** string of twinkling Christmas lights along a quadratic swag */
  function lights(xa, ya, xc, yc, xb, yb, n, seed = 3) {
    const cols = ['#ff5a6e', '#ffd84d', '#58b8ff', '#6fe08a', '#ff9be0'];
    const r = rng(seed);
    let s = `<path d="M${xa} ${ya} Q${xc} ${yc} ${xb} ${yb}" stroke="#3d5a4a" stroke-width="2.5" fill="none"/>`;
    for (let i = 1; i < n; i++) {
      const t = i / n, x = (1 - t) * (1 - t) * xa + 2 * (1 - t) * t * xc + t * t * xb, y = (1 - t) * (1 - t) * ya + 2 * (1 - t) * t * yc + t * t * yb;
      const c = cols[i % cols.length];
      s += `<g class="a-twinkle bulb" style="--dur:${f1(1 + r() * 1.6)}s;animation-delay:${f1(-r() * 2)}s"><circle cx="${f1(x)}" cy="${f1(y + 6)}" r="11" fill="${c}" opacity=".35"/><ellipse cx="${f1(x)}" cy="${f1(y + 6)}" rx="4.5" ry="6" fill="${c}"/></g>`;
    }
    return s;
  }
  /** the big schoolyard tree: plush rounded evergreen, snow on top, lights wrapped around */
  function bigTree(x, y, uid) {
    const g = `url(#tg-${uid})`;
    const blobs = [[0, -470, 150], [-120, -390, 120], [120, -395, 125], [-60, -300, 130], [80, -290, 135], [-150, -250, 95], [160, -240, 100], [0, -560, 95]];
    let canopy = '', snow = '';
    blobs.forEach(([bx, by, br]) => {
      canopy += `<circle cx="${bx}" cy="${by}" r="${br}" fill="${g}"/>`;
      snow += `<path d="M${bx - br * .78} ${by - br * .5} Q${bx} ${by - br * 1.18} ${bx + br * .78} ${by - br * .5} Q${bx + br * .4} ${by - br * .68} ${bx} ${by - br * .62} Q${bx - br * .4} ${by - br * .7} ${bx - br * .78} ${by - br * .5} Z" fill="#ffffff"/>`;
    });
    return `<g transform="translate(${x} ${y})"><defs>${plushGrad('tg-' + uid, '#79c49a', '#3f9a6e', '#24694a')}</defs>` +
      `<ellipse cx="10" cy="12" rx="150" ry="18" fill="#3a4a7a" opacity=".16"/>` +
      `<path d="M-46 0 Q-30 -120 -34 -230 L34 -230 Q30 -120 46 0 Q60 10 70 14 L-70 14 Q-60 10 -46 0 Z" fill="#9b6b52"/>` +
      `<path d="M-20 -40 Q-14 -120 -16 -200" stroke="#b98a6f" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<g class="a-sway" style="--dur:7s;--amt:.6deg">${canopy}${snow}` +
      lights(-200, -270, 0, -150, 220, -260, 12, 2) + lights(-170, -390, 0, -290, 170, -400, 10, 5) + lights(-110, -500, 0, -430, 110, -510, 8, 9) +
      `</g></g>`;
  }
  /** rounded log bench with snow on top; top surface at y */
  function logBench(x, y, w) {
    return `<g transform="translate(${x} ${y})">` +
      `<rect x="${-w / 2}" y="0" width="${w}" height="54" rx="27" fill="#a5735a"/>` +
      `<ellipse cx="${w / 2 - 22}" cy="27" rx="20" ry="25" fill="#c99677"/><ellipse cx="${w / 2 - 22}" cy="27" rx="11" ry="14" fill="none" stroke="#a5735a" stroke-width="3"/>` +
      `<path d="M${-w / 2 + 10} 6 Q${-w / 4} -14 0 2 Q${w / 4} -16 ${w / 2 - 6} 4 Q${w / 2 - 10} 12 ${w / 2 - 40} 10 Q0 16 ${-w / 2 + 14} 12 Z" fill="#ffffff"/>` +
      `<rect x="${-w / 2 + 30}" y="54" width="22" height="34" rx="8" fill="#8a5d48"/><rect x="${w / 2 - 70}" y="54" width="22" height="34" rx="8" fill="#8a5d48"/></g>`;
  }
  /** cosy plush school building with a snowy roof, warm windows and wreaths */
  function school(x, y, s, uid) {
    const win = (wx, wy) => `<rect x="${wx}" y="${wy}" width="64" height="70" rx="18" fill="#ffe7a3"/><rect x="${wx}" y="${wy}" width="64" height="70" rx="18" fill="none" stroke="#f3f0ff" stroke-width="7"/>` +
      `<path d="M${wx + 32} ${wy} V${wy + 70} M${wx} ${wy + 35} H${wx + 64}" stroke="#f3f0ff" stroke-width="5"/>`;
    const wreath = (wx, wy) => `<circle cx="${wx}" cy="${wy}" r="17" fill="none" stroke="#3f9a6e" stroke-width="10"/><path d="M${wx - 7} ${wy + 14} l7 -6 l7 6 l-3 10 l-4 -6 l-4 6 z" fill="#ff5a6e"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<rect x="-300" y="-250" width="600" height="250" rx="40" fill="#f6c9a8"/>` +
      `<rect x="-300" y="-60" width="600" height="60" rx="24" fill="#eab08c"/>` +
      `<path d="M-340 -230 Q-330 -300 -250 -310 L250 -310 Q330 -300 340 -230 Q0 -210 -340 -230 Z" fill="#e0716f"/>` +
      `<path d="M-346 -228 Q-336 -330 -250 -336 L250 -336 Q336 -330 346 -228 Q300 -246 250 -238 Q180 -256 120 -240 Q40 -258 -40 -242 Q-120 -258 -190 -240 Q-260 -254 -346 -228 Z" fill="#ffffff"/>` +
      `<rect x="-60" y="-420" width="120" height="110" rx="26" fill="#f6c9a8"/>` +
      `<path d="M-80 -410 Q0 -480 80 -410 Q0 -420 -80 -410 Z" fill="#e0716f"/><path d="M-84 -408 Q0 -500 84 -408 Q40 -420 0 -414 Q-40 -422 -84 -408 Z" fill="#ffffff"/>` +
      `<path d="M-22 -340 Q-22 -378 0 -380 Q22 -378 22 -340 Z" fill="#f2c14e"/><circle cx="0" cy="-334" r="7" fill="#d9a12b"/>` +
      win(-250, -200) + win(-160, -200) + win(96, -200) + win(186, -200) +
      `<path d="M-52 0 V-120 Q-52 -170 0 -170 Q52 -170 52 -120 V0 Z" fill="#8fd0f0"/><path d="M0 -170 V0" stroke="#6bb4dc" stroke-width="5"/>` +
      `<circle cx="-14" cy="-70" r="5" fill="#fff"/><circle cx="14" cy="-70" r="5" fill="#fff"/>` +
      wreath(0, -136) + wreath(-128, -228) + wreath(128, -228) +
      `</g>`;
  }
  /** snowy picket fence: rounded posts with snow caps */
  function fence(x0, x1, y, color = '#ffffff', shade = '#d9e6f5') {
    let s = `<rect x="${x0}" y="${y - 70}" width="${x1 - x0}" height="14" rx="7" fill="${shade}"/><rect x="${x0}" y="${y - 34}" width="${x1 - x0}" height="14" rx="7" fill="${shade}"/>`;
    for (let x = x0 + 10; x < x1; x += 46) s += `<rect x="${x}" y="${y - 100}" width="26" height="100" rx="13" fill="${color}"/><ellipse cx="${x + 13}" cy="${y - 100}" rx="17" ry="9" fill="#fff"/>`;
    return s;
  }
  /** footprints across the snow (from walking up) */
  function footprints(xa, xb, y, color = '#c8d9ee') {
    let s = '';
    for (let x = xa, k = 0; x < xb; x += 44, k++) s += `<ellipse cx="${x}" cy="${y + (k % 2 ? 8 : -6)}" rx="13" ry="6" fill="${color}"/>`;
    return s;
  }

  /* ---------- effects ---------- */
  const heartPath = 'M0 10 C-14 -2 -22 -10 -22 -20 C-22 -30 -13 -35 -6 -32 C-3 -31 -1 -28 0 -25 C1 -28 3 -31 6 -32 C13 -35 22 -30 22 -20 C22 -10 14 -2 0 10 Z';
  function heart(x, y, s = 1, color = '#ff6f9c', delay = 0) {
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><g class="fx-heart" style="animation-delay:${delay}s"><path d="${heartPath}" fill="${color}" stroke="#fff" stroke-width="3"/></g></g>`;
  }
  function spark(x, y, r = 40, color = '#fff6c2') {
    let d = '';
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; d += `M${f1(Math.cos(a) * r * .3)} ${f1(Math.sin(a) * r * .3)} L${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)} `; }
    return `<g transform="translate(${x} ${y})"><g class="fx-spark"><path d="${d}" stroke="${color}" stroke-width="7" stroke-linecap="round"/><circle r="${r * .28}" fill="${color}"/></g></g>`;
  }
  /** a burst of hearts, stars and snowflakes flying outward */
  function joyBurst(x, y, n = 36, seed = 5) {
    const r = rng(seed), cols = ['#ff6f9c', '#ffd84d', '#8fdcb6', '#ffffff', '#ff8a80', '#b8e4ff'];
    let s = '';
    for (let i = 0; i < n; i++) {
      const fx = (r() - .5) * 1100, fy = -260 - r() * 320 + r() * 560, c = cols[i % cols.length];
      const shape = i % 3 === 0 ? `<path d="${heartPath}" transform="scale(.55)" fill="${c}"/>` : i % 3 === 1 ? `<path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="${c}"/>` : `<circle r="6" fill="${c}"/>`;
      s += `<g transform="translate(${x} ${y})"><g class="fx-confetti" style="--fx:${f1(fx)}px;--fy:${f1(fy)}px;--rot:${f1((r() - .5) * 720)}deg;--dur:${f1(1.8 + r() * 1.4)}s">${shape}</g></g>`;
    }
    return s;
  }

  return { labubu, PAL, hairy, ellipsePts, furPattern, plushGrad, sky, glow, hills, snowyPine, pineRow, snowfall, lights, bigTree, logBench, school, fence, footprints, heart, heartPath, spark, joyBurst };
})();
