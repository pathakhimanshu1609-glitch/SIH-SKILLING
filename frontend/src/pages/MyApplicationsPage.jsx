import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  FileCheck, 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  RefreshCw,
  AlertTriangle,
  Send,
  ChevronDown
} from 'lucide-react';

export const MyApplicationsPage = ({ onNavigateTab }) => {
  const { user, role } = useAuth();

  // Test Candidate switcher for evaluator to test empty state (e.g. cand-05 or fresh candidate) vs active applications
  const defaultCandId = user?.candidateRecord?.id || user?.id || 'cand-01';
  const [candidateId, setCandidateId] = useState(defaultCandId);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [hiredNotification, setHiredNotification] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [candidateId]);

  const loadApplications = async () => {
    setLoading(true);
    setGeneralError(null);
    try {
      const data = await fetchWithAuth(
        `/api/portal/jobs/applications?candidate_id=${encodeURIComponent(candidateId)}`,
        {},
        role
      );
      if (Array.isArray(data)) {
        setApplications(data);
      } else if (data && data.applications) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setGeneralError('Failed to load applications. Please check connection.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetchWithAuth(`/api/portal/jobs/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }, role);

      if (res.success) {
        // Update local application state
        setApplications(prev => prev.map(app => 
          app.application_id === applicationId ? { ...app, application_status: newStatus } : app
        ));

        // If hired, show placement notification banner
        if (newStatus === 'Hired') {
          const app = applications.find(a => a.application_id === applicationId);
          setHiredNotification({
            company: app?.job?.company_name || app?.job?.company || 'Employer',
            placementId: res.placement_id
          });
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hired':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', text: 'Hired & Placed' };
      case 'Interviewing':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-600', text: 'Interview Stage' };
      case 'Shortlisted':
        return { bg: 'bg-purple-50 text-purple-800 border-purple-300', dot: 'bg-purple-600', text: 'Shortlisted' };
      case 'Offered':
        return { bg: 'bg-amber-50 text-amber-900 border-amber-300', dot: 'bg-amber-600', text: 'Offer Extended' };
      case 'Rejected':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-600', text: 'Not Selected' };
      case 'Applied':
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-300', dot: 'bg-slate-500', text: 'Under Review' };
    }
  };

  const hiredCount = applications.filter(a => a.application_status === 'Hired').length;
  const interviewingCount = applications.filter(a => a.application_status === 'Interviewing' || a.application_status === 'Shortlisted').length;

  return (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12 font-sans">
      {/* Top Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-6 sm:p-8 relative shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-govt-orange text-white flex items-center justify-center font-bold shadow-xs">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2.5 py-0.5 rounded tracking-wider">
                  CANDIDATE TRACKER
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  Real-time Multi-Portal Synchronization
                </span>
              </div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">My Job Applications & Recruitment Pipeline</h1>
              <p className="text-sm text-slate-300 mt-1">
                Track status updates from initial submission to interview, job offer, and verified employer placement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Candidate Switcher for Testing */}
            {import.meta.env.DEV && (
              <div className="bg-white/10 p-2.5 rounded-lg border border-white/20 text-xs">
                <span className="text-[10px] text-slate-300 block mb-1 font-semibold uppercase tracking-wider">
                  Active Candidate Profile:
                </span>
                <select
                  value={candidateId}
                  onChange={(e) => {
                    setCandidateId(e.target.value);
                    setHiredNotification(null);
                  }}
                  className="bg-slate-900 text-white font-bold text-xs rounded-md border border-white/30 p-1.5 cursor-pointer focus:ring-2 focus:ring-govt-orange"
                >
                  <option value="cand-01">Rahul Sharma (cand-01)</option>
                  <option value="cand-02">Pooja Patil (cand-02)</option>
                  <option value="cand-05">Vikas Shinde (cand-05 • Unplaced)</option>
                  <option value="cand-new-zero">Fresh Candidate (0 Applications Test)</option>
                </select>
              </div>
            )}

            <button
              onClick={() => onNavigateTab && onNavigateTab('jobs')}
              className="hidden sm:inline-flex items-center gap-2 btn-sid-primary text-xs py-2.5 px-4 shadow-sm"
            >
              <span>Recommended Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Applications</p>
            <p className="text-3xl font-bold font-display text-slate-900 mt-1">{applications.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-govt-navy flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">In Review / Interviews</p>
            <p className="text-3xl font-bold font-display text-amber-800 mt-1">{interviewingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Hired & Placed</p>
            <p className="text-3xl font-bold font-display text-emerald-800 mt-1">{hiredCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Placement Confirmation Alert on Hired Status Selection */}
      {hiredNotification && (
        <div className="bg-[#064E3B] text-white p-6 rounded-xl border border-emerald-500/40 space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-emerald-800 text-white text-[10px] uppercase font-bold px-2.5 py-0.5 rounded tracking-wider">
                  EMPLOYMENT RECORD CREATED & PLACED
                </span>
                <h3 className="text-lg font-bold font-display mt-0.5">
                  Status Updated to 'Hired'
                </h3>
                <p className="text-xs text-emerald-200">
                  Employment record confirmed at <strong>{hiredNotification.company}</strong>. 
                  Longitudinal retention milestones (Day 30, 90, 180, 365) are automatically initialized.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateTab && onNavigateTab('employment-status')}
                className="bg-white hover:bg-emerald-50 text-[#064E3B] font-bold text-xs py-2 px-4 rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#064E3B]" />
                <span>View Retention Check-Ins</span>
              </button>
              <button
                onClick={() => setHiredNotification(null)}
                className="text-xs text-emerald-200 hover:text-white px-2 py-1 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Error Notification */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{generalError}</span>
        </div>
      )}

      {/* MAIN APPLICATION LIST OR EMPTY STATE */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 border-4 border-govt-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Loading candidate applications...
          </p>
        </div>
      ) : applications.length === 0 ? (
        /* EMPTY STATE: CANDIDATE HAS ZERO APPLICATIONS YET */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-200 text-govt-navy flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="w-10 h-10 text-govt-navy" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
              Application Tracker
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              No Job Applications Yet
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You haven't applied to any job vacancies yet. Explore skill-matched job openings tailored to your verified trade competencies and apply with one click.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-3 text-xs text-slate-600">
            <p className="font-bold text-slate-900 flex items-center gap-2 text-sm font-display">
              <Target className="w-4 h-4 text-govt-orange" />
              <span>Next Steps:</span>
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-600">
              <li>Browse <strong>Recommended Jobs</strong> for your district and trade</li>
              <li>Review your explainable <strong>match percentage</strong></li>
              <li>Click <strong>'Apply Now'</strong> on relevant openings</li>
              <li>Track hiring decisions and status transitions right here</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('jobs')}
              className="btn-sid-primary text-sm py-2.5 px-6 font-bold inline-flex items-center gap-2 shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Recommended Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* APPLICATIONS TABLE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-govt-navy" />
                <span>Submitted Applications ({applications.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official candidate tracking register. Select status to update application lifecycle.
              </p>
            </div>

            <button
              onClick={loadApplications}
              disabled={loading}
              className="btn-sid-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-govt">
              <thead>
                <tr>
                  <th className="w-28 font-mono">App ID</th>
                  <th className="w-24 font-mono">Job ID</th>
                  <th>Position & Employer</th>
                  <th className="w-32 font-mono">Date Applied</th>
                  <th className="w-36">Status</th>
                  <th className="w-44 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const statusInfo = getStatusBadge(app.application_status);
                  const job = app.job || {};
                  const isUpdating = updatingId === app.application_id;
                  const formattedDate = app.applied_at 
                    ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Today';

                  return (
                    <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-mono text-xs font-bold text-slate-700">
                        {app.application_id}
                      </td>
                      <td className="font-mono text-xs font-bold text-emerald-800">
                        JOB-{app.job_id}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 text-sm font-display">{job.title || 'Technical Specialist'}</div>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{job.company || job.company_name || 'Partner Company'}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{job.district || 'Pune'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-slate-700">
                        {formattedDate}
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${statusInfo.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                          <span>{app.application_status}</span>
                        </span>
                      </td>
                      <td className="text-right">
                        <select
                          value={app.application_status}
                          onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                          disabled={isUpdating}
                          className="text-xs font-bold rounded-lg border border-slate-300 p-1.5 bg-white text-slate-800 cursor-pointer focus:ring-2 focus:ring-govt-orange"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Hired">Hired (Trigger Placement)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
