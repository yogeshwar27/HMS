package com.medikiosk.repository;

import com.medikiosk.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);

    List<Appointment> findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(Long doctorId, LocalDate date);

    List<Appointment> findByAppointmentDateOrderByTokenNumberAsc(LocalDate date);

    List<Appointment> findByStatus(String status);

    @Query("SELECT COALESCE(MAX(a.tokenNumber), 0) + 1 FROM Appointment a WHERE a.appointmentDate = :date")
    Integer getNextTokenNumberForDate(@Param("date") LocalDate date);

    @Query(value = "SELECT department, COUNT(*) AS count FROM appointments WHERE appointment_date = :date GROUP BY department", nativeQuery = true)
    List<Object[]> countAppointmentsByDepartment(@Param("date") LocalDate date);
}
