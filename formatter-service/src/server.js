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
