/**
 * Test Suite: Post-Placement Retention Tracking System
 * Verifies:
 * 1. GET /api/portal/retention/:candidate_id returns 4 checkpoints (Day 30, 90, 180, 365)
 * 2. Auto-creation of 4 retention checkpoint rows on application status = 'Hired'
 * 3. Tripartite Consensus Anti-Fraud Rules:
 *    - Candidate self-report alone leaves status 'pending' (score: 1/3)
 *    - Adding Employer confirmation or Salary Slip achieves score >= 2/3 -> 'verified'
 *    - Separation report ('still_employed: false') immediately marks 'candidate_left'
 * 4. GET /api/portal/retention/aggregates returns policy rates at Day 30, 90, 180, 365
 * 5. POST /api/portal/retention/run-cron executes WhatsApp reminder job
 */

const BASE_URL = 'http://localhost:5000/api/portal';
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo-token-candidate'
};

async function runTests() {
  console.log('🧪 Starting Retention Tracking System Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Retrieve retention timeline for cand-01
    console.log('Test 1: Fetching Retention Timeline for cand-01...');
    const res1 = await fetch(`${BASE_URL}/retention/cand-01`, { headers: AUTH_HEADERS });
    const data1 = await res1.json();
    assert(data1.success === true, 'Response returns success: true');
    assert(Array.isArray(data1.checkpoints) && data1.checkpoints.length === 4, 'Returns exactly 4 checkpoints (Day 30, 90, 180, 365)');
    assert(data1.checkpoints[0].checkpoint_day === 30, 'First checkpoint is Day 30');
    assert(data1.checkpoints[0].status === 'verified', 'Day 30 for cand-01 is verified (tripartite consensus)');
    assert(data1.checkpoints[1].checkpoint_day === 90, 'Second checkpoint is Day 90');
    assert(data1.checkpoints[1].status === 'pending', 'Day 90 for cand-01 is pending');

    // TEST 2: Auto-creation of retention checkpoints when candidate application is marked 'Hired'
    console.log('\nTest 2: Auto-creation of 4 Checkpoints when application is marked Hired...');
    const testCandId = `cand-hired-test-${Date.now()}`;
    // Create an application first
    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        candidate_id: testCandId,
        job_id: 101
      })
    });
    const applyData = await applyRes.json();
    const appId = applyData.application?.application_id;
    assert(Boolean(appId), `Job application created for ${testCandId}`);

    // Update application status to 'Hired'
    const hiredRes = await fetch(`${BASE_URL}/applications/${appId}/status`, {
      method: 'PATCH',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        application_status: 'Hired'
      })
    });
    const hiredData = await hiredRes.json();
    assert(hiredData.success === true, 'Application updated to Hired');
    assert(Array.isArray(hiredData.retention_checkpoints) && hiredData.retention_checkpoints.length === 4, 'Auto-generated 4 retention checkpoints on Hired transition');
    
    // Verify timeline query for this newly hired candidate
    const verifyTimelineRes = await fetch(`${BASE_URL}/retention/${testCandId}`, { headers: AUTH_HEADERS });
    const verifyTimelineData = await verifyTimelineRes.json();
    assert(verifyTimelineData.checkpoints.length === 4, 'Timeline endpoint returns 4 newly generated checkpoints');
    assert(verifyTimelineData.checkpoints.every(c => c.status === 'pending'), 'All 4 checkpoints initially start with status pending');

    // TEST 3: Tripartite Consensus & Anti-Fraud Gating
    console.log('\nTest 3: Tripartite Consensus & Anti-Fraud Rules...');
    // Step 3a: Candidate self-reports alone (1 of 3)
    const selfReportRes = await fetch(`${BASE_URL}/retention/verify`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        candidate_id: testCandId,
        checkpoint_day: 30,
        verification_method: 'candidate_self_report',
        still_employed: true,
        notes: 'Working as Junior CNC Machinist, completed 1st month.'
      })
    });
    const selfReportData = await selfReportRes.json();
    assert(selfReportData.success === true, 'Candidate self-report submitted');
    assert(selfReportData.consensus_score === 1, 'Consensus score is 1 (only candidate confirmed)');
    assert(selfReportData.consensus_met === false, 'Consensus NOT met (requires 2 of 3)');
    assert(selfReportData.checkpoint.status === 'pending', 'Status remains PENDING (anti-fraud prevention prevents single-party verification)');

    // Step 3b: Upload salary slip (2 of 3) -> should achieve consensus and mark 'verified'
    const slipRes = await fetch(`${BASE_URL}/retention/verify`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        candidate_id: testCandId,
        checkpoint_day: 30,
        verification_method: 'salary_slip_upload',
        salary_slip_url: 'https://storage.supabase.co/v1/object/public/salary-slips/cand_pay_stub_sep2026.pdf',
        notes: 'Bank credited salary slip for August 2026.'
      })
    });
    const slipData = await slipRes.json();
    assert(slipData.success === true, 'Salary slip uploaded');
    assert(slipData.consensus_score === 2, 'Consensus score is now 2/3 (candidate + salary slip)');
    assert(slipData.consensus_met === true, 'Consensus MET (2 of 3 independent methods present)');
    assert(slipData.checkpoint.status === 'verified', 'Status successfully transitions to VERIFIED');

    // Step 3c: Candidate separation reporting
    console.log('\nTest 4: Candidate Separation Reporting...');
    const separationRes = await fetch(`${BASE_URL}/retention/verify`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        candidate_id: testCandId,
        checkpoint_day: 90,
        still_employed: false,
        notes: 'Candidate resigned to pursue higher education.'
      })
    });
    const separationData = await separationRes.json();
    assert(separationData.success === true, 'Separation reported successfully');
    assert(separationData.checkpoint.status === 'candidate_left', 'Status marked as candidate_left');

    // TEST 5: Government Policy Retention Aggregates
    console.log('\nTest 5: Government Dashboard Aggregate Retention Rates...');
    const aggRes = await fetch(`${BASE_URL}/retention/aggregates`, { headers: AUTH_HEADERS });
    const aggData = await aggRes.json();
    assert(aggData.success === true, 'Aggregate retention endpoint returns success');
    assert(aggData.total_candidates_tracked >= 4, `Tracks candidates cohort (tracked: ${aggData.total_candidates_tracked})`);
    assert(Boolean(aggData.milestones[30]?.retention_rate_pct), `Day 30 retention rate calculated: ${aggData.milestones[30]?.retention_rate_pct}`);
    assert(Boolean(aggData.milestones[90]?.retention_rate_pct), `Day 90 retention rate calculated: ${aggData.milestones[90]?.retention_rate_pct}`);
    assert(aggData.anti_fraud_metrics?.tripartite_consensus_verified > 0, 'Reports verified tripartite consensus count');
    assert(aggData.anti_fraud_metrics?.single_party_pending_secondary >= 0, 'Reports single-party pending count');

    // TEST 6: Scheduled Cron Runner
    console.log('\nTest 6: Scheduled Cron Runner (WhatsApp Reminders & Aging)...');
    const cronRes = await fetch(`${BASE_URL}/retention/run-cron`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        simulated_date: '2026-09-18',
        timezone: 'Asia/Kolkata'
      })
    });
    const cronData = await cronRes.json();
    assert(cronData.success === true, 'Cron runner executed successfully');
    assert(cronData.timezone === 'Asia/Kolkata', 'Processed in candidate local timezone Asia/Kolkata');
    assert(typeof cronData.reminders_sent === 'number', `Reminders dispatched: ${cronData.reminders_sent}`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n===================================================`);
  console.log(`📊 Retention Tracking Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`===================================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
