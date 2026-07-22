package com.example.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "travellers")
public class Traveller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private LocalDate dob;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String status;

    @Column(name = "profile_completed")
    private Boolean profileCompleted = false;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPictureUrl() { return pictureUrl; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public LocalDate getDob() { return dob; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getStatus() { return status; }
    public Boolean getProfileCompleted() { return profileCompleted; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setStatus(String status) { this.status = status; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }
}