package com.example.auth.scheduler;

import com.example.auth.repository.AuctionRepository;
import com.example.auth.repository.PropertyRuleMappingRepository;
import com.example.auth.repository.RuleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpiryScheduler.class);

    private final RuleRepository ruleRepository;
    private final PropertyRuleMappingRepository mappingRepository;
    private final AuctionRepository auctionRepository;

    // Runs daily at 1 AM — disable expired rules and mappings
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void disableExpiredRulesAndMappings() {
        log.info("Running expiry scheduler - disabling expired rules and mappings");
        int rulesDisabled = ruleRepository.disableExpiredRules(LocalDate.now());
        int mappingsDisabled = mappingRepository.disableExpiredMappings(LocalDate.now());
        log.info("Expiry scheduler completed - rules disabled: {}, mappings disabled: {}", rulesDisabled, mappingsDisabled);
    }

    // Runs every 15 minutes — close expired auctions
    @Scheduled(cron = "0 */15 * * * ?")
    @Transactional
    public void closeExpiredAuctions() {
        log.info("Running auction expiry check");
        int auctionsClosed = auctionRepository.closeExpiredAuctions(LocalDateTime.now());
        log.info("Auction expiry check completed - auctions closed: {}", auctionsClosed);
    }
}