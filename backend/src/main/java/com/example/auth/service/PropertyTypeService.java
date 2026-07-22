package com.example.auth.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.auth.entity.PropertyType;
import com.example.auth.repository.PropertyTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class PropertyTypeService {

    @Autowired
    private PropertyTypeRepository propertyTypeRepository;

    @Autowired
    private Cloudinary cloudinary;

    // existing method
    public List<PropertyType> getAllActive() {
        return propertyTypeRepository.findByStatus((short) 1);
    }

    // new method
    public PropertyType updateIcon(Long id, MultipartFile file) throws IOException {
        PropertyType propertyType = propertyTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Property type not found"));

        Map uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap("folder", "property-icons")
        );

        propertyType.setIconUrl(uploadResult.get("secure_url").toString());
        return propertyTypeRepository.save(propertyType);
    }
}