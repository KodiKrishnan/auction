package com.example.auth.service;

import com.example.auth.dto.TravellerPropertyDetailResponse;
import com.example.auth.dto.TravellerPropertyResponse;
import com.example.auth.entity.*;
import com.example.auth.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    private final PropertyOwnerRepository propertyOwnerRepository;
    private final TravellerWishlistRepository wishlistRepository;

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

    if (lat != null && lng != null) {
        // COORDINATE SEARCH — Haversine
        log.info("Using coordinate search - lat: {}, lng: {}, radius: {}km", lat, lng, radius);
        propertyPage = propertyRepository.searchForTravellerByCoordinates(
                lat, lng, radius != null ? radius : 50.0,
                guests, bedrooms, propertyTypeId, checkIn, checkOut, pageable
        );
    } else {
        // TEXT SEARCH — clean destination string (split at first comma)
        String cleanDestination = null;
        if (destination != null && !destination.isEmpty()) {
            cleanDestination = destination.split(",")[0].trim();
        }
        log.info("Using text search - destination: {}", cleanDestination);
        propertyPage = propertyRepository.searchForTraveller(
                cleanDestination, guests, bedrooms, propertyTypeId, checkIn, checkOut, pageable
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

        // Get latest open auction
        Auction auction = auctionRepository
                .findTopByPropertyIdAndAuctionStatusOrderByStayStartDateAsc(p.getId(), "OPEN")
                .orElse(null);

        if (auction == null) return null;

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
        List<String> images = imageRepository.findByPropertyId(p.getId())
                .stream()
                .map(PropertyImage::getImagePath)
                .collect(Collectors.toList());

        String primaryImage = images.isEmpty() ? null : images.get(0);

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
        auction.getAuctionStatus(),
        images,
        primaryImage,
        amenities,
        propertyTypeName,
        propertyTypeIcon,
        checkinDay,
        checkoutDay,
        wishlisted
);

    } catch (Exception e) {
        log.error("Error mapping property {}: {}", p.getId(), e.getMessage());
        return null;
    }
}
    public TravellerPropertyDetailResponse getPropertyDetail(Long propertyId) {
    Property p = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));

        // Owner details
        String ownerName = "";
        String ownerEmail = "";
        if (p.getOwnerId() != null) {
        var owner = propertyOwnerRepository.findById(p.getOwnerId()).orElse(null);
        if (owner != null) {
        ownerName = owner.getName();
        ownerEmail = owner.getEmail();
    }
}

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
            .findByPropertyIdAndAuctionStatusOrderByStayStartDateAsc(p.getId(), "OPEN")
            .stream()
            .map(a -> {
                String packageType = "";
                try {
                    var rule = ruleRepository.findById(a.getRuleId()).orElse(null);
                    if (rule != null && rule.getPackageTypeId() != null) {
                        var pkg = packageTypeRepository.findById(rule.getPackageTypeId()).orElse(null);
                        if (pkg != null) packageType = pkg.getName();
                    }
                } catch (Exception e) {
                    log.error("Error fetching package type for auction {}", a.getAuctionId());
                }
                return new TravellerPropertyDetailResponse.AuctionDetail(
                        a.getAuctionId(),
                        a.getStayStartDate(),
                        a.getStayEndDate(),
                        a.getBidOpenDate(),
                        a.getBidCloseDate(),
                        a.getBaseCost(),
                        a.getBidIncrement(),
                        a.getAuctionStatus(),
                        packageType
                );
            })
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
            auctions,
            ownerName,
            ownerEmail
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
                return toTravellerResponse(p, null, null, travellerId);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    // Manual pagination
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
}