import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { WhatsAppWidget } from '../components/WhatsAppWidget';
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
  MessageSquare
} from 'lucide-react';

export const EmploymentStatusPage = () => {
  const { user, role } = useAuth();

  const [record, setRecord] = useState(null);
  const [employers, setEmployers] = useState([]);
  const [employerQueue, setEmployerQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [whatsAppNotice, setWhatsAppNotice] = useState('');

  // Candidate Self-Report Form State
  const [formData, setFormData] = useState({
    status: 'Placed',
    confirmed_employer_id: 'emp-01',
    role_match: true,
    salary_band: '₹ 22,000 - ₹ 28,000 / mo'
  });

  const [submittingSelfReport, setSubmittingSelfReport] = useState(false);
  const [selfReportMsg, setSelfReportMsg] = useState('');

  // Check-in modal / stepper state
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [checkInState, setCheckInState] = useState({
    current_status: 'Still Employed',
    role_match: true,
    salary_change: 'Same'
  });
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');

  useEffect(() => {
    loadStatusData();
  }, [role]);

  const loadStatusData = async () => {
    setLoading(true);
    try {
      const [candRes, empRes] = await Promise.all([
        fetchWithAuth('/api/portal/employment-status/candidate?candidate_id=cand-01', {}, role).catch(() => null),
        fetchWithAuth('/api/portal/employers', {}, role).catch(() => ({ employers: [] }))
      ]);

      if (candRes?.record) {
        setRecord(candRes.record);
        setFormData({
          status: candRes.record.status || 'Placed',
          confirmed_employer_id: candRes.record.confirmed_employer_id || 'emp-01',
          role_match: candRes.record.role_match !== undefined ? candRes.record.role_match : true,
          salary_band: candRes.record.salary_band || '₹ 22,000 - ₹ 28,000 / mo'
        });
      }

      setEmployers(empRes.employers || []);

      if (role === 'employer' || role === 'government') {
        const queueRes = await fetchWithAuth('/api/portal/employment-status/employer-queue', {}, role);
        setEmployerQueue(queueRes.pendingPlacements || []);
      }
    } catch (err) {
      console.warn('Error loading employment status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerWhatsAppPrompt = async () => {
    try {
      const res = await fetchWithAuth('/api/whatsapp/send-prompt', {
        method: 'POST',
        body: JSON.stringify({
          mobile: '+91 98765 43210',
          promptType: `${selectedInterval}_day`,
          lang: 'hi'
        })
      }, role);

      if (res.success) {
        setWhatsAppNotice(`WhatsApp Day-${selectedInterval} template reminder dispatched to candidate's mobile number (+91 98765 43210)! Check live WhatsApp simulator on bottom right.`);
        setTimeout(() => setWhatsAppNotice(''), 5000);
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
      const res = await fetchWithAuth('/api/portal/employment-status/self-report', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: 'cand-01',
          ...formData
        })
      }, role);

      if (res.success) {
        setRecord(res.record);
        setSelfReportMsg(`Self-reported status updated to '${res.record.status}'! Awaiting employer verification.`);
      }
    } catch (err) {
      alert('Error updating self-report: ' + err.message);
    } finally {
      setSubmittingSelfReport(false);
    }
  };

  const handleEmployerVerify = async (recordId, action) => {
    try {
      const res = await fetchWithAuth('/api/portal/employment-status/verify', {
        method: 'POST',
        body: JSON.stringify({
          record_id: recordId,
          action
        })
      }, role);

      if (res.success) {
        alert(res.message);
        loadStatusData();
      }
    } catch (err) {
      alert('Error verifying placement: ' + err.message);
    }
  };

  const handleCheckInSubmit = async (intervalDays) => {
    setSubmittingCheckIn(true);
    setCheckInMsg('');

    try {
      const res = await fetchWithAuth('/api/portal/employment-status/checkin', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: 'cand-01',
          interval_days: intervalDays,
          ...checkInState
        })
      }, role);

      if (res.success) {
        setRecord(res.record);
        setCheckInMsg(`Day ${intervalDays} longitudinal check-in saved! Thank you for updating.`);
      }
    } catch (err) {
      alert('Error saving check-in: ' + err.message);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const checkIns = record?.check_ins || {};

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
                  LONGITUDINAL TRACKING
                </span>
                <span className="text-xs text-purple-200">WhatsApp Business Integrated</span>
              </div>
              <h1 className="text-xl font-bold">Employment Status & Retention Check-Ins</h1>
              <p className="text-xs text-slate-300">Self-report placement status, employer verification, and 30/90/180/365 day prompts.</p>
            </div>
          </div>

          <button
            onClick={handleTriggerWhatsAppPrompt}
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Trigger WhatsApp Prompt</span>
          </button>
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
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-govt-navy" />
              <span>1. Candidate Employment Self-Report</span>
            </h2>
            <p className="text-xs text-slate-500">Update your active status: Applied, Interviewing, Placed, or Unemployed</p>
          </div>

          {record?.verified_by_employer && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified by {record.employer_name}
            </span>
          )}
        </div>

        {selfReportMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{selfReportMsg}</span>
          </div>
        )}

        <form onSubmit={handleSelfReportSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Current Status</label>
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
                      <option key={emp.id} value={emp.id}>{emp.company_name} ({emp.industry_sector})</option>
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
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingSelfReport}
              className="btn-govt-primary text-xs py-2.5 px-6 font-bold uppercase tracking-wider"
            >
              {submittingSelfReport ? 'Updating Status...' : 'Save Self-Report Status'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SCHEDULED LONGITUDINAL CHECK-IN PROMPTS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-govt-orange" />
              <span>2. Scheduled Longitudinal Check-in Prompts</span>
            </h2>
            <p className="text-xs text-slate-500">Triggered via WhatsApp Business Bot at 30, 90, 180, and 365 days after placement</p>
          </div>

          <button
            onClick={handleTriggerWhatsAppPrompt}
            className="text-xs font-bold text-[#25D366] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-[#25D366]" />
            <span>Send WhatsApp Reminder</span>
          </button>
        </div>

        {checkInMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{checkInMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {[30, 90, 180, 365].map((days) => {
            const item = checkIns[days] || {};
            const isCompleted = item.completed;
            const isSelected = selectedInterval === days;

            return (
              <button
                key={days}
                onClick={() => setSelectedInterval(days)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-govt-orange bg-amber-50/80 ring-2 ring-govt-orange/20 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Day {days} Prompt</span>
                  {isCompleted ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isCompleted ? `Done (${item.status})` : 'WhatsApp Trigger Ready'}
                </p>
              </button>
            );
          })}
        </div>

        <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-govt-orange" />
              <span>Day {selectedInterval} Longitudinal Check-in Form</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded font-bold">
              Prompt Interval: {selectedInterval} Days
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Continued Employment Status</label>
              <select
                value={checkInState.current_status}
                onChange={(e) => setCheckInState({ ...checkInState, current_status: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2"
              >
                <option value="Still Employed">Still Employed (Same Company)</option>
                <option value="Changed Job">Changed Job (New Company)</option>
                <option value="Unemployed">Currently Unemployed</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Role Match Confirmation</label>
              <select
                value={checkInState.role_match ? 'yes' : 'no'}
                onChange={(e) => setCheckInState({ ...checkInState, role_match: e.target.value === 'yes' })}
                className="w-full bg-white border border-slate-300 rounded-md p-2"
              >
                <option value="yes">Yes - Role matches trained skill</option>
                <option value="no">No - Different role / responsibilities</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Salary Band Change</label>
              <select
                value={checkInState.salary_change}
                onChange={(e) => setCheckInState({ ...checkInState, salary_change: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2"
              >
                <option value="Increased">Increased (Salary Increment)</option>
                <option value="Same">Same Salary Band</option>
                <option value="Decreased">Decreased</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleCheckInSubmit(selectedInterval)}
              disabled={submittingCheckIn}
              className="btn-govt-orange text-xs py-2 px-5 font-bold uppercase tracking-wider"
            >
              {submittingCheckIn ? 'Saving Response...' : `Submit Day ${selectedInterval} Check-in`}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: EMPLOYER CONFIRMATION & DISPUTE SCREEN */}
      {(role === 'employer' || role === 'government') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>3. Employer Placement Verification Queue</span>
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
                  <th className="p-3">Claimed Employer</th>
                  <th className="p-3">Salary Band</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Corporate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {employerQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-800">{item.candidate_name}</td>
                    <td className="p-3 font-bold text-blue-700">{item.status}</td>
                    <td className="p-3">{item.employer_name}</td>
                    <td className="p-3 font-mono">{item.salary_band}</td>
                    <td className="p-3">
                      {item.verified_by_employer ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Confirmed</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Pending Review</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEmployerVerify(item.id, 'confirm')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Confirm
                        </button>
                        <button
                          onClick={() => handleEmployerVerify(item.id, 'dispute')}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2.5 rounded text-[11px] flex items-center gap-1"
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
      <WhatsAppWidget candidateName={user?.full_name} />
    </div>
  );
};
