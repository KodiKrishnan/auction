package com.example.auth.service;

import com.example.auth.dto.RuleCountResponse;
import com.example.auth.dto.RuleRequest;
import com.example.auth.dto.RuleResponse;
import com.example.auth.entity.Rule;
import com.example.auth.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;
    private static final Logger log = LoggerFactory.getLogger(RuleService.class);


    // ─── create ─────

    public Map<String, Object> createRule(Long ownerId, RuleRequest request) {

        if (ruleRepository.existsByOwnerIdAndRuleName(ownerId, request.getRuleName())) {
            throw new IllegalArgumentException("Rule name already exists");
        }

        Rule rule = Rule.builder()
                .ownerId(ownerId)
                .ruleName(request.getRuleName())
                .packageTypeId(request.getPackageTypeId())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .checkinDay(request.getCheckinDay())
                .checkoutDay(request.getCheckoutDay())
                .baseCost(request.getBaseCost())
                .bidIncrement(request.getBidIncrement())
                .bidStartBefore(request.getBidStartBefore())
                .bidCloseBefore(request.getBidCloseBefore())
                .status((byte) 1)
                .build();

        rule = ruleRepository.save(rule);

        return Map.of(
                "status", "SUCCESS",
                "message", "Rule created successfully",
                "data", Map.of("ruleId", rule.getId(), "status", rule.getStatus())
        );
    }

    // ─── get all ─────

    public Map<String, Object> getAllRules(Long ownerId, Byte status) {
    List<Rule> rules = (status != null)
            ? ruleRepository.findByOwnerIdAndStatusOrderByUpdatedAtDesc(ownerId, status)
            : ruleRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId);

    List<RuleResponse> data = rules.stream().map(r -> {

        // Auto-disable if expired but status still shows 1
        if (r.getValidTo() != null && 
            r.getValidTo().isBefore(LocalDate.now()) && 
            r.getStatus() == 1) {
            r.setStatus((byte) 0);
            ruleRepository.save(r);
            log.info("Auto-disabled expired rule - ruleId: {}", r.getId());
        }

        return RuleResponse.builder()
                .ruleId(r.getId())
                .ruleName(r.getRuleName())
                .packageTypeId(r.getPackageTypeId())
                .validFrom(r.getValidFrom())
                .validTo(r.getValidTo())
                .checkinDay(r.getCheckinDay())
                .checkoutDay(r.getCheckoutDay())
                .baseCost(r.getBaseCost())
                .bidIncrement(r.getBidIncrement())
                .bidStartBefore(r.getBidStartBefore())
                .bidCloseBefore(r.getBidCloseBefore())
                .status(r.getStatus())
                .build();
    }).toList();

    return Map.of("status", "SUCCESS", "data", data);
}

    // ─── get by id ─────

    public Map<String, Object> getRuleById(Long ownerId, Long ruleId) {
        Rule rule = ruleRepository.findById(ruleId)
                .filter(r -> r.getOwnerId().equals(ownerId))
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        RuleResponse response = RuleResponse.builder()
                .ruleId(rule.getId())
                .ruleName(rule.getRuleName())
                .packageTypeId(rule.getPackageTypeId())
                .validFrom(rule.getValidFrom())
                .validTo(rule.getValidTo())
                .checkinDay(rule.getCheckinDay())
                .checkoutDay(rule.getCheckoutDay())
                .baseCost(rule.getBaseCost())
                .bidIncrement(rule.getBidIncrement())
                .bidStartBefore(rule.getBidStartBefore())
                .bidCloseBefore(rule.getBidCloseBefore())
                .status(rule.getStatus())
                .build();

        return Map.of("status", "SUCCESS", "data", response);
    }

    // ─── update ────

    public Map<String, Object> updateRule(Long ownerId, Long ruleId, RuleRequest request) {
        Rule rule = ruleRepository.findById(ruleId)
                .filter(r -> r.getOwnerId().equals(ownerId))
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        if (request.getRuleName() != null &&
                !request.getRuleName().equals(rule.getRuleName())) {
            if (ruleRepository.existsByOwnerIdAndRuleName(ownerId, request.getRuleName())) {
                throw new IllegalArgumentException("Rule name already exists");
            }
        }

        if (request.getRuleName() != null) rule.setRuleName(request.getRuleName());
        if (request.getPackageTypeId() != null) rule.setPackageTypeId(request.getPackageTypeId());
        if (request.getValidFrom() != null) rule.setValidFrom(request.getValidFrom());
        if (request.getValidTo() != null) rule.setValidTo(request.getValidTo());
        if (request.getCheckinDay() != null) rule.setCheckinDay(request.getCheckinDay());
        if (request.getCheckoutDay() != null) rule.setCheckoutDay(request.getCheckoutDay());
        if (request.getBaseCost() != null) rule.setBaseCost(request.getBaseCost());
        if (request.getBidIncrement() != null) rule.setBidIncrement(request.getBidIncrement());
        if (request.getBidStartBefore() != null) rule.setBidStartBefore(request.getBidStartBefore());
        if (request.getBidCloseBefore() != null) rule.setBidCloseBefore(request.getBidCloseBefore());

        ruleRepository.save(rule);
        return Map.of("status", "SUCCESS", "message", "Rule updated successfully");
    }

    // ─── disable ─

    public Map<String, Object> disableRule(Long ownerId, Long ruleId) {
        Rule rule = ruleRepository.findById(ruleId)
                .filter(r -> r.getOwnerId().equals(ownerId))
                .orElseThrow(() -> new RuntimeException("Rule not found"));
        rule.setStatus((byte) 0);
        ruleRepository.save(rule);
        return Map.of("status", "SUCCESS", "message", "Rule disabled successfully");
    }

    // ─── enable ────

    public Map<String, Object> enableRule(Long ownerId, Long ruleId) {
    Rule rule = ruleRepository.findById(ruleId)
            .filter(r -> r.getOwnerId().equals(ownerId))
            .orElseThrow(() -> new RuntimeException("Rule not found"));

    if (rule.getValidTo().isBefore(LocalDate.now())) {
        throw new IllegalArgumentException(
                "Cannot enable — rule validity expired on " + rule.getValidTo()
        );
    }

    rule.setStatus((byte) 1);
    ruleRepository.save(rule);
    return Map.of("status", "SUCCESS", "message", "Rule enabled successfully");
    }

    // ─── counts ─

    public RuleCountResponse getCounts(Long ownerId) {
        long total = ruleRepository.countByOwnerId(ownerId);
        long active = ruleRepository.countByOwnerIdAndStatus(ownerId, (byte) 1);
        long disabled = ruleRepository.countByOwnerIdAndStatus(ownerId, (byte) 0);
        return new RuleCountResponse(total, active, disabled);
    }
}