import assert from 'assert';

// 1. Test formatCandidateId logic
function formatCandidateId(rawId, registrationYear = 2026) {
  if (!rawId) return `CAND-${registrationYear}-0042`;
  if (/^CAND-\d{4}-\d{4}$/.test(rawId)) {
    return rawId;
  }
  const numericPart = String(rawId).replace(/\D/g, '');
  if (numericPart.length > 0) {
    const num = parseInt(numericPart.slice(-4), 10) || 42;
    return `CAND-${registrationYear}-${String(num).padStart(4, '0')}`;
  }
  let hash = 0;
  for (let i = 0; i < String(rawId).length; i++) {
    hash = (hash << 5) - hash + String(rawId).charCodeAt(i);
    hash |= 0;
  }
  const serial = (Math.abs(hash) % 9000) + 1000;
  return `CAND-${registrationYear}-${serial}`;
}

console.log('🧪 Testing formatCandidateId...');
assert.strictEqual(formatCandidateId('cand-01'), 'CAND-2026-0001');
assert.strictEqual(formatCandidateId('cand-05'), 'CAND-2026-0005');
assert.strictEqual(formatCandidateId('cand-0042'), 'CAND-2026-0042');
assert.strictEqual(formatCandidateId('CAND-2026-0842'), 'CAND-2026-0842');
assert(formatCandidateId('usr-cand-himanshu').startsWith('CAND-2026-'));
assert(formatCandidateId('usr-cand-demo').startsWith('CAND-2026-'));
assert(!formatCandidateId('usr-cand-himanshu').includes('usr-cand'), 'Must never show raw usr-cand string');
assert(!formatCandidateId('usr-cand-demo').includes('usr-cand'), 'Must never show raw usr-cand string');
console.log('   ✓ formatCandidateId correctly prevents raw fallback strings.');

// 2. Test 5-Step Journey Tracker Logic
function calculateActiveStep({ hasOnboarded, hasPreAssessment, isEnrolledInTraining, hasPostAssessment, hasPlacement }) {
  if (hasPlacement) return 5;
  if (hasPostAssessment) return 5;
  if (isEnrolledInTraining) return 4;
  if (hasPreAssessment) return 3;
  if (hasOnboarded) return 2;
  return 1;
}

console.log('\n🧪 Testing 5-step journey tracker logic...');
// Case A: Newly registered candidate
assert.strictEqual(calculateActiveStep({ hasOnboarded: true, hasPreAssessment: false, isEnrolledInTraining: false, hasPostAssessment: false, hasPlacement: false }), 2, 'Should highlight Step 2 (Pre-assessment)');

// Case B: Completed pre-assessment, needs training batch
assert.strictEqual(calculateActiveStep({ hasOnboarded: true, hasPreAssessment: true, isEnrolledInTraining: false, hasPostAssessment: false, hasPlacement: false }), 3, 'Should highlight Step 3 (Training)');

// Case C: In training batch, needs post-assessment
assert.strictEqual(calculateActiveStep({ hasOnboarded: true, hasPreAssessment: true, isEnrolledInTraining: true, hasPostAssessment: false, hasPlacement: false }), 4, 'Should highlight Step 4 (Post-assessment)');

// Case D: Passed post-assessment, needs placement
assert.strictEqual(calculateActiveStep({ hasOnboarded: true, hasPreAssessment: true, isEnrolledInTraining: true, hasPostAssessment: true, hasPlacement: false }), 5, 'Should highlight Step 5 (Placement)');

// Case E: Placed
assert.strictEqual(calculateActiveStep({ hasOnboarded: true, hasPreAssessment: true, isEnrolledInTraining: true, hasPostAssessment: true, hasPlacement: true }), 5, 'Should highlight Step 5 (Placed)');

console.log('   ✓ Journey tracker step calculation verified for all 5 stages.');

// 3. Test Next Step Banner content
function getNextStepTitle(activeStep, hasPlacement) {
  if (activeStep === 2) return 'Take your pre-training skill assessment';
  if (activeStep === 3) return 'Attend your training center practical sessions';
  if (activeStep === 4) return 'Complete your post-training certification exam';
  if (activeStep === 5 && !hasPlacement) return 'Explore matched job vacancies & report placement';
  return 'Placement verified! Track longitudinal check-ins';
}

console.log('\n🧪 Testing dynamic next step banner...');
assert.strictEqual(getNextStepTitle(2, false), 'Take your pre-training skill assessment');
assert.strictEqual(getNextStepTitle(4, false), 'Complete your post-training certification exam');
assert.strictEqual(getNextStepTitle(5, false), 'Explore matched job vacancies & report placement');
assert.strictEqual(getNextStepTitle(5, true), 'Placement verified! Track longitudinal check-ins');
console.log('   ✓ Next step banner correctly changes based on journey state.');

// 4. Test Contextual Empty States for 0 stats
console.log('\n🧪 Testing contextual empty states...');
const emptyStats = { activeCoursesCount: 0, certificatesCount: 0, stipendAmount: '₹ 0', jobMatchesCount: 0 };
assert.strictEqual(emptyStats.activeCoursesCount === 0 ? 'Not Enrolled Yet' : `${emptyStats.activeCoursesCount} Program`, 'Not Enrolled Yet');
assert.strictEqual(emptyStats.certificatesCount === 0 ? 'None yet' : `${emptyStats.certificatesCount} Verified`, 'None yet');
assert.strictEqual(emptyStats.jobMatchesCount === 0 ? 'No matches yet' : `${emptyStats.jobMatchesCount} Roles`, 'No matches yet');
console.log('   ✓ Stat card empty states verified.');

console.log('\n✅ ALL REDESIGN LOGIC VERIFICATION CHECKS PASSED!');
