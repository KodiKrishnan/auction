package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "traveller_wishlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravellerWishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "traveller_id", nullable = false)
    private Long travellerId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}