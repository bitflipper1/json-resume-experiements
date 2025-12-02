// Sample resume data for demo
const SAMPLE_RESUME = `Matt McGlothlin
Senior Product Designer – Discovery & Strategy
mattmcg@bitfliptech.com • 704-293-5049 • Charlotte, NC • linkedin.com/in/bitflip • designmatt-ers.com

SUMMARY
Senior Product Design Strategist with 10+ years of experience driving solution discovery in complex, regulated industries (Fintech, Healthcare, Industrial IoT). Expert in navigating ambiguity through the Double Diamond framework, utilizing divergent prototyping and co-creation workshops to align executive strategy with validated user needs. Proven ability to pivot product roadmaps based on rigorous current state audits and executive guidance, delivering scalable strategies that influence long-term product vision.

CORE COMPETENCIES
Discovery & Strategy: Double Diamond Methodology, Current State Audits, Hypothesis-Driven Design, Service Design, Competitor Benchmarking, Roadmap Planning.

Ideation & Validation: Divergent Concept Generation, Rapid Prototyping, A/B Testing, Heuristic Evaluation, Usability Testing (Moderated/Unmoderated).

Facilitation & Leadership: Stakeholder Workshops, Design Thinking Facilitation, Cross-Functional Alignment, DesignOps, Mentoring Junior Designers.

Domain Expertise: Financial Services (Audit/Compliance), Enterprise SaaS, Complex Data Visualization, Accessibility (WCAG 2.2).

EXPERIENCE
Honeywell | UX Manager / Lead | Charlotte, NC | April 2021 – Present
Leading global discovery and strategy for enterprise safety platforms, serving 80K+ users in high-compliance environments.

Strategic Pivot & Executive Alignment (EWAS Platform):
• Led the discovery phase for the Enterprise Worker & Asset Safety (EWAS) platform transformation. Conducted deep-dive current state audits of fragmented legacy tools, mapping redundant paths and friction points.
• Pivoted product strategy following critical CTO guidance and stakeholder workshops, moving from a complex manual configuration model to a "Guided Onboarding" and AI-assisted workflow.
• Defined the strategic vision for NFC/QR-based device assignment, a key differentiator that eliminated manual entry errors and streamlined shift handoffs.

Discovery Workshops & Divergent Concepting (Vertex One):
• Facilitated multi-day discovery workshops with cross-functional stakeholders (Engineering, Product, Field Services) to deconstruct service inefficiencies in semiconductor fabs.
• Generated divergent HMI concepts to solve for high-risk "pump maintenance" scenarios, using wireframes to visualize complex logic before converging on a solution.
• Synthesized qualitative data from Voice of Customer (VOC) sessions using AI clustering to identify high-value opportunities, directly influencing the roadmap for predictive maintenance features.

Validation & Iteration:
• Conducted 100+ usability tests and field observations to validate hypotheses; iterated designs based on quantitative success metrics, reducing configuration time by 20%.

Design Leadership:
• Directed a global team of 20+ designers, establishing "Design Quality" reviews and mentoring staff on discovery methods and hypothesis-driven design.

Wells Fargo | Lead UX Designer (Contract) | Charlotte, NC | January 2021 – April 2021
Driven solution discovery for enterprise audit applications within a highly regulated financial environment.
• Collaborated in an Agile environment to align strategic requirements between Product Management and Engineering, reducing rework and clarifying scope early in the discovery process.
• Created high-fidelity interactive prototypes in Axure to facilitate stakeholder storytelling, securing alignment on complex audit workflows before development.
• Influenced the adoption of modern design thinking practices across teams to improve cross-functional cohesion.

Ecomdash (Endurance Group) | Senior UX Designer | Charlotte, NC | November 2019 – December 2020
Established the design strategy that contributed to the acquisition by Endurance Group (Constant Contact).
• Problem Discovery: Analyzed onboarding friction using Hotjar and Google Analytics, creating journey maps that identified critical drop-off points.
• Strategic Impact: Introduced design thinking frameworks that led to a 20% increase in conversion rates.
• Solution Delivery: Designed a multi-channel analytics platform unifying data from 15+ shopping APIs (Amazon, Shopify, eBay) into a single decision-making dashboard.

Bank of America | Senior UX Designer (Contract) | Charlotte, NC | March 2019 – November 2019
Optimized enterprise financial tools for internal audit and compliance operations.
• Facilitated design thinking workshops to align diverse stakeholders on workflow improvements for data-dense financial applications.
• Developed user journey maps and accessible patterns for internal audit tools, ensuring alignment with complex regulatory requirements.
• Partnered with data teams to design responsive interfaces capable of processing large-scale transaction data.

Central Piedmont Community College | User Experience Instructor | Charlotte, NC | January 2019 – June 2022
• Taught discovery methods, prototyping, and design principles to 30+ students, mentoring them on how to articulate design strategy and rationale.

KEY PROJECTS
Enterprise Worker & Asset Safety (EWAS) | Discovery & Strategic Pivot
Challenge: Unify fragmented legacy safety tools into a single intelligent platform.
Discovery: Mapped the entire ecosystem and identified user friction in device setup.
Strategy: Pivoted to a "Guided Onboarding" strategy based on CTO guidance and workshop insights.
Outcome: Delivered a unified platform serving 80K+ users with a 20% reduction in configuration time.

Vertex One HMI | Concepting & Validation
Challenge: Modernize a mission-critical gas detection interface for semiconductor manufacturing.
Discovery: Conducted field research and workshops to understand "high-containment" user constraints.
Strategy: Developed a "Fail-Safe" design strategy utilizing digital twins for predictive maintenance.
Outcome: Introduced "Point Mapping" and "Alarm Intelligence" features that increased operator productivity.

SOFTWARE & TOOLS
Strategy & Workshop: Miro, FigJam, Mural, MS Copilot (AI Synthesis).
Design & Prototyping: Figma (Variables, Dev Mode), Axure, ProtoPie, Sketch.
Research & Analytics: UserTesting.com, Hotjar, Google Analytics, Dovetail.
Development Handoff: Jira, Confluence, Storybook.

EDUCATION
West Virginia University | B.S. Journalism/Public Relations

AWARDS
iF Design Award | 2021 | Honeywell Transmission Risk Air Monitor (mobile & web)`;

// DOM Elements
const resumeInput = document.getElementById('resumeInput');
const output = document.getElementById('output');
const parseBtn = document.getElementById('parseBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loadExample = document.getElementById('loadExample');
const statusDiv = document.getElementById('status');
const summaryDiv = document.getElementById('summary');
// Tailor Tab Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const tailorResumeInput = document.getElementById('tailorResumeInput');
const jobDescriptionInput = document.getElementById('jobDescriptionInput');
const tailorBtn = document.getElementById('tailorBtn');
const tailorStatus = document.getElementById('tailorStatus');
const tailorOutput = document.getElementById('tailorOutput');
const downloadArea = document.getElementById('downloadArea');
const downloadDocxBtn = document.getElementById('downloadDocxBtn');
const previewResumeBtn = document.getElementById('previewResumeBtn');

let parsedData = null;
let tailoredResumeData = null;

const saveMasterBtn = document.getElementById('saveMasterBtn');

// Event Listeners
parseBtn.addEventListener('click', handleParse);
clearBtn.addEventListener('click', handleClear);
copyBtn.addEventListener('click', handleCopy);
downloadBtn.addEventListener('click', handleDownload);
saveMasterBtn.addEventListener('click', handleSaveMaster);
loadExample.addEventListener('click', handleLoadExample);

// Tab Switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // Add active class to clicked
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
  });
});

// Auto-load master resume immediately on page load
document.addEventListener('DOMContentLoaded', () => {
  loadMasterResumeAuto();
});

// Tailor Event Listeners
tailorBtn.addEventListener('click', handleTailor);

// Load Master Resume button
const loadMasterResumeBtn = document.getElementById('loadMasterResume');
if (loadMasterResumeBtn) {
  loadMasterResumeBtn.addEventListener('click', loadMasterResume);
}

// Load example resume
function handleLoadExample() {
  resumeInput.value = SAMPLE_RESUME;
  showStatus('Example resume loaded. Click "Parse with AI" to convert.', 'success');
}

// Parse resume
async function handleParse() {
  const resumeText = resumeInput.value.trim();

  if (!resumeText) {
    showStatus('Please paste your resume text first.', 'error');
    return;
  }

  try {
    // Disable button and show loading
    parseBtn.disabled = true;
    parseBtn.innerHTML = '<span class="spinner"></span> Parsing...';
    showStatus('Parsing resume with Claude AI... This may take 10-20 seconds.', 'loading');
    output.value = '';
    copyBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    summaryDiv.style.display = 'none';

    // Call API
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resumeText })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to parse resume');
    }

    // Success
    parsedData = result.data;
    tailoredResumeData = result.data; // Also set for preview functionality
    output.value = JSON.stringify(result.data, null, 2);

    showStatus('Resume parsed successfully! You can now copy or download the JSON.', 'success');
    copyBtn.style.display = 'flex';
    downloadBtn.style.display = 'flex';
    saveMasterBtn.style.display = 'flex';

    // Show summary
    displaySummary(result.summary);

  } catch (error) {
    console.error('Parse error:', error);
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    // Re-enable button
    parseBtn.disabled = false;
    parseBtn.innerHTML = '<span>🤖</span> Parse with AI';
  }
}

// Clear form
function handleClear() {
  resumeInput.value = '';
  output.value = '';
  parsedData = null;
  statusDiv.classList.remove('show');
  copyBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
  saveMasterBtn.style.display = 'none';
  summaryDiv.style.display = 'none';
}

// Copy JSON to clipboard
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(output.value);

    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span>✓</span> Copied!';
    copyBtn.style.background = '#10b981';

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = '';
    }, 2000);

    showStatus('JSON copied to clipboard!', 'success');
  } catch (error) {
    showStatus('Failed to copy to clipboard', 'error');
  }
}

// Save Master Resume & Switch to Tailor
async function handleSaveMaster() {
  if (!parsedData) return;

  try {
    const saveBtn = document.getElementById('saveMasterBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

    const response = await fetch('/api/master-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: parsedData })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save master resume');
    }

    showStatus('✅ Saved as Master Resume! Switching to Tailor tab...', 'success');

    // Switch to Tailor tab after short delay
    setTimeout(() => {
      document.querySelector('[data-tab="tailor"]').click();
      // Auto-load the new resume in the tailor tab
      loadMasterResumeAuto();
    }, 1500);

  } catch (error) {
    console.error('Save error:', error);
    showStatus(`Error saving: ${error.message}`, 'error');
  } finally {
    const saveBtn = document.getElementById('saveMasterBtn');
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>🚀</span> Save & Tailor';
  }
}

// Download JSON file
function handleDownload() {
  if (!parsedData) return;

  const filename = `resume-${parsedData.basics.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
  const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  showStatus(`Downloaded as ${filename}`, 'success');
}

// Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type} show`;

  if (type === 'loading') {
    statusDiv.innerHTML = `<span class="spinner"></span> ${message}`;
  }
}

// Display summary stats
function displaySummary(summary) {
  if (!summary) return;

  summaryDiv.innerHTML = `
    <h3>Parsed Resume Summary</h3>
    <ul>
      <li><strong>Name:</strong> ${summary.name || 'Not found'}</li>
      <li><strong>Title:</strong> ${summary.headline || 'Not found'}</li>
      <li><strong>Email:</strong> ${summary.email || 'Not found'}</li>
      <li><strong>Experience:</strong> ${summary.experienceCount} position(s)</li>
      <li><strong>Projects:</strong> ${summary.projectsCount} project(s)</li>
      <li><strong>Skills:</strong> ${summary.skillsCount} category(ies)</li>
      <li><strong>Education:</strong> ${summary.educationCount} degree(s)</li>
      ${summary.awardsCount > 0 ? `<li><strong>Awards:</strong> ${summary.awardsCount}</li>` : ''}
    </ul>
  `;
  summaryDiv.style.display = 'block';
}

// Check server health on load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/health');
    const health = await response.json();

    if (!health.hasAnthropicKey) {
      showStatus('⚠️ Warning: API key not configured. Please set ANTHROPIC_API_KEY in your .env file.', 'error');
    }
  } catch (error) {
    showStatus('⚠️ Warning: Could not connect to server. Make sure the server is running.', 'error');
  }
});

// Load master resume from server
async function loadMasterResume() {
  try {
    showTailorStatus('Loading master resume...', 'loading');

    const response = await fetch('/api/master-resume');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to load master resume');
    }

    // Load the JSON into the textarea
    tailorResumeInput.value = JSON.stringify(result.data, null, 2);
    showTailorStatus('✅ Master resume loaded from resume.json', 'success');

    // Hide success message after 3 seconds
    setTimeout(() => {
      const status = document.getElementById('tailorStatus');
      if (status.textContent.includes('Master resume loaded')) {
        status.classList.remove('show');
      }
    }, 3000);

  } catch (error) {
    console.error('Load master resume error:', error);
    showTailorStatus(`Error: ${error.message}`, 'error');
  }
}

// Auto-load master resume (silent, no status messages)
async function loadMasterResumeAuto() {
  try {
    const response = await fetch('/api/master-resume');
    const result = await response.json();

    if (response.ok && result.data) {
      tailorResumeInput.value = JSON.stringify(result.data, null, 2);
    }
  } catch (error) {
    // Silent fail for auto-load
    console.log('Auto-load master resume: not available');
  }
}

// Handle Tailoring
async function handleTailor() {
  const resumeText = tailorResumeInput.value.trim();
  const jobDescription = jobDescriptionInput.value.trim();

  if (!resumeText) {
    showTailorStatus('Please paste your Master Resume (JSON or Text).', 'error');
    return;
  }
  if (!jobDescription) {
    showTailorStatus('Please paste the Job Description.', 'error');
    return;
  }

  try {
    // Disable button and show loading
    tailorBtn.disabled = true;
    tailorBtn.innerHTML = '<span class="spinner"></span> Tailoring & Generating DOCX...';
    showTailorStatus('Tailoring resume with Gemini and generating DOCX... This may take 20-30 seconds.', 'loading');
    downloadArea.style.display = 'none';

    // Parse resume first if it looks like text (not JSON)
    let resumeJson = null;
    try {
      resumeJson = JSON.parse(resumeText);
    } catch (e) {
      // It's text, parse it first
      showTailorStatus('Parsing text resume first...', 'loading');
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      const parseResult = await parseResponse.json();
      if (!parseResponse.ok) throw new Error(parseResult.error || 'Failed to parse resume text');
      resumeJson = parseResult.data;
    }

    showTailorStatus('Tailoring content with Gemini and generating DOCX...', 'loading');

    // Call API with fetch to get the binary file
    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resume: resumeJson,
        jobDescription: jobDescription
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate DOCX');
    }

    // Get the filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'tailored-resume.docx';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) filename = match[1];
    }

    // Get the tailored resume JSON from header
    const tailoredJsonHeader = response.headers.get('X-Tailored-Resume-JSON');
    if (tailoredJsonHeader) {
      tailoredResumeData = JSON.parse(decodeURIComponent(tailoredJsonHeader));
    } else {
      // Fallback to input data if header not present
      tailoredResumeData = resumeJson;
    }

    // Get the blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 250);

    showTailorStatus('✅ DOCX Generated Successfully! Check your Downloads folder.', 'success');
    downloadArea.style.display = 'block';

    // Store the blob for re-download
    downloadDocxBtn.onclick = () => {
      const redownloadLink = document.createElement('a');
      redownloadLink.href = url;
      redownloadLink.download = filename;
      redownloadLink.click();
    };

    // Preview button handler
    previewResumeBtn.onclick = async () => {
      try {
        previewResumeBtn.disabled = true;
        previewResumeBtn.innerHTML = '<span class="spinner"></span> Loading Preview...';

        const previewResponse = await fetch('/api/format', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tailoredResumeData)
        });

        if (!previewResponse.ok) {
          throw new Error('Failed to generate preview');
        }

        const html = await previewResponse.text();

        // Open in new window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(html);
        previewWindow.document.close();

        showTailorStatus('✅ Preview opened in new tab!', 'success');
      } catch (error) {
        console.error('Preview error:', error);
        showTailorStatus(`Preview error: ${error.message}`, 'error');
      } finally {
        previewResumeBtn.disabled = false;
        previewResumeBtn.innerHTML = '<span>👁️</span> Preview Resume';
      }
    };

  } catch (error) {
    console.error('Tailor error:', error);
    showTailorStatus(`Error: ${error.message}`, 'error');
  } finally {
    tailorBtn.disabled = false;
    tailorBtn.innerHTML = '<span>✨</span> Tailor & Download DOCX';
  }
}

function showTailorStatus(message, type) {
  tailorStatus.textContent = message;
  tailorStatus.className = `status ${type} show`;
  if (type === 'loading') {
    tailorStatus.innerHTML = `<span class="spinner"></span> ${message}`;
  }
}

function downloadBase64File(base64Data, filename) {
  console.log('📥 Downloading file:', filename);
  console.log('📦 File size (base64):', base64Data.length, 'characters');

  try {
    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create blob with proper MIME type
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    console.log('📄 Blob created:', blob.size, 'bytes');

    // Use different download methods based on browser support
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // For IE/Edge
      window.navigator.msSaveOrOpenBlob(blob, filename);
      console.log('✅ Download initiated (IE/Edge method)');
    } else {
      // For modern browsers - create a temporary link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Important: Must append to body for Firefox
      document.body.appendChild(link);

      console.log('🔗 Download link created:', filename);

      // Trigger download
      link.click();

      // Cleanup after a delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ Download completed for:', filename);
      }, 250);
    }
  } catch (error) {
    console.error('❌ Download failed:', error);
    alert('Failed to download file: ' + error.message);
  }
}

// Format/Preview Tab Handler
const formatPreviewBtn = document.getElementById('formatPreviewBtn');
const formatStatus = document.getElementById('formatStatus');

if (formatPreviewBtn) {
  formatPreviewBtn.addEventListener('click', async () => {
    if (!tailoredResumeData) {
      formatStatus.textContent = '⚠️ Please parse a resume first (and optionally tailor it) before previewing.';
      formatStatus.className = 'status error show';
      formatStatus.style.display = 'block';
      return;
    }

    try {
      formatPreviewBtn.disabled = true;
      formatPreviewBtn.innerHTML = '<span class="spinner"></span> Loading Preview...';
      formatStatus.style.display = 'none';

      const response = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tailoredResumeData)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const html = await response.text();

      // Open in new window
      const previewWindow = window.open('', '_blank');
      if (!previewWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
      }
      previewWindow.document.write(html);
      previewWindow.document.close();

      formatStatus.textContent = '✅ Preview opened in new tab!';
      formatStatus.className = 'status success show';
      formatStatus.style.display = 'block';
    } catch (error) {
      console.error('Preview error:', error);
      formatStatus.textContent = `❌ Preview error: ${error.message}`;
      formatStatus.className = 'status error show';
      formatStatus.style.display = 'block';
    } finally {
      formatPreviewBtn.disabled = false;
      formatPreviewBtn.innerHTML = '<span>👁️</span> Preview Resume in New Tab';
    }
  });
}
