-- =======================================================
-- GOVT PORTAL - SUPABASE POSTGRES DATABASE SCHEMA
-- =======================================================

-- Create Custom Enum Type for User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('candidate', 'training_center', 'government', 'employer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization_name TEXT,
    role user_role NOT NULL DEFAULT 'candidate',
    phone TEXT,
    state TEXT,
    district TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    skill_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trade TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(trade, skill_name)
);

-- 3. MCQ Questions Table
CREATE TABLE IF NOT EXISTS public.mcq_questions (
    question_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES public.skills(skill_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. MCQ Options Table
CREATE TABLE IF NOT EXISTS public.mcq_options (
    option_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES public.mcq_questions(question_id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Trade Skills Table
CREATE TABLE IF NOT EXISTS public.trade_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_name TEXT NOT NULL,
    skill_id BIGINT NOT NULL REFERENCES public.skills(skill_id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL DEFAULT 'Intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(trade_name, skill_id)
);

-- 4. Training Centers Table
CREATE TABLE IF NOT EXISTS public.training_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    center_code TEXT UNIQUE NOT NULL,
    center_name TEXT NOT NULL,
    address TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    accreditation_grade TEXT NOT NULL DEFAULT 'Grade A',
    capacity INT DEFAULT 300,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Employers Table
CREATE TABLE IF NOT EXISTS public.employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry_sector TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    phone TEXT,
    state TEXT,
    district TEXT,
    status TEXT DEFAULT 'Verified Partner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    qualification TEXT,
    preferred_trade TEXT NOT NULL,
    aadhaar_last4 VARCHAR(4),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    status TEXT DEFAULT 'Onboarded',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT UNIQUE NOT NULL,
    batch_title TEXT NOT NULL,
    training_center_id UUID NOT NULL REFERENCES public.training_centers(id) ON DELETE CASCADE,
    trade_name TEXT NOT NULL,
    employer_id UUID REFERENCES public.employers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_seats INT NOT NULL DEFAULT 30,
    enrolled_count INT NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'In Training',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Batch Candidates Junction Table
CREATE TABLE IF NOT EXISTS public.batch_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(batch_id, candidate_id)
);

-- 9. Skill Assessments Table
CREATE TABLE IF NOT EXISTS public.skill_assessments (
    assessment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES public.skills(skill_id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('pre', 'post')),
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Job Postings Table (Exact Requested Schema)
CREATE TABLE IF NOT EXISTS public.job_postings (
    job_id INT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    district TEXT NOT NULL,
    trade TEXT NOT NULL,
    required_skills TEXT[] NOT NULL,
    salary_min INT NOT NULL,
    salary_max INT NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Unified Employment Records Table (Shared Model Across All Portals)
CREATE TABLE IF NOT EXISTS public.employment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    training_center_id UUID REFERENCES public.training_centers(id) ON DELETE SET NULL,
    employer_id UUID REFERENCES public.employers(id) ON DELETE SET NULL,
    self_reported_status TEXT NOT NULL DEFAULT 'Applied' CHECK (self_reported_status IN ('Applied', 'Interviewing', 'Placed', 'Unemployed')),
    self_reported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    employer_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    employer_confirmed_at TIMESTAMP WITH TIME ZONE,
    role_match BOOLEAN DEFAULT TRUE,
    placement_date DATE,
    salary_band TEXT DEFAULT '₹ 20,000 - ₹ 25,000',
    trade TEXT,
    district TEXT,
    scheme TEXT DEFAULT 'PMKVY 4.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(candidate_id)
);

-- 12. Longitudinal Check-Ins Table (30, 90, 180, 365 Days)
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.employment_records(id) ON DELETE CASCADE,
    interval_day INT NOT NULL CHECK (interval_day IN (30, 90, 180, 365)),
    due_date DATE NOT NULL,
    continued_employment_status TEXT DEFAULT 'Still Employed',
    role_match_confirmation BOOLEAN DEFAULT TRUE,
    salary_band_change TEXT DEFAULT 'Same',
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(record_id, interval_day)
);

-- Indexes for Fast Multi-Portal Queries
CREATE INDEX IF NOT EXISTS idx_emp_records_cand ON public.employment_records(candidate_id);
CREATE INDEX IF NOT EXISTS idx_emp_records_tc ON public.employment_records(training_center_id);
CREATE INDEX IF NOT EXISTS idx_emp_records_emp ON public.employment_records(employer_id);
CREATE INDEX IF NOT EXISTS idx_emp_records_status ON public.employment_records(self_reported_status, employer_confirmed);
CREATE INDEX IF NOT EXISTS idx_checkins_record ON public.checkins(record_id);
CREATE INDEX IF NOT EXISTS idx_checkins_due ON public.checkins(due_date, submitted_at);

-- Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.employment_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;

-- Enable RLS & Policies
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read job_postings" ON public.job_postings FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_jobs_trade_district ON public.job_postings(trade, district);

-- 13. Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES public.job_postings(job_id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    application_status TEXT NOT NULL DEFAULT 'Applied' CHECK (application_status IN ('Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected', 'Hired')),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_candidate ON public.job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(application_status);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write job_applications" ON public.job_applications FOR ALL USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;

-- 14. Enrollment Leads Table (Public Pre-login Counseling & Callback Requests)
CREATE TABLE IF NOT EXISTS public.enrollment_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    district TEXT NOT NULL,
    trade TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Counselor Callback',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enrollment_leads_district ON public.enrollment_leads(district);
CREATE INDEX IF NOT EXISTS idx_enrollment_leads_trade ON public.enrollment_leads(trade);
CREATE INDEX IF NOT EXISTS idx_enrollment_leads_status ON public.enrollment_leads(status);

ALTER TABLE public.enrollment_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert enrollment_leads" ON public.enrollment_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read enrollment_leads" ON public.enrollment_leads FOR SELECT USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_leads;

-- =======================================================
-- 15. POST-PLACEMENT RETENTION TRACKING SYSTEM
-- =======================================================

-- Create Enums for Retention Tracking
DO $$ BEGIN
    CREATE TYPE retention_checkpoint_status AS ENUM ('pending', 'verified', 'missed', 'candidate_left');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE retention_verification_method AS ENUM ('candidate_self_report', 'employer_confirmation', 'salary_slip_upload');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.retention_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_application_id UUID REFERENCES public.job_applications(application_id) ON DELETE CASCADE,
    employer_id UUID REFERENCES public.employers(id) ON DELETE SET NULL,
    hire_date DATE NOT NULL,
    checkpoint_day INT NOT NULL CHECK (checkpoint_day IN (30, 90, 180, 365)),
    checkpoint_due_date DATE NOT NULL,
    status retention_checkpoint_status NOT NULL DEFAULT 'pending',
    verification_method retention_verification_method,
    candidate_confirmed BOOLEAN DEFAULT FALSE,
    candidate_confirmed_at TIMESTAMP WITH TIME ZONE,
    employer_confirmed BOOLEAN DEFAULT FALSE,
    employer_confirmed_at TIMESTAMP WITH TIME ZONE,
    salary_slip_url TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(candidate_id, checkpoint_day)
);

CREATE INDEX IF NOT EXISTS idx_retention_cand ON public.retention_tracking(candidate_id);
CREATE INDEX IF NOT EXISTS idx_retention_app ON public.retention_tracking(job_application_id);
CREATE INDEX IF NOT EXISTS idx_retention_emp ON public.retention_tracking(employer_id);
CREATE INDEX IF NOT EXISTS idx_retention_due_status ON public.retention_tracking(checkpoint_due_date, status);
CREATE INDEX IF NOT EXISTS idx_retention_day ON public.retention_tracking(checkpoint_day);

ALTER TABLE public.retention_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read and write retention_tracking" ON public.retention_tracking FOR ALL USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.retention_tracking;

-- Supabase Storage Bucket Setup for Salary Slip Proofs:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('salary-slips', 'salary-slips', true) ON CONFLICT DO NOTHING;

