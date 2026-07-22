package com.example.auth.service;

import com.example.auth.dto.PackageTypeRequest;
import com.example.auth.dto.PackageTypeResponse;
import com.example.auth.entity.PackageTypeMaster;
import com.example.auth.repository.PackageTypeMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageTypeService {

    private final PackageTypeMasterRepository packageTypeRepository;
        public List<PackageTypeResponse> getAll(Long ownerId) {
        return packageTypeRepository.findAllByOwnerIdOrGlobal(ownerId)
                .stream()
                .map(p -> new PackageTypeResponse(p.getId(),p.getOwnerId(), p.getName(), p.isActive(), p.getCreatedAt()))
                .collect(Collectors.toList());
    }
    
    public PackageTypeResponse create(PackageTypeRequest request, Long ownerId) {
    boolean exists = packageTypeRepository.existsByNameIgnoreCaseForOwner(request.getName(), ownerId);
    if (exists) {
        throw new RuntimeException("Package type '" + request.getName() + "' already exists");
    }

    PackageTypeMaster packageType = new PackageTypeMaster();
    packageType.setOwnerId(ownerId);
    packageType.setName(request.getName());
    packageType.setActive(true);
    PackageTypeMaster saved = packageTypeRepository.save(packageType);
    return new PackageTypeResponse(saved.getId(), saved.getOwnerId(), saved.getName(), saved.isActive(), saved.getCreatedAt());
    }

    public PackageTypeResponse enable(Long id) {
        PackageTypeMaster packageType = packageTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package type not found"));
        packageType.setActive(true);
        PackageTypeMaster saved = packageTypeRepository.save(packageType);
        return new PackageTypeResponse(saved.getId(),saved.getOwnerId(), saved.getName(), saved.isActive(), saved.getCreatedAt());
    }

    public PackageTypeResponse disable(Long id) {
        PackageTypeMaster packageType = packageTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package type not found"));
        packageType.setActive(false);
        PackageTypeMaster saved = packageTypeRepository.save(packageType);
        return new PackageTypeResponse(saved.getId(),saved.getOwnerId(), saved.getName(), saved.isActive(), saved.getCreatedAt());
    }
    public void delete(Long id, Long ownerId) {
    PackageTypeMaster pkg = packageTypeRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Package type not found"));

    if (pkg.getOwnerId() == null) {
        throw new IllegalArgumentException("Global package types cannot be deleted.");
    }

    if (!pkg.getOwnerId().equals(ownerId)) {
        throw new IllegalArgumentException("You can only delete your own package types.");
    }

    packageTypeRepository.deleteById(id);
}
}