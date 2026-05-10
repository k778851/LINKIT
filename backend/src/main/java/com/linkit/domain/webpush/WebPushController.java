package com.linkit.domain.webpush;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class WebPushController {

    private final WebPushService webPushService;

    /** VAPID 공개키 조회 — 프론트에서 구독 전 호출 */
    @GetMapping("/public-key")
    public ApiResponse<?> publicKey() {
        return ApiResponse.ok(webPushService.getPublicKey());
    }

    /** 브라우저 Push 구독 등록 — PushSubscription.toJSON() 그대로 전송 */
    @PostMapping("/subscribe")
    public ApiResponse<Void> subscribe(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid PushSubscriptionDto.BrowserSubscription req) {
        webPushService.subscribe(
                principal.getUsername(),
                req.getEndpoint(),
                req.getKeys().getP256dh(),
                req.getKeys().getAuth()
        );
        return ApiResponse.ok("Push 알림 구독이 완료됐어요.");
    }

    /** 구독 해제 */
    @PostMapping("/unsubscribe")
    public ApiResponse<Void> unsubscribe(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid PushSubscriptionDto.UnregisterRequest req) {
        webPushService.unsubscribe(principal.getUsername(), req.getEndpoint());
        return ApiResponse.ok("Push 알림 구독을 해제했어요.");
    }
}
