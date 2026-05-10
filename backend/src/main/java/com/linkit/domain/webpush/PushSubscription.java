package com.linkit.domain.webpush;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Web Push 구독 정보 엔티티.
 * 브라우저가 push 서버에 등록한 endpoint + 암호화 키를 저장합니다.
 */
@Entity
@Table(name = "push_subscriptions",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_push_user_endpoint",
        columnNames = {"user_id", "endpoint"}
    ))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    /** FCM / APNS 등 브라우저별 push 수신 URL */
    @Column(nullable = false, length = 500)
    private String endpoint;

    /** 암호화 공개키 (base64url) */
    @Column(name = "p256dh", nullable = false, length = 200)
    private String p256dh;

    /** 인증 시크릿 (base64url) */
    @Column(name = "auth", nullable = false, length = 100)
    private String auth;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
