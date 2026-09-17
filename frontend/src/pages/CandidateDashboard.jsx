import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { fetchWithAuth } from '../lib/api';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  IndianRupee, 
  Target, 
  TrendingUp, 
  UserCheck, 
  ArrowRight, 
  Download, 
  AlertCircle, 
  BarChart2, 
  Check, 
  Briefcase, 
  Search, 
  MapPin, 
  Building2, 
  FileCheck, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Layers, 
  ChevronRight, 
  GraduationCap,
  Phone,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  ArrowUpRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { 
  LockedCompetencyIllustration, 
  RoleCandidateIllustration 
} from '../components/common/TwoToneIllustrations';
import { RecommendedJobsPage } from './RecommendedJobsPage';
import { MyApplicationsPage } from './MyApplicationsPage';
import { useCountUp } from '../hooks/useCountUp';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { SkillAssistant } from '../components/common/SkillAssistant';

/**
 * Format candidate ID to guarantee a clean, government-standard format (CAND-{year}-{serial}).
 * Never outputs raw fallback strings like 'CAND-usr-cand'.
 */
const formatCandidateId = (rawId, registrationYear = 2026) => {
  if (!rawId) return `CAND-${registrationYear}-0042`;
  
  // If already in clean CAND-YYYY-NNNN format, preserve it
  if (/^CAND-\d{4}-\d{4}$/.test(rawId)) {
    return rawId;
  }

  // Extract trailing digits if present
  const numericPart = String(rawId).replace(/\D/g, '');
  if (numericPart.length > 0) {
    const num = parseInt(numericPart.slice(-4), 10) || 42;
    return `CAND-${registrationYear}-${String(num).padStart(4, '0')}`;
  }

  // Deterministic hash of string ID into 4-digit serial
  let hash = 0;
  for (let i = 0; i < String(rawId).length; i++) {
    hash = (hash << 5) - hash + String(rawId).charCodeAt(i);
    hash |= 0;
  }
  const serial = (Math.abs(hash) % 9000) + 1000;
  return `CAND-${registrationYear}-${serial}`;
};

export const CandidateDashboard = ({ activeTab, onNavigateTab }) => {
  const { user, role, candidateProfile: contextCandProfile, isProfileLoading, session } = useAuth();

  // Active candidate profile resolved synchronously from top-level AuthContext
  const activeCandidate = contextCandProfile || user?.candidateProfile || user?.candidateRecord || {
    id: user?.candidateRecord?.id || user?.candidateProfile?.id || user?.id || 'cand-01',
    user_id: user?.id || 'usr-cand',
    full_name: user?.full_name || 'Candidate Trainee',
    email: user?.email || 'candidate@skilling.gov.in',
    preferred_trade: 'Advanced CNC Machinist',
    district: 'Pune',
    qualification: 'ITI Machinist Certificate',
    state: 'Maharashtra',
    aadhaar_last4: '8842',
    phone: '+91 98765 43210'
  };

  const [loadingCand, setLoadingCand] = useState(false);
  const [dbStats, setDbStats] = useState({
    activeCoursesCount: activeCandidate.id === 'cand-01' ? 1 : 0,
    certificatesCount: activeCandidate.id === 'cand-01' ? 1 : 0,
    stipendAmount: activeCandidate.id === 'cand-01' ? '₹ 2,250' : '₹ 0',
    jobMatchesCount: activeCandidate.id === 'cand-01' ? 3 : 0
  });

  const [recommendations, setRecommendations] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // States for Journey Tracker, Skill Snapshot & Longitudinal Placement
  const [assessmentSkills, setAssessmentSkills] = useState([]);
  const [employmentRecord, setEmploymentRecord] = useState(null);
  const [journeyData, setJourneyData] = useState(null);

  // Interest banner feedback states
  const [skillingInterestCaptured, setSkillingInterestCaptured] = useState(false);
  const [apprenticeInterestCaptured, setApprenticeInterestCaptured] = useState(false);

  // Animated stat values & bar entrance state
  const animatedCourses = useCountUp(dbStats.activeCoursesCount, 800);
  const animatedCerts = useCountUp(dbStats.certificatesCount, 800);
  const animatedJobs = useCountUp(dbStats.jobMatchesCount, 800);
  const [isBarsMounted, setIsBarsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsBarsMounted(true), 150);
    return () => clearTimeout(timer);
  }, [assessmentSkills]);

  const loadCandidateProfileAndStats = async () => {
    setLoadingCand(true);
    try {
      const candId = activeCandidate.id || user?.candidateRecord?.id || user?.id || 'cand-01';
      const trade = activeCandidate.preferred_trade || 'Advanced CNC Machinist';
      const district = activeCandidate.district || 'Pune';

      console.log(`[CandidateDashboard] loadCandidateProfileAndStats querying candId: "${candId}", trade: "${trade}", district: "${district}"`);

      // Parallel queries strictly filtered by candId
      const [batchRes, assessRes, matchRes, recRes, assessResultsRes, empRecordRes, journeyRes] = await Promise.all([
        supabase.from('batch_candidates').select('batch_id').eq('candidate_id', candId).catch(() => null),
        supabase.from('skill_assessments').select('*').eq('candidate_id', candId).catch(() => null),
        fetchWithAuth(`/api/portal/skill-match/gap-analysis?candidate_id=${candId}&trade=${encodeURIComponent(trade)}&district=${encodeURIComponent(district)}`, {}, role).catch(() => null),
        fetchWithAuth(`/api/portal/candidate/skill-recommendations?candidate_id=${candId}&trade=${encodeURIComponent(trade)}&district=${encodeURIComponent(district)}`, {}, role).catch(() => null),
        fetchWithAuth(`/api/portal/assessments/results?candidate_id=${candId}&trade=${encodeURIComponent(trade)}`, {}, role).catch(() => null),
        fetchWithAuth(`/api/portal/employment/record?candidate_id=${candId}`, {}, role).catch(() => null),
        fetchWithAuth(`/api/portal/candidate/journey?candidate_id=${candId}`, {}, role).catch(() => null)
      ]);

      console.log(`[CandidateDashboard] Received for candId: "${candId}":`, {
        assessResults: assessResultsRes?.results,
        matchedJobsCount: matchRes?.matchedJobs?.length,
        recommendationsCount: recRes?.recommendations?.length
      });

      // Strict per-candidate counting: never default to 1 for unassigned candidates
      const activeBatchesCount = batchRes?.data && batchRes.data.length > 0 
        ? batchRes.data.length 
        : (candId === 'cand-01' ? 1 : 0);

      const passedCerts = assessRes?.data && assessRes.data.length > 0
        ? assessRes.data.filter(a => a.phase === 'post' && Number(a.score) >= 60).length
        : (candId === 'cand-01' ? 1 : 0);

      const jobs = matchRes?.matchedJobs || [];
      const recs = recRes?.recommendations || [];

      const updatedStats = {
        activeCoursesCount: activeBatchesCount,
        certificatesCount: passedCerts,
        stipendAmount: activeBatchesCount > 0 ? `₹ ${(activeBatchesCount * 2250).toLocaleString('en-IN')}` : '₹ 0',
        jobMatchesCount: jobs.length || 0
      };

      setDbStats(updatedStats);
      setMatchedJobs(jobs);
      setRecommendations(recs);

      // Store assessment skills for skill competency snapshot strictly per-candidate
      if (assessResultsRes?.results && Array.isArray(assessResultsRes.results) && assessResultsRes.results.length > 0) {
        setAssessmentSkills(assessResultsRes.results);
      } else if (candId === 'cand-01') {
        // Baseline for demo candidate 1 only
        setAssessmentSkills([
          { skill_name: 'CNC Programming (G-code)', pre_score: 45, post_score: 85, score: 85 },
          { skill_name: 'Machine Setup & Calibration', pre_score: 40, post_score: 75, score: 75 },
          { skill_name: 'Quality & Precision Metrology', pre_score: 55, post_score: 90, score: 90 },
          { skill_name: 'Industrial Safety & Protocols', pre_score: 60, post_score: 80, score: 80 }
        ]);
      } else {
        setAssessmentSkills([]);
      }

      // Store employment record for journey tracking & next-step banner
      if (empRecordRes?.record) {
        setEmploymentRecord(empRecordRes.record);
      }

      // Store journey progression
      if (journeyRes?.steps) {
        setJourneyData(journeyRes);
      }

      const cacheKey = `cand_dash_cache_${candId}`;
      sessionStorage.setItem(cacheKey, JSON.stringify({
        activeCandidate,
        dbStats: updatedStats,
        matchedJobs: jobs,
        recommendations: recs
      }));
    } catch (err) {
      console.warn('Error loading candidate profile and stats:', err);
    } finally {
      setLoadingCand(false);
    }
  };

  const loadCandidateCertifications = async (candIdToUse, tradeDefault = 'Advanced CNC Machinist') => {
    setLoadingCerts(true);
    try {
      let rawAssessments = [];

      // 1. Direct query on skill_assessments joined with skills
      try {
        if (supabase) {
          const { data: dbData, error: dbErr } = await supabase
            .from('skill_assessments')
            .select(`
              assessment_id,
              candidate_id,
              phase,
              score,
              taken_at,
              skills (
                skill_id,
                trade,
                skill_name
              )
            `)
            .eq('candidate_id', candIdToUse)
            .eq('phase', 'post');

          if (!dbErr && dbData && dbData.length > 0) {
            rawAssessments = dbData.map(a => ({
              assessment_id: a.assessment_id,
              phase: a.phase,
              score: Number(a.score),
              taken_at: a.taken_at,
              trade: a.skills?.trade || tradeDefault,
              skill_name: a.skills?.skill_name || 'Competency'
            }));
          }
        }
      } catch (err) {
        console.warn('Skill assessments query notice:', err);
      }

      // 2. Query backend certifications endpoint if DB returned empty
      if (rawAssessments.length === 0) {
        try {
          const apiRes = await fetchWithAuth(`/api/portal/candidate/certifications?candidate_id=${encodeURIComponent(candIdToUse)}`, {}, role);
          if (apiRes && apiRes.certifications && Array.isArray(apiRes.certifications) && apiRes.certifications.length > 0) {
            setCertifications(apiRes.certifications);
            setDbStats(prev => ({ ...prev, certificatesCount: apiRes.certifications.length }));
            setLoadingCerts(false);
            return;
          }
          if (apiRes && apiRes.assessments && Array.isArray(apiRes.assessments) && apiRes.assessments.length > 0) {
            rawAssessments = apiRes.assessments;
          }
        } catch (err) {
          console.warn('Backend certifications fetch notice:', err);
        }
      }

      // 3. Fallback: check locally saved assessments
      if (rawAssessments.length === 0) {
        try {
          const localSaved = sessionStorage.getItem(`cand_assessments_${candIdToUse}`);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              rawAssessments = parsed;
            }
          }
        } catch (e) {}
      }

      // 4. Baseline assessment results for demo candidate 1 only
      if (rawAssessments.length === 0 && candIdToUse === 'cand-01') {
        rawAssessments = [
          { trade: 'Advanced CNC Machinist', skill_name: 'CNC Programming (G-code)', phase: 'post', score: 85, taken_at: '2026-09-01T10:00:00Z' },
          { trade: 'Advanced CNC Machinist', skill_name: 'Machine Setup & Calibration', phase: 'post', score: 75, taken_at: '2026-09-01T10:30:00Z' },
          { trade: 'Advanced CNC Machinist', skill_name: 'Quality & Precision Measurement', phase: 'post', score: 90, taken_at: '2026-09-01T11:00:00Z' },
          { trade: 'Advanced CNC Machinist', skill_name: 'Safety & Maintenance', phase: 'post', score: 85, taken_at: '2026-09-01T11:30:00Z' }
        ];
      }

      // 5. Group skill_assessments by candidate and trade
      const tradeGroups = {};
      rawAssessments.forEach(item => {
        if (item.phase !== 'post') return;
        const tradeName = item.trade || tradeDefault;
        if (!tradeGroups[tradeName]) {
          tradeGroups[tradeName] = [];
        }
        tradeGroups[tradeName].push(item);
      });

      // 6. Check for passing average score (≥60% across that trade's skills)
      const qualifyingCertifications = [];
      Object.keys(tradeGroups).forEach(tradeName => {
        const skillsInTrade = tradeGroups[tradeName];
        const totalScore = skillsInTrade.reduce((sum, s) => sum + Number(s.score || 0), 0);
        const averageScore = Math.round(totalScore / (skillsInTrade.length || 1));

        if (averageScore >= 60) {
          const tradeAbbr = tradeName.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase();
          const candAbbr = String(candIdToUse).replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase();
          qualifyingCertifications.push({
            id: `NCVT-${tradeAbbr}-${candAbbr || '2026'}`,
            trade: tradeName,
            averageScore,
            skillsCount: skillsInTrade.length,
            skills: skillsInTrade,
            issuedDate: '12 Sep 2026',
            verifiedStatus: 'NCVT National Skill Certified'
          });
        }
      });

      setCertifications(qualifyingCertifications);
      setDbStats(prev => ({ ...prev, certificatesCount: qualifyingCertifications.length }));
    } catch (err) {
      console.error('Error loading candidate certifications:', err);
      setCertifications([]);
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    loadCandidateProfileAndStats();
  }, [activeCandidate.id, role]);

  useEffect(() => {
    loadCandidateCertifications(activeCandidate.id, activeCandidate.preferred_trade);
  }, [activeTab, activeCandidate.id]);

  // Real authenticated user identity bindings
  const candEmail = user?.email || session?.user?.email || activeCandidate?.email || 'trainee@skilling.gov.in';
  const candName = user?.full_name 
    || session?.user?.user_metadata?.full_name 
    || activeCandidate?.full_name 
    || (candEmail ? candEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Trainee Candidate');
  const candFirstName = candName.split(' ')[0] || 'Trainee';
  const candTrade = activeCandidate?.preferred_trade || 'Advanced CNC Machinist';
  const candDistrict = activeCandidate?.district || 'Pune';
  const candState = activeCandidate?.state || 'Maharashtra';
  const candPhone = activeCandidate?.phone || user?.phone || user?.user_metadata?.phone || '+91 98765 43210';
  
  // Format candidate ID to always produce CAND-{year}-{sequential number}, e.g. CAND-2026-0001
  const candId = formatCandidateId(activeCandidate?.id || user?.id, 2026);

  // -------------------------------------------------------------
  // 5-STEP JOURNEY TRACKER LOGIC BASED ON REAL DATA:
  // 1. Onboarded: has completed onboarding profile
  // 2. Pre-assessment: has taken pre-assessment baseline
  // 3. Training: enrolled in an active training batch
  // 4. Post-assessment: passed post-assessment certification exam
  // 5. Placement: has an employment_records row (placed / employer verified)
  // -------------------------------------------------------------
  const hasOnboarded = Boolean(activeCandidate?.preferred_trade || activeCandidate?.full_name);
  const hasPreAssessment = journeyData?.hasPreAssessment !== undefined 
    ? journeyData.hasPreAssessment 
    : (assessmentSkills.some(s => s.pre_score !== undefined && s.pre_score !== null && s.pre_score > 0) || (activeCandidate.id === 'cand-01'));
  const isEnrolledInTraining = journeyData?.isEnrolledInTraining !== undefined 
    ? journeyData.isEnrolledInTraining 
    : (dbStats.activeCoursesCount > 0);
  const hasPostAssessment = journeyData?.hasPostAssessment !== undefined 
    ? journeyData.hasPostAssessment 
    : ((dbStats.certificatesCount > 0) || assessmentSkills.some(s => s.post_score !== undefined && s.post_score !== null && s.post_score >= 60));
  const hasPlacement = journeyData?.hasPlacement !== undefined 
    ? journeyData.hasPlacement 
    : (employmentRecord?.self_reported_status === 'Placed');

  let activeStep = journeyData?.activeStep || 1;
  if (!journeyData) {
    if (hasPlacement) {
      activeStep = 5;
    } else if (hasPostAssessment) {
      activeStep = 5; // Ready for placement
    } else if (isEnrolledInTraining) {
      activeStep = 4; // In training, post-assessment exam is next
    } else if (hasPreAssessment) {
      activeStep = 3; // Pre-assessment done, training is next
    } else if (hasOnboarded) {
      activeStep = 2; // Onboarded, pre-assessment is next
    }
  }

  const journeySteps = journeyData?.steps || [
    { step: 1, title: 'Onboarded', desc: 'Profile Registered', isDone: hasOnboarded },
    { step: 2, title: 'Pre-assessment', desc: 'Skill Baseline', isDone: hasPreAssessment },
    { step: 3, title: 'Training', desc: 'Workshop Batch', isDone: isEnrolledInTraining && (hasPostAssessment || hasPlacement) },
    { step: 4, title: 'Post-assessment', desc: 'NCVT Certified', isDone: hasPostAssessment },
    { step: 5, title: 'Placement', desc: 'Industry Hired', isDone: hasPlacement }
  ];

  // Dynamic Profile Completion Calculation
  const calculateProfileCompletion = () => {
    let score = 0;
    if (activeCandidate?.full_name) score += 20;
    if (activeCandidate?.preferred_trade) score += 20;
    if (activeCandidate?.qualification) score += 15;
    if (activeCandidate?.district || activeCandidate?.state) score += 15;
    if (activeCandidate?.aadhaar_last4 || activeCandidate?.is_verified) score += 15;
    if (hasPreAssessment || (assessmentSkills && assessmentSkills.length > 0)) score += 15;
    return Math.min(100, Math.max(20, score));
  };
  const profileCompletionPct = calculateProfileCompletion();

  // Dynamic time-of-day greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sunset };
    return { text: 'Good Evening', icon: Moon };
  };
  const timeGreeting = getTimeGreeting();
  const GreetingIcon = timeGreeting.icon;

  const getNextStepConfig = () => {
    if (activeStep === 2) {
      return {
        icon: <Target className="w-5 h-5 text-white" />,
        badge: 'ACTION REQUIRED • STEP 2',
        title: 'Take your pre-training skill assessment',
        description: `Establish your baseline competency in ${candTrade}. Takes 5 minutes and personalizes your curriculum modules.`,
        buttonText: 'Take Pre-Assessment',
        action: () => onNavigateTab && onNavigateTab('assessment')
      };
    }
    if (activeStep === 3) {
      return {
        icon: <BookOpen className="w-5 h-5 text-white" />,
        badge: 'ACTIVE TRAINING • STEP 3',
        title: 'Attend your training center practical sessions',
        description: `You are enrolled in ${candTrade} at ${candDistrict} skill center. Track your modules and workshop sessions.`,
        buttonText: 'View Enrolled Courses',
        action: () => onNavigateTab && onNavigateTab('courses')
      };
    }
    if (activeStep === 4) {
      return {
        icon: <Award className="w-5 h-5 text-white" />,
        badge: 'CERTIFICATION MILESTONE • STEP 4',
        title: 'Complete your post-training certification exam',
        description: 'Score ≥60% across core modules to unlock your official digital NCVT certificate and activate job matching.',
        buttonText: 'Take Certification Exam',
        action: () => onNavigateTab && onNavigateTab('assessment')
      };
    }
    if (activeStep === 5 && !hasPlacement) {
      return {
        icon: <Briefcase className="w-5 h-5 text-white" />,
        badge: 'PLACEMENT STAGE • STEP 5',
        title: 'Explore matched job vacancies & report placement',
        description: `${dbStats.jobMatchesCount || 'Multiple'} industry vacancies match your verified skills in ${candDistrict}. Apply and report your placement.`,
        buttonText: 'Browse Matching Jobs',
        action: () => onNavigateTab && onNavigateTab('jobs')
      };
    }
    // Has placement: retention check-ins
    return {
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
      badge: 'RETENTION TRACKING • ACTIVE',
      title: 'Placement verified! Track longitudinal check-ins',
      description: `Your placement at ${employmentRecord?.employer_name || 'Tata Advanced Engineering'} is recorded. Complete 30/90/180/365-day check-ins.`,
      buttonText: 'Go to Retention Check-Ins',
      action: () => onNavigateTab && onNavigateTab('employment-status')
    };
  };

  const nextStepConfig = getNextStepConfig();

  // Apply for Job Handler
  const handleApplyJob = (jobId) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs(prev => [...prev, jobId]);
    }
  };

  // Avatar completion ring geometry
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (profileCompletionPct / 100) * ringCircumference;

  // TAB 1: ENROLLED COURSES
  if (activeTab === 'courses') {
    return (
      <div className="space-y-4 font-sans">
        <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-[6px] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                ENROLLED MODULES
              </span>
              <h1 className="text-xl font-bold mt-0.5">Active Skilling Courses for {candName}</h1>
              <p className="text-xs text-slate-300">
                Registered Email: <strong>{candEmail}</strong> • Enrolled in {candTrade} at {candDistrict} Center
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-base">{candTrade} - Core Technical Workshop</h3>
              <p className="text-xs text-slate-500">Center: ITI Aundh Skill Hub, {candDistrict} • Batch Code: BATCH-2026-PUN-01</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              Active • Attendance 92%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Training Scheme</span>
              <span className="text-sm font-bold text-slate-800">PMKVY 4.0 Special Projects</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">DBT Stipend Status</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">₹ 2,250 / month (Active)</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Next Practical Milestone</span>
              <span className="text-sm font-bold text-slate-800">Post-Assessment Evaluation</span>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button 
              onClick={() => onNavigateTab && onNavigateTab('assessment')}
              className="btn-sid-primary text-xs py-2 px-4 shadow-sm"
            >
              Go to Module Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TAB 2: CERTIFICATIONS
  if (activeTab === 'certifications') {
    return (
      <div className="space-y-4 font-sans">
        <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-[6px] p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#D2691E] text-white flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-[#D2691E] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-[4px]">
                  DIGITAL CREDENTIALS
                </span>
                <h1 className="font-display text-xl font-bold mt-0.5">Skill Certifications for {candName}</h1>
                <p className="text-xs text-slate-300">
                  Verified NCVT credentials issued to <strong>{candEmail}</strong> • {certifications.length} Qualifying Trade{certifications.length === 1 ? '' : 's'} (≥60% passing benchmark)
                </p>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab && onNavigateTab('assessment')}
              className="btn-sid-primary text-xs py-2 px-4 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Take New Trade Assessment</span>
            </button>
          </div>
        </div>

        {loadingCerts ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#D2691E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Evaluating post-training competency assessments across trades...
            </p>
          </div>
        ) : certifications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <div 
                key={cert.id || cert.trade}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B3D6B]" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                          {cert.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          NCVT Level 4
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 font-sans leading-snug group-hover:text-[#0B3D6B] transition-colors">
                        {cert.trade}
                      </h3>
                      <p className="text-xs text-slate-500">National Council for Vocational Training Certificate</p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs whitespace-nowrap">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Verified Badge</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Candidate Name</span>
                        <span className="font-bold text-slate-800">{candName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Registered Email</span>
                        <span className="font-bold text-slate-800 truncate block" title={candEmail}>{candEmail}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/80 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Passing Average Score</span>
                        <span className="font-bold text-emerald-700 text-sm font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {cert.averageScore}% (Passed ≥60%)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Skills Assessed</span>
                        <span className="font-bold text-slate-800 text-sm font-mono">
                          {cert.skillsCount || cert.skills?.length || 4} Competencies
                        </span>
                      </div>
                    </div>
                  </div>

                  {cert.skills && cert.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Verified Trade Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skills.map((s, idx) => (
                          <span 
                            key={idx} 
                            className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{s.skill_name}</span>
                            <span className="font-mono text-slate-500 font-bold">({s.score}%)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => onNavigateTab && onNavigateTab('scorecard', { trade: cert.trade })}
                    className="w-full btn-sid-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 font-bold shadow-xs hover:brightness-105 transition-all"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>View Competency Radar Scorecard</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-10 h-10 text-amber-600" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                NCVT Certification Gateway
              </span>
              <h3 className="font-display text-xl font-bold text-slate-800">
                No Skill Certifications Earned Yet
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Certificates are awarded for each trade where you complete a post-training competency assessment with a passing average score of <strong>60% or higher</strong> across all trade skills.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#0B3D6B]" />
                <span>How to Earn Your Certificate:</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>Enroll in or select a registered trade module</li>
                <li>Complete the <strong>Post-Training MCQ Assessment</strong></li>
                <li>Attain an average competency score of <strong>≥60%</strong></li>
                <li>Your verified digital credential will appear here with DigiLocker sync</li>
              </ul>
            </div>

            <button 
              onClick={() => onNavigateTab && onNavigateTab('assessment')}
              className="btn-sid-primary text-xs py-2 px-5 font-bold inline-flex items-center gap-2 shadow-sm"
            >
              <Target className="w-4 h-4" />
              <span>Take Post-Training Assessment Now</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // TAB 3: RECOMMENDED JOBS
  if (activeTab === 'jobs') {
    return <RecommendedJobsPage onNavigateTab={onNavigateTab} />;
  }

  // TAB 4: MY APPLICATIONS
  if (activeTab === 'applications') {
    return <MyApplicationsPage onNavigateTab={onNavigateTab} />;
  }

  // -----------------------------------------------------------------
  // DEFAULT TAB: CANDIDATE OVERVIEW DASHBOARD (WARM CARD-BASED REDESIGN)
  // -----------------------------------------------------------------
  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. GREETING BAR WITH DYNAMIC USER FIRST NAME & TIME-OF-DAY ICON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FDEEE0]/60 border border-[#F8D3B8] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D2691E] text-white flex items-center justify-center shadow-sm">
            <GreetingIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight">
                Hi, {candFirstName}! 👋
              </h1>
              <span className="text-[11px] font-semibold text-[#D2691E] bg-[#FDEEE0] border border-[#F8D3B8] px-2 py-0.5 rounded-full hidden sm:inline-block">
                {timeGreeting.text}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Greetings of the day! Here's your skill progression and employment readiness overview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F8D3B8]/60">
          <span className="text-[11px] font-mono text-[#6B7280] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg shadow-2xs">
            ID: <strong className="text-[#111827]">{candId}</strong>
          </span>
          <button 
            onClick={loadCandidateProfileAndStats}
            disabled={loadingCand}
            title="Refresh Realtime Stats"
            className="p-1.5 text-[#6B7280] hover:text-[#D2691E] bg-white border border-[#E5E7EB] rounded-lg hover:border-[#D2691E]/40 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingCand ? 'animate-spin text-[#D2691E]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. PROFILE CARD + AI GUIDANCE (promotional clutter removed) */}
      <div className="space-y-5">
          {/* PROFILE CARD WITH CIRCULAR PHOTO & COMPLETION RING */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-7 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {/* Circular avatar with SVG completion percentage ring */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-[#E5E7EB]"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-[#D2691E] transition-all duration-1000 ease-out"
                    strokeWidth="5"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                
                <div className="absolute inset-0 m-2 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160"
                    alt={candName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-[#0B3D6B] text-white flex items-center justify-center font-bold text-lg font-mono">
                    {candName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Progress Badge in light blue --color-badge-blue */}
                <span 
                  className="absolute -bottom-1 bg-[#E0E7FF] text-[#1D4ED8] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs border-2 border-white font-mono"
                  title="Profile Completion Rate"
                >
                  {profileCompletionPct}%
                </span>
              </div>

              {/* Profile Details */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#111827] leading-tight">
                      {candName}
                    </h2>
                    <p className="text-xs text-[#6B7280] font-mono flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#6B7280]" />
                      <span>{candPhone}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab('onboarding')}
                    className="btn-sid-primary text-xs py-1.5 px-4 font-semibold shadow-xs self-center sm:self-start"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="bg-[#F8F9FA] text-[#111827] font-medium px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                    Trade: <strong>{candTrade}</strong>
                  </span>
                  <span className="bg-[#F8F9FA] text-[#111827] font-medium px-2.5 py-1 rounded-md border border-[#E5E7EB] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6B7280]" />
                    <span>{candDistrict}, {candState}</span>
                  </span>
                  {/* Aadhaar eKYC inline pill — replaces the old full card */}
                  <span
                    className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors"
                    title="Aadhaar eKYC Verified • DigiLocker linked"
                    onClick={() => onNavigateTab && onNavigateTab('scorecard')}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Aadhaar Verified ••{activeCandidate?.aadhaar_last4 || '8842'}</span>
                  </span>
                </div>

                <p className="text-[11px] text-[#6B7280] pt-0.5 truncate" title={candEmail}>
                  Official Registered Email: <strong className="text-[#111827] font-medium">{candEmail}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* SkillSetuu — Sovereign AI Skill Guidance (open by default) */}
          <SkillAssistant
            candidateId={activeCandidate.id || 'cand-01'}
            trade={candTrade}
            district={candDistrict}
            defaultOpen={true}
          />
        </div>

      {/* 6. FIVE-STEP HORIZONTAL JOURNEY TRACKER */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0B3D6B]" />
              <h2 className="font-display text-base font-bold text-[#111827]">
                Skilling & Employment Journey
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Live milestone progression from registration to verified industry placement
            </p>
          </div>
          <span className="text-xs font-bold text-[#D2691E] bg-[#FDEEE0] border border-[#F8D3B8] px-3.5 py-1.5 rounded-full font-mono shadow-2xs">
            Step {activeStep} of 5: {journeySteps[activeStep - 1]?.title}
          </span>
        </div>

        {/* Stepper visual with animated connecting progress bar */}
        <div className="pt-2 pb-2 overflow-x-auto">
          <div className="relative flex items-center justify-between min-w-[580px] px-6">
            {/* Background line connecting all steps */}
            <div className="absolute left-12 right-12 top-5 h-1 bg-[#E5E7EB] z-0" />
            
            {/* Active colored progress line with 500ms ease */}
            <div 
              className="absolute left-12 top-5 h-1 bg-[#D2691E] transition-all duration-500 ease-out z-0"
              style={{ width: `${Math.max(0, Math.min(100, ((activeStep - 1) / 4) * 100))}%` }}
            />

            {journeySteps.map((s) => {
              const isCompleted = s.isDone && s.step < activeStep;
              const isCurrent = s.step === activeStep;
              const isUpcoming = s.step > activeStep;

              return (
                <div key={s.step} className="relative z-10 flex flex-col items-center group">
                  {/* Step Node Icon */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : isCurrent
                        ? 'bg-[#D2691E] text-white ring-4 ring-orange-200 animate-pulse ring-offset-2 ring-offset-white'
                        : 'bg-white text-[#6B7280] border-2 border-[#E5E7EB]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : isCurrent ? (
                      <span className="font-mono text-sm">{s.step}</span>
                    ) : (
                      <span className="font-mono text-[#6B7280]">{s.step}</span>
                    )}
                  </div>

                  {/* Step Labels */}
                  <div className="text-center mt-2.5">
                    <p className={`text-xs font-bold ${
                      isCurrent ? 'text-[#D2691E]' : isCompleted ? 'text-[#111827]' : 'text-[#6B7280]'
                    }`}>
                      {s.title}
                    </p>
                    <span className={`inline-block text-[10px] mt-0.5 px-2 py-0.5 rounded font-medium ${
                      isCompleted 
                        ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200' 
                        : isCurrent 
                        ? 'text-[#D2691E] bg-[#FDEEE0] font-bold border border-[#F8D3B8]' 
                        : 'text-[#6B7280] bg-[#F8F9FA]'
                    }`}>
                      {isCompleted ? 'Completed' : isCurrent ? 'Current Step' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. "ACTION REQUIRED" RECOMMENDED NEXT-STEP CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B3D6B] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              {nextStepConfig.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#0B3D6B] px-2.5 py-0.5 rounded">
                  {nextStepConfig.badge}
                </span>
                <span className="text-xs text-slate-500 font-medium">Recommended Next Action</span>
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">{nextStepConfig.title}</h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{nextStepConfig.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0 justify-end">
            <button
              onClick={nextStepConfig.action}
              className="w-full sm:w-auto btn-sid-primary text-xs py-2.5 px-6 font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <span>{nextStepConfig.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 8. OVERVIEW METRICS WITH COUNT-UP & ENCOURAGING EMPTY STATES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Schemes (Blue) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('courses')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Schemes</p>
            {dbStats.activeCoursesCount > 0 ? (
              <>
                <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{animatedCourses} Program</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">{candTrade}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-700 mt-1">Not Enrolled Yet</p>
                <p className="text-[11px] text-blue-600 font-medium mt-1 group-hover:underline flex items-center gap-0.5">
                  <span>Browse Accredited Schemes</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3D6B] border border-blue-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Certificates (Gold) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab(dbStats.certificatesCount > 0 ? 'certifications' : 'assessment')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates</p>
            {dbStats.certificatesCount > 0 ? (
              <>
                <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{animatedCerts} Verified</p>
                <p className="text-[11px] text-blue-600 font-medium mt-1">NCVT Credentials</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-700 mt-1">None yet</p>
                <p className="text-[11px] text-amber-700 font-medium mt-1 group-hover:underline flex items-center gap-0.5">
                  <span>Earn after post-assessment (≥60%)</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FDEEE0] text-[#D2691E] border border-[#F8D3B8] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Direct Stipend (Green) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('courses')}
          className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Direct Stipend (DBT)</p>
            {dbStats.activeCoursesCount > 0 && dbStats.stipendAmount && dbStats.stipendAmount !== '₹ 0' ? (
              <>
                <p className="text-2xl font-bold text-[#111827] mt-1">{dbStats.stipendAmount}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">DBT Verified</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[#111827] mt-1">₹ 0 Available</p>
                <p className="text-[11px] text-[#6B7280] font-medium mt-1 group-hover:underline flex items-center gap-0.5">
                  <span>Unlocked during active batch</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Job Matches (Purple) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab(dbStats.jobMatchesCount > 0 ? 'jobs' : 'assessment')}
          className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Job Matches</p>
            {dbStats.jobMatchesCount > 0 ? (
              <>
                <p className="text-2xl font-bold text-[#111827] mt-1 font-mono">{animatedJobs} Roles</p>
                <p className="text-[11px] text-[#6B7280] mt-1">{candDistrict} Region</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[#111827] mt-1">No matches yet</p>
                <p className="text-[11px] text-purple-700 font-medium mt-1 group-hover:underline flex items-center gap-0.5">
                  <span>Complete assessment to unlock</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 9. QUICK LAUNCHPAD GRID */}
      <ScrollReveal direction="up" delay={50}>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h2 className="font-display text-base font-bold text-[#111827] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D2691E]" />
                <span>Quick Launchpad</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Instant access to core candidate tools, assessments, scorecards, and opportunities
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Skill Assessment */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('assessment')}
              className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:bg-white hover:border-[#D2691E]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#FDEEE0] text-[#D2691E] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#D2691E] transition-colors">
                  Skill MCQ Exam
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Take baseline or certification tests to evaluate and benchmark your competencies.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-[#E5E7EB] flex items-center text-xs font-bold text-[#D2691E]">
                <span>Launch Test</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 2: Competency Radar Scorecard */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('scorecard')}
              className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:bg-white hover:border-blue-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-100/80 text-[#0B3D6B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#0B3D6B] transition-colors">
                  Competency Radar
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Review your multi-dimensional skill radar chart and verified NCVET credentials.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-[#E5E7EB] flex items-center text-xs font-bold text-[#0B3D6B]">
                <span>View Scorecard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 3: Job Matches */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('jobs')}
              className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:bg-white hover:border-emerald-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-emerald-700 transition-colors">
                  Recommended Jobs
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Browse AI-matched vacancies filtered by your verified district and trade skills.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-[#E5E7EB] flex items-center text-xs font-bold text-emerald-700">
                <span>Browse Vacancies</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 4: Placement & Retention */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('employment-status')}
              className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:bg-white hover:border-purple-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] group-hover:text-purple-700 transition-colors">
                  Placement Check-Ins
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Record offer letters, employer verification, and complete 30-365 day retention check-ins.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-[#E5E7EB] flex items-center text-xs font-bold text-purple-700">
                <span>Check-In Portal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 10. SKILL COMPETENCY SNAPSHOT PREVIEW */}
      <ScrollReveal direction="up" delay={80}>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#0B3D6B]" />
                <h2 className="font-display text-base font-bold text-[#111827]">Skill Competency Snapshot</h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Proficiency breakdown across core {candTrade} assessment modules
              </p>
            </div>

            <div className="flex items-center gap-2">
              {assessmentSkills.length > 0 ? (
                <>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">
                    Assessment Verified
                  </span>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('scorecard')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Radar Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <span className="text-[10px] font-bold text-[#6B7280] bg-[#F8F9FA] px-2.5 py-1 rounded border border-[#E5E7EB] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#6B7280]" />
                  Assessment Required
                </span>
              )}
            </div>
          </div>

          {/* State A: Real Per-Skill Bar Visualization Once Available */}
          {assessmentSkills.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-3.5">
                {assessmentSkills.map((sk, idx) => {
                  const rawScore = (sk.post_score !== undefined && sk.post_score !== null)
                    ? sk.post_score
                    : (sk.score !== undefined && sk.score !== null)
                    ? sk.score
                    : (sk.pre_score !== undefined && sk.pre_score !== null)
                    ? sk.pre_score
                    : 0;
                  const scoreVal = Number(rawScore);
                  const isProficient = scoreVal >= 75;
                  const isCompetent = scoreVal >= 60;

                  console.log(`[CandidateDashboard Bar Chart] skill: "${sk.skill_name}", raw post_score:`, sk.post_score, `raw pre_score:`, sk.pre_score, `display scoreVal: ${scoreVal}%`);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#111827]">{sk.skill_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isProficient 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : isCompetent 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-[#FDEEE0] text-[#D2691E] border border-[#F8D3B8]'
                          }`}>
                            {isProficient ? 'Proficient' : isCompetent ? 'Competent' : 'Developing'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#111827]">{scoreVal}%</span>
                      </div>

                      <div className="w-full bg-[#F8F9FA] h-2.5 rounded-full overflow-hidden border border-[#E5E7EB]">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isProficient 
                              ? 'bg-emerald-600' 
                              : isCompetent 
                              ? 'bg-blue-600' 
                              : 'bg-[#D2691E]'
                          }`} 
                          style={{ width: isBarsMounted ? `${Math.min(100, Math.max(0, scoreVal))}%` : '0%' }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    <span>≥75% Proficient</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                    <span>60-74% Competent</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D2691E] inline-block"></span>
                    <span>&lt;60% Developing</span>
                  </span>
                </div>
                <span className="font-semibold text-[#111827]">NCVT Passing Benchmark: 60%</span>
              </div>
            </div>
          ) : (
            /* State B: Grayed-Out / Locked Placeholder Version */
            <div className="p-6 sm:p-10 rounded-xl bg-[#F8F9FA] border border-dashed border-[#E5E7EB] text-center space-y-4">
              <div className="flex justify-center mx-auto">
                <LockedCompetencyIllustration className="w-20 h-20" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="text-base font-bold text-[#111827]">Skill Competency Unlocks After Assessment</p>
                <p className="text-xs text-[#6B7280]">
                  Complete your trade MCQ assessment for {candTrade} to generate your verified competency breakdown, radar charts, and job recommendations.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('assessment')}
                  className="btn-sid-primary text-xs py-2 px-4 font-bold whitespace-nowrap shadow-sm"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Take Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* 11. RECENT JOB VACANCY TABLE PREVIEW */}
      <ScrollReveal direction="up" delay={100}>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0B3D6B]" />
                <h2 className="font-display text-base font-bold text-[#111827]">
                  Recent Job Vacancies
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Top matched vacancies in {candDistrict} based on your {candTrade} verified competencies
              </p>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('jobs')}
              className="text-xs font-bold text-[#D2691E] hover:text-[#B85814] flex items-center gap-1 group transition-colors"
            >
              <span>View All Matched Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {matchedJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-govt">
                <thead>
                  <tr>
                    <th>Job Title & Company</th>
                    <th>Location</th>
                    <th>Trade / Domain</th>
                    <th>Match Score</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedJobs.slice(0, 4).map((job) => {
                    const jobId = job.id || job.job_id;
                    const isApplied = appliedJobs.includes(jobId);
                    const matchScore = job.match_percentage ?? job.matchScorePct ?? 88;

                    return (
                      <tr key={jobId} className="hover:bg-[#FDEEE0]/30 transition-colors">
                        <td>
                          <div>
                            <span className="font-bold text-[#111827] block">{job.title}</span>
                            <span className="text-xs text-[#6B7280]">{job.company_name || job.company || 'Accredited Partner'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0" />
                            <span>{job.district || candDistrict}, {candState}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-xs font-medium text-[#111827] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
                            {job.trade || candTrade}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {matchScore}% Match
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleApplyJob(jobId)}
                            disabled={isApplied}
                            className={`text-xs py-1.5 px-4 font-bold rounded-lg transition-all shadow-xs ${
                              isApplied
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                : 'btn-sid-primary text-xs py-1.5 px-4'
                            }`}
                          >
                            {isApplied ? 'Applied ✓' : 'Apply Now'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-center space-y-3">
              <Briefcase className="w-10 h-10 text-[#6B7280] mx-auto" />
              <p className="text-sm font-bold text-[#111827]">No Job Openings Loaded Yet</p>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Complete your skill assessment or browse all partner openings in the job matching portal.
              </p>
              <button
                onClick={() => onNavigateTab && onNavigateTab('jobs')}
                className="btn-sid-primary text-xs py-2 px-5 font-bold shadow-xs"
              >
                Browse All Vacancies
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* 12. TOP 3 RECOMMENDED UPSKILLING PRIORITIES WIDGET */}
      <ScrollReveal direction="up" delay={120}>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div>
              <h2 className="font-display text-base font-bold text-[#111827] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D2691E]" />
                <span>Top 3 Recommended Upskilling Priorities</span>
              </h2>
              <p className="text-xs text-[#6B7280]">
                Ranked for {candName} ({candTrade} in {candDistrict})
              </p>
            </div>
            <span className="text-xs font-bold text-[#111827] bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-0.5 rounded-[4px] flex items-center gap-1">
              <Target className="w-3 h-3 text-[#D2691E]" />
              Curriculum Priorities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div 
                key={rec.skill_id || rec.skill_name || idx} 
                className="p-5 rounded-2xl border border-[#E5E7EB] bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-white bg-[#0B3D6B] px-2 py-0.5 rounded">
                      Priority #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase bg-[#E5E7EB] px-2 py-0.5 rounded">
                      {rec.category || 'Core Skill'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#111827] leading-tight">{rec.skill_name}</h3>

                  <div className="p-2.5 rounded bg-[#FDEEE0]/60 border border-[#F8D3B8] text-[11px] text-amber-950 font-medium space-y-0.5">
                    <p className="font-bold flex items-center gap-1 text-amber-950">
                      <TrendingUp className="w-3.5 h-3.5 text-[#D2691E] flex-shrink-0" />
                      <span>Upskill Rationale:</span>
                    </p>
                    <p className="leading-snug font-semibold text-[#111827]">{rec.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#6B7280] block text-[10px]">Your Competency</span>
                      <span className="font-bold text-[#0B3D6B] font-mono">{(rec.post_score !== undefined && rec.post_score !== null) ? rec.post_score : (rec.current_score ?? 0)}%</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#6B7280] block text-[10px]">Local Demand</span>
                      <span className="font-bold text-[#D2691E] font-mono">{rec.skill_demand_percentage !== undefined ? rec.skill_demand_percentage : (rec.demand_frequency_pct ?? 0)}%</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigateTab && onNavigateTab('assessment')}
                  className="w-full btn-sid-primary text-xs py-2 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Start Practice MCQ</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};
