package com.example.auth.entity;

import com.example.auth.enums.DayOfWeek;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "package_type_id")
    private Long packageTypeId;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkin_day", nullable = false)
    private DayOfWeek checkinDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkout_day", nullable = false)
    private DayOfWeek checkoutDay;

    @Column(name = "base_cost", nullable = false)
    private BigDecimal baseCost;

    @Column(name = "bid_increment", nullable = false)
    private BigDecimal bidIncrement;

    @Column(name = "bid_start_before", nullable = false)
    private Integer bidStartBefore;

    @Column(name = "bid_close_before", nullable = false)
    private Integer bidCloseBefore;

    @Column(nullable = false)
    private Byte status = 1;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}