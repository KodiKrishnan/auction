package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class TravellerProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String name;
    private String email;
    private String phoneNumber;
    private String pictureUrl;
    private LocalDate dob;
    private Boolean profileCompleted;
}