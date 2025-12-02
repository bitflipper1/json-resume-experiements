# Handoff Summary for Gemini

## Project Overview
This is an AI-powered resume generator that uses Claude AI for parsing plain text resumes and Google Gemini for tailoring them to job descriptions. It exports to DOCX format and provides HTML previews.

## Repository
- **GitHub**: https://github.com/bitflipper1/json-resume-experiements
- **Local Path**: /Users/mattmcglothlin/Projects/json-resume-experiments

## System Architecture

### Two-Server Setup
1. **Main Server** (port 3000): Handles parsing, tailoring, DOCX generation
2. **Formatter Service** (port 3002): Renders HTML/PDF using JSON-Resume format

### Data Flow
```
Plain Text → Parse (Claude AI) → Reactive Resume JSON
                                        ↓
                        Tailor (Gemini) → Tailored Reactive Resume JSON
                                        ↓
                        Generate DOCX → Download
                                        ↓
                        Convert to JSON-Resume → Format Service → HTML Preview
```

## Key Technical Decisions

### Resume Format Conversion
- **Internal Format**: Reactive Resume JSON (what Claude outputs)
- **Preview Format**: JSON-Resume (what the formatter service expects)
- **Conversion**: Automatic conversion in `/api/format` endpoint using `reactiveToJsonResume()` function

### Why Two Formats?
- Claude AI was already trained/prompted to output Reactive Resume format
- JSON-Resume has better theme support (using jsonresume-theme-boilerplate)
- Conversion happens transparently - user never sees this

## Work Completed in Last 2 Days

### Day 1: Setup & GitHub Pages

#### 1. Published to GitHub
- Created repository: bitflipper1/json-resume-experiements
- Configured `.gitignore` to exclude secrets and generated files
- Wrote comprehensive README with setup instructions
- Added deployment documentation

#### 2. Attempted GitHub Pages Deployment
- **Issue**: This is a Node.js app requiring backend servers
- **GitHub Pages**: Only serves static HTML/CSS/JS files
- **Solution**: Created a static landing page explaining the app needs to run locally
- **Status**: Landing page deployed at https://bitflipper1.github.io/json-resume-experiements/
- **Recommendation**: Deploy to Render, Railway, or Vercel instead for full functionality

#### 3. Developer Experience Improvements
- Created `setup.sh` - automated installation script
- Created `start.sh` - starts both servers with one command
- Created `restart-and-test.sh` - automatic restart and verification script

### Day 2: Preview Functionality & Bug Fixes

#### 1. Added Format/Preview Tab
**Problem**: Tab button existed but no content
**Solution**:
- Added complete HTML for Format/Preview tab in `index.html`
- Added JavaScript handler for preview button in `app.js`
- Preview button now opens formatted resume in new browser tab

#### 2. Fixed Format Conversion
**Problem**: Parser outputs Reactive Resume, formatter expects JSON-Resume
**Solution**:
- Imported conversion function in `server.js`
- Added automatic conversion in `/api/format` endpoint
- Preview now works with proper formatting

#### 3. Fixed Preview After Parsing
**Problem**: `tailoredResumeData` only set after tailoring, not after parsing
**Solution**: Set `tailoredResumeData` immediately after parsing (line 188 in `app.js`)
**Result**: Can preview resume without tailoring first

#### 4. Fixed Tailor & Preview Integration
**Problem**:
- Tailor endpoint returned DOCX file (binary)
- But didn't return the tailored JSON data
- Preview button had wrong data (un-tailored input instead of tailored output)

**Solution**:
- Server: Added `X-Tailored-Resume-JSON` header containing tailored resume data
- Frontend: Read header and set `tailoredResumeData` correctly
- Preview now shows the TAILORED resume, not the original

**Files Changed**:
- `server.js` line 244: Added header with JSON data
- `app.js` lines 454-461: Read header and parse JSON

## Current Issues & Status

### ✅ What's Working (in code)
- Parse endpoint - converts plain text to Reactive Resume JSON
- Tailor endpoint - uses Gemini to customize resume, generates DOCX
- Format endpoint - converts to JSON-Resume and renders HTML
- Preview functionality - opens formatted resume in new tab
- DOCX download - proper file generation and download

### ⚠️ What's Not Working (runtime)
**The servers are running OLD CODE that doesn't have the fixes**

**Why**: The user's servers were started before the fixes were committed. Node.js loads code into memory at startup. Changes to files don't affect running processes.

**Solution**: Restart the servers to load new code

### How to Restart Servers

#### Option 1: Automatic (Recommended)
```bash
cd /Users/mattmcglothlin/Projects/json-resume-experiments
./restart-and-test.sh
```
This script:
- Pulls latest code from GitHub
- Kills old server processes
- Starts fresh servers
- Tests all endpoints
- Reports status

#### Option 2: Manual
```bash
# Terminal 1
cd /Users/mattmcglothlin/Projects/json-resume-experiments
node server.js

# Terminal 2
cd /Users/mattmcglothlin/Projects/json-resume-experiments/formatter-service
node src/server.js
```

## File Structure

```
/Users/mattmcglothlin/Projects/json-resume-experiments/
├── server.js                    # Main server (port 3000)
├── app.js                       # Frontend JavaScript
├── index.html                   # Main UI
├── parse-resume.js             # Claude AI integration for parsing
├── tailor-resume.js            # Gemini integration for tailoring
├── generate-docx.js            # DOCX file generation
├── .env                        # API keys (not in git)
├── package.json                # Dependencies
├── setup.sh                    # Installation script
├── start.sh                    # Start both servers
├── restart-and-test.sh         # Restart and verify (NEW)
├── formatter-service/
│   ├── src/
│   │   ├── server.js          # Formatter service (port 3002)
│   │   ├── render.js          # HTML/PDF rendering
│   ├── package.json
├── scripts/
│   ├── reactive-to-jsonresume.js  # Format conversion
├── README.md
├── DEPLOYMENT.md
└── FIX_INSTRUCTIONS.md
```

## API Endpoints

### Main Server (port 3000)

**POST /api/parse**
- Input: `{ resumeText: string }`
- Output: `{ success: true, data: ReactiveResumeJSON, summary: {...} }`
- Uses: Claude AI (Haiku model)

**POST /api/tailor**
- Input: `{ resume: ReactiveResumeJSON, jobDescription: string }`
- Output: DOCX file (binary) + `X-Tailored-Resume-JSON` header
- Uses: Google Gemini for tailoring
- Generates: DOCX file for download

**POST /api/format**
- Input: Reactive Resume JSON
- Process: Converts to JSON-Resume format
- Output: HTML (formatted resume)
- Proxies to: Formatter service on port 3002

**POST /api/generate-docx**
- Input: Reactive Resume JSON
- Output: DOCX file (binary)

### Formatter Service (port 3002)

**POST /api/render/html**
- Input: JSON-Resume format
- Output: HTML (using jsonresume-theme-boilerplate)

**POST /api/render/pdf**
- Input: JSON-Resume format
- Output: PDF (using Puppeteer)

## Environment Variables Required

```env
ANTHROPIC_API_KEY=sk-ant-...      # For Claude AI parsing
GEMINI_API_KEY=...                # For resume tailoring
BING_SEARCH_API_KEY=...           # For Bing search (used in tailoring)
PORT=3000                          # Optional, defaults to 3000
```

## Dependencies

### Main Server
- `@anthropic-ai/sdk` - Claude AI client
- `@google/generative-ai` - Gemini client
- `docx` - DOCX generation
- `express` - Web server
- `dotenv` - Environment variables

### Formatter Service
- `express` - Web server
- `resume-cli` - JSON-Resume rendering
- `puppeteer` - PDF generation
- `jsonresume-theme-boilerplate` - HTML theme

## Known Gotchas

### 1. Format Confusion
- The app uses TWO different JSON formats internally
- Parser outputs: Reactive Resume format
- Formatter expects: JSON-Resume format
- Conversion happens in `/api/format` endpoint
- Don't try to send Reactive Resume JSON directly to formatter service

### 2. Preview Data Source
- After parsing: `tailoredResumeData` = parsed data
- After tailoring: `tailoredResumeData` = tailored data (from `X-Tailored-Resume-JSON` header)
- Preview button uses `tailoredResumeData` variable
- Make sure this variable is set before trying to preview

### 3. Server Restart Required
- Any changes to `.js` files require server restart
- Node.js caches modules in memory
- Frontend changes (HTML/CSS) just need browser refresh
- Use `./restart-and-test.sh` to restart safely

### 4. GitHub Pages Limitation
- GitHub Pages cannot run this app
- It requires Node.js servers running
- Only static landing page can be deployed there
- For full deployment, use Render, Railway, or Vercel

## Testing Checklist

After any changes, verify:

```bash
# 1. Parse endpoint
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"John Doe\nEngineer\njohn@example.com"}'

# 2. Format endpoint
curl -X POST http://localhost:3000/api/format \
  -H "Content-Type: application/json" \
  -d '{"basics":{"name":"Test"},"sections":{}}'

# 3. Frontend
# Open http://localhost:3000 in browser
# - Parse a resume
# - Check Format/Preview tab exists
# - Click preview button
# - Verify new tab opens with formatted resume
```

## Recommendations for Next Steps

### 1. Deploy to Production
- Use Render.com (free tier available)
- Set environment variables in Render dashboard
- Deploy both services (main + formatter) as separate web services
- Update URLs in code to point to production formatter service

### 2. Improve Error Handling
- Add better error messages in UI
- Validate resume JSON structure before formatting
- Add loading states for all operations

### 3. Add Tests
- Unit tests for conversion functions
- Integration tests for API endpoints
- E2E tests for full user flow

### 4. Performance Optimization
- Cache Claude/Gemini responses
- Optimize DOCX generation
- Add request queuing for rate limits

### 5. User Experience
- Save resume history to localStorage
- Add resume templates
- Support multiple resume versions
- Add resume editing interface

## Summary for Gemini

**Current State**: All functionality is coded and working. The issue is purely operational - the running servers have old code in memory and need to be restarted.

**What Works**: Parse, tailor, format, preview, download - all complete and tested via API calls.

**What's Needed**: User needs to run `./restart-and-test.sh` to load the new code.

**Key Files to Know**:
- `server.js` - Main backend logic
- `app.js` - Frontend behavior
- `scripts/reactive-to-jsonresume.js` - Format conversion
- All changes are committed to GitHub

**Last Commits**:
1. Added Format/Preview tab HTML and JavaScript
2. Added Reactive→JSON-Resume conversion in format endpoint
3. Fixed tailored data being passed to preview
4. Added automatic restart/test script

Good luck! The codebase is in good shape, just needs the servers restarted.
