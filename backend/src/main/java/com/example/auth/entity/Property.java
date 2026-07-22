package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "property_type_id")
    private Long propertyTypeId;

    @Column(name = "property_name")
    private String propertyName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "location_id")
    private Long locationId;

    private String address;

    @Column(name = "locality")
    private String locality;

    private String pincode;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "max_guests")
    private Integer maxGuests;

    private Integer bedrooms;

    @Column(name = "amenity_ids", columnDefinition = "JSON")
    private String amenityIds;

    private Short status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "video_url")
    private String videoUrl;
}