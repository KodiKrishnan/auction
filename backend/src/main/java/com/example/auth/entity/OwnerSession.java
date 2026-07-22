package com.example.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "owner_sessions")
public class OwnerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Lob
    @Column(name = "token", columnDefinition = "TEXT")
    private String token;

    @Column(name = "token_provider", nullable = false)
    private String tokenProvider;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "login_time")
    private LocalDateTime loginTime;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "idle_timeout")
    private Integer idleTimeout;

    @Column(name = "logout_time")
    private LocalDateTime logoutTime;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "last_activity_time")
    private LocalDateTime lastActivityTime;

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getToken() { return token; }
    public String getTokenProvider() { return tokenProvider; }
    public String getDeviceInfo() { return deviceInfo; }
    public String getIpAddress() { return ipAddress; }
    public LocalDateTime getLoginTime() { return loginTime; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Integer getIdleTimeout() { return idleTimeout; }
    public LocalDateTime getLogoutTime() { return logoutTime; }
    public Boolean getIsActive() { return isActive; }
    public LocalDateTime getLastActivityTime() { return lastActivityTime; }
    public void setId(Long id) { this.id = id; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public void setToken(String token) { this.token = token; }
    public void setTokenProvider(String tokenProvider) { this.tokenProvider = tokenProvider; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setIdleTimeout(Integer idleTimeout) { this.idleTimeout = idleTimeout; }
    public void setLogoutTime(LocalDateTime logoutTime) { this.logoutTime = logoutTime; }
    public void setIsActive(Boolean active) { isActive = active; }
    public void setLastActivityTime(LocalDateTime lastActivityTime) { this.lastActivityTime = lastActivityTime; }
}