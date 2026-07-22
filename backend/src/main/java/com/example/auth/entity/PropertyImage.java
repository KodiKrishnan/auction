package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "property_images")
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}