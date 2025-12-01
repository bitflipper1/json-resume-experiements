# Resume Generator & Formatter

AI-powered resume parser, tailor, and formatter using Claude AI and Google Gemini.

## 🌐 Live Demo

**Try it now:** https://bitflipper1.github.io/json-resume-experiements/

## ✨ Features

- **AI Resume Parsing**: Upload plain text resumes and let Claude AI extract structured data
- **Smart Tailoring**: Use Google Gemini to customize resumes for specific job descriptions
- **Multiple Formats**: Export to DOCX or preview as HTML
- **JSON-Resume Standard**: Outputs industry-standard JSON-Resume format
- **Live Preview**: See your formatted resume before downloading

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- API Keys:
  - Anthropic API key (for Claude AI)
  - Google Gemini API key
  - Bing Search API key

### Installation

#### Option 1: Automated Setup (Recommended)

```bash
git clone https://github.com/bitflipper1/json-resume-experiements.git
cd json-resume-experiements
./setup.sh
```

Then edit `.env` with your API keys and run:

```bash
./start.sh
```

This will start both servers automatically. Press Ctrl+C to stop.

#### Option 2: Manual Setup

1. **Clone the repository**:
```bash
git clone https://github.com/bitflipper1/json-resume-experiements.git
cd json-resume-experiements
```

2. **Install dependencies**:
```bash
npm install
cd formatter-service && npm install && cd ..
```

3. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
BING_SEARCH_API_KEY=your_bing_api_key_here
```

4. **Run the servers**:
Open two terminal windows:

Terminal 1 (Main Server):
```bash
npm run dev
```

Terminal 2 (Formatter Service):
```bash
cd formatter-service && npm run dev
```

5. **Open in browser**: http://localhost:3000

## 📖 How It Works

### 1. Parse Resume
Upload or paste a plain text resume. Claude AI extracts:
- Personal information
- Work experience
- Education
- Skills
- Projects

### 2. Tailor to Job (Optional)
Paste a job description and Google Gemini will:
- Highlight relevant experience
- Optimize keyword matching
- Reorder sections for impact
- Customize bullet points

### 3. Export & Preview
- **Download DOCX**: Professional formatted document
- **Preview HTML**: See formatted resume in browser
- **JSON-Resume**: Standard format for integrations

## 🏗️ Architecture

```
Main Server (Port 3000)
├── Parse resumes (Claude AI)
├── Tailor resumes (Google Gemini)
├── Generate DOCX files
└── Proxy to formatter service

Formatter Service (Port 3002)
├── Render HTML (resume-cli)
├── Generate PDF (Puppeteer)
└── Use jsonresume-theme-boilerplate
```

## 🔧 API Endpoints

### Main Server

**POST /api/parse**
- Parse plain text resume to JSON
- Body: `{ "resumeText": "..." }`

**POST /api/tailor**
- Tailor resume to job description
- Body: `{ "resumeJson": {...}, "jobDescription": "..." }`

**POST /api/generate-docx**
- Generate DOCX file
- Body: `{ "resumeJson": {...} }`

**POST /api/format**
- Proxy to formatter service for HTML preview
- Body: `{ "resumeJson": {...} }`

### Formatter Service

**POST /api/render/html**
- Render resume as HTML
- Body: JSON-Resume format

**POST /api/render/pdf**
- Render resume as PDF
- Body: JSON-Resume format

## 🎨 Customization

### Change Resume Theme

The formatter uses `jsonresume-theme-boilerplate`. To customize:

1. Clone the theme:
```bash
git clone https://github.com/jsonresume/jsonresume-theme-boilerplate.git
```

2. Edit the theme files (HTML/CSS)

3. Link to formatter service:
```bash
cd jsonresume-theme-boilerplate && npm link
cd ../formatter-service && npm link jsonresume-theme-boilerplate
```

## 🐛 Troubleshooting

**Formatter service not working?**
- Make sure both servers are running
- Check that ports 3000 and 3002 are available
- Verify `resume-cli` is installed in formatter-service

**API errors?**
- Verify API keys in `.env` file
- Check API key permissions and quotas
- Ensure proper .env format (no quotes around values)

**DOCX generation fails?**
- Check that all required resume fields are present
- Verify the JSON structure matches JSON-Resume schema

## 📝 License

MIT License - feel free to use for your own projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with Claude AI, Google Gemini, and JSON-Resume
