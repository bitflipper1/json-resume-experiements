#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate DOCX from resume JSON
 */
async function generateDocx(resume) {
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 720, // 0.5 inch
                        right: 720,
                        bottom: 720,
                        left: 720,
                    },
                },
            },
            children: [
                // --- HEADER ---
                new Paragraph({
                    text: resume.basics.name.toUpperCase(),
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 60 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${resume.basics.email} | ${resume.basics.phone} | ${resume.basics.location}`,
                            size: 22, // 11pt
                        }),
                        ...(resume.basics.url ? [
                            new TextRun({
                                text: ` | ${resume.basics.url.label || resume.basics.url.href}`,
                                size: 22,
                            })
                        ] : [])
                    ],
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 120 },
                }),

                // --- SUMMARY ---
                createSectionHeader("PROFESSIONAL SUMMARY"),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: stripHtml(resume.basics.summary || resume.sections?.summary?.content || ""),
                            size: 22,
                        }),
                    ],
                    spacing: { after: 120 },
                }),

                // --- EXPERIENCE ---
                createSectionHeader("EXPERIENCE"),
                ...(resume.sections?.experience?.items || []).flatMap(item => [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: item.company,
                                bold: true,
                                size: 24, // 12pt
                            }),
                            new TextRun({
                                text: `\t${item.location || ""}`,
                                size: 22,
                            }),
                        ],
                        tabStops: [
                            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: item.position,
                                italics: true,
                                size: 22,
                            }),
                            new TextRun({
                                text: `\t${item.date}`,
                                size: 22,
                            }),
                        ],
                        tabStops: [
                            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                            { type: TabStopType.LEFT, position: 0 }, // Reset for next line if needed
                        ],
                        spacing: { after: 120 },
                    }),
                    ...parseBullets(item.summary).map(bullet =>
                        new Paragraph({
                            text: bullet,
                            bullet: { level: 0 },
                            spacing: { after: 60 },
                        })
                    ),
                    new Paragraph({ text: "", spacing: { after: 120 } }), // Spacer
                ]),

                // --- PROJECTS ---
                ...(resume.sections?.projects?.items?.length ? [
                    createSectionHeader("PROJECTS"),
                    ...(resume.sections.projects.items || []).flatMap(item => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: item.name,
                                    bold: true,
                                    size: 24,
                                }),
                                new TextRun({
                                    text: `\t${item.date || ""}`,
                                    size: 22,
                                }),
                            ],
                            tabStops: [
                                { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: item.description,
                                    italics: true,
                                    size: 22,
                                }),
                            ],
                            spacing: { after: 120 },
                        }),
                        ...parseBullets(item.summary).map(bullet =>
                            new Paragraph({
                                text: bullet,
                                bullet: { level: 0 },
                                spacing: { after: 60 },
                            })
                        ),
                        new Paragraph({ text: "", spacing: { after: 120 } }), // Spacer
                    ])
                ] : []),

                // --- SKILLS ---
                createSectionHeader("SKILLS"),
                ...(resume.sections?.skills?.items || []).map(item =>
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${item.name}: `,
                                bold: true,
                                size: 22,
                            }),
                            new TextRun({
                                text: item.keywords.join(", "),
                                size: 22,
                            }),
                        ],
                        spacing: { after: 60 },
                    })
                ),
                new Paragraph({ text: "", spacing: { after: 240 } }),

                // --- EDUCATION ---
                createSectionHeader("EDUCATION"),
                ...(resume.sections?.education?.items || []).map(item =>
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: item.institution,
                                bold: true,
                                size: 22,
                            }),
                            new TextRun({
                                text: `, ${item.area} (${item.studyType})`,
                                size: 22,
                            }),
                            new TextRun({
                                text: `\t${item.date || ""}`,
                                size: 22,
                            }),
                        ],
                        tabStops: [
                            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                        ],
                        spacing: { after: 60 },
                    })
                ),
            ],
        }],
    });

    return Packer.toBuffer(doc);
}

/**
 * Helper to create section headers
 */
function createSectionHeader(text) {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                bold: true,
                size: 24, // 12pt
                allCaps: true,
            }),
        ],
        border: {
            bottom: {
                color: "000000",
                space: 1,
                value: "single",
                size: 6,
            },
        },
        spacing: { before: 120, after: 60 },
        alignment: AlignmentType.LEFT,
    });
}

/**
 * Helper to strip HTML tags
 */
function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Helper to parse bullets from HTML content
 */
function parseBullets(html) {
    if (!html) return [];
    // Simple regex to extract list items or paragraphs
    const matches = html.match(/<li>(.*?)<\/li>/g);
    if (matches) {
        return matches.map(m => stripHtml(m));
    }
    // Fallback if no list items, just split by newlines or return full text
    return [stripHtml(html)];
}

/**
 * Main function
 */
async function main() {
    try {
        // Get input file from command line argument
        const inputFile = process.argv[2] || 'tailored-resume.json';
        const inputPath = path.resolve(__dirname, inputFile);

        // Check if input file exists
        if (!fs.existsSync(inputPath)) {
            console.error(`❌ Error: Input file not found: ${inputPath}`);
            console.log('\nUsage: node generate-docx.js <tailored-resume.json>');
            process.exit(1);
        }

        console.log(`📄 Reading resume from: ${inputFile}`);

        // Read the resume JSON
        const resume = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

        // Generate DOCX
        const buffer = await generateDocx(resume);

        // Generate output filename
        const jobTitle = resume.basics.headline.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        const outputFile = `ATS_Resume_${jobTitle}.docx`;
        const outputPath = path.resolve(__dirname, outputFile);

        // Write to file
        fs.writeFileSync(outputPath, buffer);

        console.log(`💾 Output saved to: ${outputFile}`);
        console.log('✨ Done!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('');
        process.exit(1);
    }
}

export { generateDocx };

// Only run main if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
