package com.example.auth.service;

import com.example.auth.entity.Auction;
import com.example.auth.entity.PropertyRuleMapping;
import com.example.auth.entity.Rule;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
@Component
public class StatusEngine {
    // Anchor time zone for your business rules
    public static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");
    public LocalDate getToday() {
        return LocalDate.now(BUSINESS_ZONE);
    }
    public LocalDateTime getNow() {
        return LocalDateTime.now(BUSINESS_ZONE);
    }
    /**
     * Checks if a Rule is logically expired based on its validTo date.
     */
    public boolean isRuleExpired(Rule rule) {
        if (rule.getValidTo() == null) return false;
        return getToday().isAfter(rule.getValidTo());
    }
    /**
     * Checks if a PropertyRuleMapping is logically expired based on its effectiveTo date.
     */
    public boolean isMappingExpired(PropertyRuleMapping mapping) {
        if (mapping.getEffectiveTo() == null) return false;
        return getToday().isAfter(mapping.getEffectiveTo());
    }
    /**
     * Dynamically computes the correct status of an Auction.
     */
    public String computeAuctionStatus(Auction auction) {
        if ("CANCELLED".equals(auction.getAuctionStatus())) {
            return "CANCELLED";
        }
        LocalDateTime now = getNow();
        if (auction.getBidCloseDate() != null && now.isAfter(auction.getBidCloseDate())) {
            return "CLOSED";
        }
        if (auction.getBidOpenDate() != null && now.isAfter(auction.getBidOpenDate())) {
            return "OPEN";
        }
        return "UPCOMING";
    }
}