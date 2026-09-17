import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { subscribeEmploymentSync, notifyEmploymentChange } from '../lib/realtimeSync';
import { 
  Briefcase, 
  Users, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  FileCheck, 
  UserCheck,
  ChevronRight,
  ShieldCheck,
  XCircle,
  Clock,
  Radio,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import AnimatedCounter from '../components/common/AnimatedCounter';

export const EmployerDashboard = ({ activeTab }) => {
  const { user, role } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Placement verification queue for logged-in employer
  const [employerRecords, setEmployerRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordActionMsg, setRecordActionMsg] = useState('');
  const [realtimePulse, setRealtimePulse] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifySuccessToast, setVerifySuccessToast] = useState('');

  useEffect(() => {
    loadEmployerData();
    loadEmployerRecords();
  }, [role]);

  // Realtime subscription for instant multi-portal sync
  useEffect(() => {
    const unsub = subscribeEmploymentSync((event) => {
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 2500);
      loadEmployerRecords();
    });
    return () => unsub();
  }, []);

  const loadEmployerData = async () => {
    setLoadingApi(true);
    setApiError(null);
    try {
      const data = await fetchWithAuth('/api/portal/employer/data', {}, role);
      setApiData(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoadingApi(false);
    }
  };

  const loadEmployerRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetchWithAuth('/api/portal/employment/employer-records?employer_id=emp-01', {}, role);
      setEmployerRecords(res.records || []);
    } catch (err) {
      console.warn('Error loading employer records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Multi-party Verification Handler
  const handleVerifyPlacement = async (recordId, candidateName = 'Candidate') => {
    setVerifyingId(recordId);
    try {
      const res = await fetchWithAuth(`/api/portal/employment/records/${recordId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employer_notes: 'Confirmed by corporate HR manager via Employer Portal'
        })
      }, role);

      if (res && res.success) {
        setVerifySuccessToast(`Successfully verified employment for candidate ${candidateName}! Longitudinal milestones activated.`);
        setTimeout(() => setVerifySuccessToast(''), 5000);
        await loadEmployerData();
        await loadEmployerRecords();
        notifyEmploymentChange({ record_id: recordId, candidate_name: candidateName });
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Failed to verify candidate placement. Please check system connection.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Sovereign Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-[#072847] text-[#D2691E] border border-[#D2691E]/30 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded">
                Corporate Recruiter Portal
              </span>
              <span className="text-xs text-blue-200 font-mono">Employer ID: EMP-TATA-802</span>
              {realtimePulse && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live Synced
                </span>
              )}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              {user?.organization_name || 'Tata Advanced Engineering Solutions'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Industry Partner Dashboard • Direct Recruitment, Candidate Verification, and Longitudinal Placement Confirmations.
            </p>
          </div>

          <button 
            onClick={() => { loadEmployerData(); loadEmployerRecords(); }}
            disabled={loadingApi}
            className="btn-sid-primary text-xs whitespace-nowrap flex items-center gap-1.5 py-2.5 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingApi ? 'animate-spin' : ''}`} />
            {loadingApi ? 'Syncing Backend...' : 'Refresh Records'}
          </button>
        </div>
      </div>

      {/* Express API Sync Alert */}
      {apiData && (
        <div className="banner-peach px-4 py-3 rounded-lg text-xs flex items-center justify-between border">
          <div className="flex items-center gap-2.5 text-[#8C3A00]">
            <CheckCircle2 className="w-4 h-4 text-[#D2691E] shrink-0" />
            <span><strong>Employer Privileges Active:</strong> Connected as <code className="font-mono bg-white/70 px-1 py-0.5 rounded">EMP-TATA-802</code>. Verified corporate HR audit privileges active.</span>
          </div>
          <span className="font-mono text-[10px] bg-white/80 text-[#8C3A00] border border-[#F8D3B8] px-2 py-0.5 rounded font-bold shrink-0">HTTP 200 OK</span>
        </div>
      )}

      {/* Verification Success Toast */}
      {verifySuccessToast && (
        <div className="banner-peach p-4 rounded-xl text-xs flex items-center gap-3 border shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-900">{verifySuccessToast}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Openings</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              <AnimatedCounter end={apiData?.activeJobOpenings || 14} suffix=" Jobs" />
            </p>
            <p className="text-[11px] text-[#0B3D6B] font-medium mt-1">4 Industrial Clusters</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E8ECFB] text-[#0B3D6B] flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Placements</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              <AnimatedCounter end={employerRecords.filter(r => r.employer_confirmed).length} suffix=" Confirmed" />
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {employerRecords.length} Total Claims
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending HR Audits</p>
            <p className="text-2xl font-bold text-[#D2691E] mt-1">
              <AnimatedCounter end={employerRecords.filter(r => !r.employer_confirmed).length} suffix=" Pending" />
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Action Required</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#FDEEE0] text-[#D2691E] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hired Trainees</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              <AnimatedCounter end={88} suffix=" Hired" />
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">FY 2026-27</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E8ECFB] text-[#0B3D6B] flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION: PLACEMENT VERIFICATION & CONFIRMATION QUEUE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0B3D6B]" />
              <h2 className="font-display text-base font-bold text-slate-900">Placement Verification & HR Confirmation Queue</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records from <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">employment_records</code> where <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">employer_id = 'emp-01'</code>. Confirm or dispute candidate self-reported placements.
            </p>
          </div>

          <span className="text-xs font-bold text-[#0B3D6B] bg-[#E8ECFB] px-3 py-1 rounded-md border border-[#D1DBF7]">
            {employerRecords.length} Candidate Records
          </span>
        </div>

        {recordActionMsg && (
          <div className="banner-peach p-3 rounded-lg text-xs flex items-center gap-2 border">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-[#8C3A00]">{recordActionMsg}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="table-govt w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">Skill Trade & District</th>
                <th className="p-3">Self-Reported Status</th>
                <th className="p-3">Placement Date</th>
                <th className="p-3">Salary Band</th>
                <th className="p-3">Role Match</th>
                <th className="p-3">Verification Status</th>
                <th className="p-3 text-right">Corporate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {employerRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400">
                    No candidate placement claims currently registered for this corporate employer.
                  </td>
                </tr>
              ) : (
                employerRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.candidate_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.candidate_id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{r.trade}</div>
                      <div className="text-[11px] text-slate-500">{r.district}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {r.self_reported_status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{r.placement_date || 'N/A'}</td>
                    <td className="p-3 font-mono text-slate-800">{r.salary_band || 'N/A'}</td>
                    <td className="p-3">
                      {r.role_match ? (
                        <span className="text-emerald-700 font-bold">Yes (Match)</span>
                      ) : (
                        <span className="text-slate-500">Different Role</span>
                      )}
                    </td>
                    <td className="p-3">
                      {r.employer_confirmed ? (
                        <div>
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold inline-flex items-center gap-1 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Confirmed
                          </span>
                          {r.employer_confirmed_at && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(r.employer_confirmed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-bold inline-flex items-center gap-1 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-700" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyPlacement(r.id, r.candidate_name)}
                          disabled={r.employer_confirmed || verifyingId === r.id}
                          className={`font-bold text-[11px] px-3 py-1.5 rounded-md shadow-xs flex items-center gap-1 transition-all ${
                            r.employer_confirmed
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {verifyingId === r.id ? 'Verifying...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleVerifyPlacement(r.id, r.candidate_name)}
                          className="btn-sid-secondary text-[11px] py-1 px-2.5 border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Dispute
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Active Postings & Talent Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Job Vacancies (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0B3D6B]" />
                <span>Active Industry Vacancies</span>
              </h2>
              <p className="text-xs text-slate-500">Jobs published to certified candidates across national ITIs and Skill Hubs</p>
            </div>
            <button className="btn-sid-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Vacancy</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiData?.recentPostings ? (
              apiData.recentPostings.map((p) => (
                <div key={p.jobId} className="p-4 rounded-xl border border-slate-200 hover:border-[#0B3D6B]/50 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0B3D6B] uppercase bg-[#E8ECFB] px-2 py-0.5 rounded">
                      {p.jobId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{p.location} • {p.applicants} Applicants</span>
                    </p>
                  </div>
                  <button className="btn-sid-secondary text-xs py-1.5 px-3">
                    Review Applicants
                  </button>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 rounded-xl border border-slate-200 hover:border-[#0B3D6B]/50 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0B3D6B] uppercase bg-[#E8ECFB] px-2 py-0.5 rounded">J-801</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">Certified Solar Array Specialist</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Pune Plant • 48 Applicants</span>
                    </p>
                  </div>
                  <button className="btn-sid-secondary text-xs py-1.5 px-3">Review Applicants</button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 hover:border-[#0B3D6B]/50 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0B3D6B] uppercase bg-[#E8ECFB] px-2 py-0.5 rounded">J-802</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">CNC Precision Machine Operator</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Bengaluru Tech Park • 62 Applicants</span>
                    </p>
                  </div>
                  <button className="btn-sid-secondary text-xs py-1.5 px-3">Review Applicants</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Candidate Search & Quick Filter Widget (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-[#0B3D6B]" />
            <span>Search Certified Talent</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Skill / Trade</label>
              <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E] font-medium text-slate-800">
                <option>Advanced CNC Machinist</option>
                <option>Solar Photovoltaic Technician</option>
                <option>EV Battery Maintenance Specialist</option>
                <option>Cybersecurity Junior Analyst</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Preferred State / Location</label>
              <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E] font-medium text-slate-800">
                <option>All States (Pan-India)</option>
                <option>Maharashtra (Pune / Nashik)</option>
                <option>Karnataka (Bengaluru)</option>
                <option>Gujarat (Ahmedabad)</option>
              </select>
            </div>

            <button className="w-full btn-sid-primary text-xs py-2.5 flex items-center justify-center gap-1.5 font-bold">
              <Search className="w-3.5 h-3.5" />
              <span>Search Candidate Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
