import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  const { role, switchDemoRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-roboto">
      <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-slate-800">403 - Restricted Role Access</h1>
        
        <p className="text-xs text-slate-600 leading-relaxed">
          Your active role is <strong className="uppercase font-bold text-govt-navy">'{role}'</strong>. You do not have permission to view this specific government endpoint or administrative dashboard section.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link to="/dashboard" className="btn-govt-primary text-xs py-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {role?.toUpperCase().replace('_', ' ')} Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
