-- ==============================================================================
-- MEDIKIOSK HOSPITAL MANAGEMENT SYSTEM
-- Layer 3: Seed Data Script (data.sql)
-- Proper Credentials:
--   1. ADMIN:   admin@medikiosk.com      | AdminPassword123
--   2. DOCTOR:  dr.jenkins@medikiosk.com | DoctorPassword123
--   3. PATIENT: patient@medikiosk.com    | PatientPassword123
-- ==============================================================================

-- 1. Insert Authentication Users (BCrypt hashed representation)
INSERT INTO users (id, username, email, password_hash, full_name, role, reference_id, is_active) VALUES
(1, 'admin', 'admin@medikiosk.com', '$2a$10$7Zf9qLqK3v7s0VvY8uXnEO3mY9wH0dK6uP7qZ9wX8yV6tO5rE4wKu', 'Chief Administrator Vance', 'ROLE_ADMIN', NULL, TRUE),
(2, 'dr.jenkins', 'dr.jenkins@medikiosk.com', '$2a$10$8Ag0rMrL4w8t1WwZ9vYoFP4nZ0xI1eL7vQ8rA0xY9zW7uP6sF5xLv', 'Dr. Sarah Jenkins, MD', 'ROLE_DOCTOR', 1, TRUE),
(3, 'dr.chen', 'dr.chen@medikiosk.com', '$2a$10$8Ag0rMrL4w8t1WwZ9vYoFP4nZ0xI1eL7vQ8rA0xY9zW7uP6sF5xLv', 'Dr. Robert Chen, FACC', 'ROLE_DOCTOR', 2, TRUE),
(4, 'patient', 'patient@medikiosk.com', '$2a$10$9Bh1sNsM5x9u2XxA0wZpGQ5oA1yJ2fM8wR9sB1yZ0aX8vQ7tG6yMw', 'James Wilson', 'ROLE_PATIENT', 1, TRUE),
(5, 'emily.davis', 'emily.davis@medikiosk.com', '$2a$10$9Bh1sNsM5x9u2XxA0wZpGQ5oA1yJ2fM8wR9sB1yZ0aX8vQ7tG6yMw', 'Emily Davis', 'ROLE_PATIENT', 2, TRUE);

-- 2. Insert Doctors
INSERT INTO doctors (id, user_id, name, email, phone, department, specialization, room_number, consultation_fee, available_days, experience_years) VALUES
(1, 2, 'Dr. Sarah Jenkins', 'dr.jenkins@medikiosk.com', '+1-555-0101', 'General Medicine', 'Internal Medicine & Preventive Care', 'Consultation Suite 101', 50.00, 'Mon,Tue,Wed,Thu,Fri,Sat', 12),
(2, 3, 'Dr. Robert Chen', 'dr.chen@medikiosk.com', '+1-555-0102', 'Cardiology', 'Interventional Cardiology & Hypertension', 'Cardiac OPD 204', 95.00, 'Mon,Wed,Fri', 16),
(3, NULL, 'Dr. Priya Sharma', 'dr.sharma@medikiosk.com', '+1-555-0103', 'Pediatrics', 'Neonatology & Child Immunization', 'Pediatric Wing 108', 65.00, 'Mon,Tue,Thu,Fri,Sat', 10),
(4, NULL, 'Dr. Marcus Vance', 'dr.vance@medikiosk.com', '+1-555-0104', 'Orthopedics', 'Arthroscopy & Joint Replacement', 'Orthopedic Clinic 302', 85.00, 'Tue,Thu,Sat', 15),
(5, NULL, 'Dr. Elena Rostova', 'dr.rostova@medikiosk.com', '+1-555-0105', 'Neurology', 'Neuro-vascular Disorders & Migraine', 'Neuro Center 310', 110.00, 'Mon,Wed,Fri', 18),
(6, NULL, 'Dr. Liam Gallagher', 'dr.gallagher@medikiosk.com', '+1-555-0106', 'Dermatology', 'Medical Dermatology & Allergy Testing', 'Derma Suite 115', 70.00, 'Mon,Tue,Thu,Fri', 9);

-- 3. Insert Patients
INSERT INTO patients (id, user_id, mrn, name, age, gender, blood_group, phone, email, address, emergency_contact, allergies, chronic_conditions, registered_date) VALUES
(1, 4, 'MK-2026-001', 'James Wilson', 48, 'Male', 'O+', '+1-555-0192', 'patient@medikiosk.com', '742 Evergreen Terrace, Springfield', 'Mary Wilson (Spouse) - +1-555-0199', 'Penicillin, Shellfish', 'Primary Essential Hypertension', '2026-01-15'),
(2, 5, 'MK-2026-002', 'Emily Davis', 29, 'Female', 'A+', '+1-555-0245', 'emily.davis@medikiosk.com', '124 Conch Street, Riverdale', 'David Davis (Father) - +1-555-0240', 'No known drug allergies', 'Intermittent Bronchial Asthma', '2026-02-10'),
(3, NULL, 'MK-2026-003', 'Arthur Pendelton', 67, 'Male', 'B+', '+1-555-0371', 'arthur.p@example.com', '88 Oakridge Lane, Fairview', 'Susan Pendelton (Daughter) - +1-555-0372', 'Sulfonamide antibiotics', 'Type 2 Diabetes Mellitus, Bilateral Knee Osteoarthritis', '2026-02-28'),
(4, NULL, 'MK-2026-004', 'Sophia Patel', 8, 'Female', 'AB+', '+1-555-0489', 'anita.patel@example.com', '35 Highland Avenue, Brookline', 'Anita Patel (Mother) - +1-555-0488', 'Peanuts, Tree nuts', 'None', '2026-03-05'),
(5, NULL, 'MK-2026-005', 'Carlos Mendez', 38, 'Male', 'O-', '+1-555-0562', 'carlos.m@example.com', '512 Beacon Street, Boston', 'Lucia Mendez (Sister) - +1-555-0563', 'Aspirin, Ibuprofen', 'Chronic Tension Cephalea', '2026-03-18');

-- 4. Insert Appointments
INSERT INTO appointments (id, appointment_number, patient_id, doctor_id, department, appointment_date, time_slot, reason, status, token_number, notes) VALUES
(1, 'APT-2026-001', 1, 2, 'Cardiology', CURRENT_DATE, '10:00 AM', 'Quarterly hypertension evaluation & ECG review', 'CONFIRMED', 1, 'Patient advised to bring home blood pressure log.'),
(2, 'APT-2026-002', 4, 3, 'Pediatrics', CURRENT_DATE, '10:30 AM', 'Annual pediatric health checkup and vaccination booster', 'CONFIRMED', 2, 'Vaccination record book brought.'),
(3, 'APT-2026-003', 3, 4, 'Orthopedics', CURRENT_DATE, '11:30 AM', 'Right knee pain exacerbation after ascending stairs', 'SCHEDULED', 3, 'Recent weight-bearing X-rays requested.'),
(4, 'APT-2026-004', 2, 1, 'General Medicine', CURRENT_DATE, '02:00 PM', 'Persistent productive cough and evening chills for 4 days', 'SCHEDULED', 4, 'Temperature checked at kiosk triage.'),
(5, 'APT-2026-005', 5, 5, 'Neurology', '2026-10-06', '10:00 AM', 'Sudden visual aura followed by unilateral throbbing headache', 'CONFIRMED', 5, 'Neurological screening scheduled.');

-- 5. Insert Patient Records (Clinical EHR, Vitals, Prescriptions)
INSERT INTO patient_records (id, patient_id, doctor_id, visit_date, chief_complaint, diagnosis, blood_pressure, heart_rate, temperature, spo2, weight, prescriptions_json, clinical_notes, follow_up_date) VALUES
(1, 1, 2, '2026-08-12', 'Exertional dyspnea and mild bilateral ankle swelling', 'Stage 1 Essential Hypertension, compensated', '138/88', 76, 98.4, 98, 82.5,
'[{"id":"rx-1","medicineName":"Amlodipine Besylate","dosage":"5 mg","frequency":"1-0-0 (Morning)","duration":"30 Days","instructions":"Take after breakfast"},{"id":"rx-2","medicineName":"Atorvastatin Calcium","dosage":"10 mg","frequency":"0-0-1 (Night)","duration":"30 Days","instructions":"Take after dinner"}]',
'12-lead resting ECG demonstrates normal sinus rhythm. Advised 30 minutes brisk walking daily, low dietary sodium (<2g/day), and weight optimization.',
'2026-10-05'),

(2, 3, 4, '2026-09-04', 'Stiffness and crepitus in right knee joint', 'Right Knee Grade 2 Osteoarthritis', '132/82', 72, 98.6, 97, 79.0,
'[{"id":"rx-3","medicineName":"Paracetamol (Acetaminophen)","dosage":"650 mg","frequency":"1-0-1 (PRN)","duration":"7 Days","instructions":"Take with food as needed for joint discomfort"},{"id":"rx-4","medicineName":"Glucosamine Sulfate","dosage":"500 mg","frequency":"1-0-1","duration":"60 Days","instructions":"Take with full glass of water"}]',
'Radiograph indicates moderate medial joint space narrowing. Prescribed quadriceps strengthening physiotherapy. Avoid high-impact jogging.',
'2026-10-05'),

(3, 2, 1, '2026-07-20', 'Sore throat, dry hacking cough, low-grade evening fever', 'Acute Viral Pharyngitis', '118/74', 84, 100.2, 99, 58.0,
'[{"id":"rx-5","medicineName":"Azithromycin Di-hydrate","dosage":"500 mg","frequency":"1-0-0","duration":"3 Days","instructions":"Take 1 hour before breakfast"},{"id":"rx-6","medicineName":"Cetirizine Hydrochloride","dosage":"10 mg","frequency":"0-0-1","duration":"5 Days","instructions":"Take at bedtime"}]',
'Pharyngeal erythema noted without purulent exudates. Warm saline gargles three times daily, steam inhalation, and oral hydration encouraged.',
'2026-07-27');
