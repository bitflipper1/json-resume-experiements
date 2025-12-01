---
description: Setup JSON-Resume theme (jsonresume-theme-boilerplate) and formatter service for HTML/PDF rendering.
---

## Overview
This workflow walks you through:
1. Installing the **jsonresume-theme-boilerplate**.
2. Adding a tiny **formatter-service** that exposes two API endpoints:
   - `POST /api/render/html` → returns rendered HTML.
   - `POST /api/render/pdf`  → returns a PDF (via `jsonresume export --format pdf`).
3. Connecting the formatter to the main app (so you can send the JSON-Resume you get from Gemini directly to the formatter).
4. (Optional) Customising the theme’s `style.css` with premium colours, glass‑morphism and micro‑animations.

---

## 1️⃣ Install the theme
```bash
# From the root of your project
git clone https://github.com/jsonresume/jsonresume-theme-boilerplate.git theme-boilerplate
cd theme-boilerplate
npm install
# Register the theme globally (so jsonresume CLI can find it)
npm link   # creates a global symlink
```

## 2️⃣ Scaffold the formatter-service
```bash
# Create a new folder for the service
mkdir -p formatter-service/src
cd formatter-service
npm init -y
npm install express jsonresume
# (optional) install puppeteer for PDF generation
npm install puppeteer   # PDF via headless Chrome (recommended)
```

### 2.1 Add `src/render.js`
```js
// src/render.js
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Render a JSON‑Resume file to HTML using the installed theme.
 * Returns the raw HTML string.
 */
export async function renderHtml(resumePath) {
  return new Promise((resolve, reject) => {
    const cmd = `jsonresume export "${resumePath}" --theme jsonresume-theme-boilerplate`;
    exec(cmd, { cwd: __dirname }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

/**
 * Render a JSON‑Resume file to PDF.
 * Uses Puppeteer (headless Chrome) to print the HTML to PDF.
 */
export async function renderPdf(resumePath) {
  const html = await renderHtml(resumePath);
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}
```

### 2.2 Add `src/server.js`
```js
import express from 'express';
import { renderHtml, renderPdf } from './render.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------
// POST /api/render/html – expects { resume: <JSON‑Resume object> }
// -------------------------------------------------
app.post('/api/render/html', async (req, res) => {
  try {
    const resume = req.body;
    if (!resume) return res.status(400).json({ error: 'Missing resume JSON' });

    const tmpPath = path.resolve(__dirname, '../tmp/resume.json');
    fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
    fs.writeFileSync(tmpPath, JSON.stringify(resume, null, 2), 'utf-8');

    const html = await renderHtml(tmpPath);
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    console.error('Render HTML error:', e);
    res.status(500).json({ error: e.message });
  }
});

// -------------------------------------------------
// POST /api/render/pdf – returns a PDF buffer
// -------------------------------------------------
app.post('/api/render/pdf', async (req, res) => {
  try {
    const resume = req.body;
    if (!resume) return res.status(400).json({ error: 'Missing resume JSON' });

    const tmpPath = path.resolve(__dirname, '../tmp/resume.json');
    fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
    fs.writeFileSync(tmpPath, JSON.stringify(resume, null, 2), 'utf-8');

    const pdfBuffer = await renderPdf(tmpPath);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);
  } catch (e) {
    console.error('Render PDF error:', e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Formatter service listening on http://localhost:${PORT}`);
});
```

## 3️⃣ Wire the two services together (optional shortcut)
If you want a single‑call flow from your main server, add this tiny proxy endpoint to `server.js` (the original app):
```js
app.post('/api/format', async (req, res) => {
  const formatted = await fetch('http://localhost:3002/api/render/html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body) // expects the same JSON‑Resume payload
  });
  const html = await formatted.text();
  res.set('Content-Type', 'text/html');
  res.send(html);
});
```
Now a client can POST the JSON‑Resume directly to `/api/format` and receive ready‑to‑display HTML.

---
## 4️⃣ Premium `style.css` snippet (glass‑morphism + micro‑animations)
Create or replace `theme-boilerplate/src/style.css` with the following (feel free to tweak the colours):
```css
/* ---------- Premium colour palette ---------- */
:root {
  --primary: hsl(210, 70%, 55%);   /* deep‑blue */
  --accent:  hsl(340, 80%, 60%);   /* vibrant‑magenta */
  --bg:     hsla(0, 0%, 100%, 0.85); /* semi‑transparent white */
  --glass-bg: hsla(0, 0%, 100%, 0.45);
  --text:   hsl(210, 10%, 15%);
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text);
  background: linear-gradient(135deg, hsl(210, 30%, 95%), hsl(340, 20%, 98%));
  backdrop-filter: blur(8px);
}

section {
  background: var(--glass-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.8rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.18);
}

h1, h2, h3 {
  color: var(--primary);
  font-weight: 600;
}

a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
a:hover {
  border-color: var(--accent);
}

/* Micro‑animation for skill tags */
.skill-tag {
  display: inline-block;
  background: var(--glass-bg);
  padding: 0.3rem 0.6rem;
  margin: 0.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--primary);
  animation: pop 0.4s ease forwards;
}
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  80% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
```
This gives the resume a **glass‑morphism card look**, a subtle hover lift, and a pop‑in animation for skill tags – all without any external CSS frameworks.

---
## 5️⃣ Host the rendered HTML on GitHub Pages (static preview)
1. **Create a `gh-pages` branch** (or use the built‑in GitHub Pages workflow):
   ```bash
   git checkout -b gh-pages
   mkdir docs   # GitHub Pages can serve the /docs folder
   cp path/to/rendered.html docs/index.html
   git add docs && git commit -m "Add resume preview"
   git push -u origin gh-pages
   ```
2. **Enable GitHub Pages** in the repository settings:
   - Source: **gh-pages branch /docs folder**.
   - Save – GitHub will give you a URL like `https://your‑username.github.io/your‑repo/`.
3. **Automate the publish** (optional): add a GitHub Action that runs after each successful `npm run build` to copy the latest `resume.html` into `docs/` and push.
   ```yaml
   name: Deploy resume preview
   on:
     push:
       paths: ['resume.html']
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: cp resume.html docs/index.html
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./docs
   ```
Now every time you generate a new resume HTML, the live preview updates automatically.

---
### 🎉 All done!
You now have:
- A **fallback conversion script** (`scripts/reactive-to-jsonresume.js`).
- A **workflow markdown** documenting the whole setup.
- A **formatter‑service** with HTML & PDF endpoints.
- A **premium CSS** theme snippet.
- Clear **instructions** for publishing the rendered resume on GitHub Pages.

Feel free to run the commands, edit the CSS, and start the services:
```bash
# Start formatter service
cd formatter-service && npm run dev   # (add "dev": "node src/server.js" to package.json)
# In another terminal, start your main server (if you added the proxy endpoint)
npm run dev   # or node server.js
```
If you need any further tweaks or want me to add the proxy endpoint to `server.js`, just let me know!
