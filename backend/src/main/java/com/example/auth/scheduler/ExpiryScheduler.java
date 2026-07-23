package com.example.auth.scheduler;

import com.example.auth.repository.AuctionRepository;
import com.example.auth.repository.PropertyRuleMappingRepository;
import com.example.auth.repository.RuleRepository;
import com.example.auth.service.StatusEngine;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
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
    private final StatusEngine statusEngine; 
    /**
     * Runs once whenever the application starts. Ensures any transitions that happened 
     * while the server was turned off are corrected immediately on startup.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void runOnStartup() {
        log.info("Application started - Running startup catch-up sync");
        executeSync("STARTUP_SYNC");
    }
    /**
     * Runs every 30 seconds to update database status columns in the background.
     */
    @Scheduled(cron = "0/30 * * * * ?") 
    @Transactional
    public void runPeriodicSync() {
        log.debug("Running periodic expiry checking job...");
        executeSync("PERIODIC_SYNC");
    }
    private void executeSync(String triggerSource) {
        LocalDate today = statusEngine.getToday();
        LocalDateTime now = statusEngine.getNow();
        // 1. Disable expired rules
        int rulesDisabled = ruleRepository.disableExpiredRules(today);
        // 2. Disable expired property-rule mappings
        int mappingsDisabled = mappingRepository.disableExpiredMappings(today);
        // 3. Change UPCOMING -> OPEN
        int opened = auctionRepository.openUpcomingAuctions(now);
        // 4. Change OPEN -> CLOSED
        int closed = auctionRepository.closeExpiredAuctions(now);
        if (rulesDisabled > 0 || mappingsDisabled > 0 || opened > 0 || closed > 0) {
            log.info("Scheduler Sync Completed [{}] - Rules Disabled: {}, Mappings Disabled: {}, Auctions Opened: {}, Auctions Closed: {}",
                    triggerSource, rulesDisabled, mappingsDisabled, opened, closed);
        }
    }
}