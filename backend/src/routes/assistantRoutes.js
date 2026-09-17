import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { getJobPostingsByTradeAndDistrict } from './portalRoutes.js';

const router = express.Router();

// ─── Gemini API Helper ────────────────────────────────────────────────────────
// Uses the @google/generative-ai SDK only if GEMINI_API_KEY is set.
// Falls back gracefully to a descriptive message if not configured.

const GEMINI_TIMEOUT_MS = 20000;

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Dynamic import to avoid crashing the server if the package isn't installed
  let GoogleGenerativeAI;
  try {
    const mod = await import('@google/generative-ai');
    GoogleGenerativeAI = mod.GoogleGenerativeAI;
  } catch {
    throw new Error('Gemini SDK not installed — run: npm install @google/generative-ai');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  // Enforce timeout via Promise.race
  const geminiCall = model.generateContent(prompt).then(r => r.response.text());
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timeout after 8 seconds')), GEMINI_TIMEOUT_MS)
  );

  return Promise.race([geminiCall, timeout]);
}

// ─── Mock Assessment Data (mirrors portalRoutes MOCK_ASSESSMENT_RESULTS) ─────
const MOCK_ASSESSMENT_RESULTS = {
  'cand-01': [
    { skill_name: 'G-Code CNC Programming',          trade: 'Advanced CNC Machinist',          pre_score: 45, post_score: 85 },
    { skill_name: 'Lathe Machine Calibration',        trade: 'Advanced CNC Machinist',          pre_score: 40, post_score: 65 },
    { skill_name: 'Solar Panel Array Wiring',         trade: 'Solar PV Installer & Technician', pre_score: 42, post_score: 80 },
    { skill_name: 'Grid Inverter Installation',       trade: 'Solar PV Installer & Technician', pre_score: 38, post_score: 75 },
    { skill_name: 'EV Lithium Pack Diagnostics',      trade: 'EV Battery Maintenance Specialist', pre_score: 50, post_score: 90 },
    { skill_name: 'BMS Sensor Calibration',           trade: 'EV Battery Maintenance Specialist', pre_score: 45, post_score: 70 },
    { skill_name: 'Industrial Robotics Programming',  trade: 'Industrial Automation & Robotics Technician', pre_score: 40, post_score: 85 },
    { skill_name: 'PLC & Sensor Interfacing',         trade: 'Industrial Automation & Robotics Technician', pre_score: 35, post_score: 75 },
  ],
  'cand-low': [
    { skill_name: 'G-Code CNC Programming',          trade: 'Advanced CNC Machinist', pre_score: 20, post_score: 35 },
    { skill_name: 'Lathe Machine Calibration',        trade: 'Advanced CNC Machinist', pre_score: 15, post_score: 30 },
    { skill_name: 'EV Lithium Pack Diagnostics',      trade: 'EV Battery Maintenance Specialist', pre_score: 25, post_score: 38 },
    { skill_name: 'BMS Sensor Calibration',           trade: 'EV Battery Maintenance Specialist', pre_score: 20, post_score: 32 },
  ],
};

// ─── Context Assembler ────────────────────────────────────────────────────────
async function buildCandidateContext(candidateId, trade, district) {
  // 1. Skill assessments
  const assessments = MOCK_ASSESSMENT_RESULTS[candidateId]
    || MOCK_ASSESSMENT_RESULTS['cand-01'];

  const tradeAssessments = trade
    ? assessments.filter(a => a.trade === trade)
    : assessments;

  const assessmentLines = tradeAssessments.map(a => {
    const gain = a.post_score - a.pre_score;
    const proficiency = a.post_score >= 80 ? 'Proficient' : a.post_score >= 60 ? 'Developing' : 'Needs Work';
    return `  - ${a.skill_name}: Pre-training ${a.pre_score}% → Post-training ${a.post_score}% (+${gain}%) [${proficiency}]`;
  }).join('\n');

  // 2. Relevant job postings
  const jobs = await getJobPostingsByTradeAndDistrict(trade, district);
  const topJobs = jobs.slice(0, 8);

  const jobLines = topJobs.map(j => {
    const reqSkills = Array.isArray(j.required_skills)
      ? j.required_skills.join(', ')
      : (j.required_skills || 'Not specified');
    const salary = j.salary_min && j.salary_max
      ? `₹${j.salary_min.toLocaleString('en-IN')}–₹${j.salary_max.toLocaleString('en-IN')}/mo`
      : 'Salary not disclosed';
    return `  - ${j.title} at ${j.company} (${j.district}): Requires [${reqSkills}] | ${salary}`;
  }).join('\n');

  // 3. Compute skill-demand percentages from job postings
  const allSkillMentions = {};
  jobs.forEach(j => {
    const skills = Array.isArray(j.required_skills) ? j.required_skills : [];
    skills.forEach(s => {
      const key = s.trim();
      allSkillMentions[key] = (allSkillMentions[key] || 0) + 1;
    });
  });

  const totalJobs = jobs.length || 1;
  const demandLines = Object.entries(allSkillMentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => `  - ${skill}: demanded by ${Math.round((count / totalJobs) * 100)}% of ${totalJobs} local job postings`)
    .join('\n');

  // 4. Compute match gaps
  const candidateSkillNames = tradeAssessments
    .filter(a => a.post_score >= 60)
    .map(a => a.skill_name.toLowerCase());

  const gapSkills = Object.keys(allSkillMentions)
    .filter(s => !candidateSkillNames.some(cs => cs.includes(s.toLowerCase().substring(0, 8))))
    .slice(0, 5);

  return { assessmentLines, jobLines, demandLines, gapSkills, totalJobs, trade, district };
}

// ─── Build Gemini Prompt ──────────────────────────────────────────────────────
function buildPrompt(question, ctx) {
  return `You are a personalized skill guidance assistant for India's National Skilling Portal (MSDE). Your role is to help candidates understand their skill gaps, job readiness, and career pathways based on their real assessment data.

STRICT INSTRUCTIONS:
- Answer the candidate's question using ONLY the data provided below.
- Do not invent skills, statistics, job titles, or company names not present in this data.
- Do not mention any job or company not listed in the Job Postings section below.
- If the data doesn't contain enough information to answer fully, say so honestly.
- Keep your answer practical, encouraging, and concise (3–5 short paragraphs max).
- Use simple language suitable for vocational candidates.
- Format with bullet points where helpful.

═══════════════════════════════════════════════
CANDIDATE CONTEXT DATA
═══════════════════════════════════════════════

TRADE: ${ctx.trade || 'General'}
DISTRICT: ${ctx.district || 'Not specified'}

CANDIDATE'S SKILL ASSESSMENT SCORES (Post-Training):
${ctx.assessmentLines || '  No assessment data available.'}

JOB POSTINGS IN THEIR DISTRICT/TRADE (${ctx.totalJobs} total):
${ctx.jobLines || '  No job postings available for this filter.'}

SKILL DEMAND FROM LOCAL JOB MARKET:
${ctx.demandLines || '  No demand data available.'}

IDENTIFIED SKILL GAPS (Skills demanded by employers but not yet proficient):
${ctx.gapSkills.length > 0 ? ctx.gapSkills.map(g => `  - ${g}`).join('\n') : '  No significant gaps identified based on available data.'}

═══════════════════════════════════════════════
CANDIDATE'S QUESTION:
${question}
═══════════════════════════════════════════════

Answer the candidate's question now, using ONLY the data above:`;
}

// ─── POST /api/assistant/ask ──────────────────────────────────────────────────
router.post('/ask', authenticateJWT, async (req, res) => {
  const { candidate_id, question, trade, district } = req.body;

  // Validation
  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Question is required.'
    });
  }

  if (question.trim().length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Question too long. Please keep it under 500 characters.'
    });
  }

  const candidateId = candidate_id || req.user?.id || 'cand-01';
  const candidateTrade = trade || 'Advanced CNC Machinist';
  const candidateDistrict = district || 'Pune';

  try {
    // Step 1: Fetch real supporting data
    const ctx = await buildCandidateContext(candidateId, candidateTrade, candidateDistrict);

    // Step 2: Build grounded prompt
    const prompt = buildPrompt(question.trim(), ctx);

    // Step 3: Call Gemini with timeout
    const answer = await callGemini(prompt);

    return res.json({
      success: true,
      answer: answer.trim(),
      context_used: {
        trade: ctx.trade,
        district: ctx.district,
        assessments_count: ctx.assessmentLines.split('\n').filter(Boolean).length,
        jobs_analyzed: ctx.totalJobs,
      }
    });

  } catch (err) {
    console.error('[Assistant] Error:', err.message);

    // Structured fallback messages
    let fallbackMessage;
    if (err.message.includes('GEMINI_API_KEY not configured')) {
      fallbackMessage = 'AI guidance is not yet configured on this portal instance. Please contact your training center for personalized skill counseling, or call the helpline at 1800-111-2026.';
    } else if (err.message.includes('timeout')) {
      fallbackMessage = 'The AI assistant is taking longer than expected to respond. Please try again in a moment, or contact your training center counselor directly.';
    } else if (err.message.includes('SDK not installed')) {
      fallbackMessage = 'AI guidance module is being set up. Please try again shortly.';
    } else {
      fallbackMessage = 'Unable to generate AI guidance at this time. For personalized career counseling, please contact your assigned training center or call 1800-111-2026 (toll-free).';
    }

    return res.status(200).json({
      success: false,
      fallback: true,
      answer: fallbackMessage,
    });
  }
});

export default router;
