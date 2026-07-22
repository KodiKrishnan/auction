package com.example.auth.controller;

import com.example.auth.dto.PackageTypeRequest;
import com.example.auth.dto.PackageTypeResponse;
import com.example.auth.service.PackageTypeService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/package-types")
@RequiredArgsConstructor
public class PackageTypeController {

    private final PackageTypeService packageTypeService;

   @GetMapping
    public ResponseEntity<List<PackageTypeResponse>> getAll(HttpServletRequest request) {
        Long ownerId = (Long) request.getAttribute("ownerId");
        return ResponseEntity.ok(packageTypeService.getAll(ownerId));
    }
     @PostMapping
    public ResponseEntity<PackageTypeResponse> create(@Valid @RequestBody PackageTypeRequest packageTypeRequest,
        HttpServletRequest request) {
        Long ownerId = (Long) request.getAttribute("ownerId");
        return ResponseEntity.status(HttpStatus.CREATED).body(packageTypeService.create(packageTypeRequest, ownerId));
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<PackageTypeResponse> enable(@PathVariable Long id) {
        return ResponseEntity.ok(packageTypeService.enable(id));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<PackageTypeResponse> disable(@PathVariable Long id) {
        return ResponseEntity.ok(packageTypeService.disable(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
    Long ownerId = (Long) request.getAttribute("ownerId");
    packageTypeService.delete(id, ownerId);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Package type deleted"));
}
}