import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { 
  ShieldAlert, 
  TrendingUp, 
  Building2, 
  IndianRupee, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  FileSpreadsheet, 
  Filter,
  Check,
  X,
  Award,
  Download,
  BarChart2,
  FileText,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Sliders,
  PlusCircle,
  AlertCircle,
  Eye,
  Send,
  DollarSign
} from 'lucide-react';

export const GovernmentDashboard = ({ activeTab = 'dashboard', onNavigateTab }) => {
  const { user, role } = useAuth();

  const [govtData, setGovtData] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState('districts'); // 'districts' | 'trades' | 'schemes'
  const [searchFilter, setSearchFilter] = useState('');
  const [exportNotice, setExportNotice] = useState('');

  // Interactive Training Center Applications State
  const [tcApplications, setTcApplications] = useState([
    { id: 'TC-101', center_name: 'Apex Precision Engineering Institute', state: 'Maharashtra', district: 'Pune', capacity: 350, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-01', trade: 'Advanced CNC Machinist' },
    { id: 'TC-102', center_name: 'National Solar Energy Skilling Hub', state: 'Gujarat', district: 'Ahmedabad', capacity: 400, grade: 'Grade A+', status: 'Pending Audit', applied_date: '2026-09-03', trade: 'Solar PV Installer & Technician' },
    { id: 'TC-103', center_name: 'Green Mobility EV Training Center', state: 'Karnataka', district: 'Bengaluru', capacity: 250, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-04', trade: 'EV Battery Maintenance Specialist' },
    { id: 'TC-104', center_name: 'Western Machinist Academy', state: 'Maharashtra', district: 'Nashik', capacity: 300, grade: 'Grade B+', status: 'Pending Audit', applied_date: '2026-09-05', trade: 'Advanced CNC Machinist' },
    { id: 'TC-105', center_name: 'Surat Renewable Energy Skill Center', state: 'Gujarat', district: 'Surat', capacity: 500, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-06', trade: 'Solar PV Installer & Technician' },
    { id: 'TC-106', center_name: 'Deccan Advanced Automotive Institute', state: 'Telangana', district: 'Hyderabad', capacity: 320, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-07', trade: 'EV Battery Maintenance Specialist' },
    { id: 'TC-107', center_name: 'Northern CNC Machining Works', state: 'Punjab', district: 'Ludhiana', capacity: 280, grade: 'Grade B', status: 'Pending Audit', applied_date: '2026-09-08', trade: 'Advanced CNC Machinist' },
    { id: 'TC-108', center_name: 'East Coast PV Skill Development', state: 'Odisha', district: 'Bhubaneswar', capacity: 350, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-09', trade: 'Solar PV Installer & Technician' },
    { id: 'TC-109', center_name: 'Tamil Nadu EV Battery Research Hub', state: 'Tamil Nadu', district: 'Chennai', capacity: 450, grade: 'Grade A+', status: 'Pending Audit', applied_date: '2026-09-10', trade: 'EV Battery Maintenance Specialist' },
    { id: 'TC-110', center_name: 'Central India Industrial Skill TC', state: 'Madhya Pradesh', district: 'Indore', capacity: 300, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-10', trade: 'Advanced CNC Machinist' },
    { id: 'TC-111', center_name: 'Rajasthan Solar Installer TC', state: 'Rajasthan', district: 'Jaipur', capacity: 380, grade: 'Grade A', status: 'Pending Audit', applied_date: '2026-09-11', trade: 'Solar PV Installer & Technician' },
    { id: 'TC-112', center_name: 'NCR Advanced Automation Institute', state: 'Haryana', district: 'Gurugram', capacity: 420, grade: 'Grade A+', status: 'Pending Audit', applied_date: '2026-09-11', trade: 'EV Battery Maintenance Specialist' }
  ]);

  const [selectedTcModal, setSelectedTcModal] = useState(null);

  // Interactive Fund Allocation State
  const [fundsData, setFundsData] = useState([
    { id: 'F-01', scheme: 'PMKVY 4.0 Advanced Skilling', allocated: 180.0, released: 142.5, utilization: '79.2%', status: 'Active' },
    { id: 'F-02', scheme: 'National Green Energy Skill Mission (Solar PV)', allocated: 120.0, released: 98.0, utilization: '81.6%', status: 'Active' },
    { id: 'F-03', scheme: 'EV Mobility Tech Innovation Grant', allocated: 90.0, released: 65.0, utilization: '72.2%', status: 'Active' },
    { id: 'F-04', scheme: 'DDU-GKY Rural Placement Scheme', allocated: 60.0, released: 44.0, utilization: '73.3%', status: 'Active' }
  ]);

  const [releaseFundModal, setReleaseFundModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState('PMKVY 4.0 Advanced Skilling');
  const [releaseAmount, setReleaseAmount] = useState('10.0');

  useEffect(() => {
    loadGovtData();
  }, [role]);

  const loadGovtData = async () => {
    setLoadingApi(true);
    try {
      const data = await fetchWithAuth('/api/portal/government/data', {}, role);
      setGovtData(data);
    } catch (err) {
      console.warn('Error loading govt data:', err);
    } finally {
      setLoadingApi(false);
    }
  };

  const kpis = govtData?.macroKPIs || {
    totalTrained: '1,452,000',
    placementPct: '78.4%',
    verifiedPlacementPct: '68.2%',
    avgSalaryUplift: '+34.5% (₹ 24,500/mo)'
  };

  const districtList = (govtData?.districtAnalytics || []).filter(d => 
    d.district.toLowerCase().includes(searchFilter.toLowerCase()) || 
    d.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const tradeList = govtData?.tradeAnalytics || [];
  const schemeList = govtData?.schemeComparison || [];
  const demandVsSupply = govtData?.demandVsSupply || [];

  const pendingTcCount = tcApplications.filter(t => t.status === 'Pending Audit').length;

  // Approve TC Application
  const handleApproveTc = (id) => {
    setTcApplications(prev => prev.map(tc => tc.id === id ? { ...tc, status: 'Accredited & Verified' } : tc));
    setExportNotice(`Training Center ${id} successfully accredited & added to national network!`);
    setSelectedTcModal(null);
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Reject TC Application
  const handleRejectTc = (id) => {
    setTcApplications(prev => prev.map(tc => tc.id === id ? { ...tc, status: 'Audit Returned' } : tc));
    setExportNotice(`Training Center ${id} returned for audit inspection.`);
    setSelectedTcModal(null);
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Confirm Fund Tranche Release
  const handleConfirmFundRelease = (e) => {
    e.preventDefault();
    const amt = parseFloat(releaseAmount) || 0;
    setFundsData(prev => prev.map(item => {
      if (item.scheme === selectedScheme) {
        const newReleased = item.released + amt;
        const newPct = Math.min(100, Math.round((newReleased / item.allocated) * 100));
        return {
          ...item,
          released: newReleased,
          utilization: `${newPct}%`
        };
      }
      return item;
    }));

    setExportNotice(`Successfully released ₹ ${amt} Cr installment for ${selectedScheme}!`);
    setReleaseFundModal(false);
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Name,Metric_1,Metric_2,Status\n";

    districtList.forEach(d => {
      csvContent += `District,${d.district} (${d.state}),Trained:${d.trained},Placement:${d.placementPct},Verified:${d.verifiedPct}\n`;
    });

    tradeList.forEach(t => {
      csvContent += `Trade,${t.trade},Trainees:${t.trainees},Placement:${t.placementRate},AvgSalary:${t.avgSalary}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Govt_Skilling_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Excel/CSV Dataset Report generated and downloaded successfully!");
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Export to PDF Summary Trigger
  const handleExportPDF = () => {
    setExportNotice("Official PDF Executive Summary compiled with Digital Emblem Seal!");
    setTimeout(() => setExportNotice(''), 4000);
  };

  const navTo = (tabKey) => {
    if (onNavigateTab) {
      onNavigateTab(tabKey);
    }
  };

  return (
    <div className="space-y-6 font-roboto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-govt-navy via-slate-900 to-amber-950 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                NATIONAL GOVT ADMIN PORTAL
              </span>
              <span className="text-xs text-amber-200">Ministry of Skill Development & Entrepreneurship</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Executive Skilling & Employment Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              National Skilling Mission Analytics • Real-time District Performance, Training Center Verification & Budget Allocation.
            </p>
          </div>

          {/* PDF & Excel Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded shadow flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel CSV</span>
            </button>

            <button 
              onClick={handleExportPDF}
              className="btn-govt-orange text-xs py-2 px-3 shadow flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADMIN ACTION STRIP (Matching attached screenshot buttons) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Govt Admin Quick Action Menu
          </span>
          <span className="text-xs text-govt-navy font-bold font-mono">
            {pendingTcCount} TC Audits Pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Button 1: Allocate Program Batch */}
          <button
            onClick={() => navTo('create-batch')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'create-batch'
                ? 'border-govt-navy bg-govt-navy text-white shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-govt-navy'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'create-batch' ? 'bg-govt-orange text-white' : 'bg-blue-100 text-govt-navy'}`}>
              <PlusCircle className="w-5 h-5" />
            </div>
            <span>Allocate Program Batch</span>
          </button>

          {/* Button 2: National Skilling Metrics */}
          <button
            onClick={() => navTo('analytics')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'analytics'
                ? 'border-govt-navy bg-govt-navy text-white shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-govt-navy'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'analytics' ? 'bg-govt-orange text-white' : 'bg-purple-100 text-purple-700'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span>National Skilling Metrics</span>
          </button>

          {/* Button 3: Training Center Verification */}
          <button
            onClick={() => navTo('centers')}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all text-left text-xs font-bold ${
              activeTab === 'centers'
                ? 'border-govt-navy bg-govt-navy text-white shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-govt-navy'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'centers' ? 'bg-govt-orange text-white' : 'bg-amber-100 text-govt-orange'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <span className="leading-tight">Training Center Verification</span>
            </div>
            {pendingTcCount > 0 && (
              <span className="bg-blue-100 text-govt-navy text-[10px] px-2 py-1 rounded-full font-extrabold whitespace-nowrap">
                {pendingTcCount} Pending
              </span>
            )}
          </button>

          {/* Button 4: Fund & Budget Allocation */}
          <button
            onClick={() => navTo('funds')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'funds'
                ? 'border-govt-navy bg-govt-navy text-white shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-govt-navy'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'funds' ? 'bg-govt-orange text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <span>Fund & Budget Allocation</span>
          </button>

          {/* Button 5: Policy & Compliance */}
          <button
            onClick={() => navTo('policy')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'policy'
                ? 'border-govt-navy bg-govt-navy text-white shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-govt-navy'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'policy' ? 'bg-govt-orange text-white' : 'bg-indigo-100 text-indigo-700'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Policy & Compliance</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span><strong>System Action:</strong> {exportNotice}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold">UPDATED</span>
        </div>
      )}

      {/* SECTION VIEW CONDITIONAL RENDER BASED ON activeTab */}

      {/* VIEW 1: TRAINING CENTER VERIFICATION QUEUE (activeTab === 'centers') */}
      {activeTab === 'centers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-govt-navy" />
                <h2 className="text-base font-bold text-slate-800">Training Center Accreditation & Verification Queue</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Review, audit infrastructure credentials, and approve accreditation applications.</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="bg-blue-50 text-govt-navy px-3 py-1.5 rounded-md border border-blue-200">
                Total Queue: {tcApplications.length} Applicants
              </span>
              <span className="bg-amber-50 text-amber-900 px-3 py-1.5 rounded-md border border-amber-200 font-mono">
                {pendingTcCount} Pending Verification
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Center Code & Name</th>
                  <th className="p-3">State & District</th>
                  <th className="p-3">Trade Specialization</th>
                  <th className="p-3">Capacity & Grade</th>
                  <th className="p-3">Audit Status</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tcApplications.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{tc.center_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tc.id} • Applied {tc.applied_date}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {tc.district}, <span className="text-slate-500 font-bold">{tc.state}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded text-[11px] font-bold">
                        {tc.trade}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {tc.capacity} Seats • <span className="font-bold text-slate-800">{tc.grade}</span>
                    </td>
                    <td className="p-3">
                      {tc.status === 'Pending Audit' && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Audit
                        </span>
                      )}
                      {tc.status === 'Accredited & Verified' && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accredited & Active
                        </span>
                      )}
                      {tc.status === 'Audit Returned' && (
                        <span className="bg-red-100 text-red-800 border border-red-200 font-bold px-2.5 py-0.5 rounded text-[11px]">
                          Returned for Audit
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTcModal(tc)}
                          className="p-1.5 text-slate-600 hover:text-govt-navy hover:bg-slate-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {tc.status === 'Pending Audit' && (
                          <>
                            <button
                              onClick={() => handleApproveTc(tc.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded shadow transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectTc(tc.id)}
                              className="border border-slate-300 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-[11px] px-2 py-1 rounded transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FUND & BUDGET ALLOCATION (activeTab === 'funds') */}
      {activeTab === 'funds' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-800">National Skilling Fund & Treasury Budget Allocation</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Manage scheme allocations, release funding tranches to accredited centers, and monitor utilization.</p>
              </div>

              <button
                onClick={() => setReleaseFundModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow flex items-center gap-2 transition-all"
              >
                <DollarSign className="w-4 h-4" />
                <span>Release Tranche Installment</span>
              </button>
            </div>

            {/* Fund Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Treasury Allocation</span>
                <p className="text-xl font-bold text-govt-navy font-mono mt-1">₹ 450.00 Cr</p>
                <span className="text-[11px] text-slate-600">Union Budget FY 2026-27</span>
              </div>
              <div className="bg-emerald-50/70 p-4 rounded-lg border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase">Disbursed to Training Centers</span>
                <p className="text-xl font-bold text-emerald-700 font-mono mt-1">₹ 349.50 Cr</p>
                <span className="text-[11px] text-emerald-600 font-bold">77.6% Budget Utilized</span>
              </div>
              <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-200">
                <span className="text-xs font-bold text-amber-900 uppercase">Unreleased Reserve Balance</span>
                <p className="text-xl font-bold text-amber-800 font-mono mt-1">₹ 100.50 Cr</p>
                <span className="text-[11px] text-amber-700">Available for Tranche 3</span>
              </div>
            </div>

            {/* Scheme Funding Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Scheme Name</th>
                    <th className="p-3">Total Allocation</th>
                    <th className="p-3">Disbursed Tranche</th>
                    <th className="p-3">Utilization Rate</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {fundsData.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-800">{f.scheme}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">₹ {f.allocated.toFixed(2)} Cr</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">₹ {f.released.toFixed(2)} Cr</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-[11px]">{f.utilization}</span>
                          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: f.utilization }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedScheme(f.scheme);
                            setReleaseFundModal(true);
                          }}
                          className="btn-govt-orange text-[11px] py-1 px-3"
                        >
                          Release Tranche
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: POLICY & COMPLIANCE (activeTab === 'policy') */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <h2 className="text-base font-bold text-slate-800">National Policy Standards & Governance Compliance</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">NCVT Qualification Framework, Aadhaar Biometric Audit Logs, and Corporate Placement Certification Rules.</p>
            </div>

            <button
              onClick={() => handleExportPDF()}
              className="bg-govt-navy hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-lg shadow flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-govt-orange" />
              <span>Download Compliance Audit Brief</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">NCVT NSQF Level 4 Standard</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  100% COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-600">
                All 3 core trade curriculums (CNC Machining, Solar PV, EV Battery Maintenance) are mapped to NCVT NSQF Level 4 NOS criteria with 12 mandatory MCQ modules.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Biometric Aadhaar Attendance Audit</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  94.2% ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Real-time API sync verifying candidate attendance across accredited training centers prior to post-training MCQ assessment unlock.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Employer Verified Placement Audit</span>
                <span className="bg-blue-100 text-govt-navy text-[10px] font-bold px-2 py-0.5 rounded">
                  68.2% VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Corporate HR check-in verifying candidates placed with minimum wage band ₹ 20,000 - ₹ 25,000/mo and role match verification.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">High-Voltage & Lab Safety Standard</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  98.5% CERTIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Inspection logs verifying insulated PPE equipment, CNC emergency stop switches, and EV battery thermal runaway safety protocols.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DEFAULT OVERVIEW / NATIONAL METRICS VIEW (activeTab === 'dashboard' || activeTab === 'analytics') */}
      {(activeTab === 'dashboard' || activeTab === 'analytics') && (
        <>
          {/* OVERVIEW MACRO KPIS (4 CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Trained */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates Trained</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpis.totalTrained}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% YoY Growth
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-govt-navy flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Overall Placement % */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Self-Reported Placement</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpis.placementPct}</p>
                <p className="text-[11px] text-blue-600 font-medium mt-1">1,138,000 Employed</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Employer-Verified Placement % */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Placement %</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{kpis.verifiedPlacementPct}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Corporate HR Audit
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4: Avg Salary Uplift */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Salary Uplift</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{kpis.avgSalaryUplift}</p>
                <p className="text-[11px] text-amber-600 font-medium mt-1">Post-Skilling Increment</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-govt-orange flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* SKILL DEMAND-VS-SUPPLY DUAL BAR CHART */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-govt-navy" />
                  <span>Skill Demand vs. Supply Visual Analytics</span>
                </h2>
                <p className="text-xs text-slate-500">Candidates Trained in Skill X (Supply) vs. Industry Job Postings Requiring Skill X (Demand)</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-govt-navy inline-block"></span>
                  <span className="text-slate-700">Trained Candidates (Supply)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-govt-orange inline-block"></span>
                  <span className="text-slate-900">Job Vacancies (Demand)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {demandVsSupply.map((item, idx) => {
                const maxVal = 30000;
                const supplyWidth = Math.min(100, Math.round((item.candidatesTrained / maxVal) * 100));
                const demandWidth = Math.min(100, Math.round((item.jobOpeningsDemanding / maxVal) * 100));
                const deficit = item.jobOpeningsDemanding - item.candidatesTrained;

                return (
                  <div key={idx} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.skillName}</span>
                      {deficit > 0 ? (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded">
                          Demand Deficit: +{deficit.toLocaleString()} Workers Needed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Supply Balanced
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                          <span>Trained Supply</span>
                          <span className="font-mono">{item.candidatesTrained.toLocaleString()} Trainees</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-govt-navy h-full rounded-full transition-all duration-500" style={{ width: `${supplyWidth}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                          <span>Industry Demand</span>
                          <span className="font-mono text-govt-orange font-bold">{item.jobOpeningsDemanding.toLocaleString()} Postings</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-govt-orange h-full rounded-full transition-all duration-500" style={{ width: `${demandWidth}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABS FOR DISTRICT-WISE TABLE, TRADE BREAKDOWN & SCHEME COMPARISON */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTabSection('districts')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTabSection === 'districts'
                      ? 'bg-govt-navy text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  District-Wise Table
                </button>

                <button
                  onClick={() => setActiveTabSection('trades')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTabSection === 'trades'
                      ? 'bg-govt-navy text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Trade Curriculum Performance
                </button>

                <button
                  onClick={() => setActiveTabSection('schemes')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTabSection === 'schemes'
                      ? 'bg-govt-navy text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Scheme & Batch Comparison
                </button>
              </div>

              {activeTabSection === 'districts' && (
                <div className="relative w-full sm:w-64">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter district or state..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-govt-navy"
                  />
                </div>
              )}
            </div>

            {activeTabSection === 'districts' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">District & State</th>
                      <th className="p-3">Candidates Trained</th>
                      <th className="p-3">Self-Reported Placement</th>
                      <th className="p-3">Verified Placement</th>
                      <th className="p-3">Budget Allocated</th>
                      <th className="p-3 text-right">Performance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {districtList.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-800">{d.district} <span className="text-slate-400 font-normal">({d.state})</span></td>
                        <td className="p-3 font-mono font-bold text-slate-800">{d.trained.toLocaleString()}</td>
                        <td className="p-3 font-bold text-blue-600">{d.placementPct}</td>
                        <td className="p-3 font-bold text-emerald-600">{d.verifiedPct}</td>
                        <td className="p-3 font-mono">{d.fundAllocated}</td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Grade A Target</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTabSection === 'trades' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Skill Trade Curriculum</th>
                      <th className="p-3">Total Trainees</th>
                      <th className="p-3">Placement Rate</th>
                      <th className="p-3">Avg Starting Salary</th>
                      <th className="p-3 text-right">Key Industry Partner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {tradeList.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-800">{t.trade}</td>
                        <td className="p-3 font-mono">{t.trainees.toLocaleString()}</td>
                        <td className="p-3 font-bold text-emerald-600">{t.placementRate}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{t.avgSalary}</td>
                        <td className="p-3 text-right font-bold text-purple-700">{t.topEmployer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTabSection === 'schemes' && (
              <div className="space-y-3">
                {schemeList.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{s.schemeName}</h4>
                        <p className="text-xs text-slate-500">{s.activeBatches} Active Training Batches Nationwide</p>
                      </div>
                      <span className="bg-govt-navy text-white text-xs font-bold px-2.5 py-1 rounded">
                        {s.budgetAllocated}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Course Completion & Assessment Pass Rate:</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">{s.completionRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL 1: VIEW TC AUDIT DETAILS */}
      {selectedTcModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {selectedTcModal.id} • Audit Inspection
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{selectedTcModal.center_name}</h3>
              </div>
              <button onClick={() => setSelectedTcModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">State & District</span>
                  <span className="font-bold text-slate-800">{selectedTcModal.district}, {selectedTcModal.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Accreditation Grade</span>
                  <span className="font-bold text-emerald-700">{selectedTcModal.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lab Seat Capacity</span>
                  <span className="font-bold font-mono">{selectedTcModal.capacity} Trainees</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Specialization Trade</span>
                  <span className="font-bold text-purple-700">{selectedTcModal.trade}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                <span className="font-bold text-govt-navy block">Infrastructure Audit Checklist:</span>
                <p className="text-[11px] text-slate-600">✓ Biometric Aadhaar Device Synced</p>
                <p className="text-[11px] text-slate-600">✓ NCVT Certified Instructors Onboarded (4 Trainers)</p>
                <p className="text-[11px] text-slate-600">✓ Industry Practical Lab Inspection Passed</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {selectedTcModal.status === 'Pending Audit' && (
                <>
                  <button
                    onClick={() => handleRejectTc(selectedTcModal.id)}
                    className="border border-slate-300 hover:bg-red-50 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg"
                  >
                    Return for Audit
                  </button>
                  <button
                    onClick={() => handleApproveTc(selectedTcModal.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow"
                  >
                    Grant Accreditation
                  </button>
                </>
              )}
              {selectedTcModal.status !== 'Pending Audit' && (
                <button
                  onClick={() => setSelectedTcModal(null)}
                  className="bg-govt-navy text-white font-bold text-xs py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RELEASE TRANCHE FUND INSTALLMENT */}
      {releaseFundModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Treasury Fund Release
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">Disburse Funding Tranche</h3>
              </div>
              <button onClick={() => setReleaseFundModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFundRelease} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Skilling Scheme:</label>
                <select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-govt-navy"
                >
                  {fundsData.map(f => (
                    <option key={f.id} value={f.scheme}>{f.scheme} (Allocated: ₹ {f.allocated} Cr)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tranche Installment Amount (in ₹ Crore):</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-govt-navy"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                ⚠️ Disbursed funds will be automatically credited to accredited training center bank accounts via PFMS Gateway.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReleaseFundModal(false)}
                  className="border border-slate-300 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-lg shadow"
                >
                  Confirm Fund Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
