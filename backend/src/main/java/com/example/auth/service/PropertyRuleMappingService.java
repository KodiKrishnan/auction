package com.example.auth.service;

import com.example.auth.dto.MappingCountResponse;
import com.example.auth.dto.PropertyRuleMappingRequest;
import com.example.auth.dto.PropertyRuleMappingResponse;
import com.example.auth.entity.PropertyRuleMapping;
import com.example.auth.entity.Rule;
import com.example.auth.repository.AuctionRepository;
import com.example.auth.repository.PropertyRuleMappingRepository;
import com.example.auth.repository.PropertyRepository;
import com.example.auth.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyRuleMappingService {

    private static final Logger log = LoggerFactory.getLogger(PropertyRuleMappingService.class);

    private final PropertyRuleMappingRepository mappingRepository;
    private final PropertyRepository propertyRepository;
    private final RuleRepository ruleRepository;
    private final AuctionRepository auctionRepository;

    private String extractMySQLMessage(Exception e) {
    Throwable cause = e;
    while (cause != null) {
        String msg = cause.getMessage();
        if (msg != null && msg.contains("Overlapping stay period detected")) {
            int idx = msg.indexOf("Overlapping stay period detected");
            if (idx != -1) {
                String extracted = msg.substring(idx);
                
                extracted = extracted.split(";")[0].trim();
                extracted = extracted.split("\\[")[0].trim();
                extracted = extracted.replace("]", "").trim();
                
                return extracted;
            }
        }
        cause = cause.getCause();
    }
    return "Overlapping stay period detected";
}

    // CREATE
    public PropertyRuleMappingResponse create(PropertyRuleMappingRequest request) {

        try {
            mappingRepository.mapPropertyRule(
                    request.getPropertyId(),
                    request.getRuleId(),
                    request.getEffectiveFrom(),
                    request.getEffectiveTo()
            );

        } catch (Exception e) {

            log.error("Property rule mapping failed: {}", e.getMessage());

            String errorMessage = e.getMessage();

            if (errorMessage.contains("Property rule mapping must be within rule validity")) {
                Rule rule = ruleRepository.findById(request.getRuleId()).orElse(null);
                if (rule != null) {
                    throw new IllegalArgumentException(
                            "Effective dates must be within rule validity: " + rule.getValidFrom() + " to " + rule.getValidTo()
                    );
                }
                throw new IllegalArgumentException("Property rule mapping must be within rule validity");
            }

            if (errorMessage.contains("Overlapping stay period detected")) {
                String detail = extractMySQLMessage(e);
                throw new IllegalArgumentException(detail);
            }

            if (errorMessage.contains("Property not found")) {
                throw new IllegalArgumentException("Property not found");
            }

            if (errorMessage.contains("Rule not found or inactive")) {
                throw new IllegalArgumentException("Rule not found or inactive");
            }

            throw new IllegalArgumentException("Property rule mapping failed");
        }

        PropertyRuleMapping saved = mappingRepository.findTopByOrderByMappingIdDesc()
                .orElseThrow(() -> new RuntimeException("Mapping not created"));

        log.info("Property rule mapping created - mappingId: {}", saved.getMappingId());

        return toResponse(saved);
    }

    // GET ALL
    public List<PropertyRuleMappingResponse> getAll(Long ownerId, String search) {
    List<PropertyRuleMapping> mappings = mappingRepository.findAllByOwnerId(ownerId);

    return mappings.stream()
            .filter(m -> {
                if (search == null || search.isEmpty()) return true;
                String keyword = search.toLowerCase();
                String propName = propertyRepository.findById(m.getPropertyId())
                        .map(p -> p.getPropertyName().toLowerCase()).orElse("");
                String ruleName = ruleRepository.findById(m.getRuleId())
                        .map(r -> r.getRuleName().toLowerCase()).orElse("");
                return propName.contains(keyword) || ruleName.contains(keyword);
            })
            .map(this::toResponse)
            .collect(Collectors.toList());
}

    // GET BY PROPERTY ID
    public List<PropertyRuleMappingResponse> getByPropertyId(Long propertyId) {
        return mappingRepository.findByPropertyId(propertyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /* // UPDATE
    public PropertyRuleMappingResponse update(Long mappingId, PropertyRuleMappingRequest request) {

        PropertyRuleMapping mapping = mappingRepository.findById(mappingId)
                .orElseThrow(() -> new RuntimeException("Mapping not found"));

        // Lock mapping if auctions already generated
        boolean auctionsExist = auctionRepository.existsByMappingId(mappingId);
        if (auctionsExist) {
            log.warn("Edit blocked - auctions already generated for mappingId: {}", mappingId);
            throw new IllegalArgumentException(
                    "This mapping cannot be edited because auctions have already been generated for it"
            );
        }

        Rule rule = ruleRepository.findById(request.getRuleId())
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        log.info("Update mapping - mappingId: {}, ruleValidFrom: {}, ruleValidTo: {}, effectiveFrom: {}, effectiveTo: {}",
                mappingId, rule.getValidFrom(), rule.getValidTo(),
                request.getEffectiveFrom(), request.getEffectiveTo());

        if (request.getEffectiveFrom().isBefore(rule.getValidFrom()) ||
                request.getEffectiveTo().isAfter(rule.getValidTo())) {
            throw new IllegalArgumentException(
                    "Effective dates must be within rule validity: " + rule.getValidFrom() + " to " + rule.getValidTo()
            );
        }

        mapping.setPropertyId(request.getPropertyId());
        mapping.setRuleId(request.getRuleId());
        mapping.setEffectiveFrom(request.getEffectiveFrom());
        mapping.setEffectiveTo(request.getEffectiveTo());

        PropertyRuleMapping saved = mappingRepository.save(mapping);

        log.info("Mapping updated - mappingId: {}", mappingId);

        return toResponse(saved);
    }*/

    // ENABLE
    public PropertyRuleMappingResponse enable(Long mappingId) {
    PropertyRuleMapping mapping = mappingRepository.findById(mappingId)
            .orElseThrow(() -> new RuntimeException("Mapping not found"));

    if (mapping.getEffectiveTo().isBefore(LocalDate.now())) {
        throw new IllegalArgumentException(
                "Cannot enable — mapping validity expired on " + mapping.getEffectiveTo()
        );
    } 

    // Block if another active mapping exists for same property + rule + overlapping dates
    boolean conflictExists = mappingRepository.existsActiveOverlappingMapping(
            mapping.getPropertyId(),
            mapping.getRuleId(),
            mapping.getEffectiveFrom(),
            mapping.getEffectiveTo(),
            mappingId
    );

    if (conflictExists) {
        throw new IllegalArgumentException(
                "Cannot enable — an active mapping already exists for the same property and rule in this date range"
        );
    }

    mapping.setStatus((byte) 1);
    PropertyRuleMapping saved = mappingRepository.save(mapping);
    log.info("Mapping enabled - mappingId: {}", mappingId);
    return toResponse(saved);
    }

    // DISABLE
    public PropertyRuleMappingResponse disable(Long mappingId) {

        PropertyRuleMapping mapping = mappingRepository.findById(mappingId)
                .orElseThrow(() -> new RuntimeException("Mapping not found"));

        mapping.setStatus((byte) 0);

        PropertyRuleMapping saved = mappingRepository.save(mapping);

        log.info("Mapping disabled - mappingId: {}", mappingId);

        return toResponse(saved);
    }

    // GET COUNTS
    public MappingCountResponse getCounts(Long ownerId) {

        List<PropertyRuleMapping> mappings = mappingRepository.findAllByOwnerId(ownerId);

        long total = mappings.size();
        long active = mappings.stream().filter(m -> m.getStatus() == 1).count();
        long disabled = mappings.stream().filter(m -> m.getStatus() == 0).count();

        return new MappingCountResponse(total, active, disabled);
    }

    // RESPONSE MAPPER
    private PropertyRuleMappingResponse toResponse(PropertyRuleMapping mapping) {

    String propName = propertyRepository.findById(mapping.getPropertyId())
            .map(p -> p.getPropertyName()).orElse("-");

    String ruleName = ruleRepository.findById(mapping.getRuleId())
            .map(r -> r.getRuleName()).orElse("-");

    boolean hasAuctions = auctionRepository.existsByMappingId(mapping.getMappingId());

    // Auto-disable if expired but status still shows 1
    Byte effectiveStatus = mapping.getStatus();
    if (mapping.getEffectiveTo() != null && 
        mapping.getEffectiveTo().isBefore(LocalDate.now()) && 
        effectiveStatus == 1) {
        effectiveStatus = 0;
        // Also update in DB
        mapping.setStatus((byte) 0);
        mappingRepository.save(mapping);
        log.info("Auto-disabled expired mapping - mappingId: {}", mapping.getMappingId());
    }

    return new PropertyRuleMappingResponse(
            mapping.getMappingId(),
            mapping.getPropertyId(),
            propName,
            mapping.getRuleId(),
            ruleName,
            mapping.getEffectiveFrom(),
            mapping.getEffectiveTo(),
            effectiveStatus,
            mapping.getCreatedAt()
    );
}
}