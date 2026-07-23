package com.example.auth.repository;

import com.example.auth.entity.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    // Combined dynamic filter query — replaces the separate filter methods
    @Query("SELECT a FROM Auction a " +
        "JOIN Property p ON p.id = a.propertyId " +
        "JOIN PropertyRuleMapping m ON m.mappingId = a.mappingId " +
        "LEFT JOIN Rule r ON r.id = a.ruleId " +
        "WHERE a.ownerId = :ownerId " +
        "AND m.status = 1 " +
        "AND (:propertyId IS NULL OR a.propertyId = :propertyId) " +
        "AND (:status IS NULL OR a.auctionStatus = :status) " +
        "AND (:search IS NULL OR LOWER(p.propertyName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.ruleName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "AND (:ruleName IS NULL OR LOWER(r.ruleName) = LOWER(:ruleName)) " +
        "AND (:stayFrom IS NULL OR a.stayStartDate >= :stayFrom) " +
        "AND (:stayTo IS NULL OR a.stayEndDate <= :stayTo) " +
        "AND (:minCost IS NULL OR a.baseCost >= :minCost) " +
        "AND (:maxCost IS NULL OR a.baseCost <= :maxCost) " +
        "ORDER BY CASE WHEN :sortOrder = 'DESC' THEN a.stayStartDate END DESC, " +
        "CASE WHEN :sortOrder = 'ASC' OR :sortOrder IS NULL THEN a.stayStartDate END ASC")
    Page<Auction> findWithDynamicFilters(@Param("ownerId") Long ownerId,
                                     @Param("propertyId") Long propertyId,
                                     @Param("status") String status,
                                     @Param("search") String search,
                                     @Param("ruleName") String ruleName,
                                     @Param("stayFrom") LocalDate stayFrom,
                                     @Param("stayTo") LocalDate stayTo,
                                     @Param("minCost") BigDecimal minCost,
                                     @Param("maxCost") BigDecimal maxCost,
                                     @Param("sortOrder") String sortOrder,
                                     Pageable pageable);
    // Non-paginated for counts
    @Query("SELECT a FROM Auction a " +
        "JOIN Property p ON p.id = a.propertyId " +
        "JOIN PropertyRuleMapping m ON m.mappingId = a.mappingId " +
        "WHERE p.ownerId = :ownerId " +
        "AND m.status = 1")
        List<Auction> findAllByOwnerId(@Param("ownerId") Long ownerId);

    // Check if auctions exist for a mapping — used to lock mapping edits
    boolean existsByMappingId(Long mappingId);

    // GET NEAREST OPEN OR UPCOMING AUCTION FOR TRAVELLER LISTING
        @Query("SELECT a FROM Auction a " +
        "WHERE a.propertyId = :propertyId " +
        "AND a.auctionStatus IN ('OPEN', 'UPCOMING') " +
        "ORDER BY CASE a.auctionStatus " +
        "WHEN 'OPEN' THEN 1 " +
        "WHEN 'UPCOMING' THEN 2 " +
        "ELSE 3 END ASC, a.stayStartDate ASC")
    List<Auction> findActiveAuctionsByPropertyId(@Param("propertyId") Long propertyId,
                                              Pageable pageable);

    // GET NEAREST OPEN OR UPCOMING AUCTION FOR WISHLIST
    @Query("SELECT a FROM Auction a " +
       "WHERE a.propertyId = :propertyId " +
       "AND a.auctionStatus IN ('OPEN', 'UPCOMING') " +
       "ORDER BY a.stayStartDate ASC")
    List<Auction> findActiveAuctionsByPropertyIdForWishlist(
        @Param("propertyId") Long propertyId,
        Pageable pageable);

    // GET ALL OPEN & UPCOMING AUCTIONS FOR PROPERTY DETAIL PAGE
    @Query("SELECT a FROM Auction a " +
       "WHERE a.propertyId = :propertyId " +
       "AND a.auctionStatus IN ('OPEN', 'UPCOMING') " +
       "ORDER BY a.stayStartDate ASC")
    List<Auction> findByPropertyIdAndAuctionsOrderByStayStartDateAsc(
        @Param("propertyId") Long propertyId);

    @Modifying
    @Query("UPDATE Auction a SET a.auctionStatus = 'OPEN' WHERE a.bidOpenDate <= :now AND a.auctionStatus = 'UPCOMING'")
    int openUpcomingAuctions(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Auction a SET a.auctionStatus = 'CLOSED' WHERE a.bidCloseDate < :now AND a.auctionStatus = 'OPEN'")
    int closeExpiredAuctions(@Param("now") LocalDateTime now);

    Optional<Auction> findTopByPropertyIdAndAuctionStatusOrderByStayStartDateAsc(Long propertyId, String auctionStatus);
    List<Auction> findByPropertyIdAndAuctionStatusOrderByStayStartDateAsc(Long propertyId, String auctionStatus);

    // Get nearest auction for property — any status (for wishlist)
    Optional<Auction> findTopByPropertyIdOrderByStayStartDateAsc(Long propertyId);
    Optional<Auction> findTopByPropertyIdOrderByStayStartDateDesc(Long propertyId);
}