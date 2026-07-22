package com.example.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PackageTypeRequest {

    @NotBlank(message = "Package type name is required")
    private String name;
}