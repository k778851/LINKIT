package com.linkit.domain.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

public class UserDto {

    /* ── 요청 ─────────────────────────────────────────── */

    @Getter
    public static class RegisterRequest {
        @NotBlank(message = "아이디를 입력해주세요.")
        @Size(min = 3, max = 50, message = "아이디는 3~50자여야 합니다.")
        private String handle;

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자여야 합니다.")
        private String nickname;

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
        private String password;

        private String emoji;
        private String bio;
    }

    @Getter
    public static class LoginRequest {
        @NotBlank private String handle;
        @NotBlank private String password;
    }

    @Getter
    public static class UpdateRequest {
        @Size(min = 2, max = 20)
        private String nickname;
        private String emoji;
        private String bio;
    }

    /* ── 응답 ─────────────────────────────────────────── */

    @Getter @Builder
    public static class LoginResponse {
        private String token;
        private ProfileResponse user;
    }

    @Getter @Builder
    public static class ProfileResponse {
        private String id;
        private String nickname;
        private String handle;
        private String emoji;
        private String bio;
        private Set<String> joinedClubs;
        private Set<String> bookmarkedClubs;
        private LocalDateTime createdAt;

        public static ProfileResponse from(User u) {
            return ProfileResponse.builder()
                    .id(u.getId())
                    .nickname(u.getNickname())
                    .handle(u.getHandle())
                    .emoji(u.getEmoji())
                    .bio(u.getBio())
                    .joinedClubs(u.getJoinedClubs())
                    .bookmarkedClubs(u.getBookmarkedClubs())
                    .createdAt(u.getCreatedAt())
                    .build();
        }
    }
}
