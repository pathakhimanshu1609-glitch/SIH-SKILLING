import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Award, 
  BarChart2, 
  Clock, 
  RotateCcw,
  Check
} from 'lucide-react';

export const SkillAssessmentModule = ({ onNavigateScorecard }) => {
  const { user, role } = useAuth();

  const [phase, setPhase] = useState('pre'); // 'pre' or 'post'
  const [trade, setTrade] = useState('Advanced CNC Machinist');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [phase, trade]);

  const loadQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setQuizResults(null);
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
      const res = await fetchWithAuth('/api/portal/assessments/submit', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: 'cand-01',
          phase,
          answers: userAnswers
        })
      }, role);

      if (res.success) {
        setQuizResults(res.results);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-govt-navy to-slate-900 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-govt-orange text-white flex items-center justify-center font-bold shadow">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  MCQ EXAM MODULE
                </span>
                <span className="text-xs text-blue-200">NCVT Skill Standard</span>
              </div>
              <h1 className="text-xl font-bold font-roboto">Per-Skill Competency Assessment</h1>
              <p className="text-xs text-slate-300">Evaluate technical proficiency pre- and post-training.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase('pre')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                phase === 'pre' 
                  ? 'bg-govt-orange text-white shadow' 
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Pre-Training Phase
            </button>
            <button
              onClick={() => setPhase('post')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                phase === 'post' 
                  ? 'bg-govt-orange text-white shadow' 
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Post-Training Phase
            </button>
          </div>
        </div>
      </div>

      {/* Trade Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase">Selected Trade Skill Bundle:</span>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="bg-slate-50 border border-slate-300 font-bold text-govt-navy rounded-md p-1.5 focus:ring-1 focus:ring-govt-navy"
          >
            <option value="Advanced CNC Machinist">Advanced CNC Machinist</option>
            <option value="Solar PV Installer & Technician">Solar PV Installer & Technician</option>
            <option value="EV Battery Maintenance Specialist">EV Battery Maintenance Specialist</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Clock className="w-4 h-4 text-govt-orange" />
          <span>Status: <strong className="text-slate-800 uppercase font-bold">{phase}-Assessment Mode</strong></span>
        </div>
      </div>

      {/* Results Box if Submitted */}
      {submitted && quizResults && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-base font-bold">Assessment Completed ({phase.toUpperCase()}-TRAINING)</h2>
            </div>
            <button 
              onClick={onNavigateScorecard}
              className="btn-govt-orange text-xs py-1.5 px-3 flex items-center gap-1 shadow"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>View Radar Scorecard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizResults.map((r, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{r.skill_name}</p>
                  <p className="text-[11px] text-slate-500">{r.correct} of {r.total} Answers Correct</p>
                </div>
                <span className="text-base font-bold font-mono text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                  {r.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Container */}
      {!submitted && (
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {trade} • Question Set
              </span>
              <span className="text-xs font-bold text-govt-navy font-mono bg-blue-50 px-2.5 py-1 rounded">
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
                  <div key={q.id} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="bg-govt-navy text-white text-[11px] font-bold px-2 py-0.5 rounded font-mono">
                        Q{qIdx + 1}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded ml-1">
                          {q.skill_name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 mt-1">{q.question}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[q.id] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleOptionSelect(q.id, optIdx)}
                            className={`p-3 rounded-md border text-xs cursor-pointer flex items-center gap-3 transition-all ${
                              isSelected 
                                ? 'border-govt-navy bg-blue-50/80 font-bold text-govt-navy ring-1 ring-govt-navy' 
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                              isSelected ? 'bg-govt-navy text-white border-govt-navy' : 'border-slate-300 bg-slate-100 text-slate-600'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span>{opt}</span>
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
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>

              <button
                type="submit"
                disabled={submitting || answeredCount === 0}
                className="btn-govt-orange text-xs py-2.5 px-6 font-bold uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50"
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
