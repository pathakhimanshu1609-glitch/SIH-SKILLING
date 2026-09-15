import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  Phone, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Cpu, 
  Sun, 
  BatteryCharging, 
  Wrench, 
  ExternalLink,
  Users,
  Clock,
  Send,
  HelpCircle,
  FileCheck,
  TrendingUp,
  X,
  GraduationCap,
  Compass,
  Play,
  Sparkles,
  BookOpen,
  Bot,
  RotateCcw,
  Volume2,
  Search,
  Globe,
  Eye,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { FloatingActionStack } from '../components/common/FloatingActionStack';
import { useCountUp } from '../hooks/useCountUp';

const ROLE_OPTIONS = [
  {
    id: 'candidate',
    title: 'Candidate / Trainee',
    subtitle: 'Skill Seeker',
    description: 'Take assessments, track training, and find verified jobs.',
    avatar: '/images/role-candidate.jpg',
    badge: 'NCVT Trainee'
  },
  {
    id: 'training_center',
    title: 'Training Center Provider',
    subtitle: 'Accredited Center',
    description: 'Manage enrollments, batches, and trainee progress.',
    avatar: '/images/role-trainer.jpg',
    badge: 'Grade A TC'
  },
  {
    id: 'employer',
    title: 'Employer / HR',
    subtitle: 'Industry Partner',
    description: 'Post vacancies and hire verified, skilled candidates.',
    avatar: '/images/role-employer.jpg',
    badge: 'Hiring Lead'
  },
  {
    id: 'government',
    title: 'Government Official',
    subtitle: 'Ministry Auditor',
    description: 'Audit programs, verify placements, and monitor outcomes.',
    avatar: '/images/role-official.jpg',
    badge: 'MSDE Officer'
  }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [landingData, setLandingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search filter in navbar
  const [searchQuery, setSearchQuery] = useState('');

  // Welcome Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('candidate');

  // Accessibility settings state
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1, 0, 1
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Enrollment / Counseling Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: 'Pune',
    trade: 'Advanced CNC Machinist',
    notes: ''
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  // Selected trade for 'Learn more' modal
  const [selectedTradeModal, setSelectedTradeModal] = useState(null);

  // Persona Selection State
  const [personaTrade, setPersonaTrade] = useState('Advanced CNC Machinist');
  const [personaDistrict, setPersonaDistrict] = useState('Pune');

  // Interactive Quiz State
  const [quizEducation, setQuizEducation] = useState('12th Standard / Higher Secondary');
  const [quizInterest, setQuizInterest] = useState('Precision CNC Machining & Fabrication');
  const [quizResult, setQuizResult] = useState(null);

  // Video Success Story Modal State
  const [activeStoryModal, setActiveStoryModal] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Animated KPI numbers
  const countPlacementRate = useCountUp(86, 900);
  const countRetentionRate = useCountUp(92, 900);
  const countStipend = useCountUp(2500, 900);
  const countDays = useCountUp(365, 800);

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      const res = await fetch('/api/portal/public/landing-data');
      if (res.ok) {
        const data = await res.json();
        setLandingData(data);
        if (data.trades && data.trades.length > 0) {
          setFormData(prev => ({
            ...prev,
            trade: prev.trade || data.trades[0].trade_name
          }));
        }
      }
    } catch (err) {
      console.warn('Could not load dynamic landing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadError('');
    setLeadSuccess(false);

    try {
      const res = await fetch('/api/portal/public/enrollment-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSuccess(true);
        setFormData({
          name: '',
          phone: '',
          district: 'Pune',
          trade: 'Advanced CNC Machinist',
          notes: ''
        });
      } else {
        setLeadError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setLeadError('Network error. Please check your connection.');
    } finally {
      setSubmittingLead(false);
    }
  };

  const getTradeIcon = (iconName) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[#0B3D6B]" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-[#D96B27]" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-5 h-5 text-[#0B3D6B]" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-[#0B3D6B]" />;
      default:
        return <Wrench className="w-5 h-5 text-[#0B3D6B]" />;
    }
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContinueRole = () => {
    setIsRoleModalOpen(false);
    navigate(`/login?role=${selectedRole}`);
  };

  const trades = landingData?.trades || [
    {
      trade_name: 'Advanced CNC Machinist',
      icon: 'Cpu',
      code: 'NCVT Level 5',
      duration: '6 Months Full-Time',
      description: 'Precision computer numerical control programming, multi-axis lathe machine calibration, and automated precision fabrication.',
      stipend: '₹ 2,500 / mo Govt DBT Stipend',
      skills: ['G-Code CNC Programming', 'Lathe Machine Calibration', 'Precision Quality Tolerances'],
      careerOutcomes: ['CNC Operator', 'VMC Programmer', 'Quality Calibration Inspector']
    },
    {
      trade_name: 'Solar PV Installer & Technician',
      icon: 'Sun',
      code: 'NCVT Level 4',
      duration: '4 Months Practical',
      description: 'Photovoltaic rooftop array installation, grid-tied inverter commissioning, high-voltage DC safety protocols, and solar farm maintenance.',
      stipend: '₹ 2,000 / mo Govt DBT Stipend',
      skills: ['Solar Array DC Wiring', 'Grid Inverter Installation', 'Grounding & High Voltage Safety'],
      careerOutcomes: ['Solar Lead Technician', 'PV Grid Engineer', 'Renewable Energy O&M']
    },
    {
      trade_name: 'EV Battery Maintenance Specialist',
      icon: 'BatteryCharging',
      code: 'NSQF Level 5',
      duration: '5 Months Hybrid',
      description: 'Electric vehicle lithium-ion pack diagnostics, BMS sensor calibration, cell balancing, and high-voltage vehicle safety.',
      stipend: '₹ 3,000 / mo Govt DBT Stipend',
      skills: ['Lithium Pack Diagnostics', 'BMS Sensor Calibration', 'Thermal Runaway Management'],
      careerOutcomes: ['EV Diagnostics Specialist', 'BMS Calibration Tech', 'EV Service Lead']
    },
    {
      trade_name: 'Industrial Automation & Robotics Technician',
      icon: 'Bot',
      code: 'NCVT Level 5',
      duration: '6 Months Practical',
      description: 'Articulated industrial robot trajectory programming, PLC sensor interfacing, robotic cell safety, and automated manufacturing lines.',
      stipend: '₹ 3,000 / mo Govt DBT Stipend',
      skills: ['Industrial Robotics Programming', 'PLC & Sensor Interfacing', 'Robotic Arm Calibration'],
      careerOutcomes: ['Robotic Cell Specialist', 'PLC Automation Tech', 'Mechatronics Engineer']
    }
  ];

  const partners = [
    { name: 'Ministry of Skill Development & Entrepreneurship', code: 'MSDE', type: 'Central Ministry' },
    { name: 'National Skill Development Corporation', code: 'NSDC', type: 'Skilling Agency' },
    { name: 'Directorate General of Training', code: 'DGT', type: 'Curriculum & Standard' },
    { name: 'National Council for Vocational Training', code: 'NCVT', type: 'Accrediting Board' },
    { name: 'Tata Motors', code: 'Tata Motors', type: 'Automotive' },
    { name: 'Larsen & Toubro Heavy Engineering', code: 'L&T Heavy Engg', type: 'Manufacturing' },
    { name: 'Bosch India', code: 'Bosch', type: 'Industrial Tech' },
    { name: 'Schneider Electric', code: 'Schneider', type: 'Clean Energy' },
    { name: 'Mahindra Susten', code: 'Mahindra Susten', type: 'Solar Infrastructure' },
    { name: 'Adani Green Energy', code: 'Adani Green', type: 'Renewables' },
    { name: 'Siemens India', code: 'Siemens', type: 'Automation' },
    { name: 'ABB Robotics', code: 'ABB India', type: 'Robotics' }
  ];

  const pillars = [
    {
      id: 'pillar-skills',
      title: 'Verified Skills',
      icon: Award,
      badge: 'NCVT Certified',
      description: 'Standardized pre/post hands-on MCQ assessments and practical machine shop calibrations mapped directly to National Occupational Standards.',
      metric: '100% NCVT Aligned'
    },
    {
      id: 'pillar-jobs',
      title: 'Verified Jobs',
      icon: Briefcase,
      badge: 'NCS Integrated',
      description: '180+ live employer vacancies confirmed directly by corporate HR departments with transparent salary bands and zero false placements.',
      metric: '86% Placement Rate'
    },
    {
      id: 'pillar-impact',
      title: 'Verified Impact',
      icon: TrendingUp,
      badge: 'Longitudinal Audit',
      description: 'Transparent retention tracking at 30, 90, 180, and 365 days post-placement, providing sustained trainee welfare and wage growth records.',
      metric: '92% 6-Mo Retention'
    }
  ];

  const videoStories = [
    {
      id: 'video-01',
      candidate_name: 'Rahul Sharma',
      batch: 'Batch of 2026',
      trade: 'Advanced CNC Machinist',
      employer: 'L&T Heavy Engineering',
      district: 'Ahmedabad',
      verified_salary: '₹ 25,000 / month',
      thumbnail: '/images/story-cnc.jpg',
      duration: '2:45 Min',
      credential_id: 'NCVT-CNC-2026-AHM-0419',
      story_title: 'From Rural ITI to Precision CNC Lathe Programmer',
      quote: 'Operating multi-axis CNC machines felt intimidating until the practical workshop drills. L&T verified my certificate through DigiLocker on interview day.',
      summary: 'Completed 6 months of G-code programming and spindle calibration. Post-assessment scored 85%, placed directly as a Junior Lathe Operator with confirmed salary uplifts.',
      timeline: [
        { phase: 'Baseline Pre-Assessment', score: '42%', note: 'Basic mechanical concepts' },
        { phase: 'Shop-Floor Workshop', duration: '6 Months', note: 'G-Code & Lathe calibration' },
        { phase: 'NCVT Post-Assessment', score: '85%', note: 'Certified Competency Level 5' },
        { phase: 'Direct Placement', employer: 'L&T Heavy Engineering', note: 'Confirmed with ₹25,000/mo CTC' }
      ]
    },
    {
      id: 'video-02',
      candidate_name: 'Pooja Patel',
      batch: 'Batch of 2026',
      trade: 'Solar PV Installer & Technician',
      employer: 'Mahindra Susten',
      district: 'Pune',
      verified_salary: '₹ 28,000 / month',
      thumbnail: '/images/story-solar.jpg',
      duration: '3:10 Min',
      credential_id: 'NCVT-SOLAR-2026-PUN-0882',
      story_title: 'Leading Utility Rooftop Solar Installations in Maharashtra',
      quote: 'Hands-on grid inverter commissioning and high-voltage DC safety training made me completely field-ready for utility-scale solar farms.',
      summary: 'Trained on 1000V DC wiring, solar array tilt optimization, and anti-islanding inverter protections. Placed at Mahindra Susten with confirmed 90-day retention.',
      timeline: [
        { phase: 'Baseline Pre-Assessment', score: '40%', note: 'General electrical background' },
        { phase: 'Solar Array Practical', duration: '4 Months', note: 'DC stringing & Inverter setup' },
        { phase: 'NCVT Post-Assessment', score: '82%', note: 'Certified Competency Level 4' },
        { phase: 'Direct Placement', employer: 'Mahindra Susten', note: 'Retained & Audited at Day 90' }
      ]
    }
  ];

  const handleQuizSubmit = (e) => {
    e?.preventDefault();
    let recommended = trades[0];
    if (quizInterest.includes('Solar') || quizInterest.includes('Renewable')) {
      recommended = trades.find(t => t.trade_name.includes('Solar')) || recommended;
    } else if (quizInterest.includes('Battery') || quizInterest.includes('EV')) {
      recommended = trades.find(t => t.trade_name.includes('EV')) || recommended;
    } else if (quizInterest.includes('Robotics') || quizInterest.includes('Automation')) {
      recommended = trades.find(t => t.trade_name.includes('Automation')) || recommended;
    }
    setQuizResult({
      ...recommended,
      educationMatch: quizEducation,
      interestMatch: quizInterest,
      matchPercentage: 96,
      salaryRange: recommended.trade_name.includes('Robotics') ? '₹26,000 - ₹34,000 / mo' : (recommended.trade_name.includes('Solar') ? '₹22,000 - ₹28,000 / mo' : '₹24,000 - ₹30,000 / mo')
    });
  };

  const resetQuiz = () => {
    setQuizResult(null);
  };

  const openStoryModal = (story) => {
    setActiveStoryModal(story);
    setIsVideoPlaying(true);
  };

  const closeStoryModal = () => {
    setActiveStoryModal(null);
    setIsVideoPlaying(false);
  };

  const centers = landingData?.training_centers || [
    {
      id: 'tc-01',
      name: 'Apex Industrial Training Institute',
      code: 'TC-MH-PUNE-0042',
      location: 'Pune, Maharashtra',
      district: 'Pune',
      affiliation_badge: 'NCVT Grade A Accredited',
      candidates_trained_formatted: '144+ Candidates Trained',
      trades: ['Advanced CNC Machinist', 'Solar PV Installer & Technician']
    },
    {
      id: 'tc-02',
      name: 'Western Machinist Academy',
      code: 'TC-MH-NSK-0019',
      location: 'Nashik, Maharashtra',
      affiliation_badge: 'NSQF Level 5 Center',
      candidates_trained_formatted: '89+ Candidates Trained',
      trades: ['Advanced CNC Machinist']
    },
    {
      id: 'tc-03',
      name: 'Deccan Green Energy Skill Center',
      code: 'TC-KA-BLR-0081',
      location: 'Bengaluru, Karnataka',
      affiliation_badge: 'Green Mission Partner',
      candidates_trained_formatted: '65+ Candidates Trained',
      trades: ['Solar PV Installer & Technician', 'EV Battery Maintenance Specialist']
    },
    {
      id: 'tc-04',
      name: 'Gujarat Industrial Automation Institute',
      code: 'TC-GJ-AMD-0035',
      location: 'Ahmedabad, Gujarat',
      affiliation_badge: 'Industry 4.0 COE',
      candidates_trained_formatted: '93+ Candidates Trained',
      trades: ['Advanced CNC Machinist', 'EV Battery Maintenance Specialist']
    }
  ];

  const verifiedMetrics = landingData?.verified_metrics || {
    placement_rate_label: '86%',
    average_salary_uplift_label: '₹ 20,250',
    average_placed_salary_label: '₹ 26,250 / mo',
    retention_rate_label: '92% 6-Month Retention',
    trust_badge: 'DATA SOURCE: EMPLOYER-VERIFIED employment_records (Multi-Party Confirmed, Not Self-Reported Alone)'
  };

  const successStories = landingData?.success_stories || [
    {
      id: 'story-01',
      candidate_name: 'Rahul S.',
      batch_year: 'Batch of 2026',
      trade: 'Advanced CNC Machinist',
      district: 'Pune',
      employer: 'Tata Advanced Engineering Solutions',
      verified_salary: '₹ 25,000 / month',
      status: 'Employer Confirmed & Day 30 Check-In Complete',
      quote: 'The direct hands-on G-code training and NCVT certification gave me immediate confidence on the shop floor. My placement was confirmed by HR within 2 weeks of post-assessment.'
    },
    {
      id: 'story-02',
      candidate_name: 'Pooja P.',
      batch_year: 'Batch of 2026',
      trade: 'Solar PV Installer & Technician',
      district: 'Pune',
      employer: 'Mahindra Susten Renewable Energy',
      verified_salary: '₹ 28,000 / month',
      status: 'Employer Confirmed & Retained',
      quote: 'Learning DC grid wiring and safety standards aligned exactly with utility-scale solar projects. My verified credential in DigiLocker made verification instant.'
    },
    {
      id: 'story-03',
      candidate_name: 'Amit V.',
      batch_year: 'Batch of 2026',
      trade: 'Advanced CNC Machinist',
      district: 'Nashik',
      employer: 'Tata Advanced Engineering Solutions',
      verified_salary: '₹ 22,500 / month',
      status: 'Placed & 30-Day Check-in Verified',
      quote: 'From zero machining background to operating precision lathes. The longitudinal check-in system keeps my training center in touch with my career growth.'
    }
  ];

  return (
    <div className={`min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#0B3D6B] selection:text-white ${isHighContrast ? 'contrast-125' : ''}`}>
      
      {/* ------------------------------------------------------------- */}
      {/* 1. SOVEREIGN ACCESSIBILITY & UTILITY BAR (SKILL INDIA STYLE)   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#072847] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-white/10 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Left: Indian Tricolor Flag + Official Sovereign Label */}
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide">
            {/* Indian Flag SVG Badge */}
            <span className="inline-flex flex-col w-4 h-3 rounded-[1px] overflow-hidden border border-white/30 flex-shrink-0 shadow-2xs">
              <span className="h-1 bg-[#FF9933] w-full" />
              <span className="h-1 bg-white w-full flex items-center justify-center">
                <span className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
              </span>
              <span className="h-1 bg-[#138808] w-full" />
            </span>
            <span className="font-semibold text-white">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Government of India</span>
            <span className="hidden md:inline-block text-slate-400">•</span>
            <span className="hidden md:inline-block text-slate-300 text-[10px]">Ministry of Skill Development & Entrepreneurship</span>
          </div>

          {/* Right: Location, Screen Reader, Font Controls, Language */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-300 font-medium">
            <div className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-[#D96B27]" />
              <span>National | All Districts</span>
            </div>

            <button 
              onClick={() => alert("Screen reader accessibility mode is enabled by default with full ARIA semantic markup.")}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              title="Screen Reader Accessibility"
            >
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Screen Reader</span>
            </button>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
              <button
                onClick={() => setFontSizeLevel(-1)}
                className={`px-1 text-[10px] font-bold hover:text-white ${fontSizeLevel === -1 ? 'text-[#D96B27] font-extrabold' : ''}`}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel(0)}
                className={`px-1 text-[10px] font-bold hover:text-white ${fontSizeLevel === 0 ? 'text-[#D96B27] font-extrabold' : ''}`}
                title="Default Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel(1)}
                className={`px-1 text-[10px] font-bold hover:text-white ${fontSizeLevel === 1 ? 'text-[#D96B27] font-extrabold' : ''}`}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border transition-colors ${
                isHighContrast ? 'bg-[#D96B27] text-white border-[#D96B27]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title="Toggle High Contrast"
            >
              A
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>{selectedLanguage}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 top-6 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 w-28 text-xs font-semibold animate-dropdown-enter">
                  {['English', 'हिंदी', 'मराठी', 'ગુજરાતી'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLanguage(lang); setIsLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 ${selectedLanguage === lang ? 'text-[#D96B27] font-bold bg-amber-50' : ''}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN NAVIGATION HEADER WITH SEARCH PILL & SID PRIMARY CTA   */}
      {/* ------------------------------------------------------------- */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2">
            
            {/* National Emblem & Title Block */}
            <Link to="/" className="flex items-center gap-3.5 group text-left">
              <div className="w-11 h-11 rounded-xl bg-[#0B3D6B] text-white flex items-center justify-center font-bold tracking-wider text-xs border-2 border-[#D96B27] flex-shrink-0 font-mono shadow-xs group-hover:scale-102 transition-transform">
                GOV
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base sm:text-lg font-bold text-[#0B3D6B] tracking-tight leading-none uppercase">
                    National Skilling Portal
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27] bg-[#FFF5EE] border border-[#D96B27]/40 px-2 py-0.5 rounded-md">
                    SID Hub
                  </span>
                </div>
                <p className="text-xs text-slate-500 tracking-normal mt-0.5">
                  Ministry of Skill Development & Entrepreneurship
                </p>
              </div>
            </Link>

            {/* Middle: Pill-Shaped Search Input */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Skill Centre, Course or Trade..."
                className="rounded-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40 focus:bg-white w-56 lg:w-72 transition-all font-sans"
              />
            </div>

            {/* Nav Links & Sign In CTA */}
            <nav className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700">
              <button 
                onClick={() => scrollToSection('schemes')}
                className="hidden lg:inline-block hover:text-[#0B3D6B] transition-colors"
              >
                Skilling Schemes
              </button>
              <button 
                onClick={() => scrollToSection('centers')}
                className="hidden lg:inline-block hover:text-[#0B3D6B] transition-colors"
              >
                Partner Centers
              </button>
              <button 
                onClick={() => scrollToSection('verified-outcomes')}
                className="hidden md:inline-block hover:text-[#0B3D6B] transition-colors"
              >
                Verified Outcomes
              </button>
              <button 
                onClick={() => scrollToSection('counseling')}
                className="hidden sm:inline-block text-[#0B3D6B] font-bold hover:underline"
              >
                Free Counseling
              </button>

              {/* Portal Sign In Button - Opens Welcome/Role Modal */}
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="btn-sid-primary text-xs py-2 px-4 shadow-sm inline-flex items-center gap-1.5 font-bold"
              >
                <span>Portal Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. SKILL INDIA DIGITAL WELCOME / ROLE SELECTION MODAL          */}
      {/* ------------------------------------------------------------- */}
      {isRoleModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setIsRoleModalOpen(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto relative transform transition-all duration-300 scale-100 opacity-100 animate-dropdown-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navy Banner Header */}
            <div className="bg-[#0B3D6B] text-white p-6 sm:p-7 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-200 text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D96B27]"></span>
                  <span>Skill India Digital Hub</span>
                </div>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome to National Skilling Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-lg">
                Select your persona to access tailored assessments, verified employment registries, or sovereign audit dashboards.
              </p>
            </div>

            {/* 4 Radio-Style Persona Cards with Photo Avatars */}
            <div className="p-6 sm:p-7 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`cursor-pointer rounded-xl p-4 text-left transition-all duration-200 relative flex flex-col justify-between border bg-white ${
                        isSelected
                          ? 'border-[#D96B27] ring-2 ring-[#D96B27]/30 shadow-md bg-amber-50/20'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Row: Circular Photo Avatar & Radio Selection Indicator */}
                      <div className="flex items-start justify-between mb-3">
                        <img 
                          src={role.avatar} 
                          alt={role.title} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shadow-xs flex-shrink-0"
                          loading="eager"
                        />

                        {/* SID Radio Dot Indicator */}
                        <div 
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#D96B27] bg-[#D96B27] shadow-xs'
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                            {role.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">
                          {role.description}
                        </p>
                      </div>

                      {/* Bottom Badge Tag */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Role:</span>
                        <span className="font-mono font-semibold text-[#0B3D6B] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {role.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 sm:px-7 py-4 flex items-center justify-between">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="btn-sid-secondary text-xs py-2 px-4"
              >
                Back to Public Portal
              </button>

              <button
                onClick={handleContinueRole}
                className="btn-sid-primary text-xs py-2.5 px-6 flex items-center gap-2 font-bold shadow-sm"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. FULL-BLEED PHOTOGRAPHY HERO WITH SLOW KEN-BURNS ZOOM        */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-slate-300 py-24 sm:py-28 lg:py-32 overflow-hidden bg-[#072847]">
        {/* Full Bleed Background Image with Ken-Burns Motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src="/images/hero-training.jpg" 
            alt="Indian trainees actively training on precision CNC machines and electrical panels" 
            className="w-full h-full object-cover object-center animate-kenburns opacity-35"
            loading="eager"
          />
        </div>

        {/* Multi-Stop Sovereign Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#072847]/95 via-[#0B3D6B]/90 to-[#072847]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Asymmetric Floating Content */}
            <div className="lg:col-span-7 text-left space-y-7">
              {/* NCVT Accredited Network badge with pulse indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D96B27]/40 bg-white/10 text-amber-200 text-xs font-semibold backdrop-blur-xs animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-pulse"></span>
                <span>National Council for Vocational Training (NCVT) Accredited Skilling Portal</span>
              </div>

              {/* Main Headline with Staggered Entrance */}
              <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-white tracking-tight leading-[1.12]">
                  Verified skills. <span className="text-[#D96B27] underline decoration-[#D96B27]/40 underline-offset-8">Verified jobs.</span> Verified impact.
                </h1>
                <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-normal">
                  India's unified vocational framework connecting accredited training centers, candidate competencies, and employer job placement through auditable longitudinal verification.
                </p>
              </div>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3.5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <button
                  onClick={() => scrollToSection('counseling')}
                  className="btn-sid-primary py-3.5 px-7 text-sm font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <span>Enroll in Free Training</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => scrollToSection('schemes')}
                  className="btn-sid-secondary bg-white/10 hover:bg-white/20 text-white border-white/40 py-3.5 px-6 text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Explore Skilling Schemes</span>
                  <ChevronRight className="w-4 h-4 text-[#D96B27]" />
                </button>

                <button
                  onClick={() => scrollToSection('quiz-section')}
                  className="text-amber-200 hover:text-white text-xs font-semibold py-2 px-3 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#D96B27]" />
                  <span>Take Guidance Quiz</span>
                </button>
              </div>

              {/* Trust Highlights Bar with 4 Animated Numeric Stat Cards */}
              <div className="pt-8 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-left">
                <div 
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/20 shadow-xs animate-fade-in-up hover:-translate-y-0.5 transition-all" 
                  style={{ animationDelay: '100ms' }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white font-mono">100%</p>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">NCVT Aligned</p>
                  <span className="text-[10px] text-amber-300/80 block mt-1">Direct Curricula</span>
                </div>

                <div 
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/20 shadow-xs animate-fade-in-up hover:-translate-y-0.5 transition-all" 
                  style={{ animationDelay: '200ms' }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">₹ {countStipend.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Monthly DBT Stipend</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Aadhaar Linked</span>
                </div>

                <div 
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/20 shadow-xs animate-fade-in-up hover:-translate-y-0.5 transition-all" 
                  style={{ animationDelay: '300ms' }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-[#D96B27] font-mono">{countPlacementRate}%</p>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Verified Placed</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Audited Records</span>
                </div>

                <div 
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/20 shadow-xs animate-fade-in-up hover:-translate-y-0.5 transition-all" 
                  style={{ animationDelay: '400ms' }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">{countDays} Days</p>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Retention Tracking</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Longitudinal Audit</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Collaged Frame with Documentary Trainees */}
            <div className="lg:col-span-5 relative lg:-mr-8 xl:-mr-12">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl group">
                <img 
                  src="/images/hero-training.jpg" 
                  alt="Indian vocational trainees actively training on precision CNC machines and electrical panels"
                  className="w-full h-[380px] sm:h-[460px] lg:h-[500px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
                  loading="eager"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="bg-[#0B3D6B]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Workshop Floor</span>
                  </span>
                  <span className="bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-amber-300/30">
                    NCVT NSQF Level 5
                  </span>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-xs font-bold text-white">Hands-on Industrial Calibrations</p>
                    <p className="text-[11px] text-slate-300">CNC • Solar PV • EV Diagnostics • Robotics</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">100% Industry Aligned</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. ROLE GATEWAY ("CHOOSE YOUR PATH") WITH PHOTO AVATARS        */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B3D6B] text-[11px] font-bold uppercase tracking-wider border border-blue-200">
                <span>Personalized Portal Entry</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B3D6B] tracking-tight">
                Choose Your Path to Technical Certification
              </h2>
              <p className="text-sm text-slate-600">
                Whether you are an aspiring trainee, an active job seeker, or an accredited center, select your dedicated pathway.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: I want to get Trained */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between border-t-4 border-t-[#0B3D6B]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/images/role-candidate.jpg" 
                      alt="Trainee" 
                      className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">I want to get Trained</h3>
                      <span className="text-[11px] text-[#0B3D6B] font-semibold">Trainee & Candidate</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enroll in government-subsidized NCVT vocational tracks with practical machine shop sessions and monthly DBT stipends.
                  </p>

                  <div className="pt-1 space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Select Target Trade:
                    </label>
                    <select
                      value={personaTrade}
                      onChange={(e) => setPersonaTrade(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#D96B27]"
                    >
                      {trades.map((t) => (
                        <option key={t.trade_name} value={t.trade_name}>
                          {t.trade_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const match = trades.find(t => t.trade_name === personaTrade);
                      if (match) setSelectedTradeModal(match);
                      else scrollToSection('schemes');
                    }}
                    className="w-full btn-sid-primary text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Explore Trade Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: I want to find a Job */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between border-t-4 border-t-emerald-600">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/images/role-employer.jpg" 
                      alt="Employer" 
                      className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">I want to find a Job</h3>
                      <span className="text-[11px] text-emerald-700 font-semibold">Corporate & Industrial Jobs</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Access 180+ verified industrial vacancies directly linked with corporate manufacturing, solar utilities, and EV facilities.
                  </p>

                  <div className="pt-1 space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Preferred District:
                    </label>
                    <select
                      value={personaDistrict}
                      onChange={(e) => setPersonaDistrict(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Pune">Pune (Maharashtra) • 42+ Vacancies</option>
                      <option value="Ahmedabad">Ahmedabad (Gujarat) • 38+ Vacancies</option>
                      <option value="Nashik">Nashik (Maharashtra) • 25+ Vacancies</option>
                      <option value="Thane">Thane (Maharashtra) • 30+ Vacancies</option>
                      <option value="Bengaluru">Bengaluru (Karnataka) • 45+ Vacancies</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to="/login?role=candidate"
                    className="w-full btn-sid-primary text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Sign In for Job Matching</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Training Center & Audits */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between border-t-4 border-t-[#D96B27]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/images/role-trainer.jpg" 
                      alt="Training Center" 
                      className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">Training Center Hub</h3>
                      <span className="text-[11px] text-[#D96B27] font-semibold">Institutes & ITIs</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Manage candidate enrollments, publish verified curriculum batches, and submit post-placement retention audits.
                  </p>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
                      <span>Accredited Provider Portal</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Access NCVT curriculum guides, batch allocation tooling, and automated placement logs.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to="/login?role=training_center"
                    className="w-full btn-sid-secondary text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <span>Access TC Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#0B3D6B]" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. VOCATIONAL GUIDANCE DIAGNOSTIC QUIZ (SAFFRON ACCENT CARD)   */}
      {/* ------------------------------------------------------------- */}
      <section id="quiz-section" className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="quiz-accent-card rounded-2xl p-7 sm:p-12 shadow-xl border-2 border-[#E07A38]/50 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
              
              <div className="relative z-10 space-y-6 text-white text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/25 pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Vocational Match Diagnostic</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Not Sure Where to Begin?
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
                      Answer two brief questions to receive an instant NCVT trade recommendation with verified stipend and starting salary outlook.
                    </p>
                  </div>

                  {quizResult && (
                    <button
                      onClick={resetQuiz}
                      className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>

                {!quizResult ? (
                  <form onSubmit={handleQuizSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-100">
                          1. Highest Education Level:
                        </label>
                        <select
                          value={quizEducation}
                          onChange={(e) => setQuizEducation(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white text-slate-900 text-xs font-bold border border-white focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <option value="10th Standard / Matriculation">10th Standard / Matriculation Pass</option>
                          <option value="12th Standard / Higher Secondary">12th Standard / Higher Secondary (10+2)</option>
                          <option value="ITI Diploma / Vocational">ITI Certificate / Vocational Diploma</option>
                          <option value="Graduate / Polytechnic Diploma">Graduate (BA / B.Com / B.Sc) or Polytechnic</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-100">
                          2. Which Work Environment Excites You Most?
                        </label>
                        <select
                          value={quizInterest}
                          onChange={(e) => setQuizInterest(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white text-slate-900 text-xs font-bold border border-white focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <option value="Precision CNC Machining & Fabrication">Precision CNC Machining, Lathes & Tooling</option>
                          <option value="Solar PV Arrays & Renewable Power">Rooftop Solar PV Arrays & Grid Inverters</option>
                          <option value="Electric Vehicle Battery & BMS Diagnostics">EV Lithium Battery Packs & BMS Electronics</option>
                          <option value="Factory Automation & Industrial Robotics">Articulated Industrial Robotics & PLC Automation</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <p className="text-[11px] text-amber-100">
                        ⚡ Instant evaluation against active NSDC competency benchmarks and 180+ live employer vacancies.
                      </p>
                      
                      {/* Primary CTA with Pulse Glow Animation */}
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#D96B27] text-xs font-bold py-3 px-7 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all animate-pulse"
                      >
                        <span>Find My Recommended Trade</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white/15 rounded-xl p-6 border border-white/30 space-y-4 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white text-slate-900 px-2.5 py-0.5 rounded-md">
                          {quizResult.matchPercentage}% Compatibility Match
                        </span>
                        <h3 className="font-display text-2xl font-bold text-white mt-1">
                          {quizResult.trade_name} ({quizResult.code})
                        </h3>
                        <p className="text-xs text-amber-100 mt-0.5">
                          Duration: <strong>{quizResult.duration}</strong> • Stipend: <strong>{quizResult.stipend}</strong>
                        </p>
                      </div>

                      <div className="bg-slate-900/90 text-white p-3.5 rounded-xl border border-white/20 text-left sm:text-right flex-shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">
                          Estimated Entry Compensation
                        </span>
                        <span className="text-base font-mono font-bold text-[#C9A227]">
                          {quizResult.salaryRange}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-100 leading-relaxed">
                      {quizResult.description}
                    </p>

                    <div className="pt-3 border-t border-white/20 flex flex-col sm:flex-row items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedTradeModal(quizResult)}
                        className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors"
                      >
                        <span>View Full Curriculum & Skills</span>
                      </button>
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, trade: quizResult.trade_name }));
                          scrollToSection('counseling');
                        }}
                        className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#D96B27] text-xs font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>Apply with This Trade</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. ACCREDITED PARTNERS & MARQUEE (SMOOTH GRAYSCALE TO COLOR)   */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] bg-slate-300 w-12 sm:w-24" />
            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B3D6B]" />
              <span>Backed by Government Ministries & Accredited Industrial Partners</span>
            </p>
            <div className="h-[1px] bg-slate-300 w-12 sm:w-24" />
          </div>
        </div>

        {/* Marquee Ticker with Hover Pause */}
        <div className="relative w-full overflow-hidden marquee-container py-3">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee gap-5 px-4 items-center">
            {[...partners, ...partners].map((p, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center gap-3.5 hover:border-[#D96B27] hover:shadow-md transition-all duration-200 cursor-default group filter grayscale hover:grayscale-0"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700 border border-slate-200 group-hover:bg-[#0B3D6B] group-hover:text-white transition-colors">
                  {p.code.substring(0, 3).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 whitespace-nowrap group-hover:text-[#0B3D6B] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                    {p.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. THREE PILLARS OF SKILLING (REVEAL WITH TWO-TONE ICONS)      */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider border border-slate-200">
                <span>National Skilling Foundation</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B3D6B] tracking-tight">
                Building a Skilled, Certified India
              </h2>
              <p className="text-sm text-slate-600">
                Our triple-verification architecture anchors transparency from initial shop-floor training to multi-year employment retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="bg-white border border-slate-200 rounded-xl p-7 space-y-5 hover:border-[#0B3D6B] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3D6B] flex items-center justify-center border border-blue-200">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3D6B] bg-blue-50/70 border border-blue-200 px-2.5 py-1 rounded-full">
                          {pillar.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-xl font-bold text-slate-900">{pillar.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          {pillar.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">System Benchmark:</span>
                      <strong className="font-mono text-[#D96B27] font-bold">{pillar.metric}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. REAL TRAINEE SUCCESS STORIES (VIDEO-THUMBNAIL STYLE CARDS)  */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 bg-slate-50/70 border-b border-slate-200">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DigiLocker Verified Career Journeys</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B3D6B] tracking-tight">
                  Real Trainee Success Stories
                </h2>
                <p className="text-sm text-slate-600">
                  Watch firsthand accounts from candidates who transformed technical vocational training into audited manufacturing careers.
                </p>
              </div>

              <button
                onClick={() => scrollToSection('counseling')}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D6B] hover:underline"
              >
                <span>Apply for Next Batch</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D96B27]" />
              </button>
            </div>

            {/* Video-Thumbnail Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {videoStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => openStoryModal(story)}
                >
                  {/* Video Thumbnail Frame with Centered Play Button */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={story.thumbnail}
                      alt={story.candidate_name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Centered Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#D96B27] group-hover:bg-[#C35919] text-white flex items-center justify-center shadow-xl transition-all transform group-hover:scale-110 border-2 border-white">
                        <Play className="w-7 h-7 ml-1 fill-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/20">
                      {story.duration}
                    </div>

                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-base font-bold leading-tight font-display">{story.candidate_name}</p>
                      <p className="text-xs text-amber-200">{story.employer} ({story.district})</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3D6B] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          {story.trade}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{story.verified_salary}</span>
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-[#0B3D6B] transition-colors leading-snug">
                        {story.story_title}
                      </h3>

                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{story.quote}"
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-[#0B3D6B] font-bold">
                      <span className="flex items-center gap-1 text-slate-600 font-mono">
                        <FileCheck className="w-4 h-4 text-[#D96B27]" />
                        <span>{story.credential_id}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#D96B27] group-hover:underline">
                        <span>Watch Video Story</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. APPROVED SKILLING SCHEMES (4-COLUMN CARD GRID)            */}
      {/* ------------------------------------------------------------- */}
      <section id="schemes" className="py-20 sm:py-28 border-b border-slate-200 bg-white">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#D96B27] text-[11px] font-bold uppercase tracking-wider border border-amber-200">
                <span>Curriculum & Qualifications</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B3D6B] tracking-tight">
                Approved Skilling Schemes & Trades
              </h2>
              <p className="text-sm text-slate-600">
                Government-funded vocational trades designed with direct industry participation. Pulling live trade curriculum specifications from the central skills registry.
              </p>
            </div>

            {/* 4-Column Card Grid with Hover Lift */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {trades.map((trade) => (
                <div 
                  key={trade.trade_name}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5 hover:border-[#D96B27] hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        {getTradeIcon(trade.icon)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {trade.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                        {trade.trade_name}
                      </h3>
                      <p className="text-xs text-[#0B3D6B] font-semibold mt-0.5">
                        Duration: {trade.duration}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {trade.description}
                    </p>

                    {trade.skills && trade.skills.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Core Assessed Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {trade.skills.map((skill, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {trade.stipend}
                    </span>
                    <button
                      onClick={() => setSelectedTradeModal(trade)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#D96B27] hover:underline"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. PARTNER TRAINING CENTERS GRID                             */}
      {/* ------------------------------------------------------------- */}
      <section id="centers" className="py-20 sm:py-28 border-b border-slate-200 bg-slate-50/60">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-3xl space-y-2 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B3D6B] text-[11px] font-bold uppercase tracking-wider border border-blue-200">
                  <span>Accredited Network</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B3D6B] tracking-tight">
                  Partner Training Centers & Institutes
                </h2>
                <p className="text-sm text-slate-600">
                  Audited training centers certified to conduct NCVT vocational coursework and practical hands-on assessments.
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
                  National Coverage: {centers.length} Regional Centers
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {centers.map((center) => (
                <div
                  key={center.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 hover:border-[#D96B27] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {center.code}
                      </span>
                      <span className="text-[10px] font-bold text-[#0B3D6B] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {center.affiliation_badge}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                      {center.name}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{center.location}</span>
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Approved Trades:
                      </span>
                      <ul className="text-xs text-slate-700 space-y-0.5">
                        {center.trades.map((t, idx) => (
                          <li key={idx} className="truncate">• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Real Registry Count:
                    </span>
                    <span className="text-xs font-bold text-[#0B3D6B] font-mono">
                      {center.candidates_trained_formatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. VERIFIED PLACEMENT & RETENTION REGISTRY (COUNT-UP)        */}
      {/* ------------------------------------------------------------- */}
      <section id="verified-outcomes" className="py-20 sm:py-28 border-b border-slate-200 bg-white">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header Sovereign Banner */}
            <div className="border-2 border-[#D96B27] bg-[#0B3D6B] text-white rounded-2xl p-7 sm:p-10 space-y-6 shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-[11px] font-bold uppercase tracking-wider border border-[#D96B27]/40">
                    <ShieldCheck className="w-4 h-4 text-[#D96B27]" />
                    <span>Employer-Audited Placement Registry</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Transparent & Auditable Skilling Outcomes
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Placement data on the National Skilling Portal is verified by employing HR departments and validated via longitudinal 30/90/180/365-day check-ins.
                  </p>
                </div>

                <div className="bg-white text-slate-900 p-5 rounded-xl border-2 border-[#D96B27] text-left max-w-sm flex-shrink-0 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Employment Record</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {verifiedMetrics.trust_badge}
                  </p>
                </div>
              </div>

              {/* Metric KPI Row with Count-Up */}
              <div className="pt-6 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                <div>
                  <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">
                    Placement Rate
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#D96B27] font-mono mt-0.5 block">
                    {countPlacementRate}%
                  </span>
                  <span className="text-[11px] text-slate-300">Confirmed by hiring partners</span>
                </div>

                <div>
                  <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">
                    Avg Salary Uplift
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#D96B27] font-mono mt-0.5 block">
                    {verifiedMetrics.average_salary_uplift_label}
                  </span>
                  <span className="text-[11px] text-slate-300">Over uncertified baseline</span>
                </div>

                <div>
                  <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">
                    Median Verified Salary
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#D96B27] font-mono mt-0.5 block">
                    {verifiedMetrics.average_placed_salary_label}
                  </span>
                  <span className="text-[11px] text-slate-300">Audited in employment_records</span>
                </div>

                <div>
                  <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">
                    Retention Rate
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#D96B27] font-mono mt-0.5 block">
                    {countRetentionRate}%
                  </span>
                  <span className="text-[11px] text-slate-300">Tracked via checkins table</span>
                </div>
              </div>
            </div>

            {/* Case Studies Grid */}
            <div className="space-y-4 text-left">
              <h3 className="font-display text-lg font-bold text-[#0B3D6B] uppercase tracking-wider">
                Consented Verified Candidate Case Records
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {successStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 font-display">
                          {story.candidate_name} ({story.batch_year})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#0B3D6B]">{story.trade}</p>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{story.employer} ({story.district})</span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                        "{story.quote}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Monthly Compensation:</span>
                      <span className="font-bold font-mono text-slate-900">{story.verified_salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 13. FREE COUNSELING BOOKING & SOVEREIGN FOOTER                 */}
      {/* ------------------------------------------------------------- */}
      <section id="counseling" className="py-20 sm:py-28 border-b border-slate-200 bg-slate-50/70">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D96B27]">
                Free Government Guidance Service
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B3D6B] tracking-tight">
                Request a Free Skill Counseling Session
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                Not sure which trade matches your background? Leave your contact details below to receive a free, one-on-one callback from an accredited district vocational counselor.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-7 sm:p-10 shadow-sm text-left">
              {leadSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-300">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    Counseling Request Registered Successfully
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your inquiry has been logged in the <strong>enrollment_leads</strong> registry. An accredited training counselor from your district will reach out to you within 24 hours.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => setLeadSuccess(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D6B] hover:underline"
                    >
                      <span>Submit another request</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                  {leadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      {leadError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full Candidate Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kulkarni"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Mobile Number (10 Digits) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-xs font-mono rounded-l-lg">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-r-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Home District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-white"
                      >
                        <option value="Pune">Pune (Maharashtra)</option>
                        <option value="Nashik">Nashik (Maharashtra)</option>
                        <option value="Thane">Thane (Maharashtra)</option>
                        <option value="Bengaluru">Bengaluru (Karnataka)</option>
                        <option value="Ahmedabad">Ahmedabad (Gujarat)</option>
                        <option value="Other">Other / All India District</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Trade of Interest <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.trade}
                        onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27] bg-white font-medium"
                      >
                        {trades.map((t) => (
                          <option key={t.trade_name} value={t.trade_name}>
                            {t.trade_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Questions or Preferred Batch Timing (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Inquiring about weekend classes or scholarship eligibility"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span>Your phone number is strictly used for official vocational counseling.</span>
                    </p>

                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-sid-primary text-white text-xs font-bold py-3 px-8 rounded-lg shadow-sm"
                    >
                      {submittingLead ? (
                        <span>Registering...</span>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5 text-white" />
                          <span>Book Free Counseling Callback</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Sovereign Official Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-14 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2.5">
                <span className="font-display font-bold text-base tracking-tight text-white uppercase">
                  National Skilling Portal (NSP)
                </span>
                <span className="text-[10px] font-bold text-[#D96B27] border border-[#D96B27] px-2 py-0.5 rounded">
                  Govt of India
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Operated under the National Council for Vocational Training & Directorate General of Training, MSDE.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="font-bold text-[#D96B27] hover:underline"
              >
                Portal Login (All Roles)
              </button>
              <span>•</span>
              <span className="text-slate-400">Helpline: 1800-11-2026</span>
              <span>•</span>
              <span className="text-slate-400">helpdesk@skilling.gov.in</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Ministry of Skill Development and Entrepreneurship. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <span className="hover:text-slate-300 cursor-pointer">Right to Information (RTI)</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* LEARN MORE TRADE MODAL DIALOG                                 */}
      {/* ------------------------------------------------------------- */}
      {selectedTradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 text-left shadow-2xl relative my-auto animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                  {selectedTradeModal.code}
                </span>
                <h3 className="font-display text-xl font-bold text-[#0B3D6B] mt-1.5">
                  {selectedTradeModal.trade_name}
                </h3>
                <p className="text-xs text-slate-500">Duration: {selectedTradeModal.duration}</p>
              </div>

              <button
                onClick={() => setSelectedTradeModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedTradeModal.description}
            </p>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                Targeted Industrial Job Roles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedTradeModal.careerOutcomes || []).map((role, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-md border border-slate-200 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
              <span className="text-slate-500">Government Stipend:</span>
              <strong className="font-mono text-[#D96B27] font-bold">{selectedTradeModal.stipend}</strong>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTradeModal(null)}
                className="btn-sid-secondary text-xs font-bold px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTradeModal(null);
                  setFormData(prev => ({ ...prev, trade: selectedTradeModal.trade_name }));
                  scrollToSection('counseling');
                }}
                className="btn-sid-primary text-white text-xs font-bold px-5 py-2 shadow-sm"
              >
                Apply for this Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VERIFIED CANDIDATE VIDEO STORY MODAL                          */}
      {/* ------------------------------------------------------------- */}
      {activeStoryModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={closeStoryModal}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0B3D6B] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-slate-200">
                  Documented Candidate Case Study • {activeStoryModal.credential_id}
                </span>
              </div>
              <button
                onClick={closeStoryModal}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex items-center justify-center">
              <img 
                src={activeStoryModal.thumbnail} 
                alt={activeStoryModal.candidate_name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoPlaying ? 'opacity-90' : 'opacity-75'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30"></div>

              {/* Top Banner inside video */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20 text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>{isVideoPlaying ? 'PLAYING FIELD AUDIT' : 'PAUSED'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20 text-[11px] font-mono">
                  <Volume2 className="w-3.5 h-3.5 text-[#D96B27]" />
                  <span>HQ AUDIO</span>
                </div>
              </div>

              {/* Center Play/Pause Overlay */}
              <button
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="relative z-10 w-16 h-16 rounded-full bg-[#D96B27] hover:bg-[#C35919] text-white flex items-center justify-center border-2 border-white shadow-xl hover:scale-105 transition-transform"
                title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
              >
                {isVideoPlaying ? (
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-5 bg-white rounded-sm"></div>
                    <div className="w-1.5 h-5 bg-white rounded-sm"></div>
                  </div>
                ) : (
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                )}
              </button>

              {/* Bottom Video Controls & Ticker */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1.5 text-white">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="truncate max-w-[280px] sm:max-w-md">{activeStoryModal.story_title}</span>
                  <span>{isVideoPlaying ? '01:14' : '00:00'} / {activeStoryModal.duration}</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-[#D96B27] transition-all duration-300 ${isVideoPlaying ? 'w-[45%]' : 'w-0'}`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Trainee Details & Timeline Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[45vh] text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 leading-tight">
                    {activeStoryModal.candidate_name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {activeStoryModal.trade} • {activeStoryModal.batch}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-mono text-emerald-800 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Placed at <strong>{activeStoryModal.employer}</strong> ({activeStoryModal.verified_salary})</span>
                </div>
              </div>

              <blockquote className="bg-amber-50/70 border-l-4 border-[#D96B27] p-4 rounded-r-lg text-xs text-slate-700 italic leading-relaxed">
                "{activeStoryModal.quote}"
              </blockquote>

              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  Audited Training & Placement Progression:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStoryModal.timeline.map((step, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 font-display">{step.phase}</span>
                        {step.score && (
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                            {step.score}
                          </span>
                        )}
                        {step.duration && (
                          <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                            {step.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {step.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-[#0B3D6B]" />
                  <span>DigiLocker Certified: <strong className="font-mono text-slate-900">{activeStoryModal.credential_id}</strong></span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                  VERIFIED RECORD
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={closeStoryModal}
                className="btn-sid-secondary text-xs font-bold px-4 py-2"
              >
                Close Video
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    closeStoryModal();
                    scrollToSection('schemes');
                  }}
                  className="btn-sid-secondary text-xs font-bold px-4 py-2"
                >
                  View Scheme Curriculum
                </button>
                <button
                  onClick={() => {
                    closeStoryModal();
                    setFormData(prev => ({ ...prev, trade: activeStoryModal.trade, district: activeStoryModal.district }));
                    scrollToSection('counseling');
                  }}
                  className="btn-sid-primary text-white text-xs font-bold px-5 py-2 shadow-sm"
                >
                  Apply for this Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom-Right Floating Action Stack */}
      <FloatingActionStack />
    </div>
  );
};
