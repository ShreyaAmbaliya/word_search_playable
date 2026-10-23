# Word Shapes

Word Shapes is an original letter-grid puzzle for the browser. Each level is a square of letters. Hidden words run through neighboring letters. Trace a word, forward or backward, and its colored shape appears. Clear every word to finish the level.

There is no account, backend, or ad SDK. Progress, coins, and the mute setting stay in this browser.

## Play locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Other scripts:

- `npm run validate` checks that all 20 levels have connected, non-overlapping solution paths.
- `npm run build` validates the puzzles and writes the site to `dist/`.
- `npm run preview` serves that production folder.

## How to play

- Drag, swipe, or use the keyboard through letters that share a side.
- A word counts forward or backward through letters that share a side. Diagonal steps do not connect.
- A wrong path flashes and resets. It does not cost coins.
- Tap a word you already found to open its meaning and an example.
- Hints cost 20 coins and reveal one letter. The next hint reveals the next letter of that same word until you find it.
- If you cannot afford a hint, the coin button opens a shop. **Claim test coins** adds 30 coins immediately. It does not play an advertisement.

Keyboard: arrow keys move. Enter adds the focused letter, or submits when the path is ready. Backspace removes the last letter. Escape pauses.

## Play

The public game is at [https://shreyaambaliya.github.io/word_search_playable/](https://shreyaambaliya.github.io/word_search_playable/).

The repository is public. Every push to `main` runs **Deploy Word Shapes** (`.github/workflows/deploy.yml`). That job validates the levels, builds with Vite, and publishes `dist/` to GitHub Pages. The production build uses relative asset paths, so it works at that project URL.

## Project layout

- `index.html` — page shell
- `src/main.js` — startup
- `src/game.js` — tracing, hints, rewards, and flow
- `src/levels.js` — 20 original levels and the puzzle validator
- `src/ui.js` — menu, board chrome, and popups
- `src/style.css` — layout and theme
- `src/audio.js` — sounds generated in the browser
- `src/storage.js` — local save data
- `vite.config.js` — relative `base` for project Pages

Saved data uses the localStorage key `wordshapes.v1`. Reset progress from the level menu. If storage is blocked, the game still runs and shows that progress lasts for the visit only.
