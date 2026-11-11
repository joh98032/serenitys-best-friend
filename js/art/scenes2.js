/* Scene builders for pages 14–26 (Love arrives, the schoolyard, The Habit, The End). */
(function () {
  const P = BOOK.parts;
  const { SERENITY, LOVE, MOM, lb, mate, show, cls, move, once, hearts, sparkles, outdoor, snowFront, yard } = BOOK.scenes.kit;

  /** the classroom with the door as two pieces, so someone can stand in the doorway */
  const classBack = (uid, doorX = 1380) => ({ depth: .3, sh: 3, svg: P.classroom(uid, { doorX: null }) + P.doorBack(doorX) });
  const kids = uid => mate(uid, 'pink', 300, 690, .64, 'right', { id: 'kidA' }) + mate(uid, 'peach', 440, 690, .62, 'right', { id: 'kidB' });

  /* ================= 14. A NEW KID ================= */
  function newKid(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#fdf1d8',
      cam: { x: 900, y: 400, s: 1.05, z: .05, n: { x: 1100, s: 1.05 } },
      layers: [
        classBack(uid),
        {
          depth: 1, cut: false, svg: P.doorLeaf(1380) + kids(uid) + lb(uid, SERENITY, 700, 690, .76, 'right') +
            lb(uid, LOVE, 1400, 690, .7, 'left', { cls: 'shy', moverStyle: 'transform:translate(60px,0)' })
        }
      ],
      act: {
        door(ctx) {
          cls(ctx, '#door', 'open'); ctx.sfx('whoosh');
          ctx.fx('#serenity', P.snowfall(77, 30, { size: [3, 7], x0: 1250, x1: 1500, speed: [2, 3] }), 2200);
          ['#serenity', '#kidA', '#kidB'].forEach(s => cls(ctx, s, 'look-up'));
        },
        love(ctx) { move(ctx, 'love', -40); cls(ctx, '#love', 'peek', 'shy'); ctx.sfx('squeak'); ctx.fx('#love', sparkles([[1360, 380]], 30), 1000); }
      }
    };
  }

  /* ================= 15. ALL RED ================= */
  function allRed(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#fdf1d8',
      cam: { x: 860, y: 400, s: 1.08, z: .05, n: { x: 980, s: 1.1 } },
      layers: [
        classBack(uid),
        { depth: 1, cut: false, svg: P.doorLeaf(1380) + kids(uid) + lb(uid, SERENITY, 640, 690, .76, 'right', { cls: 'look-up' }) + lb(uid, LOVE, 1000, 690, .78, 'left', { cls: 'tilt' }) }
      ],
      act: {
        pretty(ctx) { ctx.fx('#love', sparkles([[920, 330], [1080, 340], [1000, 280]], 32), 1200); ctx.sfx('sparkle'); cls(ctx, '#love', 'grin', 'tilt'); },
        light(ctx) { cls(ctx, '#love', 'tint-light'); ctx.sfx('pop'); },
        dark(ctx) { cls(ctx, '#love', 'tint-dark', 'tint-light'); ctx.sfx('pop'); },
        between(ctx) {
          cls(ctx, '#love', null, 'tint-dark');
          [0, 1, 2, 3].forEach(k => ctx.later(() => cls(ctx, '#love', k % 2 ? 'tint-dark' : 'tint-light', k % 2 ? 'tint-light' : 'tint-dark'), 200 + k * 260));
          ctx.later(() => { cls(ctx, '#love', 'jump', 'tint-light tint-dark'); ctx.fx('#love', hearts(1000, 330, 4, 0), 2400); ctx.sfx('heart'); }, 1300);
        }
      }
    };
  }

  /* ================= 16. HELLO! ================= */
  function greet(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#fdf1d8',
      cam: { x: 820, y: 390, s: 1.08, z: .05, n: { x: 760, s: 1.05 } },
      layers: [
        classBack(uid),
        { depth: 1, cut: false, svg: P.doorLeaf(1380) + kids(uid) + lb(uid, SERENITY, 640, 690, .78, 'right') + lb(uid, LOVE, 980, 690, .76, 'left', { cls: 'look-down' }) },
        { depth: 1.1, cut: false, svg: P.bubble(830, 255, 270, 190, 'dream', P.friendsIcon(0, 66, .8, '#8fdcb6', '#e2453f')) }
      ],
      act: {
        greeted(ctx) { cls(ctx, '#serenity', 'wave bounce grin'); ctx.sfx('squeak'); },
        best(ctx) { show(ctx, '#dream'); ctx.sfx('magic'); }
      }
    };
  }

  /* ================= 17. SHY, JUST LIKE SERENITY ================= */
  function shy(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#fdf1d8', mood: 'shy',
      cam: { x: 820, y: 390, s: 1.08, z: .05, n: { x: 900, s: 1.05 } },
      layers: [
        classBack(uid),
        { depth: 1, cut: false, svg: P.doorLeaf(1380) + kids(uid) + lb(uid, SERENITY, 640, 690, .78, 'right', { cls: 'grin' }) + lb(uid, LOVE, 980, 690, .76, 'left', { cls: 'reading look-down', book: '#e2457a' }) },
        { depth: 1.1, cut: false, svg: P.bubble(830, 255, 270, 190, 'dream', P.friendsIcon(0, 66, .8, '#8fdcb6', '#e2453f')) }
      ],
      enter(ctx) { show(ctx, '#dream'); },
      act: {
        shy(ctx) { cls(ctx, '#love', 'book-up'); ctx.sfx('whoosh'); },
        friends(ctx) {
          ctx.q('#dream').classList.remove('shown');
          ctx.fx('#serenity', sparkles([[830, 255], [770, 225], [900, 285]], 40), 900); ctx.sfx('pop');
          cls(ctx, '#serenity', 'sad', 'grin');
        }
      }
    };
  }

  /* ================= 18. BY HERSELF UNDER THE BIG TREE ================= */
  function tree(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#cfe8f7', mood: 'shy',
      cam: { x: 900, y: 400, s: 1.05, z: .05, n: { x: 1050, s: 1.05 } },
      layers: [
        ...yard(uid),
        { depth: 1, cut: false, svg: lb(uid, LOVE, 1000, 612, .78, 'left', { cls: 'reading look-down', book: '#e2457a' }) },
        ...snowFront(3)
      ],
      act: {
        herself(ctx) { ctx.look(1060, 420, 1.35, { x: 1040, s: 1.3 }); },
        tree(ctx) { cls(ctx, '#bigtree', 'party'); ctx.sfx('sparkle'); ctx.later(() => cls(ctx, '#bigtree', null, 'party'), 2200); }
      }
    };
  }

  /* ================= 19. SERENITY WALKS RIGHT UP TO HER ================= */
  function walkUp(def, i) {
    const uid = 'p' + i;
    let steps = '';
    for (let k = 0; k < 10; k++) steps += `<ellipse class="foot-show" id="fp${k}" cx="${170 + k * 44}" cy="${688 + (k % 2 ? 8 : -6)}" rx="13" ry="6" fill="#c8d9ee"/>`;
    return {
      bg: '#cfe8f7',
      cam: { x: 800, y: 400, s: 1.05, z: .05, n: { x: 420, s: 1.05 } },
      layers: [
        ...yard(uid, steps),
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 600, 662, .82, 'right', { moverStyle: 'transform:translate(-440px,0)' }) + lb(uid, LOVE, 1000, 612, .78, 'left', { cls: 'reading look-down', book: '#e2457a' }) },
        ...snowFront(3)
      ],
      act: {
        saw(ctx) { cls(ctx, '#serenity', 'tilt'); },
        walked(ctx) {
          cls(ctx, '#serenity', 'walking', 'tilt'); const m = ctx.q('#serenity-mover'); m.style.transition = 'transform 2.4s linear'; move(ctx, 'serenity', 0);
          ctx.look(800, 400, 1.05, { x: 760, s: 1.05 });
          for (let k = 0; k < 10; k++) ctx.later(() => { show(ctx, '#fp' + k); if (k % 2) ctx.sfx('crunch'); }, k * 240);
          ctx.later(() => cls(ctx, '#serenity', 'look-up', 'walking'), 2400);
        }
      }
    };
  }

  /* ================= 20. "DO YOU WANT TO BE MY BEST FRIEND?" ================= */
  function ask(def, i) {
    const uid = 'p' + i;
    return {
      bg: '#cfe8f7',
      cam: { x: 830, y: 450, s: 1.35, z: .04, n: { x: 820, s: 1.35 } },
      layers: [
        ...yard(uid, P.footprints(150, 600, 688)),
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 640, 662, .82, 'right', { cls: 'look-up' }) + lb(uid, LOVE, 1000, 612, .78, 'left', { cls: 'reading look-down', book: '#e2457a' }) },
        ...snowFront(3)
      ],
      act: {
        love(ctx) { cls(ctx, '#love', 'look-up', 'look-down'); },
        best(ctx) { cls(ctx, '#serenity', 'hold shy'); },
        friend(ctx) { cls(ctx, '#love', null, 'reading look-up'); ctx.fx('#love', sparkles([[960, 360]], 26), 900); }
      }
    };
  }

  /* ================= 21. "YES!" ================= */
  function yes(def, i) {
    const uid = 'p' + i;
    const logBook = `<g id="logbook" class="prop-hidden" transform="translate(1086 596) rotate(-8)">` +
      `<rect x="-34" y="-12" width="68" height="14" rx="4" fill="#f4ecdc"/><rect x="-36" y="-20" width="72" height="12" rx="4" fill="#e2457a"/>` +
      `<path d="${P.heartPath}" transform="translate(0 -15) scale(.22)" fill="#fff"/></g>`;
    return {
      bg: '#cfe8f7', mood: 'joy',
      cam: { x: 830, y: 405, s: 1.05, z: .05, n: { x: 800, s: 1 } },
      layers: [
        ...yard(uid, P.footprints(150, 600, 688) + logBook),
        {
          depth: 1, cut: false, svg:
            lb(uid, SERENITY, 600, 662, .82, 'right', { cls: 'look-up' }) +
            lb(uid, LOVE, 1000, 612, .78, 'left', { cls: 'reading look-down', book: '#e2457a' })
        },
        ...snowFront(3)
      ],
      act: {
        yes(ctx) {
          const love = ctx.q('#love');
          love.classList.remove('reading', 'look-down');
          love.classList.add('no-book', 'grin', 'jump');
          ctx.add('#logbook', 'shown');
          move(ctx, 'love', -80, 50);
          ctx.add('#serenity', 'grin');
          ctx.sfx('squeak'); ctx.later(() => ctx.sfx('sparkle'), 250);
          ctx.fx('#serenity', P.spark(905, 360, 46) + P.spark(1010, 300, 34, '#ffd1e6') + P.spark(840, 300, 30, '#b8f0d6'), 1200);
          ctx.later(() => love.classList.remove('jump'), 900);
        },
        hearts(ctx) {
          ctx.sfx('heart');
          let h = '';
          [[880, 330, .9, '#ff6f9c', 0], [950, 300, .7, '#ff8a80', .15], [830, 290, .6, '#ffb3d1', .3], [990, 350, .8, '#e2457a', .4]].forEach(a => { h += P.heart(...a); });
          ctx.fx('#serenity', h, 2400);
          once(ctx, '#serenity', 'jump', 850);
        },
        come(ctx) {
          cls(ctx, '#serenity', 'walking');
          move(ctx, 'serenity', 170);
          [0, 300, 600].forEach(t => ctx.later(() => ctx.sfx('crunch'), t));
          ctx.add('#love', 'open');
          ctx.later(() => cls(ctx, '#serenity', 'open', 'walking'), 900);
        },
        hug(ctx) {
          ['#serenity', '#love'].forEach(sel => cls(ctx, sel, 'hug squeeze', 'open walking'));
          move(ctx, 'serenity', 182); move(ctx, 'love', -92, 50);
          ctx.add('#bigtree', 'party');
          ctx.look(848, 455, 1.18, { x: 848, s: 1.3 });
          ctx.sfx('hug'); ctx.later(() => ctx.sfx('magic'), 200);
          ctx.later(() => ctx.fx('#serenity', P.joyBurst(850, 380, 40, 7), 3400), 350);
        },
        happy(ctx) {
          ['#serenity', '#love'].forEach(sel => cls(ctx, sel, 'bounce', 'squeeze'));
          ctx.sfx('cheer');
          let h = '';
          for (let k = 0; k < 6; k++) h += P.heart(760 + k * 34, 250 - (k % 2) * 30, .5 + (k % 3) * .15, ['#ff6f9c', '#ffb3d1', '#ff8a80'][k % 3], k * .18);
          ctx.fx('#serenity', h, 3000);
        }
      }
    };
  }

  /* ================= 22. OFF TO THE HABIT ================= */
  function habit(def, i) {
    const uid = 'p' + i;
    // passengers peek out of the windows: Mom in front, Serenity and Love in the back (their ears poke over the roof)
    const riders = lb(uid, SERENITY, -96, -96, .42, 'right', { id: 'rideS', cls: 'grin' }) + lb(uid, LOVE, -40, -96, .4, 'right', { id: 'rideL', cls: 'grin' }) + lb(uid, MOM, 76, -100, .46, 'right', { id: 'rideM' });
    const walkers = lb(uid, MOM, 0, 0, .55, 'right', { id: 'wM' }) + lb(uid, SERENITY, -90, 0, .45, 'right', { id: 'wS' }) + lb(uid, LOVE, -160, 0, .44, 'right', { id: 'wL' });
    return {
      bg: '#cfe8f7',
      cam: { x: 820, y: 430, s: 1.05, z: .05, n: { x: 700, s: 1.05 } },
      layers: [
        ...outdoor(uid, { seed: 20, build: P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 21 }) }),
        { depth: 1, sh: 6, svg: `<rect x="-800" y="660" width="3200" height="60" fill="#d4dde8"/><path d="M-800 690 H2400" stroke="#fff" stroke-width="6" stroke-dasharray="40 40"/>` },
        { depth: 1, cut: false, svg: P.habit(1130, 652, .82) },
        {
          depth: 1, cut: false, svg:
            `<g transform="translate(720 668)"><g id="walkers" style="opacity:0;transition:opacity .4s, transform 2.2s ease-in-out">${walkers}</g></g>` +
            `<g transform="translate(560 672)"><g id="car" class="car-mover" style="transform:translate(-1500px,0)">${P.car(`<g id="riders">${riders}</g>`)}</g></g>`
        },
        ...snowFront(20).slice(1)
      ],
      // the car starts driving in as soon as the page starts reading
      start(ctx) { ctx.act('drive'); },
      act: {
        drive(ctx) { ctx.q('#car').style.transform = 'translate(0,0)'; ctx.sfx('whoosh'); ctx.later(() => { cls(ctx, '#car', 'parked'); ctx.sfx('squeak'); }, 2500); },
        wave(ctx) { ['#rideS', '#rideL'].forEach(s => cls(ctx, s, 'wave')); },
        habit(ctx) { cls(ctx, '#sign', 'glowing'); ctx.fx('#car', sparkles([[1130, 300], [960, 330], [1300, 330]], 34), 1200); ctx.sfx('jingle'); },
        inside(ctx) {
          // everyone hops out and heads in through the door
          ctx.q('#riders').style.opacity = '0';
          const w = ctx.q('#walkers'); w.style.opacity = '1';
          ['#wM', '#wS', '#wL'].forEach(s => cls(ctx, s, 'walking'));
          ctx.later(() => { w.style.transform = 'translate(410px, -40px) scale(.8)'; }, 300);
          ctx.later(() => { w.style.opacity = '0'; }, 2300);
        }
      }
    };
  }

  /* ================= 23–25. LUNCH AT THE HABIT ================= */
  /** shared diner scene; `items` = which foods are already on the table */
  function lunch(uid, items, extraFront = '') {
    const food =
      P.juice(620, 592, .8, 'juiceS', 'clinkL') + P.juice(1180, 592, .8, 'juiceL', 'clinkR') +
      P.charburger(760, 592, .8, 'burgerS') + P.charburger(1040, 592, .8, 'burgerL') +
      P.fries(480, 592, .8, 'fries') + P.onionRings(900, 596, .8, 'rings') + P.greenBeans(1310, 594, .85, 'beans');
    return {
      layers: [
        { depth: .3, sh: 3, svg: P.diner(uid) },
        {
          depth: 1, cut: false, svg:
            lb(uid, MOM, 400, 606, .9, 'right', { cls: 'grin' }) + lb(uid, SERENITY, 740, 614, .74, 'right') + lb(uid, LOVE, 1060, 614, .72, 'left')
        },
        { depth: 1, sh: 6, svg: P.table(200, 1400, 590) },
        { depth: 1, cut: false, svg: `<g id="food">${food}</g>` + extraFront }
      ],
      enter(ctx) { items.forEach(id => show(ctx, '#' + id)); }
    };
  }
  function burgers(def, i) {
    const uid = 'p' + i, L = lunch(uid, []);
    return {
      bg: '#fff1dc', cam: { x: 820, y: 410, s: 1.05, z: .05, n: { x: 880, s: 1.05 } }, layers: L.layers, enter: L.enter,
      act: {
        ordered(ctx) { ['#serenity', '#love'].forEach(s => cls(ctx, s, 'raise grin')); ctx.later(() => ['#serenity', '#love'].forEach(s => cls(ctx, s, null, 'raise')), 900); },
        burgers(ctx) { ['#burgerS', '#burgerL'].forEach((s, k) => ctx.later(() => { show(ctx, s); ctx.sfx('pop'); }, k * 220)); },
        juices(ctx) { ['#juiceS', '#juiceL'].forEach((s, k) => ctx.later(() => { show(ctx, s); ctx.sfx('pop'); }, k * 220)); ctx.later(() => ['#serenity', '#love'].forEach(s => cls(ctx, s, 'bounce')), 500); }
      }
    };
  }
  function sides(def, i) {
    const uid = 'p' + i, L = lunch(uid, ['burgerS', 'burgerL', 'juiceS', 'juiceL']);
    return {
      bg: '#fff1dc', cam: { x: 820, y: 410, s: 1.05, z: .05, n: { x: 880, s: 1.05 } }, layers: L.layers, enter: L.enter,
      act: {
        fries(ctx) { show(ctx, '#fries'); ctx.sfx('pop'); },
        rings(ctx) { show(ctx, '#rings'); ctx.sfx('pop'); },
        beans(ctx) { show(ctx, '#beans'); ctx.sfx('pop'); ctx.later(() => { ['#serenity', '#love'].forEach(s => cls(ctx, s, 'bounce grin')); ctx.sfx('cheer'); }, 400); }
      }
    };
  }
  function bff(def, i) {
    const uid = 'p' + i, L = lunch(uid, ['burgerS', 'burgerL', 'juiceS', 'juiceL', 'fries', 'rings', 'beans'], P.bffSign(900, 300));
    return {
      bg: '#fff1dc', cam: { x: 820, y: 400, s: 1.05, z: .05, n: { x: 880, s: 1.05 } }, layers: L.layers, enter: L.enter,
      act: {
        wonderful(ctx) { cls(ctx, '#food', 'clinked'); ['#serenity', '#love'].forEach(s => cls(ctx, s, 'grin')); ctx.later(() => { ctx.sfx('sparkle'); ctx.fx('#serenity', P.spark(900, 470, 40), 900); }, 380); },
        bffs(ctx) { show(ctx, '#bff'); ctx.sfx('jingle'); ['#serenity', '#love'].forEach(s => cls(ctx, s, 'bounce')); },
        forever(ctx) { ctx.fx('#serenity', hearts(880, 330, 6, 1), 2600); ctx.sfx('heart'); cls(ctx, '#mom', 'tilt'); }
      }
    };
  }

  /* ================= 26. THE END ================= */
  function theEnd(def, i) {
    const uid = 'p' + i;
    const gift = P.present(800, 668, 120, 80, '#ff8fb8', '#ffd36e') + `<g transform="translate(800 590)"><g class="a-float" style="--dur:1.6s;--amt:4px">${P.lol(0, 10, .32, '#ffd36e', '#ff6f9c', uid + 'g')}</g></g>` +
      P.present(800, 668, 120, 80, '#ff8fb8', '#ffd36e').replace(/<rect x="-60" y="-80"[^>]*\/>/, '');
    return {
      bg: '#ffd9c2', mood: 'calm',
      cam: { x: 800, y: 400, s: 1.05, z: .05, n: { x: 800, s: 1.05 } },
      layers: [
        ...outdoor(uid, { seed: 26, sky: [[0, '#f6b7c8'], [.55, '#ffd9c2'], [1, '#fff0d8']], build: P.house(330, 560, .45) + P.pineRow({ y: 556, color: '#6aa68e', hmin: 110, hmax: 170, gap: 150, seed: 27, x0: 600, x1: 2200 }) }),
        { depth: 1, cut: false, svg: lb(uid, SERENITY, 620, 664, .8, 'right', { cls: 'grin' }) + lb(uid, LOVE, 980, 664, .78, 'left', { cls: 'grin' }) + gift },
        ...snowFront(26)
      ],
      act: {
        end(ctx) { ['#serenity', '#love'].forEach(s => cls(ctx, s, 'wave')); ctx.fx('#serenity', hearts(800, 300, 6, 2), 2600); ctx.sfx('jingle'); }
      }
    };
  }

  Object.assign(BOOK.scenes, { newKid, allRed, greet, shy, tree, walkUp, ask, yes, habit, burgers, sides, bff, theEnd });
})();
