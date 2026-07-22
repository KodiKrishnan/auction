package com.example.auth.repository;


import com.example.auth.entity.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyTypeRepository extends JpaRepository<PropertyType, Long> {
    List<PropertyType> findByStatus(Short status);
}