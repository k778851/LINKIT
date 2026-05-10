package com.linkit.domain.report;

/**
 * 신고 처리 상태.
 */
public enum ReportStatus {
    PENDING,    // 접수됨 (미처리)
    RESOLVED,   // 처리 완료 (제재 등)
    DISMISSED   // 기각
}
