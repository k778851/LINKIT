package com.linkit.domain.follow;

import com.linkit.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /* ── 팔로우 토글 ─────────────────────────────────── */

    @PostMapping("/users/{userId}/follow")
    public ApiResponse<Boolean> toggle(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String userId) {
        boolean followed = followService.toggle(principal.getName(), userId);
        return ApiResponse.ok(followed ? "팔로우했어요 👋" : "팔로우를 취소했어요", followed);
    }

    /* ── 팔로우 통계 ─────────────────────────────────── */

    @GetMapping("/users/{userId}/follow-stats")
    public ApiResponse<FollowDto.FollowStats> stats(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String userId) {
        String requesterId = principal != null ? principal.getName() : null;
        return ApiResponse.ok(followService.getStats(userId, requesterId));
    }

    /* ── 팔로워 목록 ─────────────────────────────────── */

    @GetMapping("/users/{userId}/followers")
    public ApiResponse<List<FollowDto.UserSummary>> followers(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String userId) {
        String requesterId = principal != null ? principal.getName() : null;
        return ApiResponse.ok(followService.getFollowers(userId, requesterId));
    }

    /* ── 팔로잉 목록 ─────────────────────────────────── */

    @GetMapping("/users/{userId}/following")
    public ApiResponse<List<FollowDto.UserSummary>> following(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String userId) {
        String requesterId = principal != null ? principal.getName() : null;
        return ApiResponse.ok(followService.getFollowing(userId, requesterId));
    }
}
