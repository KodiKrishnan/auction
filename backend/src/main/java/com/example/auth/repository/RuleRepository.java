package com.example.auth.repository;

import com.example.auth.entity.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {

    List<Rule> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);
    List<Rule> findByOwnerIdAndStatusOrderByUpdatedAtDesc(Long ownerId, Byte status);
    long countByOwnerId(Long ownerId);
    long countByOwnerIdAndStatus(Long ownerId, Byte status);
    boolean existsByOwnerIdAndRuleName(Long ownerId, String ruleName);

    @Modifying
    @Query("UPDATE Rule r SET r.status = 0 WHERE r.validTo < :today AND r.status = 1")
    int disableExpiredRules(@Param("today") LocalDate today);
}