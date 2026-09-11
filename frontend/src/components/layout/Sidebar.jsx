import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Briefcase, 
  FileCheck, 
  Users, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  PlusCircle, 
  Search, 
  HelpCircle,
  ChevronRight,
  Sliders,
  UserPlus,
  BarChart2,
  FileQuestion,
  Target,
  CheckSquare
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  // Navigation Items per Role
  const getNavItems = () => {
    switch (role) {
      case 'candidate':
        return [
          { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'employment-status', label: 'Placement & Check-Ins', icon: CheckSquare, badge: 'Day 30' },
          { id: 'skill-match', label: 'Skill Match & Gap Bar Chart', icon: Target, badge: '180 Jobs' },
          { id: 'scorecard', label: 'Competency Radar Chart', icon: BarChart2, badge: 'DigiLocker' },
          { id: 'assessment', label: 'Skill MCQ Assessment', icon: FileQuestion },
          { id: 'onboarding', label: 'Candidate Onboarding', icon: UserPlus },
          { id: 'courses', label: 'Enrolled Schemes & Courses', icon: BookOpen, badge: '2 Active' },
          { id: 'certifications', label: 'Skill Certifications', icon: Award, badge: '1 Verified' },
          { id: 'jobs', label: 'Recommended Jobs', icon: Briefcase },
          { id: 'applications', label: 'My Applications', icon: FileCheck }
        ];

      case 'training_center':
        return [
          { id: 'dashboard', label: 'TC Dashboard Overview', icon: LayoutDashboard },
          { id: 'employment-status', label: 'Post-Placement Audits', icon: CheckSquare },
          { id: 'create-batch', label: 'Create & Allocate Batch', icon: PlusCircle, badge: 'New Trade' },
          { id: 'skill-match', label: 'Industry Skill Gap Analytics', icon: Target },
          { id: 'scorecard', label: 'Candidate Radar Scorecards', icon: BarChart2 },
          { id: 'batches', label: 'Batch Management', icon: Users, badge: '8 Batches' },
          { id: 'enrollment', label: 'Trainee Registration', icon: UserPlus },
          { id: 'audit', label: 'Infrastructure Audit', icon: ShieldCheck, badge: 'Grade A' },
          { id: 'reports', label: 'Completion Reports', icon: FileText }
        ];

      case 'government':
        return [
          { id: 'dashboard', label: 'Govt Admin Dashboard', icon: LayoutDashboard },
          { id: 'employment-status', label: 'Placement Verification Queue', icon: CheckSquare, badge: 'Audit' },
          { id: 'skill-match', label: 'National Skill Gap Bar Index', icon: Target },
          { id: 'scorecard', label: 'Skill Growth Radar Index', icon: BarChart2 },
          { id: 'create-batch', label: 'Allocate Program Batch', icon: PlusCircle },
          { id: 'analytics', label: 'National Skilling Metrics', icon: TrendingUp },
          { id: 'centers', label: 'Training Center Verification', icon: Building2, badge: '12 Pending' },
          { id: 'funds', label: 'Fund & Budget Allocation', icon: Sliders },
          { id: 'policy', label: 'Policy & Compliance', icon: ShieldCheck }
        ];

      case 'employer':
        return [
          { id: 'dashboard', label: 'Employer Portal', icon: LayoutDashboard },
          { id: 'employment-status', label: 'Confirm Placements', icon: CheckSquare, badge: 'Action Required' },
          { id: 'skill-match', label: 'Skill Gap & Demand Match', icon: Target },
          { id: 'scorecard', label: 'Candidate Skill Radar', icon: BarChart2 },
          { id: 'postings', label: 'Job Openings', icon: Briefcase, badge: '14 Active' },
          { id: 'post-job', label: 'Create Vacancy', icon: PlusCircle },
          { id: 'candidates', label: 'Verified Candidate Search', icon: Search },
          { id: 'applicants', label: 'Applications Received', icon: FileCheck, badge: '45 New' }
        ];

      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 shadow-govt-sidebar flex flex-col justify-between z-40">
      {/* Upper Navigation Section */}
      <div className="p-4 overflow-y-auto">
        <div className="mb-4 pb-2 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role ? `${role.replace('_', ' ')} Navigation` : 'Navigation'}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive 
                    ? 'bg-govt-navy text-white shadow-sm font-semibold' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-govt-navy'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-govt-orange' : 'text-slate-500 group-hover:text-govt-navy'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-govt-orange text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info Box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="rounded-lg bg-govt-navy/5 border border-govt-navy/10 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-govt-navy mb-1">
            <HelpCircle className="w-4 h-4 text-govt-orange" />
            <span>Portal Helpline</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Toll Free: 1800-111-2026<br />
            Support: helpdesk@skilling.gov.in
          </p>
        </div>
      </div>
    </aside>
  );
};
