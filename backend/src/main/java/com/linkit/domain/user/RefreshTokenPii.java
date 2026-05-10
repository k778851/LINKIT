package com.linkit.domain.user;

import jakarta.persistence.*;
import lombok.*;

/**
 * Refresh Token 개인정보 암호화 저장 테이블 (refresh_token_pii).
 *
 * <p>refresh_tokens 테이블과 1:1 관계이며, IP 주소·디바이스 정보를
 * AES-256-GCM 으로 암호화하여 별도 테이블에 보관합니다.</p>
 *
 * <p>⚠️ INSERT ONLY 원칙: 토큰 발급 시 INSERT, 이후 조회만 허용.</p>
 */
@Entity
@Table(name = "refresh_token_pii")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshTokenPii {

    /** refresh_tokens.id 와 동일 (공유 PK) */
    @Id
    @Column(name = "token_id")
    private Long tokenId;

    /** AES-256-GCM 암호화된 접속 IP (예: "192.168.1.100") */
    @Column(columnDefinition = "TEXT")
    private String ipAddressEnc;

    /** AES-256-GCM 암호화된 디바이스 정보 (예: "iPhone 15 / iOS 17") */
    @Column(columnDefinition = "TEXT")
    private String deviceInfoEnc;

    /** 암호화 키 버전 */
    @Builder.Default
    @Column(nullable = false, length = 10)
    private String encVersion = "v1";
}
