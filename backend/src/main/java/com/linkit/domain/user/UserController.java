package com.linkit.domain.user;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /* ── 인증 ─────────────────────────────────────────── */

    /** 시온 외부 API 인증 → LINKIT 로그인 (최초 접속 시 자동 가입) */
    @PostMapping("/auth/login")
    public ApiResponse<UserDto.LoginResponse> login(@RequestBody @Valid UserDto.LoginRequest req) {
        return ApiResponse.ok(userService.login(req));
    }

    /** Refresh Token → 새 Access Token 발급 */
    @PostMapping("/auth/refresh")
    public ApiResponse<UserDto.RefreshResponse> refresh(@RequestBody @Valid UserDto.RefreshRequest req) {
        return ApiResponse.ok(userService.refresh(req.getRefreshToken()));
    }

    /** 로그아웃 — Refresh Token 폐기 */
    @PostMapping("/auth/logout")
    public ApiResponse<Void> logout(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody(required = false) UserDto.RefreshRequest req) {
        String rawToken = (req != null) ? req.getRefreshToken() : null;
        userService.logout(principal.getUsername(), rawToken);
        return ApiResponse.ok("로그아웃 되었습니다.");
    }

    /* ── 온보딩 ────────────────────────────────────────── */

    /** 최초 로그인 후 닉네임·자기소개·마케팅 동의 설정 (ONBOARDING → ACTIVE) */
    @PostMapping("/users/me/onboarding")
    public ApiResponse<UserDto.ProfileResponse> completeOnboarding(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid UserDto.OnboardingRequest req) {
        return ApiResponse.ok("프로필 설정이 완료됐어요.", userService.completeOnboarding(principal.getUsername(), req));
    }

    /* ── 내 프로필 ─────────────────────────────────────── */

    @GetMapping("/users/me")
    public ApiResponse<UserDto.ProfileResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok(userService.getProfile(principal.getUsername(), principal.getUsername()));
    }

    @PutMapping("/users/me")
    public ApiResponse<UserDto.ProfileResponse> updateMe(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid UserDto.UpdateRequest req) {
        return ApiResponse.ok(userService.updateProfile(principal.getUsername(), principal.getUsername(), req));
    }

    /* ── 특정 유저 프로필 조회 ─────────────────────────── */

    @GetMapping("/users/{userId}")
    public ApiResponse<UserDto.ProfileResponse> getUser(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String userId) {
        String requesterId = principal != null ? principal.getUsername() : null;
        return ApiResponse.ok(userService.getProfile(userId, requesterId));
    }

}
