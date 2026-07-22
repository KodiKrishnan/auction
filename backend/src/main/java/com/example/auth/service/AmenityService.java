package com.example.auth.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.auth.entity.Amenity;
import com.example.auth.repository.AmenityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class AmenityService {

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private Cloudinary cloudinary;

    public List<Amenity> getAllActive() {
        return amenityRepository.findByStatus((short) 1);
    }

    public Amenity updateIcon(Long id, MultipartFile file) throws IOException {
        Amenity amenity = amenityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Amenity not found"));

        Map uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap("folder", "amenity-icons")
        );

        amenity.setIconUrl(uploadResult.get("secure_url").toString());
        return amenityRepository.save(amenity);
    }
}