package com.example.auth.controller;

import com.example.auth.dto.CompleteProfileRequest;
import com.example.auth.dto.TravellerProfileResponse;
import com.example.auth.dto.TravellerProfileUpdateRequest;
import com.example.auth.entity.Traveller;
import com.example.auth.repository.TravellerRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile/traveller")
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:80",
        "https://uat-nivasabid.theshortlistd.org",
        "http://127.0.0.1:80",
        "http://localhost:5173"
})
public class TravellerProfileController {

    private final TravellerRepository travellerRepository;

    public TravellerProfileController(TravellerRepository travellerRepository) {
        this.travellerRepository = travellerRepository;
    }

    @PostMapping("/complete/{travellerId}")
    public ResponseEntity<?> completeProfile(
            @PathVariable Long travellerId,
            @RequestBody @Valid CompleteProfileRequest request
    ) {
        request.validateAge();
        Optional<Traveller> optionalTraveller = travellerRepository.findById(travellerId);

        if (optionalTraveller.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Traveller not found"));
        }

        Traveller traveller = optionalTraveller.get();
        traveller.setFirstName(request.getFirstName());
        traveller.setLastName(request.getLastName());
        traveller.setPhoneNumber(request.getPhoneNumber());
        traveller.setDob(request.getDob());
        traveller.setName(request.getFirstName() + " " + request.getLastName());
        traveller.setProfileCompleted(true);

        travellerRepository.save(traveller);

        return ResponseEntity.ok(Map.of("message", "Traveller profile completed successfully"));
    }
        // GET PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        Long travellerId = (Long) request.getAttribute("travellerId");
        if (travellerId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized"));
        }

        Traveller traveller = travellerRepository.findById(travellerId)
                .orElse(null);

        if (traveller == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Traveller not found"));
        }

        return ResponseEntity.ok(new TravellerProfileResponse(
                traveller.getId(),
                traveller.getFirstName(),
                traveller.getLastName(),
                traveller.getName(),
                traveller.getEmail(),
                traveller.getPhoneNumber(),
                traveller.getPictureUrl(),
                traveller.getDob(),
                traveller.getProfileCompleted()
        ));
    }

    // UPDATE PROFILE — only firstName, lastName, dob
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            HttpServletRequest request,
            @RequestBody TravellerProfileUpdateRequest updateRequest) {
        Long travellerId = (Long) request.getAttribute("travellerId");
        if (travellerId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized"));
        }

        Traveller traveller = travellerRepository.findById(travellerId)
                .orElse(null);

        if (traveller == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Traveller not found"));
        }

        if (updateRequest.getFirstName() != null) traveller.setFirstName(updateRequest.getFirstName());
        if (updateRequest.getLastName() != null) traveller.setLastName(updateRequest.getLastName());
        if (updateRequest.getDob() != null) traveller.setDob(updateRequest.getDob());

        // Update full name
        String firstName = traveller.getFirstName() != null ? traveller.getFirstName() : "";
        String lastName = traveller.getLastName() != null ? traveller.getLastName() : "";
        traveller.setName((firstName + " " + lastName).trim());

        travellerRepository.save(traveller);

        return ResponseEntity.ok(new TravellerProfileResponse(
                traveller.getId(),
                traveller.getFirstName(),
                traveller.getLastName(),
                traveller.getName(),
                traveller.getEmail(),
                traveller.getPhoneNumber(),
                traveller.getPictureUrl(),
                traveller.getDob(),
                traveller.getProfileCompleted()
        ));
    }
}
