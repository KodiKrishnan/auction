package com.example.auth.config;
 
import com.example.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
 
@Configuration
public class SecurityConfig {
 
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource; // 1. Added CORS Bean
 
    // 2. Updated Constructor
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }
 
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
 
        http
                // 3. Replaced Customizer.withDefaults() with explicit bean injection
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
 
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
 
                .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public APIs
                .requestMatchers("/auth/google").permitAll()
                .requestMatchers("/api/otp/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/master/**").permitAll()
                .requestMatchers("/api/traveller/**").permitAll()
                .requestMatchers("/api/traveller/properties/**").permitAll()
                

                // Protected APIs
                .requestMatchers("/auth/logout").authenticated()
                 .requestMatchers("/auth/session/check").authenticated()
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/owner/properties/**").authenticated()
                .requestMatchers("/api/rules/**").authenticated()
                .requestMatchers("/api/package-types/**").authenticated()
                .requestMatchers("/api/property-rule-mapping/**").authenticated()
                .requestMatchers("/api/auctions/**").authenticated()
                .requestMatchers("/api/traveller/wishlist/**").authenticated()
               
                .anyRequest().authenticated()
        )
 
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );
 
        return http.build();
    }
}