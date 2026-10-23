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

## Publish on GitHub Pages

The production build uses relative asset paths, so it works at `https://USERNAME.github.io/REPOSITORY/` as well as at a domain root. This repository is not published until you push it and the Actions deploy job succeeds.

1. Create a new empty GitHub repository. Do not add a conflicting README if you want a clean first push.
2. From this project folder:

```bash
git init
git add .
git commit -m "Add Word Shapes, a browser letter-path puzzle"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Open the **Actions** tab. The "Deploy Word Shapes" workflow runs on every push to `main`. It installs dependencies, validates the levels, builds with Vite, and deploys `dist/` with the official GitHub Pages actions.
6. When the deploy job is green, the game URL is shown on that job and under **Settings → Pages**. It looks like `https://USERNAME.github.io/REPOSITORY/`.

The workflow file is `.github/workflows/deploy.yml`. GitHub may ask you to approve Actions the first time you use Pages.

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
