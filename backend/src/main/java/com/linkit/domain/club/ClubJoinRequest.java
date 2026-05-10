package com.linkit.domain.club;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 클럽 가입 신청 엔티티.
 * 비공개 클럽의 가입 승인 플로우를 지원합니다.
 */
@Entity
@Table(name = "club_join_requests",
        indexes = {
            @Index(name = "idx_cjr_club_id",  columnList = "club_id"),
            @Index(name = "idx_cjr_user_id",  columnList = "user_id")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ClubJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "club_id", nullable = false, length = 50)
    private String clubId;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    /** 가입 신청 메시지 (join_question 에 대한 답변) */
    @Column(columnDefinition = "TEXT")
    private String message;

    /** PENDING | APPROVED | REJECTED */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 10)
    private JoinRequestStatus status = JoinRequestStatus.PENDING;

    /** 승인/거절 처리 시각 */
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
