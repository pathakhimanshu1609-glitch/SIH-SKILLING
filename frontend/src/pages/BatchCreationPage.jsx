import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  Building2, 
  Users, 
  Briefcase, 
  BookOpen, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Calendar, 
  Layers, 
  Check, 
  ChevronRight
} from 'lucide-react';

export const BatchCreationPage = () => {
  const { user, role } = useAuth();

  const [tradeSkills, setTradeSkills] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    batch_code: `B-2026-${Math.floor(100 + Math.random() * 900)}`,
    batch_title: 'EV & Smart Mobility Technician Batch #2',
    trade_name: 'EV Battery Maintenance Specialist',
    employer_id: 'emp-01',
    candidate_ids: [],
    start_date: '2026-10-01',
    end_date: '2027-01-15',
    max_seats: 30
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadFormDependencies();
  }, []);

  const loadFormDependencies = async () => {
    setLoadingData(true);
    try {
      const [tsRes, empRes, candRes] = await Promise.all([
        fetchWithAuth('/api/portal/trade-skills', {}, role).catch(() => ({ tradeSkills: [] })),
        fetchWithAuth('/api/portal/employers', {}, role).catch(() => ({ employers: [] })),
        fetchWithAuth('/api/portal/candidates', {}, role).catch(() => ({ candidates: [] }))
      ]);

      const loadedTrades = tsRes.tradeSkills?.length ? tsRes.tradeSkills : [
        { trade_name: 'Advanced CNC Machinist', skills: [{ skill_name: 'G-Code CNC Programming' }, { skill_name: 'Lathe Calibration' }] },
        { trade_name: 'Solar PV Installer & Technician', skills: [{ skill_name: 'Solar Panel Array Wiring' }, { skill_name: 'Grid Inverter Installation' }] },
        { trade_name: 'EV Battery Maintenance Specialist', skills: [{ skill_name: 'EV Lithium Pack Diagnostics' }, { skill_name: 'BMS Sensor Calibration' }] },
        { trade_name: 'Industrial Automation & Robotics Technician', skills: [{ skill_name: 'Industrial Robotics Programming' }, { skill_name: 'PLC & Sensor Interfacing' }] }
      ];

      const loadedEmployers = empRes.employers?.length ? empRes.employers : [
        { id: 'emp-01', company_name: 'Tata Advanced Engineering', industry_sector: 'Automotive & Defense' },
        { id: 'emp-02', company_name: 'Mahindra Susten Solar', industry_sector: 'Renewables' },
        { id: 'emp-03', company_name: 'L&T Heavy Engineering', industry_sector: 'Manufacturing' }
      ];

      const loadedCandidates = candRes.candidates?.length ? candRes.candidates : [
        { id: 'cand-01', full_name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', preferred_trade: 'Advanced CNC Machinist', qualification: 'ITI Machinist' },
        { id: 'cand-02', full_name: 'Priya Sharma', email: 'priya.s@yahoo.com', preferred_trade: 'Solar PV Installer & Technician', qualification: 'Diploma Electrical' },
        { id: 'cand-03', full_name: 'Amitabh Verma', email: 'amitabh@gmail.com', preferred_trade: 'EV Battery Maintenance Specialist', qualification: 'B.Voc Automotive' }
      ];

      setTradeSkills(loadedTrades);
      setEmployers(loadedEmployers);
      setCandidates(loadedCandidates);

      // Pre-select 2 candidates
      if (loadedCandidates.length >= 2) {
        setFormData(prev => ({
          ...prev,
          candidate_ids: [loadedCandidates[0].id, loadedCandidates[1].id]
        }));
      }
    } catch (err) {
      console.error('Error loading batch dependencies:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCandidateToggle = (candId) => {
    setFormData(prev => {
      const exists = prev.candidate_ids.includes(candId);
      return {
        ...prev,
        candidate_ids: exists 
          ? prev.candidate_ids.filter(id => id !== candId)
          : [...prev.candidate_ids, candId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetchWithAuth('/api/portal/batches/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, role);

      if (res.success) {
        setSuccessMsg(`Batch '${res.batch.batch_code}' (${res.batch.batch_title}) created successfully with ${res.batch.enrolled_count} candidates enrolled!`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTradeObj = tradeSkills.find(t => t.trade_name === formData.trade_name);
  const selectedEmployerObj = employers.find(e => e.id === formData.employer_id);

  return (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12 font-sans">
      {/* Top Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-6 sm:p-8 relative shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-purple-800 text-white text-[10px] uppercase font-bold px-2.5 py-0.5 rounded tracking-wider">
                TC BATCH ALLOCATION
              </span>
              <span className="text-xs text-purple-200 font-medium">Apex Industrial Training Institute</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">Create & Allocate Skill Training Batch</h1>
            <p className="text-sm text-slate-300 mt-1">Assign curriculum trades, link industry employers for placements, and enroll verified candidates.</p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-5 rounded-xl text-xs flex items-center gap-3.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm font-display">{successMsg}</p>
            <p className="text-xs text-emerald-700 mt-0.5">The batch is now active on the national portal and visible to government auditors and corporate recruiters.</p>
          </div>
        </div>
      )}

      {/* Form & Live Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Batch Basics */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-700" />
                <h2 className="text-xs font-bold font-display text-slate-800 uppercase tracking-wider">1. Batch Code & Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch Code (Unique)</label>
                  <input
                    type="text"
                    name="batch_code"
                    required
                    value={formData.batch_code}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg p-2.5 font-mono font-bold text-govt-navy focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Seat Capacity</label>
                  <input
                    type="number"
                    name="max_seats"
                    value={formData.max_seats}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Title / Name</label>
                <input
                  type="text"
                  name="batch_title"
                  required
                  value={formData.batch_title}
                  onChange={handleChange}
                  placeholder="e.g. EV & Smart Mobility Technician Batch #2"
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Step 2: Trade & Required Skills */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-govt-navy" />
                <h2 className="text-xs font-bold font-display text-slate-800 uppercase tracking-wider">2. Assign Curriculum Trade & Skills</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Skill Trade</label>
                <select
                  name="trade_name"
                  value={formData.trade_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                >
                  {tradeSkills.map((t, idx) => (
                    <option key={idx} value={t.trade_name}>{t.trade_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Link Partner Employer */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold font-display text-slate-800 uppercase tracking-wider">3. Link Partner Corporate Employer</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Partner (Optional for Direct Placements)</label>
                <select
                  name="employer_id"
                  value={formData.employer_id}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-emerald-900 rounded-lg p-2.5 focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                >
                  <option value="">-- No Corporate Partner (General Batch) --</option>
                  {employers.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.company_name} ({emp.industry_sector})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 4: Candidate Enrollment Checklist */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-bold font-display text-slate-800 uppercase tracking-wider">4. Enroll Candidates into Batch</h2>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {formData.candidate_ids.length} Selected
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {candidates.map((c) => {
                  const isSelected = formData.candidate_ids.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleCandidateToggle(c.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'border-purple-600 bg-purple-50/70 font-semibold text-purple-950 shadow-xs' 
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 font-display">{c.full_name}</p>
                          <p className="text-[10px] text-slate-500">{c.qualification} • Preferred: {c.preferred_trade}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono ${isSelected ? 'bg-purple-200 text-purple-900 font-bold' : 'bg-slate-200 text-slate-600'}`}>
                        {isSelected ? 'Enrolled' : 'Available'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Schedule Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-govt-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-sid-primary py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              {submitting ? 'Creating Batch...' : 'Publish & Allocate Batch'}
            </button>
          </form>
        </div>

        {/* Live Summary Column (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5 sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5 font-display">
              Live Allocation Preview
            </h3>

            <div>
              <span className="text-[10px] font-mono font-bold bg-govt-navy text-white px-2.5 py-0.5 rounded tracking-wider">
                {formData.batch_code || 'CODE'}
              </span>
              <h4 className="text-base font-bold font-display text-slate-900 mt-2">{formData.batch_title || 'Untitled Batch'}</h4>
              <p className="text-xs text-purple-700 font-bold mt-0.5">{formData.trade_name}</p>
            </div>

            {/* Linked Partner Employer Preview */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                Partner Placement Employer
              </span>
              <p className="text-xs font-bold text-emerald-950 font-display">
                {selectedEmployerObj ? selectedEmployerObj.company_name : 'No Partner Linked'}
              </p>
              {selectedEmployerObj && (
                <p className="text-[10px] text-emerald-700">{selectedEmployerObj.industry_sector}</p>
              )}
            </div>

            {/* Linked Skills Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Skills</span>
              <div className="space-y-2 pt-1">
                {selectedTradeObj?.skills?.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-govt-orange" />
                    <span className="font-medium text-slate-700">{s.skill_name || s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Count */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-600">Enrolled Candidate Count:</span>
              <span className="font-bold text-purple-700 font-mono text-sm">
                {formData.candidate_ids.length} / {formData.max_seats} Seats
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
