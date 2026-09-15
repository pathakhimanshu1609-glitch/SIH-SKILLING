// Automated verification test suite for Job Applications & Recommended Jobs
import assert from 'assert';

const baseUrl = 'http://localhost:5000';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo-token-candidate'
};

async function runTests() {
  console.log('🧪 Starting Job Applications & Recommended Jobs Verification Suite...\n');

  // Test 1: Empty state for candidate without completed post-assessment (cand-05 has no post assessment)
  console.log('1. Testing GET /api/portal/jobs/recommended for cand-05 (no post-assessment)...');
  const res1 = await fetch(`${baseUrl}/api/portal/jobs/recommended?candidate_id=cand-05&trade=Advanced%20CNC%20Machinist&district=Pune`, { headers });
  const data1 = await res1.json();
  assert.strictEqual(res1.status, 200);
  assert.strictEqual(data1.has_post_assessment, false, 'Expected has_post_assessment to be false for cand-05');
  assert.strictEqual(data1.jobs.length, 0, 'Expected 0 jobs returned when post-assessment not completed');
  console.log('   ✅ Correctly returned empty state gating flag: has_post_assessment = false');

  // Test 2: Recommended jobs for candidate WITH post-assessment (cand-01)
  console.log('\n2. Testing GET /api/portal/jobs/recommended for cand-01 (post-assessment completed)...');
  const res2 = await fetch(`${baseUrl}/api/portal/jobs/recommended?candidate_id=cand-01&trade=Advanced%20CNC%20Machinist&district=Pune`, { headers });
  const data2 = await res2.json();
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(data2.has_post_assessment, true, 'Expected has_post_assessment to be true for cand-01');
  assert(data2.jobs.length > 0, 'Expected ranked jobs for cand-01');
  assert(data2.jobs[0].match_percentage !== undefined, 'Expected match_percentage per job');
  assert(Array.isArray(data2.jobs[0].matched_skills), 'Expected matched_skills array');
  assert(Array.isArray(data2.jobs[0].missing_skills), 'Expected missing_skills array');
  console.log(`   ✅ Returned ${data2.jobs.length} ranked jobs with explainable matching (top match: ${data2.jobs[0].match_percentage}%)`);

  // Test 3: Submit application for a job
  const testCandidate = `test-cand-${Date.now()}`;
  const targetJob = data2.jobs[0];
  console.log(`\n3. Testing POST /api/portal/applications for ${testCandidate} on Job ${targetJob.job_id}...`);
  const res3 = await fetch(`${baseUrl}/api/portal/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      candidate_id: testCandidate,
      job_id: targetJob.job_id
    })
  });
  const data3 = await res3.json();
  assert.strictEqual(res3.status, 201);
  assert.strictEqual(data3.application.application_status, 'Applied');
  assert.strictEqual(data3.application.job_id, targetJob.job_id);
  console.log(`   ✅ Application created with ID: ${data3.application.application_id}, Status: ${data3.application.application_status}`);

  // Test 4: Duplicate application prevention
  console.log('\n4. Testing duplicate application prevention (same candidate & job_id)...');
  const res4 = await fetch(`${baseUrl}/api/portal/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      candidate_id: testCandidate,
      job_id: targetJob.job_id
    })
  });
  assert.strictEqual(res4.status, 409, 'Expected 409 Conflict for duplicate application');
  console.log('   ✅ Correctly rejected duplicate application with 409 Conflict');

  // Test 5: Query applications for candidate joined with job details
  console.log(`\n5. Testing GET /api/portal/applications for ${testCandidate}...`);
  const res5 = await fetch(`${baseUrl}/api/portal/applications?candidate_id=${testCandidate}`, { headers });
  const data5 = await res5.json();
  assert.strictEqual(res5.status, 200);
  assert.strictEqual(data5.applications.length, 1);
  const fetchedApp = data5.applications[0];
  assert.strictEqual(fetchedApp.job.title, targetJob.title);
  assert.strictEqual(fetchedApp.job.company, targetJob.company);
  assert.strictEqual(fetchedApp.job.district, targetJob.district);
  console.log(`   ✅ Query returned application joined with: "${fetchedApp.job.title}" at ${fetchedApp.job.company} (${fetchedApp.job.district})`);

  // Test 6: Update application status to 'Shortlisted' then 'Interviewing'
  console.log('\n6. Testing status progression: Applied -> Interviewing...');
  const res6 = await fetch(`${baseUrl}/api/portal/applications/${fetchedApp.application_id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ application_status: 'Interviewing' })
  });
  const data6 = await res6.json();
  assert.strictEqual(res6.status, 200);
  assert.strictEqual(data6.application.application_status, 'Interviewing');
  console.log('   ✅ Status updated to Interviewing');

  // Test 7: Update application status to 'Hired' -> verify automatic placement & check-ins generation
  console.log('\n7. Testing status update to "Hired" (auto-placement & 30/90/180/365 check-in generation)...');
  const res7 = await fetch(`${baseUrl}/api/portal/applications/${fetchedApp.application_id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ application_status: 'Hired' })
  });
  const data7 = await res7.json();
  assert.strictEqual(res7.status, 200);
  assert.strictEqual(data7.application.application_status, 'Hired');
  assert.strictEqual(data7.employment_record.self_reported_status, 'Placed');
  assert(data7.employment_record.placement_date, 'Expected placement_date to be set');
  assert.strictEqual(data7.checkins.length, 4, 'Expected 4 longitudinal check-in milestones (30, 90, 180, 365)');
  console.log(`   ✅ Auto-placed in employment_records: Status = ${data7.employment_record.self_reported_status}, Date = ${data7.employment_record.placement_date}`);
  console.log(`   ✅ Generated ${data7.checkins.length} checkin rows: ${data7.checkins.map(c => `${c.interval_day}d`).join(', ')}`);

  // Test 8: Ensure duplicate check-in rows are NOT created if already present
  console.log('\n8. Testing no duplicate check-ins on repeated Hired trigger...');
  const res8 = await fetch(`${baseUrl}/api/portal/applications/${fetchedApp.application_id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ application_status: 'Hired' })
  });
  const data8 = await res8.json();
  assert.strictEqual(data8.checkins.length, 4, 'Expected still exactly 4 checkins (no duplicate rows)');
  console.log('   ✅ No duplicate check-in rows created on re-update');

  console.log('\n🎉 ALL 8 BACKEND INTEGRATION TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
