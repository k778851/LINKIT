package com.linkit.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-must-be-at-least-32-bytes-long";
    private static final long EXPIRATION_MS = 3_600_000L;

    private final JwtTokenProvider provider = new JwtTokenProvider(SECRET, EXPIRATION_MS);

    @Test
    void generateToken_returnsValidToken_thatExtractsSameUserId() {
        String userId = "user-12345";
        String token = provider.generateToken(userId);

        assertThat(token).isNotBlank();
        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getUserIdFromToken(token)).isEqualTo(userId);
    }

    @Test
    void validateToken_returnsFalse_forTamperedToken() {
        String token = provider.generateToken("user-abc");
        // Flip the last character of the signature to corrupt it.
        char last = token.charAt(token.length() - 1);
        char replacement = (last == 'A') ? 'B' : 'A';
        String tampered = token.substring(0, token.length() - 1) + replacement;

        assertThat(provider.validateToken(tampered)).isFalse();
    }

    @Test
    void sha256_returnsConsistentHash() {
        String input = "some-refresh-token-value";
        String hash1 = JwtTokenProvider.sha256(input);
        String hash2 = JwtTokenProvider.sha256(input);

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64);            // hex-encoded SHA-256
        assertThat(hash1).matches("[0-9a-f]{64}");
        assertThat(JwtTokenProvider.sha256("different")).isNotEqualTo(hash1);
    }
}
