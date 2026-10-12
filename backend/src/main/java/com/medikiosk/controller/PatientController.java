package com.medikiosk.controller;

import com.medikiosk.model.Patient;
import com.medikiosk.model.PatientRecord;
import com.medikiosk.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(patientService.searchPatients(search));
        }
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@Valid @RequestBody Patient patient) {
        Patient saved = patientService.createPatient(patient);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/records")
    public ResponseEntity<List<PatientRecord>> getPatientRecords(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getRecordsByPatientId(id));
    }

    @PostMapping("/{id}/records")
    public ResponseEntity<PatientRecord> addPatientRecord(@PathVariable Long id, @RequestBody PatientRecord record) {
        Patient patient = patientService.getPatientById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        record.setPatient(patient);
        PatientRecord saved = patientService.addPatientRecord(record);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
