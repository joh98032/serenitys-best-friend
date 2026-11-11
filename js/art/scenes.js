/* Scene builders. Each returns:
   { bg, cam:{x, y, s, z, n:{...narrow-screen target}}, mood,
     layers:[{depth, pan?, svg, cut?, sh?, cls?}],
     enter(ctx), start(ctx), end(ctx), act:{name(ctx)} }
   Main action stands on a ground line around y = 650 so it stays above the caption band.
   Performance rule: anything that animates all the time (Labubus, lights, flames) goes in a layer with
   cut: false (no soft drop-shadow effect), so only that layer is repainted every frame. */
BOOK.scenes = (function () {
  const P = BOOK.parts;

  /* ---------- shared helpers (also used by scenes2.js) ---------- */
  const SERENITY = { who: 'serenity', id: 'serenity', glitterEyes: true, greenTooth: 3, sparkleToes: true };
  const LOVE = { who: 'love', id: 'love' };
  const MOM = { who: 'mom', id: 'mom' };
  /** a Labubu: kit.lb(uid, base, x, y, s, facing, extra) */
  const lb = (uid, base, x, y, s, facing = 'right', extra = {}) => P.labubu(Object.assign({ uid, x, y, s, facing }, base, extra));
  const mate = (uid, who, x, y, s, facing, extra = {}) => lb(uid, { who, id: who }, x, y, s, facing, extra);
  const show = (ctx, sel) => ctx.add(sel, 'shown');
  const cls = (ctx, sel, add, remove) => { const el = ctx.q(sel); if (!el) return; if (remove) el.classList.remove(...remove.split(' ')); if (add) el.classList.add(...add.split(' ')); };
  const move = (ctx, id, x, y = 0) => { const m = ctx.q('#' + id + '-mover'); if (m) m.style.transform = `translate(${x}px, ${y}px)`; };
  const once = (ctx, sel, c, ms) => { cls(ctx, sel, c); ctx.later(() => cls(ctx, sel, null, c), ms); };
  const hearts = (x, y, n = 4, seed = 1) => {
    const cols = ['#ff6f9c', '#ff8a80', '#ffb3d1', '#e2457a']; let h = '';
    for (let k = 0; k < n; k++) h += P.heart(x + (k - n / 2) * 40 + (k % 2) * 10, y - (k % 3) * 26, .5 + ((k + seed) % 3) * .15, cols[(k + seed) % 4], k * .15);
    return h;
  };
  const sparkles = (pts, r = 36) => pts.map(([x, y], k) => P.spark(x, y, r - (k % 3) * 8, ['#fff6c2', '#ffd1e6', '#b8f0d6'][k % 3])).join('');

  /** snowy outdoor backdrop as layers: sky, far pines, distant snow, (optional) buildings, near snow ground */
  function outdoor(uid, { sky = [[0, '#a9d8f5'], [.6, '#e3f1fb'], [1, '#ffe3ee']], sun = true, build = '', ground = 652, seed = 1, fence = false } = {}) {
    return [
      { depth: .03, cut: false, svg: P.sky('sk' + uid, sky) + (sun ? P.glow('sun' + uid, 1260, 160, 220, '#fff4d0', .9) : '') },
      { depth: .12, sh: 2, svg: P.hills({ y: 470, amp: 26, color: '#e4eef9', seed: seed + 3 }) + P.pineRow({ y: 485, color: '#86b9a6', hmin: 80, hmax: 130, gap: 120, seed: seed + 4 }) },
      { depth: .2, cut: false, svg: P.snowfall(seed, 30, { size: [1.5, 3], op: .7, speed: [14, 22] }) },
      { depth: .32, sh: 3, svg: P.hills({ y: 548, amp: 18, color: '#f1f6fd', seed: seed + 9 }) + build },
      { depth: .4, cut: false, svg: P.snowfall(seed + 1, 26, { size: [2, 4.5], op: .85, speed: [11, 17] }) },
      ...(fence ? [{ depth: .62, sh: 4, svg: P.hills({ y: 606, amp: 10, color: '#f7fbff', seed: seed + 6 }) + P.fence(-560, 2240, 616) }] : []),
      { depth: 1, sh: 6, svg: P.hills({ y: ground, amp: 12, color: '#ffffff', seed: seed + 2, step: 320 }) + `<ellipse cx="820" cy="${ground + 48}" rx="700" ry="26" fill="#e3edf9" opacity=".7"/>` }
    ];
  }
  const snowFront = (seed = 3) => [
    { depth: 1.3, sh: 8, svg: P.hills({ y: 820, amp: 40, color: '#ffffff', seed: seed + 18, step: 380 }) },
    { depth: 1.55, cut: false, svg: P.snowfall(seed + 2, 18, { size: [5, 9], op: .95, speed: [7, 11] }) }
  ];
  /** the schoolyard used on pages 18–21: school, fence, the big tree with lights and the log bench */
  function yard(uid, extraGround = '') {
    return [
      ...outdoor(uid, { build: P.school(430, 552, .6, uid) + P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 12, x0: 820, x1: 2200 }) + P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 13, x0: -600, x1: 160 }), fence: true, seed: 1 }).slice(0, -1),
      { depth: 1, cut: false, svg: `<g id="bigtree">${P.bigTree(1210, 652, uid)}</g>` },
      { depth: 1, sh: 6, svg: P.hills({ y: 652, amp: 12, color: '#ffffff', seed: 3, step: 320 }) + `<ellipse cx="820" cy="700" rx="700" ry="26" fill="#e3edf9" opacity=".7"/>` + extraGround + P.logBench(1010, 600, 250) }
    ];
  }
  const kit = { SERENITY, LOVE, MOM, lb, mate, show, cls, move, once, hearts, sparkles, outdoor, snowFront, yard };

  /* ================= PLACEHOLDER ================= */
  function placeholder(def, i) {
    const tag = `<g transform="translate(800 230) rotate(-2)"><rect x="-210" y="-30" width="420" height="60" rx="30" fill="#ffffff"/>` +
      `<text x="0" y="9" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="26" font-weight="600" fill="#5a6b8a">Picture coming soon · page ${i + 1}</text></g>`;
    return { bg: '#bfe0f5', layers: [...outdoor('ph' + i, { seed: i }), { depth: 1.2, cut: false, svg: tag }, ...snowFront(i)] };
  }

  /* ================= 1. COVER ================= */
  function cover(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#cfe8f7', mood: 'calm',
      cam: { x: 800, y: 400, s: 1.05, z: .05, n: { x: 820, s: 1.05 } },
      layers: [
        ...outdoor(uid, { build: P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 5 }), seed: 2 }),
        { depth: 1, sh: 6, svg: P.house(1010, 650, .82) },
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 600, 664, .85, 'right', { cls: 'wave grin' }) },
        ...snowFront(2)
      ]
    };
  }

  /* ================= 2. A LITTLE LABUBU NAMED SERENITY ================= */
  function mintBall(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#cfe8f7',
      cam: { x: 800, y: 410, s: 1.05, z: .05, n: { x: 760, s: 1.05 } },
      layers: [
        ...outdoor(uid, { build: P.house(260, 560, .45) + P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 15, x0: 500, x1: 2200 }), seed: 4 }),
        {
          depth: 1, cut: false, svg:
            lb(uid, SERENITY, 720, 664, .85, 'right', { cls: 'ball roll', moverStyle: 'transform:translate(-1100px,0)' }) +
            `<g transform="translate(990 600)"><g id="mint" class="dup"><g class="a-float" style="--dur:.7s;--amt:14px">${P.mintCandy(0, 0, 48)}</g></g></g>`
        },
        ...snowFront(4)
      ],
      act: {
        roll(ctx) { move(ctx, 'serenity', 0); ctx.sfx('whoosh'); ctx.later(() => { cls(ctx, '#serenity', 'jump grin', 'ball roll'); ctx.sfx('squeak'); }, 1250); ctx.later(() => cls(ctx, '#serenity', 'wave', 'jump'), 2100); },
        mint(ctx) { show(ctx, '#mint'); ctx.sfx('pop'); },
        ball(ctx) { ctx.fx('#serenity', sparkles([[990, 540], [1050, 600], [940, 640]], 30), 1200); ctx.sfx('sparkle'); }
      }
    };
  }

  /* ================= 3. TOENAILS AND GLITTER EYES ================= */
  function sparkleEyes(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#cfe8f7',
      cam: { x: 800, y: 600, s: 2.1, z: .03, n: { x: 800, s: 2.1 } },
      layers: [
        ...outdoor(uid, { seed: 6, build: P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 7 }) }),
        { depth: 1, sh: 6, svg: `<ellipse cx="1010" cy="660" rx="90" ry="30" fill="#fff"/>` },
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 800, 668, 1.05, 'right') + `<g id="jarwrap">${P.glitterJar(1010, 650)}</g>` },
        ...snowFront(6)
      ],
      act: {
        toes(ctx) { cls(ctx, '#serenity', 'wiggle-toes'); ctx.sfx('sparkle'); ctx.fx('#serenity', sparkles([[740, 650], [860, 650], [800, 640]], 22), 1200); ctx.later(() => cls(ctx, '#serenity', null, 'wiggle-toes'), 1500); },
        eyes(ctx) { ctx.look(800, 440, 2, { x: 800, s: 2 }); cls(ctx, '#serenity', 'look-up'); },
        glitter(ctx) {
          ctx.look(880, 470, 1.45, { x: 860, s: 1.5 });
          cls(ctx, '#jarwrap', 'tipped'); ctx.sfx('magic');
          ctx.later(() => {
            ctx.fx('#serenity', P.joyBurst(960, 520, 30, 3), 2600);
            ctx.fx('#serenity', sparkles([[770, 430], [830, 430], [740, 400], [860, 400]], 26), 1600);
            cls(ctx, '#serenity', 'grin', 'look-up');
          }, 450);
        }
      }
    };
  }

  /* ================= 4. GREEN TOOTH, GREEN NOSE, BIG SMILE ================= */
  function smile(def, i) {
    const uid = 'p' + i, s = 1.2, X = 800, Y = 720;
    const at = (lx, ly) => [X + lx * s, Y + ly * s];
    return {
      bg: '#cfe8f7',
      cam: { x: 800, y: 470, s: 2.2, z: .03, n: { x: 800, s: 2.3 } },
      layers: [
        ...outdoor(uid, { seed: 8 }),
        { depth: 1, cut: false, svg: lb(uid, SERENITY, X, Y, s, 'right') },
        ...snowFront(8).slice(1)
      ],
      act: {
        tooth(ctx) { const [x, y] = at(19, -160); ctx.fx('#serenity', P.spark(x, y, 26) + P.spark(x + 14, y - 10, 14, '#b8f0d6'), 1000); ctx.sfx('sparkle'); },
        nose(ctx) { const [x, y] = at(0, -184); ctx.fx('#serenity', P.spark(x, y, 28, '#b8f0d6'), 1000); ctx.sfx('pop'); },
        smile(ctx) { cls(ctx, '#serenity', 'grin'); ctx.look(800, 500, 1.6, { x: 800, s: 1.7 }); ctx.fx('#serenity', hearts(800, 330, 5, 2), 2400); ctx.sfx('heart'); }
      }
    };
  }

  /* ================= 5. A KIND LITTLE LABUBU ================= */
  function kind(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#cfe8f7',
      cam: { x: 820, y: 420, s: 1.15, z: .05, n: { x: 860, s: 1.2 } },
      layers: [
        ...outdoor(uid, { seed: 10, build: P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 11 }) }),
        {
          depth: 1, cut: false, svg: lb(uid, SERENITY, 660, 664, .85, 'right') +
            `<g transform="translate(940 660)"><g id="bird" class="lb-mover">${P.snowbird(0, 0, 1.3)}</g></g>` +
            `<path id="drift" d="M860 668 Q880 610 940 620 Q1000 610 1020 668 Z" fill="#ffffff"/>`
        },
        ...snowFront(10)
      ],
      act: {
        kind(ctx) {
          move(ctx, 'serenity', 150); cls(ctx, '#serenity', 'walking');
          ctx.later(() => { cls(ctx, '#serenity', 'hold', 'walking'); ctx.q('#bird').style.transform = 'translate(-115px, -46px)'; ctx.sfx('squeak'); }, 1100);
          ctx.later(() => { ctx.fx('#serenity', hearts(860, 380, 4, 1), 2400); ctx.sfx('heart'); cls(ctx, '#serenity', 'grin'); }, 1700);
        }
      }
    };
  }

  /* ================= 6. NO FRIENDS YET ================= */
  function alone(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#d6e4f2',
      cam: { x: 800, y: 410, s: 1.05, z: .05, n: { x: 700, s: 1.05 } },
      layers: [
        ...outdoor(uid, { seed: 12, sky: [[0, '#b9d3ea'], [.6, '#e3ebf5'], [1, '#f2e6ef']], sun: false, build: P.house(330, 560, .45) + P.house(1300, 560, .4) }),
        {
          depth: 1, cut: false, svg:
            mate(uid, 'pink', 1450, 664, .74, 'left', { cls: 'walking', id: 'kidA' }) + mate(uid, 'lavender', 1640, 664, .7, 'left', { cls: 'walking', id: 'kidB' }) +
            lb(uid, SERENITY, 620, 664, .82, 'right')
        },
        ...snowFront(12)
      ],
      enter(ctx) { ['kidA', 'kidB'].forEach(k => { const m = ctx.q('#' + k + '-mover'); m.classList.add('walker'); }); },
      act: {
        nice(ctx) { move(ctx, 'kidA', -2200); move(ctx, 'kidB', -2200); cls(ctx, '#serenity', 'wave grin'); ctx.sfx('squeak'); },
        friends(ctx) { cls(ctx, '#serenity', 'sad', 'wave grin'); }
      }
    };
  }

  /* ================= 7. ASKING MOM ================= */
  function askMom(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#ffe7d1', mood: 'shy',
      cam: { x: 760, y: 400, s: 1.08, z: .05, n: { x: 760, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.room(uid, { fireplace: 290, window: 1200 }) },
        { depth: 1, cut: false, svg: lb(uid, MOM, 600, 676, 1.05, 'right') + lb(uid, SERENITY, 930, 676, .78, 'left') }
      ],
      act: {
        talked(ctx) { cls(ctx, '#serenity', 'tug look-up'); ctx.later(() => cls(ctx, '#mom', 'tilt'), 600); },
        mom(ctx) { cls(ctx, '#mom', 'look-down'); },
        friends(ctx) { cls(ctx, '#serenity', 'sad', 'tug'); }
      }
    };
  }

  /* ================= 8. "SOON, SERENITY." ================= */
  function momHug(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#ffe7d1',
      cam: { x: 820, y: 400, s: 1.08, z: .05, n: { x: 760, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.room(uid, { fireplace: 250, window: 820 }) + P.doorBack(1350) },
        {
          depth: 1, cut: false, svg: P.doorLeaf(1350) + lb(uid, MOM, 640, 676, 1.05, 'right', { cls: 'tilt' }) +
            lb(uid, SERENITY, 880, 676, .78, 'left', { cls: 'sad', backpack: '#9fd3f5' })
        }
      ],
      act: {
        soon(ctx) { cls(ctx, '#mom', 'grin', 'tilt'); cls(ctx, '#serenity', 'look-up', 'sad'); },
        love(ctx) {
          move(ctx, 'serenity', -90); cls(ctx, '#serenity', 'hug squeeze grin'); cls(ctx, '#mom', 'hug squeeze');
          ctx.sfx('hug'); ctx.fx('#mom', hearts(720, 300, 4, 2), 2400);
        },
        school(ctx) {
          cls(ctx, '#mom', 'wave', 'hug squeeze'); cls(ctx, '#serenity', 'walking', 'hug squeeze');
          cls(ctx, '#door', 'open'); ctx.sfx('whoosh');
          const m = ctx.q('#serenity-mover'); m.style.transition = 'transform 2.6s ease-in-out, opacity .6s 2.2s'; m.style.transform = 'translate(470px, -30px) scale(-.85, .85)';   // turn around and head out the door m.style.opacity = '0';
        }
      }
    };
  }

  /* ================= 9. TK ================= */
  function school(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#fdf1d8',
      cam: { x: 820, y: 400, s: 1.05, z: .05, n: { x: 1000, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.classroom(uid, { doorX: null }) + P.doorBack(1380) },
        {
          depth: 1, cut: false, svg: P.doorLeaf(1380) +
            lb(uid, { who: 'teacher', id: 'teacher' }, 260, 690, .95, 'right', { glasses: '#6b4a3a', scarf: '#ff8fb8' }) +
            mate(uid, 'pink', 470, 690, .66, 'right') + mate(uid, 'peach', 610, 690, .64, 'right') + mate(uid, 'sky', 1150, 690, .66, 'left') +
            lb(uid, SERENITY, 1380, 690, .74, 'left', { backpack: '#9fd3f5', moverStyle: 'opacity:0' })
        }
      ],
      act: {
        school(ctx) {
          cls(ctx, '#door', 'open'); ctx.sfx('whoosh');
          const m = ctx.q('#serenity-mover'); m.style.opacity = '1'; cls(ctx, '#serenity', 'walking');
          ctx.later(() => { m.style.transform = 'translate(-480px, 0)'; }, 250);
          ctx.later(() => { cls(ctx, '#serenity', 'wave grin', 'walking'); cls(ctx, '#door', null, 'open'); }, 1500);
        },
        fun(ctx) { ['#pink', '#peach', '#sky'].forEach((s, k) => ctx.later(() => cls(ctx, s, 'bounce grin'), k * 150)); cls(ctx, '#teacher', 'wave'); ctx.sfx('cheer'); },
        loved(ctx) { once(ctx, '#serenity', 'jump', 850); ctx.fx('#serenity', hearts(900, 330, 4, 0), 2400); ctx.sfx('heart'); }
      }
    };
  }

  /* ================= 10. LOLs! ================= */
  function lols(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#fdf1d8',
      cam: { x: 820, y: 400, s: 1.05, z: .05, n: { x: 700, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.classroom(uid, { doorX: 1460 }) },
        { depth: .6, cut: false, svg: P.lolShelf(1000, 470, uid) },
        {
          depth: 1, cut: false, svg: mate(uid, 'lavender', 300, 690, .64, 'right') +
            lb(uid, SERENITY, 640, 690, .78, 'right', { cls: 'look-up' }) +
            `<g id="hugdoll" class="dup">${P.lol(646, 704, .5, '#ff9fd6', '#c7b2f0', uid + 'h')}</g>`
        }
      ],
      act: {
        lols(ctx) { [0, 1, 2, 3, 4].forEach(k => ctx.later(() => { show(ctx, '#lol' + k); ctx.sfx('pop'); }, k * 160)); ctx.later(() => { ctx.fx('#serenity', sparkles([[760, 300], [1000, 280], [1240, 310]], 34), 1200); ctx.sfx('sparkle'); }, 850); },
        happy(ctx) {
          cls(ctx, '#serenity', 'spin grin', 'look-up'); ctx.sfx('squeak');
          ctx.later(() => { cls(ctx, '#serenity', 'hold', 'spin'); show(ctx, '#hugdoll'); ctx.fx('#serenity', hearts(640, 330, 4, 1), 2400); ctx.sfx('heart'); }, 950);
        }
      }
    };
  }

  /* ================= 11. CHRISTMAS ================= */
  function christmas(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#ffe7d1',
      cam: { x: 820, y: 390, s: 1.05, z: .05, n: { x: 820, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.room(uid, { fireplace: 250, window: 1330 }) },
        { depth: .7, cut: false, svg: `<g id="tree" class="lights-off">${P.xmasTree(900, 600, 1, uid)}</g>` + P.present(760, 640, 90, 70, '#ff8fb8', '#ffd36e') + P.present(1050, 646, 110, 80, '#9fd3f5', '#ff5a6e') },
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 520, 690, .8, 'right', { cls: 'look-up' }) }
      ],
      act: {
        christmas(ctx) { cls(ctx, '#tree', null, 'lights-off'); ctx.sfx('jingle'); },
        best(ctx) { cls(ctx, '#tstar', 'lit'); ctx.fx('#serenity', sparkles([[900, 150], [860, 190], [950, 180]], 34), 1200); ctx.sfx('sparkle'); },
        loved(ctx) { cls(ctx, '#serenity', 'bounce grin', 'look-up'); ctx.fx('#serenity', hearts(520, 330, 4, 3), 2400); }
      }
    };
  }

  /* ================= 12. BIRTHDAY ON CHRISTMAS DAY ================= */
  function birthday(def, i) {
    const uid = 'p' + i;
    const bunting = (() => { let s = `<path d="M150 70 Q800 160 1450 70" stroke="#c98a6d" stroke-width="5" fill="none"/>`; const cols = ['#ff8fb8', '#8fdcb6', '#ffd36e', '#9fd3f5', '#c7b2f0']; for (let k = 0; k < 13; k++) { const t = (k + .5) / 13, x = 150 + 1300 * t, y = 70 + 2 * t * (1 - t) * 90 * 2 * .5; s += `<path d="M${x - 26} ${y} L${x + 26} ${y} L${x} ${y + 50} Z" fill="${cols[k % 5]}"/>`; } return s; })();
    const pr = [['#ff8fb8', '#ffd36e', 90, 70], ['#9fd3f5', '#ff5a6e', 110, 84], ['#c7b2f0', '#8fdcb6', 80, 60]];
    let first = '', second = '';
    pr.forEach(([b, r, w, h], k) => { first += P.present(980 + k * 110, 650, w, h, b, r); second += P.present(1000 + k * 110, 650 - h - 6, w * .9, h * .9, r, b, 'dup', 'dbl' + k); });
    return {
      bg: '#ffe7d1',
      cam: { x: 820, y: 400, s: 1.05, z: .05, n: { x: 760, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.room(uid, { fireplace: null, window: 380 }) + bunting },
        { depth: .7, cut: false, svg: P.xmasTree(1130, 590, .85, uid) },
        { depth: 1, cut: false, svg: `<rect x="520" y="600" width="260" height="20" rx="10" fill="#c98a6d"/><rect x="560" y="618" width="20" height="80" fill="#a86a4f"/><rect x="720" y="618" width="20" height="80" fill="#a86a4f"/>` + P.cake(650, 600, .9) + first + second + lb(uid, SERENITY, 360, 690, .8, 'right') }
      ],
      act: {
        birthday(ctx) { ctx.fx('#serenity', sparkles([[650, 400], [600, 430], [700, 420]], 26), 1200); ctx.sfx('sparkle'); cls(ctx, '#serenity', 'grin'); },
        double(ctx) { [0, 1, 2].forEach(k => ctx.later(() => { show(ctx, '#dbl' + k); ctx.sfx('pop'); }, k * 220)); },
        presents(ctx) { cls(ctx, '#serenity', 'bounce'); ctx.sfx('jingle'); }
      }
    };
  }

  /* ================= 13. THE WISH ================= */
  function wish(def, i) {
    const uid = 'p' + i;
    const pics = `<g id="pic1" class="bubble-pic">${P.friendsIcon(-80, 50, .9, '#8fdcb6', '#c9c9d6')}</g><g id="pic2" class="bubble-pic">${P.lol(90, 60, .42, '#ffd36e', '#ff6f9c', uid + 'w')}</g>`;
    return {
      bg: '#f7d7c4',
      cam: { x: 860, y: 400, s: 1.1, z: .04, n: { x: 750, s: 1.05 } },
      layers: [
        { depth: .3, sh: 3, svg: P.room(uid, { fireplace: null, window: 300, wall: '#f6d6c0', wall2: '#f0cbb2' }) },
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 880, 700, .9, 'left') + `<rect x="400" y="610" width="420" height="24" rx="12" fill="#c98a6d"/>` + P.cake(620, 612, .9) },
        { depth: 1.1, cut: false, svg: P.bubble(1150, 230, 360, 250, 'wishb', pics) }
      ],
      act: {
        wished(ctx) { cls(ctx, '#serenity', 'eyes-closed blow'); ctx.later(() => { cls(ctx, '#cake', 'out'); ctx.sfx('whoosh'); }, 500); ctx.later(() => cls(ctx, '#serenity', null, 'blow'), 1300); },
        two(ctx) { show(ctx, '#wishb'); ctx.sfx('magic'); },
        friend(ctx) { show(ctx, '#pic1'); ctx.sfx('heart'); },
        lol(ctx) { show(ctx, '#pic2'); ctx.sfx('sparkle'); ctx.later(() => cls(ctx, '#serenity', 'grin', 'eyes-closed'), 800); }
      }
    };
  }

  return Object.assign({ kit, placeholder, cover, mintBall, sparkleEyes, smile, kind, alone, askMom, momHug, school, lols, christmas, birthday, wish });
})();
