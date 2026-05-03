package com.linkit.domain.user;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /* ── 인증 ─────────────────────────────────────────── */

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserDto.ProfileResponse> register(@RequestBody @Valid UserDto.RegisterRequest req) {
        return ApiResponse.ok("회원가입이 완료됐어요.", userService.register(req));
    }

    @PostMapping("/auth/login")
    public ApiResponse<UserDto.LoginResponse> login(@RequestBody @Valid UserDto.LoginRequest req) {
        return ApiResponse.ok(userService.login(req));
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
