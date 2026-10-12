package com.medikiosk.repository;

import com.medikiosk.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByDepartmentIgnoreCase(String department);

    Optional<Doctor> findByEmailIgnoreCase(String email);

    Optional<Doctor> findByUserId(Long userId);
}
