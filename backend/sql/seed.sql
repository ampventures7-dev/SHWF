-- ============================================================================
-- Student Health Report Card Platform - Phase 1 Seed Data
-- ============================================================================

-- Clean up test records (optional for re-seeding)
-- TRUNCATE TABLE states CASCADE;

-- Insert States
INSERT INTO states (id, name) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Maharashtra'),
    ('a0000000-0000-0000-0000-000000000002', 'Karnataka'),
    ('a0000000-0000-0000-0000-000000000003', 'Delhi')
ON CONFLICT (name) DO NOTHING;

-- Insert Districts
INSERT INTO districts (id, state_id, name) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Mumbai Suburban'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Pune'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Bengaluru Urban'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'South Delhi')
ON CONFLICT (state_id, name) DO NOTHING;

-- Insert Schools with Unique School Codes
INSERT INTO schools (id, district_id, name, school_code) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'St. Xavier Public School', 'SCH001'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Greenwood High School', 'SCH002'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Pune Model Academy', 'SCH003'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'National Valley School', 'SCH101'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'Delhi Public School South', 'SCH201')
ON CONFLICT (school_code) DO NOTHING;

-- Insert Sample Students for Phase 2 Search & OTP Testing
INSERT INTO students (id, school_id, student_id, full_name, date_of_birth, gender, parent_name, parent_phone, parent_email) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'STD-2026-001', 'Aarav Sharma', '2014-06-15', 'M', 'Rajesh Sharma', '+919876543210', 'rajesh.sharma@example.com'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'STD-2026-002', 'Ananya Patel', '2015-08-22', 'F', 'Meera Patel', '09812345678', 'meera.patel@example.com'),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'STD-2026-003', 'Rohan Verma', '2013-04-10', 'M', 'Suresh Verma', '09876543210', 'suresh@example.com')
ON CONFLICT (school_id, student_id) DO NOTHING;

-- Insert Sample Camp Records for Phase 3 ML Risk Engine & Phase 4 Report Cards Testing
INSERT INTO camp_records (id, student_id, height_cm, weight_kg, recorded_at, doctor_remarks, camp_extra_data) VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        138.5,
        31.0,
        '2026-08-15 09:30:00+00',
        'Mild undernutrition indicated; recommended high protein and balanced diet.',
        '{
            "general_exam": {"temperature": "98.4", "pulse": "78", "respiration": "18", "blood_pressure": "110/70", "last_deworming": "2026-02-10"},
            "physical_exam": {"pallor": false, "jaundice": false, "clubbing": false, "spo2": "99", "lap": false, "skin": "Clear", "allergy": false, "allergy_specify": "N/A", "nutrition": "Fair", "heart_sound": "Normal S1 S2", "chest": "Clear", "other_findings": "None"},
            "dental": {"status": "Fair", "caries": false, "gum_condition": "Healthy", "other_findings": "Mild plaque"},
            "ent": {"nose": "Normal", "throat": "Clear", "ear_right": "Normal", "ear_left": "Normal", "audiometry": "Normal"},
            "eye": {"right_sph": "Plano", "right_cyl": "0.0", "right_axis": "0", "right_vision": "6/6", "left_sph": "Plano", "left_cyl": "0.0", "left_axis": "0", "left_vision": "6/6", "color_vision": "Normal", "screening": "Normal"},
            "hearing": {"right_ear": "Normal", "left_ear": "Normal"},
            "vaccination": {"status": "Up to Date"},
            "lifestyle": {"diet_pattern": "Average", "physical_activity": "Active", "sleep_pattern": "Good"},
            "pathology": {"blood_group": "B+", "hemoglobin": "12.4", "cholesterol": "145"},
            "student_meta": {"class_name": "7th", "section": "A", "father_name": "Rajesh Sharma", "mother_name": "Sunita Sharma", "address": "Flat 402, Shanti Heights, Andheri East, Mumbai", "emergency_contact": "+919876543210", "aadhaar_no": "XXXX-XXXX-1234"}
        }'::jsonb
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000002',
        134.0,
        27.5,
        '2026-08-15 10:15:00+00',
        'Normal growth metrics within expected standard deviation.',
        '{
            "general_exam": {"temperature": "98.6", "pulse": "82", "respiration": "20", "blood_pressure": "105/68", "last_deworming": "2026-03-01"},
            "physical_exam": {"pallor": false, "jaundice": false, "clubbing": false, "spo2": "98", "lap": false, "skin": "Clear", "allergy": false, "nutrition": "Good", "heart_sound": "Normal", "chest": "Clear"},
            "dental": {"status": "Good", "caries": false, "gum_condition": "Normal"},
            "ent": {"nose": "Normal", "throat": "Normal", "ear_right": "Normal", "ear_left": "Normal"},
            "eye": {"right_vision": "6/6", "left_vision": "6/6", "color_vision": "Normal", "screening": "Normal"},
            "vaccination": {"status": "Up to Date"},
            "lifestyle": {"diet_pattern": "Good", "physical_activity": "Active", "sleep_pattern": "Good"},
            "pathology": {"blood_group": "O+", "hemoglobin": "13.1", "cholesterol": "138"},
            "student_meta": {"class_name": "6th", "section": "B", "father_name": "Meera Patel", "mother_name": "Anil Patel", "address": "B-12, Green Park Society, Bandra, Mumbai", "emergency_contact": "09812345678"}
        }'::jsonb
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000003',
        142.0,
        48.0,
        '2026-08-16 11:00:00+00',
        'Elevated BMI-for-age; suggested increased physical activity.',
        '{
            "general_exam": {"temperature": "98.2", "pulse": "80", "respiration": "19", "blood_pressure": "115/75", "last_deworming": "2026-01-15"},
            "physical_exam": {"pallor": false, "jaundice": false, "clubbing": false, "spo2": "99", "lap": false, "nutrition": "Overnourished"},
            "lifestyle": {"diet_pattern": "Average", "physical_activity": "Sedentary", "sleep_pattern": "Good"},
            "pathology": {"blood_group": "A+", "hemoglobin": "13.8", "cholesterol": "172"}
        }'::jsonb
    )
ON CONFLICT (id) DO NOTHING;



