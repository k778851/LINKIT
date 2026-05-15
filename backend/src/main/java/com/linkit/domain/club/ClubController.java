package com.linkit.domain.club;

import com.linkit.common.ApiResponse;
import com.linkit.domain.notification.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService         clubService;
    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<ClubDto.Response>> list(
            @RequestParam(defaultValue = "전체") String category,
            @RequestParam(defaultValue = "최신순") String sort) {
        return ApiResponse.ok(clubService.getClubs(category, sort));
    }

    @GetMapping("/{clubId}")
    public ApiResponse<ClubDto.Response> get(@PathVariable String clubId) {
        return ApiResponse.ok(clubService.getClub(clubId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClubDto.Response> create(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid ClubDto.CreateRequest req) {
        ClubDto.Response club = clubService.createClub(req, principal.getUsername());
        // 생성자 자동 가입 (OWNER 역할 부여 + memberCount +1)
        clubService.joinClub(principal.getUsername(), club.getId());
        return ApiResponse.ok("클럽을 개설했어요 🎉", club);
    }

    @PutMapping("/{clubId}")
    public ApiResponse<ClubDto.Response> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId,
            @RequestBody @Valid ClubDto.UpdateRequest req) {
        return ApiResponse.ok(clubService.updateClub(clubId, req, principal.getUsername()));
    }

    @DeleteMapping("/{clubId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId) {
        clubService.deleteClub(clubId, principal.getUsername());
        return ApiResponse.ok("클럽을 삭제했어요.");
    }

    /* ── 멤버십 (join/leave/bookmark) ─────────────────── */

    @PostMapping("/{clubId}/join")
    public ApiResponse<JoinRequestDto.JoinResult> join(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId,
            @RequestBody(required = false) @Valid JoinRequestDto.CreateRequest body) {

        String message = body != null ? body.getMessage() : null;
        JoinRequestDto.JoinResult result =
                clubService.joinClub(principal.getUsername(), clubId, message);

        if ("PENDING".equals(result.getStatus())) {
            return ApiResponse.ok("가입을 신청했어요. 승인을 기다려주세요 ✋", result);
        }

        // 즉시 가입 — 클럽장에게 새 멤버 알림 (본인이 만든 클럽이면 생략)
        ClubDto.Response club = clubService.getClub(clubId);
        if (!club.getCreatedBy().equals(principal.getUsername())) {
            notificationService.send(
                    club.getCreatedBy(),
                    "new_member",
                    "👋",
                    club.getName() + "에 새 멤버가 가입했어요!",
                    "현재 " + club.getMemberCount() + "명이 함께하고 있어요",
                    "/clubs/" + clubId
            );
        }

        return ApiResponse.ok("모임에 가입했어요 🎉", result);
    }

    /* ── 가입 신청 관리 (비공개 클럽) ────────────────────── */

    @GetMapping("/{clubId}/join-requests")
    public ApiResponse<List<JoinRequestDto.Response>> listJoinRequests(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId) {
        return ApiResponse.ok(
                clubService.listPendingJoinRequests(clubId, principal.getUsername()));
    }

    @PostMapping("/{clubId}/join-requests")
    public ApiResponse<JoinRequestDto.JoinResult> submitJoinRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId,
            @RequestBody(required = false) @Valid JoinRequestDto.CreateRequest body) {
        String message = body != null ? body.getMessage() : null;
        JoinRequestDto.JoinResult result =
                clubService.joinClub(principal.getUsername(), clubId, message);
        return ApiResponse.ok(result);
    }

    @PatchMapping("/{clubId}/join-requests/{requestId}/approve")
    public ApiResponse<JoinRequestDto.Response> approveJoinRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId,
            @PathVariable Long requestId) {
        return ApiResponse.ok("가입을 승인했어요 🎉",
                clubService.approveJoinRequest(clubId, requestId, principal.getUsername()));
    }

    @PatchMapping("/{clubId}/join-requests/{requestId}/reject")
    public ApiResponse<JoinRequestDto.Response> rejectJoinRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId,
            @PathVariable Long requestId) {
        return ApiResponse.ok("가입 신청을 거절했어요.",
                clubService.rejectJoinRequest(clubId, requestId, principal.getUsername()));
    }

    @DeleteMapping("/{clubId}/join")
    public ApiResponse<Void> leave(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId) {
        // leaveClub 내부에서 ClubMember 삭제 + memberCount -1 처리
        clubService.leaveClub(principal.getUsername(), clubId);
        return ApiResponse.ok("참여를 취소했어요.");
    }

    /* ── 멤버 역할 변경 ───────────────────────────────── */

    @PatchMapping("/{clubId}/members/{userId}/role")
    public ApiResponse<Void> changeMemberRole(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId,
            @PathVariable String userId,
            @RequestBody ChangeRoleRequest body) {
        clubService.changeMemberRole(clubId, principal.getUsername(), userId, body.role());
        return ApiResponse.ok("멤버 역할을 변경했어요.");
    }

    public record ChangeRoleRequest(ClubMemberRole role) {}

    @PostMapping("/{clubId}/bookmark")
    public ApiResponse<Void> bookmark(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String clubId) {
        boolean added = clubService.toggleBookmark(principal.getUsername(), clubId);
        return ApiResponse.ok(added ? "찜 목록에 추가했어요 💖" : "찜 목록에서 제거했어요");
    }
}
