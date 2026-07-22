package com.example.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(name = "amenities")
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "icon_url")
    private String iconUrl;

    private Short status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}