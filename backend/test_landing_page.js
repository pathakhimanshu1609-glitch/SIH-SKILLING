import assert from 'assert';

const baseUrl = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Public Landing Page Endpoints Verification...\n');

  // Test 1: Fetch public landing data without token
  console.log('1. Testing GET /api/portal/public/landing-data (unauthenticated)...');
  const res1 = await fetch(`${baseUrl}/api/portal/public/landing-data`);
  assert.strictEqual(res1.status, 200);
  const data1 = await res1.json();

  assert.strictEqual(data1.success, true);
  assert(Array.isArray(data1.trades) && data1.trades.length >= 3, 'Expected at least 3 dynamic trades');
  assert(data1.trades.some(t => t.trade_name === 'Advanced CNC Machinist'));
  assert(data1.trades.some(t => t.trade_name === 'Solar PV Installer & Technician'));
  assert(data1.trades.some(t => t.trade_name === 'EV Battery Maintenance Specialist'));
  console.log(`   ✅ Dynamic Trades from skills: ${data1.trades.map(t => t.trade_name).join(', ')}`);

  // Test 2: Verify partner training centers with real counts
  console.log('\n2. Testing partner training centers with real candidate counts...');
  assert(Array.isArray(data1.training_centers) && data1.training_centers.length >= 4);
  const apex = data1.training_centers.find(c => c.id === 'tc-01');
  assert(apex, 'Apex center should exist');
  assert(apex.candidates_trained > 0, 'Candidates trained count should be real positive number');
  assert(apex.accreditation.includes('NCVT'), 'Affiliation badge should indicate NCVT');
  console.log(`   ✅ Partner Centers: ${apex.name} (${apex.candidates_trained_formatted})`);

  // Test 3: Verify verified success metrics
  console.log('\n3. Testing verified metrics & trust badge...');
  assert(data1.verified_metrics.placement_rate > 0);
  assert(data1.verified_metrics.average_salary_uplift > 0);
  assert(data1.verified_metrics.trust_badge.includes('EMPLOYER-VERIFIED'), 'Must include employer-verified trust badge');
  console.log(`   ✅ Placement Rate: ${data1.verified_metrics.placement_rate_label}, Avg Salary Uplift: ${data1.verified_metrics.average_salary_uplift_label}`);
  console.log(`   ✅ Trust Signal: "${data1.verified_metrics.trust_badge}"`);

  // Test 4: Submit valid enrollment lead
  console.log('\n4. Testing POST /api/portal/public/enrollment-leads...');
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const res2 = await fetch(`${baseUrl}/api/portal/public/enrollment-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priyanka Shinde',
      phone: testPhone,
      district: 'Pune',
      trade: 'Solar PV Installer & Technician',
      notes: 'Interested in solar rooftop certification'
    })
  });
  assert.strictEqual(res2.status, 201);
  const data2 = await res2.json();
  assert.strictEqual(data2.success, true);
  assert.strictEqual(data2.lead.name, 'Priyanka Shinde');
  assert.strictEqual(data2.lead.phone, testPhone);
  console.log(`   ✅ Lead registered: ID ${data2.lead.id}, Status: ${data2.lead.status}`);

  // Test 5: Rejection of invalid phone or missing fields
  console.log('\n5. Testing validation on enrollment leads (invalid phone rejection)...');
  const res3 = await fetch(`${baseUrl}/api/portal/public/enrollment-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Invalid Test',
      phone: '123',
      district: 'Pune',
      trade: 'Advanced CNC Machinist'
    })
  });
  assert.strictEqual(res3.status, 400);
  console.log('   ✅ Correctly rejected invalid phone number with 400 Bad Request');

  console.log('\n🎉 ALL PUBLIC LANDING PAGE BACKEND TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
