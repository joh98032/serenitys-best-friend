# Serenity's Best Friend: Animated Storybook Plan

Status: **phase 2 done** (2026-11-11). All 26 pages are illustrated and animated, with the snow-swirl and glow transitions and a Serenity app icon. Next: phase 3 polish and phase 4 device testing, then your review before anything goes to GitHub. To try it, run `python -m http.server 8124` in this folder and open http://localhost:8124 (add `?page=10` to jump to a page).

The proposed visual details and page pictures below were approved as written. Mom's car is pink.

## Decisions (from you)

| Area | Decision |
|---|---|
| Title | **Serenity's Best Friend** |
| Byline | Written by Kaya and Keira with the help of Ben |
| Codebase | Copy The Brave Knight engine (`../animated-book`) into this folder and adapt it. The two books evolve separately |
| Text | The cleaned version from chat, with "Labubu" (see page list) |
| Art style | Soft and plushy: rounded, toy-like shapes, soft gradients, fuzzy textures. Drawn in code as layered SVG, like Brave Knight |
| Brands | Close likeness: characters look like real Labubus, LOLs look like LOL dolls, and the restaurant is The Habit (name on the sign, no real logo artwork) |
| Characters | Everyone is a Labubu: Mom, Love, classmates and the teacher |
| Serenity | Mint green. Toenails in several greens with sparkle. Sky-colored eyes with glitter. One glistening green tooth, the same color as her nose. Big cute smile |
| Love | All red: light red, dark red, every red in between |
| Mom (Sophie) | A bigger, grown-up Serenity, in the same green |
| Season | The whole book is wintry: snow, lights and decorations from start to end |
| Music | Holiday jingle: sleigh bells and celesta, festive all the way through (generated, no audio files) |
| Narration | Browser voices, word-by-word highlighting (same as Brave Knight) |
| Page density | 1–2 sentences per page, like Brave Knight |
| Lunch trip | Mom drives them to The Habit in her car, and stays with them in the restaurant |
| The large tree | A big snowy tree in the schoolyard |
| LOL wish | Subtle payoff: a small wrapped present or LOL doll on the final page. The text doesn't change |
| Features kept | Auto page turns + tap-to-turn mode, music + sound effects + ambience, offline saving / install, reading helpers (tap a word, text size, page grid, tilt 3D) |
| Hosting | New public GitHub repo `joh98032/serenitys-best-friend` → https://joh98032.github.io/serenitys-best-friend/ |
| Git / publish | Everything stays local until you review it and say so. Then I commit and push |

## Visual details (proposed, approved)

| Item | Proposal |
|---|---|
| Labubu shape | Fuzzy round body, tall pointed bunny-style ears, big eyes, wide grin with a row of small pointed teeth. Serenity has **one** green tooth in that row |
| Love's eyes | Warm amber/gold, so they stand out against the red |
| Love's book | A plain storybook with a heart on the cover |
| Classmates | 3–4 Labubus in pastel colors (pink, lavender, peach, sky blue). They never upstage Serenity or Love |
| Teacher | A taller cream/white Labubu with glasses and a scarf |
| Schoolyard tree | Wrapped in Christmas lights |
| Mom's car | A little round **pink** car |
| Home | A cozy round house with a wreath on the door |
| Transitions | Page curl by default. Special ones: snow-swirl wipe into the Christmas pages, sparkle burst on "best friend", warm glow fade to The End |
| Sound effects | Soft "boing" squeak steps, chimes on sparkle words, sleigh bells on "Christmas", cheers in TK, sizzle on the burgers, clinking cups |
| Ambience | Home: crackling fire. Classroom: gentle chatter. Schoolyard: soft wind and snow crunch. Restaurant: diner chatter and grill sizzle |
| App icon | Serenity's face, grinning, on a snowy blue background |

## Page breakdown (26 pages), approved

✱ = special transition (otherwise page curl).

1. **Cover**: "Serenity's Best Friend". *Written by Kaya and Keira with the help of Ben.* Serenity waves in front of a snowy house; snowflakes drift.
2. Once upon a time, there was a little Labubu named Serenity. She was green like a mint ball. *Serenity rolls in like a mint ball, pops up and waves; a mint candy bounces beside her.*
3. She had colorful toenails, green like grass. She had beautiful eyes like the pretty sky, sparkly like glitter from a glitter jar. *Close-up on her sparkly toes wiggling on "toenails"; on "glitter", a glitter jar tips and sparkles swirl around her eyes.*
4. She had a tooth that was glistening green, the same color as her nose, and she had a big, cute smile. *The tooth glints on "glistening", her nose glows on "nose", and her grin widens on "smile".*
5. And best of all, she was a kind little Labubu. *Serenity helps a tiny snowbird out of the snow; hearts float up.*
6. Serenity was nice to everyone, but she didn't really have any friends. *She waves at passing Labubus who don't notice; she stands alone on a snowy sidewalk.*
7. So she talked to her mom, whose name was Sophie. "Mom," she asked, "when am I going to have friends?" *Cozy kitchen with Mom by the fireplace; Serenity tugs her sleeve.*
8. "Soon, Serenity," Mom said. "I love you. I'll see you after school!" *Mom hugs her (heart pop on "love") and waves from the door as Serenity heads off with her backpack.*
9. So Serenity went to school. She was in TK, and TK was so much fun. She loved it. *School with snowy roof; classroom with TK classmates, the teacher, crayons and blocks.*
10. They even had LOLs! She was very happy in TK. *A shelf of LOL dolls lights up; Serenity hugs one and does a happy spin.*
11. ✱ *Snow-swirl wipe.* It was Christmas, the best season of the year, and Serenity loved Christmas. *Christmas tree, string lights blinking on, sleigh bells.*
12. Her birthday was on Christmas Day, so she got double the presents! *Home on Christmas morning: birthday cake with candles next to the tree; presents stack up and double on "double".*
13. For her birthday and Christmas she wished for two things: a friend, and a LOL. *Serenity blows out the candles; a thought bubble shows a friend shape, then a LOL doll.*
14. One day, a new kid came to school. Her name was Love. *Classroom door opens; snow blows in; Love peeks around the door.*
15. She was very pretty, and she was all red: light red, dark red, and every kind of red in between. *Love steps forward; shades of red ripple across her fur on "light red", "dark red" and "in between".*
16. Serenity greeted her very happily. She thought they could be best friends! *Serenity bounces and waves big; a dreamy bubble shows the two of them holding hands.*
17. But Love was shy, just like Serenity, and she had no friends to play with. *Love ducks behind her book; the bubble pops.*
18. She always sat by herself with a book next to a large tree. *Schoolyard: Love alone under the big tree, snow falling softly.*
19. Then one day at school, Serenity saw Love reading under the tree. She walked right up to her. *Serenity spots her, takes a deep breath and walks across the snow (footprints appear).*
20. "Love," said Serenity, "do you want to be my best friend?" *Close-up of both; Love lowers her book.*
21. ✱ *Sparkle burst.* "Yes!" said Love. "I would love to be your best friend!" *Love jumps up, they hug, hearts and sparkles burst, snow swirls.*
22. So they went out for lunch at The Habit. *Mom's car pulls up at The Habit with Serenity and Love waving from the back; the sign glows in the snow; they all go in together.*
23. They ordered two Charburgers and two tropical juices. *Burgers and juices pop onto the table as each is named; burgers sizzle.*
24. They also got french fries, onion rings, and green beans. *Fries, onion rings and green beans pop in; the table gets comically full.*
25. They had a wonderful lunch, and they became best BFFs forever! *They clink juice cups; a "BFF" sign made of sparkles appears; Mom sits at the table with them, smiling.*
26. ✱ *Warm glow fade.* **The End!** *Serenity and Love wave together in the snow; a small wrapped present with a LOL peeking out sits at their feet. "Read again" button.*

## Tech (same as Brave Knight)

Plain HTML/CSS/JS, no build step. Copied from `../animated-book`:
- `js/engine.js`, `js/narrator.js`, `js/util.js`, `js/offline.js`, `css/book.css`, `sw.js`, `manifest.webmanifest`, `tools/make_icons.py`: copied, then retitled and restyled. The parchment caption becomes a soft, snowy one
- `js/story.js`: new pages, cues, moods and ambience
- `js/art/parts*.js`: new plush part kit (Labubu with color/size/expression options, house, school, tree, snow, presents, LOLs, food, car, restaurant)
- `js/art/scenes*.js`: one scene per page
- `js/audio.js`: new holiday instrument set and new ambience types

## Build phases

1. **Engine copy + one showcase page** (proposed: page 21, "Yes!" + sparkle burst, because it shows Serenity, Love, the tree and snow). *Checkpoint: you approve how the Labubus look and feel.*
2. **Part kit + all 26 scenes.**
3. **Music, sounds, transitions, polish.**
4. **Device testing**: phone, tablet, desktop, fullscreen.
5. **You review locally** → only on your go-ahead: git init, commit, create the repo, push, enable Pages.
