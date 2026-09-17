import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  KeyRound, 
  ArrowRight,
  UserCheck,
  Building2,
  Briefcase,
  ShieldAlert,
  X,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  RoleCandidateIllustration,
  RoleTrainingCenterIllustration,
  RoleEmployerIllustration,
  RoleGovernmentIllustration
} from '../components/common/TwoToneIllustrations';

const ROLE_OPTIONS = [
  {
    id: 'candidate',
    title: 'Candidate / Trainee',
    description: 'Take assessments, track training, and find verified jobs.',
    badge: 'Skill Seeker',
    icon: UserCheck,
    illustration: RoleCandidateIllustration,
    emailPlaceholder: 'candidate@domain.gov.in'
  },
  {
    id: 'training_center',
    title: 'Training Center Provider',
    description: 'Manage enrollments, batches, and trainee progress.',
    badge: 'Accredited TC',
    icon: Building2,
    illustration: RoleTrainingCenterIllustration,
    emailPlaceholder: 'provider@iti-hub.ac.in'
  },
  {
    id: 'employer',
    title: 'Employer / HR',
    description: 'Post vacancies and hire verified, skilled candidates.',
    badge: 'Industry Partner',
    icon: Briefcase,
    illustration: RoleEmployerIllustration,
    emailPlaceholder: 'hr.recruiter@company.com'
  },
  {
    id: 'government',
    title: 'Government Official',
    description: 'Audit programs, verify placements, and monitor outcomes.',
    badge: 'Ministry Auditor',
    icon: ShieldAlert,
    illustration: RoleGovernmentIllustration,
    emailPlaceholder: 'officer@msde.gov.in'
  }
];

export const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRole = searchParams.get('role');
  const validRoles = ['candidate', 'training_center', 'employer', 'government'];

  // Selected role state
  const [selectedRole, setSelectedRole] = useState(
    validRoles.includes(urlRole) ? urlRole : null
  );

  // Modal open state: starts open unless a valid role was passed in URL
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(
    !validRoles.includes(urlRole)
  );

  // Informational Terms / Privacy Modal State
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'terms' | 'privacy' | null

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const currentRoleObj = ROLE_OPTIONS.find(r => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleContinueRole = () => {
    if (!selectedRole) return;
    setIsRoleModalOpen(false);
    setSearchParams({ role: selectedRole });
  };

  const handleDismissModal = () => {
    // If the user clicks close (X) without selecting or when backing out of login, return to public landing page
    if (!urlRole) {
      navigate('/');
    } else {
      setIsRoleModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const activeRole = selectedRole || 'candidate';
      const { data, error: signInError } = await signIn({
        email,
        password,
        role: activeRole
      });

      if (signInError) {
        setError(signInError.message || 'Authentication failed. Please verify credentials.');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected system error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F7FA] font-sans overflow-hidden relative">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. SKILL INDIA DIGITAL HUB INSPIRED WELCOME ROLE MODAL         */}
      {/* ------------------------------------------------------------- */}
      {isRoleModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={handleDismissModal}
        >
          <div 
            className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto animate-fade-in-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Ministry Accent Header */}
            <div className="bg-[#0B3D6B] text-white px-6 py-4 flex items-center justify-between border-b border-[#072847]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[4px] bg-[#072847] border border-[#C9A227] flex items-center justify-center">
                  <span className="text-[#C9A227] font-bold text-[10px] tracking-wider font-mono">GOV</span>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#C9A227] font-bold">
                    भारत सरकार • GOVERNMENT OF INDIA
                  </p>
                  <p className="text-[11px] text-slate-200 font-medium">
                    National Skilling & Employment Portal
                  </p>
                </div>
              </div>

              {/* Close Button (X) -> returns to public landing page */}
              <button
                type="button"
                onClick={handleDismissModal}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Return to Public Landing Page"
                aria-label="Close and return to portal home"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Welcome Title & Role Cards */}
            <div className="p-5 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto">
              {/* Title & Subtitle */}
              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-[#0B3D6B] text-[10px] font-bold uppercase tracking-wider font-mono">
                  <ShieldCheck className="w-3 h-3 text-[#C9A227]" />
                  <span>Verified Single Sign-On Access</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome to National Skilling Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans">
                  Select how you'd like to access the portal.
                </p>
              </div>

              {/* 4 Selectable Role Cards (Radio-style Tiles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRole === role.id;
                  const Illustration = role.illustration;

                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`cursor-pointer rounded-xl p-5 text-left transition-all duration-200 relative flex flex-col justify-between border bg-white ${
                        isSelected
                          ? 'border-slate-300 ring-2 ring-[#D2691E]/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top row: Two-Tone Illustration & Radio Circle */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          <Illustration className="w-12 h-12" />
                        </div>

                        {/* Radio selection circle indicator in top-right corner */}
                        <div 
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#D2691E] bg-[#D2691E] shadow-xs'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      {/* Content: Title & One-Line Description */}
                      <div className="space-y-1">
                        <h3 className="font-display text-base font-bold text-slate-900 tracking-tight">
                          {role.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-snug font-sans">
                          {role.description}
                        </p>
                      </div>

                      {/* Bottom Category Tag */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Access Category:</span>
                        <span className="font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[4px]">
                          {role.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terms & Privacy Policy line */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>By choosing to continue, you agree to our </span>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('terms')}
                  className="font-semibold text-[#0B3D6B] hover:underline"
                >
                  Terms & Conditions
                </button>
                <span> and </span>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('privacy')}
                  className="font-semibold text-[#0B3D6B] hover:underline"
                >
                  Privacy Policy
                </button>
                <span>.</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDismissModal}
                className="btn-sid-secondary text-xs py-2 px-4"
              >
                Back to Public Portal
              </button>

              <button
                type="button"
                onClick={handleContinueRole}
                disabled={!selectedRole}
                className={`btn-sid-primary text-xs py-2 px-6 flex items-center gap-2 ${
                  selectedRole
                    ? ''
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. OPTIONAL TERMS & CONDITIONS / PRIVACY POLICY MODAL          */}
      {/* ------------------------------------------------------------- */}
      {activeLegalModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveLegalModal(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B3D6B]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeLegalModal === 'terms' ? 'Official Terms & Conditions' : 'Government Data & Privacy Policy'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 max-h-60 overflow-y-auto pr-1 leading-relaxed">
              {activeLegalModal === 'terms' ? (
                <>
                  <p>
                    1. <strong>Sovereign Usage:</strong> Access to the National Skilling Portal is governed by the Ministry of Skill Development and Entrepreneurship (MSDE).
                  </p>
                  <p>
                    2. <strong>Verification Compliance:</strong> All candidate skill assessments and employer vacancy postings are subject to independent NCVT audit.
                  </p>
                  <p>
                    3. <strong>Anti-Fraud Measures:</strong> Tampering with assessment results, attendance records, or placement verification is punishable under the IT Act 2000.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    1. <strong>Data Encryption:</strong> All candidate and partner records are encrypted in transit with 256-bit SSL and stored in compliant sovereign cloud zones.
                  </p>
                  <p>
                    2. <strong>Aadhaar & DigiLocker:</strong> Aadhaar numbers are masked; competency certificates are issued directly to candidate DigiLocker vaults.
                  </p>
                  <p>
                    3. <strong>Zero Commercial Sharing:</strong> Trainee contact details are shared strictly with verified employers for legitimate vacancy interviews.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="btn-govt-primary px-4 py-1.5 text-xs font-bold"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. LEFT PANEL: Sovereign Identity, Official Ministry Header     */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-1/2 min-h-[420px] lg:min-h-screen relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white bg-[#0B3D6B] border-r border-[#072847]">
        
        {/* Architectural Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #FFFFFF 1px, transparent 1px),
              linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Top Ministry Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#072847] border border-[#C9A227] flex items-center justify-center">
            <span className="text-[#C9A227] font-bold text-xs tracking-wider font-mono">GOV</span>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A227] font-bold">
              भारत सरकार • GOVERNMENT OF INDIA
            </p>
            <p className="text-xs text-slate-200 font-medium">
              Ministry of Skill Development & Entrepreneurship
            </p>
          </div>
        </div>

        {/* Center: Official Seal & Core Identity */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-start text-left">
          <div className="w-16 h-16 rounded-[6px] bg-[#072847] border-2 border-[#C9A227] flex flex-col items-center justify-center mb-5">
            <ShieldCheck className="w-7 h-7 text-[#C9A227] mb-0.5" />
            <span className="text-white font-bold text-[10px] tracking-wider font-mono">GOV.IN</span>
          </div>

          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#072847] border border-[#C9A227]/40 text-[#C9A227] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-[2px] bg-[#C9A227]" />
              <span>National Skilling & Employment Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              Verified Skills.<br />
              Verified Jobs.<br />
              <span className="text-[#C9A227]">Verified Impact.</span>
            </h1>
            <p className="text-xs text-slate-200 leading-relaxed max-w-md">
              A unified sovereign workforce platform connecting trainees, accredited training centers, verified employers, and government program auditors.
            </p>
          </div>
        </div>

        {/* Bottom Trust & Security Banner */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-300 gap-2">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C9A227]" /> 
            256-Bit SSL Encrypted Sovereign Gateway
          </span>
          <span className="text-slate-400 font-mono">ISO 27001 • Digital India</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RIGHT PANEL: Official Authentication Portal Form           */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-[#F4F7FA]">
        
        <div className="w-full max-w-md">
          {/* Clean Bordered White Card */}
          <div className="bg-white rounded-[6px] border border-slate-300 p-6 sm:p-8 relative">
            
            {/* Top Navy Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B3D6B] rounded-t-[5px]" />

            {/* Form Header */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  Official Sign-In
                </span>
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 font-mono">
                  <KeyRound className="w-3 h-3 text-[#C9A227]" /> Single Sign-On
                </span>
              </div>

              {/* Selected Role Indicator & Switch Button */}
              {selectedRole && (
                <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#FDEEE0] border border-[#F8D3B8]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#D2691E] text-white flex items-center justify-center shadow-xs">
                      {React.createElement(currentRoleObj.icon, { className: "w-4 h-4" })}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                        Accessing Workspace:
                      </span>
                      <strong className="text-xs text-[#D2691E] font-bold font-display">
                        {currentRoleObj.title}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(true)}
                    className="text-xs font-bold text-[#0B3D6B] hover:text-[#D2691E] hover:underline"
                  >
                    Change Role
                  </button>
                </div>
              )}

              <h2 className="font-display text-xl font-bold text-[#0B3D6B] tracking-tight pt-1">
                Portal Authentication
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Enter your registered credentials to access your official {currentRoleObj.title} workspace.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-[4px] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Portal Email Address
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
                    placeholder={currentRoleObj.emailPlaceholder || "name@domain.gov.in"}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-[4px] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#help" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#0B3D6B] hover:underline font-medium">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-[4px] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B3D6B] focus:border-[#0B3D6B]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-govt-primary py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-[2px] animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Secure Government Sign-In</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Navigation */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0B3D6B] font-medium">
                ← Public Portal
              </Link>
              <div>
                <span>Don't have an account? </span>
                <Link to="/register" className="font-bold text-[#0B3D6B] hover:underline">
                  Register
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
