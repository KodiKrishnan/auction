package com.example.auth.controller;

import com.example.auth.dto.CompleteProfileRequest;
import com.example.auth.entity.PropertyOwner;
import com.example.auth.repository.PropertyOwnerRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile/owner")
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:80",
        "https://uat-nivasabid.theshortlistd.org",
        "http://127.0.0.1:80",
        "http://localhost:5173"
})
public class OwnerProfileController {

    private final PropertyOwnerRepository propertyOwnerRepository;

    public OwnerProfileController(PropertyOwnerRepository propertyOwnerRepository) {
        this.propertyOwnerRepository = propertyOwnerRepository;
    }

    @PostMapping("/complete/{ownerId}")
    public ResponseEntity<?> completeProfile(
            @PathVariable Long ownerId,
            @RequestBody @Valid CompleteProfileRequest request
    ) {
        request.validateAge();
        Optional<PropertyOwner> optionalOwner = propertyOwnerRepository.findById(ownerId);

        if (optionalOwner.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Owner not found"));
        }

        PropertyOwner owner = optionalOwner.get();
        owner.setFirstName(request.getFirstName());
        owner.setLastName(request.getLastName());
        owner.setPhoneNumber(request.getPhoneNumber());
        owner.setDob(request.getDob());
        owner.setName(request.getFirstName() + " " + request.getLastName());
        owner.setProfileCompleted(true);

        propertyOwnerRepository.save(owner);

        return ResponseEntity.ok(Map.of("message", "Owner profile completed successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        Long ownerId = (Long) request.getAttribute("ownerId");

        if (ownerId == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }

        Optional<PropertyOwner> optionalOwner = propertyOwnerRepository.findById(ownerId);

        if (optionalOwner.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Owner not found"));
        }

        PropertyOwner owner = optionalOwner.get();

        return ResponseEntity.ok(Map.of(
            "id",               owner.getId(),
            "firstName",        owner.getFirstName()   != null ? owner.getFirstName()   : "",
            "lastName",         owner.getLastName()    != null ? owner.getLastName()    : "",
            "email",            owner.getEmail(),
            "phoneNumber",      owner.getPhoneNumber() != null ? owner.getPhoneNumber() : "",
            "dob",              owner.getDob()         != null ? owner.getDob().toString() : "",
            "pictureUrl",       owner.getPictureUrl()  != null ? owner.getPictureUrl()  : "",
            "profileCompleted", owner.getProfileCompleted()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            HttpServletRequest request,
            @RequestBody Map<String, String> body
    ) {
        Long ownerId = (Long) request.getAttribute("ownerId");

        if (ownerId == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }

        Optional<PropertyOwner> optionalOwner = propertyOwnerRepository.findById(ownerId);

        if (optionalOwner.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Owner not found"));
        }

        PropertyOwner owner = optionalOwner.get();

        if (body.containsKey("firstName") && !body.get("firstName").isBlank())
            owner.setFirstName(body.get("firstName"));

        if (body.containsKey("lastName") && !body.get("lastName").isBlank())
            owner.setLastName(body.get("lastName"));

        if (body.containsKey("dob") && !body.get("dob").isBlank())
            owner.setDob(LocalDate.parse(body.get("dob")));

        owner.setName(owner.getFirstName() + " " + owner.getLastName());

        propertyOwnerRepository.save(owner);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
