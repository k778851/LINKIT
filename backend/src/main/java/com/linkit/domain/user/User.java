package com.linkit.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 50)
    private String id;

    // ── 외부 인증 (시온) ─────────────────────────────────
    /** 시온 고유번호 (00000000-00000) */
    @Column(nullable = false, unique = true, length = 20)
    private String handle;

    /** 외부 인증 제공자 식별자 */
    @Builder.Default
    @Column(nullable = false, length = 20)
    private String provider = "ZION";

    /** 시온 API 수신 실명 — 암호화 사본: user_pii.real_name_enc */
    @Column(length = 20)
    private String realName;

    /** 시온 API 수신 전화번호 — 암호화 사본: user_pii.phone_enc */
    @Column(length = 20)
    private String phoneNumber;

    // ── LINKIT 프로필 (온보딩 완료 후 설정) ──────────────
    /** 닉네임 — 온보딩 전 NULL 허용 */
    @Column(length = 20)
    private String nickname;

    @Column(length = 100)
    private String bio;

    @Column(length = 500)
    private String profileImage;

    /** 소속 지역 — '본부' | '광산' | '북구' (null 이면 미설정) */
    @Column(length = 10)
    private String serviceRegion;

    // ── 계정 권한 / 상태 ─────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 10)
    private UserRole role = UserRole.USER;

    /** ONBOARDING → ACTIVE → SUSPENDED */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 15)
    private UserStatus status = UserStatus.ONBOARDING;

    /** 마케팅 수신 동의 여부 */
    @Builder.Default
    @Column(nullable = false)
    private Boolean marketingOptedIn = false;

    /** 마지막 로그인 시각 */
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
