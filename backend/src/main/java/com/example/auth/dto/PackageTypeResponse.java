package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PackageTypeResponse {

    private Long id;
    private Long ownerId;
    private String name;
    private boolean isActive;
    private LocalDateTime createdAt;
}
