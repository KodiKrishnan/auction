package com.example.auth.dto;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String pictureUrl;
    private Boolean profileCompleted;

    public UserDto(Long id, String name, String email, String pictureUrl, Boolean profileCompleted) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.pictureUrl = pictureUrl;
        this.profileCompleted = profileCompleted;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public Boolean getProfileCompleted() {
        return profileCompleted;
    }
}