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
  Sparkles, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  ExternalLink,
  Award
} from 'lucide-react';

export const SkillMatchPage = () => {
  const { user, role } = useAuth();

  const [trade, setTrade] = useState('Advanced CNC Machinist');
  const [district, setDistrict] = useState('Pune');
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGapAnalysis();
  }, [trade, district]);

  const loadGapAnalysis = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(
        `/api/portal/skill-match/gap-analysis?candidate_id=cand-01&trade=${encodeURIComponent(trade)}&district=${encodeURIComponent(district)}`,
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-roboto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-govt-navy via-slate-900 to-emerald-950 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-govt-orange text-white flex items-center justify-center font-bold shadow">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  SKILL GAP & MATCH ENGINE
                </span>
                <span className="text-xs text-emerald-200">Seeded Dataset: {totalDataset} Active Jobs</span>
              </div>
              <h1 className="text-xl font-bold">Candidate Skill vs. Market Demand Analysis</h1>
              <p className="text-xs text-slate-300">Comparing candidate post-assessment skill scores against industry vacancy frequencies.</p>
            </div>
          </div>

          <div className="bg-white/10 px-3.5 py-2 rounded-lg border border-white/20 text-xs">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Analyzed Vacancies</p>
            <p className="text-lg font-bold text-white font-mono">{totalAnalyzed} Local Jobs</p>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-govt-navy" />
            <span className="font-bold text-slate-700">Filter Trade:</span>
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

        <button onClick={loadGapAnalysis} className="btn-govt-outline text-xs py-1.5 px-3">
          Refresh Analysis
        </button>
      </div>

      {/* Dual Bar Chart Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-govt-navy" />
              <span>Skill Match & Demand Gap Bar Chart</span>
            </h2>
            <p className="text-xs text-slate-500">Dual-bar comparison: Candidate Skill Competency Score vs. Industry Demand Frequency %</p>
          </div>

          {/* Bar Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-govt-navy inline-block"></span>
              <span className="text-slate-700">Candidate Skill Score (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-govt-orange inline-block"></span>
              <span className="text-slate-900">Market Demand Frequency (%)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-govt-orange border-t-transparent animate-spin mx-auto"></div>
            <p>Evaluating candidate skill vectors against {totalDataset} job postings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {skillGapVector.map((sk) => {
              const candScore = sk.candidateScore;
              const demandFreq = sk.demandFrequency;
              const gap = sk.gapScore;

              return (
                <div key={sk.skill_id} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {sk.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mt-1">{sk.skill_name}</h3>
                    </div>

                    {/* Gap Score Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 ${
                        gap >= 0 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {gap >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />}
                        <span>Gap Score: {gap > 0 ? `+${gap}%` : `${gap}%`}</span>
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Visualizations */}
                  <div className="space-y-2 pt-1">
                    {/* Bar 1: Candidate Score */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>Candidate Post-Assessment Competency</span>
                        <span className="text-govt-navy font-mono">{candScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-govt-navy h-full rounded-full transition-all duration-500"
                          style={{ width: `${candScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Bar 2: Market Demand Frequency */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>Industry Demand Frequency ({district})</span>
                        <span className="text-govt-orange font-mono">{demandFreq}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-govt-orange h-full rounded-full transition-all duration-500"
                          style={{ width: `${demandFreq}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Matched Job Vacancies from Dataset */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span>Matched Job Openings ({trade} • {district})</span>
            </h2>
            <p className="text-xs text-slate-500">Filtered from {totalDataset} seeded vacancies based on skill overlap</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            {matchedJobs.length} Matches Found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matchedJobs.map((job) => (
            <div key={job.id} className="p-4 rounded-lg border border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    {job.id} • {job.source}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 mt-1">{job.title}</h3>
                  <p className="text-[11px] text-slate-600">{job.company_name}</p>
                </div>
                <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                  {job.matchScorePct}% Match
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="font-mono font-semibold text-slate-800">{job.salary_range}</span>
                <button className="btn-govt-primary text-[11px] py-1 px-2.5 flex items-center gap-1">
                  <span>Apply Now</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
