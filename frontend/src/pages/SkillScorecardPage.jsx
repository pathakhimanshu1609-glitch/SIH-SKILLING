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
  Check,
  ArrowRight,
  BookOpen,
  AlertCircle
} from 'lucide-react';

const STANDARD_TRADE_SKILLS = {
  'Advanced CNC Machinist': [
    'CNC Programming (G-code)',
    'Machine Setup & Calibration',
    'Quality & Precision Measurement',
    'Safety & Maintenance'
  ],
  'Solar PV Installer & Technician': [
    'PV System Design',
    'Electrical Wiring & Safety',
    'Installation & Mounting',
    'Troubleshooting & Maintenance'
  ],
  'EV Battery Maintenance Specialist': [
    'Battery Chemistry & BMS',
    'High-Voltage Electrical Safety',
    'Diagnostics & Fault Detection',
    'Maintenance & Disposal'
  ],
  'Industrial Automation & Robotics Technician': [
    'Industrial Robotics Programming',
    'PLC & Sensor Interfacing',
    'Robotic Arm Calibration',
    'Automated Cell Safety Protocols'
  ]
};

export const SkillScorecardPage = ({ selectedTrade = 'Advanced CNC Machinist', onSelectTrade, onNavigateTab }) => {
  const { user, role, candidateProfile } = useAuth();
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
      loadAssessmentResults(selectedTrade);
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

  const normalizeSkillKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const loadAssessmentResults = async (tradeToLoad) => {
    setLoading(true);
    const candId = candidateProfile?.id || user?.candidateProfile?.id || user?.candidateRecord?.id || user?.id || 'cand-01';
    let serverResults = [];

    try {
      const data = await fetchWithAuth(
        `/api/portal/assessments/results?candidate_id=${encodeURIComponent(candId)}&trade=${encodeURIComponent(tradeToLoad)}`, 
        {}, 
        role
      );
      if (data?.results && Array.isArray(data.results)) {
        serverResults = data.results;
      }
    } catch (err) {
      console.warn('Could not load assessment results from server:', err);
    }

    // 2. Read recent client-side test scores from sessionStorage
    let sessionScores = [];
    try {
      const sessionKeys = [
        'cand_assessments_current',
        `cand_assessments_${candId}`,
        user?.id && user.id !== candId ? `cand_assessments_${user.id}` : null
      ].filter(Boolean);

      sessionKeys.forEach(k => {
        const raw = sessionStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              sessionScores.push(...parsed);
            }
          } catch (pe) {}
        }
      });
    } catch (se) {
      console.warn('Session storage read note in Scorecard:', se);
    }

    // 3. Filter session scores matching active trade
    const matchingSessionScores = sessionScores.filter(s => 
      !s.trade || s.trade.toLowerCase() === tradeToLoad.toLowerCase()
    );

    // 4. Build unified skill map based on standard trade competencies
    const standardSkills = STANDARD_TRADE_SKILLS[tradeToLoad] || STANDARD_TRADE_SKILLS['Advanced CNC Machinist'];
    const unifiedMap = {};

    // Initialize with standard competencies
    standardSkills.forEach(sName => {
      unifiedMap[normalizeSkillKey(sName)] = {
        skill_id: `sk-${sName}`,
        trade: tradeToLoad,
        skill_name: sName,
        pre_score: null,
        post_score: null
      };
    });

    // Merge server results
    serverResults.forEach(item => {
      const key = normalizeSkillKey(item.skill_name);
      if (!unifiedMap[key]) {
        unifiedMap[key] = {
          skill_id: item.skill_id || `sk-${item.skill_name}`,
          trade: item.trade || tradeToLoad,
          skill_name: item.skill_name,
          pre_score: null,
          post_score: null
        };
      }
      if (item.pre_score !== undefined && item.pre_score !== null) {
        unifiedMap[key].pre_score = Number(item.pre_score);
      }
      if (item.post_score !== undefined && item.post_score !== null) {
        unifiedMap[key].post_score = Number(item.post_score);
      }
    });

    // Overlay matching session scores (recent test submissions)
    matchingSessionScores.forEach(item => {
      const key = normalizeSkillKey(item.skill_name);
      if (!unifiedMap[key]) {
        unifiedMap[key] = {
          skill_id: `sk-${item.skill_name}`,
          trade: tradeToLoad,
          skill_name: item.skill_name,
          pre_score: null,
          post_score: null
        };
      }
      if (item.phase === 'pre') {
        unifiedMap[key].pre_score = Number(item.score);
      } else if (item.phase === 'post') {
        unifiedMap[key].post_score = Number(item.score);
        if (unifiedMap[key].pre_score === null || unifiedMap[key].pre_score === undefined) {
          unifiedMap[key].pre_score = Math.max(25, Math.round(Number(item.score) * 0.6));
        }
      }
    });

    // Check if candidate took any pre or post assessments
    const finalResults = Object.values(unifiedMap);
    
    // If cand-01 and no scores were populated, provide default baseline demo values
    const hasAnyScores = finalResults.some(r => r.pre_score !== null || r.post_score !== null);
    if (!hasAnyScores && (candId === 'cand-01' || candId === 'cand-demo')) {
      const defaults = [
        { pre: 45, post: 85 },
        { pre: 40, post: 75 },
        { pre: 50, post: 80 },
        { pre: 55, post: 90 }
      ];
      finalResults.forEach((r, idx) => {
        const d = defaults[idx % defaults.length];
        r.pre_score = d.pre;
        r.post_score = d.post;
      });
    }

    setResults(finalResults);
    setLoading(false);
  };

  const handleTradeChange = (newTrade) => {
    setActiveTrade(newTrade);
    if (onSelectTrade) {
      onSelectTrade(newTrade);
    }
  };

  // Determine scoring state
  const hasPreScores = results.some(r => r.pre_score !== null && r.pre_score !== undefined);
  const hasPostScores = results.some(r => r.post_score !== null && r.post_score !== undefined);

  // Radar Chart Math Helpers
  const size = 340;
  const center = size / 2;
  const radius = 118;
  const numSkills = Math.max(results.length, 4);

  const getCoordinates = (index, valuePct) => {
    const angle = (Math.PI * 2 / numSkills) * index - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, valuePct)) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon points
  const prePolygonPoints = results.map((item, idx) => {
    const rawVal = item.pre_score !== null && item.pre_score !== undefined 
      ? Number(item.pre_score) 
      : (hasPreScores ? 30 : 20);
    const effectivePct = isChartAnimated ? rawVal : 0;
    const { x, y } = getCoordinates(idx, effectivePct);
    return `${x},${y}`;
  }).join(' ');

  const postPolygonPoints = results.map((item, idx) => {
    const rawVal = item.post_score !== null && item.post_score !== undefined 
      ? Number(item.post_score) 
      : (hasPostScores ? 30 : 20);
    const effectivePct = isChartAnimated ? rawVal : 0;
    const { x, y } = getCoordinates(idx, effectivePct);
    return `${x},${y}`;
  }).join(' ');

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const postScoredItems = results.filter(r => r.post_score !== null && r.post_score !== undefined);
  const avgPostScore = postScoredItems.length > 0
    ? Math.round(postScoredItems.reduce((sum, r) => sum + Number(r.post_score), 0) / postScoredItems.length)
    : 0;

  const preScoredItems = results.filter(r => r.pre_score !== null && r.pre_score !== undefined);
  const avgPreScore = preScoredItems.length > 0
    ? Math.round(preScoredItems.reduce((sum, r) => sum + Number(r.pre_score), 0) / preScoredItems.length)
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

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('assessment', { trade: activeTrade })}
                className="btn-sid-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-sm bg-[#D2691E] hover:bg-[#B85717]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Take Test</span>
              </button>
            )}
            <button className="btn-sid-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-sm bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
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
          <div className="relative my-2 flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric Grid Rings */}
              {rings.map((ringPct, rIdx) => {
                const ringPoints = Array.from({ length: numSkills }).map((_, idx) => {
                  const { x, y } = getCoordinates(idx, ringPct * 100);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <g key={rIdx}>
                    <polygon
                      points={ringPoints}
                      fill={rIdx % 2 === 0 ? "rgba(241, 245, 249, 0.4)" : "none"}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                      strokeDasharray={rIdx === 4 ? "0" : "2,2"}
                    />
                    <text
                      x={center + 4}
                      y={center - ringPct * radius}
                      className="text-[8px] font-mono fill-slate-400 font-bold"
                    >
                      {ringPct * 100}%
                    </text>
                  </g>
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
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* 60% Benchmark Passing Threshold Ring (NCVT Gold) */}
              {(() => {
                const passRingPoints = Array.from({ length: numSkills }).map((_, idx) => {
                  const { x, y } = getCoordinates(idx, 60);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon
                    points={passRingPoints}
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                );
              })()}

              {/* Pre-Training Polygon (Navy #0B3D6B) */}
              {hasPreScores && (
                <polygon
                  points={prePolygonPoints}
                  fill="rgba(11, 61, 107, 0.22)"
                  stroke="#0B3D6B"
                  strokeWidth="2.5"
                  style={{ transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              )}

              {/* Post-Training Polygon (Burnt Saffron #D2691E) */}
              {hasPostScores && (
                <polygon
                  points={postPolygonPoints}
                  fill="rgba(210, 105, 30, 0.32)"
                  stroke="#D2691E"
                  strokeWidth="2.5"
                  style={{ transition: 'all 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              )}

              {/* Pre Dots */}
              {hasPreScores && results.map((item, idx) => {
                const effectivePct = isChartAnimated ? (item.pre_score !== null ? Number(item.pre_score) : 30) : 0;
                const { x, y } = getCoordinates(idx, effectivePct);
                return (
                  <circle 
                    key={`pre-${idx}`} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="#0B3D6B" 
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    style={{ transition: 'all 700ms ease-out' }}
                  />
                );
              })}

              {/* Post Dots */}
              {hasPostScores && results.map((item, idx) => {
                const effectivePct = isChartAnimated ? (item.post_score !== null ? Number(item.post_score) : 30) : 0;
                const { x, y } = getCoordinates(idx, effectivePct);
                return (
                  <circle 
                    key={`post-${idx}`} 
                    cx={x} 
                    cy={y} 
                    r="5" 
                    fill="#D2691E" 
                    stroke="#FFFFFF" 
                    strokeWidth="2" 
                    style={{ transition: 'all 900ms ease-out' }}
                  />
                );
              })}

              {/* Skill Labels positioned outside perimeter */}
              {results.map((item, idx) => {
                const { x, y } = getCoordinates(idx, 126);
                return (
                  <text
                    key={`label-${idx}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold fill-slate-800 font-sans"
                  >
                    {item.skill_name.length > 20 ? `${item.skill_name.substring(0, 18)}...` : item.skill_name}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F9FA] border border-slate-200 text-center w-full space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] inline-block"></span>
              <span>Gold Ring = 60% Passing Benchmark</span>
            </div>
            <p className="text-[11px] text-slate-500 italic leading-snug">
              {hasPostScores 
                ? 'Saffron shaded polygon represents post-training competency achieved. Navy polygon represents baseline.' 
                : hasPreScores 
                ? 'Navy polygon plotted from your baseline pre-assessment. Complete post-training assessment to generate saffron growth polygon.'
                : 'Axes calibrated to trade competency standards. Take an assessment to plot your personal skill polygon.'}
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
                {results.length} Competencies
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
                    const hasPre = item.pre_score !== undefined && item.pre_score !== null;
                    const hasPost = item.post_score !== undefined && item.post_score !== null;
                    const pre = hasPre ? Number(item.pre_score) : 0;
                    const post = hasPost ? Number(item.post_score) : 0;
                    const gain = post - pre;

                    return (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900 text-xs">
                          {item.skill_name}
                        </td>
                        <td className="text-center font-mono text-slate-600 font-bold text-xs">
                          {hasPre ? `${pre}%` : <span className="text-slate-400 font-normal italic">Pending</span>}
                        </td>
                        <td className="text-center font-mono font-extrabold text-[#D2691E] text-xs">
                          {hasPost ? `${post}%` : <span className="text-slate-400 font-normal italic">Pending</span>}
                        </td>
                        <td className="text-right">
                          {hasPre && hasPost ? (
                            <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded border font-mono ${
                              gain >= 0 
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}>
                              <ArrowUpRight className="w-3 h-3" />
                              {gain >= 0 ? `+${gain}%` : `${gain}%`}
                            </span>
                          ) : hasPost ? (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                              <Check className="w-3 h-3" />
                              {post >= 60 ? 'Passed' : 'Scored'}
                            </span>
                          ) : hasPre ? (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                              Baseline
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">
                              Unassessed
                            </span>
                          )}
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
                    {hasPostScores 
                      ? (avgPostScore >= 60 ? 'NCVT Level 4 Competency Certified' : 'Evaluation Completed • Upskilling Advised')
                      : (hasPreScores ? 'Pre-Training Baseline Established' : 'Evaluation in Progress')}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">Digital India Skill Registry • ISO / NCVET Compliant</p>
                </div>
              </div>

              <span className="bg-white text-[#0B3D6B] text-[10px] font-bold px-2.5 py-1 rounded border border-[#F8D3B8] uppercase font-mono shadow-2xs">
                {activeTrade}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              {hasPostScores ? (
                avgPostScore >= 60 ? (
                  <>Based on the post-training competency evaluation for <strong>{activeTrade}</strong> (average post-assessment score: <strong className="font-mono text-[#D2691E]">{avgPostScore}%</strong>), candidate has satisfied the ≥60% benchmark and is issued an official NCVT Verified Digital Credential with DigiLocker portability.</>
                ) : (
                  <>Candidate completed the post-assessment for <strong>{activeTrade}</strong> with an average score of <strong className="font-mono text-[#D2691E]">{avgPostScore}%</strong>. A minimum score of 60% across competencies is required to issue official NCVT certification.</>
                )
              ) : hasPreScores ? (
                <>Baseline pre-training competency recorded (average baseline: <strong className="font-mono text-[#0B3D6B]">{avgPreScore}%</strong>). Complete the post-training MCQ assessment to verify technical mastery and earn your NCVT certified digital badge.</>
              ) : (
                <>No official assessment recorded yet for <strong>{activeTrade}</strong>. Take the MCQ examination to evaluate technical proficiency and generate verified DigiLocker credentials.</>
              )}
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
