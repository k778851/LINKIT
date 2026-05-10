package com.linkit.domain.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class UserDto {

    /* ── 요청 ─────────────────────────────────────────── */

    /** 최초 로그인 (시온 고유번호 + 비밀번호 → 외부 API 검증) */
    @Getter
    public static class LoginRequest {
        @NotBlank private String handle;
        @NotBlank private String password;
    }

    /** 온보딩 완료 — 프로필 설정 */
    @Getter
    public static class OnboardingRequest {
        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자여야 합니다.")
        private String nickname;

        @Size(max = 100)
        private String bio;

        private Boolean marketingOptedIn;
    }

    /** 프로필 수정 */
    @Getter
    public static class UpdateRequest {
        @Size(min = 2, max = 20)
        private String nickname;

        @Size(max = 100)
        private String bio;

        private String profileImage;
    }

    /* ── 응답 ─────────────────────────────────────────── */

    @Getter @Builder
    public static class LoginResponse {
        private String token;
        /** 장기 Refresh Token (30일) — localStorage에 저장 후 Access Token 갱신에 사용 */
        private String refreshToken;
        private ProfileResponse user;
        /** true 이면 프론트에서 온보딩 플로우 진입 */
        private boolean isNewUser;
    }

    /** Refresh Token으로 새 Access Token을 요청할 때 */
    @Getter
    public static class RefreshRequest {
        @NotBlank private String refreshToken;
    }

    /** 새 Access Token 응답 */
    @Getter @Builder
    public static class RefreshResponse {
        private String token;
    }

    @Getter @Builder
    public static class ProfileResponse {
        private String id;
        private String nickname;
        private String handle;
        private String provider;
        private String bio;
        private String profileImage;
        private String role;
        private String status;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
        private long followerCount;
        private long followingCount;
        /** 요청자가 이 유저를 팔로우 중인지 */
        private boolean following;

        public static ProfileResponse from(User u) {
            return ProfileResponse.builder()
                    .id(u.getId())
                    .nickname(u.getNickname())
                    .handle(u.getHandle())
                    .provider(u.getProvider())
                    .bio(u.getBio())
                    .profileImage(u.getProfileImage())
                    .role(u.getRole().name())
                    .status(u.getStatus().name())
                    .lastLoginAt(u.getLastLoginAt())
                    .createdAt(u.getCreatedAt())
                    .build();
        }

        public static ProfileResponse from(User u, long followerCount, long followingCount, boolean following) {
            return ProfileResponse.builder()
                    .id(u.getId())
                    .nickname(u.getNickname())
                    .handle(u.getHandle())
                    .provider(u.getProvider())
                    .bio(u.getBio())
                    .profileImage(u.getProfileImage())
                    .role(u.getRole().name())
                    .status(u.getStatus().name())
                    .lastLoginAt(u.getLastLoginAt())
                    .createdAt(u.getCreatedAt())
                    .followerCount(followerCount)
                    .followingCount(followingCount)
                    .following(following)
                    .build();
        }
    }
}
