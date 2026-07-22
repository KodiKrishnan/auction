package com.example.auth.controller;

import com.example.auth.entity.Amenity;
import com.example.auth.service.AmenityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
public class AmenityController {

    @Autowired
    private AmenityService service;

    @GetMapping("/amenities")
    public ResponseEntity<?> getAll() {
        List<Amenity> list = service.getAllActive();
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "data", list
        ));
    }

    @PostMapping("/amenities/{id}/upload-icon")
    public ResponseEntity<?> uploadIcon(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) throws IOException {
        Amenity updated = service.updateIcon(id, file);
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "data", updated
        ));
    }
}