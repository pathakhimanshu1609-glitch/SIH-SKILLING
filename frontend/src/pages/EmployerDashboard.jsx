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

  useEffect(() => {
    loadEmployerData();
    loadEmployerRecords();

    // Subscribe to realtime employment changes
    const channel = subscribeEmploymentSync((payload) => {
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 3000);
      loadEmployerData();
      loadEmployerRecords();
    });

    return () => {
      // Clean up realtime subscription
    };
  }, []);

  // Multi-party Verification Handler
  const handleVerifyPlacement = async (recordId, candidateName) => {
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
    <div className="space-y-10 sm:space-y-12 font-sans">
      {/* Top Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-[6px] p-4 sm:p-5 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-700 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-[4px]">
                Corporate Recruiter Portal
              </span>
              <span className="text-xs text-emerald-200 font-mono">Employer ID: EMP-TATA-802</span>
              {realtimePulse && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live Synced
                </span>
              )}
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              {user?.organization_name || 'Tata Advanced Engineering Solutions'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Industry Partner Dashboard • Direct Recruitment, Candidate Verification, and Longitudinal Placement Confirmations.
            </p>
          </div>

          <button 
            onClick={() => { loadEmployerData(); loadEmployerRecords(); }}
            disabled={loadingApi}
            className="btn-govt-orange text-xs whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingApi ? 'animate-spin' : ''}`} />
            {loadingApi ? 'Syncing Backend...' : 'Refresh Records'}
          </button>
        </div>
      </div>

      {/* Express API Sync Alert */}
      {apiData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span><strong>Employer Privileges Active:</strong> Connected as <code>EMP-TATA-802</code>. Verified corporate HR audit privileges active.</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold">HTTP 200 OK</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Openings</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.activeJobOpenings || 14} Jobs</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">4 Industrial Clusters</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Placements</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {employerRecords.filter(r => r.employer_confirmed).length} Confirmed
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {employerRecords.length} Total Claims
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-govt-navy flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending HR Audits</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {employerRecords.filter(r => !r.employer_confirmed).length} Pending
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Action Required</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hired Trainees</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">88 Hired</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">FY 2026-27</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION: PLACEMENT VERIFICATION & CONFIRMATION QUEUE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <h2 className="font-display text-base font-bold text-slate-800">Placement Verification & HR Confirmation Queue</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records from <code>employment_records</code> where <code>employer_id = 'emp-01'</code>. Confirm or dispute candidate self-reported placements.
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-300">
            {employerRecords.length} Candidate Records
          </span>
        </div>

        {recordActionMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{recordActionMsg}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
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
                      <div className="font-bold text-slate-800">{r.candidate_name}</div>
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
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Confirmed
                          </span>
                          {r.employer_confirmed_at && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(r.employer_confirmed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-700" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyPlacement(r.id, 'confirm')}
                          disabled={r.employer_confirmed}
                          className={`font-bold text-[11px] px-2.5 py-1 rounded shadow-sm flex items-center gap-1 transition-all ${
                            r.employer_confirmed
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Confirm
                        </button>
                        <button
                          onClick={() => handleVerifyPlacement(r.id, 'dispute')}
                          className="border border-red-200 hover:bg-red-50 text-red-700 font-bold text-[11px] px-2 py-1 rounded transition-all flex items-center gap-1"
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
              <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <span>Active Industry Vacancies</span>
              </h2>
              <p className="text-xs text-slate-500">Jobs published to certified candidates across national ITIs and Skill Hubs</p>
            </div>
            <button className="btn-sid-primary text-xs py-2 px-4">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Vacancy</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiData?.recentPostings ? (
              apiData.recentPostings.map((p) => (
                <div key={p.jobId} className="p-4 rounded-lg border border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded">
                      {p.jobId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{p.location} • {p.applicants} Applicants</span>
                    </p>
                  </div>
                  <button className="btn-govt-outline text-xs py-1.5 px-3">
                    Review Applicants
                  </button>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded">J-801</span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">Certified Solar Array Specialist</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Pune Plant • 48 Applicants</span>
                    </p>
                  </div>
                  <button className="btn-govt-outline text-xs py-1.5 px-3">Review Applicants</button>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded">J-802</span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">CNC Precision Machine Operator</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Bengaluru Tech Park • 62 Applicants</span>
                    </p>
                  </div>
                  <button className="btn-govt-outline text-xs py-1.5 px-3">Review Applicants</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Candidate Search & Quick Filter Widget (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-govt-navy" />
            <span>Search Certified Talent</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Skill / Trade</label>
              <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-govt-navy">
                <option>Advanced CNC Machinist</option>
                <option>Solar Photovoltaic Technician</option>
                <option>EV Battery Maintenance Specialist</option>
                <option>Cybersecurity Junior Analyst</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Preferred State / Location</label>
              <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-govt-navy">
                <option>All States (Pan-India)</option>
                <option>Maharashtra (Pune / Nashik)</option>
                <option>Karnataka (Bengaluru)</option>
                <option>Gujarat (Ahmedabad)</option>
              </select>
            </div>

            <button className="w-full btn-sid-primary text-xs py-2.5">
              <Search className="w-3.5 h-3.5" />
              <span>Search Candidate Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
