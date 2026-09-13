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
