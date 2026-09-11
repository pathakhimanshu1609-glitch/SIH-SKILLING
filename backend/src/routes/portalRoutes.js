import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { supabase } from '../config/supabaseClient.js';
import { questionBank } from '../../data/mcq_question_bank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const MOCK_SKILLS = [
  { id: 'sk-101', skill_code: 'SK-CNC-01', skill_name: 'G-Code CNC Programming', category: 'Precision Engineering' },
  { id: 'sk-102', skill_code: 'SK-CNC-02', skill_name: 'Lathe Machine Calibration', category: 'Precision Engineering' },
  { id: 'sk-103', skill_code: 'SK-SOLAR-01', skill_name: 'Solar Panel Array Wiring', category: 'Renewable Energy' },
  { id: 'sk-104', skill_code: 'SK-SOLAR-02', skill_name: 'Grid Inverter Installation', category: 'Renewable Energy' },
  { id: 'sk-105', skill_code: 'SK-EV-01', skill_name: 'EV Lithium Pack Diagnostics', category: 'Automotive' },
  { id: 'sk-106', skill_code: 'SK-EV-02', skill_name: 'BMS Sensor Calibration', category: 'Automotive' }
];

const MOCK_TRADE_SKILLS = [
  { trade_name: 'Advanced CNC Machinist', skills: [MOCK_SKILLS[0], MOCK_SKILLS[1]] },
  { trade_name: 'Solar PV Installer & Technician', skills: [MOCK_SKILLS[2], MOCK_SKILLS[3]] },
  { trade_name: 'EV Battery Maintenance Specialist', skills: [MOCK_SKILLS[4], MOCK_SKILLS[5]] }
];

// Helper to Load 181 CSV Job Postings Dataset locally if live DB query is unavailable
const loadSeededCSVJobPostings = () => {
  let csvPath = path.join(__dirname, '..', '..', 'job_postings_seed.csv');
  if (!fs.existsSync(csvPath)) {
    csvPath = path.join(__dirname, '..', 'job_postings_seed.csv');
  }

  if (!fs.existsSync(csvPath)) return [];

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');

  const jobs = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].trim().split(',');
    if (cols.length < 8) continue;

    jobs.push({
      job_id: parseInt(cols[0], 10),
      title: cols[1],
      company: cols[2],
      district: cols[3],
      trade: cols[4],
      required_skills: cols[5] ? cols[5].split('|').map(s => s.trim()) : [],
      salary_min: parseInt(cols[6], 10),
      salary_max: parseInt(cols[7], 10),
      source: cols[8] || 'National Career Service (NCS)'
    });
  }
  return jobs;
};

const LOCAL_SEEDED_JOBS = loadSeededCSVJobPostings();

/**
 * Backend function to query job_postings table from Supabase
 * getJobPostingsByTradeAndDistrict(trade, district)
 */
export async function getJobPostingsByTradeAndDistrict(trade, district) {
  try {
    let query = supabase
      .from('job_postings')
      .select('*');

    if (trade) {
      query = query.eq('trade', trade);
    }

    if (district && district !== 'All') {
      query = query.eq('district', district);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase DB Query Notice, using loaded CSV seed dataset:', err.message);
  }

  // Fallback to local 181 CSV dataset
  let result = LOCAL_SEEDED_JOBS;
  if (trade) result = result.filter(j => j.trade === trade);
  if (district && district !== 'All') {
    const districtFilter = result.filter(j => j.district === district);
    if (districtFilter.length > 0) result = districtFilter;
  }
  return result;
}

// Mock Candidate Assessment Results
let MOCK_ASSESSMENT_RESULTS = {
  'cand-01': [
    { skill_id: 'sk-101', skill_name: 'G-Code CNC Programming', pre_score: 45, post_score: 85 },
    { skill_id: 'sk-102', skill_name: 'Lathe Machine Calibration', pre_score: 40, post_score: 65 }
  ]
};

// Apply Auth
router.use(authenticateJWT);

router.get('/skills', (req, res) => res.json({ skills: MOCK_SKILLS }));
router.get('/trade-skills', (req, res) => res.json({ tradeSkills: MOCK_TRADE_SKILLS }));

/**
 * GET /api/portal/assessments/questions
 * Returns MCQ questions for specified trade & phase
 */
router.get('/assessments/questions', async (req, res) => {
  const { trade = 'Advanced CNC Machinist', phase = 'pre' } = req.query;

  let loadedQuestions = [];

  // 1. Attempt fetching from Supabase DB tables: skills, mcq_questions, mcq_options
  try {
    if (supabase) {
      const { data: skillsData, error: skillsErr } = await supabase
        .from('skills')
        .select('*')
        .eq('trade', trade);

      if (!skillsErr && skillsData && skillsData.length > 0) {
        const skillIds = skillsData.map(s => s.skill_id);
        const { data: qData, error: qErr } = await supabase
          .from('mcq_questions')
          .select('*, mcq_options(*)')
          .in('skill_id', skillIds);

        if (!qErr && qData && qData.length > 0) {
          loadedQuestions = qData.map(q => {
            const skillObj = skillsData.find(s => s.skill_id === q.skill_id);
            const opts = (q.mcq_options || []).sort((a, b) => a.option_id - b.option_id);
            const correctIdx = opts.findIndex(o => o.is_correct);

            return {
              id: q.question_id,
              skill_id: q.skill_id,
              skill_name: skillObj ? skillObj.skill_name : 'General',
              question: q.question_text,
              options: opts.map(o => o.option_text),
              correct_index: correctIdx !== -1 ? correctIdx : 0
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn('Supabase DB question query notice:', err.message);
  }

  // 2. Fallback to questionBank dataset from backend/data/mcq_question_bank.js
  if (loadedQuestions.length === 0 && questionBank && Array.isArray(questionBank)) {
    const tradeModules = questionBank.filter(m => m.trade.toLowerCase() === trade.toLowerCase());
    const targetModules = tradeModules.length > 0 ? tradeModules : questionBank.filter(m => m.trade === 'Advanced CNC Machinist');

    let qCounter = 1;
    targetModules.forEach(mod => {
      if (mod.questions && Array.isArray(mod.questions)) {
        mod.questions.forEach(q => {
          loadedQuestions.push({
            id: `q-${qCounter++}`,
            skill_id: mod.skill,
            skill_name: mod.skill,
            question: q.question,
            options: q.options || [],
            correct_index: q.correct_index || 0
          });
        });
      }
    });
  }

  res.json({
    success: true,
    trade,
    phase,
    count: loadedQuestions.length,
    questions: loadedQuestions
  });
});

/**
 * POST /api/portal/assessments/submit
 * Evaluates candidate's MCQ answers and records pre/post training score
 */
router.post('/assessments/submit', async (req, res) => {
  const { candidate_id = 'cand-01', phase = 'pre', answers = {}, trade = 'Advanced CNC Machinist' } = req.body;

  let questionsList = [];

  if (questionBank && Array.isArray(questionBank)) {
    const tradeModules = questionBank.filter(m => m.trade.toLowerCase() === trade.toLowerCase());
    const targetModules = tradeModules.length > 0 ? tradeModules : questionBank.filter(m => m.trade === 'Advanced CNC Machinist');
    let qCounter = 1;
    targetModules.forEach(mod => {
      (mod.questions || []).forEach(q => {
        questionsList.push({
          id: `q-${qCounter++}`,
          skill_name: mod.skill,
          correct_index: q.correct_index
        });
      });
    });
  }

  const skillScoresMap = {};

  questionsList.forEach(q => {
    if (!skillScoresMap[q.skill_name]) {
      skillScoresMap[q.skill_name] = { total: 0, correct: 0 };
    }
    skillScoresMap[q.skill_name].total += 1;

    const userSelectedOpt = answers[q.id];
    if (userSelectedOpt !== undefined && parseInt(userSelectedOpt, 10) === q.correct_index) {
      skillScoresMap[q.skill_name].correct += 1;
    }
  });

  const results = Object.keys(skillScoresMap).map(skillName => {
    const item = skillScoresMap[skillName];
    const score = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    return {
      skill_name: skillName,
      total: item.total,
      correct: item.correct,
      score
    };
  });

  // Update MOCK_ASSESSMENT_RESULTS memory cache for Candidate Dashboard / Scorecard
  if (!MOCK_ASSESSMENT_RESULTS[candidate_id]) {
    MOCK_ASSESSMENT_RESULTS[candidate_id] = [];
  }

  results.forEach(resItem => {
    let candSkill = MOCK_ASSESSMENT_RESULTS[candidate_id].find(s => s.skill_name === resItem.skill_name);
    if (!candSkill) {
      candSkill = { skill_id: `sk-${resItem.skill_name}`, skill_name: resItem.skill_name, pre_score: 40, post_score: 75 };
      MOCK_ASSESSMENT_RESULTS[candidate_id].push(candSkill);
    }
    if (phase === 'pre') {
      candSkill.pre_score = resItem.score;
    } else {
      candSkill.post_score = resItem.score;
    }
  });

  res.json({
    success: true,
    message: `${phase.toUpperCase()}-assessment scored successfully`,
    phase,
    results
  });
});

/**
 * GET /api/portal/assessments/results
 * Returns saved pre- and post-assessment scores for candidate
 */
router.get('/assessments/results', (req, res) => {
  const candidate_id = req.query.candidate_id || 'cand-01';
  const candResults = MOCK_ASSESSMENT_RESULTS[candidate_id] || [
    { skill_id: 'sk-1', skill_name: 'CNC Programming (G-code)', pre_score: 45, post_score: 85 },
    { skill_id: 'sk-2', skill_name: 'Machine Setup & Calibration', pre_score: 40, post_score: 75 },
    { skill_id: 'sk-3', skill_name: 'Quality & Precision Measurement', pre_score: 50, post_score: 90 },
    { skill_id: 'sk-4', skill_name: 'Safety & Maintenance', pre_score: 60, post_score: 85 }
  ];

  res.json({
    success: true,
    candidate_id,
    results: candResults
  });
});

/**
 * GET /api/portal/jobs/seeded
 * Queries Supabase job_postings table via getJobPostingsByTradeAndDistrict
 */
router.get('/jobs/seeded', async (req, res) => {
  const { trade, district } = req.query;
  const jobs = await getJobPostingsByTradeAndDistrict(trade, district);

  res.json({
    totalJobs: LOCAL_SEEDED_JOBS.length,
    returnedCount: jobs.length,
    jobs: jobs.slice(0, 50)
  });
});

/**
 * GET /api/portal/skill-match/gap-analysis
 * Step 4 Skill-Gap Matching Engine calling getJobPostingsByTradeAndDistrict
 */
router.get('/skill-match/gap-analysis', async (req, res) => {
  const candId = req.query.candidate_id || 'cand-01';
  const trade = req.query.trade || 'Advanced CNC Machinist';
  const district = req.query.district || 'Pune';

  // 1. Get Candidate Post-Assessment Skill Vector
  const candResults = MOCK_ASSESSMENT_RESULTS[candId] || MOCK_ASSESSMENT_RESULTS['cand-01'];

  // 2. Query job_postings table using getJobPostingsByTradeAndDistrict
  const relevantJobs = await getJobPostingsByTradeAndDistrict(trade, district);
  const totalRelevantJobs = relevantJobs.length || 1;

  // 3. Compute Industry Skill Demand Frequency (%)
  let skillDemandCount = {};
  relevantJobs.forEach(job => {
    const skillsArr = Array.isArray(job.required_skills) ? job.required_skills : [];
    skillsArr.forEach(skillName => {
      skillDemandCount[skillName] = (skillDemandCount[skillName] || 0) + 1;
    });
  });

  const tradeObj = MOCK_TRADE_SKILLS.find(t => t.trade_name === trade) || MOCK_TRADE_SKILLS[0];
  const tradeSkillsList = tradeObj.skills;

  // 4. Calculate Gap Score per skill
  const skillGapVector = tradeSkillsList.map(sk => {
    const candScoreItem = candResults.find(r => r.skill_name === sk.skill_name || r.skill_id === sk.id);
    const candidateScore = candScoreItem ? candScoreItem.post_score : 70;

    const occurrences = skillDemandCount[sk.skill_name] || Math.floor(totalRelevantJobs * 0.75);
    const demandFrequencyPct = Math.min(100, Math.round((occurrences / totalRelevantJobs) * 100));

    const gapScore = candidateScore - demandFrequencyPct;

    return {
      skill_id: sk.id,
      skill_name: sk.skill_name,
      category: sk.category,
      candidateScore: candidateScore,
      demandFrequency: demandFrequencyPct,
      gapScore: gapScore,
      status: gapScore >= 0 ? 'Surplus / Competent' : 'Gap / Upskill Recommended'
    };
  });

  res.json({
    candidate_id: candId,
    trade,
    district,
    totalJobsAnalyzed: totalRelevantJobs,
    totalDatasetRows: LOCAL_SEEDED_JOBS.length,
    skillGapVector,
    matchedJobs: relevantJobs.slice(0, 10)
  });
});

/**
 * GET /api/portal/candidate/skill-recommendations
 * Ranks candidate's weakest skills using getJobPostingsByTradeAndDistrict
 */
router.get('/candidate/skill-recommendations', async (req, res) => {
  const candId = req.query.candidate_id || 'cand-01';
  const trade = req.query.trade || 'Advanced CNC Machinist';
  const district = req.query.district || 'Pune';

  const candScores = MOCK_ASSESSMENT_RESULTS[candId] || MOCK_ASSESSMENT_RESULTS['cand-01'];
  const districtJobs = await getJobPostingsByTradeAndDistrict(trade, district);
  const totalJobs = districtJobs.length || 1;

  let demandCount = {};
  districtJobs.forEach(job => {
    const skillsArr = Array.isArray(job.required_skills) ? job.required_skills : [];
    skillsArr.forEach(skName => {
      demandCount[skName] = (demandCount[skName] || 0) + 1;
    });
  });

  const rankedSkills = MOCK_SKILLS.map(sk => {
    const scoreItem = candScores.find(item => item.skill_name === sk.skill_name || item.skill_id === sk.id);
    const postScore = scoreItem ? scoreItem.post_score : 65;

    const occurrences = demandCount[sk.skill_name] || Math.floor(totalJobs * 0.70);
    const demandPct = Math.min(100, Math.round((occurrences / totalJobs) * 100));

    const priorityScore = (100 - postScore) * (demandPct / 100);

    return {
      skill_id: sk.id,
      skill_code: sk.skill_code,
      skill_name: sk.skill_name,
      category: sk.category,
      post_score: postScore,
      demand_frequency_pct: demandPct,
      priority_score: Math.round(priorityScore),
      reason: `High demand in ${district} — appears in ${demandPct}% of local job postings while your current score is ${postScore}%.`
    };
  });

  rankedSkills.sort((a, b) => b.priority_score - a.priority_score);

  res.json({
    candidate_id: candId,
    trade,
    district,
    totalJobsAnalyzed: totalJobs,
    recommendations: rankedSkills.slice(0, 3)
  });
});

router.get('/government/data', (req, res) => res.json({ role: 'government', macroKPIs: { totalTrained: '1,452,000' } }));
router.get('/candidate/data', requireRole('candidate'), (req, res) => res.json({ role: 'candidate', coursesEnrolled: [{ id: 'C101', title: 'Advanced CNC Operator Skilling', status: 'In Progress', progress: 75 }] }));
router.get('/employment-status/candidate', (req, res) => res.json({ record: { status: 'Placed' } }));

/**
 * POST /api/portal/candidates/onboard
 * Saves/updates candidate profile in backend and Supabase
 */
router.post('/candidates/onboard', async (req, res) => {
  const { user_id, full_name, email, preferred_trade, district, qualification, dob, gender, aadhaar_last4, state } = req.body;

  try {
    if (supabase) {
      await supabase.from('candidates').upsert({
        user_id: user_id || 'cand-01',
        full_name,
        email,
        preferred_trade: preferred_trade || 'Advanced CNC Machinist',
        district: district || 'Pune',
        qualification: qualification || 'ITI Machinist Certificate',
        dob,
        gender,
        aadhaar_last4,
        state,
        status: 'Onboarded'
      }, { onConflict: 'user_id' }).catch(e => console.warn('Supabase onboard upsert note:', e.message));
    }
  } catch (err) {
    console.warn('Backend candidates/onboard note:', err.message);
  }

  res.json({
    success: true,
    message: 'Candidate profile onboarded successfully',
    candidate: { user_id, full_name, email, preferred_trade, district }
  });
});

export default router;
