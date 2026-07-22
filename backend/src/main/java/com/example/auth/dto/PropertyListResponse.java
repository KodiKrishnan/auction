package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PropertyListResponse {
    private Long propertyId;
    private String propertyName;
    private String locality;
    private String city;
    private String state;
    private String country;
    private Short status;
    private String primaryImage;
}