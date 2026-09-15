import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  const { role, switchDemoRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 shadow-md p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
            Security Authorization Error
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900">403 - Restricted Role Access</h1>
          
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            Your active session role is <strong className="uppercase font-bold text-govt-navy">'{role}'</strong>. You do not have permission to view this specific government endpoint or administrative dashboard section.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link to="/dashboard" className="btn-sid-primary text-sm py-3 px-6 inline-flex items-center justify-center gap-2 shadow-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {role?.toUpperCase().replace('_', ' ')} Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
