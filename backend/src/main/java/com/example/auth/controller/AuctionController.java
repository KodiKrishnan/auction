package com.example.auth.controller;

import com.example.auth.dto.AuctionCountResponse;
import com.example.auth.dto.AuctionResponse;
import com.example.auth.service.AuctionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private static final Logger log = LoggerFactory.getLogger(AuctionController.class);

    private final AuctionService auctionService;

   @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
        HttpServletRequest request,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Long propertyId,
        @RequestParam(required = false) String sortOrder,
        @RequestParam(required = false) String ruleName,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayTo,
        @RequestParam(required = false) BigDecimal minCost,
        @RequestParam(required = false) BigDecimal maxCost) {
    Long ownerId = (Long) request.getAttribute("ownerId");
    log.info("Fetching auctions - ownerId: {}, propertyId: {}, ruleName: {}, stayFrom: {}, stayTo: {}, minCost: {}, maxCost: {}",
            ownerId, propertyId, ruleName, stayFrom, stayTo, minCost, maxCost);
    return ResponseEntity.ok(auctionService.getAll(ownerId, page, limit, status, search, propertyId,
            sortOrder, ruleName, stayFrom, stayTo, minCost, maxCost));
}

    @GetMapping("/count")
    public ResponseEntity<AuctionCountResponse> getCounts(HttpServletRequest request) {
        Long ownerId = (Long) request.getAttribute("ownerId");
        log.info("Fetching auction counts - ownerId: {}", ownerId);
        return ResponseEntity.ok(auctionService.getCounts(ownerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getById(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long ownerId = (Long) request.getAttribute("ownerId");
        log.info("Fetching auction - auctionId: {}, ownerId: {}", id, ownerId);
        return ResponseEntity.ok(auctionService.getById(id, ownerId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AuctionResponse> cancel(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long ownerId = (Long) request.getAttribute("ownerId");
        log.info("Cancelling auction - auctionId: {}, ownerId: {}", id, ownerId);
        return ResponseEntity.ok(auctionService.cancel(id, ownerId));
    }
}