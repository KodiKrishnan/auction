package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class TravellerPropertyDetailResponse {
    private Long id;
    private String propertyName;
    private String description;
    private String city;
    private String state;
    private String country;
    private String locality;
    private String address;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer bedrooms;
    private Integer maxGuests;
    private String propertyType;
    private String propertyTypeIconurl;
    private List<AmenityDetail> amenities;
    private List<String> images;
    private String videoUrl;
    private List<AuctionDetail> auctions;
    private String ownerName;
    private String ownerEmail;

    @Data
    @AllArgsConstructor
    public static class AmenityDetail {
        private Long id;
        private String name;
        private String iconurl;
    }

    @Data
    @AllArgsConstructor
    public static class AuctionDetail {
        private Long auctionId;
        private LocalDate stayStartDate;
        private LocalDate stayEndDate;
        private LocalDateTime bidOpenDate;
        private LocalDateTime bidCloseDate;
        private BigDecimal baseCost;
        private BigDecimal bidIncrement;
        private String auctionStatus;
        private String packageType;
    }
}