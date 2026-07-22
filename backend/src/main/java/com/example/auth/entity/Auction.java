package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_id")
    private Long auctionId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "rule_id", nullable = false)
    private Long ruleId;

    @Column(name = "mapping_id", nullable = false)
    private Long mappingId;

    @Column(name = "stay_start_date", nullable = false)
    private LocalDate stayStartDate;

    @Column(name = "stay_end_date", nullable = false)
    private LocalDate stayEndDate;

    @Column(name = "bid_open_date", nullable = false)
    private LocalDateTime bidOpenDate;

    @Column(name = "bid_close_date", nullable = false)
    private LocalDateTime bidCloseDate;

    @Column(name = "base_cost", nullable = false)
    private BigDecimal baseCost;

    @Column(name = "bid_increment", nullable = false)
    private BigDecimal bidIncrement;

    @Column(name = "auction_status")
    private String auctionStatus;

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