// src/format.js
import { renderHtml, renderPdf } from './render.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CLI: node src/format.js <input.json> <html|pdf> [output.file]
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node src/format.js <resume.json> <html|pdf> [output.file]');
        process.exit(1);
    }
    const [inputPath, format, outputPath] = args;
    const absInput = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(absInput)) {
        console.error(`Input file not found: ${absInput}`);
        process.exit(1);
    }
    const resume = JSON.parse(fs.readFileSync(absInput, 'utf-8'));

    // Write a temporary file for the render functions (they expect a path)
    const tmpPath = path.resolve(__dirname, '../tmp/resume.json');
    fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
    fs.writeFileSync(tmpPath, JSON.stringify(resume, null, 2), 'utf-8');

    try {
        if (format === 'html') {
            const html = await renderHtml(tmpPath);
            if (outputPath) {
                fs.writeFileSync(outputPath, html, 'utf-8');
                console.log(`HTML written to ${outputPath}`);
            } else {
                console.log(html);
            }
        } else if (format === 'pdf') {
            const pdfBuffer = await renderPdf(tmpPath);
            if (outputPath) {
                fs.writeFileSync(outputPath, pdfBuffer);
                console.log(`PDF written to ${outputPath}`);
            } else {
                // pipe to stdout (binary) – not ideal, so warn user
                console.error('PDF output requires a file path.');
                process.exit(1);
            }
        } else {
            console.error('Invalid format. Use "html" or "pdf"');
            process.exit(1);
        }
    } catch (e) {
        console.error('Error during rendering:', e.message);
        process.exit(1);
    }
}

main();
