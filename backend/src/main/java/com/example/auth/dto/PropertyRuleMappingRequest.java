package com.example.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PropertyRuleMappingRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Rule ID is required")
    private Long ruleId;

    @NotNull(message = "Effective from is required")
    private LocalDate effectiveFrom;

    @NotNull(message = "Effective to is required")
    private LocalDate effectiveTo;
}