import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  BarChart2, 
  Briefcase, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Target, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  ExternalLink,
  Award,
  Check,
  ArrowRight
} from 'lucide-react';

export const SkillMatchPage = ({ onNavigateTab }) => {
  const { user, role, candidateProfile } = useAuth();

  const [trade, setTrade] = useState('Advanced CNC Machinist');
  const [district, setDistrict] = useState('Pune');
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Resolved dynamic candidate ID from session
  const candidateId = candidateProfile?.id || user?.candidateRecord?.id || user?.id || 'cand-01';

  useEffect(() => {
    loadGapAnalysis();
  }, [trade, district, candidateId]);

  useEffect(() => {
    setIsMounted(false);
    const timer = setTimeout(() => setIsMounted(true), 120);
    return () => clearTimeout(timer);
  }, [trade, district, gapData]);

  const loadGapAnalysis = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(
        `/api/portal/skill-match/gap-analysis?candidate_id=${encodeURIComponent(candidateId)}&trade=${encodeURIComponent(trade)}&district=${encodeURIComponent(district)}`,
        {},
        role
      );
      setGapData(data);
    } catch (err) {
      console.warn('Error loading skill gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const skillGapVector = gapData?.skillGapVector || [];
  const matchedJobs = gapData?.matchedJobs || [];
  const totalAnalyzed = gapData?.totalJobsAnalyzed || 0;
  const totalDataset = gapData?.totalDatasetRows || 180;

  // Candidate has completed at least one post-assessment for the currently selected trade
  const hasCompletedPostAssessment = Boolean(
    gapData?.has_post_assessment && 
    skillGapVector.some(sk => sk.hasPostScore)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12 font-sans">
      {/* Top Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-[6px] p-4 sm:p-5 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-govt-orange text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-[4px]">
                  SKILL GAP & MATCH ENGINE
                </span>
                <span className="text-xs text-amber-200 font-mono">Real-time Verified Calculation</span>
              </div>
              <h1 className="text-xl font-bold">Candidate Skill vs. Market Demand Analysis</h1>
              <p className="text-xs text-slate-300">Comparing candidate post-assessment skill scores against genuine employer vacancy frequencies.</p>
            </div>
          </div>

          <div className="bg-white/10 px-3.5 py-2 rounded-[4px] border border-white/20 text-xs">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Analyzed Postings ({district})</p>
            <p className="text-lg font-bold text-white font-mono">{totalAnalyzed} Live Jobs</p>
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
              className="bg-slate-50 border border-slate-300 font-bold text-govt-navy rounded-[6px] p-1.5 focus:ring-1 focus:ring-govt-navy cursor-pointer"
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
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-[6px] p-1.5 cursor-pointer"
            >
              <option value="Pune">Pune</option>
              <option value="Nashik">Nashik</option>
              <option value="Thane">Thane</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>
        </div>

        <button onClick={loadGapAnalysis} className="btn-govt-outline text-xs py-2 px-4 rounded-[8px]">
          Refresh Analysis
        </button>
      </div>

      {/* Dual Bar Chart Section OR Empty State */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-govt-navy" />
              <span>Skill Match & Demand Gap Bar Chart</span>
            </h2>
            <p className="text-xs text-slate-500">Dual-bar comparison: Candidate Post-Assessment Competency (%) vs. Industry Demand Frequency (%)</p>
          </div>

          {/* Bar Chart Legend */}
          {hasCompletedPostAssessment && (
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[2px] bg-[#0B3D6B] inline-block" />
                <span className="text-slate-700">Candidate Post Score (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[2px] bg-[#FF6B00] inline-block" />
                <span className="text-slate-900">Industry Demand (%)</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-govt-orange border-t-transparent animate-spin mx-auto" />
            <p>Evaluating candidate skill vectors against {totalDataset} job postings...</p>
          </div>
        ) : !hasCompletedPostAssessment ? (
          /* EMPTY STATE: CANDIDATE HAS ZERO POST-ASSESSMENTS FOR SELECTED TRADE */
          <div className="py-8 px-4 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-[4px] bg-slate-100 border border-slate-300 text-[#0B3D6B] flex items-center justify-center mx-auto">
              <Target className="w-7 h-7 text-[#0B3D6B]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-[4px] border border-slate-200 font-mono">
                POST-ASSESSMENT REQUIRED
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0B3D6B]">
                Complete your post-training assessment to see your skill gap analysis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                No completed post-training evaluation was found for <strong>{trade}</strong>. Complete the standardized MCQ post-assessment to benchmark your competency against live employer vacancy requirements.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab ? onNavigateTab('assessment') : window.location.assign('/dashboard')}
                className="btn-govt-orange text-xs py-2 px-5 font-bold inline-flex items-center gap-2 rounded-[4px]"
              >
                <Target className="w-4 h-4" />
                <span>Take Skill MCQ Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* DUAL BAR CHART RENDER */
          <div className="space-y-4">
            {skillGapVector.map((sk) => {
              const hasPost = sk.hasPostScore && sk.candidateScore !== null;
              const candScore = sk.candidateScore;
              const demandFreq = sk.demandFrequency;
              const gap = sk.gapScore;

              return (
                <div 
                  key={sk.skill_id} 
                  className={`p-3.5 rounded-[4px] border transition-colors space-y-2.5 ${
                    hasPost ? 'bg-slate-50 border-slate-300' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-[4px]">
                        {sk.category}
                      </span>
                      <h3 className={`text-sm font-bold mt-1 ${hasPost ? 'text-slate-800' : 'text-slate-500'}`}>
                        {sk.skill_name}
                      </h3>
                    </div>

                    {/* Gap Score Badge */}
                    <div className="flex items-center gap-2">
                      {hasPost ? (
                        <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-[4px] border flex items-center gap-1 ${
                          gap >= 0 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}>
                          {gap >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />}
                          <span>Gap Score: {gap > 0 ? `+${gap}%` : `${gap}%`}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                          Not assessed yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Visualizations */}
                  <div className="space-y-2 pt-1">
                    {/* Bar 1: Candidate Post-Assessment Competency */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Candidate Post-Assessment Competency</span>
                        {hasPost ? (
                          <span className="text-[#0B3D6B] font-mono font-bold">{candScore}%</span>
                        ) : (
                          <span className="text-slate-400 font-sans italic text-xs">Not assessed yet</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-[2px] overflow-hidden">
                        {hasPost ? (
                          <div 
                            className="bg-[#0B3D6B] h-full rounded-[2px] transition-all duration-700 ease-out"
                            style={{ width: isMounted ? `${Math.min(100, Math.max(0, candScore))}%` : '0%' }}
                          />
                        ) : (
                          <div className="bg-slate-300 h-full w-0" />
                        )}
                      </div>
                    </div>

                    {/* Bar 2: Industry Demand Frequency */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Industry Demand Frequency ({district})</span>
                        <span className={`font-mono font-bold ${hasPost ? 'text-[#FF6B00]' : 'text-slate-500'}`}>
                          {demandFreq}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-[2px] overflow-hidden">
                        <div 
                          className={`h-full rounded-[2px] transition-all duration-700 ease-out ${
                            hasPost ? 'bg-[#FF6B00]' : 'bg-slate-400'
                          }`}
                          style={{ width: isMounted ? `${Math.min(100, Math.max(0, demandFreq))}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Recommended Skills Based on Local Market Demand */}
      {gapData?.recommendations && gapData.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-govt-orange" />
                <span>Top Recommended Upskilling Priorities</span>
              </h2>
              <p className="text-xs text-slate-500">
                Skills prioritized by employer vacancy frequency in {district} ({trade})
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded">
              Explainable Demand Scoring
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gapData.recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-white bg-govt-navy px-2 py-0.5 rounded">
                      Priority #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-govt-orange bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-mono">
                      {rec.skill_demand_percentage}% Market Demand
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">{rec.skill_name}</h3>

                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium space-y-1">
                    <p className="font-bold flex items-center gap-1 text-amber-950">
                      <TrendingUp className="w-3.5 h-3.5 text-govt-orange flex-shrink-0" />
                      <span>Upskill Rationale:</span>
                    </p>
                    <p className="leading-snug text-slate-700 font-semibold">{rec.reason}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Status: <strong className={rec.achieved ? 'text-emerald-700' : 'text-amber-700'}>{rec.achieved ? 'Achieved (≥60%)' : 'Needs Upskilling'}</strong>
                  </span>
                  <span className="font-mono font-bold text-govt-navy">{rec.post_score || rec.current_score || 0}% Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Matched Job Vacancies from Dataset with Explainable Skill Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span>Explainable Job Matches ({trade} • {district})</span>
            </h2>
            <p className="text-xs text-slate-500">Detailed breakdown of skills you have vs. skills you're missing for each local posting</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
              {matchedJobs.length} Vacancies Analyzed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedJobs.map((job) => {
            const matchPct = job.match_percentage !== undefined ? job.match_percentage : (job.matchScorePct || 0);
            const matchedSkills = Array.isArray(job.matched_skills) ? job.matched_skills : [];
            const missingSkills = Array.isArray(job.missing_skills) ? job.missing_skills : [];

            return (
              <div 
                key={job.id || job.job_id} 
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 space-y-3.5 transition-all shadow-2xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      {job.id || job.job_id} • {job.source}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">{job.title}</h3>
                    <p className="text-xs text-slate-600">{job.company_name || job.company} • <span className="font-semibold text-slate-700">{job.district || district}</span></p>
                  </div>

                  {/* Overall Match Percentage Badge */}
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-mono shadow-xs flex items-center gap-1 ${
                      matchPct === 100 
                        ? 'bg-emerald-600 text-white' 
                        : matchPct >= 60 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : matchPct > 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      <span>{matchPct}% Match</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {matchPct === 100 ? 'Fully Qualified' : `${matchedSkills.length}/${(matchedSkills.length + missingSkills.length)} skills`}
                    </span>
                  </div>
                </div>

                {/* Two visually distinct lists: 'Skills you have' vs 'Skills you're missing' */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* Skills you have (green checkmarks) */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1 text-emerald-900 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Skills you have ({matchedSkills.length}):</span>
                    </div>
                    {matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {matchedSkills.map((sk, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{sk}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No skills achieved yet</p>
                    )}
                  </div>

                  {/* Skills you're missing (red/amber) */}
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-1 text-amber-900 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Skills you're missing ({missingSkills.length}):</span>
                    </div>
                    {missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {missingSkills.map((sk, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>{sk}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>All required skills achieved!</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="font-mono font-semibold text-slate-800">{job.salary_range}</span>
                  <button className="btn-govt-primary text-[11px] py-1 px-3 flex items-center gap-1 shadow-2xs">
                    <span>Apply Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
