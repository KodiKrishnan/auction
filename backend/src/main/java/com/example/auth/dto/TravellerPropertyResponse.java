package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class TravellerPropertyResponse {
    private Long id;
    private String propertyName;
    private String city;
    private String state;
    private String country;
    private String locality;
    private Integer bedrooms;
    private Integer maxGuests;
    private BigDecimal baseCost;
    private BigDecimal bidIncrement;
    private LocalDateTime bidOpenDate;
    private LocalDateTime bidCloseDate;
    private String auctionStatus;
    private List<String> images;
    private String PrimaryImage;
    private List<AmenityDetail> amenities;
    private String propertyType;
    private String propertyTypeIcon;
    private String checkinDay;
    private String checkoutDay;
    private boolean Wishlisted;

    @Data
    @AllArgsConstructor
    public static class AmenityDetail {
        private Long id;
        private String name;
        private String iconurl;
    }
}