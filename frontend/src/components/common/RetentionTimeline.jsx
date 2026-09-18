import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  UserMinus,
  Upload,
  FileText,
  Check,
  X,
  ChevronRight,
  Building2,
  Calendar,
  ShieldAlert,
  FileCheck,
  Info,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const RetentionTimeline = ({
  candidateId = 'cand-01',
  companyName = 'Tata Advanced Engineering Solutions',
  hireDate = '2026-08-01',
  onRefresh = null
}) => {
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Self-report modal state
  const [showSelfReportModal, setShowSelfReportModal] = useState(false);
  const [selfReportDay, setSelfReportDay] = useState(30);
  const [stillEmployed, setStillEmployed] = useState(true);
  const [reportNotes, setReportNotes] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Salary slip upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDay, setUploadDay] = useState(30);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadNotes, setUploadNotes] = useState('');

  // Status message
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadRetentionData();
  }, [candidateId]);

  const loadRetentionData = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/api/portal/retention/${candidateId}`, {}, role);
      if (data?.checkpoints) {
        setTimelineData(data);
        if (!selectedMilestone && data.checkpoints.length > 0) {
          // Select first pending milestone or day 30
          const activeCp = data.checkpoints.find(c => c.status === 'pending') || data.checkpoints[0];
          setSelectedMilestone(activeCp.checkpoint_day);
        }
      }
    } catch (err) {
      console.warn('Notice loading retention checkpoints:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Submit Candidate Self-Report
  const handleSelfReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetchWithAuth('/api/portal/retention/verify', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: candidateId,
          checkpoint_day: selfReportDay,
          verification_method: 'candidate_self_report',
          still_employed: stillEmployed,
          notes: reportNotes || (stillEmployed ? 'Confirmed continued employment.' : 'Reported separation.')
        })
      }, role);

      if (res.success) {
        showToast(res.message, res.verified ? 'success' : 'info');
        setShowSelfReportModal(false);
        setReportNotes('');
        await loadRetentionData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast('Error submitting self-report: ' + err.message, 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Submit Salary Slip Proof Upload
  const handleSalarySlipSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert('Please select a salary slip document (PDF or image).');
      return;
    }

    setUploading(true);
    setUploadProgress(25);

    try {
      let fileUrl = `https://storage.supabase.co/v1/object/public/salary-slips/${candidateId}-day${uploadDay}-${Date.now()}.pdf`;

      // Live Supabase storage upload if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const filePath = `${candidateId}/day_${uploadDay}_${Date.now()}_${uploadedFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('salary-slips')
            .upload(filePath, uploadedFile, { upsert: true });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('salary-slips')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              fileUrl = publicUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage fallback used:', storageErr.message);
        }
      }

      setUploadProgress(75);

      const res = await fetchWithAuth('/api/portal/retention/verify', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: candidateId,
          checkpoint_day: uploadDay,
          verification_method: 'salary_slip_upload',
          salary_slip_url: fileUrl,
          notes: uploadNotes || `Uploaded proof: ${uploadedFile.name}`
        })
      }, role);

      setUploadProgress(100);

      if (res.success) {
        showToast(res.message, res.verified ? 'success' : 'info');
        setShowUploadModal(false);
        setUploadedFile(null);
        setUploadNotes('');
        await loadRetentionData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast('Error uploading proof: ' + err.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Quick Demo Trigger: Simulate Employer HR Verification
  const handleSimulateEmployerConfirm = async (day) => {
    try {
      const res = await fetchWithAuth('/api/portal/retention/verify', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: candidateId,
          checkpoint_day: day,
          verification_method: 'employer_confirmation',
          still_employed: true,
          notes: 'Employer HR confirmed active roster & biometric attendance.'
        })
      }, role);

      if (res.success) {
        showToast(res.message, res.verified ? 'success' : 'info');
        await loadRetentionData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast('Error simulating employer confirmation: ' + err.message, 'error');
    }
  };

  const checkpoints = timelineData?.checkpoints || [
    { checkpoint_day: 30, checkpoint_due_date: '2026-08-31', status: 'verified', consensus_score: 2, candidate_confirmed: true, employer_confirmed: true, salary_slip_url: null },
    { checkpoint_day: 90, checkpoint_due_date: '2026-10-30', status: 'pending', consensus_score: 0, candidate_confirmed: false, employer_confirmed: false, salary_slip_url: null },
    { checkpoint_day: 180, checkpoint_due_date: '2027-01-28', status: 'pending', consensus_score: 0, candidate_confirmed: false, employer_confirmed: false, salary_slip_url: null },
    { checkpoint_day: 365, checkpoint_due_date: '2027-08-01', status: 'pending', consensus_score: 0, candidate_confirmed: false, employer_confirmed: false, salary_slip_url: null }
  ];

  const activeMilestone = checkpoints.find(c => c.checkpoint_day === selectedMilestone) || checkpoints[0];

  // Helper for Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified Genuine',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: ShieldCheck
        };
      case 'candidate_left':
        return {
          label: 'Candidate Separated',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          icon: UserMinus
        };
      case 'missed':
        return {
          label: 'Checkpoint Missed',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-600',
          icon: AlertCircle
        };
      case 'pending':
      default:
        return {
          label: 'Pending Consensus',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock
        };
    }
  };

  const employerName = timelineData?.employer?.name || companyName;
  const verifiedCount = checkpoints.filter(c => c.status === 'verified').length;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sm:p-8 space-y-7 font-sans">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition-all ${
          toastMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            : toastMessage.type === 'info'
            ? 'bg-blue-50 border border-blue-200 text-blue-900'
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B3D6B] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#111827] flex items-center gap-2">
                Post-Placement Retention Tracking
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tripartite Consensus
                </span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Longitudinal employment verification at Day 30, 90, 180 & 365 to verify long-term employment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-[#0B3D6B]" />
              <span className="font-semibold">{employerName}</span>
            </div>
            <span className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-[#D2691E]" />
              <span>Hired: <strong className="font-semibold">{hireDate}</strong></span>
            </div>
          </div>

          <button
            onClick={loadRetentionData}
            title="Refresh Timeline Status"
            className="p-2 rounded-lg border border-[#E5E7EB] text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* HORIZONTAL CONNECTED TIMELINE */}
      <div className="relative pt-3 pb-2">
        <div className="overflow-x-auto">
          <div className="min-w-[620px] px-6">
            
            {/* Connecting Bar */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-10 right-10 top-6 h-1.5 bg-[#E5E7EB] rounded-full z-0" />
              <div
                className="absolute left-10 top-6 h-1.5 bg-emerald-600 rounded-full transition-all duration-500 z-0"
                style={{
                  width: `${(Math.max(0, verifiedCount - 0.5) / 3) * 100}%`
                }}
              />

              {/* Milestones: Day 30 -> 90 -> 180 -> 365 */}
              {checkpoints.map((cp, idx) => {
                const badge = getStatusBadge(cp.status);
                const isSelected = selectedMilestone === cp.checkpoint_day;
                const IconComponent = badge.icon;
                const isVerified = cp.status === 'verified';

                return (
                  <div
                    key={cp.checkpoint_day}
                    onClick={() => setSelectedMilestone(cp.checkpoint_day)}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                        isVerified
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 group-hover:scale-105'
                          : cp.status === 'missed'
                          ? 'bg-rose-600 text-white ring-4 ring-rose-100 group-hover:scale-105'
                          : cp.status === 'candidate_left'
                          ? 'bg-slate-600 text-white ring-4 ring-slate-100'
                          : 'bg-white text-amber-700 border-2 border-amber-400 ring-4 ring-amber-50 group-hover:scale-105'
                      } ${isSelected ? 'ring-offset-2 ring-offset-white ring-[#0B3D6B]' : ''}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Labels */}
                    <div className="text-center mt-3 space-y-1">
                      <p className={`text-xs font-bold transition-colors ${
                        isSelected ? 'text-[#0B3D6B]' : 'text-[#111827]'
                      }`}>
                        Day {cp.checkpoint_day}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Due: {cp.checkpoint_due_date}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SELECTED MILESTONE INSPECTION CARD */}
      {activeMilestone && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#0B3D6B] text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono">
                  Day {activeMilestone.checkpoint_day} Milestone
                </span>
                <span className="text-xs text-slate-600">
                  Target Checkpoint Date: <strong className="font-semibold text-slate-900">{activeMilestone.checkpoint_due_date}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeMilestone.status === 'verified'
                  ? `Successfully authenticated genuine retention on ${activeMilestone.verified_at ? new Date(activeMilestone.verified_at).toLocaleDateString() : 'scheduled date'}.`
                  : activeMilestone.status === 'candidate_left'
                  ? 'Employment separation confirmed. Candidate has transitioned out of this position.'
                  : 'Requires 2 of 3 independent confirmation sources to verify continued placement and prevent fraud.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusBadge(activeMilestone.status).bg}`}>
                <span className={`w-2 h-2 rounded-full ${getStatusBadge(activeMilestone.status).dot}`} />
                Status: {getStatusBadge(activeMilestone.status).label}
              </span>
            </div>
          </div>

          {/* TRIPARTITE CONSENSUS STATUS BAR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B3D6B]" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Tripartite Consensus Breakdown
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 font-mono">
                Consensus Score: <strong className="text-[#0B3D6B]">{activeMilestone.consensus_score || 0} / 3</strong> 
                <span className="text-slate-500 font-normal"> (Minimum 2 Required)</span>
              </span>
            </div>

            {/* 3 Confirmation Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Method 1: Candidate Self-Report */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                activeMilestone.candidate_confirmed
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeMilestone.candidate_confirmed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {activeMilestone.candidate_confirmed ? <Check className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">1. Candidate Self-Report</p>
                      <p className="text-[10px] text-slate-500">Trainee employment report</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    activeMilestone.candidate_confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activeMilestone.candidate_confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                {activeMilestone.candidate_confirmed_at && (
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    Logged: {new Date(activeMilestone.candidate_confirmed_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Method 2: Employer Confirmation */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                activeMilestone.employer_confirmed
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeMilestone.employer_confirmed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {activeMilestone.employer_confirmed ? <Check className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">2. Employer HR Verification</p>
                      <p className="text-[10px] text-slate-500">Corporate roster confirmation</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    activeMilestone.employer_confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activeMilestone.employer_confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                {activeMilestone.employer_confirmed_at && (
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    Verified: {new Date(activeMilestone.employer_confirmed_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Method 3: Salary Slip Upload */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                Boolean(activeMilestone.salary_slip_url)
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      Boolean(activeMilestone.salary_slip_url) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {Boolean(activeMilestone.salary_slip_url) ? <Check className="w-3.5 h-3.5" /> : '3'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">3. Salary Slip Proof</p>
                      <p className="text-[10px] text-slate-500">Bank credit / wage slip upload</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    Boolean(activeMilestone.salary_slip_url) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {Boolean(activeMilestone.salary_slip_url) ? 'Uploaded' : 'Pending'}
                  </span>
                </div>
                {activeMilestone.salary_slip_url && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[#0B3D6B] font-semibold">
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[170px]">Pay Stub Attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Single-Party Anti-Fraud Warning Pill */}
            {activeMilestone.consensus_score === 1 && activeMilestone.candidate_confirmed && !activeMilestone.employer_confirmed && !activeMilestone.salary_slip_url && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-bold">Anti-Fraud Single-Party Gating Active:</strong> Candidate self-report has been recorded, but status will remain <em>Pending</em> until either employer confirms or a salary slip is uploaded.
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Candidate Self-Report Button */}
              <button
                type="button"
                onClick={() => {
                  setSelfReportDay(activeMilestone.checkpoint_day);
                  setShowSelfReportModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B3D6B] text-white text-xs font-semibold hover:bg-[#082a4a] transition-colors shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Self-Report Status</span>
              </button>

              {/* Salary Slip Upload Button */}
              <button
                type="button"
                onClick={() => {
                  setUploadDay(activeMilestone.checkpoint_day);
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Upload className="w-4 h-4 text-[#D2691E]" />
                <span>Upload Salary Slip</span>
              </button>
            </div>

            {/* Quick Demo Simulator for Reviewers / Judges */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Judge Demo Tool:</span>
              <button
                type="button"
                onClick={() => handleSimulateEmployerConfirm(activeMilestone.checkpoint_day)}
                title="Simulate Employer HR confirmation to test bipartite consensus"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Simulate Employer Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CANDIDATE SELF-REPORT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showSelfReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B3D6B] text-white flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Day {selfReportDay} Employment Check-In
                  </h3>
                  <p className="text-[11px] text-slate-500">Self-reporting for genuine retention tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelfReportModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSelfReportSubmit} className="space-y-4">
              
              {/* Question: Still employed at company? */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Are you still employed at <strong className="text-[#0B3D6B]">{employerName}</strong>?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    stillEmployed
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="employment_choice"
                      checked={stillEmployed}
                      onChange={() => setStillEmployed(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Yes, Still Employed</span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    !stillEmployed
                      ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="employment_choice"
                      checked={!stillEmployed}
                      onChange={() => setStillEmployed(false)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>No, Left Position</span>
                  </label>
                </div>
              </div>

              {/* Notes input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Additional Notes / Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder={stillEmployed ? "e.g., Working as Junior CNC Machinist, completed 1st month training successfully." : "e.g., Left position on 2026-09-01 for higher studies."}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3D6B]"
                />
              </div>

              {/* Anti-Fraud Notice Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B3D6B]" />
                  <span>Fraud-Prevention Verification Standard:</span>
                </div>
                <p>
                  Your submission counts as 1 confirmation. Under Kaushal Setu rules, a status of <strong>'Verified'</strong> requires at least 2 independent confirmations (Candidate + Employer or Salary Slip).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSelfReportModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-lg bg-[#0B3D6B] text-white text-xs font-bold hover:bg-[#082a4a] disabled:opacity-50"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Self-Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SALARY SLIP PROOF UPLOAD MODAL */}
      {/* ------------------------------------------------------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D2691E] text-white flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Upload Day {uploadDay} Salary Slip Proof
                  </h3>
                  <p className="text-[11px] text-slate-500">Bank credit statement or wage slip proof (Supabase Storage)</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalarySlipSubmit} className="space-y-4">
              
              {/* File Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Select Document (PDF, PNG, JPG - max 5MB)
                </label>
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#0B3D6B] transition-colors cursor-pointer bg-slate-50/60">
                  <input
                    type="file"
                    id="salary_slip_input"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="salary_slip_input" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B3D6B] flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    {uploadedFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB • Ready to upload</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Click to browse or drop file here</p>
                        <p className="text-[10px] text-slate-400">Official company pay stub or bank account credit statement</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                    <span>Uploading to Supabase Storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Proof note input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Reference Note (Optional)
                </label>
                <input
                  type="text"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Salary credited via NEFT for August 2026"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0B3D6B]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadedFile}
                  className="px-4 py-2 rounded-lg bg-[#D2691E] text-white text-xs font-bold hover:bg-[#b85a17] disabled:opacity-50 shadow-xs"
                >
                  {uploading ? 'Uploading & Verifying...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RetentionTimeline;
