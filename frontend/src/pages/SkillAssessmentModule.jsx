import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Award, 
  BarChart2, 
  Clock, 
  RotateCcw,
  Check,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Target
} from 'lucide-react';

export const SkillAssessmentModule = ({ onNavigateScorecard, onNavigateTab }) => {
  const { user, role } = useAuth();

  const [phase, setPhase] = useState('pre'); // 'pre' or 'post'
  const [trade, setTrade] = useState('Advanced CNC Machinist');
  const [district, setDistrict] = useState(user?.candidateRecord?.district || 'Pune');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [explainableResults, setExplainableResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [phase, trade]);

  const loadQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setQuizResults(null);
    setExplainableResults(null);
    setUserAnswers({});

    try {
      const data = await fetchWithAuth(`/api/portal/assessments/questions?trade=${encodeURIComponent(trade)}&phase=${phase}`, {}, role);
      setQuestions(data.questions || []);
    } catch (err) {
      console.warn('Could not load quiz questions from server:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, optionIdx) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const candId = user?.candidateRecord?.id || user?.id || 'cand-01';
      const userDistrict = user?.candidateRecord?.district || district || 'Pune';
      
      const res = await fetchWithAuth('/api/portal/assessments/submit', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: candId,
          trade,
          district: userDistrict,
          phase,
          answers: userAnswers
        })
      }, role);

      if (res.success) {
        setQuizResults(res.results);

        if (phase === 'post') {
          // If backend provided explainableMatch directly in response, use it immediately
          if (res.explainableMatch) {
            setExplainableResults(res.explainableMatch);
          } else {
            // Fallback: fetch explainable match immediately so candidate lands on explainable results
            try {
              const matchRes = await fetchWithAuth(
                `/api/portal/skill-match/gap-analysis?candidate_id=${candId}&trade=${encodeURIComponent(trade)}&district=${encodeURIComponent(userDistrict)}`,
                {},
                role
              );
              setExplainableResults(matchRes);
            } catch (mErr) {
              console.warn('Notice loading fallback explainable match:', mErr);
            }
          }

          try {
            const key = `cand_assessments_${candId}`;
            const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
            const updated = existing.filter(item => item.trade !== trade);
            (res.results || []).forEach(r => {
              updated.push({
                trade,
                skill_name: r.skill_name,
                phase: 'post',
                score: r.score,
                taken_at: new Date().toISOString()
              });
            });
            sessionStorage.setItem(key, JSON.stringify(updated));
          } catch (e) {}
        }

        setSubmitted(true);
      }
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12 font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-6 sm:p-8 relative shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-govt-orange text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2.5 py-0.5 rounded tracking-wider">
                  MCQ EXAM MODULE
                </span>
                <span className="text-xs text-blue-200 font-medium">NCVT Skill Standard</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight">Per-Skill Competency Assessment</h1>
              <p className="text-sm text-slate-300 mt-1">Evaluate technical proficiency pre- and post-training with explainable job matching.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setPhase('pre'); setSubmitted(false); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                phase === 'pre' 
                  ? 'bg-[#D96B27] text-white shadow' 
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Pre-Training Phase
            </button>
            <button
              onClick={() => { setPhase('post'); setSubmitted(false); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                phase === 'post' 
                  ? 'bg-[#D96B27] text-white shadow' 
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Post-Training Phase
            </button>
          </div>
        </div>
      </div>

      {/* Trade & District Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase">Trade:</span>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              disabled={submitted}
              className="bg-slate-50 border border-slate-300 font-bold text-govt-navy rounded-md p-1.5 focus:ring-1 focus:ring-govt-navy"
            >
              <option value="Advanced CNC Machinist">Advanced CNC Machinist</option>
              <option value="Solar PV Installer & Technician">Solar PV Installer & Technician</option>
              <option value="EV Battery Maintenance Specialist">EV Battery Maintenance Specialist</option>
              <option value="Industrial Automation & Robotics Technician">Industrial Automation & Robotics Technician</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase">District:</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={submitted}
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

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Clock className="w-4 h-4 text-govt-orange" />
          <span>Status: <strong className="text-slate-800 uppercase font-bold">{phase}-Assessment Mode</strong></span>
        </div>
      </div>

      {/* Explainable Results View when Submitted */}
      {submitted && quizResults && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Results Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h2 className="font-display text-base font-bold">
                    {phase === 'post' ? 'Post-Training Assessment Completed: Explainable Skill Match Ready!' : 'Pre-Training Assessment Scored'}
                  </h2>
                  <p className="text-xs text-emerald-700">
                    {phase === 'post' 
                      ? 'Competency threshold: Score ≥ 60% indicates Achieved Skill for job matching.' 
                      : 'Baseline competency established for your skilling roadmap.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {phase === 'post' && onNavigateTab && (
                  <button 
                    onClick={() => onNavigateTab('skill-match')}
                    className="btn-sid-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>View Gap Bar Chart</span>
                  </button>
                )}
                <button 
                  onClick={onNavigateScorecard}
                  className="btn-sid-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs bg-white"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Radar Scorecard</span>
                </button>
              </div>
            </div>

            {/* Per-Skill Score Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizResults.map((r, idx) => {
                const isAchieved = Number(r.score) >= 60;
                return (
                  <div key={idx} className="bg-white p-3.5 rounded-lg border border-emerald-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800">{r.skill_name}</p>
                        {phase === 'post' && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isAchieved 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isAchieved ? 'Achieved' : 'Needs Upskilling'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{r.correct} of {r.total} Answers Correct</p>
                    </div>
                    <span className={`text-base font-bold font-mono px-2.5 py-1 rounded ${
                      isAchieved ? 'text-emerald-700 bg-emerald-100' : 'text-amber-800 bg-amber-100'
                    }`}>
                      {r.score}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explainable Skill Recommendations (Exact Reason Text with Demand %) */}
          {explainableResults?.recommendations && explainableResults.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-4 h-4 text-govt-orange" />
                    <span>Explainable Skill Recommendations</span>
                  </h3>
                  <p className="text-xs text-slate-500">Skills recommended based on employer demand frequency in {district}</p>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Demand-Backed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {explainableResults.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-white bg-govt-navy px-1.5 py-0.5 rounded">
                          Priority #{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-govt-orange bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                          {rec.skill_demand_percentage}% Demand
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1.5">{rec.skill_name}</h4>
                    </div>

                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-0.5">
                      <p className="font-bold flex items-center gap-1 text-[10px] text-amber-900">
                        <TrendingUp className="w-3 h-3 text-govt-orange" />
                        <span>Why this skill:</span>
                      </p>
                      <p className="font-semibold text-slate-700 leading-tight">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explainable Job Opportunities with 'Skills you have' vs 'Skills you're missing' */}
          {explainableResults?.matchedJobs && explainableResults.matchedJobs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-700" />
                    <span>Immediate Explainable Job Matches ({district})</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live job opportunities mapped against your achieved skills (score ≥ 60%)</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                  {explainableResults.matchedJobs.length} Positions Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {explainableResults.matchedJobs.slice(0, 4).map((job) => {
                  const matchPct = job.match_percentage !== undefined ? job.match_percentage : (job.matchScorePct || 0);
                  const matchedSkills = Array.isArray(job.matched_skills) ? job.matched_skills : [];
                  const missingSkills = Array.isArray(job.missing_skills) ? job.missing_skills : [];

                  return (
                    <div 
                      key={job.id || job.job_id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-emerald-500/50 space-y-3 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                            {job.id || job.job_id} • {job.source}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 mt-1">{job.title}</h4>
                          <p className="text-[11px] text-slate-600">{job.company_name || job.company} • {job.district || district}</p>
                        </div>

                        {/* Overall match percentage as a badge */}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-mono shadow-2xs ${
                          matchPct === 100 
                            ? 'bg-emerald-600 text-white' 
                            : matchPct >= 60 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : matchPct > 0
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {matchPct}% Match
                        </span>
                      </div>

                      {/* Two visually distinct lists: 'Skills you have' vs 'Skills you're missing' */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10px]">
                        {/* Skills you have (green checkmarks) */}
                        <div className="p-2 rounded bg-emerald-50/80 border border-emerald-200 space-y-1">
                          <div className="flex items-center gap-1 text-emerald-900 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span>Skills you have ({matchedSkills.length}):</span>
                          </div>
                          {matchedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {matchedSkills.map((sk, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{sk}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">None yet</p>
                          )}
                        </div>

                        {/* Skills you're missing (red/amber) */}
                        <div className="p-2 rounded bg-amber-50/80 border border-amber-200 space-y-1">
                          <div className="flex items-center gap-1 text-amber-900 font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span>Skills you're missing ({missingSkills.length}):</span>
                          </div>
                          {missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {missingSkills.map((sk, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  <span>{sk}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span>All required skills achieved!</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                        <span className="font-mono font-semibold text-slate-800">{job.salary_range}</span>
                        <button className="btn-sid-primary text-[10px] py-1 px-3 flex items-center gap-1 shadow-2xs">
                          <span>Apply Now</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => { setSubmitted(false); setUserAnswers({}); }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake / Test Another Trade</span>
            </button>

            <div className="flex items-center gap-3">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('skill-match')}
                  className="btn-sid-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Target className="w-4 h-4" />
                  <span>Go to Skill Match & Gap Analysis</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions Container */}
      {!submitted && (
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                {trade} • Question Set
              </span>
              <span className="text-xs font-bold text-govt-navy font-mono bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Answered: {answeredCount} / {questions.length}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-govt-orange border-t-transparent animate-spin mx-auto"></div>
                <p>Loading question bank...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="bg-govt-navy text-white text-[11px] font-bold px-2 py-0.5 rounded font-mono">
                        Q{qIdx + 1}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded ml-1">
                          {q.skill_name}
                        </span>
                        <h3 className="text-sm font-bold font-display text-slate-900 mt-1">{q.question}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[q.id] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleOptionSelect(q.id, optIdx)}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              isSelected 
                                ? 'border-govt-orange/60 bg-white shadow-xs font-medium text-slate-900 ring-1 ring-govt-orange/40' 
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isSelected ? 'bg-govt-orange text-white' : 'border border-slate-300 bg-slate-100 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span>{opt}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'border-govt-orange bg-govt-orange' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUserAnswers({})}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>

              <button
                type="submit"
                disabled={submitting || answeredCount === 0}
                className="btn-sid-primary text-xs py-3 px-6 font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting Score...' : `Submit ${phase.toUpperCase()}-Assessment`}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
