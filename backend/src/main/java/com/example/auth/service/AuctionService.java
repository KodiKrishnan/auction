package com.example.auth.service;

import com.example.auth.dto.AuctionCountResponse;
import com.example.auth.dto.AuctionResponse;
import com.example.auth.entity.Auction;
import com.example.auth.repository.AuctionRepository;
import com.example.auth.repository.PropertyRepository;
import com.example.auth.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private static final Logger log = LoggerFactory.getLogger(AuctionService.class);

    private final AuctionRepository auctionRepository;
    private final PropertyRepository propertyRepository;
    private final RuleRepository ruleRepository;

    public Map<String, Object> getAll(Long ownerId, int page, int limit, String status, String search, Long propertyId,
        String sortOrder, String ruleName, LocalDate stayFrom, LocalDate stayTo,BigDecimal minCost, BigDecimal maxCost) {
        Pageable pageable = PageRequest.of(page - 1, limit);

    String actualStatus = (status != null && !status.isEmpty() && !status.equals("ALL")) ? status : null;
    String actualSearch = (search != null && !search.isEmpty()) ? search : null;
    String actualSort = (sortOrder != null && sortOrder.equalsIgnoreCase("DESC")) ? "DESC" : "ASC";
    String actualRuleName = (ruleName != null && !ruleName.isEmpty()) ? ruleName : null;

    Page<Auction> auctionPage = auctionRepository.findWithDynamicFilters(
            ownerId, propertyId, actualStatus, actualSearch, actualRuleName,
            stayFrom, stayTo, minCost, maxCost, actualSort, pageable
    );

    List<AuctionResponse> list = auctionPage.getContent().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());

    Map<String, Object> data = new HashMap<>();
    data.put("total", auctionPage.getTotalElements());
    data.put("page", page);
    data.put("limit", limit);
    data.put("auctions", list);

    return data;
}

    public AuctionResponse getById(Long auctionId, Long ownerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        propertyRepository.findByIdAndOwnerId(auction.getPropertyId(), ownerId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        return toResponse(auction);
    }

    public AuctionResponse cancel(Long auctionId, Long ownerId) {
    Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

    propertyRepository.findByIdAndOwnerId(auction.getPropertyId(), ownerId)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

    if ("CANCELLED".equals(auction.getAuctionStatus())) {
        throw new IllegalArgumentException("Auction is already cancelled");
    }
    if ("CLOSED".equals(auction.getAuctionStatus())) {
        throw new IllegalArgumentException("Cannot cancel a closed auction");
    }
    auction.setAuctionStatus("CANCELLED");
    Auction saved = auctionRepository.save(auction);
    log.info("Auction cancelled - auctionId: {}", auctionId);
    return toResponse(saved);
}

    public AuctionCountResponse getCounts(Long ownerId) {
    List<Auction> auctions = auctionRepository.findAllByOwnerId(ownerId);
    long total = auctions.size();
    long upcoming = auctions.stream().filter(a -> "UPCOMING".equals(a.getAuctionStatus())).count();
    long open = auctions.stream().filter(a -> "OPEN".equals(a.getAuctionStatus())).count();
    long closed = auctions.stream().filter(a -> "CLOSED".equals(a.getAuctionStatus())).count();
    long cancelled = auctions.stream().filter(a -> "CANCELLED".equals(a.getAuctionStatus())).count();
    return new AuctionCountResponse(total, upcoming, open, closed, cancelled);
}

    private AuctionResponse toResponse(Auction auction) {
        String propertyName = propertyRepository.findById(auction.getPropertyId())
                .map(p -> p.getPropertyName())
                .orElse("-");

        String ruleName = ruleRepository.findById(auction.getRuleId())
                .map(r -> r.getRuleName())
                .orElse("-");

        return new AuctionResponse(
                auction.getAuctionId(),
                auction.getOwnerId(),
                auction.getPropertyId(),
                propertyName,
                auction.getRuleId(),
                ruleName,
                auction.getMappingId(),
                auction.getStayStartDate(),
                auction.getStayEndDate(),
                auction.getBidOpenDate(),
                auction.getBidCloseDate(),
                auction.getBaseCost(),
                auction.getBidIncrement(),
                auction.getAuctionStatus(),
                auction.getCreatedAt()
        );
    }
}