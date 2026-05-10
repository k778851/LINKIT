package com.linkit.domain.notification;

import com.linkit.common.ApiResponse;
import com.linkit.sse.SseEmitterService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final SseEmitterService      sseEmitterService;
    private final NotificationService    notificationService;

    /** SSE 구독 — 실시간 알림 스트림 */
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal UserDetails principal) {
        return sseEmitterService.subscribe(principal.getUsername());
    }

    /** 내 알림 목록 */
    @GetMapping
    public ApiResponse<List<NotificationDto.Response>> list(
            @AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getUsername())
                        .stream().map(NotificationDto.Response::from).toList()
        );
    }

    /** 읽지 않은 알림 수 */
    @GetMapping("/unread-count")
    public ApiResponse<NotificationDto.UnreadCountResponse> unreadCount(
            @AuthenticationPrincipal UserDetails principal) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(principal.getUsername());
        return ApiResponse.ok(NotificationDto.UnreadCountResponse.builder().count(count).build());
    }

    /** 단건 읽음 처리 */
    @PatchMapping("/{notificationId}/read")
    @Transactional
    public ApiResponse<Void> markRead(
            @PathVariable String notificationId,
            @AuthenticationPrincipal UserDetails principal) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("알림을 찾을 수 없습니다."));
        if (!n.getUserId().equals(principal.getUsername()))
            throw new AccessDeniedException("권한이 없습니다.");
        n.setRead(true);
        return ApiResponse.ok("읽음 처리됐어요.");
    }

    /** 전체 읽음 처리 */
    @PatchMapping("/read-all")
    @Transactional
    public ApiResponse<Void> markAllRead(
            @AuthenticationPrincipal UserDetails principal) {
        notificationRepository.markAllReadByUserId(principal.getUsername());
        return ApiResponse.ok("모두 읽음 처리됐어요.");
    }

    /** 🧪 테스트용 — 본인에게 즉시 알림 전송 (개발 환경 전용) */
    @PostMapping("/test")
    public ApiResponse<Void> sendTest(
            @AuthenticationPrincipal UserDetails principal) {
        notificationService.send(
                principal.getUsername(),
                "system",
                "🧪",
                "테스트 알림",
                "SSE 실시간 알림이 정상 동작하고 있어요!",
                "/notifications"
        );
        return ApiResponse.ok("테스트 알림을 전송했어요.");
    }

    /** 알림 단건 삭제 */
    @DeleteMapping("/{notificationId}")
    @Transactional
    public ApiResponse<Void> delete(
            @PathVariable String notificationId,
            @AuthenticationPrincipal UserDetails principal) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("알림을 찾을 수 없습니다."));
        if (!n.getUserId().equals(principal.getUsername()))
            throw new AccessDeniedException("권한이 없습니다.");
        notificationRepository.delete(n);
        return ApiResponse.ok("알림을 삭제했어요.");
    }
}
