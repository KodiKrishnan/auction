package com.example.auth.service;

import com.example.auth.dto.AuthResponse;
import org.springframework.stereotype.Service;

@Service
public class TokenBrokerService {

    private final GoogleAuthService googleAuthService;

    public TokenBrokerService(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    public AuthResponse handleGoogleLogin(String credential, String role) throws Exception {
        System.out.println("===== TokenBrokerService called =====");
        System.out.println("Role received in broker: " + role);

        AuthResponse response = googleAuthService.loginWithGoogle(credential, role);

        System.out.println("===== TokenBrokerService completed =====");
        return response;
    }
}