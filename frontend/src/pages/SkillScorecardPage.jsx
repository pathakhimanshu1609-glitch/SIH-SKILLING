import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  Award, 
  BarChart2, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  ArrowUpRight,
  Info
} from 'lucide-react';

export const SkillScorecardPage = () => {
  const { user, role } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssessmentResults();
  }, []);

  const loadAssessmentResults = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/portal/assessments/results?candidate_id=cand-01', {}, role);
      setResults(data.results || []);
    } catch (err) {
      console.warn('Could not load assessment results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Radar Chart Math Helpers
  const size = 340;
  const center = size / 2;
  const radius = 120;
  const numSkills = results.length || 6;

  const getCoordinates = (index, valuePct) => {
    const angle = (Math.PI * 2 / numSkills) * index - Math.PI / 2;
    const r = (valuePct / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const prePolygonPoints = results.map((item, idx) => {
    const { x, y } = getCoordinates(idx, item.pre_score || 40);
    return `${x},${y}`;
  }).join(' ');

  const postPolygonPoints = results.map((item, idx) => {
    const { x, y } = getCoordinates(idx, item.post_score || 85);
    return `${x},${y}`;
  }).join(' ');

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-roboto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-govt-navy via-slate-900 to-amber-950 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-govt-orange text-white flex items-center justify-center font-bold shadow">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  DIGITAL SCORECARD
                </span>
                <span className="text-xs text-amber-200">DigiLocker Verified</span>
              </div>
              <h1 className="text-xl font-bold">Candidate Skill Competency Radar</h1>
              <p className="text-xs text-slate-300">Comparative pre- vs post-training evaluation across NCVT trades.</p>
            </div>
          </div>

          <button className="btn-govt-orange text-xs py-2 px-4 flex items-center gap-1 shadow">
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Growth Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart SVG Widget */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-govt-navy" />
              <span>Skill Radar Analysis</span>
            </h2>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-govt-navy inline-block"></span>
                <span className="text-slate-600">Pre-Training</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-govt-orange inline-block"></span>
                <span className="text-slate-900">Post-Training</span>
              </div>
            </div>
          </div>

          {/* SVG Radar Visualization */}
          <div className="relative">
            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric Grid Rings */}
              {rings.map((ringPct, rIdx) => {
                const ringPoints = Array.from({ length: numSkills }).map((_, idx) => {
                  const { x, y } = getCoordinates(idx, ringPct * 100);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polygon
                    key={rIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={rIdx === 4 ? "0" : "2,2"}
                  />
                );
              })}

              {/* Radar Axes Lines */}
              {Array.from({ length: numSkills }).map((_, idx) => {
                const { x, y } = getCoordinates(idx, 100);
                return (
                  <line
                    key={idx}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Pre-Training Polygon */}
              <polygon
                points={prePolygonPoints}
                fill="rgba(11, 61, 107, 0.25)"
                stroke="#0B3D6B"
                strokeWidth="2"
              />

              {/* Post-Training Polygon */}
              <polygon
                points={postPolygonPoints}
                fill="rgba(255, 107, 0, 0.35)"
                stroke="#FF6B00"
                strokeWidth="2.5"
              />

              {/* Pre Dots */}
              {results.map((item, idx) => {
                const { x, y } = getCoordinates(idx, item.pre_score || 40);
                return <circle key={`pre-${idx}`} cx={x} cy={y} r="3.5" fill="#0B3D6B" />;
              })}

              {/* Post Dots */}
              {results.map((item, idx) => {
                const { x, y } = getCoordinates(idx, item.post_score || 85);
                return <circle key={`post-${idx}`} cx={x} cy={y} r="4.5" fill="#FF6B00" stroke="#ffffff" strokeWidth="1.5" />;
              })}

              {/* Skill Labels */}
              {results.map((item, idx) => {
                const { x, y } = getCoordinates(idx, 118);
                return (
                  <text
                    key={`label-${idx}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold fill-slate-700 font-roboto"
                  >
                    {item.skill_name.length > 18 ? `${item.skill_name.substring(0, 16)}...` : item.skill_name}
                  </text>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-slate-500 text-center italic">
            Outer boundary indicates 100% mastery. Shaded orange area represents post-training competency gain.
          </p>
        </div>

        {/* Skill Growth Table & Certification Card */}
        <div className="space-y-6">
          {/* Skill Score Growth Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Competency Breakdown & Improvement</span>
            </h2>

            <div className="space-y-3">
              {results.map((item, idx) => {
                const pre = item.pre_score || 40;
                const post = item.post_score || 85;
                const gain = post - pre;

                return (
                  <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.skill_name}</span>
                      <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +{gain}% Improvement
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">Pre-Training Score</span>
                        <span className="font-bold text-govt-navy text-sm font-mono">{pre}%</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">Post-Training Score</span>
                        <span className="font-bold text-govt-orange text-sm font-mono">{post}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competency Level & Certification Badge */}
          <div className="bg-gradient-to-r from-amber-500 to-govt-orange text-white rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Level 4 Mastery Certification</span>
              </div>
              <span className="bg-white text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-amber-100 leading-relaxed">
              Based on the post-training competency evaluation (avg score &gt; 85%), candidate is certified eligible for NCVT Level 4 Advanced Technician Credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
