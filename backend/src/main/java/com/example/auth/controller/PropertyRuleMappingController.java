package com.example.auth.controller;

import com.example.auth.dto.MappingCountResponse;
import com.example.auth.dto.PropertyRuleMappingRequest;
import com.example.auth.dto.PropertyRuleMappingResponse;
import com.example.auth.service.PropertyRuleMappingService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/property-rule-mapping")
@RequiredArgsConstructor
public class PropertyRuleMappingController {

    private static final Logger log = LoggerFactory.getLogger(PropertyRuleMappingController.class);

    private final PropertyRuleMappingService mappingService;

    @PostMapping
    public ResponseEntity<PropertyRuleMappingResponse> create(
            @Valid @RequestBody PropertyRuleMappingRequest request) {
        log.info("Create mapping request - propertyId: {}, ruleId: {}", request.getPropertyId(), request.getRuleId());
        PropertyRuleMappingResponse response = mappingService.create(request);
        log.info("Mapping created successfully - mappingId: {}", response.getMappingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyRuleMappingResponse>> getAll(
        @RequestParam(required = false) String search,
        HttpServletRequest request) {
        Long ownerId = (Long) request.getAttribute("ownerId");
        log.info("Fetching all mappings - ownerId: {}, search: {}", ownerId, search);
        return ResponseEntity.ok(mappingService.getAll(ownerId, search));
}

    @GetMapping("/{propertyId}")
    public ResponseEntity<List<PropertyRuleMappingResponse>> getByPropertyId(
            @PathVariable Long propertyId) {
        log.info("Fetching mappings for propertyId: {}", propertyId);
        return ResponseEntity.ok(mappingService.getByPropertyId(propertyId));
    }

   /* @PutMapping("/{mappingId}")
    public ResponseEntity<PropertyRuleMappingResponse> update(
            @PathVariable Long mappingId,
            @Valid @RequestBody PropertyRuleMappingRequest request) {
        log.info("Update mapping request - mappingId: {}", mappingId);
        PropertyRuleMappingResponse response = mappingService.update(mappingId, request);
        log.info("Mapping updated successfully - mappingId: {}", mappingId);
        return ResponseEntity.ok(response);
    }*/

    @PutMapping("/{mappingId}/enable")
    public ResponseEntity<PropertyRuleMappingResponse> enable(@PathVariable Long mappingId) {
        log.info("Enable mapping - mappingId: {}", mappingId);
        return ResponseEntity.ok(mappingService.enable(mappingId));
    }

    @PutMapping("/{mappingId}/disable")
    public ResponseEntity<PropertyRuleMappingResponse> disable(@PathVariable Long mappingId) {
        log.info("Disable mapping - mappingId: {}", mappingId);
        return ResponseEntity.ok(mappingService.disable(mappingId));
    }
    @GetMapping("/count")
    public ResponseEntity<MappingCountResponse> getCounts(HttpServletRequest request) {
    Long ownerId = (Long) request.getAttribute("ownerId");
        log.info("Fetching mapping counts for ownerId: {}", ownerId);
        return ResponseEntity.ok(mappingService.getCounts(ownerId));
}
}