package com.example.auth.service;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.UserDto;
import com.example.auth.entity.OwnerSession;
import com.example.auth.entity.PropertyOwner;
import com.example.auth.entity.Traveller;
import com.example.auth.entity.TravellerSession;
import com.example.auth.repository.OwnerSessionRepository;
import com.example.auth.repository.PropertyOwnerRepository;
import com.example.auth.repository.TravellerRepository;
import com.example.auth.repository.TravellerSessionRepository;
import com.example.auth.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleAuthService {

    private final PropertyOwnerRepository propertyOwnerRepository;
    private final TravellerRepository travellerRepository;
    private final OwnerSessionRepository ownerSessionRepository;
    private final TravellerSessionRepository travellerSessionRepository;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    public GoogleAuthService(
            PropertyOwnerRepository propertyOwnerRepository,
            TravellerRepository travellerRepository,
            OwnerSessionRepository ownerSessionRepository,
            TravellerSessionRepository travellerSessionRepository,
            JwtUtil jwtUtil
    ) {
        this.propertyOwnerRepository = propertyOwnerRepository;
        this.travellerRepository = travellerRepository;
        this.ownerSessionRepository = ownerSessionRepository;
        this.travellerSessionRepository = travellerSessionRepository;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse loginWithGoogle(String credential, String role) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(credential);

        if (idToken == null) {
            throw new RuntimeException("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        if ("OWNER".equalsIgnoreCase(role)) {
            return loginOwner(email, name, picture);
        }

        if ("TRAVELLER".equalsIgnoreCase(role)) {
            return loginTraveller(email, name, picture);
        }

        throw new RuntimeException("Invalid role: " + role);
    }

    private AuthResponse loginOwner(String email, String name, String picture) {
        PropertyOwner owner = getOrCreateOwner(email, name, picture);
        LocalDateTime now = LocalDateTime.now();

        OwnerSession session = new OwnerSession();
        session.setOwnerId(owner.getId());
        session.setTokenProvider("GOOGLE");
        session.setDeviceInfo("WEB");
        session.setIpAddress("127.0.0.1");
        session.setLoginTime(now);
        session.setLastActivityTime(now);
        session.setExpiresAt(now.plusHours(24));
        session.setIdleTimeout(60);
        session.setIsActive(true);

        session = ownerSessionRepository.save(session);

        String token = jwtUtil.generateToken(
                session.getId(),
                session.getLoginTime(),
                session.getTokenProvider(),
                "OWNER"
        );

        session.setToken(token);
        ownerSessionRepository.save(session);

        String status = Boolean.FALSE.equals(owner.getProfileCompleted())
                ? "NEW_USER"
                : "EXISTING_USER";

        return new AuthResponse(
                token,
                "OWNER",
                status,
                new UserDto(
                        owner.getId(),
                        owner.getName(),
                        owner.getEmail(),
                        owner.getPictureUrl(),
                        owner.getProfileCompleted()
                )
        );
    }

    private AuthResponse loginTraveller(String email, String name, String picture) {
        Traveller traveller = getOrCreateTraveller(email, name, picture);
        LocalDateTime now = LocalDateTime.now();

        TravellerSession session = new TravellerSession();
        session.setTravellerId(traveller.getId());
        session.setTokenProvider("GOOGLE");
        session.setDeviceInfo("WEB");
        session.setIpAddress("127.0.0.1");
        session.setLoginTime(now);
        session.setLastActivityTime(now);
        session.setExpiresAt(now.plusHours(24));
        session.setIdleTimeout(60);
        session.setIsActive(true);

        session = travellerSessionRepository.save(session);

        String token = jwtUtil.generateToken(
                session.getId(),
                session.getLoginTime(),
                session.getTokenProvider(),
                "TRAVELLER"
        );

        session.setToken(token);
        travellerSessionRepository.save(session);

        String status = Boolean.FALSE.equals(traveller.getProfileCompleted())
                ? "NEW_USER"
                : "EXISTING_USER";

        return new AuthResponse(
                token,
                "TRAVELLER",
                status,
                new UserDto(
                        traveller.getId(),
                        traveller.getName(),
                        traveller.getEmail(),
                        traveller.getPictureUrl(),
                        traveller.getProfileCompleted()
                )
        );
    }

    private PropertyOwner getOrCreateOwner(String email, String name, String picture) {
        Optional<PropertyOwner> existingOwner = propertyOwnerRepository.findByEmail(email);
        PropertyOwner owner;

        if (existingOwner.isPresent()) {
            owner = existingOwner.get();
            owner.setName(name);
            owner.setPictureUrl(picture);
        } else {
            owner = new PropertyOwner();
            owner.setName(name);
            owner.setEmail(email);
            owner.setPictureUrl(picture);
            owner.setStatus("ACTIVE");
            owner.setProfileCompleted(false);
        }

        return propertyOwnerRepository.save(owner);
    }

    private Traveller getOrCreateTraveller(String email, String name, String picture) {
        Optional<Traveller> existingTraveller = travellerRepository.findByEmail(email);
        Traveller traveller;

        if (existingTraveller.isPresent()) {
            traveller = existingTraveller.get();
            traveller.setName(name);
            traveller.setPictureUrl(picture);
        } else {
            traveller = new Traveller();
            traveller.setName(name);
            traveller.setEmail(email);
            traveller.setPictureUrl(picture);
            traveller.setStatus("ACTIVE");
            traveller.setProfileCompleted(false);
        }

        return travellerRepository.save(traveller);
    }

    public Map<String, Object> logout(String token) {
        Long sessionId = jwtUtil.extractSessionId(token);
        String role = jwtUtil.extractRole(token);

        LocalDateTime now = LocalDateTime.now();

        if ("OWNER".equalsIgnoreCase(role)) {
            OwnerSession session = ownerSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Owner session not found"));

            session.setIsActive(false);
            session.setLogoutTime(now);
            ownerSessionRepository.save(session);

            return Map.of(
                    "success", true,
                    "message", "Owner logout successful",
                    "sessionId", sessionId
            );
        }

        if ("TRAVELLER".equalsIgnoreCase(role)) {
            TravellerSession session = travellerSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Traveller session not found"));

            session.setIsActive(false);
            session.setLogoutTime(now);
            travellerSessionRepository.save(session);

            return Map.of(
                    "success", true,
                    "message", "Traveller logout successful",
                    "sessionId", sessionId
            );
        }

        throw new RuntimeException("Invalid role: " + role);
    }

    public Map<String, Object> validateSession(String token) {
        Long sessionId = jwtUtil.extractSessionId(token);
        String role = jwtUtil.extractRole(token);

        if ("OWNER".equalsIgnoreCase(role)) {
            return validateOwnerSession(sessionId);
        }

        if ("TRAVELLER".equalsIgnoreCase(role)) {
            return validateTravellerSession(sessionId);
        }

        throw new RuntimeException("Invalid role: " + role);
    }

    private Map<String, Object> validateOwnerSession(Long sessionId) {
        LocalDateTime now = LocalDateTime.now();

        OwnerSession session = ownerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Owner session not found"));

        if (Boolean.FALSE.equals(session.getIsActive())) {
            throw new RuntimeException("Session is already inactive");
        }

        if (session.getExpiresAt() != null && now.isAfter(session.getExpiresAt())) {
            session.setIsActive(false);
            session.setLogoutTime(now);
            ownerSessionRepository.save(session);
            throw new RuntimeException("Session expired");
        }

        validateOwnerIdleTimeout(session, now);

        session.setLastActivityTime(now);
        ownerSessionRepository.save(session);

        return Map.of(
                "success", true,
                "message", "Owner session valid",
                "sessionId", sessionId
        );
    }

    private void validateOwnerIdleTimeout(OwnerSession session, LocalDateTime now) {
        if (session.getLastActivityTime() == null || session.getIdleTimeout() == null) {
            return;
        }

        LocalDateTime idleExpiryTime = session.getLastActivityTime()
                .plusMinutes(session.getIdleTimeout());

        if (now.isAfter(idleExpiryTime)) {
            session.setIsActive(false);
            session.setLogoutTime(now);
            ownerSessionRepository.save(session);
            throw new RuntimeException("Session expired due to idle timeout");
        }
    }

    private Map<String, Object> validateTravellerSession(Long sessionId) {
        LocalDateTime now = LocalDateTime.now();

        TravellerSession session = travellerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Traveller session not found"));

        if (Boolean.FALSE.equals(session.getIsActive())) {
            throw new RuntimeException("Session is already inactive");
        }

        if (session.getExpiresAt() != null && now.isAfter(session.getExpiresAt())) {
            session.setIsActive(false);
            session.setLogoutTime(now);
            travellerSessionRepository.save(session);
            throw new RuntimeException("Session expired");
        }

        validateTravellerIdleTimeout(session, now);

        session.setLastActivityTime(now);
        travellerSessionRepository.save(session);

        return Map.of(
                "success", true,
                "message", "Traveller session valid",
                "sessionId", sessionId
        );
    }

    private void validateTravellerIdleTimeout(TravellerSession session, LocalDateTime now) {
        if (session.getLastActivityTime() == null || session.getIdleTimeout() == null) {
            return;
        }

        LocalDateTime idleExpiryTime = session.getLastActivityTime()
                .plusMinutes(session.getIdleTimeout());

        if (now.isAfter(idleExpiryTime)) {
            session.setIsActive(false);
            session.setLogoutTime(now);
            travellerSessionRepository.save(session);
            throw new RuntimeException("Session expired due to idle timeout");
        }
    }
    public Long getOwnerIdFromSession(Long sessionId) {
        OwnerSession session = ownerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Owner session not found"));
        return session.getOwnerId();
}
    public Long getTravellerIdFromSession(Long sessionId) {
    TravellerSession session = travellerSessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Traveller session not found"));
    return session.getTravellerId();
}
}