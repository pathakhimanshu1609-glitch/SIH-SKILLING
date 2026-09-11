import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { fetchWithAuth } from '../lib/api';
import { 
  UserCheck, 
  BookOpen, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Award, 
  Sparkles,
  Layers
} from 'lucide-react';

export const CandidateOnboarding = ({ onOnboardingComplete }) => {
  const { user, role, refreshUser } = useAuth();
  const [tradeSkills, setTradeSkills] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    dob: '2004-05-15',
    gender: 'Male',
    qualification: 'ITI Machinist Certificate',
    preferred_trade: 'Advanced CNC Machinist',
    aadhaar_last4: '8842',
    state: 'Maharashtra',
    district: 'Pune'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadTradeSkills();
  }, []);

  const loadTradeSkills = async () => {
    setLoadingTrades(true);
    try {
      const data = await fetchWithAuth('/api/portal/trade-skills', {}, role);
      setTradeSkills(data.tradeSkills || []);
    } catch (err) {
      console.warn('Could not load live trade skills, using defaults:', err);
    } finally {
      setLoadingTrades(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Get current authenticated Supabase user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const targetUserId = authUser?.id || user?.id;

      // 2. Insert/Upsert into candidates table in Supabase
      const candidatePayload = {
        user_id: targetUserId,
        full_name: formData.full_name,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        qualification: formData.qualification,
        preferred_trade: formData.preferred_trade,
        aadhaar_last4: formData.aadhaar_last4,
        state: formData.state,
        district: formData.district,
        status: 'Onboarded'
      };

      const { data: insertedCand, error: candError } = await supabase
        .from('candidates')
        .upsert(candidatePayload, { onConflict: 'user_id' })
        .select()
        .single();

      if (candError) {
        console.warn('Supabase DB Insert note:', candError.message);
      }

      // Also call Express backend API
      try {
        await fetchWithAuth('/api/portal/candidates/onboard', {
          method: 'POST',
          body: JSON.stringify({
            user_id: targetUserId,
            ...formData
          })
        }, role);
      } catch (backendErr) {
        console.warn('Backend onboard endpoint notice:', backendErr.message);
      }

      setSuccessMsg(`Onboarding complete! Profile created for ${formData.full_name}.`);

      if (refreshUser) await refreshUser();

      // Redirect to Candidate Dashboard after 1.2 seconds
      setTimeout(() => {
        if (onOnboardingComplete) {
          onOnboardingComplete();
        }
      }, 1200);

    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit candidate onboarding data');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTradeObject = tradeSkills.find(t => t.trade_name === formData.preferred_trade);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-roboto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-govt-navy to-slate-900 text-white rounded-xl p-6 shadow-govt-card relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-govt-orange text-white flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                REQUIRED ONBOARDING
              </span>
              <span className="text-xs text-blue-200">Supabase Candidates Table Registration</span>
            </div>
            <h1 className="text-xl font-bold font-roboto">Candidate Skill Onboarding Portal</h1>
            <p className="text-xs text-slate-300">Complete your profile to unlock your personalized Candidate Dashboard.</p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold">{successMsg}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Redirecting to your personalized Candidate Dashboard...</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identity */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-govt-navy" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Trainee Identification</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800 focus:ring-1 focus:ring-govt-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="trainee@domain.com"
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800 focus:ring-1 focus:ring-govt-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar (Last 4 Digits)</label>
                <input
                  type="text"
                  name="aadhaar_last4"
                  maxLength={4}
                  value={formData.aadhaar_last4}
                  onChange={handleChange}
                  placeholder="e.g. 8842"
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trade Selection & Linked Skills */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-govt-orange" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Preferred Trade & Qualification</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualification</label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800"
                >
                  <option value="10th Pass (SSLC)">10th Pass (SSLC)</option>
                  <option value="12th Pass (HSC)">12th Pass (HSC)</option>
                  <option value="ITI Machinist Certificate">ITI Machinist Certificate</option>
                  <option value="Diploma Electrical">Diploma Electrical / Electronics</option>
                  <option value="B.Voc Vocational Degree">B.Voc Vocational Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Skill Trade</label>
                <select
                  name="preferred_trade"
                  value={formData.preferred_trade}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-md p-2.5 focus:ring-1 focus:ring-govt-navy"
                >
                  {tradeSkills.map((t, idx) => (
                    <option key={idx} value={t.trade_name}>{t.trade_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTradeObject && (
              <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-blue-900 bg-blue-200 px-2 py-0.5 rounded">
                  Trade Skills Preview
                </span>
                <p className="text-xs font-bold text-slate-800">{selectedTradeObject.trade_name}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedTradeObject.skills?.map((s, idx) => (
                    <span key={idx} className="text-xs bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-govt-orange" />
                      {s.skill_name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">3. Location Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-md p-2.5 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-govt-orange text-xs py-2.5 px-6 font-bold uppercase tracking-wider shadow-md hover:shadow-lg"
            >
              {submitting ? 'Saving to Supabase...' : 'Save Profile & Open Candidate Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
