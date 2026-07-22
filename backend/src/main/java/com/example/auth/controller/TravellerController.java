package com.example.auth.controller;

import com.example.auth.service.TravellerService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/traveller")
@RequiredArgsConstructor
public class TravellerController {

    private static final Logger log = LoggerFactory.getLogger(TravellerController.class);

    private final TravellerService travellerService;

    @GetMapping("/properties/search")
    public ResponseEntity<Map<String, Object>> searchProperties(
        HttpServletRequest request,
        @RequestParam(required = false) String destination,
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng,
        @RequestParam(required = false, defaultValue = "50.0") Double radius,
        @RequestParam(required = false) Integer guests,
        @RequestParam(required = false) Integer bedrooms,
        @RequestParam(required = false) String propertyType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit) {

    log.info("Traveller search - lat: {}, lng: {}, destination: {}, radius: {}km", lat, lng, destination, radius);
            Long travellerId = (Long) request.getAttribute("travellerId");
    return ResponseEntity.ok(travellerService.searchProperties(
            destination, lat, lng, radius, guests, bedrooms,
            propertyType, checkIn, checkOut, page, limit, travellerId
    ));
}
    
    @GetMapping("/properties")
    public ResponseEntity<Map<String, Object>> getAllProperties(
        HttpServletRequest request,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit) {
    log.info("Traveller get all properties - page: {}, limit: {}", page, limit);
     Long travellerId = (Long) request.getAttribute("travellerId");
    return ResponseEntity.ok(travellerService.getAllProperties(page, limit,travellerId));
}

    @GetMapping("/properties/{id}")
    public ResponseEntity<?> getPropertyDetail(@PathVariable Long id) {
    log.info("Traveller property detail - propertyId: {}", id);
    try {
        return ResponseEntity.ok(travellerService.getPropertyDetail(id));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
    }
}
    @PostMapping("/wishlist/toggle")
    public ResponseEntity<Map<String, Object>> toggleWishlist(
        HttpServletRequest request,
        @RequestParam Long propertyId) {
    Long travellerId = (Long) request.getAttribute("travellerId");
    log.info("Toggle wishlist - travellerId: {}, propertyId: {}", travellerId, propertyId);
    return ResponseEntity.ok(travellerService.toggleWishlist(travellerId, propertyId));
}

    @GetMapping("/wishlist")
    public ResponseEntity<Map<String, Object>> getWishlist(
        HttpServletRequest request,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit) {
    Long travellerId = (Long) request.getAttribute("travellerId");
    log.info("Get wishlist - travellerId: {}", travellerId);
    return ResponseEntity.ok(travellerService.getWishlist(travellerId, page, limit));
}
}