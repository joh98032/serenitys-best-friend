# Serenity's Best Friend

An animated, read-aloud storybook about Serenity the Labubu and her new friend Love. Written by Kaya and Keira with the help of Ben.

Built on the same engine as [The Brave Knight](https://joh98032.github.io/the-brave-knight/).

## Reading the book

- Tap **Read the story**. The book reads each page aloud, highlights each word as it's spoken, and turns the page by itself.
- Controls along the top: pause, read the page again, **AUTO** (turn pages by themselves, or wait for a tap), sound, settings, and full screen.
- Tap the page counter to see every page, or swipe to turn pages.
- Tap any word to hear it again.
- In **Settings** you can pick the voice, reading speed, text size, music and sound volume, and visual effects.

## Saving it for offline reading

- **Chrome, Edge, Android:** tap **Save to this device** on the start screen or in Settings.
- **iPhone / iPad:** in Safari, tap Share, then **Add to Home Screen**.

Once it's saved, the whole book works without internet. Offline it uses the device's built-in voice.

## Changing the book

It's a plain static website with no build step.

| File | What it holds |
|---|---|
| `js/story.js` | The words on each page, which scene each page uses, word cues, music mood, transitions, background sounds |
| `js/art/parts.js` | The plush Labubus (fur, the closed grin, expressions, accessories) and the snowy outdoor pieces |
| `js/art/parts2.js` | Props: house, rooms, classroom, LOL dolls, Christmas tree, cake, presents, Mom's pink car, The Habit, lunch |
| `js/art/scenes.js`, `scenes2.js` | One scene per page: its layers and what happens on each cue |
| `js/engine.js` | Page turning and transitions (curl, sparkle, snow swirl, warm glow), camera, captions, controls |
| `js/narrator.js`, `js/audio.js` | Reading aloud; holiday music, sounds and background ambience |
| `sw.js` | Offline saving. **Change `VERSION` whenever any file changes** so saved copies update |

Anything that animates all the time (Labubus, lights, flames) goes in a scene layer with `cut: false`, so it doesn't sit under the soft drop-shadow effect that would make every frame expensive to draw.

To try it locally, run `python -m http.server 8124` in this folder and open http://localhost:8124. Add `?page=10` to jump to a page.

`tools/make_icons.py` regenerates the app icons.
