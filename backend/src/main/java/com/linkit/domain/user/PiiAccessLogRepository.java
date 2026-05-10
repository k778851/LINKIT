package com.linkit.domain.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PiiAccessLogRepository extends JpaRepository<PiiAccessLog, Long> {

    /** 특정 유저에 대한 조회 이력 (관리자 감사용) */
    Page<PiiAccessLog> findByTargetUserIdOrderByAccessedAtDesc(String targetUserId, Pageable pageable);

    /** 특정 조회자의 접근 이력 */
    Page<PiiAccessLog> findByAccessorIdOrderByAccessedAtDesc(String accessorId, Pageable pageable);

    /** 기간별 로그 조회 (보존 기간 만료 정리 등) */
    List<PiiAccessLog> findByAccessedAtBefore(LocalDateTime cutoff);

    /** FAILURE 건 조회 (보안 모니터링) */
    Page<PiiAccessLog> findByAccessResultOrderByAccessedAtDesc(String accessResult, Pageable pageable);
}
