-- ==============================================================================
-- MEDIKIOSK HOSPITAL MANAGEMENT SYSTEM
-- Layer 3: Relational Database Schema (schema.sql)
-- DBMS: MySQL 8.0+ / PostgreSQL 14+ / SQLite 3
-- ==============================================================================

-- Drop tables in reverse dependency order if recreating
DROP TABLE IF EXISTS patient_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE (Authentication & Role-Based Access Control - RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT')),
    reference_id BIGINT DEFAULT NULL, -- links to doctors.id or patients.id if applicable
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. DOCTORS TABLE (Physician Roster, Specializations & Duty Rooms)
-- ------------------------------------------------------------------------------
CREATE TABLE doctors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    department VARCHAR(80) NOT NULL,
    specialization VARCHAR(180) NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    available_days VARCHAR(100) NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    experience_years INT NOT NULL DEFAULT 5,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 3. PATIENTS TABLE (Electronic Demographics & Medical History)
-- ------------------------------------------------------------------------------
CREATE TABLE patients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE,
    mrn VARCHAR(30) NOT NULL UNIQUE, -- Medical Record Number (e.g., MK-2026-001)
    name VARCHAR(150) NOT NULL,
    age INT NOT NULL CHECK (age > 0 AND age <= 125),
    gender VARCHAR(15) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(150),
    address VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(150) NOT NULL,
    allergies TEXT,
    chronic_conditions TEXT,
    registered_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 4. APPOINTMENTS TABLE (OPD Consultation Scheduling & Queue Tokens)
-- ------------------------------------------------------------------------------
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appointment_number VARCHAR(40) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    department VARCHAR(80) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    token_number INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------------------------
-- 5. PATIENT_RECORDS TABLE (Clinical EHR, Diagnosis, Vitals & Prescriptions)
-- ------------------------------------------------------------------------------
CREATE TABLE patient_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    visit_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    chief_complaint VARCHAR(255) NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    blood_pressure VARCHAR(20) NOT NULL, -- e.g. 120/80
    heart_rate INT NOT NULL,              -- bpm
    temperature DECIMAL(4, 1) NOT NULL,   -- °F
    spo2 INT NOT NULL,                    -- %
    weight DECIMAL(5, 2) NOT NULL,        -- kg
    prescriptions_json TEXT NOT NULL,     -- JSON array of prescribed medications
    clinical_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
);

-- Performance Indexes
CREATE INDEX idx_appointments_date_token ON appointments (appointment_date, token_number);
CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_doctor ON appointments (doctor_id);
CREATE INDEX idx_patients_mrn ON patients (mrn);
CREATE INDEX idx_records_patient ON patient_records (patient_id);
