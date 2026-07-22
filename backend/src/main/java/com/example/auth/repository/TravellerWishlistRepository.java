package com.example.auth.repository;

import com.example.auth.entity.TravellerWishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravellerWishlistRepository extends JpaRepository<TravellerWishlist, Long> {

    Optional<TravellerWishlist> findByTravellerIdAndPropertyId(Long travellerId, Long propertyId);

    List<TravellerWishlist> findByTravellerIdOrderByCreatedAtDesc(Long travellerId);

    boolean existsByTravellerIdAndPropertyId(Long travellerId, Long propertyId);
}