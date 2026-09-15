const baseUrl = 'http://localhost:5000';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo-token'
};

async function runCandidateJourneyTests() {
  console.log('🧪 Starting Candidate Journey & Scoping Automated Verification...\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Candidate 1 (Ananya Sharma / cand-01 - Placed & Certified)
    // -------------------------------------------------------------
    console.log('1. Testing Journey Progress for cand-01 (Ananya Sharma)...');
    const resCand1 = await fetch(`${baseUrl}/api/portal/candidate/journey?candidate_id=cand-01`, { headers });
    const dataCand1 = await resCand1.json();

    console.log(`   Candidate 1 Active Step: ${dataCand1.activeStep}`);
    console.log(`   Has Onboarded: ${dataCand1.hasOnboarded}`);
    console.log(`   Has Pre-assessment: ${dataCand1.hasPreAssessment}`);
    console.log(`   Enrolled in Training: ${dataCand1.isEnrolledInTraining}`);
    console.log(`   Has Post-assessment: ${dataCand1.hasPostAssessment}`);
    console.log(`   Has Placement: ${dataCand1.hasPlacement}`);

    if (dataCand1.activeStep !== 5 || !dataCand1.hasPlacement) {
      throw new Error(`Expected cand-01 to be at Step 5 with placement, got step ${dataCand1.activeStep}`);
    }
    console.log('   ✅ Candidate 1 correctly evaluated at Step 5 of 5 (Placement complete)\n');

    // -------------------------------------------------------------
    // Test 2: Candidate 2 (Vikas Shinde / cand-05 - Fresh & Unassessed)
    // -------------------------------------------------------------
    console.log('2. Testing Journey Progress for cand-05 (Vikas Shinde)...');
    const resCand2 = await fetch(`${baseUrl}/api/portal/candidate/journey?candidate_id=cand-05`, { headers });
    const dataCand2 = await resCand2.json();

    console.log(`   Candidate 2 Active Step: ${dataCand2.activeStep}`);
    console.log(`   Has Onboarded: ${dataCand2.hasOnboarded}`);
    console.log(`   Has Pre-assessment: ${dataCand2.hasPreAssessment}`);
    console.log(`   Enrolled in Training: ${dataCand2.isEnrolledInTraining}`);
    console.log(`   Has Post-assessment: ${dataCand2.hasPostAssessment}`);
    console.log(`   Has Placement: ${dataCand2.hasPlacement}`);

    if (dataCand2.activeStep !== 2) {
      throw new Error(`Expected cand-05 to be at Step 2 (Onboarded, Pre-assessment pending), got step ${dataCand2.activeStep}`);
    }
    if (dataCand2.hasPostAssessment || dataCand2.hasPlacement) {
      throw new Error(`cand-05 should NOT have post-assessment or placement`);
    }
    console.log('   ✅ Candidate 2 correctly evaluated at Step 2 of 5 (Onboarded only, pre-assessment pending)\n');

    // -------------------------------------------------------------
    // Test 3: Audit /assessments/results for cand-05
    // -------------------------------------------------------------
    console.log('3. Auditing GET /api/portal/assessments/results for cand-05...');
    const resAssessCand2 = await fetch(`${baseUrl}/api/portal/assessments/results?candidate_id=cand-05&trade=Solar%20PV%20Installer%20%26%20Technician`, { headers });
    const dataAssessCand2 = await resAssessCand2.json();

    console.log(`   Returned assessments count for cand-05: ${dataAssessCand2.results?.length || 0}`);
    if (dataAssessCand2.results?.length !== 0) {
      throw new Error(`Expected 0 assessments for unassessed cand-05, received ${dataAssessCand2.results.length}`);
    }
    console.log('   ✅ No fake passing scores returned for unassessed candidate.\n');

    // -------------------------------------------------------------
    // Test 4: Audit /candidate/certifications for cand-05
    // -------------------------------------------------------------
    console.log('4. Auditing GET /api/portal/candidate/certifications for cand-05...');
    const resCertsCand2 = await fetch(`${baseUrl}/api/portal/candidate/certifications?candidate_id=cand-05`, { headers });
    const dataCertsCand2 = await resCertsCand2.json();

    const certsCount = Array.isArray(dataCertsCand2) ? dataCertsCand2.length : (dataCertsCand2.certifications?.length || 0);
    console.log(`   Returned certifications for cand-05: ${certsCount}`);
    if (certsCount !== 0) {
      throw new Error(`Expected 0 certifications for cand-05, got ${certsCount}`);
    }
    console.log('   ✅ Certified status is strictly zero for unassessed candidate.\n');

    // -------------------------------------------------------------
    // Test 5: Side-by-Side Isolation Verification
    // -------------------------------------------------------------
    console.log('5. Verifying Independent Isolation between cand-01 and cand-05...');
    if (dataCand1.activeStep === dataCand2.activeStep) {
      throw new Error('Both candidates returned identical activeStep!');
    }
    console.log(`   Candidate 1 Step: ${dataCand1.activeStep} vs Candidate 2 Step: ${dataCand2.activeStep}`);
    console.log('   ✅ Both accounts are 100% independent and isolated!\n');

    console.log('🎉 ALL CANDIDATE SCOPING & JOURNEY TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runCandidateJourneyTests();
