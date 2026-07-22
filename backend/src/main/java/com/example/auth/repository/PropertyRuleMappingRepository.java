package com.example.auth.repository;

import com.example.auth.entity.PropertyRuleMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRuleMappingRepository
        extends JpaRepository<PropertyRuleMapping, Long> {

    List<PropertyRuleMapping> findByPropertyId(Long propertyId);

    long countByPropertyIdIn(List<Long> propertyIds);

    long countByPropertyIdInAndStatus(
            List<Long> propertyIds,
            Byte status
    );

    // CALL STORED PROCEDURE
    @Transactional
    @Modifying
    @Query(
            value =
                    "CALL usp_MapPropertyRule(" +
                    ":propertyId, " +
                    ":ruleId, " +
                    ":effectiveFrom, " +
                    ":effectiveTo" +
                    ")",
            nativeQuery = true
    )
    void mapPropertyRule(
            @Param("propertyId") Long propertyId,
            @Param("ruleId") Long ruleId,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo") LocalDate effectiveTo
    );

    Optional<PropertyRuleMapping> findTopByOrderByMappingIdDesc();

    @Query("""
        SELECT m
        FROM PropertyRuleMapping m
        JOIN Property p
            ON p.id = m.propertyId
        WHERE p.ownerId = :ownerId
        ORDER BY m.updatedAt DESC
    """)
    List<PropertyRuleMapping> findAllByOwnerId(
            @Param("ownerId") Long ownerId
    );

        @Modifying
        @Query("UPDATE PropertyRuleMapping m SET m.status = 0 WHERE m.effectiveTo < :today AND m.status = 1")
        int disableExpiredMappings(@Param("today") LocalDate today);

     // Check if another active mapping exists for same property + rule + overlapping dates
    @Query("SELECT COUNT(m) > 0 FROM PropertyRuleMapping m " +
           "WHERE m.propertyId = :propertyId " +
           "AND m.ruleId = :ruleId " +
           "AND m.status = 1 " +
           "AND m.mappingId != :excludeId " +
           "AND m.effectiveFrom <= :effectiveTo " +
           "AND m.effectiveTo >= :effectiveFrom")
    boolean existsActiveOverlappingMapping(
            @Param("propertyId") Long propertyId,
            @Param("ruleId") Long ruleId,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo") LocalDate effectiveTo,
            @Param("excludeId") Long excludeId
    );
}