package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MappingCountResponse {
    private long total;
    private long active;
    private long disabled;
}