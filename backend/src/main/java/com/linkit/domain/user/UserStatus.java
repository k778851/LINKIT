package com.linkit.domain.user;

public enum UserStatus {
    /** 시온 인증 완료, 프로필 미설정 */
    ONBOARDING,
    /** 정상 이용 중 */
    ACTIVE,
    /** 이용 정지 */
    SUSPENDED
}
