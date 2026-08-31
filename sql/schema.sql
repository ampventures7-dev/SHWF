-- ============================================================================
-- Student Health Report Card Platform - Phase 1 Database Schema
-- Supabase / PostgreSQL Schema
-- ============================================================================

-- Enable pgcrypto or uuid-ossp for UUID generation if not enabled by default
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. STATES TABLE
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_state_district UNIQUE(state_id, name)
);

-- 3. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    school_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F', 'O')),
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL, -- Stored strictly as TEXT to preserve leading zeros & country code
    parent_email TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_school_student UNIQUE(school_id, student_id)
);

-- ============================================================================
-- INDEXES
-- Optimized for admin uploads, relational queries, and parent OTP lookups (Phase 2)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_schools_school_code ON schools(school_code);
CREATE INDEX IF NOT EXISTS idx_schools_district_id ON schools(district_id);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);
CREATE INDEX IF NOT EXISTS idx_students_school_student ON students(school_id, student_id);

-- ============================================================================
-- 5. OTP REQUESTS TABLE (Phase 2: Parent Authentication)
-- Stores bcrypt-hashed OTP codes, expiration, verification state, and attempt counts
-- ============================================================================
CREATE TABLE IF NOT EXISTS otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    contact TEXT NOT NULL,
    otp_code TEXT NOT NULL, -- Stored as bcrypt hash, NEVER in plaintext
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimized indexes for fast OTP verification and contact-based rate limiting
CREATE INDEX IF NOT EXISTS idx_otp_requests_lookup ON otp_requests(student_id, contact, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_requests_contact_rate ON otp_requests(contact, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_requests_expiry ON otp_requests(expires_at);

-- ============================================================================
-- 6. CAMP RECORDS TABLE (Phase 3: Health Camp Medical Vitals & Extra Multi-Specialty Data)
-- Stores physical measurements (height, weight), clinical observations, and multi-specialty data
-- ============================================================================
CREATE TABLE IF NOT EXISTS camp_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    height_cm NUMERIC(5, 2) NOT NULL CHECK (height_cm > 0),
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    doctor_remarks TEXT NULL,
    camp_extra_data JSONB NULL DEFAULT '{}'::jsonb, -- Multi-specialty data (dental, ENT, vision, pathology, lifestyle)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimized index for retrieving a student's historical and latest camp records
CREATE INDEX IF NOT EXISTS idx_camp_records_student_recorded ON camp_records(student_id, recorded_at DESC);

-- ============================================================================
-- 7. GENERATED REPORTS TABLE (Phase 4: PDF Health Report Cards & Audit Trail)
-- Stores generated PDF report metadata, Supabase storage paths, and signed URLs
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pdf_path TEXT NOT NULL,
    signed_url TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Optimized index for retrieving a student's report history and latest active signed URLs
CREATE INDEX IF NOT EXISTS idx_generated_reports_student ON generated_reports(student_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_expiry ON generated_reports(expires_at);

-- ============================================================================
-- MAINTENANCE & CLEANUP CONCEPT (TODO: Run via pg_cron or scheduled worker)
-- Purge expired OTP requests older than 24 hours:
-- DELETE FROM otp_requests WHERE expires_at < now() - INTERVAL '24 hours';
-- ============================================================================



