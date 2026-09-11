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
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const Login = () => {
  const { signIn, switchDemoRole, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await signIn({ email, password });
      if (authError) {
        setError(authError.message || 'Invalid login credentials');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (targetRole) => {
    switchDemoRole(targetRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-roboto">
      {/* Govt Header Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-govt-navy flex items-center justify-center border-2 border-govt-orange shadow-lg">
          <span className="text-white font-bold text-lg tracking-wider">GOV</span>
        </div>
        <h2 className="text-2xl font-extrabold text-govt-navy font-roboto">
          NATIONAL SKILLING PORTAL
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Government of India • Role-Based Portal Access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-slate-200 sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Portal Email Address
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
                  placeholder="name@domain.gov.in"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-govt-navy focus:border-govt-navy"
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
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-govt-navy focus:border-govt-navy"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-govt-primary py-2 text-xs font-bold uppercase tracking-wider"
              >
                {loading ? 'Authenticating...' : 'Sign In with Supabase JWT'}
              </button>
            </div>
          </form>

          {/* Quick Interactive Role Switcher Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Instant Role Test Logins
              </span>
              <Sparkles className="w-3.5 h-3.5 text-govt-orange" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('candidate')}
                className="p-2.5 rounded border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 font-medium flex items-center gap-2 transition-all text-left"
              >
                <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="leading-tight text-[11px]">Trainee<br/><strong className="font-bold">Ananya Sharma</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('training_center')}
                className="p-2.5 rounded border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-900 font-medium flex items-center gap-2 transition-all text-left"
              >
                <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="leading-tight text-[11px]">TC Provider<br/><strong className="font-bold">Sunil Verma</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('government')}
                className="p-2.5 rounded border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 font-medium flex items-center gap-2 transition-all text-left"
              >
                <ShieldAlert className="w-4 h-4 text-govt-orange flex-shrink-0" />
                <span className="leading-tight text-[11px]">Govt Official<br/><strong className="font-bold">R. Deshmukh</strong></span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('employer')}
                className="p-2.5 rounded border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 font-medium flex items-center gap-2 transition-all text-left"
              >
                <Briefcase className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="leading-tight text-[11px]">Employer HR<br/><strong className="font-bold">Vikram Mehta</strong></span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs">
            <span className="text-slate-600">Don't have an account? </span>
            <Link to="/register" className="font-bold text-govt-navy hover:underline">
              Register New Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
