package com.medikiosk.repository;

import com.medikiosk.model.PatientRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRecordRepository extends JpaRepository<PatientRecord, Long> {

    List<PatientRecord> findByPatientIdOrderByVisitDateDesc(Long patientId);

    List<PatientRecord> findByDoctorIdOrderByVisitDateDesc(Long doctorId);
}
