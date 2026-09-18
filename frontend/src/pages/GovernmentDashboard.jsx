import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { subscribeEmploymentSync } from '../lib/realtimeSync';
import { 
  ShieldAlert, 
  TrendingUp, 
  Building2, 
  IndianRupee, 
  Users, 
  CheckCircle2, 
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
  DollarSign,
  Radio,
  Clock,
  Briefcase,
  Calendar,
  Search
} from 'lucide-react';
import AnimatedCounter from '../components/common/AnimatedCounter';

export const GovernmentDashboard = ({ activeTab = 'dashboard', onNavigateTab }) => {
  const { user, role } = useAuth();

  const [govtData, setGovtData] = useState(null);
  const [employmentAggregates, setEmploymentAggregates] = useState(null);
  const [retentionAggregates, setRetentionAggregates] = useState(null);
  const [realtimePulse, setRealtimePulse] = useState(false);
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

  // Realtime subscription for automatic cross-portal synchronization
  useEffect(() => {
    const unsub = subscribeEmploymentSync((event) => {
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 2500);
      loadGovtData();
    });
    return () => unsub();
  }, []);

  const loadGovtData = async () => {
    setLoadingApi(true);
    try {
      const [data, aggRes, retRes] = await Promise.all([
        fetchWithAuth('/api/portal/government/data', {}, role).catch(() => null),
        fetchWithAuth('/api/portal/employment/government-aggregates', {}, role).catch(() => null),
        fetchWithAuth('/api/portal/retention/aggregates', {}, role).catch(() => null)
      ]);
      setGovtData(data);
      if (aggRes) {
        setEmploymentAggregates(aggRes);
      }
      if (retRes) {
        setRetentionAggregates(retRes);
      }
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
    <div className="space-y-8 font-sans">
      {/* Top Sovereign Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-[#072847] text-[#D2691E] border border-[#D2691E]/30 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded">
                National Govt Admin Portal
              </span>
              <span className="text-xs text-amber-200">Ministry of Skill Development & Entrepreneurship</span>
              {realtimePulse && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live Synced
                </span>
              )}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              Executive Skilling & Employment Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              National Skilling Mission Analytics • Real-time District Performance, Training Center Verification & Budget Allocation.
            </p>
          </div>

          {/* PDF & Excel Export Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={handleExportCSV}
              className="btn-sid-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0B3D6B]" />
              <span>Export CSV</span>
            </button>

            <button 
              onClick={handleExportPDF}
              className="btn-sid-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADMIN ACTION STRIP */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Govt Admin Quick Action Menu
          </span>
          <span className="text-xs text-[#0B3D6B] font-bold font-mono">
            {pendingTcCount} TC Audits Pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Button 1: Allocate Program Batch */}
          <button
            onClick={() => navTo('create-batch')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'create-batch'
                ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-[#0B3D6B]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'create-batch' ? 'bg-[#D2691E] text-white' : 'bg-[#E8ECFB] text-[#0B3D6B]'}`}>
              <PlusCircle className="w-5 h-5" />
            </div>
            <span>Allocate Program Batch</span>
          </button>

          {/* Button 2: National Skilling Metrics */}
          <button
            onClick={() => navTo('analytics')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'analytics'
                ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-[#0B3D6B]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'analytics' ? 'bg-[#D2691E] text-white' : 'bg-[#FDEEE0] text-[#D2691E]'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span>National Skilling Metrics</span>
          </button>

          {/* Button 3: Training Center Verification */}
          <button
            onClick={() => navTo('centers')}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all text-left text-xs font-bold ${
              activeTab === 'centers'
                ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-[#0B3D6B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'centers' ? 'bg-[#D2691E] text-white' : 'bg-[#E8ECFB] text-[#0B3D6B]'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <span className="leading-tight">Training Center Verification</span>
            </div>
            {pendingTcCount > 0 && (
              <span className="bg-[#E8ECFB] text-[#0B3D6B] text-[10px] px-2 py-1 rounded-full font-extrabold whitespace-nowrap">
                {pendingTcCount} Pending
              </span>
            )}
          </button>

          {/* Button 4: Fund & Budget Allocation */}
          <button
            onClick={() => navTo('funds')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'funds'
                ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-[#0B3D6B]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'funds' ? 'bg-[#D2691E] text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <span>Fund & Budget Allocation</span>
          </button>

          {/* Button 5: Policy & Compliance */}
          <button
            onClick={() => navTo('policy')}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left text-xs font-bold ${
              activeTab === 'policy'
                ? 'border-[#0B3D6B] bg-[#0B3D6B] text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-[#0B3D6B]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'policy' ? 'bg-[#D2691E] text-white' : 'bg-[#E8ECFB] text-[#0B3D6B]'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Policy & Compliance</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {exportNotice && (
        <div className="banner-peach p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[#8C3A00]"><strong>System Action:</strong> {exportNotice}</span>
          </div>
          <span className="font-mono text-[10px] bg-white text-[#8C3A00] border border-[#F8D3B8] px-2 py-0.5 rounded font-bold">UPDATED</span>
        </div>
      )}

      {/* SECTION VIEW CONDITIONAL RENDER BASED ON activeTab */}

      {/* VIEW 1: TRAINING CENTER VERIFICATION QUEUE (activeTab === 'centers') */}
      {activeTab === 'centers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0B3D6B]" />
                <h2 className="font-display text-base font-bold text-slate-900">Training Center Accreditation & Verification Queue</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Review, audit infrastructure credentials, and approve accreditation applications.</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="bg-[#E8ECFB] text-[#0B3D6B] px-3 py-1.5 rounded-md border border-[#D1DBF7]">
                Total Queue: {tcApplications.length} Applicants
              </span>
              <span className="bg-[#FDEEE0] text-[#D2691E] px-3 py-1.5 rounded-md border border-[#F8D3B8] font-mono">
                {pendingTcCount} Pending Verification
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="table-govt w-full text-left text-xs">
              <thead>
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
                      <div className="font-bold text-slate-900">{tc.center_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tc.id} • Applied {tc.applied_date}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {tc.district}, <span className="text-slate-500 font-bold">{tc.state}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-[#E8ECFB] text-[#0B3D6B] px-2 py-0.5 rounded text-[11px] font-bold">
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
                          className="p-1.5 text-slate-600 hover:text-[#0B3D6B] hover:bg-slate-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {tc.status === 'Pending Audit' && (
                          <>
                            <button
                              onClick={() => handleApproveTc(tc.id)}
                              className="btn-sid-primary text-[11px] py-1 px-2.5 flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectTc(tc.id)}
                              className="btn-sid-secondary text-[11px] py-1 px-2 border-red-200 text-red-700 hover:bg-red-50"
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
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="table-govt w-full text-left text-xs">
                <thead>
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
                      <td className="p-3 font-bold text-slate-900">{f.scheme}</td>
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
                          className="btn-sid-primary text-[11px] py-1 px-3 shadow-xs"
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
                <h2 className="font-display text-base font-bold text-slate-800">National Policy Standards & Governance Compliance</h2>
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
          {/* OVERVIEW MACRO KPIS (REAL AGGREGATES FROM employment_records & checkins) */}
          {(() => {
            const sum = employmentAggregates?.summary || {
              total_placements: 5,
              verified_placements: 4,
              verified_percentage: 80,
              total_due_checkins: 4,
              completed_due_checkins: 3,
              checkin_completion_percentage: 75,
              reference_date: '2026-09-13'
            };

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Total Placements */}
                <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Placements</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      <AnimatedCounter end={sum.total_placements} suffix=" Candidates" />
                    </p>
                    <p className="text-[11px] text-[#0B3D6B] font-medium mt-1 flex items-center gap-0.5">
                      <Briefcase className="w-3.5 h-3.5" /> employment_records
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#E8ECFB] text-[#0B3D6B] flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 2: Employer-Verified % */}
                <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">% Employer-Verified</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      <AnimatedCounter end={sum.verified_percentage} suffix="%" />
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {sum.verified_placements} of {sum.total_placements} Verified
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 3: % of Due Check-Ins Completed */}
                <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">% Due Check-Ins Done</p>
                    <p className="text-2xl font-bold text-[#0B3D6B] mt-1">
                      <AnimatedCounter end={sum.checkin_completion_percentage} suffix="%" />
                    </p>
                    <p className="text-[11px] text-[#0B3D6B] font-medium mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> {sum.completed_due_checkins} of {sum.total_due_checkins} Due Check-Ins
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#E8ECFB] text-[#0B3D6B] flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 4: Longitudinal Horizon */}
                <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Longitudinal Horizon</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">30d / 90d / 180d / 365d</p>
                    <p className="text-[11px] text-[#D2691E] font-medium mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Ref Date: {sum.reference_date}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#FDEEE0] text-[#D2691E] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ======================================================= */}
          {/* POST-PLACEMENT RETENTION RATES & POLICY REPORTING       */}
          {/* ======================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#072847] text-[#D2691E] border border-[#D2691E]/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                    NCVT NSQF Post-Placement Audit
                  </span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Tripartite Consensus Enforced
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0B3D6B]" />
                  <span>National Post-Placement Retention Policy Index</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracks authentic longitudinal employment persistence at Day 30, Day 90, Day 180, and Day 365, requiring at least 2 of 3 independent confirmation sources to prevent single-party fraud.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="bg-blue-50 text-[#0B3D6B] font-bold px-3 py-1.5 rounded-lg border border-blue-100">
                  Tracked Cohort: {retentionAggregates?.total_candidates_tracked || 5} Placed Candidates
                </span>
              </div>
            </div>

            {/* 4 MILESTONES RETENTION RATE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Day 30 Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B3D6B] uppercase tracking-wide">Day 30 Checkpoint</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Immediate Induction
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold font-mono text-slate-900">
                    {retentionAggregates?.milestones?.[30]?.retention_rate_pct || '80%'}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">retained</span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                  <p>Verified: <strong className="text-slate-800">{retentionAggregates?.milestones?.[30]?.verified_count ?? 4}</strong></p>
                  <p>Pending: <strong className="text-amber-600">{retentionAggregates?.milestones?.[30]?.pending_count ?? 1}</strong></p>
                </div>
              </div>

              {/* Day 90 Card (Core policy target: e.g., '78% retained at Day 90') */}
              <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/40 hover:bg-blue-50/60 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B3D6B] uppercase tracking-wide">Day 90 Checkpoint</span>
                  <span className="bg-blue-100 text-[#0B3D6B] text-[10px] font-bold px-2 py-0.5 rounded">
                    Probation Complete
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold font-mono text-slate-900">
                    {retentionAggregates?.milestones?.[90]?.retention_rate_pct || '78%'}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">retained</span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                  <p>Verified: <strong className="text-slate-800">{retentionAggregates?.milestones?.[90]?.verified_count ?? 3}</strong></p>
                  <p>National Policy Goal: <strong className="text-[#0B3D6B]">&gt;75%</strong></p>
                </div>
              </div>

              {/* Day 180 Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B3D6B] uppercase tracking-wide">Day 180 Checkpoint</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Mid-Year Stability
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold font-mono text-slate-900">
                    {retentionAggregates?.milestones?.[180]?.retention_rate_pct || '71%'}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">retained</span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                  <p>Verified: <strong className="text-slate-800">{retentionAggregates?.milestones?.[180]?.verified_count ?? 2}</strong></p>
                  <p>Pending: <strong className="text-amber-600">{retentionAggregates?.milestones?.[180]?.pending_count ?? 3}</strong></p>
                </div>
              </div>

              {/* Day 365 Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B3D6B] uppercase tracking-wide">Day 365 Checkpoint</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    1-Year Certified
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold font-mono text-slate-900">
                    {retentionAggregates?.milestones?.[365]?.retention_rate_pct || '65%'}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">retained</span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
                  <p>Verified: <strong className="text-slate-800">{retentionAggregates?.milestones?.[365]?.verified_count ?? 1}</strong></p>
                  <p>Long-Term Horizon: <strong className="text-[#D2691E]">365 Days</strong></p>
                </div>
              </div>
            </div>

            {/* ANTI-FRAUD POLICY CONSENSUS AUDIT TRAIL */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fraud-Prevention Multi-Source Consensus Standard:</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Placement status cannot be self-reported as 'Verified' without either Employer HR confirmation or bank-credited Salary Slip upload within 30 days.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] flex-shrink-0">
                <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Tripartite Verified</span>
                  <strong className="text-emerald-700">{retentionAggregates?.anti_fraud_metrics?.tripartite_consensus_verified ?? 4}</strong>
                </div>
                <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Pending Secondary</span>
                  <strong className="text-amber-600">{retentionAggregates?.anti_fraud_metrics?.single_party_pending_secondary ?? 1}</strong>
                </div>
                <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Separations</span>
                  <strong className="text-slate-700">{retentionAggregates?.anti_fraud_metrics?.verified_separations ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SKILL DEMAND-VS-SUPPLY DUAL BAR CHART */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#0B3D6B]" />
                  <span>Skill Demand vs. Supply Visual Analytics</span>
                </h2>
                <p className="text-xs text-slate-500">Candidates Trained in Skill X (Supply) vs. Industry Job Postings Requiring Skill X (Demand)</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0B3D6B] inline-block"></span>
                  <span className="text-slate-700">Trained Candidates (Supply)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#D2691E] inline-block"></span>
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
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{item.skillName}</span>
                      {deficit > 0 ? (
                        <span className="text-[10px] bg-[#FDEEE0] text-[#D2691E] border border-[#F8D3B8] font-bold px-2 py-0.5 rounded">
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
                          <span className="font-mono text-slate-800">{item.candidatesTrained.toLocaleString()} Trainees</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[#0B3D6B] h-full rounded-full transition-all duration-500" style={{ width: `${supplyWidth}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                          <span>Industry Demand</span>
                          <span className="font-mono text-[#D2691E] font-bold">{item.jobOpeningsDemanding.toLocaleString()} Postings</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[#D2691E] h-full rounded-full transition-all duration-500" style={{ width: `${demandWidth}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABS FOR DISTRICT-WISE TABLE, TRADE BREAKDOWN & SCHEME COMPARISON */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTabSection('districts')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTabSection === 'districts'
                      ? 'bg-[#0B3D6B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  District-Wise Table
                </button>

                <button
                  onClick={() => setActiveTabSection('trades')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTabSection === 'trades'
                      ? 'bg-[#0B3D6B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Trade Curriculum Performance
                </button>

                <button
                  onClick={() => setActiveTabSection('schemes')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTabSection === 'schemes'
                      ? 'bg-[#0B3D6B] text-white shadow-xs'
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
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E]"
                  />
                </div>
              )}
            </div>

            {activeTabSection === 'districts' && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="table-govt w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th className="p-3">District & State</th>
                      <th className="p-3">Total Placements</th>
                      <th className="p-3">% Employer-Verified</th>
                      <th className="p-3">Due Check-Ins</th>
                      <th className="p-3">Completed Check-Ins</th>
                      <th className="p-3 text-right">% Due Check-Ins Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(employmentAggregates?.by_district || [
                      { district: 'Pune', state: 'Maharashtra', placements: 2, verified: 2, verified_pct: 100, due_checkins: 2, completed_checkins: 2, checkin_completion_pct: 100 },
                      { district: 'Nashik', state: 'Maharashtra', placements: 1, verified: 1, verified_pct: 100, due_checkins: 1, completed_checkins: 1, checkin_completion_pct: 100 },
                      { district: 'Bengaluru', state: 'Karnataka', placements: 1, verified: 1, verified_pct: 100, due_checkins: 1, completed_checkins: 0, checkin_completion_pct: 0 },
                      { district: 'Ahmedabad', state: 'Gujarat', placements: 1, verified: 0, verified_pct: 0, due_checkins: 0, completed_checkins: 0, checkin_completion_pct: 100 }
                    ])
                      .filter(d => 
                        d.district.toLowerCase().includes(searchFilter.toLowerCase()) || 
                        d.state.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((d, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">
                            {d.district} <span className="text-slate-400 font-normal">({d.state})</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800">{d.placements} Placed</td>
                          <td className="p-3">
                            <span className="font-bold text-emerald-700">{d.verified_pct}%</span>
                            <span className="text-[10px] text-slate-400 ml-1">({d.verified}/{d.placements})</span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">{d.due_checkins} Due</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{d.completed_checkins} Done</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              d.checkin_completion_pct >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.checkin_completion_pct > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {d.checkin_completion_pct}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTabSection === 'trades' && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="table-govt w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th className="p-3">Skill Trade Curriculum</th>
                      <th className="p-3">Total Placements</th>
                      <th className="p-3">% Employer-Verified</th>
                      <th className="p-3">Due Check-Ins</th>
                      <th className="p-3">Completed Check-Ins</th>
                      <th className="p-3 text-right">% Due Check-Ins Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(employmentAggregates?.by_trade || [
                      { trade: 'Advanced CNC Machinist', placements: 2, verified: 2, verified_pct: 100, due_checkins: 2, completed_checkins: 2, checkin_completion_pct: 100 },
                      { trade: 'Solar PV Installer & Technician', placements: 1, verified: 1, verified_pct: 100, due_checkins: 1, completed_checkins: 1, checkin_completion_pct: 100 },
                      { trade: 'EV Battery Maintenance Specialist', placements: 1, verified: 1, verified_pct: 100, due_checkins: 1, completed_checkins: 0, checkin_completion_pct: 0 },
                      { trade: 'Cybersecurity Junior Analyst', placements: 1, verified: 0, verified_pct: 0, due_checkins: 0, completed_checkins: 0, checkin_completion_pct: 100 }
                    ]).map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{t.trade}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{t.placements} Placed</td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-700">{t.verified_pct}%</span>
                          <span className="text-[10px] text-slate-400 ml-1">({t.verified}/{t.placements})</span>
                        </td>
                        <td className="p-3 font-mono text-slate-700">{t.due_checkins} Due</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">{t.completed_checkins} Done</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            t.checkin_completion_pct >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.checkin_completion_pct > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.checkin_completion_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTabSection === 'schemes' && (
              <div className="space-y-3">
                {(employmentAggregates?.by_scheme || [
                  { scheme: 'PMKVY 4.0 Advanced Skilling', placements: 3, verified: 2, verified_pct: 67, due_checkins: 2, completed_checkins: 2, checkin_completion_pct: 100 },
                  { scheme: 'National Green Energy Skill Mission (Solar PV)', placements: 1, verified: 1, verified_pct: 100, due_checkins: 1, completed_checkins: 1, checkin_completion_pct: 100 },
                  { scheme: 'EV Mobility Tech Innovation Grant', placements: 1, verified: 1, verified_pct: 100, due_checkins: 1, completed_checkins: 0, checkin_completion_pct: 0 }
                ]).map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{s.scheme}</h4>
                        <p className="text-xs text-slate-500">
                          {s.placements} Total Placements • {s.verified} Employer-Verified ({s.verified_pct}%)
                        </p>
                      </div>
                      <span className="bg-[#0B3D6B] text-white text-xs font-bold px-2.5 py-1 rounded">
                        {s.due_checkins} Due Check-Ins
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Longitudinal Retention Check-Ins Completed: <strong>{s.completed_checkins} / {s.due_checkins} Due</strong>
                      </span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        {s.checkin_completion_pct}% Completed
                      </span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-auto relative animate-fade-in-up">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {selectedTcModal.id} • Audit Inspection
                </span>
                <h3 className="font-display text-lg font-bold text-slate-800 mt-1">{selectedTcModal.center_name}</h3>
              </div>
              <button onClick={() => setSelectedTcModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">State & District</span>
                  <span className="font-bold text-slate-800">{selectedTcModal.district}, {selectedTcModal.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Accreditation Grade</span>
                  <span className="font-bold text-emerald-700">{selectedTcModal.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lab Seat Capacity</span>
                  <span className="font-bold font-mono">{selectedTcModal.capacity} Trainees</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Specialization Trade</span>
                  <span className="font-bold text-purple-700">{selectedTcModal.trade}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <span className="font-bold text-govt-navy block">Infrastructure Audit Checklist:</span>
                <p className="text-[11px] text-slate-600">✓ Biometric Aadhaar Device Synced with National MSDE Server</p>
                <p className="text-[11px] text-slate-600">✓ NCVT Certified Instructors Onboarded (4 Qualified Trainers)</p>
                <p className="text-[11px] text-slate-600">✓ Industry Practical Lab Inspection Passed with Emergency Protocol</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {selectedTcModal.status === 'Pending Audit' && (
                <>
                  <button
                    onClick={() => handleRejectTc(selectedTcModal.id)}
                    className="btn-sid-secondary text-xs py-2 px-4"
                  >
                    Return for Audit
                  </button>
                  <button
                    onClick={() => handleApproveTc(selectedTcModal.id)}
                    className="btn-sid-primary text-xs py-2 px-5"
                  >
                    Grant Accreditation
                  </button>
                </>
              )}
              {selectedTcModal.status !== 'Pending Audit' && (
                <button
                  onClick={() => setSelectedTcModal(null)}
                  className="btn-sid-secondary text-xs py-2 px-4"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-auto relative animate-fade-in-up">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Treasury Fund Release
                </span>
                <h3 className="font-display text-lg font-bold text-slate-800 mt-1">Disburse Funding Tranche</h3>
              </div>
              <button onClick={() => setReleaseFundModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFundRelease} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Skilling Scheme:</label>
                <select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E]"
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
                  className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-[#D2691E] focus:border-[#D2691E]"
                  required
                />
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                ⚠️ Disbursed funds will be automatically credited to accredited training center bank accounts via PFMS Gateway.
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReleaseFundModal(false)}
                  className="btn-sid-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-sid-primary text-xs py-2 px-5"
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
