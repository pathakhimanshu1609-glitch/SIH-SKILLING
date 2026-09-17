import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const Unauthorized = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
        {/* Top Sovereign Navy Bar */}
        <div className="h-1.5 w-full bg-[#0B3D6B] absolute top-0 left-0"></div>

        <div className="w-16 h-16 rounded-2xl bg-[#FDEEE0] text-[#D2691E] border border-[#F8D3B8] flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FDEEE0] text-[#8C3A00] px-3 py-1 rounded-full border border-[#F8D3B8]">
            Security Authorization Error
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900">403 - Restricted Role Access</h1>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            Your active session role is <strong className="uppercase font-bold text-[#0B3D6B] font-mono bg-[#E8ECFB] px-1.5 py-0.5 rounded">'{role}'</strong>. You do not have permission to view this specific government endpoint or administrative dashboard section.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link to="/dashboard" className="btn-sid-primary text-xs py-3 px-6 inline-flex items-center justify-center gap-2 shadow-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {role ? role.toUpperCase().replace('_', ' ') : 'USER'} Dashboard</span>
          </Link>
          <Link to="/" className="btn-sid-secondary text-xs py-2.5 px-6 inline-flex items-center justify-center gap-2 font-bold">
            <Home className="w-3.5 h-3.5 text-[#0B3D6B]" />
            <span>Back to Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
