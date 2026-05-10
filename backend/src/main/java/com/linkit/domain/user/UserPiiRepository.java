package com.linkit.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPiiRepository extends JpaRepository<UserPii, String> {

    /** 로그인 시 핸들(SHA-256 해시)로 PII 레코드 조회 */
    Optional<UserPii> findByHandleHash(String handleHash);

    /** 전화번호 중복 가입 방지 — SHA-256 해시로 조회 */
    boolean existsByPhoneHash(String phoneHash);

    /** 해당 userId 의 PII 레코드 존재 여부 (온보딩 완료 확인) */
    boolean existsByUserId(String userId);
}
