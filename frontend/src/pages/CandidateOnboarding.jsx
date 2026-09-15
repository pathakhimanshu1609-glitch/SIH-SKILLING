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
  Target,
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
      // 1. Check if authenticated Supabase user exists with valid UUID in profiles
      let validUserId = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authUser.id)) {
          const { data: prof } = await supabase.from('profiles').select('id').eq('id', authUser.id).maybeSingle();
          if (prof) validUserId = authUser.id;
        }
      } catch (authErr) {
        console.warn('Auth check notice:', authErr);
      }

      // 2. Prepare payload for public.candidates insert
      const candidatePayload = {
        full_name: formData.full_name,
        email: formData.email,
        dob: formData.dob || '2004-05-15',
        gender: formData.gender || 'General',
        qualification: formData.qualification,
        preferred_trade: formData.preferred_trade,
        aadhaar_last4: formData.aadhaar_last4,
        state: formData.state,
        district: formData.district,
        status: 'Onboarded'
      };

      if (validUserId) {
        candidatePayload.user_id = validUserId;
      }

      console.log('Submitting candidate to Supabase candidates table:', candidatePayload);

      // 3. Direct insert into live Supabase candidates table
      const { data: insertedCand, error: candError } = await supabase
        .from('candidates')
        .insert([candidatePayload])
        .select()
        .single();

      if (candError) {
        console.error('❌ Supabase candidates insert failed:', candError);
        throw new Error(`Database insert failed: ${candError.message}`);
      }

      console.log('✅ Candidate successfully inserted into Supabase:', insertedCand);

      // 4. Update top-level AuthContext profile
      if (updateCandidateProfile) {
        updateCandidateProfile(insertedCand);
      }

      // 5. Notify backend API
      try {
        await fetchWithAuth('/api/portal/candidates/onboard', {
          method: 'POST',
          body: JSON.stringify({
            candidate_id: insertedCand.id,
            user_id: validUserId,
            ...candidatePayload
          })
        }, role);
      } catch (backendErr) {
        console.warn('Backend sync notice:', backendErr.message);
      }

      setSuccessMsg(`Onboarding complete! Candidate profile recorded in live database (ID: ${insertedCand.id}).`);

      if (refreshUser) await refreshUser();

      // Redirect to Candidate Dashboard after 1.5 seconds
      setTimeout(() => {
        if (onOnboardingComplete) {
          onOnboardingComplete(insertedCand);
        }
      }, 1500);

    } catch (err) {
      console.error('❌ Candidate Onboarding Submission Error:', err);
      setErrorMsg(err.message || 'Failed to submit candidate onboarding data');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTradeObject = tradeSkills.find(t => t.trade_name === formData.preferred_trade);

  return (
    <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12 font-sans">
      {/* Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-[6px] p-4 sm:p-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-govt-orange text-white flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-govt-orange text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-[4px]">
                REQUIRED ONBOARDING
              </span>
              <span className="text-xs text-blue-200 font-medium">Official Candidate Profile</span>
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight mt-0.5">Candidate Skill Onboarding Portal</h1>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identity */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-govt-navy" />
              <h2 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">1. Trainee Identification</h2>
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
                  placeholder="e.g. Rahul Sharma"
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
              <h2 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">2. Preferred Trade & Qualification</h2>
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
                    <span key={idx} className="text-xs bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1">
                      <Target className="w-3 h-3 text-govt-orange" />
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
              <h2 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">3. Location Details</h2>
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
              className="btn-sid-primary text-xs py-2.5 px-6 font-bold uppercase tracking-wider"
            >
              {submitting ? 'Saving Profile...' : 'Save Profile & Open Candidate Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
