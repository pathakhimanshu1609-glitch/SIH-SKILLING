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

  // Navigation Items / Sections per Role
  const getNavSections = () => {
    switch (role) {
      case 'candidate':
        return [
          {
            title: 'GET STARTED',
            items: [
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'onboarding', label: 'Candidate Onboarding', icon: UserPlus },
              { id: 'courses', label: 'Enrolled Schemes & Courses', icon: BookOpen, badge: '2 Active' }
            ]
          },
          {
            title: 'SKILL ASSESSMENT',
            items: [
              { id: 'assessment', label: 'Skill MCQ Assessment', icon: FileQuestion },
              { id: 'scorecard', label: 'Competency Radar Chart', icon: BarChart2, badge: 'DigiLocker' },
              { id: 'skill-match', label: 'Skill Match & Gap Bar Chart', icon: Target, badge: '180 Jobs' }
            ]
          },
          {
            title: 'JOBS & PLACEMENT',
            items: [
              { id: 'jobs', label: 'Recommended Jobs', icon: Briefcase },
              { id: 'applications', label: 'My Applications', icon: FileCheck },
              { id: 'employment-status', label: 'Placement & Check-Ins', icon: CheckSquare, badge: 'Day 30' }
            ]
          },
          {
            title: 'CREDENTIALS',
            items: [
              { id: 'certifications', label: 'Skill Certifications', icon: Award, badge: '1 Verified' }
            ]
          }
        ];

      case 'training_center':
        return [
          {
            title: null,
            items: [
              { id: 'dashboard', label: 'TC Dashboard Overview', icon: LayoutDashboard },
              { id: 'employment-status', label: 'Post-Placement Audits', icon: CheckSquare },
              { id: 'create-batch', label: 'Create & Allocate Batch', icon: PlusCircle, badge: 'New Trade' },
              { id: 'skill-match', label: 'Industry Skill Gap Analytics', icon: Target },
              { id: 'scorecard', label: 'Candidate Radar Scorecards', icon: BarChart2 },
              { id: 'batches', label: 'Batch Management', icon: Users, badge: '8 Batches' },
              { id: 'enrollment', label: 'Trainee Registration', icon: UserPlus },
              { id: 'audit', label: 'Infrastructure Audit', icon: ShieldCheck, badge: 'Grade A' },
              { id: 'reports', label: 'Completion Reports', icon: FileText }
            ]
          }
        ];

      case 'government':
        return [
          {
            title: null,
            items: [
              { id: 'dashboard', label: 'Govt Admin Dashboard', icon: LayoutDashboard },
              { id: 'employment-status', label: 'Placement Verification Queue', icon: CheckSquare, badge: 'Audit' },
              { id: 'skill-match', label: 'National Skill Gap Bar Index', icon: Target },
              { id: 'scorecard', label: 'Skill Growth Radar Index', icon: BarChart2 },
              { id: 'create-batch', label: 'Allocate Program Batch', icon: PlusCircle },
              { id: 'analytics', label: 'National Skilling Metrics', icon: TrendingUp },
              { id: 'centers', label: 'Training Center Verification', icon: Building2, badge: '12 Pending' },
              { id: 'funds', label: 'Fund & Budget Allocation', icon: Sliders },
              { id: 'policy', label: 'Policy & Compliance', icon: ShieldCheck }
            ]
          }
        ];

      case 'employer':
        return [
          {
            title: null,
            items: [
              { id: 'dashboard', label: 'Employer Portal', icon: LayoutDashboard },
              { id: 'employment-status', label: 'Confirm Placements', icon: CheckSquare, badge: 'Action Required' },
              { id: 'skill-match', label: 'Skill Gap & Demand Match', icon: Target },
              { id: 'scorecard', label: 'Candidate Skill Radar', icon: BarChart2 },
              { id: 'postings', label: 'Job Openings', icon: Briefcase, badge: '14 Active' },
              { id: 'post-job', label: 'Create Vacancy', icon: PlusCircle },
              { id: 'candidates', label: 'Verified Candidate Search', icon: Search },
              { id: 'applicants', label: 'Applications Received', icon: FileCheck, badge: '45 New' }
            ]
          }
        ];

      default:
        return [
          {
            title: null,
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
            ]
          }
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <aside className="fixed left-0 top-[100px] w-64 h-[calc(100vh-100px)] bg-white border-r border-slate-300 flex flex-col justify-between z-40 font-sans">
      {/* Upper Navigation Section */}
      <div className="p-3 overflow-y-auto">
        <div className="mb-2 pb-2 border-b border-slate-200 px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            {role ? `${role.replace('_', ' ')} Navigation` : 'Navigation'}
          </p>
        </div>

        <nav className="space-y-3">
          {navSections.map((section, sIdx) => (
            <div key={section.title || sIdx} className="space-y-0.5">
              {section.title && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1.5 pb-0.5 select-none">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-xs font-medium transition-colors group text-left ${
                      isActive 
                        ? 'bg-[#0B3D6B] text-white font-semibold' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#0B3D6B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#D2691E]' : 'text-slate-400 group-hover:text-[#0B3D6B]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono font-bold tracking-tight flex-shrink-0 ml-1.5 ${
                        isActive 
                          ? 'bg-[#D2691E] text-white' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Footer Info Box */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="rounded-[4px] bg-white border border-slate-200 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B3D6B] mb-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#D2691E]" />
            <span>Portal Helpline</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Toll Free: <span className="font-mono">1800-111-2026</span><br />
            Support: <span className="font-mono">helpdesk@skilling.gov.in</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
