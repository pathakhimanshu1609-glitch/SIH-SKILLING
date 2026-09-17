import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  Award, 
  BarChart2, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ArrowUpRight,
  Info,
  Check
} from 'lucide-react';

export const SkillScorecardPage = ({ selectedTrade = 'Advanced CNC Machinist', onSelectTrade }) => {
  const { user, role } = useAuth();
  const [activeTrade, setActiveTrade] = useState(selectedTrade || 'Advanced CNC Machinist');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isChartAnimated, setIsChartAnimated] = useState(false);

  const AVAILABLE_TRADES = [
    'Advanced CNC Machinist',
    'Solar PV Installer & Technician',
    'EV Battery Maintenance Specialist',
    'Industrial Automation & Robotics Technician'
  ];

  useEffect(() => {
    if (selectedTrade) {
      setActiveTrade(selectedTrade);
    }
  }, [selectedTrade]);

  useEffect(() => {
    loadAssessmentResults(activeTrade);
  }, [activeTrade]);

  useEffect(() => {
    setIsChartAnimated(false);
    const timer = setTimeout(() => setIsChartAnimated(true), 120);
    return () => clearTimeout(timer);
  }, [results]);

  const loadAssessmentResults = async (tradeToLoad) => {
    setLoading(true);
    const candId = user?.candidateRecord?.id || user?.id || 'cand-01';
    try {
      const data = await fetchWithAuth(`/api/portal/assessments/results?candidate_id=${encodeURIComponent(candId)}&trade=${encodeURIComponent(tradeToLoad)}`, {}, role);
      setResults(data.results || []);
    } catch (err) {
      console.warn('Could not load assessment results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeChange = (newTrade) => {
    setActiveTrade(newTrade);
    if (onSelectTrade) {
      onSelectTrade(newTrade);
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
    const effectivePct = isChartAnimated ? ((item.pre_score !== undefined && item.pre_score !== null) ? Number(item.pre_score) : 0) : 0;
    const { x, y } = getCoordinates(idx, effectivePct);
    return `${x},${y}`;
  }).join(' ');

  const postPolygonPoints = results.map((item, idx) => {
    const effectivePct = isChartAnimated ? ((item.post_score !== undefined && item.post_score !== null) ? Number(item.post_score) : 0) : 0;
    const { x, y } = getCoordinates(idx, effectivePct);
    return `${x},${y}`;
  }).join(' ');

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const avgPostScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.post_score || 0), 0) / results.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Top Banner with Trade Scoping */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#D2691E] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-[#D2691E] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                  NCVET VERIFIED SCORECARD
                </span>
                <span className="text-xs text-blue-200">DigiLocker Linked</span>
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">
                Skill Competency Radar: {activeTrade}
              </h1>
              <p className="text-xs text-slate-300">
                Official comparative pre- vs post-training evaluation across verified national competency standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn-sid-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>

        {/* Trade Selector Tabs in Header */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-blue-200 mr-1">Switch Trade Scope:</span>
          {AVAILABLE_TRADES.map((t) => (
            <button
              key={t}
              onClick={() => handleTradeChange(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${
                activeTrade === t
                  ? 'bg-[#D2691E] text-white shadow-xs'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Radar Chart + Growth Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart SVG Widget Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="sid-eyebrow">Visual Analytics</span>
              <h2 className="font-display text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0B3D6B]" />
                <span>Multi-Axis Competency Radar</span>
              </h2>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0B3D6B] inline-block"></span>
                <span className="text-slate-600">Pre-Training</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D2691E] inline-block"></span>
                <span className="text-[#D2691E]">Post-Training</span>
              </div>
            </div>
          </div>

          {/* SVG Radar Visualization with Mount Animation */}
          <div className="relative my-2">
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
                    stroke="#E2E8F0"
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
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Pre-Training Polygon */}
              <polygon
                points={prePolygonPoints}
                fill="rgba(11, 61, 107, 0.2)"
                stroke="#0B3D6B"
                strokeWidth="2"
                style={{ transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              />

              {/* Post-Training Polygon (Burnt Saffron #D2691E) */}
              <polygon
                points={postPolygonPoints}
                fill="rgba(210, 105, 30, 0.3)"
                stroke="#D2691E"
                strokeWidth="2.5"
                style={{ transition: 'all 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              />

              {/* Pre Dots */}
              {results.map((item, idx) => {
                const effectivePct = isChartAnimated ? (item.pre_score || 40) : 0;
                const { x, y } = getCoordinates(idx, effectivePct);
                return (
                  <circle 
                    key={`pre-${idx}`} 
                    cx={x} 
                    cy={y} 
                    r="3.5" 
                    fill="#0B3D6B" 
                    style={{ transition: 'all 700ms ease-out' }}
                  />
                );
              })}

              {/* Post Dots */}
              {results.map((item, idx) => {
                const effectivePct = isChartAnimated ? ((item.post_score !== undefined && item.post_score !== null) ? Number(item.post_score) : 0) : 0;
                const { x, y } = getCoordinates(idx, effectivePct);
                return (
                  <circle 
                    key={`post-${idx}`} 
                    cx={x} 
                    cy={y} 
                    r="4.5" 
                    fill="#D2691E" 
                    stroke="#FFFFFF" 
                    strokeWidth="1.5" 
                    style={{ transition: 'all 900ms ease-out' }}
                  />
                );
              })}

              {/* Skill Labels */}
              {results.map((item, idx) => {
                const { x, y } = getCoordinates(idx, 122);
                return (
                  <text
                    key={`label-${idx}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold fill-slate-700 font-sans"
                  >
                    {item.skill_name.length > 18 ? `${item.skill_name.substring(0, 16)}...` : item.skill_name}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F9FA] border border-slate-200 text-center w-full">
            <p className="text-[11px] text-slate-500 italic leading-snug">
              Outer perimeter indicates 100% mastery threshold. Saffron shaded polygon represents post-training competency achieved.
            </p>
          </div>
        </div>

        {/* Skill Growth Table & Certification Card */}
        <div className="space-y-6">
          {/* Competency Table Styled with .table-govt */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="sid-eyebrow">NCVET Standards</span>
                <h2 className="font-display text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Competency Breakdown & Score Gain</span>
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {results.length} Skills Evaluated
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="table-govt">
                <thead>
                  <tr>
                    <th>Skill Competency</th>
                    <th className="text-center">Pre</th>
                    <th className="text-center">Post</th>
                    <th className="text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, idx) => {
                    const pre = (item.pre_score !== undefined && item.pre_score !== null) ? Number(item.pre_score) : 0;
                    const post = (item.post_score !== undefined && item.post_score !== null) ? Number(item.post_score) : 0;
                    const gain = post - pre;

                    return (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900 text-xs">
                          {item.skill_name}
                        </td>
                        <td className="text-center font-mono text-slate-600 font-bold text-xs">
                          {pre}%
                        </td>
                        <td className="text-center font-mono font-extrabold text-[#D2691E] text-xs">
                          {post}%
                        </td>
                        <td className="text-right">
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                            <ArrowUpRight className="w-3 h-3" />
                            +{gain}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official NCVET Certification Badge Card */}
          <div className="bg-[#FDEEE0] border border-[#F8D3B8] rounded-xl p-5 sm:p-6 space-y-3 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white text-[#D2691E] flex items-center justify-center border border-[#F8D3B8] shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0B3D6B] uppercase tracking-wider">
                    {avgPostScore >= 60 ? 'NCVT Level 4 Competency Certified' : 'Evaluation in Progress'}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">Digital India Skill Registry • ISO / NCVET Compliant</p>
                </div>
              </div>

              <span className="bg-white text-[#0B3D6B] text-[10px] font-bold px-2.5 py-1 rounded border border-[#F8D3B8] uppercase font-mono shadow-2xs">
                {activeTrade}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              Based on the post-training competency evaluation for <strong>{activeTrade}</strong> (average post-assessment score: <strong className="font-mono text-[#D2691E]">{avgPostScore}%</strong>), candidate {avgPostScore >= 60 ? 'has satisfied the ≥60% benchmark and is issued an official NCVT Verified Digital Credential with DigiLocker portability.' : 'requires an average score ≥60% across competencies to qualify for official certification.'}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F8D3B8]/60">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Biometric Attendance</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Credential ID: NCVET-2026-8842</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
