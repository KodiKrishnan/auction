package com.example.auth.dto;

import com.example.auth.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RuleRequest {

    @NotBlank(message = "Rule name is required")
    private String ruleName;

    @NotNull(message = "Package type is required")
    private Long packageTypeId;

    @NotNull(message = "Valid from date is required")
    @FutureOrPresent(message = "Valid from must not be in the past")
    private LocalDate validFrom;

    @NotNull(message = "Valid to date is required")
    @Future(message = "Valid to must be a future date")
    private LocalDate validTo;

    @NotNull(message = "Checkin day is required")
    private DayOfWeek checkinDay;

    @NotNull(message = "Checkout day is required")
    private DayOfWeek checkoutDay;

    @NotNull(message = "Base cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base cost must be greater than 0")
    private BigDecimal baseCost;

    @NotNull(message = "Bid increment is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Bid increment must be greater than 0")
    private BigDecimal bidIncrement;

    @NotNull(message = "Bid start before is required")
    @Min(value = 1, message = "Bid start before must be at least 1")
    private Integer bidStartBefore;

    @NotNull(message = "Bid close before is required")
    @Min(value = 1, message = "Bid close before must be at least 1")
    private Integer bidCloseBefore;
}