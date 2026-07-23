package com.example.auth.service;

import com.example.auth.dto.PropertyListResponse;
import com.example.auth.dto.PropertyRequest;
import com.example.auth.entity.OwnerSession;
import com.example.auth.entity.Property;
import com.example.auth.repository.LocationRepository;
import com.example.auth.repository.OwnerSessionRepository;
import com.example.auth.repository.PropertyImageRepository;
import com.example.auth.repository.PropertyRepository;
import com.example.auth.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.auth.dto.AmenityResponse;
import com.example.auth.dto.ImageResponse;
import com.example.auth.dto.ImageUploadResponse;
import com.example.auth.dto.PropertyDetailResponse;
import com.example.auth.entity.Amenity;
import com.example.auth.entity.PropertyImage;
import com.example.auth.entity.PropertyType;
import com.example.auth.repository.AmenityRepository;
import com.example.auth.repository.PropertyTypeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.ArrayList;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.nio.file.StandardCopyOption;

@Service
public class PropertyService {

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private PropertyTypeRepository propertyTypeRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private OwnerSessionRepository sessionRepository;

    @Autowired
    private PropertyImageRepository imageRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LocationService locationService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Long getOwnerIdFromToken(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        Long sessionId = jwtUtil.extractSessionId(token);
        OwnerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Invalid session"));
        return session.getOwnerId();
    }

    public Property addProperty(String authHeader, PropertyRequest request) throws Exception {

    Long ownerId = getOwnerIdFromToken(authHeader);

    if (request.getPropertyTypeId() == null) {
        throw new RuntimeException("PropertyTypeId is required");
    }

    // validate location fields
    if (request.getCountry() == null || request.getCountry().trim().isEmpty()) {
        throw new RuntimeException("Country is required");
    }

    if (request.getState() == null || request.getState().trim().isEmpty()) {
        throw new RuntimeException("State is required");
    }

    if (request.getCity() == null || request.getCity().trim().isEmpty()) {
        throw new RuntimeException("City is required");
    }

    if (request.getLocality() == null || request.getLocality().trim().isEmpty()) {
        throw new RuntimeException("Locality is required");
}

    // Get existing or create new location
    Long locationId = locationService.getOrCreateLocationId(
            request.getCountry(),
            request.getState(),
            request.getCity(),
            request.getLocality()
    );

    Optional<Property> existing =
            propertyRepository.findByOwnerIdAndPropertyNameAndLocationId(
                    ownerId,
                    request.getPropertyName(),
                    locationId
            );

    if (existing.isPresent()) {
        throw new RuntimeException(
                "Property with same name already exists in this location"
        );
    }

    Property property = new Property();

    property.setOwnerId(ownerId);
    property.setPropertyTypeId(request.getPropertyTypeId());
    property.setPropertyName(request.getPropertyName());
    property.setDescription(request.getDescription());

    // use backend generated locationId
    property.setLocationId(locationId);

    property.setAddress(request.getAddress());
    property.setPincode(request.getPincode());
    property.setLatitude(request.getLatitude());
    property.setLongitude(request.getLongitude());
    property.setMaxGuests(request.getMaxGuests());
    property.setBedrooms(request.getBedrooms());

    property.setAmenityIds(
            objectMapper.writeValueAsString(request.getAmenityIds())
    );

    property.setStatus((short) 2);
    property.setCreatedAt(LocalDateTime.now());
    property.setUpdatedAt(LocalDateTime.now());

    return propertyRepository.save(property);
}

    public Map<String, Object> getAllProperties(String authHeader, int page, int limit, Short status, String search) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Property> propertyPage;

    if (search != null && !search.isEmpty()) {
        if (status != null) {
            propertyPage = propertyRepository.searchByOwnerIdAndStatusAndName(ownerId, status, search, pageable);
        } else {
            propertyPage = propertyRepository.searchByOwnerIdAndName(ownerId, search, pageable);
        }
    } else {
        if (status != null) {
            propertyPage = propertyRepository.findByOwnerIdAndStatus(ownerId, status, pageable);
        } else {
            propertyPage = propertyRepository.findByOwnerId(ownerId, pageable);
        }
    }

    List<PropertyListResponse> list = propertyPage.getContent().stream().map(p -> {
    String city = "";
    String state = "";
    String country = "";
    String locality = "";
    if (p.getLocationId() != null) {
        var location = locationRepository.findById(p.getLocationId()).orElse(null);
        if (location != null) {
            city = location.getCity();
            state = location.getState();
            country = location.getCountry();
            locality = location.getLocality() != null ? location.getLocality() : "";
        }
    }
    String primaryImage = imageRepository.findByPropertyIdAndIsPrimary(p.getId(), true)
            .map(img -> img.getImagePath())
            .orElse(null);
    return new PropertyListResponse(p.getId(), p.getPropertyName(), locality, city, state, country, p.getStatus(), primaryImage);
    }).toList();
    
    List<Property> allProperties = propertyRepository.findByOwnerId(ownerId);
    long totalCount = allProperties.size();
    long activeCount = allProperties.stream().filter(p -> p.getStatus() == 1).count();
    long draftCount = allProperties.stream().filter(p -> p.getStatus() == 2).count();
    long inactiveCount = allProperties.stream().filter(p -> p.getStatus() == 0).count();

    Map<String, Object> counts = new HashMap<>();
    counts.put("ALL", totalCount);
    counts.put("1", activeCount);
    counts.put("2", draftCount);
    counts.put("0", inactiveCount);

    Map<String, Object> data = new HashMap<>();
    data.put("total", propertyPage.getTotalElements());
    data.put("page", page);
    data.put("limit", limit);
    data.put("counts", counts);
    data.put("properties", list);

    return data;
}
    public Map<String, Object> getPropertiesWithAuctions(String authHeader, int page, int limit, String search) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    Pageable pageable = PageRequest.of(page - 1, limit);
    String actualSearch = (search != null && !search.isEmpty()) ? search : null;

    Page<Property> propertyPage = propertyRepository.findPropertiesWithAuctions(ownerId, actualSearch, pageable);

    List<PropertyListResponse> list = propertyPage.getContent().stream().map(p -> {
        String city = "", state = "", country = "";
        String locality = "";
        if (p.getLocationId() != null) {
            var location = locationRepository.findById(p.getLocationId()).orElse(null);
            if (location != null) {
                city = location.getCity();
                state = location.getState();
                country = location.getCountry();
                locality = location.getLocality() != null ? location.getLocality() : "";
            }
        }
        String primaryImage = imageRepository.findByPropertyIdAndIsPrimary(p.getId(), true)
                .map(img -> img.getImagePath())
                .orElse(null);
        return new PropertyListResponse(p.getId(), p.getPropertyName(), locality, city, state, country, p.getStatus(), primaryImage);
    }).toList();

    Map<String, Object> data = new HashMap<>();
    data.put("total", propertyPage.getTotalElements());
    data.put("page", page);
    data.put("limit", limit);
    data.put("properties", list);

    return data;
}
    public PropertyDetailResponse getPropertyById(String authHeader, Long propertyId) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));

    // get location
    String country = "";
    String state = "";
    String city = "";
    String locality = "";

if (property.getLocationId() != null) {
    var location = locationRepository.findById(property.getLocationId())
            .orElseThrow(() -> new RuntimeException("Location not found"));

    country = location.getCountry();
    state = location.getState();
    city = location.getCity();
    locality = location.getLocality() != null ? location.getLocality() : "";
}

    // get property type
String propertyType = "";
String propertyTypeIconUrl = ""; 
if (property.getPropertyTypeId() != null) {
    PropertyType pt = propertyTypeRepository.findById(property.getPropertyTypeId())
            .orElse(null);
    if (pt != null) {
        propertyType = pt.getName();
        propertyTypeIconUrl = pt.getIconUrl(); 
    }
}

// get amenities
List<Long> amenityIds = objectMapper.readValue(
        property.getAmenityIds(),
        new TypeReference<List<Long>>() {}
);
List<Amenity> amenities = amenityRepository.findByIdIn(amenityIds);
List<AmenityResponse> amenityResponses = amenities.stream()
        .map(a -> new AmenityResponse(a.getId(), a.getName(), a.getIconUrl()))  
        .toList();


    // get images
    List<PropertyImage> images = imageRepository.findByPropertyId(propertyId);
    List<ImageResponse> imageResponses = images.stream()
            .map(img -> new ImageResponse(img.getId(), img.getIsPrimary(), img.getImagePath()))
            .toList();

    return new PropertyDetailResponse(
            property.getId(),
            property.getPropertyName(),
            propertyType,
            propertyTypeIconUrl,
            country,
            state,
            city,
            locality,
            property.getPincode(),
            property.getAddress(),
            property.getDescription(),
            property.getLatitude(),
            property.getLongitude(),
            property.getMaxGuests(),
            property.getBedrooms(),
            property.getStatus(),
            property.getVideoUrl(),
            amenityResponses,
            imageResponses
    );
}
public ImageUploadResponse uploadImages(
        String authHeader,
        Long propertyId,
        MultipartFile[] images,
        int primaryIndex) throws Exception {
 
    Long ownerId = getOwnerIdFromToken(authHeader);
    Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
 
            // NEW CRITICAL FIX: If a NEW image is being set as primary, demote the old ones!
    if (primaryIndex >= 0) {
        List<PropertyImage> existingImages = imageRepository.findByPropertyId(propertyId);
        for (PropertyImage img : existingImages) {
            if (Boolean.TRUE.equals(img.getIsPrimary())) {
                img.setIsPrimary(false);
                imageRepository.save(img); // Save the demoted image
            }
        }
    }
 
    int uploadedCount = 0;
 
    // Define the correct sub-directory for property images
    System.out.println("uploadDir = " + uploadDir);
    Path targetDirectory = Paths.get(uploadDir);
    Files.createDirectories(targetDirectory);
 
    for (int i = 0; i < images.length; i++) {
        MultipartFile file = images[i];
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = targetDirectory.resolve(filename);
 
        Files.write(filePath, file.getBytes());
 
        PropertyImage image = new PropertyImage();
        image.setPropertyId(propertyId);
        image.setImagePath("/uploads/property-images/" + filename);
        image.setIsPrimary(i == primaryIndex);
        image.setCreatedAt(LocalDateTime.now());
 
        imageRepository.save(image);
        uploadedCount++;
    }
 
    return new ImageUploadResponse(uploadedCount);
}
public void updateProperty(String authHeader, Long propertyId, PropertyRequest request) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));

    if (request.getPropertyTypeId() != null) {
        property.setPropertyTypeId(request.getPropertyTypeId());
    }
    if (request.getPropertyName() != null) {
        property.setPropertyName(request.getPropertyName());
    }
    if (request.getDescription() != null) {
        property.setDescription(request.getDescription());
    }
    if (request.getCountry() != null &&
        request.getState() != null &&
        request.getCity() != null) {

    Long locationId =
            locationService.getOrCreateLocationId(
                    request.getCountry(),
                    request.getState(),
                    request.getCity(),
                    request.getLocality()
            );

    property.setLocationId(locationId);
    }
    if (request.getAddress() != null) {
        property.setAddress(request.getAddress());
    }
    if (request.getPincode() != null) {
        property.setPincode(request.getPincode());
    }
    if (request.getLatitude() != null) {
        property.setLatitude(request.getLatitude());
    }
    if (request.getLongitude() != null) {
        property.setLongitude(request.getLongitude());
    }
    if (request.getMaxGuests() != null) {
        property.setMaxGuests(request.getMaxGuests());
    }
    if (request.getBedrooms() != null) {
        property.setBedrooms(request.getBedrooms());
    }
    if (request.getAmenityIds() != null) {
        property.setAmenityIds(objectMapper.writeValueAsString(request.getAmenityIds()));
    }

    property.setUpdatedAt(LocalDateTime.now());

    propertyRepository.save(property);
}
public void deleteImage(String authHeader, Long propertyId, Long imageId) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);
 
    propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
 
    PropertyImage image = imageRepository.findByIdAndPropertyId(imageId, propertyId)
            .orElseThrow(() -> new RuntimeException("Image not found"));
 
    // Extract just the filename to find it on the actual disk
    String filename = image.getImagePath().substring(image.getImagePath().lastIndexOf("/") + 1);
    Path filePath = Paths.get(uploadDir, "property-images", filename);
   
    Files.deleteIfExists(filePath);
    imageRepository.delete(image);
}
public void updateStatus(String authHeader, Long propertyId, Short status) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);
 
    Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
 
    // validate status value
    if (status != 0 && status != 1 && status != 2) {
        throw new RuntimeException("Invalid status. Allowed values: 0 = inactive, 1 = active, 2 = draft");
    }
 
    property.setStatus(status);
    property.setUpdatedAt(LocalDateTime.now());
 
    propertyRepository.save(property);
}
public void setPrimaryImage(String authHeader, Long propertyId, Long imageId) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    // Verify owner
    propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));

    // 1. Demote old primary image
    List<PropertyImage> existingImages = imageRepository.findByPropertyId(propertyId);
    for (PropertyImage img : existingImages) {
        if (Boolean.TRUE.equals(img.getIsPrimary())) {
            img.setIsPrimary(false);
            imageRepository.save(img);
        }
    }

    // 2. Promote new primary image
    PropertyImage newPrimary = imageRepository.findByIdAndPropertyId(imageId, propertyId)
            .orElseThrow(() -> new RuntimeException("Image not found"));

    newPrimary.setIsPrimary(true);
    imageRepository.save(newPrimary);
}
@Autowired
private CloudinaryService cloudinaryService;

public String uploadPropertyVideo(String authHeader, Long propertyId, MultipartFile video) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));

    // upload to cloudinary
    String videoUrl = cloudinaryService.uploadVideo(video);

    // save url in property
    property.setVideoUrl(videoUrl);
    property.setUpdatedAt(LocalDateTime.now());
    propertyRepository.save(property);

    return videoUrl;
}

public void deletePropertyVideo(String authHeader, Long propertyId) throws Exception {
    Long ownerId = getOwnerIdFromToken(authHeader);

    Property property = propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
            .orElseThrow(() -> new RuntimeException("Property not found"));

    property.setVideoUrl(null);
    property.setUpdatedAt(LocalDateTime.now());
    propertyRepository.save(property);
}
}