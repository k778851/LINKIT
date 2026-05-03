package com.linkit.domain.follow;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class FollowDto {

    @Getter @Builder
    public static class UserSummary {
        private String id;
        private String nickname;
        private String handle;
        private String emoji;
        private String profileImage;
        private boolean following;   // 현재 요청자가 이 사람을 팔로우 중인지
    }

    @Getter @Builder
    public static class FollowStats {
        private long followerCount;
        private long followingCount;
        private boolean isFollowing;   // 요청자가 대상을 팔로우 중인지
    }
}
