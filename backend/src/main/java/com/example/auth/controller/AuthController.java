package com.example.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.GoogleLoginRequest;
import com.example.auth.service.GoogleAuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(GoogleAuthService googleAuthService, ObjectMapper objectMapper) {
        this.googleAuthService = googleAuthService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            logger.info("The Request is : role={}", request.getRole());

            AuthResponse response = googleAuthService.loginWithGoogle(
                    request.getCredential(),
                    request.getRole()
            );

            Map<String, Object> responseBody = new LinkedHashMap<>();
            responseBody.put("token", response.getToken());
            responseBody.put("role", response.getRole());
            responseBody.put("status", response.getStatus());
            responseBody.put("user", response.getUser());

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            logger.error("Google login failed | error={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Google login failed",
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            logger.info("The Request is : logout called");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("Logout failed | reason=Authorization token missing");
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Authorization token missing")
                );
            }

            String token = authHeader.substring(7);
            Map<String, Object> response = googleAuthService.logout(token);

            logger.info("The Response is : {}", objectMapper.writeValueAsString(response));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Logout failed | error={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Logout failed",
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/session/check")
    public ResponseEntity<?> checkSession(
            @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("The Request is : session check called");

            String token = authHeader.substring(7);
            Map<String, Object> response = googleAuthService.validateSession(token);

            logger.info("The Response is : {}", objectMapper.writeValueAsString(response));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Session check failed | error={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}