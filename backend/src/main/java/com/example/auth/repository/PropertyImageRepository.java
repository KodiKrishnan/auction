package com.example.auth.repository;

import com.example.auth.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {
    Optional<PropertyImage> findByPropertyIdAndIsPrimary(Long propertyId, Boolean isPrimary);
    List<PropertyImage> findByPropertyId(Long propertyId);
    Optional<PropertyImage> findByIdAndPropertyId(Long id, Long propertyId);
}
