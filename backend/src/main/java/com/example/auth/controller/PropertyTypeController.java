package com.example.auth.controller;

import com.example.auth.entity.PropertyType;
import com.example.auth.service.PropertyTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
public class PropertyTypeController {

    @Autowired
    private PropertyTypeService service;

    @GetMapping("/property-types")
    public ResponseEntity<?> getAll() {
        List<PropertyType> list = service.getAllActive();
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "data", list
        ));
    }

    @PostMapping("/property-types/{id}/upload-icon")
    public ResponseEntity<?> uploadIcon(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) throws IOException {
        PropertyType updated = service.updateIcon(id, file);
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "data", updated
        ));
    }
}