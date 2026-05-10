package com.linkit.domain.report;

import com.linkit.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 신고 엔티티 (reports 테이블).
 *
 * <p>설계 원칙:</p>
 * <ul>
 *   <li>신고자 탈퇴 후에도 신고 이력 보존 → reporter / resolvedBy ON DELETE SET NULL</li>
 *   <li>동일 신고자 + 동일 대상 중복 신고 방지 → DB UNIQUE 제약 + 서비스 레이어 검증</li>
 *   <li>target_type + target_id 로 다형적 대상 참조 (Post, Comment, User, Club, ClubPost)</li>
 * </ul>
 */
@Entity
@Table(
    name = "reports",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_rpt_reporter_target",
        columnNames = {"reporter_id", "target_type", "target_id"}
    ),
    indexes = {
        @Index(name = "idx_rpt_reporter_id", columnList = "reporter_id"),
        @Index(name = "idx_rpt_target",      columnList = "target_type, target_id"),
        @Index(name = "idx_rpt_status",      columnList = "status"),
        @Index(name = "idx_rpt_created_at",  columnList = "created_at")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 신고자. 탈퇴 시 NULL 유지 (신고 이력 보존).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = true)
    private User reporter;

    /**
     * 신고 대상 유형: USER / POST / COMMENT / CLUB / CLUB_POST
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReportTargetType targetType;

    /**
     * 신고 대상 엔티티의 ID (문자열 통합 저장).
     */
    @Column(name = "target_id", nullable = false, length = 50)
    private String targetId;

    /**
     * 신고 사유: SPAM / ABUSE / ILLEGAL / PORNOGRAPHY / OTHER
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportReason reason;

    /**
     * 사용자가 직접 입력한 상세 내용 (선택).
     */
    @Column(columnDefinition = "TEXT")
    private String detail;

    /**
     * 처리 상태: PENDING → RESOLVED | DISMISSED
     */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    /**
     * 처리한 관리자. 탈퇴 시 NULL 유지.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by", nullable = true)
    private User resolvedBy;

    /** 처리 일시 */
    private LocalDateTime resolvedAt;

    /** 신고 접수 일시 */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
