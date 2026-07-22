package com.example.auth.repository;

import com.example.auth.entity.TravellerSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravellerSessionRepository extends JpaRepository<TravellerSession, Long> {
}