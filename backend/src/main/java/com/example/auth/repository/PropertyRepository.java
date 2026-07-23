package com.example.auth.repository;

import com.example.auth.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    Optional<Property> findByOwnerIdAndPropertyNameAndLocationId(
        Long ownerId, String propertyName, Long locationId
    );

    Page<Property> findByOwnerId(Long ownerId, Pageable pageable);

    Page<Property> findByOwnerIdAndStatus(Long ownerId, Short status, Pageable pageable);

    Optional<Property> findByIdAndOwnerId(Long id, Long ownerId);

    List<Property> findByOwnerId(Long ownerId);

    @Query("SELECT p FROM Property p JOIN Location l ON p.locationId = l.id " +
           "WHERE p.ownerId = :ownerId AND " +
           "(:search IS NULL OR (LOWER(p.propertyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.city) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Property> searchByOwnerIdAndName(
        @Param("ownerId") Long ownerId,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT p FROM Property p JOIN Location l ON p.locationId = l.id " +
           "WHERE p.ownerId = :ownerId AND p.status = :status AND " +
           "(:search IS NULL OR (LOWER(p.propertyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.city) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Property> searchByOwnerIdAndStatusAndName(
        @Param("ownerId") Long ownerId,
        @Param("status") Short status,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT DISTINCT p FROM Property p " +
        "JOIN Auction a ON a.propertyId = p.id " +
        "JOIN PropertyRuleMapping m ON m.mappingId = a.mappingId " +
        "WHERE p.ownerId = :ownerId " +
        "AND m.status = 1 " +
        "AND (a.auctionStatus = 'OPEN' OR a.auctionStatus = 'UPCOMING') " +
        "AND (:search IS NULL OR LOWER(p.propertyName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "ORDER BY (SELECT MAX(a2.createdAt) FROM Auction a2 WHERE a2.propertyId = p.id) DESC")
    Page<Property> findPropertiesWithAuctions(@Param("ownerId") Long ownerId,
                                          @Param("search") String search,
                                          Pageable pageable);

    // TRAVELLER SEARCH
    @Query(value =
    "SELECT DISTINCT p.* FROM properties p " +
    "JOIN auction a ON a.property_id = p.id " +
    "JOIN property_rule_mapping m ON m.mapping_id = a.mapping_id " +
    "JOIN locations l ON l.id = p.location_id " +

    "WHERE p.status = 1 " +
    "AND m.status = 1 " +
    "AND a.auction_status IN ('OPEN','UPCOMING') " +

    "AND ( " +
    ":destination IS NULL " +
    "OR LOWER(p.property_name) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(l.city) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(l.state) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(l.country) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(p.locality) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(CONCAT(l.city, ', ', l.state)) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(CONCAT(l.city, ', ', l.state, ', ', l.country)) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    ") " +

    "AND (:guests IS NULL OR p.max_guests >= :guests) " +
    "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms) " +
    "AND (:propertyTypeId IS NULL OR p.property_type_id = :propertyTypeId) " +
    "AND (:checkIn IS NULL OR a.stay_start_date < :checkOut) " +
    "AND (:checkOut IS NULL OR a.stay_end_date > :checkIn) " +

    "ORDER BY " +
    "CASE " +
    "WHEN EXISTS (SELECT 1 FROM auction a2 WHERE a2.property_id = p.id AND a2.auction_status='OPEN') THEN 1 " +
    "WHEN EXISTS (SELECT 1 FROM auction a2 WHERE a2.property_id = p.id AND a2.auction_status='UPCOMING') THEN 2 " +
    "ELSE 3 " +
    "END ASC",

    countQuery =
    "SELECT COUNT(DISTINCT p.id) " +
    "FROM properties p " +
    "JOIN auction a ON a.property_id = p.id " +
    "JOIN property_rule_mapping m ON m.mapping_id = a.mapping_id " +
    "JOIN locations l ON l.id = p.location_id " +

    "WHERE p.status = 1 " +
    "AND m.status = 1 " +
    "AND a.auction_status IN ('OPEN','UPCOMING') " +

    "AND ( " +
    ":destination IS NULL " +
    "OR LOWER(p.property_name) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(l.city) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(l.state) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(l.country) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(p.locality) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(CONCAT(l.city, ', ', l.state)) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    "OR LOWER(CONCAT(l.city, ', ', l.state, ', ', l.country)) LIKE LOWER(CONCAT('%', :destination, '%')) " +
    ") " +

    "AND (:guests IS NULL OR p.max_guests >= :guests) " +
    "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms) " +
    "AND (:propertyTypeId IS NULL OR p.property_type_id = :propertyTypeId) " +
    "AND (:checkIn IS NULL OR a.stay_start_date < :checkOut) " +
    "AND (:checkOut IS NULL OR a.stay_end_date > :checkIn)",

    nativeQuery = true)
    Page<Property> searchForTraveller(
        @Param("destination") String destination,
        @Param("guests") Integer guests,
        @Param("bedrooms") Integer bedrooms,
        @Param("propertyTypeId") Long propertyTypeId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        Pageable pageable);

        //Coordinate Search
        @Query("SELECT DISTINCT p FROM Property p " +
        "JOIN Auction a ON a.propertyId = p.id " +
        "JOIN PropertyRuleMapping m ON m.mappingId = a.mappingId " +
        "WHERE p.status = 1 " +
        "AND (a.auctionStatus = 'OPEN' OR a.auctionStatus = 'UPCOMING') " +
        "AND m.status = 1 " +
        "AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL " +
        "AND (6371 * acos(" +
        "cos(radians(:latitude)) * cos(radians(p.latitude)) " +
        "* cos(radians(p.longitude) - radians(:longitude)) " +
        "+ sin(radians(:latitude)) * sin(radians(p.latitude))" +
        ")) <= :radius " +
        "AND (:guests IS NULL OR p.maxGuests >= :guests) " +
        "AND (:bedrooms IS NULL OR p.bedrooms >= :bedrooms) " +
        "AND (:propertyTypeId IS NULL OR p.propertyTypeId = :propertyTypeId) " +
        "AND (:checkIn IS NULL OR a.stayStartDate < :checkOut) " +
        "AND (:checkOut IS NULL OR a.stayEndDate > :checkIn)")
    Page<Property> searchForTravellerByCoordinates(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius,
        @Param("guests") Integer guests,
        @Param("bedrooms") Integer bedrooms,
        @Param("propertyTypeId") Long propertyTypeId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        Pageable pageable);
}