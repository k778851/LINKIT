package com.linkit.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 유저 개인정보 암호화 저장 테이블 (user_pii).
 *
 * <p>users 테이블과 1:1 관계이며, 암호화가 필요한 PII 컬럼을 물리적으로 분리하여
 * 일반 조회(SELECT *) 시 민감 정보가 노출되는 것을 방지합니다.</p>
 *
 * <p>보안 정책 (개발 착수 보고서 4조 기준):</p>
 * <ul>
 *   <li>handle_enc  — 시온 고유번호: 양방향 암호화(AES-256-GCM) + Base64 저장</li>
 *   <li>handle_hash — SHA-256 단방향 해시 (로그인 lookup용)</li>
 *   <li>real_name, phone_number — users 테이블 평문 저장 + 출력 시 마스킹</li>
 *   <li>bio_enc, profile_image_enc — 부가 프로필 정보 암호화</li>
 * </ul>
 *
 * <p>⚠️ INSERT ONLY 원칙: INSERT / 단건 SELECT 만 허용.
 * 키 교체 시에는 re_encrypted_at 을 갱신합니다.</p>
 */
@Entity
@Table(name = "user_pii",
        indexes = {
            @Index(name = "uq_pii_handle_hash", columnList = "handle_hash", unique = true),
            @Index(name = "uq_pii_phone_hash",  columnList = "phone_hash",  unique = true)
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserPii {

    /** users.id 와 동일 (공유 PK) */
    @Id
    @Column(name = "user_id", length = 50)
    private String userId;

    /** SHA-256(handle) — WHERE handle_hash = ? 로 로그인 lookup 에 사용 */
    @Column(nullable = false, unique = true, length = 64)
    private String handleHash;

    /**
     * 양방향 암호화(AES-256-GCM)된 시온 고유번호 (Base64 인코딩).
     * 개발 착수 보고서: "고유번호를 Base64로 양방향 암호화 저장"
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String handleEnc;

    /** AES-256-GCM 암호화된 실명 (시온 API 수신값) */
    @Column(columnDefinition = "TEXT")
    private String realNameEnc;

    /**
     * SHA-256(phone_number) — 중복 가입 방지 lookup용 단방향 해시.
     * NULL 허용 (전화번호 미수신 시)
     */
    @Column(unique = true, length = 64)
    private String phoneHash;

    /** AES-256-GCM 암호화된 전화번호 (Base64 인코딩) */
    @Column(columnDefinition = "TEXT")
    private String phoneEnc;

    /** AES-256-GCM 암호화된 자기소개 (NULL 허용) */
    @Column(columnDefinition = "TEXT")
    private String bioEnc;

    /** AES-256-GCM 암호화된 프로필 이미지 URL (NULL 허용) */
    @Column(columnDefinition = "TEXT")
    private String profileImageEnc;

    /** 암호화 키 버전 — 키 교체 시 추적용 (예: "v1", "v2") */
    @Builder.Default
    @Column(nullable = false, length = 10)
    private String encVersion = "v1";

    /** 최초 암호화 일시 */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime encryptedAt;

    /** 마지막 재암호화 일시 (키 교체 후 갱신) */
    private LocalDateTime reEncryptedAt;
}
