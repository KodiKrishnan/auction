package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuctionResponse {
    private Long auctionId;
    private Long owner_id;
    private Long propertyId;
    private String propertyName;
    private Long ruleId;
    private String ruleName;
    private Long mappingId;
    private LocalDate stayStartDate;
    private LocalDate stayEndDate;
    private LocalDateTime bidOpenDate;
    private LocalDateTime bidCloseDate;
    private BigDecimal baseCost;
    private BigDecimal bidIncrement;
    private String auctionStatus;
    private LocalDateTime createdAt;
}