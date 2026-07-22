package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PropertyRuleMappingResponse {

    private Long mappingId;
    private Long propertyId;
    private String propertyName; 
    private Long ruleId;
    private String ruleName;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Byte status;
    private LocalDateTime createdAt;
}