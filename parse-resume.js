#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reactive Resume JSON template with default metadata
const REACTIVE_RESUME_TEMPLATE = {
  basics: {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    url: {
      label: "",
      href: ""
    },
    customFields: [],
    picture: {
      url: "",
      size: 64,
      aspectRatio: 1,
      borderRadius: 0,
      effects: {
        hidden: false,
        border: false,
        grayscale: false
      }
    }
  },
  metadata: {
    css: {
      value: "",
      visible: false
    },
    page: {
      margin: 18,
      format: "a4",
      options: {
        breakLine: true,
        pageNumbers: true
      }
    },
    notes: "",
    theme: {
      background: "#ffffff",
      text: "#000000",
      primary: "#dc2626"
    },
    layout: [
      [
        [
          "summary",
          "experience",
          "projects",
          "skills",
          "awards",
          "certifications",
          "education"
        ],
        [
          "interests",
          "publications",
          "volunteer",
          "profiles",
          "references",
          "languages"
        ]
      ]
    ],
    template: "rhyhorn",
    typography: {
      font: {
        family: "IBM Plex Serif",
        subset: "latin",
        variants: ["regular", "italic", "600"],
        size: 14
      },
      lineHeight: 1.5,
      hideIcons: true,
      underlineLinks: true
    }
  }
};

/**
 * Parse resume text using Claude AI
 */
async function parseResumeWithAI(resumeText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set. Please create a .env file with your API key.');
  }

  const client = new Anthropic({ apiKey });

  console.log('🤖 Parsing resume with Claude AI...\n');

  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `Parse this resume into valid Reactive Resume JSON format. Follow this EXACT structure:

{
  "basics": {
    "name": "Full Name",
    "headline": "Job Title",
    "email": "email@example.com",
    "phone": "123-456-7890",
    "location": "City, State",
    "url": {"label": "website", "href": "https://website.com"}
  },
  "sections": {
    "summary": {
      "id": "summary",
      "name": "Summary",
      "columns": 1,
      "visible": true,
      "content": "<p>Professional summary text here</p>"
    },
    "experience": {
      "id": "experience",
      "name": "Experience",
      "columns": 1,
      "visible": true,
      "items": [
        {
          "id": "exp1",
          "visible": true,
          "company": "Company Name",
          "position": "Job Title",
          "location": "City, State",
          "date": "Month Year - Month Year",
          "summary": "<p>Job description</p><ul><li><p>Achievement 1</p></li><li><p>Achievement 2</p></li></ul>",
          "url": {"label": "", "href": ""}
        }
      ]
    },
    "skills": {
      "id": "skills",
      "name": "Skills",
      "columns": 1,
      "visible": true,
      "items": [
        {
          "id": "skill1",
          "visible": true,
          "name": "Category Name",
          "description": "",
          "level": 0,
          "keywords": ["Skill 1", "Skill 2"]
        }
      ]
    },
    "projects": {
      "id": "projects",
      "name": "Projects",
      "columns": 1,
      "visible": true,
      "items": []
    },
    "education": {
      "id": "education",
      "name": "Education",
      "columns": 1,
      "visible": true,
      "items": [
        {
          "id": "edu1",
          "visible": true,
          "institution": "University Name",
          "studyType": "Degree",
          "area": "Field of Study",
          "date": "Year",
          "score": "",
          "summary": "",
          "url": {"label": "", "href": ""}
        }
      ]
    },
    "awards": {
      "id": "awards",
      "name": "Awards",
      "columns": 1,
      "visible": true,
      "items": []
    },
    "certifications": {"id": "certifications", "name": "Certifications", "columns": 1, "visible": true, "items": []},
    "profiles": {"id": "profiles", "name": "Profiles", "columns": 1, "visible": true, "items": []},
    "interests": {"id": "interests", "name": "Interests", "columns": 1, "visible": true, "items": []},
    "languages": {"id": "languages", "name": "Languages", "columns": 1, "visible": true, "items": []},
    "volunteer": {"id": "volunteer", "name": "Volunteering", "columns": 1, "visible": true, "items": []},
    "references": {"id": "references", "name": "References", "columns": 1, "visible": true, "items": []},
    "publications": {"id": "publications", "name": "Publications", "columns": 1, "visible": true, "items": []}
  }
}

Resume to parse:
${resumeText}

Return ONLY the JSON, no explanations, no markdown.`
      }]
    });

    // Extract the JSON from the response
    let jsonText = message.content[0].text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    }

    const parsedData = JSON.parse(jsonText);

    // Merge with template and fix missing fields
    const completeData = mergeWithTemplate(REACTIVE_RESUME_TEMPLATE, parsedData);
    const fixedData = fixMissingFields(completeData);

    console.log('✅ Resume parsed successfully!\n');
    return fixedData;

  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('❌ Claude API Error:', error.message);
      throw new Error(`API Error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      console.error('❌ JSON Parse Error:', error.message);
      throw new Error('Failed to parse AI response as JSON. The AI may have returned invalid JSON.');
    } else {
      throw error;
    }
  }
}

/**
 * Merge parsed data with template to ensure all required fields exist
 */
function mergeWithTemplate(template, data) {
  const merged = JSON.parse(JSON.stringify(template));

  // Merge basics
  if (data.basics) {
    merged.basics = { ...merged.basics, ...data.basics };
  }

  // Merge metadata (use template defaults)
  if (data.metadata) {
    merged.metadata = { ...merged.metadata, ...data.metadata };
  }

  // Merge sections
  if (data.sections) {
    merged.sections = data.sections;
  }

  return merged;
}

/**
 * Fix missing required fields in parsed data
 */
function fixMissingFields(data) {
  // Ensure sections.custom exists
  if (!data.sections.custom) {
    data.sections.custom = {};
  }

  // Fix awards items
  if (data.sections.awards?.items) {
    data.sections.awards.items = data.sections.awards.items.map(item => ({
      id: item.id || `award-${Date.now()}`,
      visible: item.visible !== false,
      title: item.title || '',
      awarder: item.awarder || '',
      date: item.date || '',
      summary: item.summary || '',
      url: item.url || { label: '', href: '' }
    }));
  }

  // Fix profiles items
  if (data.sections.profiles?.items) {
    data.sections.profiles.items = data.sections.profiles.items.map(item => ({
      id: item.id || `profile-${Date.now()}`,
      visible: item.visible !== false,
      network: item.network || '',
      username: item.username || '',
      icon: item.icon || '',
      url: typeof item.url === 'string' ? { label: '', href: item.url } : (item.url || { label: '', href: '' })
    }));
  }

  // Fix projects items
  if (data.sections.projects?.items) {
    data.sections.projects.items = data.sections.projects.items.map(item => ({
      id: item.id || `project-${Date.now()}`,
      visible: item.visible !== false,
      name: item.name || '',
      description: item.description || '',
      date: item.date || '',
      summary: item.summary || '',
      keywords: item.keywords || [],
      url: item.url || { label: '', href: '' }
    }));
  }

  // Ensure all section items have required fields
  ['experience', 'education', 'skills', 'certifications', 'volunteer', 'publications', 'references', 'languages', 'interests'].forEach(section => {
    if (data.sections[section]?.items) {
      data.sections[section].items = data.sections[section].items.map(item => {
        // Ensure url is an object
        if (item.url && typeof item.url === 'string') {
          item.url = { label: '', href: item.url };
        } else if (!item.url) {
          item.url = { label: '', href: '' };
        }
        return item;
      });
    }
  });

  return data;
}

/**
 * Validate the parsed JSON
 */
function validateResumeJSON(data) {
  const errors = [];

  // Check required fields
  if (!data.basics?.name) errors.push('Missing basics.name');
  if (!data.basics?.headline) errors.push('Missing basics.headline');
  if (!data.sections?.experience?.items) errors.push('Missing sections.experience.items');

  // Check experience items
  if (data.sections?.experience?.items) {
    data.sections.experience.items.forEach((item, index) => {
      if (!item.id) errors.push(`Experience item ${index} missing id`);
      if (!item.company) errors.push(`Experience item ${index} missing company`);
      if (!item.position) errors.push(`Experience item ${index} missing position`);
    });
  }

  // Check skills items
  if (data.sections?.skills?.items) {
    data.sections.skills.items.forEach((item, index) => {
      if (!item.id) errors.push(`Skill item ${index} missing id`);
      if (!item.name) errors.push(`Skill item ${index} missing name`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main function
 */
async function main() {
  try {
    // Get input file from command line argument or use default
    const inputFile = process.argv[2] || 'sample-resume.txt';
    const inputPath = path.resolve(__dirname, inputFile);

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Error: Input file not found: ${inputPath}`);
      console.log('\nUsage: node parse-resume.js <input-file.txt>');
      console.log('Example: node parse-resume.js sample-resume.txt\n');
      process.exit(1);
    }

    console.log(`📄 Reading resume from: ${inputFile}\n`);

    // Read the resume text
    const resumeText = fs.readFileSync(inputPath, 'utf-8');

    if (!resumeText.trim()) {
      console.error('❌ Error: Input file is empty');
      process.exit(1);
    }

    // Parse the resume
    const parsedResume = await parseResumeWithAI(resumeText);

    // Validate the result
    const validation = validateResumeJSON(parsedResume);

    if (!validation.valid) {
      console.warn('⚠️  Validation warnings:');
      validation.errors.forEach(error => console.warn(`   - ${error}`));
      console.log('');
    }

    // Generate output filename
    const outputFile = inputFile.replace(/\.(txt|md)$/i, '') + '-parsed.json';
    const outputPath = path.resolve(__dirname, outputFile);

    // Write to file
    fs.writeFileSync(outputPath, JSON.stringify(parsedResume, null, 2), 'utf-8');

    console.log(`💾 Output saved to: ${outputFile}`);
    console.log('');
    console.log('Summary:');
    console.log(`   Name: ${parsedResume.basics.name}`);
    console.log(`   Title: ${parsedResume.basics.headline}`);
    console.log(`   Experience: ${parsedResume.sections?.experience?.items?.length || 0} positions`);
    console.log(`   Projects: ${parsedResume.sections?.projects?.items?.length || 0} projects`);
    console.log(`   Skills: ${parsedResume.sections?.skills?.items?.length || 0} skill categories`);
    console.log('');
    console.log('✨ Done! You can now import this JSON into Reactive Resume.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run the script
main();
