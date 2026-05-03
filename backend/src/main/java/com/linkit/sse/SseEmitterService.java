package com.linkit.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 사용자별 SSE 연결을 관리합니다.
 * - 사용자 1명당 최신 연결 1개만 유지
 * - 30초마다 heartbeat로 연결 유지
 */
@Slf4j
@Service
public class SseEmitterService {

    // userId → SseEmitter
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    /** SSE 구독 — 새 연결 등록 */
    public SseEmitter subscribe(String userId) {
        // 기존 연결이 있으면 정리
        SseEmitter prev = emitters.remove(userId);
        if (prev != null) {
            try { prev.complete(); } catch (Exception ignored) {}
        }

        SseEmitter emitter = new SseEmitter(180_000L); // 3분 타임아웃
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId, emitter));
        emitter.onTimeout(()    -> emitters.remove(userId, emitter));
        emitter.onError(e       -> emitters.remove(userId, emitter));

        // 첫 연결 이벤트 전송 (브라우저 버퍼 플러시 목적)
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected")
                    .reconnectTime(3000));
        } catch (IOException e) {
            emitters.remove(userId, emitter);
        }

        log.debug("SSE 연결 등록: userId={}, 총 연결={}", userId, emitters.size());
        return emitter;
    }

    /** 특정 사용자에게 이벤트 전송 */
    public void sendToUser(String userId, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) return;

        try {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(data));
        } catch (Exception e) {
            emitters.remove(userId, emitter);
            log.debug("SSE 전송 실패 (연결 제거): userId={}", userId);
        }
    }

    /** 30초마다 heartbeat — Nginx/로드밸런서의 연결 끊김 방지 */
    @Scheduled(fixedDelay = 30_000)
    public void heartbeat() {
        if (emitters.isEmpty()) return;
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("heartbeat").data("ping"));
            } catch (Exception e) {
                emitters.remove(userId, emitter);
            }
        });
        log.debug("SSE heartbeat 전송: 총 {}명", emitters.size());
    }
}
