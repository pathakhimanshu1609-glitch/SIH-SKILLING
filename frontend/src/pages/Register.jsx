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
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-roboto">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-govt-navy flex items-center justify-center border-2 border-govt-orange shadow-lg">
          <span className="text-white font-bold text-base tracking-wider">GOV</span>
        </div>
        <h2 className="text-2xl font-extrabold text-govt-navy font-roboto">
          Portal Profile Registration
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Create an official role-based account on the National Skilling Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-slate-200 sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Role Category
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRole('candidate')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRole === 'candidate'
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Candidate / Trainee</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">For trainees & skill seekers</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('training_center')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRole === 'training_center'
                      ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-600/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-purple-900">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Training Center</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">For ITI & Skill Hub providers</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('government')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRole === 'government'
                      ? 'border-govt-orange bg-amber-50/80 ring-2 ring-govt-orange/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-govt-orange" />
                    <span>Government Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">For ministry & state officials</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('employer')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRole === 'employer'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Employer / Industry</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">For hiring & job posting</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name / Official Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Ananya Sharma"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-1 focus:ring-govt-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Organization / Center Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Apex Tech Institute"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-1 focus:ring-govt-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-1 focus:ring-govt-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-1 focus:ring-govt-navy"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-govt-orange py-2 text-xs font-bold uppercase tracking-wider"
            >
              {loading ? 'Creating Account...' : `Register Profile as ${selectedRole.toUpperCase().replace('_', ' ')}`}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <span className="text-slate-600">Already registered? </span>
            <Link to="/login" className="font-bold text-govt-navy hover:underline">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
