/* More plush props: home, school, Christmas, LOL dolls, the car, The Habit and lunch.
   Same rules as parts.js: everything returns SVG markup; ids that CSS/JS looks for are passed in. */
(function () {
  const P = BOOK.parts;
  const { rng } = BOOK.util;
  const f1 = n => Math.round(n * 10) / 10;
  const star5 = (r, inner = .45) => {
    let d = '';
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * inner : r; d += (k ? 'L' : 'M') + f1(Math.cos(a) * rr) + ' ' + f1(Math.sin(a) * rr) + ' '; }
    return d + 'Z';
  };

  /* ---------- home ---------- */
  /** cosy round house with snowy roof, warm windows and a wreath on the door */
  function house(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<rect x="-220" y="-250" width="440" height="250" rx="60" fill="#ffe0b8"/>` +
      `<path d="M-260 -220 Q-240 -420 0 -440 Q240 -420 260 -220 Q0 -250 -260 -220 Z" fill="#9b7ad1"/>` +
      `<path d="M-266 -218 Q-246 -440 0 -458 Q246 -440 266 -218 Q220 -244 160 -232 Q80 -262 0 -240 Q-80 -262 -160 -234 Q-220 -248 -266 -218 Z" fill="#ffffff"/>` +
      `<rect x="120" y="-470" width="56" height="110" rx="14" fill="#c98a6d"/><ellipse cx="148" cy="-472" rx="36" ry="14" fill="#fff"/>` +
      `<g class="a-float" style="--dur:3s;--amt:8px"><circle cx="160" cy="-500" r="16" fill="#fff" opacity=".7"/><circle cx="176" cy="-530" r="12" fill="#fff" opacity=".5"/></g>` +
      `<rect x="-170" y="-190" width="110" height="100" rx="34" fill="#ffd36e"/><path d="M-115 -190 V-90 M-170 -140 H-60" stroke="#fff4e0" stroke-width="7"/>` +
      `<rect x="60" y="-190" width="110" height="100" rx="34" fill="#ffd36e"/><path d="M115 -190 V-90 M60 -140 H170" stroke="#fff4e0" stroke-width="7"/>` +
      `<path d="M-48 0 V-120 Q-48 -170 0 -170 Q48 -170 48 -120 V0 Z" fill="#e07a8a"/><circle cx="30" cy="-70" r="6" fill="#ffd36e"/>` +
      `<circle cx="0" cy="-122" r="22" fill="none" stroke="#3f9a6e" stroke-width="12"/><path d="M-8 -104 l8 -7 l8 7 l-3 12 l-5 -7 l-5 7 z" fill="#ff5a6e"/>` +
      `<path d="M-230 -12 Q0 6 230 -12 L230 6 L-230 6 Z" fill="#fff"/>` +
      `</g>`;
  }
  /** warm living room / kitchen: wall, wood floor, snowy window, fireplace with a fire */
  function room(uid, { wall = '#ffe7d1', wall2 = '#ffd9bd', floor = '#d9a57b', window = 1180, fireplace = 300 } = {}) {
    let stripes = '';
    for (let x = -700; x < 2300; x += 120) stripes += `<rect x="${x}" y="-300" width="60" height="1000" fill="${wall2}"/>`;
    return `<rect x="-800" y="-300" width="3200" height="1500" fill="${wall}"/>` + stripes +
      `<rect x="-800" y="560" width="3200" height="600" fill="${floor}"/><rect x="-800" y="552" width="3200" height="18" fill="#c48a62"/>` +
      `<ellipse cx="800" cy="690" rx="560" ry="70" fill="#e98a9a" opacity=".55"/>` +
      (window != null ? `<g transform="translate(${window} 120)"><rect x="-150" y="0" width="300" height="250" rx="40" fill="#bfe3f7"/>` +
        `<path d="M-150 190 Q0 160 150 190 L150 210 Q150 250 110 250 L-110 250 Q-150 250 -150 210 Z" fill="#fff"/>` +
        `<rect x="-150" y="0" width="300" height="250" rx="40" fill="none" stroke="#fff" stroke-width="14"/><path d="M0 0 V250 M-150 125 H150" stroke="#fff" stroke-width="10"/>` +
        `<path d="M-170 -10 Q-160 60 -170 260 L-140 260 Q-128 120 -150 -10 Z M170 -10 Q160 60 170 260 L140 260 Q128 120 150 -10 Z" fill="#e07a8a"/></g>` : '') +
      (fireplace != null ? `<g transform="translate(${fireplace} 560)"><rect x="-170" y="-260" width="340" height="260" rx="30" fill="#e0a088"/>` +
        `<rect x="-200" y="-290" width="400" height="40" rx="16" fill="#c98a6d"/>` +
        `<path d="M-100 0 V-120 Q-100 -180 0 -180 Q100 -180 100 -120 V0 Z" fill="#5a3a3a"/>` +
        `<g transform="translate(0 -14)"><rect x="-60" y="-10" width="120" height="16" rx="8" fill="#8a5d48"/>` +
        `<path class="flame" d="M-40 -6 Q-50 -60 -14 -96 Q-20 -54 0 -46 Q4 -80 26 -104 Q48 -60 40 -6 Z" fill="#ff9a3c"/>` +
        `<path class="flame" style="animation-delay:-.06s" d="M-22 -6 Q-28 -40 -4 -64 Q0 -36 12 -32 Q22 -50 24 -62 Q36 -34 26 -6 Z" fill="#ffd36e"/></g>` +
        `<g opacity=".2"><circle cx="0" cy="-90" r="120" fill="#ffb060" class="a-glow"/></g>` +
        `<path d="M-150 -290 l20 50 l20 -50 M-60 -290 l20 50 l20 -50 M30 -290 l20 50 l20 -50 M120 -290 l20 50 l20 -50" fill="none" stroke="#3f9a6e" stroke-width="10" stroke-linecap="round"/>` +
        `</g>` : '');
  }

  /* ---------- school ---------- */
  /** TK classroom: board with "TK", snowy windows, cubbies, rug, crayons and blocks; door at doorX */
  function classroom(uid, { doorX = 1360 } = {}) {
    let blocks = '';
    const bc = ['#ff6f8a', '#ffd36e', '#7fd0f0', '#8fdcb6', '#c7b2f0'];
    [[1060, 640], [1110, 640], [1085, 600], [1160, 640]].forEach(([bx, by], k) => { blocks += `<rect x="${bx}" y="${by - 46}" width="46" height="46" rx="8" fill="${bc[k % 5]}"/><text x="${bx + 23}" y="${by - 13}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="28" fill="#fff">${'ABCD'[k]}</text>`; });
    let crayons = '';
    bc.forEach((c, k) => { crayons += `<g transform="translate(${300 + k * 22} 628) rotate(${-20 + k * 9})"><rect x="-5" y="-40" width="10" height="40" rx="3" fill="${c}"/><path d="M-5 -40 L0 -52 L5 -40 Z" fill="${c}"/></g>`; });
    const win = wx => `<g transform="translate(${wx} 110)"><rect x="-110" y="0" width="220" height="200" rx="36" fill="#bfe3f7"/>` +
      `<path d="M-110 150 Q0 120 110 150 L110 164 Q110 200 74 200 L-74 200 Q-110 200 -110 164 Z" fill="#fff"/>` +
      P.snowyPine(40, 160, 90, '#7fb5a0') +
      `<rect x="-110" y="0" width="220" height="200" rx="36" fill="none" stroke="#fff" stroke-width="12"/><path d="M0 0 V200" stroke="#fff" stroke-width="8"/></g>`;
    return `<rect x="-800" y="-300" width="3200" height="1500" fill="#fdf1d8"/>` +
      `<rect x="-800" y="380" width="3200" height="200" fill="#f8e2b8"/>` +
      `<rect x="-800" y="560" width="3200" height="600" fill="#cfe3c8"/><rect x="-800" y="552" width="3200" height="16" fill="#a8c79e"/>` +
      `<rect x="420" y="80" width="560" height="260" rx="30" fill="#4f8a6a"/><rect x="420" y="80" width="560" height="260" rx="30" fill="none" stroke="#c98a6d" stroke-width="16"/>` +
      `<text x="700" y="240" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="120" fill="#fff">TK</text>` +
      `<path d="M470 120 q20 -10 40 0 M890 300 q20 -10 40 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>` +
      win(160) + win(1180) +
      (doorX == null ? '' : door(doorX)) +
      `<ellipse cx="760" cy="690" rx="520" ry="66" fill="#ffd36e" opacity=".55"/><ellipse cx="760" cy="690" rx="440" ry="50" fill="#ff9fb8" opacity=".5"/>` +
      crayons + blocks +
      `<path d="M-800 70 Q-400 110 0 70 Q400 110 800 70 Q1200 110 1600 70 Q2000 110 2400 70" stroke="#3f9a6e" stroke-width="10" fill="none"/>` +
      P.lights(-300, 70, 0, 120, 300, 70, 8, 21) + P.lights(300, 70, 700, 120, 1100, 70, 10, 22) + P.lights(1100, 70, 1500, 120, 1900, 70, 8, 23);
  }
  /** classroom door: doorBack = frame and the snowy outside; doorLeaf = the door itself (add .open to the parent to swing it) */
  function doorBack(x) {
    return `<g transform="translate(${x} 560)"><rect x="-100" y="-340" width="200" height="340" rx="24" fill="#8fd0f0"/>` +
      `<rect x="-86" y="-326" width="172" height="326" rx="16" fill="#d9f0ff"/><path d="M-86 -60 Q0 -90 86 -60 L86 0 L-86 0 Z" fill="#fff"/></g>`;
  }
  function doorLeaf(x, id = 'door') {
    return `<g id="${id}" transform="translate(${x} 560)"><g class="door-leaf" style="transform-origin:-86px 0px;transform-box:view-box"><rect x="-86" y="-326" width="172" height="326" rx="16" fill="#e07a8a"/><circle cx="56" cy="-160" r="10" fill="#ffd36e"/>` +
      `<circle cx="0" cy="-240" r="30" fill="none" stroke="#3f9a6e" stroke-width="14"/><path d="M-9 -218 l9 -8 l9 8 l-3 13 l-6 -8 l-6 8 z" fill="#ff5a6e"/></g></g>`;
  }
  function door(x) { return doorBack(x) + doorLeaf(x, 'door-static'); }
  /** a shelf of LOL dolls (ids lol0..lolN for pop-ins) */
  function lolShelf(x, y, uid) {
    const dolls = [['#ffd36e', '#ff6f9c'], ['#7a4a2a', '#8fd0f0'], ['#ff9fd6', '#c7b2f0'], ['#2b2b3a', '#ffd36e'], ['#ff7a3c', '#8fdcb6']];
    let s = `<g transform="translate(${x} ${y})"><rect x="-300" y="0" width="600" height="26" rx="10" fill="#c98a6d"/><rect x="-300" y="-220" width="600" height="26" rx="10" fill="#c98a6d" opacity="0"/>` +
      `<rect x="-310" y="-6" width="620" height="12" rx="6" fill="#e0a088"/>`;
    dolls.forEach(([hair, dress], k) => { s += `<g id="lol${k}" class="dup">${lol(-240 + k * 120, 0, .62, hair, dress, uid + 'l' + k)}</g>`; });
    return s + `</g>`;
  }
  /** an LOL-style doll: huge head, big glossy lashed eyes, little pout, hair buns, tiny body */
  function lol(x, y, s, hair, dress, id) {
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<path d="M-30 0 L-22 -60 Q0 -70 22 -60 L30 0 Z" fill="${dress}"/><rect x="-24" y="-8" width="14" height="10" rx="5" fill="#ffe0d0"/><rect x="10" y="-8" width="14" height="10" rx="5" fill="#ffe0d0"/>` +
      `<circle cx="-60" cy="-190" r="34" fill="${hair}"/><circle cx="60" cy="-190" r="34" fill="${hair}"/>` +
      `<ellipse cx="0" cy="-130" rx="70" ry="66" fill="#ffe0d0"/>` +
      `<path d="M-74 -128 Q-80 -210 0 -206 Q80 -210 74 -128 Q60 -176 0 -170 Q-40 -176 -74 -128 Z" fill="${hair}"/>` +
      `<g class="a-blink" style="--dur:5s"><ellipse cx="-28" cy="-124" rx="22" ry="25" fill="#fff"/><ellipse cx="28" cy="-124" rx="22" ry="25" fill="#fff"/>` +
      `<circle cx="-26" cy="-120" r="16" fill="#7a4fd0"/><circle cx="30" cy="-120" r="16" fill="#7a4fd0"/><circle cx="-26" cy="-120" r="8" fill="#1d1a2a"/><circle cx="30" cy="-120" r="8" fill="#1d1a2a"/>` +
      `<circle cx="-32" cy="-128" r="5" fill="#fff"/><circle cx="24" cy="-128" r="5" fill="#fff"/>` +
      `<path d="M-50 -142 l-8 -8 M-44 -148 l-4 -10 M50 -142 l8 -8 M44 -148 l4 -10" stroke="#1d1a2a" stroke-width="3" stroke-linecap="round"/></g>` +
      `<path d="M-10 -92 Q0 -84 10 -92 Q0 -98 -10 -92 Z" fill="#ff5a8a"/><ellipse cx="-44" cy="-100" rx="9" ry="5" fill="#ff9cb8" opacity=".6"/><ellipse cx="44" cy="-100" rx="9" ry="5" fill="#ff9cb8" opacity=".6"/>` +
      `<path d="M-20 -200 q20 -14 40 0" stroke="${dress}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
      `</g>`;
  }

  /* ---------- Christmas & birthday ---------- */
  /** plush Christmas tree with lights (class bulb) and a star (#tstar) */
  function xmasTree(x, y, s, uid) {
    let tiers = '';
    [[0, -420, 110, 150], [0, -300, 170, 170], [0, -160, 230, 190]].forEach(([cx, top, hw, h]) => {
      tiers += `<path d="M${cx} ${top} Q${cx + hw * .45} ${top + h * .55} ${cx + hw} ${top + h} Q${cx} ${top + h + 26} ${cx - hw} ${top + h} Q${cx - hw * .45} ${top + h * .55} ${cx} ${top} Z" fill="url(#xg-${uid})"/>`;
    });
    let baubles = '';
    const r = rng(9), cols = ['#ff5a6e', '#ffd84d', '#58b8ff', '#ff9be0', '#c7b2f0'];
    for (let k = 0; k < 12; k++) { const yy = -380 + r() * 380, w = 30 + (yy + 420) * .5; baubles += `<circle cx="${f1((r() - .5) * w * 1.4)}" cy="${f1(yy)}" r="${f1(9 + r() * 6)}" fill="${cols[k % 5]}"/>`; }
    return `<g transform="translate(${x} ${y}) scale(${s})"><defs>${P.plushGrad('xg-' + uid, '#7fd0a0', '#3f9a6e', '#24694a')}</defs>` +
      `<rect x="-24" y="0" width="48" height="50" rx="8" fill="#9b6b52"/><rect x="-70" y="40" width="140" height="70" rx="20" fill="#e07a8a"/>` +
      tiers + baubles +
      P.lights(-90, -330, 0, -270, 100, -320, 7, 31) + P.lights(-150, -200, 0, -130, 160, -190, 9, 32) + P.lights(-210, -60, 0, 10, 220, -50, 11, 33) +
      `<g id="tstar" transform="translate(0 -430)"><circle r="60" fill="#ffe680" class="star-glow"/><path d="${star5(36)}" fill="#ffd84d" stroke="#fff3b0" stroke-width="4"/></g>` +
      `</g>`;
  }
  /** a wrapped present */
  function present(x, y, w, h, box, ribbon, cls = '', id = '') {
    return `<g transform="translate(${x} ${y})"><g ${id ? `id="${id}"` : ''} class="${cls}"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="10" fill="${box}"/>` +
      `<rect x="${-w / 2 - 6}" y="${-h - 4}" width="${w + 12}" height="${h * .25}" rx="8" fill="${box}" opacity=".85"/>` +
      `<rect x="-7" y="${-h - 4}" width="14" height="${h + 4}" fill="${ribbon}"/>` +
      `<path d="M0 ${-h - 4} q-30 -30 -34 -4 q4 10 34 4 q30 -30 34 -4 q-4 10 -34 4" fill="${ribbon}"/></g></g>`;
  }
  /** birthday cake with candles (class flame; add .out to blow them out) */
  function cake(x, y, s = 1, id = 'cake') {
    let candles = '';
    [-50, -18, 18, 50].forEach((cx, k) => {
      candles += `<rect x="${cx - 5}" y="-196" width="10" height="44" rx="4" fill="${['#8fdcb6', '#ff9fc4', '#9fd3f5', '#ffd36e'][k]}"/>` +
        `<path class="flame" style="animation-delay:-${k * .05}s" d="M${cx} -220 Q${cx + 9} -206 ${cx} -196 Q${cx - 9} -206 ${cx} -220 Z" fill="#ffb238"/>` +
        `<circle class="smoke" cx="${cx}" cy="-214" r="7" fill="#d9d9e6"/>`;
    });
    return `<g id="${id}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="130" ry="18" fill="#fff"/>` +
      `<rect x="-100" y="-90" width="200" height="88" rx="24" fill="#ffd9e8"/><rect x="-80" y="-152" width="160" height="70" rx="22" fill="#fff3f7"/>` +
      `<path d="M-100 -60 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q8 10 8 0" stroke="#ff8fb8" stroke-width="8" fill="none"/>` +
      `<path d="M-80 -130 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0" stroke="#8fdcb6" stroke-width="7" fill="none"/>` +
      candles + `</g>`;
  }
  /** thought bubble; put content in the slot with class bubble-pic */
  function bubble(x, y, w, h, id, content = '') {
    return `<g transform="translate(${x} ${y})"><g id="${id}" class="bubble">` +
      `<circle cx="${-w * .42}" cy="${h * .62}" r="10" fill="#fff"/><circle cx="${-w * .3}" cy="${h * .48}" r="16" fill="#fff"/>` +
      `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#fff"/>` +
      `<ellipse cx="${-w * .3}" cy="${-h * .3}" rx="${w * .25}" ry="${h * .22}" fill="#fff"/><ellipse cx="${w * .28}" cy="${-h * .32}" rx="${w * .26}" ry="${h * .22}" fill="#fff"/>` +
      `<ellipse cx="${w * .35}" cy="${h * .2}" rx="${w * .22}" ry="${h * .26}" fill="#fff"/><ellipse cx="${-w * .36}" cy="${h * .16}" rx="${w * .2}" ry="${h * .24}" fill="#fff"/>` +
      content + `</g></g>`;
  }
  /** simple two-Labubu silhouette holding hands (for dreams and wishes) */
  function friendsIcon(x, y, s, a = '#8fdcb6', b = '#c9c9d6') {
    const one = (cx, col) => `<path d="M${cx - 12} -96 Q${cx - 18} -130 ${cx - 8} -138 Q${cx - 2} -118 ${cx - 2} -104 M${cx + 12} -96 Q${cx + 18} -130 ${cx + 8} -138 Q${cx + 2} -118 ${cx + 2} -104" fill="${col}" stroke="${col}" stroke-width="8" stroke-linejoin="round"/>` +
      `<circle cx="${cx}" cy="-78" r="28" fill="${col}"/><ellipse cx="${cx}" cy="-30" rx="24" ry="30" fill="${col}"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">${one(-40, a)}${one(40, b)}<path d="M-18 -36 Q0 -24 18 -36" stroke="${a}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
      `<path d="${P.heartPath}" transform="translate(0 -128) scale(.5)" fill="#ff6f9c"/></g>`;
  }

  /* ---------- little things ---------- */
  /** round mint candy: green and white swirls */
  function mintCandy(x, y, r = 40) {
    let sw = '';
    for (let k = 0; k < 6; k++) { const a = k * 60; sw += `<path d="M0 0 Q${f1(r * .7)} ${f1(-r * .25)} ${f1(r * .95)} ${f1(r * .3)} L${f1(r * .55)} ${f1(r * .82)} Q${f1(r * .35)} ${f1(r * .2)} 0 0 Z" fill="#3fd17f" transform="rotate(${a})"/>`; }
    return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ffffff"/>${sw}<circle r="${r * .2}" fill="#b8f0d6"/><circle r="${r}" fill="none" stroke="#e3f6ec" stroke-width="3"/>` +
      `<ellipse cx="${-r * .35}" cy="${-r * .45}" rx="${r * .25}" ry="${r * .12}" fill="#fff" opacity=".8" transform="rotate(-30)"/></g>`;
  }
  /** glitter jar (tips over with .tipped on the parent) */
  function glitterJar(x, y, id = 'jar') {
    let gl = '';
    const r = rng(4), cols = ['#ffd84d', '#ff9be0', '#58b8ff', '#ffffff', '#b8f0d6'];
    for (let k = 0; k < 26; k++) gl += `<circle cx="${f1(-28 + r() * 56)}" cy="${f1(-70 + r() * 66)}" r="${f1(2 + r() * 3)}" fill="${cols[k % 5]}"/>`;
    return `<g id="${id}" transform="translate(${x} ${y})"><g class="jar-tip"><rect x="-38" y="-96" width="76" height="96" rx="20" fill="#dff3ff" opacity=".85"/>${gl}` +
      `<rect x="-42" y="-112" width="84" height="22" rx="8" fill="#ff9fc4"/><path d="M-26 -84 Q-30 -40 -26 -12" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></g></g>`;
  }
  /** a tiny round snowbird */
  function snowbird(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-22" rx="26" ry="22" fill="#9fb8e0"/><ellipse cx="4" cy="-16" rx="16" ry="13" fill="#fff"/>` +
      `<circle cx="14" cy="-30" r="4" fill="#1d1a2a"/><circle cx="15" cy="-31" r="1.4" fill="#fff"/><path d="M24 -26 l10 3 l-10 3 Z" fill="#ffb238"/>` +
      `<path d="M-14 -24 Q-30 -30 -34 -14 Q-22 -18 -12 -14 Z" fill="#7f9ccc"/><path d="M-6 0 v6 M4 0 v6" stroke="#ffb238" stroke-width="3"/>` +
      `<path d="M-12 -40 q10 -6 22 0" stroke="#ff5a6e" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  }
  /** "BFF" spelled in sparkly bubble letters */
  function bffSign(x, y, id = 'bff') {
    return `<g transform="translate(${x} ${y})"><g id="${id}" class="dup"><text x="0" y="0" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="140" fill="#ff6f9c" stroke="#fff" stroke-width="12" paint-order="stroke">BFF</text>` +
      [[-150, -110], [150, -100], [-110, 10], [140, 0], [0, -150]].map(([sx, sy], k) => `<path class="a-twinkle" style="--dur:${.6 + k * .2}s" d="M${sx} ${sy - 18} L${sx + 5} ${sy - 5} L${sx + 18} ${sy} L${sx + 5} ${sy + 5} L${sx} ${sy + 18} L${sx - 5} ${sy + 5} L${sx - 18} ${sy} L${sx - 5} ${sy - 5} Z" fill="#ffd84d"/>`).join('') + `</g></g>`;
  }

  /* ---------- the trip to The Habit ---------- */
  /** Mom's little round pink car. Passengers are drawn first (pass markup), the body sits on top with window openings. */
  function car(passengers = '') {
    const body = `M-250 -40 Q-260 -130 -150 -140 Q-120 -250 0 -256 Q130 -252 170 -140 Q262 -130 256 -40 Q256 0 220 0 L-220 0 Q-256 0 -250 -40 Z`;
    const windows = `M-120 -150 Q-96 -226 -16 -230 L-16 -150 Z M14 -230 Q100 -226 130 -150 L14 -150 Z`;
    return `<g class="car-bob">${passengers}<path d="${body} ${windows}" fill="#ff8fb8" fill-rule="evenodd"/>` +
      `<path d="M-120 -150 Q-96 -226 -16 -230 L-16 -150 Z M14 -230 Q100 -226 130 -150 L14 -150 Z" fill="#dff3ff" opacity=".25"/>` +
      `<path d="M-200 -110 Q-60 -124 210 -110" stroke="#fff" stroke-width="8" opacity=".45" fill="none" stroke-linecap="round"/>` +
      `<rect x="-60" y="-110" width="26" height="8" rx="4" fill="#d96a95"/><circle cx="238" cy="-70" r="16" fill="#fff3a0"/><circle cx="-244" cy="-70" r="12" fill="#ff5a6e"/>` +
      `<ellipse cx="0" cy="-256" rx="90" ry="14" fill="#fff"/></g>` +
      [-150, 150].map(wx => `<g transform="translate(${wx} 0)"><g class="wheel"><circle r="46" fill="#3d3a4a"/><circle r="22" fill="#d9d9e6"/><rect x="-4" y="-22" width="8" height="44" fill="#9a9aae"/></g></g>`).join('');
  }
  /** The Habit restaurant front: warm windows, awning, glowing sign (#sign gets .glowing) */
  function habit(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">` +
      `<rect x="-320" y="-330" width="640" height="330" rx="30" fill="#f4e6d0"/>` +
      `<path d="M-340 -230 L340 -230 L320 -170 L-320 -170 Z" fill="#c9302a"/>` +
      [-280, -200, -120, -40, 40, 120, 200, 280].map(ax => `<path d="M${ax - 40} -170 Q${ax} -140 ${ax + 40} -170 Z" fill="${(ax / 80) % 2 ? '#fff' : '#c9302a'}"/>`).join('') +
      `<rect x="-270" y="-140" width="200" height="120" rx="20" fill="#ffd36e"/><rect x="70" y="-140" width="200" height="120" rx="20" fill="#ffd36e"/>` +
      `<path d="M-170 -140 V-20 M170 -140 V-20" stroke="#fff4e0" stroke-width="6"/>` +
      `<path d="M-50 0 V-120 Q-50 -150 0 -150 Q50 -150 50 -120 V0 Z" fill="#8a5d48"/><circle cx="30" cy="-60" r="6" fill="#ffd36e"/>` +
      `<g id="sign"><rect x="-230" y="-420" width="460" height="100" rx="26" fill="#2f2a36"/><rect x="-230" y="-420" width="460" height="100" rx="26" fill="#ff5a4a" opacity=".25" class="sign-glow"/>` +
      `<text x="0" y="-352" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="64" fill="#fff4d0">The Habit</text>` +
      `<text x="0" y="-352" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="64" fill="#ffb060" class="sign-glow" opacity=".2">The Habit</text></g>` +
      `<path d="M-330 -330 Q-200 -350 0 -340 Q200 -350 330 -330 L330 -318 Q0 -330 -330 -318 Z" fill="#fff"/>` +
      `</g>`;
  }
  /** diner inside: warm wall, window onto snow, booth seats */
  function diner(uid) {
    let tiles = '';
    for (let x = -700; x < 2300; x += 80) tiles += `<rect x="${x}" y="380" width="40" height="40" fill="#c9302a" opacity=".12"/><rect x="${x + 40}" y="420" width="40" height="40" fill="#c9302a" opacity=".12"/>`;
    return `<rect x="-800" y="-300" width="3200" height="1500" fill="#fff1dc"/>` +
      `<rect x="-800" y="370" width="3200" height="200" fill="#fff8ee"/>` + tiles +
      `<rect x="-800" y="560" width="3200" height="600" fill="#a86a4f"/>` +
      `<g transform="translate(800 70)"><rect x="-330" y="0" width="660" height="230" rx="40" fill="#bfe3f7"/>` +
      `<path d="M-330 170 Q0 130 330 170 L330 190 Q330 230 290 230 L-290 230 Q-330 230 -330 190 Z" fill="#fff"/>` +
      P.snowyPine(-180, 180, 110, '#7fb5a0') + P.snowyPine(200, 180, 90, '#86b9a6') +
      `<rect x="-330" y="0" width="660" height="230" rx="40" fill="none" stroke="#c9302a" stroke-width="14"/></g>` +
      `<path d="M-800 0 Q800 30 2400 0" stroke="#3f9a6e" stroke-width="8" fill="none"/>` + P.lights(-200, 10, 300, 50, 800, 10, 10, 41) + P.lights(800, 10, 1300, 50, 1800, 10, 10, 42) +
      `<rect x="160" y="300" width="1280" height="260" rx="50" fill="#c9302a"/><rect x="190" y="320" width="1220" height="60" rx="30" fill="#e0453c"/>`;
  }
  /** the table front (drawn in front of the diners) */
  function table(x0 = 260, x1 = 1340, y = 560) {
    return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="40" rx="18" fill="#f4f4f8"/><rect x="${x0 + 20}" y="${y + 36}" width="${x1 - x0 - 40}" height="260" fill="#e3e3ec"/>` +
      `<path d="M${x0 + 20} ${y + 70} H${x1 - 20}" stroke="#c9302a" stroke-width="10"/>`;
  }
  function charburger(x, y, s = 1, id = '') {
    let seeds = '';
    [[-30, -64], [-6, -72], [20, -66], [38, -56], [-44, -52], [8, -58]].forEach(([sx, sy]) => { seeds += `<ellipse cx="${sx}" cy="${sy}" rx="4" ry="2.4" fill="#fff4d0"/>`; });
    return `<g transform="translate(${x} ${y}) scale(${s})"><g ${id ? `id="${id}"` : ''} class="dup"><ellipse cx="0" cy="0" rx="72" ry="10" fill="#000" opacity=".12"/>` +
      `<rect x="-62" y="-22" width="124" height="22" rx="11" fill="#e8a85a"/><rect x="-66" y="-38" width="132" height="20" rx="10" fill="#6b3a2a"/>` +
      `<path d="M-66 -40 L66 -40 L52 -24 L36 -34 L20 -22 L4 -34 L-12 -22 L-28 -34 L-44 -22 L-58 -32 Z" fill="#ffc83d"/>` +
      `<path d="M-70 -42 Q-50 -54 -30 -44 Q-10 -56 10 -44 Q30 -56 50 -44 Q62 -52 72 -42 L70 -38 L-70 -38 Z" fill="#7fcf5a"/>` +
      `<rect x="-58" y="-50" width="116" height="10" rx="5" fill="#e8453c"/>` +
      `<path d="M-64 -48 Q-64 -96 0 -98 Q64 -96 64 -48 Z" fill="#e8a85a"/>` + seeds +
      `<g class="sizzle"><path d="M-20 -110 q-8 -12 0 -24 q8 -12 0 -24 M10 -110 q-8 -12 0 -24 q8 -12 0 -24" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/></g></g></g>`;
  }
  function juice(x, y, s = 1, id = '', side = '') {
    return `<g transform="translate(${x} ${y}) scale(${s})"><g ${id ? `id="${id}"` : ''} class="dup"><g class="clink ${side}">` +
      `<path d="M-30 -110 L30 -110 L22 0 L-22 0 Z" fill="#dff3ff" opacity=".7"/><path d="M-27 -86 L27 -86 L22 -4 L-22 -4 Z" fill="#ffb238"/>` +
      `<path d="M-27 -86 L27 -86 L25 -60 L-25 -60 Z" fill="#ff7a5a" opacity=".6"/><circle cx="-12" cy="-40" r="4" fill="#fff" opacity=".6"/>` +
      `<path d="M10 -150 L4 -86" stroke="#ff5a8a" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="M-40 -116 Q-10 -150 20 -116 Z" fill="#8fdcb6"/><path d="M-10 -128 L-10 -100" stroke="#8a5d48" stroke-width="3"/>` +
      `<circle cx="26" cy="-108" r="12" fill="#ffd84d"/><circle cx="26" cy="-108" r="7" fill="#fff3a0"/></g></g></g>`;
  }
  function fries(x, y, s = 1, id = '') {
    let f = '';
    [-26, -14, -2, 10, 22, -20, 4, 16].forEach((fx, k) => { f += `<rect x="${fx}" y="${-110 - (k % 3) * 12}" width="10" height="70" rx="4" fill="#ffd36e" transform="rotate(${(k - 4) * 3} ${fx} -60)"/>`; });
    return `<g transform="translate(${x} ${y}) scale(${s})"><g ${id ? `id="${id}"` : ''} class="dup">${f}<path d="M-42 -70 L42 -70 L32 0 L-32 0 Z" fill="#e8453c"/>` +
      `<path d="${P.heartPath}" transform="translate(0 -32) scale(.6)" fill="#fff"/></g></g>`;
  }
  function onionRings(x, y, s = 1, id = '') {
    let r = '';
    [[0, -16], [-22, -40], [20, -44], [-2, -66]].forEach(([rx, ry]) => { r += `<ellipse cx="${rx}" cy="${ry}" rx="30" ry="18" fill="none" stroke="#d99a4a" stroke-width="14"/><ellipse cx="${rx}" cy="${ry}" rx="30" ry="18" fill="none" stroke="#f0c070" stroke-width="5"/>`; });
    return `<g transform="translate(${x} ${y}) scale(${s})"><g ${id ? `id="${id}"` : ''} class="dup"><ellipse cx="0" cy="0" rx="62" ry="14" fill="#fff"/>${r}</g></g>`;
  }
  function greenBeans(x, y, s = 1, id = '') {
    let b = '';
    for (let k = 0; k < 9; k++) b += `<path d="M${-40 + k * 10} ${-20 - (k % 3) * 8} q${8 + (k % 2) * 6} -22 ${20 + (k % 3) * 4} -30" stroke="${k % 2 ? '#4fb35a' : '#67c66f'}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})"><g ${id ? `id="${id}"` : ''} class="dup">${b}<path d="M-56 -26 Q0 -30 56 -26 Q48 4 0 4 Q-48 4 -56 -26 Z" fill="#fff"/><path d="M-56 -26 Q0 -30 56 -26" stroke="#9fd3f5" stroke-width="4" fill="none"/></g></g>`;
  }

  Object.assign(P, { doorBack, doorLeaf, house, room, classroom, lolShelf, lol, xmasTree, present, cake, bubble, friendsIcon, mintCandy, glitterJar, snowbird, bffSign, car, habit, diner, table, charburger, juice, fries, onionRings, greenBeans, star5 });
})();
