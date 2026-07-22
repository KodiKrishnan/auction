package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageResponse {
    private Long imageId;
    private Boolean isPrimary;
    private String imagePath;
}