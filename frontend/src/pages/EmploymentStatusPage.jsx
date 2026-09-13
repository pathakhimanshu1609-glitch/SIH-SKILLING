import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { WhatsAppWidget } from '../components/WhatsAppWidget';
import { subscribeEmploymentSync, notifyEmploymentChange } from '../lib/realtimeSync';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Users, 
  Calendar, 
  TrendingUp, 
  FileCheck, 
  XCircle, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  IndianRupee,
  MessageSquare,
  Lock,
  Unlock,
  Radio,
  Check,
  AlertCircle
} from 'lucide-react';

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
  const [whatsAppNotice, setWhatsAppNotice] = useState('');
  const [realtimePulse, setRealtimePulse] = useState(false);

  // Date Simulation toggle (Reference date default is 2026-09-13)
  const [simulatedDateStr, setSimulatedDateStr] = useState('2026-09-13');

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

  // Subscribe to realtime updates across tabs & Supabase
  useEffect(() => {
    const unsubscribe = subscribeEmploymentSync((event) => {
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 2500);
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

  const handleTriggerWhatsAppPrompt = async (intervalDay = 30) => {
    try {
      const res = await fetchWithAuth('/api/whatsapp/send-prompt', {
        method: 'POST',
        body: JSON.stringify({
          mobile: '+91 98765 43210',
          promptType: `${intervalDay}_day`,
          lang: 'hi'
        })
      }, role);

      if (res.success) {
        setWhatsAppNotice(`WhatsApp Day-${intervalDay} longitudinal retention prompt sent to candidate (+91 98765 43210)! Check live WhatsApp simulator on bottom right.`);
        setTimeout(() => setWhatsAppNotice(''), 6000);
      }
    } catch (err) {
      alert('WhatsApp Dispatch Error: ' + err.message);
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
        setSelfReportMsg(`Status successfully saved as '${res.record.self_reported_status}'. ${res.checkins_generated ? '4 Longitudinal retention check-in milestones (Day 30, 90, 180, 365) auto-generated in Supabase!' : ''}`);
        notifyEmploymentChange('candidate_self_report', { candidate_id: selectedCandidateId, status: res.record.self_reported_status });
      }
    } catch (err) {
      alert('Error updating self-report: ' + err.message);
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
        setCheckInMsg(`Day ${intervalDays} longitudinal retention survey saved! Status: ${formVals.continued_employment_status}.`);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-roboto relative">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-govt-navy via-slate-900 to-purple-950 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-govt-orange text-white flex items-center justify-center font-bold shadow">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  UNIFIED EMPLOYMENT TRACKING
                </span>
                <span className="text-xs text-purple-200">Supabase Realtime Sync</span>
                {realtimePulse && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-spin" /> Live Synced
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold">Placement Verification & Longitudinal Check-Ins</h1>
              <p className="text-xs text-slate-300">Single shared data model (`employment_records` & `checkins`) across Candidate, Employer, and Training Center portals.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerWhatsAppPrompt(30)}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>WhatsApp Bot Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Inspector & Date Simulator Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-govt-navy" />
            Inspect Candidate:
          </span>
          <div className="flex gap-2">
            {[
              { id: 'cand-01', label: 'Ananya Sharma (Placed, Day 30 Done)' },
              { id: 'cand-05', label: 'Vikas Shinde (Applied, Unplaced)' },
              { id: 'cand-03', label: 'Amit Verma (Placed, Day 30 Due Now)' }
            ].map(cand => (
              <button
                key={cand.id}
                onClick={() => setSelectedCandidateId(cand.id)}
                className={`px-3 py-1.5 rounded font-bold transition-all ${
                  selectedCandidateId === cand.id
                    ? 'bg-govt-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cand.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          <Calendar className="w-4 h-4 text-govt-orange" />
          <span className="font-bold text-amber-900">Current Date:</span>
          <input
            type="date"
            value={simulatedDateStr}
            onChange={(e) => setSimulatedDateStr(e.target.value)}
            className="bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-amber-950"
          />
          <span className="text-[10px] text-amber-800">(Change date to test unlocking due check-ins)</span>
        </div>
      </div>

      {whatsAppNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            <span>{whatsAppNotice}</span>
          </div>
        </div>
      )}

      {/* SECTION 1: CANDIDATE SELF-REPORT FORM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-govt-navy" />
              <span>1. Candidate Employment Self-Report (`employment_records`)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Candidate: <strong>{record?.candidate_name || 'Candidate'}</strong> ({record?.trade || 'Skill Trade'}) • District: <strong>{record?.district || 'Pune'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {record?.employer_confirmed ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified by {record.employer_name || 'Employer'} on {record.employer_confirmed_at ? new Date(record.employer_confirmed_at).toLocaleDateString() : 'N/A'}
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Pending Employer Verification
              </span>
            )}
          </div>
        </div>

        {selfReportMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{selfReportMsg}</span>
          </div>
        )}

        <form onSubmit={handleSelfReportSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Current Status (writes to <code>self_reported_status</code>)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {['Applied', 'Interviewing', 'Placed', 'Unemployed'].map((st) => {
                const isSelected = formData.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: st })}
                    className={`p-3.5 rounded-lg border text-center font-bold transition-all ${
                      isSelected
                        ? 'border-govt-navy bg-blue-50/80 text-govt-navy ring-2 ring-govt-navy/20 shadow-sm'
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
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirmed Employer</label>
                  <select
                    value={formData.confirmed_employer_id}
                    onChange={(e) => setFormData({ ...formData, confirmed_employer_id: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-md p-2.5"
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
                    className="w-full bg-white border border-slate-300 text-xs rounded-md p-2.5 font-mono text-slate-800"
                  >
                    <option value="₹ 15,000 - ₹ 20,000 / mo">₹ 15,000 - ₹ 20,000 / mo</option>
                    <option value="₹ 20,000 - ₹ 25,000 / mo">₹ 20,000 - ₹ 25,000 / mo</option>
                    <option value="₹ 25,000 - ₹ 30,000 / mo">₹ 25,000 - ₹ 30,000 / mo</option>
                    <option value="₹ 30,000+ / mo">₹ 30,000+ / mo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="role_match_chk"
                  checked={formData.role_match}
                  onChange={(e) => setFormData({ ...formData, role_match: e.target.checked })}
                  className="w-4 h-4 text-govt-navy rounded border-slate-300 focus:ring-govt-navy"
                />
                <label htmlFor="role_match_chk" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Role Match Confirmed (Job role directly matches my trained NCVT skill trade)
                </label>
              </div>

              {record?.placement_date && (
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                  📅 Initial Placement Date: <strong>{record.placement_date}</strong> (All 4 check-in milestones keyed to this date)
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingSelfReport}
              className="btn-govt-primary text-xs py-2.5 px-6 font-bold uppercase tracking-wider shadow-sm hover:shadow"
            >
              {submittingSelfReport ? 'Updating Status...' : 'Save Self-Report Status'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SCHEDULED LONGITUDINAL CHECK-IN PROMPTS (GATED LOGIC) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-govt-orange" />
              <span>2. Scheduled Longitudinal Check-in Prompts (`checkins` table)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Only shows active form once <code>due_date</code> has passed AND <code>submitted_at</code> is null. Otherwise shown as locked/upcoming or completed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              {checkins.filter(c => c.submitted_at).length} of 4 Milestones Completed
            </span>
          </div>
        </div>

        {checkInMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{checkInMsg}</span>
          </div>
        )}

        {/* UNPLACED NOTICE (Fixes bug where 365-day form was shown to candidate with status 'Applied') */}
        {record?.self_reported_status !== 'Placed' ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Longitudinal Check-Ins Currently Inactive</h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
                Candidate's self-reported status is currently <strong>'{record?.self_reported_status || 'Applied'}'</strong>. 
                Longitudinal retention check-ins (at 30, 90, 180, and 365 days) are only scheduled once you self-report as <strong>'Placed'</strong>.
              </p>
            </div>
            <p className="text-[11px] text-purple-700 font-medium">
              💡 Update status to 'Placed' in Section 1 above to auto-generate the 4 check-in milestones.
            </p>
          </div>
        ) : (
          /* PLACED CANDIDATE: RENDER 4 MILESTONES (30, 90, 180, 365) */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[30, 90, 180, 365].map((days) => {
                const { state, item, daysRemaining } = getCheckinStatus(days);

                return (
                  <div
                    key={days}
                    className={`p-4 rounded-xl border transition-all ${
                      state === 'completed'
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : state === 'due'
                        ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400/30 shadow-md'
                        : 'border-slate-200 bg-slate-50/70 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800">Day {days} Milestone</span>
                      {state === 'completed' ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs" title="Completed">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : state === 'due' ? (
                        <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs animate-bounce" title="Due Now!">
                          <Unlock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs" title="Locked">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-bold text-slate-700">{item?.due_date || 'N/A'}</span>
                      </div>

                      {state === 'completed' && (
                        <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800">
                          <p className="font-bold">✓ Submitted</p>
                          <p className="text-[10px] text-slate-500">{new Date(item.submitted_at).toLocaleDateString()}</p>
                        </div>
                      )}

                      {state === 'due' && (
                        <div className="pt-2 border-t border-amber-300 text-[11px] text-amber-900 font-bold">
                          <span className="bg-amber-200 px-2 py-0.5 rounded text-[10px] uppercase">
                            Due Now • Action Required
                          </span>
                        </div>
                      )}

                      {state === 'locked' && (
                        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                          <span>Unlocks in <strong>{daysRemaining}</strong> days</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CHECK-IN DETAIL & ACTIVE FORMS */}
            <div className="space-y-4">
              {[30, 90, 180, 365].map((days) => {
                const { state, item, daysRemaining } = getCheckinStatus(days);
                const formVals = checkInForms[days] || {};

                if (state === 'completed') {
                  return (
                    <div key={days} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          {days}d
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">Day {days} Longitudinal Verification Completed</h4>
                          <p className="text-slate-600 text-[11px]">
                            Status: <strong>{item.continued_employment_status}</strong> • Role Match: <strong>{item.role_match_confirmation ? 'Yes' : 'No'}</strong> • Salary: <strong>{item.salary_band_change}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded font-bold border border-emerald-300">
                        Submitted {new Date(item.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                }

                if (state === 'due') {
                  return (
                    <div key={days} className="p-5 rounded-xl bg-amber-50/70 border border-amber-300 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
                          <Unlock className="w-4 h-4 text-amber-700" />
                          <span>Day {days} Longitudinal Check-in Form (Due: {item?.due_date})</span>
                        </h3>
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                          Form Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Continued Employment Status</label>
                          <select
                            value={formVals.continued_employment_status}
                            onChange={(e) => setCheckInForms({
                              ...checkInForms,
                              [days]: { ...formVals, continued_employment_status: e.target.value }
                            })}
                            className="w-full bg-white border border-slate-300 rounded-md p-2 font-medium text-slate-800"
                          >
                            <option value="Still Employed">Still Employed (Same Company)</option>
                            <option value="Changed Job">Changed Job (New Company)</option>
                            <option value="Unemployed">Currently Unemployed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Role Match Confirmation</label>
                          <select
                            value={formVals.role_match_confirmation ? 'yes' : 'no'}
                            onChange={(e) => setCheckInForms({
                              ...checkInForms,
                              [days]: { ...formVals, role_match_confirmation: e.target.value === 'yes' }
                            })}
                            className="w-full bg-white border border-slate-300 rounded-md p-2 font-medium text-slate-800"
                          >
                            <option value="yes">Yes - Role matches trained skill</option>
                            <option value="no">No - Different role / responsibilities</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Salary Band Change</label>
                          <select
                            value={formVals.salary_band_change}
                            onChange={(e) => setCheckInForms({
                              ...checkInForms,
                              [days]: { ...formVals, salary_band_change: e.target.value }
                            })}
                            className="w-full bg-white border border-slate-300 rounded-md p-2 font-medium text-slate-800"
                          >
                            <option value="Increased">Increased (Salary Increment)</option>
                            <option value="Same">Same Salary Band</option>
                            <option value="Decreased">Decreased</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleCheckInSubmit(days)}
                          disabled={submittingInterval === days}
                          className="btn-govt-orange text-xs py-2 px-5 font-bold uppercase tracking-wider shadow"
                        >
                          {submittingInterval === days ? 'Saving Response...' : `Submit Day ${days} Check-in`}
                        </button>
                      </div>
                    </div>
                  );
                }

                // Locked / Upcoming
                return (
                  <div key={days} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700">Day {days} Retention Milestone</h4>
                        <p className="text-[11px] text-slate-500">
                          Locked until due date (<strong>{item?.due_date}</strong>). Unlocks automatically in {daysRemaining} days.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold">
                      Upcoming
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TRAINING CENTER READ-ONLY REGISTER (Joined on training_center_id) */}
      {(role === 'training_center' || role === 'government') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-700" />
                <span>3. Training Center Read-Only Register (`training_center_id: tc-01`)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Audit view joined directly on <code>training_center_id</code>. Shows self-reported status, employer confirmation badge, and check-in completion count.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded">
              Read-Only Audit Roster
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Trade & District</th>
                  <th className="p-3">Self-Reported Status</th>
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
                          <Check className="w-3 h-3 text-emerald-700" /> Yes (Verified)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold w-fit">
                          No (Pending)
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

      {/* SECTION 4: EMPLOYER CONFIRMATION & DISPUTE SCREEN */}
      {(role === 'employer' || role === 'government') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>4. Employer Placement Confirmation Queue (`employer_id: emp-01`)</span>
              </h2>
              <p className="text-xs text-slate-500">Corporate recruiter screen to confirm or dispute candidate placement self-reports</p>
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
                  <th className="p-3">Self-Reported Status</th>
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
                          <XCircle className="w-3 h-3" /> Dispute
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

      {/* Floating Interactive WhatsApp Chatbot Simulator */}
      <WhatsAppWidget candidateName={record?.candidate_name || user?.full_name} />
    </div>
  );
};
