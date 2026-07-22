package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class PropertyDetailResponse {
    private Long propertyId;
    private String propertyName;
    private String propertyType;
    private String propertyTypeIconUrl;
    private String country;
    private String state;
    private String city;
    private String locality;
    private String pincode;
    private String address;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer maxGuests;
    private Integer bedrooms;
    private Short status;
    private String videoUrl; 
    private List<AmenityResponse> amenities;
    private List<ImageResponse> images;
}