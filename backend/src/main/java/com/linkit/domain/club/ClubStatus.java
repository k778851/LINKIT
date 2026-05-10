package com.linkit.domain.club;

public enum ClubStatus {
    /** 작성 중 (임시저장) */
    DRAFT,
    /** 관리자 승인 대기 */
    PENDING,
    /** 정상 운영 */
    ACTIVE,
    /** 종료 (소프트 삭제) */
    CLOSED
}
