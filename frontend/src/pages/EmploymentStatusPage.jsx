import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { subscribeEmploymentSync, notifyEmploymentChange } from '../lib/realtimeSync';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Users, 
  Calendar, 
  FileCheck, 
  ChevronDown,
  ChevronUp,
  Settings,
  Lock, 
  Unlock, 
  Check, 
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { RetentionTimeline } from '../components/common/RetentionTimeline';

export const EmploymentStatusPage = () => {
  const { user, role } = useAuth();

  // Selected candidate for demo & inspection
  const [selectedCandidateId, setSelectedCandidateId] = useState('cand-01');
  const [record, setRecord] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [tcRecords, setTcRecords] = useState([]);
  const [employerQueue, setEmployerQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dev tools panel toggle (relocated off the main candidate page)
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Date Simulation toggle (Reference date default is 2026-09-13)
  const [simulatedDateStr, setSimulatedDateStr] = useState('2026-09-13');

  // Collapsible Status Update Row (Closed by default)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  // Candidate Self-Report Form State
  const [formData, setFormData] = useState({
    status: 'Placed',
    confirmed_employer_id: 'emp-01',
    role_match: true,
    salary_band: '₹ 22,000 - ₹ 28,000 / mo'
  });

  const [submittingSelfReport, setSubmittingSelfReport] = useState(false);
  const [selfReportMsg, setSelfReportMsg] = useState('');

  // Check-in submission state per interval
  const [checkInForms, setCheckInForms] = useState({
    30: { continued_employment_status: 'Still Employed', role_match_confirmation: true, salary_band_change: 'Same' },
    90: { continued_employment_status: 'Still Employed', role_match_confirmation: true, salary_band_change: 'Same' },
    180: { continued_employment_status: 'Still Employed', role_match_confirmation: true, salary_band_change: 'Same' },
    365: { continued_employment_status: 'Still Employed', role_match_confirmation: true, salary_band_change: 'Same' }
  });
  const [submittingInterval, setSubmittingInterval] = useState(null);
  const [checkInMsg, setCheckInMsg] = useState('');

  // Load initial data
  useEffect(() => {
    loadStatusData();
  }, [role, selectedCandidateId]);

  // Subscribe to realtime updates across tabs
  useEffect(() => {
    const unsubscribe = subscribeEmploymentSync(() => {
      loadStatusData();
    });

    return () => unsubscribe();
  }, [selectedCandidateId]);

  const loadStatusData = async () => {
    setLoading(true);
    try {
      const [candRes, empRes] = await Promise.all([
        fetchWithAuth(`/api/portal/employment/record?candidate_id=${selectedCandidateId}`, {}, role).catch(() => null),
        fetchWithAuth('/api/portal/employers', {}, role).catch(() => ({ employers: [] }))
      ]);

      if (candRes?.record) {
        setRecord(candRes.record);
        setCheckins(candRes.checkins || []);
        setFormData({
          status: candRes.record.self_reported_status || candRes.record.status || 'Placed',
          confirmed_employer_id: candRes.record.employer_id || 'emp-01',
          role_match: candRes.record.role_match !== undefined ? candRes.record.role_match : true,
          salary_band: candRes.record.salary_band || '₹ 22,000 - ₹ 28,000 / mo'
        });
      }

      setEmployers(empRes?.employers || []);

      // Load employer queue if employer or admin
      if (role === 'employer' || role === 'government') {
        const queueRes = await fetchWithAuth('/api/portal/employment/employer-records?employer_id=emp-01', {}, role).catch(() => ({ records: [] }));
        setEmployerQueue(queueRes.records || []);
      }

      // Load TC records if TC or admin
      if (role === 'training_center' || role === 'government') {
        const tcRes = await fetchWithAuth('/api/portal/employment/tc-records?training_center_id=tc-01', {}, role).catch(() => ({ records: [] }));
        setTcRecords(tcRes.records || []);
      }
    } catch (err) {
      console.warn('Error loading employment status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSelfReport(true);
    setSelfReportMsg('');

    try {
      const res = await fetchWithAuth('/api/portal/employment/self-report', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: selectedCandidateId,
          status: formData.status,
          employer_id: formData.status === 'Placed' ? formData.confirmed_employer_id : null,
          salary_band: formData.status === 'Placed' ? formData.salary_band : null,
          role_match: formData.status === 'Placed' ? formData.role_match : null
        })
      }, role);

      if (res.success) {
        setRecord(res.record);
        setCheckins(res.checkins || []);
        setSelfReportMsg(`Status successfully updated to '${res.record.self_reported_status}'.`);
        notifyEmploymentChange('candidate_self_report', { candidate_id: selectedCandidateId, status: res.record.self_reported_status });
        setTimeout(() => setShowStatusUpdate(false), 1500);
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setSubmittingSelfReport(false);
    }
  };

  const handleEmployerVerify = async (recordId, action) => {
    try {
      const res = await fetchWithAuth('/api/portal/employment/employer-confirm', {
        method: 'POST',
        body: JSON.stringify({
          record_id: recordId,
          action
        })
      }, role);

      if (res.success) {
        notifyEmploymentChange('employer_confirmed', { record_id: recordId, action });
        loadStatusData();
      }
    } catch (err) {
      alert('Error verifying placement: ' + err.message);
    }
  };

  const handleCheckInSubmit = async (intervalDays) => {
    setSubmittingInterval(intervalDays);
    setCheckInMsg('');

    const formVals = checkInForms[intervalDays] || {};

    try {
      const res = await fetchWithAuth('/api/portal/employment/checkin', {
        method: 'POST',
        body: JSON.stringify({
          record_id: record?.id,
          candidate_id: selectedCandidateId,
          interval_day: intervalDays,
          current_date: simulatedDateStr,
          continued_employment_status: formVals.continued_employment_status || 'Still Employed',
          role_match_confirmation: formVals.role_match_confirmation !== undefined ? formVals.role_match_confirmation : true,
          salary_band_change: formVals.salary_band_change || 'Same'
        })
      }, role);

      if (res.success) {
        setCheckins(res.checkins || []);
        setCheckInMsg(`Day ${intervalDays} check-in successfully submitted! Thank you for keeping your record verified.`);
        notifyEmploymentChange('checkin_submitted', { record_id: record?.id, interval_day: intervalDays });
        loadStatusData();
      }
    } catch (err) {
      alert('Check-in Submission Error: ' + err.message);
    } finally {
      setSubmittingInterval(null);
    }
  };

  // Check-in helper logic: Evaluate status based on simulatedDateStr
  const simDate = new Date(simulatedDateStr);

  const getCheckinStatus = (intervalDays) => {
    const item = checkins.find(c => c.interval_day === intervalDays);
    if (!item) return { state: 'uncreated', item: null };

    if (item.submitted_at) {
      return { state: 'completed', item };
    }

    const dueDate = new Date(item.due_date);
    if (simDate >= dueDate) {
      return { state: 'due', item };
    } else {
      const diffMs = dueDate - simDate;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { state: 'locked', item, daysRemaining: diffDays };
    }
  };

  // Find due checkin or next unlocking checkin for concise text
  const milestones = [30, 90, 180, 365];
  const dueMilestone = milestones.find(m => getCheckinStatus(m).state === 'due');
  const nextLockedMilestone = milestones.find(m => getCheckinStatus(m).state === 'locked');
  const allCompleted = milestones.every(m => getCheckinStatus(m).state === 'completed');

  const currentEmployerName = record?.employer_name || 
    employers.find(e => e.id === (record?.employer_id || formData.confirmed_employer_id))?.company_name || 
    'Tata Advanced Engineering Solutions';

  return (
    <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12 font-sans relative">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER BANNER (NO DATABASE JARGON, NO DUPLICATE BUTTONS)*/}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#D2691E] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-[#D2691E] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                  NCVT LONGITUDINAL RETENTION
                </span>
                <span className="text-xs text-blue-200 font-medium">Post-Placement Audit Framework</span>
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">Employment Placement & Retention Verification</h1>
              <p className="text-xs text-slate-300">
                Official career progression tracker: Day 30, 90, 180, and 365 employer check-in verification audits.
              </p>
            </div>
          </div>

          {/* Dev Inspection Trigger */}
          {import.meta.env.DEV && (
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="btn-sid-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-blue-200 border-white/20 hover:bg-white/10"
              title="Toggle Dev Simulation Tools"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Audit Tools</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CURRENT PLACEMENT STATUS CARD (CLEAR SUMMARY, NO RAW FORMS) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="sid-eyebrow">Verified Record</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Building2 className="w-4 h-4 text-[#0B3D6B]" />
              <h2 className="font-display text-base font-bold text-slate-900">Current Placement Status</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trainee: <strong>{user?.full_name || record?.candidate_name || 'Candidate Trainee'}</strong> • District: <strong>{record?.district || 'Pune'}</strong>
            </p>
          </div>

          {/* Employer Verification Badge */}
          {record?.self_reported_status === 'Placed' ? (
            record?.employer_confirmed ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified by Employer ({record.employer_confirmed_at ? new Date(record.employer_confirmed_at).toLocaleDateString() : 'Active'})
              </span>
            ) : (
              <span className="bg-[#FDEEE0] text-[#D2691E] border border-[#F8D3B8] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-4 h-4 text-[#D2691E]" />
                Employer Verification Pending
              </span>
            )
          ) : (
            <span className="bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Status: {record?.self_reported_status || 'Applied'}
            </span>
          )}
        </div>

        {/* Read-Only Structured Placement Information Grid */}
        {record?.self_reported_status === 'Placed' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hiring Employer</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentEmployerName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pune Industrial Hub</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trained Trade</p>
              <p className="text-sm font-bold text-[#0B3D6B] mt-1">{record?.trade || 'Advanced CNC Machinist'}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Role Matches Curriculum
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Placement Date</p>
              <p className="text-sm font-bold text-slate-900 mt-1 font-mono">{record?.placement_date || '2026-08-14'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Formal Joining Confirmed</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Salary Band</p>
              <p className="text-sm font-bold text-emerald-800 mt-1 font-mono">{record?.salary_band || '₹ 22,000 - ₹ 28,000 / mo'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">EPFO / Bank Disbursed</p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">No Confirmed Placement Yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Current status is listed as <strong>{record?.self_reported_status || 'Applied'}</strong>. When you secure a placement or receive an offer letter, update your status below.
              </p>
            </div>
            <button
              onClick={() => setShowStatusUpdate(true)}
              className="btn-sid-primary text-xs py-2 px-4 whitespace-nowrap"
            >
              Update to Placed
            </button>
          </div>
        )}

        {/* Collapsible Status Update Toggle Row */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowStatusUpdate(!showStatusUpdate)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-govt-navy" />
              <span>Update Employment Status (Applied / Interviewing / Placed / Unemployed)</span>
            </span>
            {showStatusUpdate ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Expanded Form - Only Visible when Clicked */}
          {showStatusUpdate && (
            <div className="mt-3 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
              {selfReportMsg && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selfReportMsg}</span>
                </div>
              )}

              <form onSubmit={handleSelfReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Current Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {['Applied', 'Interviewing', 'Placed', 'Unemployed'].map((st) => {
                      const isSelected = formData.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: st })}
                          className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                            isSelected
                              ? 'border-govt-navy bg-blue-50 text-govt-navy ring-1 ring-govt-navy shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.status === 'Placed' && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirmed Employer</label>
                      <select
                        value={formData.confirmed_employer_id}
                        onChange={(e) => setFormData({ ...formData, confirmed_employer_id: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-md p-2"
                      >
                        {employers.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.company_name} ({emp.industry_sector}) - {emp.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Salary Band</label>
                      <select
                        value={formData.salary_band}
                        onChange={(e) => setFormData({ ...formData, salary_band: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs rounded-md p-2 font-mono text-slate-800"
                      >
                        <option value="₹ 15,000 - ₹ 20,000 / mo">₹ 15,000 - ₹ 20,000 / mo</option>
                        <option value="₹ 20,000 - ₹ 25,000 / mo">₹ 20,000 - ₹ 25,000 / mo</option>
                        <option value="₹ 25,000 - ₹ 30,000 / mo">₹ 25,000 - ₹ 30,000 / mo</option>
                        <option value="₹ 30,000+ / mo">₹ 30,000+ / mo</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusUpdate(false)}
                    className="btn-sid-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSelfReport}
                    className="btn-sid-primary text-xs py-2 px-5 font-bold uppercase tracking-wider"
                  >
                    {submittingSelfReport ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. POST-PLACEMENT RETENTION TRACKING TIMELINE (DAY 30, 90, 180, 365) */}
      {/* ------------------------------------------------------------- */}
      <RetentionTimeline
        candidateId={selectedCandidateId}
        companyName={currentEmployerName}
        hireDate={record?.placement_date || '2026-08-01'}
        onRefresh={loadStatusData}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4. LONGITUDINAL CHECK-IN AUDIT TRAIL                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-govt-navy" />
              <span>Career Retention Check-Ins</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete periodic 30, 90, 180, and 365-day check-ins to maintain verified longitudinal retention status.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {checkins.filter(c => c.submitted_at).length} of 4 Completed
          </span>
        </div>

        {checkInMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{checkInMsg}</span>
          </div>
        )}

        {record?.self_reported_status !== 'Placed' ? (
          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">Check-Ins Inactive</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Career check-in milestones activate automatically once your status is updated to <strong>Placed</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Horizontal Progress Strip */}
            <div className="py-4 px-2">
              <div className="relative flex items-center justify-between">
                {/* Connecting background progress line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />

                {milestones.map((days, idx) => {
                  const { state, item } = getCheckinStatus(days);

                  return (
                    <div key={days} className="relative z-10 flex flex-col items-center group">
                      {/* Milestone Dot */}
                      {state === 'completed' ? (
                        <div 
                          className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ring-4 ring-emerald-50 transition-all"
                          title={`Day ${days} completed`}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      ) : state === 'due' ? (
                        <div 
                          className="w-10 h-10 rounded-full bg-white border-2 border-[#D2691E] text-[#D2691E] flex items-center justify-center shadow-md ring-4 ring-[#D2691E]/20 animate-pulse font-bold text-xs"
                          title={`Day ${days} due now`}
                        >
                          <Unlock className="w-4 h-4" />
                        </div>
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-xs"
                          title={`Day ${days} upcoming`}
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                      )}

                      {/* Label below dot */}
                      <span className="text-xs font-bold text-slate-800 mt-2">
                        Day {days}
                      </span>
                      <span className={`text-[10px] font-semibold mt-0.5 ${
                        state === 'completed' 
                          ? 'text-emerald-700' 
                          : state === 'due' 
                          ? 'text-[#D2691E] font-bold' 
                          : 'text-slate-400'
                      }`}>
                        {state === 'completed' ? 'Verified' : state === 'due' ? 'Due Now' : 'Upcoming'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Short concise status line showing days until next check-in */}
            <div className="text-center py-2 px-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              {allCompleted ? (
                <span className="text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All 4 retention milestones completed! Full 365-day placement verified.
                </span>
              ) : dueMilestone ? (
                <span className="text-[#D2691E] font-bold flex items-center justify-center gap-1.5">
                  <Unlock className="w-4 h-4" />
                  Day {dueMilestone} check-in is due now. Please confirm your ongoing status below.
                </span>
              ) : nextLockedMilestone ? (
                <span>
                  Next check-in (Day {nextLockedMilestone}) unlocks automatically in{' '}
                  <strong className="text-slate-800">{getCheckinStatus(nextLockedMilestone).daysRemaining} days</strong> (on{' '}
                  {getCheckinStatus(nextLockedMilestone).item?.due_date}).
                </span>
              ) : (
                <span>Check-ins active.</span>
              )}
            </div>

            {/* If a milestone is due now, render its clean, compact form */}
            {dueMilestone && (
              <div className="p-5 rounded-xl bg-[#FDEEE0] border border-[#F8D3B8] space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#F8D3B8] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950 flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-[#D2691E]" />
                    <span>Day {dueMilestone} Check-in Confirmation</span>
                  </h3>
                  <span className="text-[10px] font-bold text-[#D2691E] bg-[#FDEEE0] px-2 py-0.5 rounded border border-[#D2691E]/40">
                    Action Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Employment Status</label>
                    <select
                      value={checkInForms[dueMilestone]?.continued_employment_status || 'Still Employed'}
                      onChange={(e) => setCheckInForms({
                        ...checkInForms,
                        [dueMilestone]: { ...checkInForms[dueMilestone], continued_employment_status: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs font-medium text-slate-800"
                    >
                      <option value="Still Employed">Still Employed (Same Company)</option>
                      <option value="Changed Job">Changed Job (New Company)</option>
                      <option value="Unemployed">Currently Unemployed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Role Match Confirmation</label>
                    <select
                      value={checkInForms[dueMilestone]?.role_match_confirmation ? 'yes' : 'no'}
                      onChange={(e) => setCheckInForms({
                        ...checkInForms,
                        [dueMilestone]: { ...checkInForms[dueMilestone], role_match_confirmation: e.target.value === 'yes' }
                      })}
                      className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs font-medium text-slate-800"
                    >
                      <option value="yes">Yes - Role matches my trained trade</option>
                      <option value="no">No - Different role / responsibilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Salary Status</label>
                    <select
                      value={checkInForms[dueMilestone]?.salary_band_change || 'Same'}
                      onChange={(e) => setCheckInForms({
                        ...checkInForms,
                        [dueMilestone]: { ...checkInForms[dueMilestone], salary_band_change: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs font-medium text-slate-800"
                    >
                      <option value="Same">Same Salary Band</option>
                      <option value="Increased">Increased (Salary Increment)</option>
                      <option value="Decreased">Decreased</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleCheckInSubmit(dueMilestone)}
                    disabled={submittingInterval === dueMilestone}
                    className="btn-sid-primary text-xs py-2.5 px-6 font-bold uppercase tracking-wider"
                  >
                    {submittingInterval === dueMilestone ? 'Saving...' : `Submit Day ${dueMilestone} Check-In`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TRAINING CENTER READ-ONLY REGISTER (TC / GOVT ROLES ONLY)   */}
      {/* ------------------------------------------------------------- */}
      {(role === 'training_center' || role === 'government') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-700" />
                <span>Training Center Roster Register</span>
              </h2>
              <p className="text-xs text-slate-500">
                Overview of enrolled candidates, employment status, employer verification, and completed check-ins.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded">
              Audited Register
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Trade & District</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Employer Confirmed</th>
                  <th className="p-3">Employer Name</th>
                  <th className="p-3">Check-In Milestones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tcRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-800">{r.candidate_name}</td>
                    <td className="p-3">{r.trade} • {r.district}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        r.self_reported_status === 'Placed'
                          ? 'bg-blue-100 text-blue-800'
                          : r.self_reported_status === 'Applied'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.self_reported_status}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.employer_confirmed ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> Yes (Verified)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold w-fit">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3">{r.employer_name || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {r.checkin_count || `${r.completed_checkins || 0}/${r.total_checkins || 4}`} Completed
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. EMPLOYER PLACEMENT CONFIRMATION QUEUE (EMPLOYER / GOVT)    */}
      {/* ------------------------------------------------------------- */}
      {(role === 'employer' || role === 'government') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Employer Placement Confirmation Queue</span>
              </h2>
              <p className="text-xs text-slate-500">Corporate recruiter dashboard to confirm or dispute candidate placement reports</p>
            </div>

            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
              Corporate HR Audit
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Placement Date</th>
                  <th className="p-3">Salary Band</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Corporate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {employerQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-800">{item.candidate_name}</td>
                    <td className="p-3 font-bold text-blue-700">{item.self_reported_status}</td>
                    <td className="p-3 font-mono">{item.placement_date || 'N/A'}</td>
                    <td className="p-3 font-mono">{item.salary_band || 'N/A'}</td>
                    <td className="p-3">
                      {item.employer_confirmed ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Confirmed</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Pending Review</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEmployerVerify(item.id, 'confirm')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Confirm
                        </button>
                        <button
                          onClick={() => handleEmployerVerify(item.id, 'dispute')}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2.5 rounded text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <X className="w-3 h-3" /> Dispute
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. DEV / TESTING TOOLS SLIDE-OVER (SEPARATED FROM MAIN VIEW)  */}
      {/* ------------------------------------------------------------- */}
      {import.meta.env.DEV && showDevPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-auto relative animate-fade-in-up">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#C9A227]" />
                <h3 className="font-bold text-sm">Testing & Simulation Tools (Dev Only)</h3>
              </div>
              <button 
                onClick={() => setShowDevPanel(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <p className="text-slate-500 text-[11px]">
                These controls allow quick switching between test candidates and overriding the system reference date to test unlocking Day 30, 90, 180, and 365 milestones.
              </p>

              {/* Inspect Candidate */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Inspect Test Candidate
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'cand-01', label: 'Rahul Sharma (Placed, Day 30 Done)' },
                    { id: 'cand-05', label: 'Vikas Shinde (Applied, Unplaced)' },
                    { id: 'cand-03', label: 'Amit Verma (Placed, Day 30 Due Now)' }
                  ].map(cand => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => {
                        setSelectedCandidateId(cand.id);
                        setShowDevPanel(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded font-medium transition-all ${
                        selectedCandidateId === cand.id
                          ? 'bg-govt-navy text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cand.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Simulation Override */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Simulated Current Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={simulatedDateStr}
                    onChange={(e) => setSimulatedDateStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Default is 2026-09-13. Advance date forward (e.g. 2026-11-15) to simulate Day 90 milestone unlocking.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDevPanel(false)}
                  className="btn-govt-primary text-xs py-2 px-4"
                >
                  Close Tools
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
