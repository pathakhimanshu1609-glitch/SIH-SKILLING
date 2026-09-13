import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { subscribeEmploymentSync } from '../lib/realtimeSync';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles, 
  Search, 
  Calendar,
  Layers,
  FileCheck,
  Radio,
  Clock,
  Check,
  Lock
} from 'lucide-react';

export const TrainingCenterDashboard = ({ activeTab }) => {
  const { user, role } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Unified employment tracking records joined on training_center_id
  const [tcRecords, setTcRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [realtimePulse, setRealtimePulse] = useState(false);

  useEffect(() => {
    loadTcData();
    loadTcEmploymentRecords();
  }, [role]);

  // Realtime subscription for live updates across portals
  useEffect(() => {
    const unsub = subscribeEmploymentSync((event) => {
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 2500);
      loadTcEmploymentRecords();
    });
    return () => unsub();
  }, []);

  const loadTcData = async () => {
    setLoadingApi(true);
    setApiError(null);
    try {
      const data = await fetchWithAuth('/api/portal/training-center/data', {}, role);
      setApiData(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoadingApi(false);
    }
  };

  const loadTcEmploymentRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetchWithAuth('/api/portal/employment/tc-records?training_center_id=tc-01', {}, role);
      setTcRecords(res.records || []);
    } catch (err) {
      console.warn('Error loading TC employment records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div className="space-y-6 font-roboto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-govt-navy to-slate-900 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Training Provider Portal
              </span>
              <span className="text-xs text-purple-200">TC Code: TC-MH-PUNE-0042</span>
              {realtimePulse && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live Synced
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.organization_name || 'Apex Industrial Training Institute'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Center Management Portal • Batch Enrollments, Candidate Longitudinal Tracking, and Employer-Verified Placement Outcomes.
            </p>
          </div>

          <button 
            onClick={() => { loadTcData(); loadTcEmploymentRecords(); }}
            disabled={loadingApi}
            className="btn-govt-orange text-xs whitespace-nowrap shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loadingApi ? 'Syncing Backend...' : 'Refresh Records'}
          </button>
        </div>
      </div>

      {/* Express API Sync Alert */}
      {apiData && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-700" />
            <span><strong>Center Roster Synchronized:</strong> Authenticated as <code>TC-MH-PUNE-0042</code>. Showing live employment tracking joined on <code>training_center_id</code>.</span>
          </div>
          <span className="font-mono text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">HTTP 200 OK</span>
        </div>
      )}

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Batches</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.activeBatches || 8} Batches</p>
            <p className="text-[11px] text-purple-700 font-medium mt-1">4 PMKVY + 4 State</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trained Trainees</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{tcRecords.length > 0 ? tcRecords.length : 240} Candidates</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">94.2% Attendance Rate</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-govt-navy flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placed Trainees</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {tcRecords.filter(r => r.self_reported_status === 'Placed').length} Placed
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {tcRecords.filter(r => r.employer_confirmed).length} Verified by Employer
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-govt-orange flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Longitudinal Retention</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {tcRecords.reduce((sum, r) => sum + (r.completed_checkins || 0), 0)} Check-ins
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Longitudinal Surveys Saved</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION: CANDIDATE EMPLOYMENT TRACKING (UNIFIED LONGITUDINAL REGISTER) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-700" />
              <h2 className="text-base font-bold text-slate-800">Candidate Employment & Longitudinal Tracking Register</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Read-only view joined on <code>training_center_id: tc-01</code>. Displays candidates' self-reported status, employer-confirmed badge, and check-in completion counts.
            </p>
          </div>

          <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-md border border-purple-300">
            Read-Only Audit Roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Skill Trade & District</th>
                <th className="p-3">Self-Reported Status</th>
                <th className="p-3">Employer Confirmed</th>
                <th className="p-3">Claimed Employer</th>
                <th className="p-3">Placement Date</th>
                <th className="p-3 text-right">Check-In Milestones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tcRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">
                    No candidates currently assigned to this training center.
                  </td>
                </tr>
              ) : (
                tcRecords.map((r) => {
                  const completed = r.completed_checkins || 0;
                  const total = r.total_checkins || 4;
                  const pct = Math.round((completed / total) * 100);

                  return (
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
                        <span className={`px-2.5 py-1 rounded font-bold text-[11px] ${
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
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded font-bold text-[11px] inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> Yes (Verified)
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded font-bold text-[11px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" /> No (Pending)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-slate-800 font-semibold">{r.employer_name || 'N/A'}</div>
                        {r.salary_band && <div className="text-[10px] font-mono text-slate-500">{r.salary_band}</div>}
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {r.placement_date || 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-mono font-bold text-slate-800 text-[11px]">
                            {completed}/{total} Completed
                          </span>
                          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                pct === 100 ? 'bg-emerald-600' : pct > 0 ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              <span>Current Skill Training Batches</span>
            </h2>
            <p className="text-xs text-slate-500">Live roster of registered batches, candidate counts, and assessment dates</p>
          </div>
          <button className="btn-govt-primary text-xs py-2 px-3">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Batch</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Batch Code</th>
                <th className="p-3">Course / Trade Name</th>
                <th className="p-3">Trainees</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {apiData?.recentBatches ? (
                apiData.recentBatches.map((b) => (
                  <tr key={b.batchId} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-govt-navy">{b.batchId}</td>
                    <td className="p-3 font-bold text-slate-800">{b.course}</td>
                    <td className="p-3">{b.trainees} Candidates</td>
                    <td className="p-3">{b.startDate}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:underline font-bold">Manage Roster</button>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-govt-navy">B-2026-01</td>
                    <td className="p-3 font-bold text-slate-800">Advanced CNC Machinist Program</td>
                    <td className="p-3">30 Candidates</td>
                    <td className="p-3">2026-08-01</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span></td>
                    <td className="p-3 text-right"><button className="text-blue-600 hover:underline font-bold">Manage Roster</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-govt-navy">B-2026-02</td>
                    <td className="p-3 font-bold text-slate-800">Solar PV Installer & Technician</td>
                    <td className="p-3">28 Candidates</td>
                    <td className="p-3">2026-08-15</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span></td>
                    <td className="p-3 text-right"><button className="text-blue-600 hover:underline font-bold">Manage Roster</button></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
