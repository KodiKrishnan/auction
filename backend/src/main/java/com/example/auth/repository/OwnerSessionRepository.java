package com.example.auth.repository;

import com.example.auth.entity.OwnerSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerSessionRepository extends JpaRepository<OwnerSession, Long> {
}