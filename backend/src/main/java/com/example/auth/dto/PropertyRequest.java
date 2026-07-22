package com.example.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PropertyRequest {

    @NotNull(message = "Property type is required")
    private Long propertyTypeId;

    @NotBlank(message = "Property name is required")
    @Size(min = 5, max = 100,
            message = "Property name must be between 5 and 100 characters")
    private String propertyName;

    @NotBlank(message = "Description is required")
    @Size(max = 5000,
            message = "Description must not exceed 5000 characters")
    private String description;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Locality is required")
    private String locality;

    @NotBlank(message = "Address is required")
    @Size(max = 255,
            message = "Address must not exceed 255 characters")
    private String address;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[0-9]{6}$",
            message = "Pincode must be a 6-digit number")
    private String pincode;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0",
            message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0",
            message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0",
            message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0",
            message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    @NotNull(message = "Max guests is required")
    @Min(value = 1,
            message = "Max guests must be at least 1")
    @Max(value = 100,
            message = "Max guests must not exceed 100")
    private Integer maxGuests;

    @NotNull(message = "Bedrooms is required")
    @Min(value = 1,
            message = "Bedrooms must be at least 1")
    @Max(value = 50,
            message = "Bedrooms must not exceed 50")
    private Integer bedrooms;

    @NotEmpty(message = "At least one amenity is required")
    private List<Integer> amenityIds;
}