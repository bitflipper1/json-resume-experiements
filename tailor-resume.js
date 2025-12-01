#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load case studies for context
 */
function loadCaseStudies() {
    try {
        const caseStudiesPath = path.resolve(__dirname, 'case-studies.json');
        if (fs.existsSync(caseStudiesPath)) {
            return JSON.parse(fs.readFileSync(caseStudiesPath, 'utf-8'));
        }
    } catch (error) {
        console.warn('⚠️  Could not load case studies:', error.message);
    }
    return null;
}

/**
 * Tailor resume using Gemini AI with enhanced Gem instructions
 */
async function tailorResumeWithAI(masterResume, jobDescription) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set. Please create a .env file with your API key.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log('🤖 Tailoring resume with Gemini AI (Expert Recruiter Mode)...\n');

    // Load case studies for context
    const caseStudies = loadCaseStudies();
    const caseStudiesContext = caseStudies ? `

CASE STUDIES AVAILABLE FOR REFERENCE:
${Object.entries(caseStudies).map(([key, study]) => `
**${study.title}**
- Domain: ${study.domain}
- Challenge: ${study.challenge}
- Outcome: ${study.outcome}
- Keywords: ${study.keywords.join(', ')}
- Metrics: ${study.metrics.join(', ')}
`).join('\n')}

Use these case studies to add specific details and metrics when relevant to the job description.
` : '';

    try {
        const prompt = `**Role & Persona**

You are an Expert Technical Recruiter and ATS (Applicant Tracking System) Optimization Specialist specializing in UX Design, Product Design, and Design Systems. Your goal is to help Matt land interviews by creating highly tailored, keyword-optimized resumes that pass automated screenings and impress human hiring managers.

**Your Knowledge Base**

You have access to Matt's Master Resume and detailed case studies.

* **Source of Truth:** Always prioritize the Master Resume for dates, titles, and core history. Never invent experiences.
* **Detail Source:** Use the Case Studies to flesh out bullet points with specific metrics, workflows, and deep-dive details.

**Task: Generate Tailored Resume**

Analyze the Job Description and create a tailored resume following these rules:

**Content Rules:**
1. **Summary:** Write a 3-sentence professional summary tailored exactly to the JD's title and pain points. Update the "sections.summary.content" field.
2. **Headline:** Update "basics.headline" to match the target role from the JD.
3. **Core Competencies:** In the "skills" section, select and reorder the most relevant skill categories and keywords from the Master Resume to match the JD's terminology.
4. **Experience:** Rewrite bullet points from the Master Resume to match the JD's terminology (e.g., change "User Testing" to "Validation" if the JD uses that term). Use HTML formatting with <strong> tags for key phrases.
5. **Key Projects:** Select the 2-3 most relevant projects from the Master Resume. Integrate details from the Case Studies when they match the JD requirements.
6. **ATS Optimization:** Ensure exact keyword matches from the JD are present in the Skills section and throughout the resume.

**Formatting Rules:**
- Use HTML formatting: <p>, <ul>, <li>, <strong> tags
- Bold key phrases in bullet points using <strong>
- Maintain the exact JSON structure of the Master Resume
- Do NOT change the schema, only the content
- Keep all required fields (id, visible, url, etc.)

**Output Format:**
Return ONLY valid JSON matching the Master Resume structure. No explanations, no markdown, no commentary.

---

JOB DESCRIPTION:
${jobDescription}

---

MASTER RESUME (JSON):
${JSON.stringify(masterResume, null, 2)}

${caseStudiesContext}

---

Generate the tailored resume now. Return ONLY the JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text().trim();

        // Remove markdown code blocks if present
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        }

        const tailoredResume = JSON.parse(jsonText);

        console.log('✅ Resume tailored successfully with ATS optimization!\n');
        return tailoredResume;

    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        throw new Error(`API Error: ${error.message}`);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        // Get input file from command line argument
        const jobDescriptionFile = process.argv[2];

        if (!jobDescriptionFile) {
            console.log('\nUsage: node tailor-resume.js <job-description.txt>');
            console.log('Example: node tailor-resume.js job-description.txt\n');
            process.exit(1);
        }

        const jobDescriptionPath = path.resolve(__dirname, jobDescriptionFile);
        const masterResumePath = path.resolve(__dirname, 'resume.json');

        // Check if files exist
        if (!fs.existsSync(jobDescriptionPath)) {
            console.error(`❌ Error: Job description file not found: ${jobDescriptionPath}`);
            process.exit(1);
        }

        if (!fs.existsSync(masterResumePath)) {
            console.error(`❌ Error: Master resume file not found: ${masterResumePath}`);
            process.exit(1);
        }

        console.log(`📄 Reading job description from: ${jobDescriptionFile}`);
        console.log(`📄 Reading master resume from: resume.json\n`);

        // Read the files
        const jobDescription = fs.readFileSync(jobDescriptionPath, 'utf-8');
        const masterResume = JSON.parse(fs.readFileSync(masterResumePath, 'utf-8'));

        if (!jobDescription.trim()) {
            console.error('❌ Error: Job description file is empty');
            process.exit(1);
        }

        // Tailor the resume
        const tailoredResume = await tailorResumeWithAI(masterResume, jobDescription);

        // Generate output filename
        const outputFile = 'tailored-resume.json';
        const outputPath = path.resolve(__dirname, outputFile);

        // Write to file
        fs.writeFileSync(outputPath, JSON.stringify(tailoredResume, null, 2), 'utf-8');

        console.log(`💾 Output saved to: ${outputFile}`);
        console.log('');
        console.log('Summary:');
        console.log(`   Name: ${tailoredResume.basics.name}`);
        console.log(`   Title: ${tailoredResume.basics.headline}`);
        console.log(`   Experience: ${tailoredResume.sections?.experience?.items?.length || 0} positions`);
        console.log(`   Projects: ${tailoredResume.sections?.projects?.items?.length || 0} projects`);
        console.log(`   Skills: ${tailoredResume.sections?.skills?.items?.length || 0} skill categories`);
        console.log('');
        console.log('✨ Done! You can now generate the DOCX.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('');
        process.exit(1);
    }
}

export { tailorResumeWithAI };

// Only run main if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
