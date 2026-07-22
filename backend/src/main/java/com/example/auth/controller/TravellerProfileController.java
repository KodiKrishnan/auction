package com.example.auth.controller;

import com.example.auth.dto.CompleteProfileRequest;
import com.example.auth.entity.Traveller;
import com.example.auth.repository.TravellerRepository;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile/traveller")
@CrossOrigin(origins = "http://localhost:5173")
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
}