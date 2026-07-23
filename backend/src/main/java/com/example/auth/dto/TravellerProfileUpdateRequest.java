package com.example.auth.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TravellerProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private LocalDate dob;
}