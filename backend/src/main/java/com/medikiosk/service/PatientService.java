package com.medikiosk.service;

import com.medikiosk.model.Patient;
import com.medikiosk.model.PatientRecord;
import com.medikiosk.repository.PatientRecordRepository;
import com.medikiosk.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientRecordRepository patientRecordRepository;

    public PatientService(PatientRepository patientRepository, PatientRecordRepository patientRecordRepository) {
        this.patientRepository = patientRepository;
        this.patientRecordRepository = patientRecordRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public List<Patient> searchPatients(String query) {
        return patientRepository.searchPatients(query);
    }

    public Patient createPatient(Patient patient) {
        // Auto-generate MRN: MK-2026-XXX
        if (patient.getMrn() == null || patient.getMrn().isEmpty()) {
            long count = patientRepository.count() + 1;
            patient.setMrn("MK-2026-" + String.format("%03d", count));
        }
        return patientRepository.save(patient);
    }

    public List<PatientRecord> getRecordsByPatientId(Long patientId) {
        return patientRecordRepository.findByPatientIdOrderByVisitDateDesc(patientId);
    }

    public PatientRecord addPatientRecord(PatientRecord record) {
        return patientRecordRepository.save(record);
    }
}
