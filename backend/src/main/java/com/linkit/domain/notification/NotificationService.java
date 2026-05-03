package com.linkit.domain.notification;

import com.linkit.sse.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SseEmitterService      sseEmitterService;

    /**
     * 알림 저장 + 실시간 전송
     *
     * @param userId 수신자 ID
     * @param type   알림 유형 (comment / like / club / new_member / system)
     * @param icon   이모지
     * @param title  알림 제목
     * @param body   알림 본문
     * @param path   클릭 시 이동 경로 (nullable)
     */
    public void send(String userId, String type, String icon,
                     String title, String body, String path) {
        Notification notification = Notification.builder()
                .id("n-" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .type(type)
                .icon(icon)
                .title(title)
                .body(body)
                .path(path)
                .build();

        notificationRepository.save(notification);
        sseEmitterService.sendToUser(userId, NotificationDto.Response.from(notification));
    }
}
