package com.linkit.domain.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    /** 중복 신고 여부 확인 (같은 신고자 + 같은 대상) */
    boolean existsByReporter_IdAndTargetTypeAndTargetId(
            String reporterId, ReportTargetType targetType, String targetId);

    /** 특정 대상에 대한 모든 신고 조회 (관리자용) */
    Page<Report> findByTargetTypeAndTargetId(
            ReportTargetType targetType, String targetId, Pageable pageable);

    /** 처리 상태별 신고 목록 (관리자용) */
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    /** 특정 신고자의 신고 내역 */
    Page<Report> findByReporter_Id(String reporterId, Pageable pageable);

    /** 대상 유형별 PENDING 신고 수 (관리자 대시보드용) */
    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = 'PENDING' AND r.targetType = :type")
    long countPendingByTargetType(@Param("type") ReportTargetType type);

    /** 신고자 + 대상으로 단건 조회 (중복 신고 조회) */
    Optional<Report> findByReporter_IdAndTargetTypeAndTargetId(
            String reporterId, ReportTargetType targetType, String targetId);
}
