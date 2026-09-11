import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  Briefcase, 
  Users, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Building2, 
  FileCheck, 
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const EmployerDashboard = ({ activeTab }) => {
  const { user, role } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    loadEmployerData();
  }, [role]);

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-govt-navy to-slate-900 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Corporate Recruiter Portal
              </span>
              <span className="text-xs text-emerald-200">Employer ID: EMP-TATA-802</span>
            </div>
            <h1 className="text-2xl font-bold font-roboto tracking-tight">
              {user?.organization_name || 'Tata Advanced Engineering Solutions'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Industry Partner Dashboard • Direct Recruitment of Government-Certified Skill Candidates and Apprentices.
            </p>
          </div>

          <button 
            onClick={loadEmployerData}
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span><strong>Employer Privileges Active:</strong> Connected with role <code>employer</code> via Supabase JWT session.</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold">HTTP 200 OK</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Openings</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.activeJobOpenings || 14} Jobs</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">4 Cities</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applicants</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.applicantsTotal || 312} Trainees</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">NCVT Certified</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-govt-navy flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apiData?.shortlistedCandidates || 45} Candidates</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Interview Scheduled</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hired Trainees</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">88 Hired</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">FY 2026-27</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-govt-orange flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Postings & Verified Candidates Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Job Vacancies (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <span>Active Industry Vacancies</span>
              </h2>
              <p className="text-xs text-slate-500">Jobs published to certified candidates across national ITIs and Skill Hubs</p>
            </div>
            <button className="btn-govt-orange text-xs py-2 px-3">
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-govt-navy" />
            <span>Search Certified Talent</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Skill / Trade</label>
              <select className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2 focus:ring-1 focus:ring-govt-navy">
                <option>CNC Operator (NCVT Grade A)</option>
                <option>Solar Photovoltaic Technician</option>
                <option>EV Battery Assembly Technician</option>
                <option>Cybersecurity Junior Analyst</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred State / Location</label>
              <select className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2 focus:ring-1 focus:ring-govt-navy">
                <option>All States (Pan-India)</option>
                <option>Maharashtra</option>
                <option>Karnataka</option>
                <option>Gujarat</option>
              </select>
            </div>

            <button className="w-full btn-govt-primary text-xs py-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search Candidate Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
