# National Skilling Portal — Complete Site Audit & Architecture Specification

> **Document Type**: Structural System Audit & Component Map  
> **Status**: Verified Production State  
> **Design Language**: Skill India Digital Hub (`skillindiadigital.gov.in`)  
> **Scope**: Read-Only Architecture Map (Zero Code Alterations)

---

## 1. Executive Summary & Metric Counts

| Metric Category | Count | Scope & Details |
| :--- | :--- | :--- |
| **Total Pages / Route Views** | **16** | 1 Public Landing, 2 Auth, 1 Security/403, 8 Candidate Modules, 4 Institutional Role Dashboards |
| **Total Distinct UI Sections** | **92** | Top-to-bottom structured sections audited across all 16 page modules |
| **Total Reusable Components** | **12** | Core layout components, vector illustrations, scroll observers, widgets, and design system elements |
| **Total Modals / Multi-Step Flows** | **8** | Role selector, 3-step onboarding, guidance quiz, pre/post exam, batch creator, check-in wizard, helpline, WhatsApp bot |

---

## 2. Page & Route Inventory

### A. Public & Landing Pages (1)
| Page Name | File Path | Route URL / State | Access Control |
| :--- | :--- | :--- | :--- |
| **Public Landing Page** | `frontend/src/pages/LandingPage.jsx` | `/` | Public (Unauthenticated) |

### B. Authentication & Security Pages (3)
| Page Name | File Path | Route URL / State | Access Control |
| :--- | :--- | :--- | :--- |
| **Official Sign-In** | `frontend/src/pages/Login.jsx` | `/login` | Public / Redirects to `/dashboard` if authenticated |
| **Citizen & Entity Registration** | `frontend/src/pages/Register.jsx` | `/register` | Public / Redirects to `/dashboard` if authenticated |
| **Restricted Access 403** | `frontend/src/pages/Unauthorized.jsx` | `/unauthorized` | Authenticated (Role Mismatch) |

### C. Candidate Dashboard Views (8)
*Mounted dynamically via `DashboardRouter` within [MainLayout.jsx](file:///c:/SIH-SKILLING/frontend/src/components/layout/MainLayout.jsx) at `/dashboard` when role is `candidate`:*

| View / Module Name | File Path | Active Tab Identifier | Sub-Route / Trigger |
| :--- | :--- | :--- | :--- |
| **Candidate Dashboard Overview** | `frontend/src/pages/CandidateDashboard.jsx` | `dashboard` | Default Candidate view |
| **Candidate Onboarding Profile** | `frontend/src/pages/CandidateOnboarding.jsx` | `onboarding` / `enrollment` | Sidebar: "Candidate Onboarding" |
| **Skill MCQ Assessment Module** | `frontend/src/pages/SkillAssessmentModule.jsx` | `assessment` | Sidebar: "Skill MCQ Assessment" |
| **Competency Radar Scorecard** | `frontend/src/pages/SkillScorecardPage.jsx` | `scorecard` | Sidebar: "Competency Radar Chart" |
| **Skill Match & Gap Analysis** | `frontend/src/pages/SkillMatchPage.jsx` | `skill-match` | Sidebar: "Skill Match & Gap Bar Chart" |
| **Recommended Jobs** | `frontend/src/pages/RecommendedJobsPage.jsx` | `jobs` / `recommended-jobs` | Sidebar: "Recommended Jobs" |
| **My Applications Tracker** | `frontend/src/pages/MyApplicationsPage.jsx` | `applications` / `my-applications` | Sidebar: "My Applications" |
| **Placement & Check-Ins** | `frontend/src/pages/EmploymentStatusPage.jsx` | `employment-status` | Sidebar: "Placement & Check-Ins" |

### D. Institutional & Administrative Role Dashboards (4)
*Mounted dynamically at `/dashboard` according to authenticated user role:*

| Role Name | File Path | Primary Route | Description |
| :--- | :--- | :--- | :--- |
| **Training Center Provider** | `frontend/src/pages/TrainingCenterDashboard.jsx` | `/dashboard` (`role: 'training_center'`) | Batch oversight, trainee rosters, and placement audits |
| **TC Batch Allocation** | `frontend/src/pages/BatchCreationPage.jsx` | `/dashboard` (`activeTab: 'create-batch'`) | Multi-trade batch publishing and candidate enrollment |
| **Employer / Corporate HR** | `frontend/src/pages/EmployerDashboard.jsx` | `/dashboard` (`role: 'employer'`) | Placement verification queue, vacancy publishing, hiring |
| **Government Official** | `frontend/src/pages/GovernmentDashboard.jsx` | `/dashboard` (`role: 'government'`) | National KPI command center, TC verification, audit log |

---

## 3. Section-by-Section Breakdown per Page

### 1. Public Landing Page (`frontend/src/pages/LandingPage.jsx`)
1. **Sovereign Accessibility & Utility Bar**: Renders Government of India banner, font resizer, theme/contrast controls, and multilingual language options.
2. **Main Navigation Header**: Displays Skill India Digital brandmark, official navigation links, and "Portal Sign In" button that triggers the Welcome Modal.
3. **Skill India Digital Welcome Modal**: Interactive 4-role selection dialog (Candidate, Training Center, Employer, Government) with circular selection indicators.
4. **Asymmetric Hero Section**: Displays bold Poppins headline, value propositions, CTA buttons, sovereign trust badges, and documentary photography.
5. **Role Gateway ("Choose Your Path")**: Strict 3-column grid of interactive cards directing Trainees, Training Centers, and Employers to their respective journeys.
6. **Vocational Guidance Diagnostic Quiz**: Interactive 3-step aptitude quiz generating instant trade recommendations based on user skills.
7. **Accredited Partners Marquee**: Infinite-scroll ticker displaying official emblems of NSDC, NCVET, DGT, Tata, L&T, and Mahindra.
8. **Three Pillars of Skilling Grid**: Structured 3-column showcase of Verified Training, Direct Industry Placement, and DigiLocker Credentialing.
9. **Real Trainee Documentary Stories**: 2-column testimonial cards featuring real candidates (CNC Machinist, Solar Tech) with earnings and employment outcomes.
10. **Approved Skilling Schemes**: 4-column cards highlighting PMKVY 4.0, DDU-GKY, NAPS Apprenticeship, and Craftsmen Training Scheme.
11. **Partner Training Centers Grid**: 4-column directory of accredited institutions displaying infrastructure grades, seat capacity, and placement rates.
12. **Verified Placement & Retention Registry**: Live statistical metric counters showing verified hires, 30/90/180-day retention rates, and average salaries.
13. **Free Counseling Booking & Footer**: Lead capture form for callback scheduling, accompanied by Ministry links, emergency helpline, and copyright details.

### 2. Login Page (`frontend/src/pages/Login.jsx`)
1. **Government Header Banner**: Displays sovereign emblem, national skilling logo, and "GOV.IN Official Sign-In" eyebrow badge.
2. **Role Selection Switcher / Welcome Modal**: Allows users to choose or modify their active access persona (Candidate, TC, Employer, Government).
3. **Authentication Form**: Input fields for registered email, password, role select dropdown, and solid saffron `.btn-sid-primary` sign-in button.
4. **Quick Demo Persona Switcher**: One-click login tiles allowing evaluators to immediately enter as pre-seeded demo accounts.
5. **Security & Statutory Notices**: Aadhaar e-KYC compliance notification, password assistance, and registration redirect link.

### 3. Register Page (`frontend/src/pages/Register.jsx`)
1. **Sovereign Portal Header**: National identity header with official portal registration subtitle.
2. **Role Selection Radio Cards**: 4 radio-style selectable persona tiles with descriptions and circular selection dots.
3. **Registration Form Fields**: Collects Full Name, Organization/Institute Name (for institutional roles), Official Email, and Password confirmation.
4. **Action Bar & Navigation Link**: Primary submission button and link redirecting existing account holders to `/login`.
5. **Data Protection Disclaimer**: Official Government statutory statement on privacy, DigiLocker integration, and data sovereign residency.

### 4. Candidate Dashboard (`frontend/src/pages/CandidateDashboard.jsx`)
1. **Candidate Profile Card**: Displays candidate name, unique candidate ID, verified Aadhaar badge, assigned trade, district, and DigiLocker status.
2. **5-Step Longitudinal Journey Tracker**: Visual step progressor tracking Registration -> Assessment -> Training -> Placement -> Retention.
3. **Overview Metrics Trio**: Animated numeric count-up stat cards for Active Schemes (2), Verified Certifications (1), and Job Matches (180+).
4. **Competency Snapshot Progress Bars**: Pre- vs Post-training competency progress bars that smoothly animate to their target widths on mount.
5. **Quick Launchpad Grid**: Action tiles linking directly to Skill MCQ Exam, Competency Radar, Job Matches, and Retention Check-Ins.
6. **Recent Job Vacancy Table**: High-density preview table showing top matching job vacancies with salary and one-click apply triggers.

### 5. Candidate Onboarding (`frontend/src/pages/CandidateOnboarding.jsx`)
1. **Onboarding Header Banner**: Official NSQF framework alignment banner detailing candidate profile initialization requirements.
2. **Step 1 — Personal Demographics**: Inputs for Full Name, Date of Birth, Gender, Social Category, and Aadhaar (last 4 digits).
3. **Step 2 — Educational & Trade Preferences**: Inputs for Highest Educational Qualification, Technical Institute/ITI, and Primary Desired Trade.
4. **Step 3 — Mobility & Job Expectations**: Form fields for Home District, State, Willingness to Relocate, Target Salary Range, and Save Profile action.

### 6. Skill MCQ Assessment Module (`frontend/src/pages/SkillAssessmentModule.jsx`)
1. **Exam Header Banner**: Displays trade title, NCVT assessment standard, and Pre-Training vs Post-Training phase switcher buttons.
2. **Trade & District Filter Bar**: Selectors allowing trainees to change assessed trade or district and view assessment status.
3. **Explainable Results Banner**: Shown upon submission to display overall competency %, pass thresholds, and link to gap analysis.
4. **Explainable Job Match Breakdown**: Visual drawer highlighting "Skills you have" (green checkmarks) vs "Skills you're missing" (amber badges).
5. **MCQ Questions Container**: Card list rendering technical questions with Skill India Digital radio-tile options, circular indicator dots, and ABCD badges.
6. **Action Footer Bar**: Clear Selection button, Retake/Switch Trade trigger, and solid saffron submit assessment button.

### 7. Competency Radar Scorecard (`frontend/src/pages/SkillScorecardPage.jsx`)
1. **Credentials Header Banner**: Displays verified certificate ID, DigiLocker integration stamp, and trade title.
2. **Trade Selector & Phase Controls**: Dropdown to switch between trades and review baseline vs post-training growth.
3. **Mathematical SVG Radar Chart Card**: Multi-axis polygon chart plotting score points across 4 distinct technical competencies with concentric grid rings.
4. **Competency Breakdown Table**: Detailed ledger listing each skill, category, baseline score, post score, and competency status badge.
5. **Official NCVET Certification Level Card**: NSQF level accreditation badge, issue date, credential hash, and QR code verification block.
6. **Export Action Bar**: Solid saffron `.btn-sid-primary` for official PDF scorecard download and DigiLocker sync trigger.

### 8. Skill Match & Gap Analysis (`frontend/src/pages/SkillMatchPage.jsx`)
1. **Gap Analysis Header Banner**: Explains mathematical gap calculations between candidate test results and market demand.
2. **Trade & District Filter Selector**: Controls to query different labor markets and examine local skill deficits.
3. **Empty State Gating Banner**: Guides candidates with 0 completed post-assessments to take the MCQ test before seeing gap charts.
4. **Dual-Bar Competency vs Demand Visualizer**: Side-by-side animated progress bars comparing candidate score % directly against market demand frequency %.
5. **Market Deficit & Surplus Insights Grid**: Categorized tiles showing acute skill shortages in the district vs fully mastered skills.
6. **Recommended Bridge Courses**: Curated training curriculum recommendations addressing identified skill deficiencies.

### 9. Recommended Jobs Page (`frontend/src/pages/RecommendedJobsPage.jsx`)
1. **Recruitment Engine Header**: Explains real-time matching algorithms evaluated against 181 CSV seeded job vacancies.
2. **Filter & Search Controls**: District filter, trade selector, and minimum match percentage threshold slider.
3. **Assessment Gating Notification**: Informs unassessed candidates to take their MCQ exam to unlock match percentages.
4. **High-Density Job Registry Table**: Government bordered table (`.table-govt`) displaying Job ID, Title, Company, District, Salary, and Match %.
5. **Expandable Skill Drawer per Row**: In-table accordion revealing exact matched skills vs missing skills for each specific opening.
6. **One-Click Application Modal**: Confirmation popup collecting candidate resume summary and dispatching job application.

### 10. My Applications Page (`frontend/src/pages/MyApplicationsPage.jsx`)
1. **Application Tracker Banner**: Top summary banner with real-time multi-portal candidate synchronization tag.
2. **Active Profile Switcher (Dev Mode)**: Profile dropdown allowing evaluators to test active application states vs 0-application empty state.
3. **Overview Metrics Cards Trio**: 3 cards displaying Total Applications, In Review/Interviews, and Hired & Placed counts.
4. **Hired Status Confirmation Alert**: Dynamic alert banner triggered when an application is marked 'Hired', initializing retention tracking.
5. **Empty State Card**: Clean onboarding card with next steps checklist and CTA button to Recommended Jobs for fresh applicants.
6. **Submitted Applications Register**: `.table-govt` table with Application ID, Job ID, Employer, Date, Status badge, and interactive Stage Selector.

### 11. Placement & Retention Status (`frontend/src/pages/EmploymentStatusPage.jsx`)
1. **Longitudinal Retention Header**: Details Day 30, 90, 180, and 365 milestone audit requirements.
2. **Active Placement Record Card**: Confirmed corporate employer name, monthly remuneration, joining date, and placement ID.
3. **Candidate Retention Self-Report Form**: Form fields for confirming active employment, net salary credited, and salary slip proof upload.
4. **Milestone Verification Timeline**: Sequential verification visualizer (Candidate self-report -> Employer confirmation -> Government audit).
5. **Audit Trail & Check-In History**: Historical table of past periodic check-ins, verification timestamps, and compliance status.

### 12. Training Center Dashboard (`frontend/src/pages/TrainingCenterDashboard.jsx`)
1. **TC Institutional Profile Banner**: Displays center accreditation details (Apex Industrial Training Institute, Grade A).
2. **Key Operational Metrics Grid**: 4 stat cards for Active Batches, Enrolled Candidates, Certified Trainees, and Verified Placements.
3. **Active Batches Management Register**: Table listing batch codes, curriculum trades, enrolled seats, start/end dates, and operational status.
4. **Trainee Roster & Attendance View**: Searchable candidate list with contact info, enrolled trade, and completion progress.
5. **Post-Placement Verification Queue**: Table of placed candidates requiring center verification with refresh and export actions.
6. **Quick Batch Allocation Action**: Direct trigger button navigating to the Batch Creation Page.

### 13. Batch Creation Page (`frontend/src/pages/BatchCreationPage.jsx`)
1. **Batch Allocation Header Banner**: Official TC allocation header with Apex Institute credentials.
2. **Success Feedback Alert**: Notification banner appearing on batch publishing confirming national portal activation.
3. **Step 1 — Batch Code & Capacity**: Form inputs for unique Batch Code, Maximum Seat Capacity, and Batch Title.
4. **Step 2 — Curriculum Trade & Skills**: Dropdown to assign official NSQF trade and review mandated curriculum skills.
5. **Step 3 — Link Corporate Partner**: Employer selector to tie the batch to a corporate partner for direct placement guarantees.
6. **Step 4 — Candidate Enrollment Checklist**: Interactive candidate list with checkable boxes and trade suitability info.
7. **Step 5 & Live Summary Column**: Date pickers for batch start/end dates, publish button, and sticky real-time preview card.

### 14. Employer Dashboard (`frontend/src/pages/EmployerDashboard.jsx`)
1. **Corporate HR Header Banner**: Displays enterprise profile, industry sector, and recruitment portal badge.
2. **Placement Verification Queue**: Table of candidate placement claims requiring HR verification, salary confirmation, and approval.
3. **Active Job Openings Management**: Table of active corporate job postings with district, vacancy counts, and application numbers.
4. **Candidate Talent Sourcing**: Filterable candidate talent directory searching by trade certification and qualification.
5. **Applicant Review Drawer**: Drawer modal to inspect candidate credentials, review skill scores, and update application status.

### 15. Government Dashboard (`frontend/src/pages/GovernmentDashboard.jsx`)
1. **National Command Center Header**: Ministry of Skill Development & Entrepreneurship sovereign header with real-time audit indicator.
2. **National Skilling Macro KPIs**: Metric cards for Total Enrollments, Total Certified, Verified Placement Rate %, and Fund Utilization.
3. **Multi-District Skilling Distribution**: Geographic breakdown table displaying candidate throughput and placement rates across districts.
4. **Training Center Compliance Queue**: Inspection ledger displaying TC grades, infrastructure audit reports, and accreditation flags.
5. **Longitudinal Retention Registry**: State-level audit ledger monitoring candidate retention at 30, 90, 180, and 365-day intervals.
6. **Live System Audit Log**: Real-time event log tracking candidate certifications, employer confirmations, and batch creations with CSV export.

### 16. Unauthorized 403 Page (`frontend/src/pages/Unauthorized.jsx`)
1. **Centered Sovereign Security Card**: Clean `#F8F8F9` canvas housing a 12px rounded authorization card.
2. **Security Shield Emblem**: Rose-tinted icon container with sovereign security warning badge.
3. **Access Restriction Details**: Explains that the active user role does not possess permissions for the requested endpoint.
4. **Return Action Button**: Solid saffron `.btn-sid-primary` returning the user to their authorized dashboard.

---

## 4. Reusable Component Inventory

| Component Name | File Path | Type | Render Description |
| :--- | :--- | :--- | :--- |
| **MainLayout** | `frontend/src/components/layout/MainLayout.jsx` | Layout Wrapper | Renders fixed Top Header, Sidebar, main content container, and global FloatingActionStack. |
| **Header** | `frontend/src/components/layout/Header.jsx` | Navigation Header | Sovereign GOV.IN header with accessibility font toggles, language selector, role switcher dropdown, and notification badge. |
| **Sidebar** | `frontend/src/components/layout/Sidebar.jsx` | Navigation Drawer | Fixed 64px sidebar rendering role-specific navigation links grouped by uppercase section headers with active route indicators and helpline box. |
| **FloatingActionStack** | `frontend/src/components/common/FloatingActionStack.jsx` | Floating Action Stack | Consolidated bottom-right stack containing the 24x7 Government Helpline button and WhatsApp AI Assistant button. |
| **ScrollReveal** | `frontend/src/components/common/ScrollReveal.jsx` | Motion Wrapper | Native `IntersectionObserver` wrapper that applies smooth fade-and-slide-up entrance transitions as sections enter viewport. |
| **TwoToneIllustrations** | `frontend/src/components/common/TwoToneIllustrations.jsx` | Vector Graphics Library | SVG illustration library in Deep Navy (`#0B3D6B`) and Warm Saffron (`#D96B27`) for Candidates, TCs, Employers, Govt, and Empty states. |
| **WhatsAppWidget** | `frontend/src/components/WhatsAppWidget.jsx` | Chatbot Window | Interactive floating chatbot modal with multilingual support (English, Hindi, Marathi), quick option chips, and conversational replies. |
| **Competency Radar Chart** | Embedded in `SkillScorecardPage.jsx` | SVG Data Visualizer | Dynamic mathematical SVG polygon chart plotting pre- vs post-scores across 4 competency axes with concentric calibration rings. |
| **Dual-Bar Gap Visualizer** | Embedded in `SkillMatchPage.jsx` | Animated Chart Component | Dual-bar progress indicator comparing candidate competency score % side-by-side against market demand frequency %. |
| **Government Data Table** | `.table-govt` in `frontend/src/index.css` | Data Table Component | High-density government table styling with monospace IDs, subtle row borders, sticky header rows, and hover highlighting. |
| **Two-Tier Action Buttons** | `.btn-sid-primary` / `.btn-sid-secondary` | UI Control | Standardized 8px border-radius action buttons (solid saffron primary vs white/outlined secondary) with soft hover lift. |
| **Skill India Welcome Modal** | In `LandingPage.jsx` & `Login.jsx` | Persona Selection Modal | Welcome modal presenting 4 radio-selectable role cards with circular radio selection dots for role onboarding. |

---

## 5. Modals, Wizards & Multi-Step Flows

### 1. Skill India Digital Welcome Role-Selection Modal
- **Location**: Triggered from `LandingPage.jsx` ("Portal Sign In") and available on `Login.jsx`.
- **Steps**: 1 Selection Step.
- **Selectable Personas**:
  1. *Candidate / Trainee*: "Take assessments, track training, and find verified jobs."
  2. *Training Center Provider*: "Manage enrollments, batches, and trainee progress."
  3. *Employer / HR*: "Post vacancies and hire verified, skilled candidates."
  4. *Government Official*: "Audit programs, verify placements, and monitor outcomes."
- **Data & Action**: Radio-style tile selection with circular dot indicator; clicking "Continue to Sign In" pre-selects the role and redirects to `/login`.

### 2. Candidate Onboarding Wizard
- **Location**: `CandidateOnboarding.jsx` (Sidebar: "Candidate Onboarding").
- **Steps**: 3 Sequential Steps.
  - **Step 1 (Personal Demographics)**: Full Name, Date of Birth (`YYYY-MM-DD`), Gender, Category (General, OBC, SC, ST), Aadhaar (last 4 digits).
  - **Step 2 (Qualifications & Trade)**: Highest Qualification (10th, 12th, ITI, Diploma, Graduate), Technical Institute Name, Primary Trade preference.
  - **Step 3 (Mobility & Expectations)**: Home District, State, Relocation Willingness (Yes/No), Expected Monthly Salary Range.
- **Data & Action**: Validates inputs, persists to Supabase `candidates` and `profiles` tables (with localStorage fallback), and initializes the journey tracker.

### 3. Vocational Guidance Diagnostic Quiz
- **Location**: `LandingPage.jsx` (Public Landing Page Section 6).
- **Steps**: 3 Interactive Questions.
  - **Question 1 (Aptitude Preference)**: Precision Machining, Solar Energy, EV Systems, or Robotics.
  - **Question 2 (Prior Education)**: 10th Pass, 12th Pass, ITI/Diploma, or Graduate.
  - **Question 3 (Career Priority)**: High Immediate Salary, Government Apprenticeship, or Long-Term Technical Specialization.
- **Data & Action**: Analyzes responses and outputs an instant recommendation for certified trades with direct link to curriculum.

### 4. Technical MCQ Skill Assessment Flow
- **Location**: `SkillAssessmentModule.jsx` (Sidebar: "Skill MCQ Assessment").
- **Steps**: 2 Assessment Phases.
  - **Pre-Training Assessment**: 4–8 technical MCQs per trade measuring baseline entry competence.
  - **Post-Training Assessment**: 4–8 technical MCQs per trade measuring achieved skill competence.
- **Data Collected**: Single-choice option selections (A, B, C, D) for each question in the active trade set.
- **Data & Action**: Submits answers to `/api/portal/assessments/submit`, calculates competency score (≥60% achieved), updates radar scorecard, and unlocks job recommendations.

### 5. Training Center Batch Creation & Allocation Wizard
- **Location**: `BatchCreationPage.jsx` (Sidebar: "Create & Allocate Batch").
- **Steps**: 5 Integrated Form Sections.
  - **Section 1 (Batch Details)**: Unique Batch Code, Max Seat Capacity (numeric), Batch Title.
  - **Section 2 (Curriculum Trade)**: Trade selection dropdown linking verified skills.
  - **Section 3 (Corporate Partner)**: Optional employer link for direct placement agreements.
  - **Section 4 (Trainee Enrollment)**: Multi-select checklist of registered candidates with trade preferences.
  - **Section 5 (Dates & Scheduling)**: Batch Start Date, Batch End Date.
- **Data & Action**: POST to `/api/portal/batches/create`, publishes batch to TC and Government oversight queues.

### 6. Candidate Longitudinal Retention Check-In Flow
- **Location**: `EmploymentStatusPage.jsx` (Sidebar: "Placement & Check-Ins").
- **Steps**: 2 Check-In Steps.
  - **Step 1 (Employment Confirmation)**: Current Employer Name, Net Monthly Remuneration, Active Role confirmation.
  - **Step 2 (Salary Proof & Comments)**: Salary slip attachment indicator and candidate satisfaction notes.
- **Data & Action**: Submits to `/api/portal/employment/checkin`, records milestone (Day 30, 90, 180, 365), and advances record to employer verification.

### 7. National Skilling Helpline Modal
- **Location**: Triggered from `FloatingActionStack.jsx` helpline icon button.
- **Steps**: 1 Informational Modal Step.
- **Data Presented**: Toll-free 24x7 number (`1800-11-2026`), MSDE Helpdesk hours (Mon–Fri 09:00–18:00), official support email (`support-skilling@nic.in`), and link to CPGRAMS portal.

### 8. WhatsApp AI Multilingual Chatbot Window
- **Location**: Triggered from `FloatingActionStack.jsx` WhatsApp button.
- **Steps**: Dynamic branching conversational flow.
  - **Main Menu**: Key 1 (Explore Schemes), Key 2 (Skill Assessment), Key 3 (Job Vacancies), Key 4 (Counseling Callback).
  - **Language Selector**: English, Hindi (`हिंदी`), Marathi (`मराठी`).
- **Data Collected**: Incoming user text queries and callback phone number / district requests.

---

## 6. Sidebar & Navigation Structure

### Role: Candidate (`role: 'candidate'`)
```
GET STARTED
  ├── Dashboard Overview                [id: 'dashboard']
  ├── Candidate Onboarding             [id: 'onboarding']
  └── Enrolled Schemes & Courses       [id: 'courses', badge: '2 Active']

SKILL ASSESSMENT
  ├── Skill MCQ Assessment             [id: 'assessment']
  ├── Competency Radar Chart           [id: 'scorecard', badge: 'DigiLocker']
  └── Skill Match & Gap Bar Chart      [id: 'skill-match', badge: '180 Jobs']

JOBS & PLACEMENT
  ├── Recommended Jobs                 [id: 'jobs']
  ├── My Applications                  [id: 'applications']
  └── Placement & Check-Ins            [id: 'employment-status', badge: 'Day 30']

CREDENTIALS
  └── Skill Certifications             [id: 'certifications', badge: '1 Verified']
```

### Role: Training Center Provider (`role: 'training_center'`)
```
NAVIGATION
  ├── TC Dashboard Overview            [id: 'dashboard']
  ├── Post-Placement Audits            [id: 'employment-status']
  ├── Create & Allocate Batch          [id: 'create-batch', badge: 'New Trade']
  ├── Industry Skill Gap Analytics     [id: 'skill-match']
  ├── Candidate Radar Scorecards       [id: 'scorecard']
  ├── Batch Management                 [id: 'batches', badge: '8 Batches']
  ├── Trainee Registration             [id: 'enrollment']
  ├── Infrastructure Audit             [id: 'audit', badge: 'Grade A']
  └── Completion Reports               [id: 'reports']
```

### Role: Government Official (`role: 'government'`)
```
NAVIGATION
  ├── Govt Admin Dashboard             [id: 'dashboard']
  ├── Placement Verification Queue     [id: 'employment-status', badge: 'Audit']
  ├── National Skill Gap Bar Index     [id: 'skill-match']
  ├── Skill Growth Radar Index         [id: 'scorecard']
  ├── Allocate Program Batch           [id: 'create-batch']
  ├── National Skilling Metrics        [id: 'analytics']
  ├── Training Center Verification     [id: 'centers', badge: '12 Pending']
  ├── Fund & Budget Allocation         [id: 'funds']
  └── Policy & Compliance              [id: 'policy']
```

### Role: Employer / Corporate HR (`role: 'employer'`)
```
NAVIGATION
  ├── Employer Portal                  [id: 'dashboard']
  ├── Confirm Placements               [id: 'employment-status', badge: 'Action Required']
  ├── Skill Gap & Demand Match         [id: 'skill-match']
  ├── Candidate Skill Radar            [id: 'scorecard']
  ├── Job Openings                     [id: 'postings', badge: '14 Active']
  ├── Create Vacancy                   [id: 'post-job']
  ├── Verified Candidate Search        [id: 'candidates']
  └── Applications Received            [id: 'applicants', badge: '45 New']
```

---

## 7. Data & State Inventory: Functional vs. Mock Content

### Functional / Live State (Backed by Express API & Supabase DB)
1. **User Authentication & Persona Switching**:
   - Supabase Auth session listener (`supabase.auth.onAuthStateChange`).
   - Profile synchronizer in `public.profiles` (`id`, `email`, `role`, `full_name`).
   - Client fallback in `localStorage` (`nsp_portal_user`) ensuring offline/dev resilience.
2. **Candidate Profile Registration & Upsert**:
   - `public.candidates` table in Supabase stores `user_id`, `full_name`, `preferred_trade`, `district`, `qualification`, and Aadhaar metadata.
3. **MCQ Examination & Scoring Engine**:
   - Technical questions loaded dynamically from `mcq_question_bank.js`.
   - Score calculation and submission to `/api/portal/assessments/submit`.
   - Records persisted to `public.skill_assessments` table (`candidate_id`, `trade`, `phase`, `score`).
4. **Labor Demand Frequency Math (181 Seeded Jobs)**:
   - Backend seeds 181 CSV job postings (`job_postings_seed.csv`).
   - Express calculates exact percentage frequency of skills demanded across local vacancies.
5. **Explainable Job Matching Engine**:
   - Matches candidate's achieved skills against job required skills: `match_percentage = (matched_skills / required_skills) * 100`.
   - Generates exact explainable breakdowns ("Skills you have" vs "Skills you're missing").
6. **Application Lifecycle Management**:
   - Endpoints `/api/portal/applications` support status transitions (`Applied` -> `Shortlisted` -> `Interviewing` -> `Offered` -> `Hired`).
   - Transitioning an application to `Hired` automatically initializes an employment record and begins retention tracking.
7. **Multi-Stakeholder Placement & Retention Verification**:
   - Candidate self-report check-ins (`/api/portal/employment/checkin`).
   - Employer verification queue (`/api/portal/employment/employer-confirm`).
   - Real-time event broadcasting via `realtimeSync.js` (Supabase Realtime Channel).
8. **Batch Allocation System**:
   - Form submission to `/api/portal/batches/create` allocates curriculum trades, corporate partners, and candidate IDs.
9. **WhatsApp AI Decision Engine**:
   - Stateful dialog handling in `backend/src/services/whatsappService.js` supporting multi-turn queries in English, Hindi, and Marathi.

### Mock / Static / Placeholder Content (UI-Only)
1. **Enrolled Schemes & Courses**:
   - Returns mock array in Candidate Dashboard (`coursesEnrolled: [{ id: 'C101', title: 'Advanced CNC Operator Skilling', progress: 75 }]`).
2. **TC Infrastructure Audit Records**:
   - Static audit rating (`Grade A`) and pre-filled inspection dates in Training Center views.
3. **Government Macro Budget Allocations**:
   - Aggregated financial expenditure numbers in Government analytics cards are computed from preset baseline metrics.
4. **Editorial Trainee Success Stories**:
   - Trainee biographies and photography on the public landing page are static documentary editorial assets.
5. **Demo Seed Personas**:
   - Pre-configured demo profiles (`cand-01` Rahul Sharma, `cand-02` Pooja Patil, `cand-05` Vikas Shinde) embedded to facilitate evaluator testing without manual form entry.

---
*Generated autonomously by Antigravity IDE • Full Codebase Audit Completed Successfully.*
