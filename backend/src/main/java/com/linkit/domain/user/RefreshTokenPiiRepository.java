package com.linkit.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenPiiRepository extends JpaRepository<RefreshTokenPii, Long> {
    // PK(token_id) 기반 단건 조회는 JpaRepository 기본 메서드(findById) 사용
}
