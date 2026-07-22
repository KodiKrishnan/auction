package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class AuthResponse {

    @JsonIgnore
    private String token;

    private String role;
    private String status;
    private Object user;

    public AuthResponse() {
    }

    public AuthResponse(String token, String role, String status, Object user) {
        this.token = token;
        this.role = role;
        this.status = status;
        this.user = user;
    }

    @JsonIgnore
    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public Object getUser() {
        return user;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUser(Object user) {
        this.user = user;
    }
}