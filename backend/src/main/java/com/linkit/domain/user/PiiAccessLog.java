package com.linkit.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 개인정보 조회 이력 로그 (pii_access_logs).
 *
 * <p>개인정보 보호법 제29조(안전조치 의무)에 따라 개인정보 조회 시
 * 조회자·대상·항목·사유를 INSERT ONLY 로 기록합니다.</p>
 *
 * <ul>
 *   <li>보존 기간: 3년 (개인정보 보호법 시행령 제30조)</li>
 *   <li>accessor_ip 는 사고 대응을 위해 평문 저장 (암호화 대상 제외)</li>
 *   <li>UPDATE / DELETE 금지 — 애플리케이션 레이어에서 통제</li>
 * </ul>
 */
@Entity
@Table(name = "pii_access_logs",
        indexes = {
            @Index(name = "idx_pal_accessor_id",    columnList = "accessor_id"),
            @Index(name = "idx_pal_target_user_id", columnList = "target_user_id"),
            @Index(name = "idx_pal_accessed_at",    columnList = "accessed_at")
        })
@Getter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PiiAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 조회자 ID (users.id 참조).
     * 탈퇴 후에도 로그를 보존하기 위해 FK ON DELETE SET NULL 적용 → NULL 허용.
     */
    @Column(name = "accessor_id", length = 50)
    private String accessorId;

    /**
     * 조회자 유형.
     * 예: "USER"(일반 유저), "ADMIN"(관리자), "SYSTEM"(배치/내부 프로세스)
     */
    @Column(nullable = false, length = 20)
    private String accessorType;

    /** 조회 대상 유저 ID */
    @Column(nullable = false, length = 50)
    private String targetUserId;

    /**
     * 조회한 개인정보 항목 목록 (쉼표 구분).
     * 예: "handle,bio,profile_image"
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String fieldsAccessed;

    /**
     * 조회 사유.
     * 예: "프로필 조회", "고객센터 문의 처리", "신고 접수 확인"
     */
    @Column(columnDefinition = "TEXT")
    private String purpose;

    /**
     * 조회 결과.
     * SUCCESS | FAILURE | PARTIAL (일부 복호화 실패)
     */
    @Builder.Default
    @Column(nullable = false, length = 20)
    private String accessResult = "SUCCESS";

    /** 조회자 IP 주소 (평문 저장 — 사고 대응용) */
    @Column(length = 45)
    private String accessorIp;

    /** 조회자 User-Agent */
    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime accessedAt;
}
