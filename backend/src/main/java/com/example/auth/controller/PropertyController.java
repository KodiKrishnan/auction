package com.example.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.auth.dto.ImageUploadResponse;
import com.example.auth.dto.PropertyDetailResponse;
import com.example.auth.dto.PropertyRequest;
import com.example.auth.entity.Property;
import com.example.auth.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import com.example.auth.dto.StatusRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/api/owner")
public class PropertyController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);
    
    @Autowired
    private PropertyService service;
    
    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/properties")
    public ResponseEntity<?> addProperty(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PropertyRequest request) {
        try {
            logger.info("The Request is : {}", objectMapper.writeValueAsString(request));

            Property property = service.addProperty(authHeader, request);

            Map<String, Object> responseBody = Map.of(
                    "status", "SUCCESS",
                    "message", "Property created successfully",
                    "data", Map.of("property_id", property.getId(), "status", property.getStatus())
            );

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("Add property failed | error={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @GetMapping("/properties")
public ResponseEntity<?> getAllProperties(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) Short status,
        @RequestParam(required = false) String search) {
    try {
        Map<String, Object> data = service.getAllProperties(authHeader, page, limit, status, search);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", data));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
    }
}

    @GetMapping("/properties/{propertyId}")
    public ResponseEntity<?> getPropertyById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long propertyId) {
        try {
            logger.info("The Request is : propertyId={}", propertyId);

            PropertyDetailResponse data = service.getPropertyById(authHeader, propertyId);

            Map<String, Object> responseBody = Map.of("status", "SUCCESS", "data", data);

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("Get property failed | propertyId={} | error={}", propertyId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @PostMapping("/properties/{propertyId}/images")
    public ResponseEntity<?> uploadImages(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long propertyId,
            @RequestParam("images") MultipartFile[] images,
            @RequestParam(value = "primary_index", defaultValue = "0") int primaryIndex) {
        try {
            logger.info("The Request is : propertyId={}, imageCount={}, primaryIndex={}", 
                         propertyId, images.length, primaryIndex);

            ImageUploadResponse data = service.uploadImages(authHeader, propertyId, images, primaryIndex);

            Map<String, Object> responseBody = Map.of(
                    "status", "SUCCESS",
                    "message", "Images uploaded successfully",
                    "data", data
            );

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("Image upload failed | propertyId={} | error={}", propertyId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @PutMapping("/properties/{propertyId}")
    public ResponseEntity<?> updateProperty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long propertyId,
            @RequestBody PropertyRequest request) {
        try {
            logger.info("The Request is : propertyId={}, body={}", 
                         propertyId, objectMapper.writeValueAsString(request));

            service.updateProperty(authHeader, propertyId, request);

            Map<String, Object> responseBody = Map.of("status", "SUCCESS", "message", "Property updated successfully");

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("Update property failed | propertyId={} | error={}", propertyId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/properties/{propertyId}/images/{imageId}")
    public ResponseEntity<?> deleteImage(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long propertyId,
            @PathVariable Long imageId) {
        try {
            logger.info("The Request is : propertyId={}, imageId={}", propertyId, imageId);

            service.deleteImage(authHeader, propertyId, imageId);

            Map<String, Object> responseBody = Map.of("status", "SUCCESS", "message", "Image deleted successfully");

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("Delete image failed | propertyId={} | imageId={} | error={}", 
                          propertyId, imageId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @PatchMapping("/properties/{propertyId}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long propertyId,
            @RequestBody StatusRequest request) {
        try {
            logger.info("The Request is : propertyId={}, status={}", propertyId, request.getStatus());

            service.updateStatus(authHeader, propertyId, request.getStatus());

            Map<String, Object> responseBody = Map.of("status", "SUCCESS", "message", "Property status updated");

            logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            logger.error("Update status failed | propertyId={} | error={}", propertyId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
    @PatchMapping("/properties/{propertyId}/images/{imageId}/primary")
public ResponseEntity<?> setPrimaryImage(
    @RequestHeader("Authorization") String authHeader,
    @PathVariable Long propertyId,
    @PathVariable Long imageId
) {
    logger.info("The Request is : propertyId={}, imageId={}", propertyId, imageId);
    try {
        service.setPrimaryImage(authHeader, propertyId, imageId);
        Map<String, Object> responseBody = Map.of("status", "SUCCESS");
        logger.info("The Response is : {}", responseBody);
        return ResponseEntity.ok(responseBody);
    } catch (Exception e) {
        logger.error("Set primary image failed | propertyId={} | imageId={} | error={}", 
                      propertyId, imageId, e.getMessage());
        return ResponseEntity.badRequest().body(Map.of(
            "status", "ERROR",
            "message", e.getMessage()
        ));
    }
}
// Upload video
@PostMapping("/properties/{propertyId}/upload-video")
public ResponseEntity<?> uploadVideo(
    @RequestHeader("Authorization") String authHeader,
    @PathVariable Long propertyId,
    @RequestParam("video") MultipartFile video
) {
    try {
        logger.info("The Request is : propertyId={}", propertyId);
        String videoUrl = service.uploadPropertyVideo(authHeader, propertyId, video);
        Map<String, Object> responseBody = Map.of(
            "status", "SUCCESS",
            "videoUrl", videoUrl
        );
        logger.info("The Response is : {}", responseBody);
        return ResponseEntity.ok(responseBody);
    } catch (Exception e) {
        logger.error("Video upload failed | propertyId={} | error={}", propertyId, e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
    }
}

// Delete video
@DeleteMapping("/properties/{propertyId}/delete-video")
public ResponseEntity<?> deleteVideo(
    @RequestHeader("Authorization") String authHeader,
    @PathVariable Long propertyId
) {
    try {
        logger.info("The Request is : propertyId={}", propertyId);
        service.deletePropertyVideo(authHeader, propertyId);
        Map<String, Object> responseBody = Map.of(
            "status", "SUCCESS",
            "message", "Video deleted successfully"
        );
        logger.info("The Response is : {}", responseBody);
        return ResponseEntity.ok(responseBody);
    } catch (Exception e) {
        logger.error("Delete video failed | propertyId={} | error={}", propertyId, e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
    }
}
@GetMapping("/with-auctions")
public ResponseEntity<?> getPropertiesWithAuctions(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) String search) {
    try {
        logger.info("The Request is : page={}, limit={}, search={}", page, limit, search);

        Map<String, Object> data = service.getPropertiesWithAuctions(authHeader, page, limit, search);

        Map<String, Object> responseBody = Map.of("status", "SUCCESS", "data", data);

        logger.info("The Response is : {}", objectMapper.writeValueAsString(responseBody));

        return ResponseEntity.ok(responseBody);
    } catch (Exception e) {
        logger.error("Get properties with auctions failed | error={}", e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", e.getMessage()));
    }
}
}