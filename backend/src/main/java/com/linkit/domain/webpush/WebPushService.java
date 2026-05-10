package com.linkit.domain.webpush;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional(readOnly = true)
public class WebPushService {

    static {
        // web-push 라이브러리가 Bouncy Castle 암호화 provider 필요
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    private final PushSubscriptionRepository subscriptionRepository;
    private final PushService                pushService;
    private final ObjectMapper               objectMapper;
    private final String                     vapidPublicKey;

    public WebPushService(
            PushSubscriptionRepository subscriptionRepository,
            ObjectMapper objectMapper,
            @Value("${app.vapid.public-key}")  String publicKey,
            @Value("${app.vapid.private-key}") String privateKey,
            @Value("${app.vapid.subject}")     String subject
    ) throws Exception {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper   = objectMapper;
        this.vapidPublicKey = publicKey;
        this.pushService    = new PushService(publicKey, privateKey, subject);
    }

    /** VAPID 공개키 반환 — base64url 문자열 (프론트엔드 구독 시 필요) */
    public String getPublicKey() {
        return vapidPublicKey;
    }

    /** 구독 등록 (중복이면 무시) */
    @Transactional
    public void subscribe(String userId, String endpoint, String p256dh, String auth) {
        if (!subscriptionRepository.existsByUserIdAndEndpoint(userId, endpoint)) {
            subscriptionRepository.save(PushSubscription.builder()
                    .userId(userId)
                    .endpoint(endpoint)
                    .p256dh(p256dh)
                    .auth(auth)
                    .build());
            log.debug("Web Push 구독 등록: userId={}", userId);
        }
    }

    /** 구독 해제 */
    @Transactional
    public void unsubscribe(String userId, String endpoint) {
        subscriptionRepository.deleteByUserIdAndEndpoint(userId, endpoint);
    }

    /** 특정 사용자에게 push 전송 */
    public void sendToUser(String userId, String title, String body, String icon, String path) {
        List<PushSubscription> subs = subscriptionRepository.findByUserId(userId);
        if (subs.isEmpty()) return;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "body",  body,
                    "icon",  icon != null ? icon : "/icon-192.png",
                    "data",  Map.of("path", path != null ? path : "/")
            ));
        } catch (Exception e) {
            log.error("Web Push payload 직렬화 실패", e);
            return;
        }

        for (PushSubscription sub : subs) {
            try {
                Subscription subscription = new Subscription(
                        sub.getEndpoint(),
                        new Subscription.Keys(sub.getP256dh(), sub.getAuth())
                );
                Notification notification = new Notification(subscription, payload);
                pushService.send(notification);
            } catch (Exception e) {
                log.warn("Web Push 전송 실패: userId={}, endpoint={}, error={}",
                        userId, sub.getEndpoint(), e.getMessage());
            }
        }
    }
}
