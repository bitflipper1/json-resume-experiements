import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { tailorResumeWithAI } from './tailor-resume.js';
import { generateDocx } from './generate-docx.js';
import { reactiveToJsonResume } from './scripts/reactive-to-jsonresume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For form submissions
app.use(express.static(__dirname));

/**
 * Parse resume using Claude AI
 */
async function parseResumeWithAI(resumeText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const client = new Anthropic({ apiKey });

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

  // Extract JSON from response
  let jsonText = message.content[0].text.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  }

  const parsedData = JSON.parse(jsonText);

  // Return the JSON directly – no template merging needed
  return parsedData;
}

/**
 * Merge parsed data with template
 */


/**
 * Fix missing required fields in parsed data
 */


/**
 * API endpoint to parse resume
 */
app.post('/api/parse', async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        error: 'Resume text is required'
      });
    }

    console.log('Parsing resume...');
    const parsedResume = await parseResumeWithAI(resumeText);

    // Generate summary stats
    const summary = {
      name: parsedResume.basics.name,
      headline: parsedResume.basics.headline,
      email: parsedResume.basics.email,
      experienceCount: parsedResume.sections?.experience?.items?.length || 0,
      projectsCount: parsedResume.sections?.projects?.items?.length || 0,
      skillsCount: parsedResume.sections?.skills?.items?.length || 0,
      educationCount: parsedResume.sections?.education?.items?.length || 0,
      awardsCount: parsedResume.sections?.awards?.items?.length || 0
    };

    console.log('Parse successful:', summary);

    res.json({
      success: true,
      data: parsedResume,
      summary
    });

  } catch (error) {
    console.error('Parse error:', error);

    res.status(500).json({
      error: error.message || 'Failed to parse resume'
    });
  }
});

/**
 * API endpoint to tailor resume and generate DOCX
 */
app.post('/api/tailor', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume) {
      return res.status(400).json({ error: 'Resume JSON is required' });
    }
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    console.log('Tailoring resume...');
    const tailoredResume = await tailorResumeWithAI(resume, jobDescription);

    console.log('Generating DOCX...');
    const buffer = await generateDocx(tailoredResume);

    // Generate filename
    const filename = `ATS_Resume_${tailoredResume.basics.headline.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.docx`;

    console.log(`✅ Sending DOCX file: ${filename} (${buffer.length} bytes)`);

    // Send file directly with proper headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (error) {
    console.error('Tailor error:', error);
    res.status(500).json({
      error: error.message || 'Failed to tailor resume'
    });
  }
});

/**
 * API endpoint to get master resume
 */
app.get('/api/master-resume', (req, res) => {
  try {
    const masterResumePath = path.resolve(__dirname, 'resume.json');
    if (fs.existsSync(masterResumePath)) {
      const masterResume = JSON.parse(fs.readFileSync(masterResumePath, 'utf-8'));
      res.json({
        success: true,
        data: masterResume
      });
    } else {
      res.status(404).json({
        error: 'Master resume file not found'
      });
    }
  } catch (error) {
    console.error('Error loading master resume:', error);
    res.status(500).json({
      error: error.message || 'Failed to load master resume'
    });
  }
});

/**
 * Save master resume to file
 */
app.post('/api/master-resume', (req, res) => {
  try {
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    const masterResumePath = path.resolve(__dirname, 'resume.json');
    fs.writeFileSync(masterResumePath, JSON.stringify(resume, null, 2), 'utf-8');

    console.log('✅ Master resume saved to resume.json');

    res.json({
      success: true,
      message: 'Master resume saved successfully'
    });
  } catch (error) {
    console.error('Error saving master resume:', error);
    res.status(500).json({
      error: error.message || 'Failed to save master resume'
    });
  }
});

/**
 * Proxy endpoint to format resume via formatter-service
 */
app.post('/api/format', async (req, res) => {
  try {
    // Convert Reactive Resume format to JSON-Resume format
    const jsonResumeData = reactiveToJsonResume(req.body);

    console.log('Converting Reactive Resume to JSON-Resume for formatting...');

    const formatterUrl = 'http://localhost:3002/api/render/html';
    const response = await fetch(formatterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonResumeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Formatter service error: ${errorText}`);
    }

    const html = await response.text();
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Format proxy error:', error);
    res.status(500).json({
      error: error.message || 'Failed to format resume'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`
🚀 Resume Parser Server Started!

   URL: http://localhost:${PORT}
   API: http://localhost:${PORT}/api/parse

${!process.env.GEMINI_API_KEY ? '⚠️  WARNING: GEMINI_API_KEY is not set!\n' : '✅ Gemini API key loaded\n'}
Press Ctrl+C to stop
  `);
});
