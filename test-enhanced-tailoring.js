#!/usr/bin/env node

import { tailorResumeWithAI } from './tailor-resume.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTailoring() {
    console.log('🧪 Testing Enhanced Resume Tailoring with Case Studies\n');

    // Load master resume
    const masterResumePath = path.resolve(__dirname, 'resume.json');
    const masterResume = JSON.parse(fs.readFileSync(masterResumePath, 'utf-8'));

    // Load job description
    const jobDescPath = path.resolve(__dirname, 'job-description.txt');
    const jobDescription = fs.readFileSync(jobDescPath, 'utf-8');

    console.log('📄 Master Resume loaded');
    console.log('📋 Job Description loaded\n');
    console.log('Job Title:', jobDescription.split('\n')[0]);
    console.log('');

    try {
        // Tailor the resume
        const tailoredResume = await tailorResumeWithAI(masterResume, jobDescription);

        // Save output
        const outputPath = path.resolve(__dirname, 'test-tailored-resume.json');
        fs.writeFileSync(outputPath, JSON.stringify(tailoredResume, null, 2), 'utf-8');

        console.log('✅ Test Complete!\n');
        console.log('Results:');
        console.log('  Tailored Headline:', tailoredResume.basics.headline);
        console.log('  Summary Length:', tailoredResume.sections?.summary?.content?.length || 0, 'characters');
        console.log('  Experience Items:', tailoredResume.sections?.experience?.items?.length || 0);
        console.log('  Projects:', tailoredResume.sections?.projects?.items?.length || 0);
        console.log('  Skills Categories:', tailoredResume.sections?.skills?.items?.length || 0);
        console.log('');
        console.log('💾 Output saved to: test-tailored-resume.json');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        process.exit(1);
    }
}

testTailoring();
