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
        const outputPath = path.resolve(path.dirname(resumePath), 'output.html');
        const cmd = `npx resume export "${outputPath}" --resume "${resumePath}" --theme jsonresume-theme-boilerplate`;
        exec(cmd, { cwd: __dirname }, (err, stdout, stderr) => {
            if (err) return reject(err);
            try {
                const html = fs.readFileSync(outputPath, 'utf-8');
                fs.unlinkSync(outputPath); // cleanup
                resolve(html);
            } catch (readErr) {
                reject(readErr);
            }
        });
    });
}

/**
 * Render a JSON‑Resume file to PDF using Puppeteer.
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
