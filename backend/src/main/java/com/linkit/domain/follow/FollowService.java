package com.linkit.domain.follow;

import com.linkit.domain.notification.NotificationService;
import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository   userRepository;
    private final NotificationService notificationService;

    /* ── 팔로우 ──────────────────────────────────────── */

    @Transactional
    public boolean toggle(String followerId, String followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }
        // 대상 유저 존재 확인
        if (!userRepository.existsById(followingId)) {
            throw new EntityNotFoundException("유저를 찾을 수 없습니다.");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
            return false;   // 언팔로우
        } else {
            followRepository.save(Follow.builder()
                    .followerId(followerId)
                    .followingId(followingId)
                    .build());

            // 팔로우 알림 전송 (비동기)
            try {
                User follower = userRepository.findById(followerId)
                        .orElseThrow();
                notificationService.send(
                        followingId,
                        "follow",
                        "👤",
                        "새 팔로워가 생겼어요",
                        follower.getNickname() + "님이 회원님을 팔로우하기 시작했어요.",
                        "/mypage"
                );
            } catch (Exception ignored) {}

            return true;    // 팔로우
        }
    }

    /* ── 통계 ─────────────────────────────────────────── */

    public FollowDto.FollowStats getStats(String targetId, String requesterId) {
        return FollowDto.FollowStats.builder()
                .followerCount(followRepository.countByFollowingId(targetId))
                .followingCount(followRepository.countByFollowerId(targetId))
                .isFollowing(requesterId != null &&
                        followRepository.existsByFollowerIdAndFollowingId(requesterId, targetId))
                .build();
    }

    /* ── 팔로워 목록 (나를 팔로우하는 사람) ─────────────── */

    public List<FollowDto.UserSummary> getFollowers(String userId, String requesterId) {
        List<Follow> follows = followRepository.findAllByFollowingId(userId);
        List<String> myFollowingIds = requesterId != null
                ? followRepository.findFollowingIdsByFollowerId(requesterId)
                : List.of();

        return follows.stream()
                .map(f -> {
                    User u = userRepository.findById(f.getFollowerId()).orElse(null);
                    if (u == null) return null;
                    return FollowDto.UserSummary.builder()
                            .id(u.getId())
                            .nickname(u.getNickname())
                            .handle(u.getHandle())
                            .profileImage(u.getProfileImage())
                            .following(myFollowingIds.contains(u.getId()))
                            .build();
                })
                .filter(s -> s != null)
                .toList();
    }

    /* ── 팔로잉 목록 (내가 팔로우하는 사람) ─────────────── */

    public List<FollowDto.UserSummary> getFollowing(String userId, String requesterId) {
        List<Follow> follows = followRepository.findAllByFollowerId(userId);
        List<String> myFollowingIds = requesterId != null
                ? followRepository.findFollowingIdsByFollowerId(requesterId)
                : List.of();

        return follows.stream()
                .map(f -> {
                    User u = userRepository.findById(f.getFollowingId()).orElse(null);
                    if (u == null) return null;
                    return FollowDto.UserSummary.builder()
                            .id(u.getId())
                            .nickname(u.getNickname())
                            .handle(u.getHandle())
                            .profileImage(u.getProfileImage())
                            .following(myFollowingIds.contains(u.getId()))
                            .build();
                })
                .filter(s -> s != null)
                .toList();
    }
}
