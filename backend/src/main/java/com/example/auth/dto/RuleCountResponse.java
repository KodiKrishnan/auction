package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RuleCountResponse {
    private long total;
    private long active;
    private long disabled;
}