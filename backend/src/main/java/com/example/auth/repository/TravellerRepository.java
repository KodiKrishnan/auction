package com.example.auth.repository;

import com.example.auth.entity.Traveller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TravellerRepository extends JpaRepository<Traveller, Long> {
    Optional<Traveller> findByEmail(String email);
}