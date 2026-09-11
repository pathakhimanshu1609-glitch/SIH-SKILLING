import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
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
  FileCheck
} from 'lucide-react';

export const TrainingCenterDashboard = ({ activeTab }) => {
  const { user, role } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    loadTcData();
  }, [role]);

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-govt-navy to-slate-900 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Training Provider Portal
              </span>
              <span className="text-xs text-purple-200">TC Code: TC-MH-PUNE-0042</span>
            </div>
            <h1 className="text-2xl font-bold font-roboto tracking-tight">
              {user?.organization_name || 'Apex Industrial Training Institute'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Center Management Portal • Batch Enrollments, Smart Attendance, Infrastructure Accreditation, and Government Grants.
            </p>
          </div>

          <button 
            onClick={loadTcData}
            disabled={loadingApi}
            className="btn-govt-orange text-xs whitespace-nowrap shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loadingApi ? 'Syncing Backend...' : 'Sync Express API'}
          </button>
        </div>
      </div>

      {/* Express API Sync Alert */}
      {apiData && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-700" />
            <span><strong>Role Auth Verified:</strong> Authenticated as <code>training_center</code>. Received active batch and audit metrics from backend API.</span>
          </div>
          <span className="font-mono text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded">HTTP 200 OK</span>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Trainees</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.totalEnrolled || 240} Candidates</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">94.2% Attendance Rate</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-govt-navy flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Rating</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.infrastructureStatus || 'Grade A'}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Inspected Aug 2026</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-govt-orange flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Rate</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">82.5%</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">198 Placed Last Batch</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
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
                    <td className="p-3 font-bold text-slate-800">Cybersecurity Analyst Essentials</td>
                    <td className="p-3">30 Candidates</td>
                    <td className="p-3">2026-08-01</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span></td>
                    <td className="p-3 text-right"><button className="text-blue-600 hover:underline font-bold">Manage Roster</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-govt-navy">B-2026-02</td>
                    <td className="p-3 font-bold text-slate-800">EV Battery Maintenance Tech</td>
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
