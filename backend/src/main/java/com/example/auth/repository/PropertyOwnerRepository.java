package com.example.auth.repository;

import com.example.auth.entity.PropertyOwner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PropertyOwnerRepository extends JpaRepository<PropertyOwner, Long> {
    Optional<PropertyOwner> findByEmail(String email);
}