import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Briefcase, 
  Lock, 
  Mail, 
  User, 
  AlertCircle
} from 'lucide-react';
import {
  RoleCandidateIllustration,
  RoleTrainingCenterIllustration,
  RoleGovernmentIllustration,
  RoleEmployerIllustration
} from '../components/common/TwoToneIllustrations';

export const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('candidate');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp({
        email,
        password,
        fullName,
        selectedRole,
        orgName
      });

      if (signUpError) {
        setError(signUpError.message || 'Registration failed');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-left sm:text-center space-y-1.5 px-4 sm:px-0">
        <div className="sm:mx-auto w-10 h-10 rounded-[6px] bg-[#0B3D6B] flex items-center justify-center border-2 border-[#C9A227]">
          <span className="text-[#C9A227] font-bold text-xs tracking-wider font-mono">GOV</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-[#0B3D6B]">
          Portal Profile Registration
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Create an official role-based account on the National Skilling Portal
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-6 px-5 sm:px-8 rounded-[8px] border border-slate-300 shadow-sm">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-[4px] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Role Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { id: 'candidate', title: 'Candidate / Trainee', desc: 'For trainees & skill seekers', illustration: RoleCandidateIllustration },
                  { id: 'training_center', title: 'Training Center', desc: 'For ITI & Skill Hub providers', illustration: RoleTrainingCenterIllustration },
                  { id: 'government', title: 'Government Admin', desc: 'For ministry & state officials', illustration: RoleGovernmentIllustration },
                  { id: 'employer', title: 'Employer / HR', desc: 'For corporate recruiters', illustration: RoleEmployerIllustration }
                ].map((item) => {
                  const isSelected = selectedRole === item.id;
                  const Illustration = item.illustration;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRole(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between bg-white ${
                        isSelected
                          ? 'border-slate-300 ring-2 ring-[#D96B27]/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Illustration className="w-9 h-9" />
                          </div>
                          <div>
                            <span className="font-display font-bold text-slate-900 block leading-tight">{item.title}</span>
                            <span className="text-[11px] text-slate-500 font-sans">{item.desc}</span>
                          </div>
                        </div>

                        {/* Top-Right Circular Radio Indicator */}
                        <div 
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#D96B27] bg-[#D96B27]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name / Official Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Rahul Sharma"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-[4px] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Organization / Center Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Apex Tech Institute"
                  className="w-full px-3 py-2 border border-slate-300 rounded-[4px] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-[4px] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-[4px] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-govt-primary py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              {loading ? 'Creating Account...' : `Register Profile as ${selectedRole.toUpperCase().replace('_', ' ')}`}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs">
            <span className="text-slate-600">Already registered? </span>
            <Link to="/login" className="font-bold text-[#0B3D6B] hover:underline">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
