package com.example.auth.service;

import com.example.auth.dto.TravellerPropertyDetailResponse;
import com.example.auth.dto.TravellerPropertyResponse;
import com.example.auth.entity.*;
import com.example.auth.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.auth.service.StatusEngine;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TravellerService {

    private static final Logger log = LoggerFactory.getLogger(TravellerService.class);

    private final PropertyRepository propertyRepository;
    private final LocationRepository locationRepository;
    private final PropertyImageRepository imageRepository;
    private final AmenityRepository amenityRepository;
    private final PropertyTypeRepository propertyTypeRepository;
    private final AuctionRepository auctionRepository;
    private final ObjectMapper objectMapper;
    private final RuleRepository ruleRepository;
    private final PackageTypeMasterRepository packageTypeRepository;
    private final TravellerWishlistRepository wishlistRepository;
    private final StatusEngine statusEngine;

   public Map<String, Object> searchProperties(String destination, Double lat, Double lng,
                                             Double radius, Integer guests, Integer bedrooms,
                                             String propertyType, LocalDate checkIn,
                                             LocalDate checkOut, int page, int limit, Long travellerId) {
    Pageable pageable = PageRequest.of(page - 1, limit);

    // Resolve propertyType name to id
    Long propertyTypeId = null;
    if (propertyType != null && !propertyType.isEmpty()) {
        propertyTypeId = propertyTypeRepository.findAll().stream()
                .filter(pt -> pt.getName().equalsIgnoreCase(propertyType))
                .map(PropertyType::getId)
                .findFirst()
                .orElse(null);
    }

    Page<Property> propertyPage;

    String actualDestination = null;
    if (destination != null && !destination.isEmpty()) {
        actualDestination = destination.split(",")[0].trim();
    }

    if (lat != null && lng != null) {
        // COORDINATE SEARCH — Haversine
        log.info("Using coordinate search - lat: {}, lng: {}, radius: {}km", lat, lng, radius);
        propertyPage = propertyRepository.searchForTravellerByCoordinates(
                lat, lng, radius != null ? radius : 50.0,
                guests, bedrooms, propertyTypeId, checkIn, checkOut, pageable
        );
    } else {
        // TEXT SEARCH — actual destination string (split at first comma)
       log.info("Using text search - destination: {}", actualDestination);

        propertyPage = propertyRepository.searchForTraveller(
                actualDestination,
                guests,
                bedrooms,
                propertyTypeId,
                checkIn,
                checkOut,
                pageable
        );
    }
       
    List<TravellerPropertyResponse> list = propertyPage.getContent().stream()
            .map(p -> toTravellerResponse(p, checkIn, checkOut,travellerId))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    Map<String, Object> data = new HashMap<>();
    data.put("success", true);
    data.put("total", propertyPage.getTotalElements());
    data.put("page", page);
    data.put("limit", limit);
    data.put("searchType", lat != null ? "coordinates" : "text");
    data.put("data", list);

    if (list.isEmpty() && checkIn != null && checkOut != null && lat == null) {

        log.info("No results found. Trying ±7 day search...");

        LocalDate expandedCheckIn = checkIn.minusDays(7);
        LocalDate expandedCheckOut = checkOut.plusDays(7);

        Page<Property> fallbackPage = propertyRepository.searchForTraveller(
                actualDestination,
                guests,
                bedrooms,
                propertyTypeId,
                expandedCheckIn,
                expandedCheckOut,
                pageable
        );

        List<TravellerPropertyResponse> fallbackList = fallbackPage.getContent().stream()
                .map(p -> toTravellerResponse(p, expandedCheckIn, expandedCheckOut, travellerId))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (!fallbackList.isEmpty()) {

            data.put("data", fallbackList);
            data.put("total", fallbackPage.getTotalElements());
            data.put("fallback", true);
            data.put("message",
                    "No auctions match your exact dates. Showing closest available auctions within ±7 days.");

        } else {

            data.put("data", Collections.emptyList());
            data.put("total", 0);
            data.put("fallback", false);
            data.put("message",
                    "No properties available for the selected dates.");
        }

        } else {

        data.put("data", list);
        data.put("total", propertyPage.getTotalElements());
        data.put("fallback", false);

    if (list.isEmpty()) {
    if (checkIn != null || checkOut != null) {
        data.put("message", "No properties available for the selected dates. Please try different dates.");
    } else if (destination != null && !destination.isEmpty()) {
        data.put("message", "No properties found for '" + destination + "'. Please try a different location.");
    } else {
        data.put("message", "No properties available at the moment.");
    }
}
        }
    return data;
}
    
    public Map<String, Object> getAllProperties(int page, int limit, Long travellerId) {
    Pageable pageable = PageRequest.of(page - 1, limit);

    Page<Property> propertyPage = propertyRepository.searchForTraveller(
        null, null, null, null, null, null, pageable
    );

    List<TravellerPropertyResponse> list = propertyPage.getContent().stream()
            .map(p -> toTravellerResponse(p, null, null, travellerId))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    Map<String, Object> data = new HashMap<>();
    data.put("success", true);
    data.put("total", propertyPage.getTotalElements());
    data.put("page", page);
    data.put("limit", limit);
    data.put("data", list);

    return data;
}

    // HELPER
  private TravellerPropertyResponse toTravellerResponse(Property p, LocalDate checkIn, LocalDate checkOut, Long travellerId) {
    try {
        // Location
        String city = "", state = "", country = "";
        if (p.getLocationId() != null) {
            var location = locationRepository.findById(p.getLocationId()).orElse(null);
            if (location != null) {
                city = location.getCity();
                state = location.getState();
                country = location.getCountry();
            }
        }

      // Get all OPEN/UPCOMING auctions for this property
    List<Auction> auctions = auctionRepository
        .findActiveAuctionsByPropertyId(p.getId(), Pageable.unpaged());


    // No active auctions
    if (auctions.isEmpty()) {
    return null;
    }

    Auction auction;

    // If traveller searched with dates, pick the best matching slot
    if (checkIn != null && checkOut != null) {

    auction = auctions.stream()

            // auction overlaps requested dates
            .filter(a ->
                    a.getStayStartDate().isBefore(checkOut) &&
                    a.getStayEndDate().isAfter(checkIn)
            )

            // Best overlap first
            .max(Comparator.comparingLong(a -> {

                LocalDate overlapStart =
                        a.getStayStartDate().isAfter(checkIn)
                                ? a.getStayStartDate()
                                : checkIn;

                LocalDate overlapEnd =
                        a.getStayEndDate().isBefore(checkOut)
                                ? a.getStayEndDate()
                                : checkOut;

                return ChronoUnit.DAYS.between(overlapStart, overlapEnd);

            }))

            .orElse(
    auctions.stream()
            .min(Comparator.comparing(Auction::getStayStartDate))
            .orElse(null)
);

    } else {

    // No search dates -> show nearest upcoming stay
    auction = auctions.stream()
            .min(Comparator.comparing(Auction::getStayStartDate))
            .orElse(null);
    }

    if (auction == null) {
    return null;
    }

    if ("OPEN".equals(auction.getAuctionStatus())
        && auction.getBidCloseDate() != null
        && statusEngine.getNow().isAfter(auction.getBidCloseDate())) {
    return null;
}

        // Get rule for checkin/checkout day
        String checkinDay = "";
        String checkoutDay = "";
        if (auction.getRuleId() != null) {
            var rule = ruleRepository.findById(auction.getRuleId()).orElse(null);
            if (rule != null) {
                checkinDay = rule.getCheckinDay() != null ? rule.getCheckinDay().name() : "";
                checkoutDay = rule.getCheckoutDay() != null ? rule.getCheckoutDay().name() : "";
            }
        }

        // Images
    List<PropertyImage> propertyImages = imageRepository.findByPropertyId(p.getId());

    List<String> images = propertyImages.stream()
        .map(PropertyImage::getImagePath)
        .collect(Collectors.toList());

    String primaryImage = propertyImages.stream()
        .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
        .map(PropertyImage::getImagePath)
        .findFirst()
        .orElse(images.isEmpty() ? null : images.get(0));

        // Amenities with icons
        List<TravellerPropertyResponse.AmenityDetail> amenities = new ArrayList<>();
        if (p.getAmenityIds() != null) {
            List<Long> amenityIds = objectMapper.readValue(
                    p.getAmenityIds(), new TypeReference<List<Long>>() {}
            );
            amenities = amenityRepository.findByIdIn(amenityIds)
                    .stream()
                    .map(a -> new TravellerPropertyResponse.AmenityDetail(
                            a.getId(), a.getName(), a.getIconUrl()
                    ))
                    .collect(Collectors.toList());
        }

        // Property type with icon
        String propertyTypeName = "";
        String propertyTypeIcon = "";
        if (p.getPropertyTypeId() != null) {
            var pt = propertyTypeRepository.findById(p.getPropertyTypeId()).orElse(null);
            if (pt != null) {
                propertyTypeName = pt.getName();
                propertyTypeIcon = pt.getIconUrl();
            }
        }
        
        //Wishlist check
         boolean wishlisted = travellerId != null &&
            wishlistRepository.existsByTravellerIdAndPropertyId(travellerId, p.getId());

        // Compute status once
        String auctionStatus = statusEngine.computeAuctionStatus(auction);

        // User actions
    boolean canBid = "OPEN".equals(auctionStatus);
    boolean canView = "OPEN".equals(auctionStatus) || "UPCOMING".equals(auctionStatus);

    // Compute search match note
    String searchNote = null;

    if (checkIn != null && checkOut != null) {
    LocalDate auctionStart = auction.getStayStartDate();
    LocalDate auctionEnd = auction.getStayEndDate();

    boolean startsOnTime = !auctionStart.isAfter(checkIn);
    boolean endsOnTime = !auctionEnd.isBefore(checkOut);

    if (startsOnTime && endsOnTime) {
        long requestedNights = ChronoUnit.DAYS.between(checkIn, checkOut);
        long auctionNights = ChronoUnit.DAYS.between(auctionStart, auctionEnd);
        long extra = auctionNights - requestedNights;

        searchNote = "Fully Covers Your Stay"
                + (extra > 0 ? " (+" + extra + " extra nights)" : "");
    } else if (!startsOnTime && endsOnTime) {
        searchNote = "Misses First Night (Starts " + auctionStart + ")";
    } else if (startsOnTime && !endsOnTime) {
        searchNote = "Ends Earlier Than Your Stay (Ends " + auctionEnd + ")";
    } else {
        searchNote = "Partial Match (" + auctionStart + " to " + auctionEnd + ")";
    }
}

        return new TravellerPropertyResponse(
        p.getId(),
        p.getPropertyName(),
        city,
        state,
        country,
        p.getLocality(),
        p.getBedrooms(),
        p.getMaxGuests(),
        auction.getBaseCost(),
        auction.getBidIncrement(),
        auction.getBidOpenDate(),
        auction.getBidCloseDate(),
        auction.getStayStartDate(),
        auction.getStayEndDate(),
        auction.getAuctionId(),
        auctionStatus,
        images,
        primaryImage,
        amenities,
        propertyTypeName,
        propertyTypeIcon,
        checkinDay,
        checkoutDay,
        wishlisted,
        canBid,
        canView,
        searchNote,
        checkIn,
        checkOut

);

    } catch (Exception e) {
        log.error("Error mapping property {}: {}", p.getId(), e.getMessage());
        return null;
    }
}
    public TravellerPropertyDetailResponse getPropertyDetail(Long propertyId) {
    Property p = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));


    // Location
    String city = "", state = "", country = "";
    if (p.getLocationId() != null) {
        var location = locationRepository.findById(p.getLocationId()).orElse(null);
        if (location != null) {
            city = location.getCity();
            state = location.getState();
            country = location.getCountry();
        }
    }

    // Property Type
    String propertyTypeName = "";
    String propertyTypeIcon = "";
    if (p.getPropertyTypeId() != null) {
        var pt = propertyTypeRepository.findById(p.getPropertyTypeId()).orElse(null);
        if (pt != null) {
            propertyTypeName = pt.getName();
            propertyTypeIcon = pt.getIconUrl();
        }
    }

    // Amenities
    List<TravellerPropertyDetailResponse.AmenityDetail> amenities = new ArrayList<>();
    if (p.getAmenityIds() != null) {
        try {
            List<Long> amenityIds = objectMapper.readValue(p.getAmenityIds(), new TypeReference<List<Long>>() {});
            amenities = amenityRepository.findByIdIn(amenityIds)
                    .stream()
                    .map(a -> new TravellerPropertyDetailResponse.AmenityDetail(
                            a.getId(), a.getName(), a.getIconUrl()
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error parsing amenity ids for property {}: {}", propertyId, e.getMessage());
        }
    }

    // Images
    List<String> images = imageRepository.findByPropertyId(p.getId())
            .stream()
            .map(PropertyImage::getImagePath)
            .collect(Collectors.toList());

    // Auctions with package type
    List<TravellerPropertyDetailResponse.AuctionDetail> auctions = auctionRepository
            .findByPropertyIdAndAuctionsOrderByStayStartDateAsc(p.getId())
            .stream()
            .map(a -> {
                String packageType = "";
                try {
                    var rule = ruleRepository.findById(a.getRuleId()).orElse(null);
                    if (rule != null && rule.getPackageTypeId() != null) {
                        var pkg = packageTypeRepository.findById(rule.getPackageTypeId()).orElse(null);
                        if (pkg != null) {
                            packageType = pkg.getName();
                        }
                    }
                } catch (Exception e) {
                    log.error("Error fetching package type for auction {}", a.getAuctionId());
                }

                String computedStatus = statusEngine.computeAuctionStatus(a);

                 // Hide CLOSED and CANCELLED auctions
                if (!"OPEN".equals(computedStatus) &&
                    !"UPCOMING".equals(computedStatus)) {
                    return null;
                }

                boolean canBid = "OPEN".equals(computedStatus);
                boolean canView = "OPEN".equals(computedStatus) || "UPCOMING".equals(computedStatus);

                return new TravellerPropertyDetailResponse.AuctionDetail(
                        a.getAuctionId(),
                        a.getStayStartDate(),
                        a.getStayEndDate(),
                        a.getBidOpenDate(),
                        a.getBidCloseDate(),
                        a.getBaseCost(),
                        a.getBidIncrement(),
                        computedStatus,
                        packageType,
                        canBid,
                        canView
                );
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    return new TravellerPropertyDetailResponse(
            p.getId(),
            p.getPropertyName(),
            p.getDescription(),
            city, state, country,
            p.getLocality(),
            p.getAddress(),
            p.getPincode(),
            p.getLatitude(),
            p.getLongitude(),
            p.getBedrooms(),
            p.getMaxGuests(),
            propertyTypeName,
            propertyTypeIcon,
            amenities,
            images,
            p.getVideoUrl(),
            auctions
    );
}

    public Map<String, Object> toggleWishlist(Long travellerId, Long propertyId) {
    Optional<TravellerWishlist> existing = wishlistRepository
            .findByTravellerIdAndPropertyId(travellerId, propertyId);

    if (existing.isPresent()) {
        wishlistRepository.delete(existing.get());
        log.info("Removed from wishlist - travellerId: {}, propertyId: {}", travellerId, propertyId);
        return Map.of("status", "REMOVED", "message", "Property removed from wishlist", "wishlisted", false);
    } else {
        TravellerWishlist wishlist = TravellerWishlist.builder()
                .travellerId(travellerId)
                .propertyId(propertyId)
                .build();
        wishlistRepository.save(wishlist);
        log.info("Added to wishlist - travellerId: {}, propertyId: {}", travellerId, propertyId);
        return Map.of("status", "ADDED", "message", "Property added to wishlist", "wishlisted", true);
    }
}

    public Map<String, Object> getWishlist(Long travellerId, int page, int limit) {
    List<TravellerWishlist> wishlists = wishlistRepository
            .findByTravellerIdOrderByCreatedAtDesc(travellerId);

    List<TravellerPropertyResponse> properties = wishlists.stream()
            .map(w -> {
                Property p = propertyRepository.findById(w.getPropertyId()).orElse(null);
                if (p == null) return null;
                return toWishlistResponse(p, travellerId);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    int start = (page - 1) * limit;
    int end = Math.min(start + limit, properties.size());
    List<TravellerPropertyResponse> paged = start < properties.size()
            ? properties.subList(start, end)
            : new ArrayList<>();

    Map<String, Object> data = new HashMap<>();
    data.put("success", true);
    data.put("total", properties.size());
    data.put("page", page);
    data.put("limit", limit);
    data.put("data", paged);

    return data;
}
private TravellerPropertyResponse toWishlistResponse(Property p, Long travellerId) {
    try {
        // Location
        String city = "", state = "", country = "";
        if (p.getLocationId() != null) {
            var location = locationRepository.findById(p.getLocationId()).orElse(null);
            if (location != null) {
                city = location.getCity();
                state = location.getState();
                country = location.getCountry();
            }
        }

        // Get nearest auction — any status
        Auction auction = auctionRepository
        .findActiveAuctionsByPropertyIdForWishlist(p.getId(), PageRequest.of(0, 1))
        .stream()
        .findFirst()
        .orElseGet(() ->
            auctionRepository
                .findTopByPropertyIdOrderByStayStartDateDesc(p.getId())
                .orElse(null)
        );

        // Images
        List<String> images = imageRepository.findByPropertyId(p.getId())
                .stream()
                .map(PropertyImage::getImagePath)
                .collect(Collectors.toList());

        String primaryImage = images.isEmpty() ? null : images.get(0);

        // Amenities
        List<TravellerPropertyResponse.AmenityDetail> amenities = new ArrayList<>();
        if (p.getAmenityIds() != null) {
            List<Long> amenityIds = objectMapper.readValue(
                    p.getAmenityIds(), new TypeReference<List<Long>>() {}
            );
            amenities = amenityRepository.findByIdIn(amenityIds)
                    .stream()
                    .map(a -> new TravellerPropertyResponse.AmenityDetail(
                            a.getId(), a.getName(), a.getIconUrl()
                    ))
                    .collect(Collectors.toList());
        }

        // Property type
        String propertyTypeName = "";
        String propertyTypeIcon = "";
        if (p.getPropertyTypeId() != null) {
            var pt = propertyTypeRepository.findById(p.getPropertyTypeId()).orElse(null);
            if (pt != null) {
                propertyTypeName = pt.getName();
                propertyTypeIcon = pt.getIconUrl();
            }
        }

        // Checkin/checkout day
        String checkinDay = "";
        String checkoutDay = "";
        String auctionStatus = "NO_AUCTION";
        LocalDate stayStartDate = null;
        LocalDate stayEndDate = null;
        LocalDateTime bidOpenDate = null;
        LocalDateTime bidCloseDate = null;
        BigDecimal baseCost = BigDecimal.ZERO;
        BigDecimal bidIncrement = BigDecimal.ZERO;
        String auctionId = null;

        if (auction != null) {
            auctionStatus = auction.getAuctionStatus();
            stayStartDate = auction.getStayStartDate();
            stayEndDate = auction.getStayEndDate();
            bidOpenDate = auction.getBidOpenDate();
            bidCloseDate = auction.getBidCloseDate();
            baseCost = auction.getBaseCost();
            bidIncrement = auction.getBidIncrement();
            auctionId = String.valueOf(auction.getAuctionId());

            if (auction.getRuleId() != null) {
                var rule = ruleRepository.findById(auction.getRuleId()).orElse(null);
                if (rule != null) {
                    checkinDay = rule.getCheckinDay() != null ? rule.getCheckinDay().name() : "";
                    checkoutDay = rule.getCheckoutDay() != null ? rule.getCheckoutDay().name() : "";
                }
            }
        }

        // User actions based on status
        boolean canBid = "OPEN".equals(auctionStatus);
        boolean canView = "OPEN".equals(auctionStatus) || "UPCOMING".equals(auctionStatus);

        boolean wishlisted = wishlistRepository
                .existsByTravellerIdAndPropertyId(travellerId, p.getId());

        return new TravellerPropertyResponse(
                p.getId(),
                p.getPropertyName(),
                city, 
                state, 
                country,
                p.getLocality(),
                p.getBedrooms(),
                p.getMaxGuests(),
                auction.getBaseCost(),
                auction.getBidIncrement(),
                auction.getBidOpenDate(),
                auction.getBidCloseDate(),
                auction.getStayStartDate(),
                auction.getStayEndDate(),
                auction.getAuctionId(),
                statusEngine.computeAuctionStatus(auction),
                images,
                primaryImage,
                amenities,
                propertyTypeName,
                propertyTypeIcon,
                checkinDay,
                checkoutDay,
                wishlisted,
                canBid,
                canView,
                null,
                null,
                null
        );

    } catch (Exception e) {
        log.error("Error mapping wishlist property {}: {}", p.getId(), e.getMessage());
        return null;
    }
}
}