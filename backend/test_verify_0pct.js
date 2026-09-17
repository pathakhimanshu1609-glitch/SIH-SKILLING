import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: './backend/.env' });

const baseUrl = 'http://localhost:5000';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const headers = { 
  'Content-Type': 'application/json', 
  'Authorization': 'Bearer demo-token-candidate' 
};

async function verifyEndToEnd() {
  console.log('================================================================');
  console.log('🔍 STEP 1: Querying Supabase skill_assessments table directly...');
  console.log('================================================================');
  
  const testCandId = 'cand-1789486998129';
  const { data: dbRows, error: dbErr } = await supabase
    .from('skill_assessments')
    .select('assessment_id, candidate_id, skill_id, phase, score, taken_at');
  
  console.log('DB Query Error:', dbErr ? dbErr.message : 'None');
  console.log('Total stored rows in skill_assessments:', dbRows ? dbRows.length : 0);
  if (dbRows && dbRows.length > 0) {
    dbRows.forEach(r => console.log('  Row:', JSON.stringify(r)));
  } else {
    console.log('  Confirmed: 0 rows currently stored in skill_assessments for any candidate.');
  }

  console.log('\n================================================================');
  console.log('🧪 STEP 2: Submitting 0% Post-Assessment for', testCandId);
  console.log('================================================================');
  
  const submitRes = await fetch(baseUrl + '/api/portal/assessments/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      candidate_id: testCandId,
      trade: 'Advanced CNC Machinist',
      district: 'Pune',
      phase: 'post',
      answers: { 'q-1': 99, 'q-2': 99, 'q-3': 99, 'q-4': 99 } // Wrong answers -> 0%
    })
  });
  const submitData = await submitRes.json();
  console.log('Submit HTTP Status:', submitRes.status);
  console.log('Submit response results:');
  console.log(JSON.stringify(submitData.results, null, 2));

  console.log('\n================================================================');
  console.log('🔍 STEP 3: Checking GET /assessments/results for', testCandId);
  console.log('================================================================');
  const assessRes = await fetch(baseUrl + '/api/portal/assessments/results?candidate_id=' + testCandId + '&trade=Advanced%20CNC%20Machinist', { headers });
  const assessData = await assessRes.json();
  console.log('Assessments Results HTTP Status:', assessRes.status);
  console.log(JSON.stringify(assessData.results, null, 2));

  console.log('\n================================================================');
  console.log('🔍 STEP 4: Checking GET /skill-match/gap-analysis for', testCandId);
  console.log('================================================================');
  const gapRes = await fetch(baseUrl + '/api/portal/skill-match/gap-analysis?candidate_id=' + testCandId + '&trade=Advanced%20CNC%20Machinist&district=Pune', { headers });
  const gapData = await gapRes.json();
  
  console.log('has_post_assessment:', gapData.has_post_assessment);
  console.log('achievedCount:', gapData.achievedCount);
  console.log('achievedSkills:', gapData.achievedSkills);
  
  console.log('\nSkill Gap Vector (Competency vs Demand):');
  (gapData.skillGapVector || []).forEach(sk => {
    console.log('  Skill:', sk.skill_name);
    console.log('    hasPostScore:', sk.hasPostScore);
    console.log('    candidateScore:', sk.candidateScore + '%');
    console.log('    demandFrequency:', sk.demandFrequency + '%');
    console.log('    gapScore:', sk.gapScore);
    console.log('    status:', sk.status);
  });

  console.log('\nTop Recommended Upskilling Priorities:');
  (gapData.recommendations || []).forEach(rec => {
    console.log('  Skill:', rec.skill_name);
    console.log('    post_score:', rec.post_score + '%');
    console.log('    achieved:', rec.achieved);
    console.log('    status:', rec.achieved ? 'Achieved (>=60%)' : 'Needs Upskilling');
  });

  console.log('\nTop Matched Jobs (first 3):');
  (gapData.matchedJobs || []).slice(0, 3).forEach(job => {
    console.log('  Job:', job.title);
    console.log('    match_percentage:', job.match_percentage + '%');
    console.log('    matched_skills:', job.matched_skills);
    console.log('    missing_skills:', job.missing_skills);
  });

  console.log('\n================================================================');
  console.log('🔍 STEP 5: Checking GET /jobs/recommended for', testCandId);
  console.log('================================================================');
  const jobsRes = await fetch(baseUrl + '/api/portal/jobs/recommended?candidate_id=' + testCandId + '&trade=Advanced%20CNC%20Machinist&district=Pune', { headers });
  const jobsData = await jobsRes.json();
  console.log('has_post_assessment:', jobsData.has_post_assessment);
  console.log('Total recommended jobs returned:', jobsData.jobs?.length);
  if (jobsData.jobs && jobsData.jobs.length > 0) {
    const topJob = jobsData.jobs[0];
    console.log('  Top Job:', topJob.title);
    console.log('  Match %:', topJob.match_percentage + '%');
    console.log('  Matched skills count:', topJob.matched_skills?.length);
    console.log('  Missing skills count:', topJob.missing_skills?.length);
  }

  // Assertions for verification
  const is0Pct = (gapData.skillGapVector || []).filter(s => s.hasPostScore).every(s => s.candidateScore === 0);
  const is0Achieved = gapData.achievedCount === 0;
  const is0Match = (gapData.matchedJobs || []).every(j => j.match_percentage === 0 && j.matched_skills.length === 0);
  const isNeedsUpskilling = (gapData.recommendations || []).every(r => !r.achieved);

  console.log('\n================================================================');
  console.log('VERIFICATION SUMMARY:');
  console.log('  All Assessed Competencies are 0% (not 75%):', is0Pct ? 'PASSED' : 'FAILED');
  console.log('  Achieved Skills count is 0:', is0Achieved ? 'PASSED' : 'FAILED');
  console.log('  All Job Match Scores are 0% (not 100%):', is0Match ? 'PASSED' : 'FAILED');
  console.log('  Upskilling Priorities show Needs Upskilling:', isNeedsUpskilling ? 'PASSED' : 'FAILED');
  console.log('================================================================');
}

verifyEndToEnd();
