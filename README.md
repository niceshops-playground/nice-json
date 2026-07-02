# Nice JSON

**Fast, private JSON pretty-printer, minifier and tree viewer.** Paste JSON,
get it formatted with syntax highlighting, minify it, sort keys, or explore it
as a collapsible tree — with instant validation and a byte/line/node/depth
readout. Everything runs **in your browser**; nothing is ever uploaded.

Built with React 19 + Vite + TypeScript as an installable PWA, styled in the
niceshops orange.

## Features

- 🎨 **Pretty-print with syntax highlighting** — 2 spaces, 4 spaces, or tabs.
- 🗜️ **Minify** — collapse to the smallest valid single line.
- 🔤 **Sort keys** — recursively alphabetize object keys for stable diffs.
- 🌳 **Tree view** — explore nested objects/arrays with collapsible nodes and
  item/key counts.
- ✅ **Live validation** — invalid JSON is flagged instantly with the exact
  **line and column** of the error.
- 📏 **Stats** — byte size, line count, node count and nesting depth.
- 📋 **Copy & download** — one-click copy or save the result as `nice.json`.
- 💾 **Survives a reload** — your input and settings are remembered in
  `localStorage`.
- 📱 **Installable PWA** — works offline and installs to your home screen /
  desktop.

## How it works

Nice JSON is a purely client-side app. Parsing uses the browser's built-in
`JSON.parse`; formatting uses `JSON.stringify`. Syntax highlighting tokenizes
the formatted output with a single regex pass, and the tree view walks the
parsed value directly. There is **no server** — your data never leaves the tab.

To stay responsive on large payloads, highlighting falls back to plain text
above ~200 KB, and the tree view is capped at 20,000 nodes (the formatted view
handles anything).

## Getting started

Requirements: Node.js 20+.

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build      # type-check and produce a production build in dist/
npm run preview    # preview the production build locally
npm run typecheck  # type-check only
npm run lint       # lint + format check (Biome)
npm run format     # auto-fix lint + format (Biome)
```

## Deploying to GitHub Pages

This repo ships a GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that builds the
app and publishes `dist/` to GitHub Pages on every push to `main`.

**Enable Pages once, in the repository settings:**

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the **Deploy to GitHub Pages** workflow from the
   **Actions** tab). When it finishes, your site is live at
   **`https://<owner>.github.io/nice-json/`**.

The Vite `base` is set to `/nice-json/` to match that path. If you serve the
app from a different path (e.g. a custom domain at the root), build with
`VITE_BASE=/ npm run build`.

## Tech

React 19 · Vite 8 · TypeScript · Biome · vite-plugin-pwa · GitHub Actions ·
Dependabot.

## License

MIT
