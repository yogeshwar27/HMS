package com.medikiosk.controller;

import com.medikiosk.dto.AuthResponse;
import com.medikiosk.dto.LoginRequest;
import com.medikiosk.model.User;
import com.medikiosk.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Authenticates Admin, Doctor, or Patient credentials
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String identifier = request.getUsername().trim().toLowerCase();
        String password = request.getPassword().trim();

        // Find user by username or email
        Optional<User> userOpt = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Invalid credentials. User not found.", null, null, null, null, null, null, null));
        }

        User user = userOpt.get();

        // Verify password (in production, use BCryptPasswordEncoder.matches(password, user.getPasswordHash()))
        boolean passwordValid = false;
        if (user.getRole().equals("ROLE_ADMIN") && (password.equals("AdminPassword123") || password.equals("admin123") || password.equals("admin"))) {
            passwordValid = true;
        } else if (user.getRole().equals("ROLE_DOCTOR") && (password.equals("DoctorPassword123") || password.equals("doctor123") || password.equals("doctor"))) {
            passwordValid = true;
        } else if (user.getRole().equals("ROLE_PATIENT") && (password.equals("PatientPassword123") || password.equals("patient123") || password.equals("patient"))) {
            passwordValid = true;
        }

        if (!passwordValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Invalid password entered.", null, null, null, null, null, null, null));
        }

        String mockJwt = "jwt-session-" + user.getRole().toLowerCase() + "-" + System.currentTimeMillis();

        return ResponseEntity.ok(new AuthResponse(
                true,
                "Authentication successful",
                mockJwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getReferenceId()
        ));
    }
}
