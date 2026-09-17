import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { subscribeEmploymentSync } from '../lib/realtimeSync';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  Calendar,
  Layers,
  FileCheck,
  Radio,
  Clock,
  Check,
  Lock,
  X,
  AlertCircle,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import AnimatedCounter from '../components/common/AnimatedCounter';

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

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedBatchForStudent, setSelectedBatchForStudent] = useState('B-2026-01');
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    trade: 'Advanced CNC Machinist',
    district: 'Pune',
    state: 'Maharashtra',
    qualification: 'ITI Machinist Certificate'
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentSuccessToast, setStudentSuccessToast] = useState('');
  const [studentErrorToast, setStudentErrorToast] = useState('');

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    setStudentErrorToast('');
    setStudentSuccessToast('');

    try {
      if (!studentForm.full_name || !studentForm.email) {
        throw new Error('Please provide both student full name and email.');
      }

      console.log('Enrolling candidate into Supabase candidates table:', studentForm);

      // 1. Direct insert into live Supabase candidates table
      const { data: newCandidate, error: candError } = await supabase
        .from('candidates')
        .insert([{
          full_name: studentForm.full_name,
          email: studentForm.email,
          preferred_trade: studentForm.trade,
          district: studentForm.district,
          state: studentForm.state,
          qualification: studentForm.qualification,
          status: 'Enrolled'
        }])
        .select()
        .single();

      if (candError) {
        console.error('❌ Supabase insert into candidates failed:', candError);
        throw new Error(`Database insert error: ${candError.message}`);
      }

      console.log('✅ Student successfully inserted into candidates table:', newCandidate);

      // 2. Link candidate to batch in batch_candidates if batch exists in Supabase
      try {
        const { data: batchRow } = await supabase
          .from('batches')
          .select('id')
          .eq('batch_code', selectedBatchForStudent)
          .maybeSingle();

        if (batchRow?.id) {
          await supabase.from('batch_candidates').insert([{
            batch_id: batchRow.id,
            candidate_id: newCandidate.id,
            attendance_percentage: 100.0,
            completion_status: 'Enrolled'
          }]);
        }
      } catch (linkErr) {
        console.warn('Batch candidate linking note:', linkErr.message);
      }

      // Update local TC table roster with newly enrolled student
      setTcRecords(prev => [
        {
          id: `rec-cand-${Date.now()}`,
          candidate_id: newCandidate.id,
          candidate_name: newCandidate.full_name,
          trade: newCandidate.preferred_trade,
          district: newCandidate.district,
          self_reported_status: 'Enrolled in Training',
          employer_confirmed: false,
          claimed_employer: 'Pending Placement',
          completed_checkins: 0,
          total_checkins: 4
        },
        ...prev
      ]);

      setStudentSuccessToast(`Student ${newCandidate.full_name} successfully enrolled in ${selectedBatchForStudent}! Row created in Supabase candidates table.`);
      setStudentForm({
        full_name: '',
        email: '',
        trade: 'Advanced CNC Machinist',
        district: 'Pune',
        state: 'Maharashtra',
        qualification: 'ITI Machinist Certificate'
      });

      setTimeout(() => {
        setShowAddStudentModal(false);
        setStudentSuccessToast('');
      }, 2000);
    } catch (err) {
      console.error('Add Student to Batch Failure:', err);
      setStudentErrorToast(err.message || 'Failed to add student to batch');
    } finally {
      setAddingStudent(false);
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
                Training Provider Portal
              </span>
              <span className="text-xs text-blue-200 font-mono">TC Code: TC-MH-PUNE-0042</span>
              {realtimePulse && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live Synced
                </span>
              )}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              {user?.organization_name || 'Apex Industrial Training Institute'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Center Management Portal • Batch Enrollments, Candidate Longitudinal Tracking, and Employer-Verified Placement Outcomes.
            </p>
          </div>

          <button 
            onClick={() => { loadTcData(); loadTcEmploymentRecords(); }}
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
            <span><strong>Center Roster Synchronized:</strong> Authenticated as <code className="font-mono bg-white/70 px-1 py-0.5 rounded">TC-MH-PUNE-0042</code>. Showing live employment tracking joined on <code className="font-mono bg-white/70 px-1 py-0.5 rounded">training_center_id</code>.</span>
          </div>
          <span className="font-mono text-[10px] bg-white/80 text-[#8C3A00] border border-[#F8D3B8] px-2 py-0.5 rounded font-bold shrink-0">HTTP 200 OK</span>
        </div>
      )}

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Batches</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              <AnimatedCounter end={apiData?.activeBatches || 8} suffix=" Batches" />
            </p>
            <p className="text-[11px] text-[#0B3D6B] font-medium mt-1">4 PMKVY + 4 State</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E8ECFB] text-[#0B3D6B] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trained Trainees</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              <AnimatedCounter end={tcRecords.length > 0 ? tcRecords.length : 240} suffix=" Candidates" />
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">94.2% Attendance Rate</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#FDEEE0] text-[#D2691E] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placed Trainees</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              <AnimatedCounter end={tcRecords.filter(r => r.self_reported_status === 'Placed').length} suffix=" Placed" />
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {tcRecords.filter(r => r.employer_confirmed).length} Verified by Employer
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Longitudinal Retention</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              <AnimatedCounter end={tcRecords.reduce((sum, r) => sum + (r.completed_checkins || 0), 0)} suffix=" Check-ins" />
            </p>
            <p className="text-[11px] text-[#0B3D6B] font-medium mt-1">Longitudinal Surveys Saved</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E8ECFB] text-[#0B3D6B] flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION: CANDIDATE EMPLOYMENT TRACKING (UNIFIED LONGITUDINAL REGISTER) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0B3D6B]" />
              <h2 className="font-display text-base font-bold text-slate-900">Candidate Employment & Longitudinal Tracking Register</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Read-only view joined on <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">training_center_id: tc-01</code>. Displays candidates' self-reported status, employer-confirmed badge, and check-in completion counts.
            </p>
          </div>

          <span className="text-xs font-bold text-[#0B3D6B] bg-[#E8ECFB] px-3 py-1 rounded-md border border-[#D1DBF7]">
            Read-Only Audit Roster
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="table-govt w-full text-left text-xs">
            <thead>
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
                        <div className="font-bold text-slate-900">{r.candidate_name}</div>
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
                                pct === 100 ? 'bg-emerald-600' : pct > 0 ? 'bg-[#0B3D6B]' : 'bg-slate-300'
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B3D6B]" />
              <span>Current Skill Training Batches</span>
            </h2>
            <p className="text-xs text-slate-500">Live roster of registered batches, candidate counts, and assessment dates</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddStudentModal(true)}
              className="btn-sid-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#0B3D6B]" />
              <span>Add Student to Batch</span>
            </button>
            <button 
              onClick={() => setShowAddStudentModal(true)}
              className="btn-sid-primary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Batch</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="table-govt w-full text-left text-xs">
            <thead>
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
                    <td className="p-3 font-mono font-bold text-[#0B3D6B]">{b.batchId}</td>
                    <td className="p-3 font-bold text-slate-800">{b.course}</td>
                    <td className="p-3">{b.trainees} Candidates</td>
                    <td className="p-3 font-mono">{b.startDate}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span>
                    </td>
                    <td className="p-3 text-right space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedBatchForStudent(b.batchId);
                          setShowAddStudentModal(true);
                        }}
                        className="text-[#D2691E] hover:text-[#B85814] font-bold hover:underline"
                      >
                        + Add Student
                      </button>
                      <button className="text-[#0B3D6B] hover:underline font-bold">Manage Roster</button>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-[#0B3D6B]">B-2026-01</td>
                    <td className="p-3 font-bold text-slate-800">Advanced CNC Machinist Program</td>
                    <td className="p-3">30 Candidates</td>
                    <td className="p-3 font-mono">2026-08-01</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span></td>
                    <td className="p-3 text-right space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedBatchForStudent('B-2026-01');
                          setShowAddStudentModal(true);
                        }}
                        className="text-[#D2691E] hover:text-[#B85814] font-bold hover:underline"
                      >
                        + Add Student
                      </button>
                      <button className="text-[#0B3D6B] hover:underline font-bold">Manage Roster</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-[#0B3D6B]">B-2026-02</td>
                    <td className="p-3 font-bold text-slate-800">Solar PV Installer & Technician</td>
                    <td className="p-3">28 Candidates</td>
                    <td className="p-3 font-mono">2026-08-15</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">In Training</span></td>
                    <td className="p-3 text-right space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedBatchForStudent('B-2026-02');
                          setShowAddStudentModal(true);
                        }}
                        className="text-[#D2691E] hover:text-[#B85814] font-bold hover:underline"
                      >
                        + Add Student
                      </button>
                      <button className="text-[#0B3D6B] hover:underline font-bold">Manage Roster</button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student to Batch Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto relative">
            <div className="bg-[#0B3D6B] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D2691E]" />
                <h3 className="font-display font-bold text-base">Add Student to Batch</h3>
              </div>
              <button 
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
              {/* Toasts inside modal */}
              {studentSuccessToast && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{studentSuccessToast}</span>
                </div>
              )}
              {studentErrorToast && (
                <div className="bg-red-50 border border-red-300 text-red-900 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{studentErrorToast}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Training Batch</label>
                <select
                  value={selectedBatchForStudent}
                  onChange={(e) => setSelectedBatchForStudent(e.target.value)}
                  className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] font-medium py-2 px-3"
                >
                  <option value="B-2026-01">B-2026-01 (Advanced CNC Machinist Program)</option>
                  <option value="B-2026-02">B-2026-02 (Solar PV Installer & Technician)</option>
                  <option value="B-2026-03">B-2026-03 (EV Battery Maintenance Specialist)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={studentForm.full_name}
                    onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                    className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] py-2 px-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Student Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] py-2 px-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Skill Trade Track</label>
                <select
                  value={studentForm.trade}
                  onChange={(e) => setStudentForm({ ...studentForm, trade: e.target.value })}
                  className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] py-2 px-3 font-medium"
                >
                  <option value="Advanced CNC Machinist">Advanced CNC Machinist</option>
                  <option value="Solar PV Installer & Technician">Solar PV Installer & Technician</option>
                  <option value="EV Battery Maintenance Specialist">EV Battery Maintenance Specialist</option>
                  <option value="Industrial Automation & Robotics Technician">Industrial Automation & Robotics Technician</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">District</label>
                  <input
                    type="text"
                    value={studentForm.district}
                    onChange={(e) => setStudentForm({ ...studentForm, district: e.target.value })}
                    className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] py-2 px-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={studentForm.state}
                    onChange={(e) => setStudentForm({ ...studentForm, state: e.target.value })}
                    className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] py-2 px-3"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Qualification</label>
                <input
                  type="text"
                  value={studentForm.qualification}
                  onChange={(e) => setStudentForm({ ...studentForm, qualification: e.target.value })}
                  className="w-full text-xs rounded-md border-slate-300 shadow-xs focus:border-[#D2691E] focus:ring-[#D2691E] py-2 px-3"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="btn-sid-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="btn-sid-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  {addingStudent ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enrolling in Supabase...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Insert Student & Enroll</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
