package com.example.auth.controller;

import com.example.auth.dto.RuleCountResponse;
import com.example.auth.dto.RuleRequest;
import com.example.auth.service.RuleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class RuleController {

    private static final Logger log = LoggerFactory.getLogger(RuleController.class);

    private final RuleService ruleService;

    private Long getOwnerId(HttpServletRequest request) {
        return (Long) request.getAttribute("ownerId");
    }

    @PostMapping
    public ResponseEntity<?> createRule(HttpServletRequest request,
                                        @RequestBody @Valid RuleRequest body) {
        return ResponseEntity.ok(ruleService.createRule(getOwnerId(request), body));
    }

    @GetMapping
    public ResponseEntity<?> getAllRules(HttpServletRequest request,
                                        @RequestParam(required = false) Byte status) {
        return ResponseEntity.ok(ruleService.getAllRules(getOwnerId(request), status));
    }

    @GetMapping("/count")
    public ResponseEntity<RuleCountResponse> getCounts(HttpServletRequest request) {
        Long ownerId = getOwnerId(request);
        log.info("Fetching rule counts for ownerId: {}", ownerId);
        return ResponseEntity.ok(ruleService.getCounts(ownerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRuleById(HttpServletRequest request,
                                         @PathVariable Long id) {
        return ResponseEntity.ok(ruleService.getRuleById(getOwnerId(request), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRule(HttpServletRequest request,
                                        @PathVariable Long id,
                                        @RequestBody RuleRequest body) {
        return ResponseEntity.ok(ruleService.updateRule(getOwnerId(request), id, body));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableRule(HttpServletRequest request,
                                         @PathVariable Long id) {
        return ResponseEntity.ok(ruleService.disableRule(getOwnerId(request), id));
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<?> enableRule(HttpServletRequest request,
                                        @PathVariable Long id) {
        return ResponseEntity.ok(ruleService.enableRule(getOwnerId(request), id));
    }
}