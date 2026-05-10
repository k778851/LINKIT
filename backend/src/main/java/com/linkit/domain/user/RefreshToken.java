package com.linkit.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * LINKIT 자체 발급 Refresh Token 엔티티.
 * Access Token(JWT, 1시간)은 Stateless 검증하고,
 * Refresh Token(30일)만 DB에 저장하여 강제 로그아웃(revoke)을 지원합니다.
 */
@Entity
@Table(name = "refresh_tokens",
        indexes = {
            @Index(name = "idx_rt_user_id",   columnList = "user_id"),
            @Index(name = "idx_rt_expires_at", columnList = "expires_at")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 토큰 소유 유저 ID */
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    /** SHA-256 해시값만 저장 (원본 토큰은 클라이언트에만 존재) */
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    /** 디바이스 정보 (예: "iPhone 15 / iOS 17") */
    @Column(length = 200)
    private String deviceInfo;

    /** 접속 IP */
    @Column(length = 45)
    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /** 로그아웃 시 기록 — NULL 이면 유효한 토큰 */
    private LocalDateTime revokedAt;

    public boolean isValid() {
        return revokedAt == null && expiresAt.isAfter(LocalDateTime.now());
    }
}
