package com.example.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.example.auth.enums.DayOfWeek;

@Data
@Builder
@JsonPropertyOrder({
    "ruleId",
    "ruleName",
    "packageTypeId",
    "validFrom",
    "validTo",
    "checkinDay",
    "checkoutDay",
    "baseCost",
    "bidIncrement",
    "bidStartBefore",
    "bidCloseBefore",
    "status"
})
public class RuleResponse {

    private Long ruleId;
    private String ruleName;
    private Long packageTypeId;
    private LocalDate validFrom;
    private LocalDate validTo;
    private DayOfWeek checkinDay;
    private DayOfWeek checkoutDay;
    private BigDecimal baseCost;
    private BigDecimal bidIncrement;
    private Integer bidStartBefore;
    private Integer bidCloseBefore;
    private Byte status;
}