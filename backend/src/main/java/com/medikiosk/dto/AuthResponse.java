package com.medikiosk.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Long referenceId;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, String token, Long userId, String username, String email, String fullName, String role, Long referenceId) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.referenceId = referenceId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
}
