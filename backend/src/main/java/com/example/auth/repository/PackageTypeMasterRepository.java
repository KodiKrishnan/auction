package com.example.auth.repository;

import com.example.auth.entity.PackageTypeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackageTypeMasterRepository extends JpaRepository<PackageTypeMaster, Long> {

    @Query("SELECT p FROM PackageTypeMaster p WHERE p.ownerId IS NULL OR p.ownerId = :ownerId")
    List<PackageTypeMaster> findAllByOwnerIdOrGlobal(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(p) > 0 FROM PackageTypeMaster p WHERE LOWER(p.name) = LOWER(:name) AND (p.ownerId IS NULL OR p.ownerId = :ownerId)")
    boolean existsByNameIgnoreCaseForOwner(@Param("name") String name, @Param("ownerId") Long ownerId);
}