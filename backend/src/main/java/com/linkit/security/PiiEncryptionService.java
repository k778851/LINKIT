package com.linkit.security;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * PII (개인정보) 암호화 서비스.
 *
 * <ul>
 *   <li>{@link #encrypt(String)} — AES-256-GCM 양방향 암호화 (Base64 IV||ciphertext+tag)</li>
 *   <li>{@link #decrypt(String)} — 역암호화</li>
 *   <li>{@link #hash(String)} — SHA-256 단방향 해시 (검색용)</li>
 * </ul>
 *
 * <p>키는 {@code app.encryption.key} 프로퍼티(=환경변수 {@code APPLICATION_ENC_KEY})에서 읽으며
 * 정확히 32바이트(256비트)여야 합니다. 비어 있으면 개발용 결정적 키를 생성하고 경고 로그를 남깁니다.</p>
 */
@Slf4j
@Service
public class PiiEncryptionService {

    private static final String CIPHER_ALGO = "AES/GCM/NoPadding";
    private static final String KEY_ALGO = "AES";
    private static final int IV_LENGTH = 12;        // 96-bit IV — GCM 권장
    private static final int TAG_LENGTH_BITS = 128; // 16-byte tag
    private static final int KEY_LENGTH_BYTES = 32; // 256-bit key
    private static final String DEV_KEY_SEED = "linkit-dev-key-do-not-use-in-prod-32b!";

    private final String configuredKey;
    private final SecureRandom secureRandom = new SecureRandom();
    private SecretKeySpec secretKey;

    public PiiEncryptionService(@Value("${app.encryption.key:}") String configuredKey) {
        this.configuredKey = configuredKey;
    }

    @PostConstruct
    void init() {
        byte[] keyBytes;
        if (configuredKey == null || configuredKey.isBlank()) {
            log.warn("⚠️  app.encryption.key 가 설정되지 않았습니다. 개발용 결정적 키를 사용합니다. "
                    + "운영 환경에서는 반드시 APPLICATION_ENC_KEY 환경변수를 설정하세요.");
            keyBytes = sha256Bytes(DEV_KEY_SEED.getBytes(StandardCharsets.UTF_8));
        } else {
            byte[] raw = configuredKey.getBytes(StandardCharsets.UTF_8);
            if (raw.length == KEY_LENGTH_BYTES) {
                keyBytes = raw;
            } else {
                // 사용자가 더 긴/짧은 시크릿을 넣었을 경우 SHA-256 으로 32바이트 normalize
                log.warn("app.encryption.key 길이가 32바이트가 아닙니다(현재 {}). SHA-256으로 정규화합니다.", raw.length);
                keyBytes = sha256Bytes(raw);
            }
        }
        this.secretKey = new SecretKeySpec(keyBytes, KEY_ALGO);
    }

    /**
     * AES-256-GCM 암호화.
     *
     * @param plain 평문 (null/blank 이면 null 반환)
     * @return Base64(IV(12B) || ciphertext+tag)
     */
    public String encrypt(String plain) {
        if (plain == null || plain.isBlank()) return null;
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER_ALGO);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] ct = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));

            byte[] out = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(ct, 0, out, iv.length, ct.length);
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new IllegalStateException("PII 암호화 실패", e);
        }
    }

    /**
     * AES-256-GCM 복호화.
     *
     * @param encoded encrypt() 결과 Base64 문자열 (null/blank 이면 null 반환)
     */
    public String decrypt(String encoded) {
        if (encoded == null || encoded.isBlank()) return null;
        try {
            byte[] all = Base64.getDecoder().decode(encoded);
            if (all.length < IV_LENGTH + 16) {
                throw new IllegalArgumentException("암호문 길이가 비정상입니다.");
            }
            byte[] iv = new byte[IV_LENGTH];
            byte[] ct = new byte[all.length - IV_LENGTH];
            System.arraycopy(all, 0, iv, 0, IV_LENGTH);
            System.arraycopy(all, IV_LENGTH, ct, 0, ct.length);

            Cipher cipher = Cipher.getInstance(CIPHER_ALGO);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] pt = cipher.doFinal(ct);
            return new String(pt, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("PII 복호화 실패", e);
        }
    }

    /**
     * SHA-256 단방향 해시 — hex 소문자 64자.
     * 검색 가능한 lookup용 (예: handleHash, phoneHash).
     */
    public String hash(String plain) {
        if (plain == null || plain.isBlank()) return null;
        byte[] digest = sha256Bytes(plain.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static byte[] sha256Bytes(byte[] input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return md.digest(input);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 해시 실패", e);
        }
    }
}
