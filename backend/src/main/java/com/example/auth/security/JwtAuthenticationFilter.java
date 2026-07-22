package com.example.auth.security;

import com.example.auth.service.GoogleAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final GoogleAuthService googleAuthService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, GoogleAuthService googleAuthService) {
        this.jwtUtil = jwtUtil;
        this.googleAuthService = googleAuthService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/auth/google")
                || path.startsWith("/api/otp")
                || path.startsWith("/actuator")
                || path.startsWith("/uploads")
                || path.startsWith("/api/master")) {  
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authorization token missing");
            return;
        }

        String token = authHeader.substring(7);

        try {
            Long sessionId = jwtUtil.extractSessionId(token);
            String role = jwtUtil.extractRole(token);

            googleAuthService.validateSession(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            sessionId,
                            null,
                            Collections.emptyList()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Long ownerId = null;
            Long travellerId = null;

        if ("OWNER".equalsIgnoreCase(role)) {
        ownerId = googleAuthService.getOwnerIdFromSession(sessionId);
            } else if ("TRAVELLER".equalsIgnoreCase(role)) {
        travellerId = googleAuthService.getTravellerIdFromSession(sessionId);
    }

    request.setAttribute("sessionId", sessionId);
    request.setAttribute("role", role);
    request.setAttribute("ownerId", ownerId);
    request.setAttribute("travellerId", travellerId);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid or expired token: " + e.getMessage());
        }
    }
}