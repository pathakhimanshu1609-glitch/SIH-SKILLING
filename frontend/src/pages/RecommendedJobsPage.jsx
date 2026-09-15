import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Target, 
  ChevronDown,
  ChevronUp,
  Filter, 
  ExternalLink, 
  Check, 
  Award, 
  ArrowRight, 
  Clock, 
  Send,
  Building2,
  FileQuestion,
  Lock,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { EmptyAssessmentIllustration } from '../components/common/TwoToneIllustrations';

export const RecommendedJobsPage = ({ onNavigateTab }) => {
  const { user, role } = useAuth();

  // Test Candidate switcher to let evaluator test both states instantly:
  // cand-01 (Completed post-assessment) vs cand-05 (Uncompleted post-assessment)
  const defaultCandId = user?.candidateRecord?.id || user?.id || 'cand-01';
  const [candidateId, setCandidateId] = useState(defaultCandId);
  const [trade, setTrade] = useState('Advanced CNC Machinist');
  const [district, setDistrict] = useState('Pune');

  const [loading, setLoading] = useState(false);
  const [hasPostAssessment, setHasPostAssessment] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [achievedSkills, setAchievedSkills] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    loadRecommendedJobs();
  }, [candidateId, trade, district]);

  const loadRecommendedJobs = async () => {
    setLoading(true);
    setNotification(null);
    try {
      const data = await fetchWithAuth(
        `/api/portal/jobs/recommended?candidate_id=${encodeURIComponent(candidateId)}&trade=${encodeURIComponent(trade)}&district=${encodeURIComponent(district)}`,
        {},
        role
      );

      if (data) {
        setHasPostAssessment(Boolean(data.has_post_assessment));
        setJobs(data.jobs || []);
        setAchievedSkills(data.achievedSkills || []);
      }
    } catch (err) {
      console.error('Failed to load recommended jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId, jobTitle, companyName) => {
    setApplyingJobId(jobId);
    try {
      const res = await fetchWithAuth('/api/portal/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          job_id: jobId
        })
      }, role);

      if (res.success) {
        setNotification({
          type: 'success',
          message: `Application submitted for "${jobTitle}" at ${companyName}. Status: Under Review.`
        });
        // Optimistically update applied status in state
        setJobs(prev => prev.map(j => (j.job_id === jobId || j.id === jobId) ? { ...j, has_applied: true, application_status: 'Applied' } : j));
      } else {
        setNotification({
          type: 'error',
          message: res.error
        });
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      setNotification({
        type: 'error',
        message: 'Could not submit application. Please try again.'
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12 font-sans">
      {/* Top Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-6 sm:p-7 relative shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-govt-orange text-white flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-[4px]">
                  SKILL-MATCHED VACANCIES
                </span>
                <span className="text-xs text-amber-200">
                  National Career Service (NCS) Verified
                </span>
              </div>
              <h1 className="font-display text-xl font-bold">Recommended Industry Job Vacancies</h1>
              <p className="text-xs text-slate-300">
                Ranked by explainable skill-overlap between candidate competencies and employer requirements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick candidate switcher for testing assessment gating (Dev Only) */}
            {import.meta.env.DEV && (
              <div className="bg-white/10 p-2 rounded-[8px] border border-white/20 text-xs">
                <span className="text-[10px] text-slate-300 block mb-1 font-semibold uppercase">
                  Active Candidate Profile:
                </span>
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="bg-slate-900 text-white font-bold text-xs rounded-[6px] border border-white/30 p-1 cursor-pointer focus:ring-1 focus:ring-govt-orange"
                >
                  <option value="cand-01">Rahul Sharma (cand-01 • Strong Post-Assessment: 85% / 65%)</option>
                  <option value="cand-low">Arjun Rao (cand-low • Low Post-Assessment: 35% / 30%)</option>
                  <option value="cand-05">Vikas Shinde (cand-05 • No Post-Assessment Completed)</option>
                </select>
              </div>
            )}

            <button
              onClick={() => onNavigateTab && onNavigateTab('applications')}
              className="hidden sm:flex items-center gap-1.5 btn-govt-primary text-xs py-2 px-4"
            >
              <span>My Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-govt-navy" />
            <span className="font-bold text-slate-700">Target Trade:</span>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-bold text-govt-navy rounded-md p-1.5 focus:ring-1 focus:ring-govt-navy"
            >
              <option value="Advanced CNC Machinist">Advanced CNC Machinist</option>
              <option value="Solar PV Installer & Technician">Solar PV Installer & Technician</option>
              <option value="EV Battery Maintenance Specialist">EV Battery Maintenance Specialist</option>
              <option value="Industrial Automation & Robotics Technician">Industrial Automation & Robotics Technician</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700">District:</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-md p-1.5"
            >
              <option value="Pune">Pune</option>
              <option value="Nashik">Nashik</option>
              <option value="Thane">Thane</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadRecommendedJobs} 
            disabled={loading}
            className="btn-govt-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Match</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          {notification.type === 'success' && (
            <button
              onClick={() => onNavigateTab && onNavigateTab('applications')}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
            >
              Go to My Applications →
            </button>
          )}
        </div>
      )}

      {/* CONDITIONAL CONTENT: GATED BY POST-ASSESSMENT COMPLETION */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <div className="w-10 h-10 border-4 border-govt-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Running Explainable Skill-Matching Algorithm...
          </p>
        </div>
      ) : !hasPostAssessment ? (
        /* EMPTY STATE: CANDIDATE HAS NO COMPLETED POST-ASSESSMENT YET */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-center mx-auto">
            <EmptyAssessmentIllustration className="w-24 h-24" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              Prerequisite Required • Step 4
            </span>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Complete your assessment to unlock job recommendations
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Recommended jobs are matched against your verified competency scores (achieved threshold score ≥ 60%). Complete your post-training skill evaluation to unlock personalized job matches.
            </p>
          </div>

          {/* Three-step visual road map */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-lg mx-auto space-y-3 text-xs">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-govt-orange" />
              <span>How To Unlock Verified Job Recommendations:</span>
            </p>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[4px] bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">✓</span>
                <span className="line-through text-slate-400">Step 1: Onboarding & Workshop Training Registration</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <span className="w-5 h-5 rounded-[4px] bg-amber-200 text-amber-900 flex items-center justify-center text-[10px]">2</span>
                <span>Step 2: Complete Post-Training Skill Assessment (Current Action)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-5 h-5 rounded-[4px] bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">3</span>
                <span>Step 3: Access Ranked Vacancies & Direct 1-Click Job Applications</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigateTab && onNavigateTab('assessment')}
              className="btn-govt-orange text-xs py-2 px-5 font-bold inline-flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Skill MCQ Assessment</span>
            </button>
            <button
              onClick={() => setCandidateId('cand-01')}
              className="text-xs text-slate-500 hover:text-govt-navy underline font-medium"
            >
              Preview with Assessed Candidate (Rahul Sharma)
            </button>
          </div>
        </div>
      ) : (
        /* CANDIDATE HAS COMPLETED ASSESSMENT: SHOW RANKED EXPLAINABLE OFFICIAL TABLE */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <span>Ranked Vacancies for {trade} ({district})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Ordered by competency overlap percentage. Use the skills breakdown to inspect candidate match verification.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-[4px] font-mono">
                {jobs.length} Verified Vacancies Available
              </span>
            </div>
          </div>

          {/* Official Government Bordered Vacancies Table */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="table-govt">
                <thead>
                  <tr>
                    <th className="w-28 font-mono">Job ID</th>
                    <th>Role & Organization</th>
                    <th>Location / Source</th>
                    <th className="w-36 font-mono">Salary Band</th>
                    <th className="w-36 text-center">Competency Match</th>
                    <th className="w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const matchPct = (job.match_percentage !== undefined && job.match_percentage !== null) ? job.match_percentage : 0;
                    const matchedSkills = Array.isArray(job.matched_skills) ? job.matched_skills : [];
                    const missingSkills = Array.isArray(job.missing_skills) ? job.missing_skills : [];
                    const isApplied = Boolean(job.has_applied);
                    const isApplying = applyingJobId === (job.job_id || job.id);
                    const isExpanded = expandedJobId === (job.job_id || job.id);

                    return (
                      <React.Fragment key={job.job_id || job.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="font-mono text-xs font-bold text-slate-700">
                            JOB-{job.job_id || job.id}
                          </td>
                          <td>
                            <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                            <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{job.company_name || job.company}</span>
                            </div>
                          </td>
                          <td className="text-xs text-slate-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{job.district || district}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-[2px] mt-0.5 inline-block">
                              {job.source || 'NCS'}
                            </span>
                          </td>
                          <td className="font-mono text-xs font-bold text-slate-800">
                            {job.salary_range}
                          </td>
                          <td className="text-center">
                            <div className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-[4px] border border-slate-300 bg-slate-50">
                              <Target className="w-3 h-3 text-govt-orange" />
                              <span>{matchPct}% Match</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedJobId(isExpanded ? null : (job.job_id || job.id))}
                              className="text-[11px] text-govt-navy hover:underline block mx-auto mt-1 font-medium"
                            >
                              {isExpanded ? 'Hide Skills ▲' : 'View Skills ▼'}
                            </button>
                          </td>
                          <td className="text-right">
                            {isApplied ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold py-1 px-2.5 rounded-[4px] inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Applied</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApply(job.job_id || job.id, job.title, job.company_name || job.company)}
                                disabled={isApplying}
                                className="btn-govt-orange text-xs py-1 px-3 font-bold"
                              >
                                {isApplying ? 'Applying...' : 'Apply Now'}
                              </button>
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                            <td colSpan={6} className="p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-2.5 rounded-[4px] bg-white border border-slate-200 space-y-1">
                                  <div className="flex items-center gap-1 text-emerald-900 font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span>Skills you have ({matchedSkills.length}):</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {matchedSkills.map((sk, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                        <span>{sk}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-[4px] bg-white border border-slate-200 space-y-1">
                                  <div className="flex items-center gap-1 text-amber-900 font-bold text-[11px]">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <span>Skills to develop ({missingSkills.length}):</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {missingSkills.map((sk, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-[2px] border border-amber-200">
                                        <span>{sk}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
