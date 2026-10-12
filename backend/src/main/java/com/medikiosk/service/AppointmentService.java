package com.medikiosk.service;

import com.medikiosk.model.Appointment;
import com.medikiosk.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getTodayQueue() {
        return appointmentRepository.findByAppointmentDateOrderByTokenNumberAsc(LocalDate.now());
    }

    public Appointment bookAppointment(Appointment appointment) {
        // Allocate next atomic sequential token number
        Integer nextToken = appointmentRepository.getNextTokenNumberForDate(appointment.getAppointmentDate());
        appointment.setTokenNumber(nextToken);
        
        // Generate systematic appointment tracking number (e.g. APT-2026-9812)
        if (appointment.getAppointmentNumber() == null || appointment.getAppointmentNumber().isEmpty()) {
            String apptNo = "APT-2026-" + String.format("%04d", (System.currentTimeMillis() % 10000));
            appointment.setAppointmentNumber(apptNo);
        }
        
        if (appointment.getStatus() == null) {
            appointment.setStatus("CONFIRMED");
        }

        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long id, String status) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
        appt.setStatus(status);
        return appointmentRepository.save(appt);
    }

    public void cancelAppointment(Long id) {
        updateStatus(id, "CANCELLED");
    }
}
