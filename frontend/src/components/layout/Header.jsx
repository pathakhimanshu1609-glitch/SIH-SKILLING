import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Briefcase, 
  LogOut, 
  Bell, 
  Search, 
  ChevronDown,
  Layers
} from 'lucide-react';

export const Header = () => {
  const { user, role, signOut, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleMeta = (r) => {
    switch (r) {
      case 'candidate':
        return { label: 'Candidate / Trainee', color: 'bg-blue-600 text-white', icon: UserCheck };
      case 'training_center':
        return { label: 'Training Center', color: 'bg-purple-600 text-white', icon: Building2 };
      case 'government':
        return { label: 'Govt Admin', color: 'bg-govt-orange text-white', icon: ShieldAlert };
      case 'employer':
        return { label: 'Employer / Partner', color: 'bg-emerald-600 text-white', icon: Briefcase };
      default:
        return { label: 'Portal User', color: 'bg-slate-600 text-white', icon: UserCheck };
    }
  };

  const currentRoleMeta = getRoleMeta(role);
  const RoleIcon = currentRoleMeta.icon;

  // Fully dynamic user identity derived from authenticated session
  const userDisplayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Portal User');
  const userEmail = user?.email || '';
  const avatarInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-govt-navy text-white shadow-govt-header z-50 flex items-center justify-between px-4 md:px-6 border-b border-govt-navy-light font-sans">
      {/* Brand & Emblem */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-[4px] bg-[#072847] border border-[#C9A227] flex items-center justify-center font-bold text-xs font-mono text-[#C9A227]">
          GOV
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base md:text-lg tracking-tight font-sans text-white">
              National Skilling Portal
            </span>
            <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide">
              OFFICIAL
            </span>
          </div>
          <p className="text-[11px] text-blue-200 hidden sm:block tracking-wide">
            Ministry of Skill Development & Entrepreneurship • Govt of India
          </p>
        </div>
      </div>

      {/* Right Controls: Role Indicator, User Dropdown */}
      <div className="flex items-center space-x-3">
        {/* Role Indicator / Switcher */}
        <div className="relative">
          {import.meta.env.DEV ? (
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-medium border border-white/20 transition-all"
              title="Switch User Role View (Dev)"
            >
              <RoleIcon className="w-3.5 h-3.5 text-govt-orange" />
              <span className="hidden md:inline">{currentRoleMeta.label}</span>
              <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform duration-200 ease-out ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 text-xs font-medium border border-white/20">
              <RoleIcon className="w-3.5 h-3.5 text-govt-orange" />
              <span className="hidden md:inline">{currentRoleMeta.label}</span>
            </div>
          )}

          {import.meta.env.DEV && showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-md shadow-xl border border-slate-200 py-1 z-50 animate-dropdown-enter">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Role View (Dev)</span>
                <Layers className="w-3 h-3 text-govt-orange" />
              </div>
              
              <button
                onClick={() => { switchDemoRole && switchDemoRole('candidate'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${role === 'candidate' ? 'bg-blue-50 font-bold text-blue-900' : 'text-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Candidate / Trainee</span>
                </div>
                {role === 'candidate' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
              </button>

              <button
                onClick={() => { switchDemoRole && switchDemoRole('training_center'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition-colors ${role === 'training_center' ? 'bg-purple-50 font-bold text-purple-900' : 'text-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Training Center</span>
                </div>
                {role === 'training_center' && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
              </button>

              <button
                onClick={() => { switchDemoRole && switchDemoRole('government'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 transition-colors ${role === 'government' ? 'bg-amber-50 font-bold text-amber-900' : 'text-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-govt-orange" />
                  <span>Government Official</span>
                </div>
                {role === 'government' && <span className="w-2 h-2 rounded-full bg-govt-orange"></span>}
              </button>

              <button
                onClick={() => { switchDemoRole && switchDemoRole('employer'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${role === 'employer' ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Employer / Partner</span>
                </div>
                {role === 'employer' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button className="relative p-1.5 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition-colors" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-govt-orange animate-pulse"></span>
        </button>

        {/* User Profile Menu with Dynamic Identity */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-white/10 transition-all focus:outline-none"
            aria-label="User Account Menu"
          >
            <div className="w-8 h-8 rounded-full bg-govt-orange text-white font-bold flex items-center justify-center text-xs shadow font-mono">
              {avatarInitial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold leading-none">{userDisplayName}</div>
              <div className="text-[10px] text-blue-200 leading-tight mt-0.5 truncate max-w-[140px]">{userEmail}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-200 transition-transform duration-200 ease-out ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-md shadow-xl border border-slate-200 py-2 z-50 animate-dropdown-enter">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-800">{userDisplayName}</p>
                <p className="text-[11px] text-slate-500 truncate font-mono">{userEmail}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${currentRoleMeta.color}`}>
                    {role || 'candidate'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { signOut(); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

