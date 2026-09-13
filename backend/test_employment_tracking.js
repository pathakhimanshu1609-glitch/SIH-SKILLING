// Integration test for unified employment tracking data model & gating rules
async function runTests() {
  const baseUrl = 'http://localhost:5000';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token-candidate'
  };
  const empHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token-employer'
  };
  const tcHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token-training_center'
  };
  const govtHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token-government'
  };
  console.log('🧪 Starting Employment Tracking & Check-in Model Verification...\n');

  // Test 1: Fetch candidate record for cand-01 (Placed with Day 30 submitted)
  console.log('1. Testing GET /api/portal/employment/record for cand-01...');
  const res1 = await fetch(`${baseUrl}/api/portal/employment/record?candidate_id=cand-01`, { headers });
  const data1 = await res1.json();
  if (!res1.ok || !data1.record) throw new Error('Failed to fetch cand-01 record');
  console.log(`   Candidate: ${data1.record.candidate_name}, Status: ${data1.record.self_reported_status}`);
  console.log(`   Check-ins count: ${data1.checkins.length}`);
  const day30 = data1.checkins.find(c => c.interval_day === 30);
  const day90 = data1.checkins.find(c => c.interval_day === 90);
  console.log(`   Day 30 submitted: ${day30?.submitted_at ? 'YES (' + day30.submitted_at + ')' : 'NO'}`);
  console.log(`   Day 90 submitted: ${day90?.submitted_at ? 'YES' : 'NO (Upcoming)'}`);
  if (!day30 || !day30.submitted_at) throw new Error('Expected Day 30 to be submitted for cand-01');

  // Test 2: Cand-05 (Applied candidate - no premature 365-day checkins)
  console.log('\n2. Testing GET /api/portal/employment/record for cand-05 (Unplaced / Applied)...');
  const res2 = await fetch(`${baseUrl}/api/portal/employment/record?candidate_id=cand-05`, { headers });
  const data2 = await res2.json();
  console.log(`   Cand-05 Status: ${data2.record.self_reported_status}, Checkins: ${data2.checkins.length}`);
  if (data2.record.self_reported_status !== 'Applied') throw new Error('Expected status Applied for cand-05');
  if (data2.checkins.length !== 0) throw new Error('Expected 0 checkins for unplaced candidate');

  // Test 3: Self-report cand-05 to 'Placed' -> Verify auto-generation of 4 checkins
  console.log('\n3. Testing POST /api/portal/employment/self-report for cand-05 (first placement)...');
  const res3 = await fetch(`${baseUrl}/api/portal/employment/self-report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      candidate_id: 'cand-05',
      status: 'Placed',
      employer_id: 'emp-02',
      salary_band: '₹ 25,000 - ₹ 30,000 / mo',
      role_match: true
    })
  });
  const data3 = await res3.json();
  if (!res3.ok || !data3.checkins_generated) throw new Error('Failed to auto-generate checkins on first placement');
  console.log(`   Checkins generated: ${data3.checkins_generated}`);
  console.log(`   Placement Date: ${data3.record.placement_date}`);
  console.log(`   Created intervals: ${data3.checkins.map(c => `${c.interval_day}d (due ${c.due_date})`).join(', ')}`);
  if (data3.checkins.length !== 4) throw new Error('Expected 4 checkin milestones');

  // Test 4: Gating test - Attempt to submit Day 365 when due date has NOT arrived
  console.log('\n4. Testing check-in gating rule (premature submission should fail)...');
  const res4 = await fetch(`${baseUrl}/api/portal/employment/checkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      record_id: data3.record.id,
      candidate_id: 'cand-05',
      interval_day: 365,
      current_date: data3.record.placement_date, // on placement day, 365 is far in future!
      continued_employment_status: 'Still Employed'
    })
  });
  const data4 = await res4.json();
  console.log(`   HTTP status: ${res4.status} (Expected 400)`);
  console.log(`   Rejection message: ${data4.error}`);
  if (res4.status !== 400) throw new Error('Expected 400 rejection for premature checkin');

  // Test 5: Submit check-in once due date has passed
  console.log('\n5. Testing check-in submission once due date has arrived...');
  const res5 = await fetch(`${baseUrl}/api/portal/employment/checkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      record_id: data3.record.id,
      candidate_id: 'cand-05',
      interval_day: 30,
      current_date: '2026-10-30', // after 30 days
      continued_employment_status: 'Still Employed',
      role_match_confirmation: true,
      salary_band_change: 'Increased'
    })
  });
  const data5 = await res5.json();
  if (!res5.ok) throw new Error('Failed to submit due checkin: ' + data5.error);
  console.log(`   Check-in saved: interval 30 submitted_at = ${data5.checkin.submitted_at}`);

  // Test 6: Employer verification queue & confirm action
  console.log('\n6. Testing Employer verification queue and confirm action...');
  const res6a = await fetch(`${baseUrl}/api/portal/employment/employer-records?employer_id=emp-02`, { headers: empHeaders });
  const data6a = await res6a.json();
  console.log(`   Employer emp-02 records count: ${data6a.records.length}`);
  
  const res6b = await fetch(`${baseUrl}/api/portal/employment/employer-confirm`, {
    method: 'POST',
    headers: empHeaders,
    body: JSON.stringify({
      record_id: data3.record.id,
      action: 'confirm'
    })
  });
  const data6b = await res6b.json();
  console.log(`   Confirm result: ${data6b.message}, employer_confirmed = ${data6b.record.employer_confirmed}`);
  if (!data6b.record.employer_confirmed) throw new Error('Expected employer_confirmed to be true');

  // Test 7: Training center read-only joined table
  console.log('\n7. Testing Training Center read-only records...');
  const res7 = await fetch(`${baseUrl}/api/portal/employment/tc-records?training_center_id=tc-01`, { headers: tcHeaders });
  const data7 = await res7.json();
  console.log(`   TC records count: ${data7.records.length}`);
  data7.records.forEach(r => {
    console.log(`   - ${r.candidate_name}: Status=${r.self_reported_status}, Confirmed=${r.employer_confirmed ? 'YES' : 'NO'}, Checkins=${r.completed_checkins}/${r.total_checkins}`);
  });

  // Test 8: Government aggregates
  console.log('\n8. Testing Government employment aggregates...');
  const res8 = await fetch(`${baseUrl}/api/portal/employment/government-aggregates`, { headers: govtHeaders });
  const data8 = await res8.json();
  console.log('   Summary:', JSON.stringify(data8.summary));
  console.log('   Districts count:', data8.by_district.length);
  console.log('   Trades count:', data8.by_trade.length);
  console.log('   Schemes count:', data8.by_scheme.length);
  if (typeof data8.summary.total_placements !== 'number') throw new Error('Missing total_placements in aggregates');
  if (typeof data8.summary.verified_percentage !== 'number') throw new Error('Missing verified_percentage in aggregates');
  if (typeof data8.summary.checkin_completion_percentage !== 'number') throw new Error('Missing checkin_completion_percentage in aggregates');

  console.log('\n✅ ALL 8 INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
