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
  ArrowLeft,
  Award, 
  Target,
  Layers,
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Calendar,
  CreditCard,
  Briefcase
} from 'lucide-react';

export const CandidateOnboarding = ({ onOnboardingComplete }) => {
  const { user, role, refreshUser, updateCandidateProfile } = useAuth();
  const [tradeSkills, setTradeSkills] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const QUALIFICATIONS = [
    { id: '10th Pass (SSLC)', label: '10th Pass (SSLC)', desc: 'Secondary School Level' },
    { id: '12th Pass (HSC)', label: '12th Pass (HSC)', desc: 'Higher Secondary Level' },
    { id: 'ITI Machinist Certificate', label: 'ITI Certificate', desc: 'Machinist / Technical Trade' },
    { id: 'Diploma Electrical', label: 'Diploma Engineering', desc: 'Electrical / Electronics / Mech' },
    { id: 'B.Voc Vocational Degree', label: 'B.Voc Degree', desc: 'Vocational Bachelor Degree' }
  ];

  const GENDERS = ['Male', 'Female', 'Other'];

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

  const handleSelectField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.full_name.trim()) {
        setErrorMsg('Please enter your full legal name');
        return false;
      }
      if (!formData.email.trim()) {
        setErrorMsg('Please enter your email address');
        return false;
      }
      if (!formData.aadhaar_last4 || formData.aadhaar_last4.length !== 4) {
        setErrorMsg('Please provide the last 4 digits of your Aadhaar number');
        return false;
      }
    }
    setErrorMsg('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
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

      const { data: insertedCand, error: candError } = await supabase
        .from('candidates')
        .insert([candidatePayload])
        .select()
        .single();

      if (candError) {
        console.error('❌ Supabase candidates insert failed:', candError);
        throw new Error(`Database insert failed: ${candError.message}`);
      }

      if (updateCandidateProfile) {
        updateCandidateProfile(insertedCand);
      }

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
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Portal Banner */}
      <div className="bg-[#0B3D6B] border border-[#072847] text-white rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#D2691E] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#D2691E] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                  STEP-BY-STEP ONBOARDING
                </span>
                <span className="text-xs text-blue-200 font-medium">National Skill Development Registry</span>
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight mt-0.5">Candidate Skill Onboarding Portal</h1>
              <p className="text-xs text-slate-300">Complete the 3 quick steps below to generate your personalized skill roadmap.</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-blue-200 font-medium font-mono bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
            <span>Step {currentStep} of 3</span>
          </div>
        </div>
      </div>

      {/* Stepped Wizard Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Step Indicator Header Band */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Personal Demographics', desc: 'Identity & Details' },
              { num: 2, title: 'Qualifications & Trade', desc: 'Education & Skills' },
              { num: 3, title: 'Mobility & Expectations', desc: 'Location Preferences' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div 
                  key={step.num}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-white shadow-xs border border-slate-200' 
                      : isPast 
                        ? 'opacity-80' 
                        : 'opacity-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 transition-colors ${
                    isPast 
                      ? 'bg-emerald-600 text-white' 
                      : isActive 
                        ? 'bg-[#D2691E] text-white' 
                        : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isPast ? '✓' : step.num}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Header Line */}
        <div className="px-6 sm:px-8 pt-6 pb-2">
          {currentStep === 1 && (
            <div>
              <span className="sid-eyebrow">Step 1 • Demographics</span>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-1">Personal & Trainee Demographics</h2>
              <p className="text-xs text-slate-500">Provide your official identity info as recorded in government skill registries.</p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <span className="sid-eyebrow">Step 2 • Technical Background</span>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-1">Qualifications & Preferred Vocational Trade</h2>
              <p className="text-xs text-slate-500">Select your education level and vocational specialization to map competencies.</p>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <span className="sid-eyebrow">Step 3 • Placement Readiness</span>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-1">Mobility & Location Preferences</h2>
              <p className="text-xs text-slate-500">Specify your home state and preferred district for training and job matching.</p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mx-6 sm:mx-8 my-3 bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">{successMsg}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">Redirecting to your personalized Candidate Dashboard...</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 sm:mx-8 my-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Form Body */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-4 space-y-6">
          {/* STEP 1: PERSONAL DEMOGRAPHICS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="trainee@domain.com"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Aadhaar Verification (Last 4 Digits) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="aadhaar_last4"
                      maxLength={4}
                      value={formData.aadhaar_last4}
                      onChange={handleChange}
                      placeholder="e.g. 8842"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Used for NCVET Digilocker credential verification.</span>
                </div>
              </div>

              {/* Gender Selection Tile Cards */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Gender Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDERS.map((g) => {
                    const isSelected = formData.gender === g;
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => handleSelectField('gender', g)}
                        className={`p-3 rounded-lg border text-center transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#D2691E] bg-[#FDEEE0]/50 ring-1 ring-[#D2691E]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#D2691E]' : 'text-slate-700'}`}>
                          {g}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#D2691E] bg-[#D2691E]' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: QUALIFICATIONS & TRADE */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in-up">
              {/* Highest Qualification Tile Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Highest Education Level Completed *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {QUALIFICATIONS.map((q) => {
                    const isSelected = formData.qualification === q.id;
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => handleSelectField('qualification', q.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                          isSelected
                            ? 'border-[#D2691E] bg-[#FDEEE0]/40 ring-1 ring-[#D2691E] shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-[#D2691E]' : 'text-slate-400'}`} />
                            <p className={`text-xs font-bold ${isSelected ? 'text-[#D2691E]' : 'text-slate-800'}`}>{q.label}</p>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{q.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-[#D2691E] bg-[#D2691E]' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Trade Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Preferred Vocational Skill Trade *
                </label>
                <div className="relative">
                  <select
                    name="preferred_trade"
                    value={formData.preferred_trade}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-xs font-bold text-[#0B3D6B] rounded-lg p-2.5 focus:ring-1 focus:ring-[#0B3D6B]"
                  >
                    {tradeSkills.map((t, idx) => (
                      <option key={idx} value={t.trade_name}>{t.trade_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linked Trade Skills Preview Tile */}
              {selectedTradeObject && (
                <div className="p-4 rounded-xl bg-[#FDEEE0] border border-[#F8D3B8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#D2691E] bg-white px-2 py-0.5 rounded border border-[#F8D3B8]">
                      Curriculum Linked Competencies
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">Auto-mapped from NCVET</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{selectedTradeObject.trade_name}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTradeObject.skills?.map((s, idx) => (
                      <span key={idx} className="text-xs bg-white text-slate-800 border border-[#F8D3B8] px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 shadow-2xs">
                        <Target className="w-3 h-3 text-[#D2691E]" />
                        {s.skill_name || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MOBILITY & EXPECTATIONS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Home State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-800 focus:ring-1 focus:ring-[#0B3D6B]"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Home District / Preferred Center District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Pune"
                    className="w-full bg-white border border-slate-300 text-xs rounded-md p-2.5 text-slate-800 focus:ring-1 focus:ring-[#0B3D6B]"
                  />
                </div>
              </div>

              {/* Informational Callout Card */}
              <div className="p-4 rounded-xl bg-[#E8ECFB] border border-[#D1DBF7] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#0B3D6B] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-[#0B3D6B]">AI Job & Apprenticeship Matching Ready</p>
                  <p className="text-[11px] leading-relaxed">
                    By saving your profile, our system will automatically match your selected trade ({formData.preferred_trade}) with live apprenticeship and vacancy openings in {formData.district}, {formData.state}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
            {/* Left: Back Button */}
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-sid-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* Center: Progress Dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((dot) => (
                <div 
                  key={dot}
                  className={`h-2 rounded-full transition-all ${
                    currentStep === dot 
                      ? 'w-6 bg-[#D2691E]' 
                      : currentStep > dot 
                        ? 'w-2 bg-emerald-600' 
                        : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Right: Next or Submit Button */}
            <div>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-sid-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-sid-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Open Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
