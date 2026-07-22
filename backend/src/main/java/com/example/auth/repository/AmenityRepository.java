package com.example.auth.repository;


import com.example.auth.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    List<Amenity> findByStatus(Short status);
    List<Amenity> findByIdIn(List<Long> ids);
}