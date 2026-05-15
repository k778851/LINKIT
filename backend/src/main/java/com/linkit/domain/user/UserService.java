package com.linkit.domain.user;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.linkit.domain.follow.FollowRepository;
import com.linkit.security.JwtTokenProvider;
import com.linkit.security.PiiEncryptionService;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final FollowRepository followRepository;
    private final UserPiiRepository userPiiRepository;
    private final PiiEncryptionService piiEncryptionService;

    @Value("${jwt.refresh-expiration:2592000000}")
    private long refreshExpiration;

    /* ── 로그인 / 최초 가입 ──────────────────────────────── */

    /**
     * 시온 외부 API 인증 후 LINKIT 로그인.
     *
     * <p>처리 흐름:
     * <ol>
     *   <li>시온 API 호출 → handle + password 검증 (TODO: ZionApiClient 구현)</li>
     *   <li>DB에 해당 handle 없음 → 신규 유저 생성 (ONBOARDING 상태)</li>
     *   <li>DB에 있음 → lastLoginAt 갱신</li>
     *   <li>Access Token 발급 후 반환. status == ONBOARDING 이면 isNewUser = true</li>
     * </ol>
     * </p>
     */
    @Transactional
    public UserDto.LoginResponse login(UserDto.LoginRequest req) {
        // ── 1. 시온 API 검증 ─────────────────────────────────
        // TODO: ZionApiClient.validate(req.getHandle(), req.getPassword())
        //       인증 실패 시 BadCredentialsException 던지도록 구현

        // ── 2. 유저 조회 or 생성 ──────────────────────────────
        boolean[] createdFlag = { false };
        User user = userRepository.findByHandle(req.getHandle())
                .orElseGet(() -> {
                    createdFlag[0] = true;
                    return userRepository.save(
                            User.builder()
                                    .id("user-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                                    .handle(req.getHandle())
                                    .provider("ZION")
                                    .build()
                    );
                });

        // ── 2-1. 신규 가입 시 user_pii 레코드 생성 (handle 암호화/해시) ──
        if (createdFlag[0] && !userPiiRepository.existsByUserId(user.getId())) {
            userPiiRepository.save(UserPii.builder()
                    .userId(user.getId())
                    .handleEnc(piiEncryptionService.encrypt(req.getHandle()))
                    .handleHash(piiEncryptionService.hash(req.getHandle()))
                    .build());
        }

        // ── 3. 마지막 로그인 시각 갱신 ───────────────────────
        user.setLastLoginAt(LocalDateTime.now());

        // ── 4. JWT (Access + Refresh) 발급 ──────────────────
        String accessToken  = tokenProvider.generateToken(user.getId());
        String rawRefresh   = UUID.randomUUID().toString();
        String refreshHash  = JwtTokenProvider.sha256(rawRefresh);
        boolean isNewUser   = user.getStatus() == UserStatus.ONBOARDING;

        // ── 5. Refresh Token DB 저장 ─────────────────────────
        refreshTokenRepository.save(RefreshToken.builder()
                .userId(user.getId())
                .tokenHash(refreshHash)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build());

        return UserDto.LoginResponse.builder()
                .token(accessToken)
                .refreshToken(rawRefresh)
                .user(UserDto.ProfileResponse.from(user))
                .isNewUser(isNewUser)
                .build();
    }

    /* ── 토큰 갱신 ───────────────────────────────────────────── */

    /**
     * Refresh Token 검증 후 새 Access Token 발급.
     * Refresh Token은 그대로 유지합니다 (단일 디바이스 세션 갱신).
     */
    @Transactional
    public UserDto.RefreshResponse refresh(String rawRefreshToken) {
        String hash = JwtTokenProvider.sha256(rawRefreshToken);
        RefreshToken rt = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 Refresh Token 입니다."));
        if (!rt.isValid()) {
            throw new IllegalArgumentException("만료되었거나 폐기된 Refresh Token 입니다.");
        }
        String newAccessToken = tokenProvider.generateToken(rt.getUserId());
        return UserDto.RefreshResponse.builder().token(newAccessToken).build();
    }

    /* ── 로그아웃 ────────────────────────────────────────────── */

    /**
     * Refresh Token 단건 폐기 (현재 기기 로그아웃).
     * rawRefreshToken 이 null/blank 이면 해당 유저의 모든 토큰 폐기.
     */
    @Transactional
    public void logout(String userId, String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String hash = JwtTokenProvider.sha256(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
                rt.setRevokedAt(LocalDateTime.now());
            });
        } else {
            // Refresh Token 없이 로그아웃 → 해당 유저 전체 토큰 폐기
            refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
        }
    }

    /* ── 온보딩 완료 ──────────────────────────────────────── */

    /**
     * 최초 로그인 후 닉네임·자기소개·마케팅 동의 설정.
     * 완료 시 status 를 ONBOARDING → ACTIVE 로 변경합니다.
     */
    @Transactional
    public UserDto.ProfileResponse completeOnboarding(String userId, UserDto.OnboardingRequest req) {
        User user = getUser(userId);
        if (user.getStatus() != UserStatus.ONBOARDING) {
            throw new IllegalStateException("이미 온보딩이 완료된 계정입니다.");
        }
        user.setNickname(req.getNickname());
        user.setBio(req.getBio());
        if (req.getMarketingOptedIn() != null) {
            user.setMarketingOptedIn(req.getMarketingOptedIn());
        }
        user.setStatus(UserStatus.ACTIVE);

        // bio 가 있으면 user_pii 에 암호화 저장
        if (req.getBio() != null && !req.getBio().isBlank()) {
            UserPii pii = userPiiRepository.findById(userId).orElseGet(() -> UserPii.builder()
                    .userId(userId)
                    .handleEnc(piiEncryptionService.encrypt(user.getHandle()))
                    .handleHash(piiEncryptionService.hash(user.getHandle()))
                    .build());
            pii.setBioEnc(piiEncryptionService.encrypt(req.getBio()));
            userPiiRepository.save(pii);
        }
        return UserDto.ProfileResponse.from(user);
    }

    /* ── 프로필 조회 ──────────────────────────────────────── */

    public UserDto.ProfileResponse getProfile(String userId) {
        return getProfile(userId, null);
    }

    public UserDto.ProfileResponse getProfile(String userId, String requesterId) {
        User user = getUser(userId);
        long followers  = followRepository.countByFollowingId(userId);
        long following  = followRepository.countByFollowerId(userId);
        boolean isFollowing = requesterId != null &&
                followRepository.existsByFollowerIdAndFollowingId(requesterId, userId);
        return UserDto.ProfileResponse.from(user, followers, following, isFollowing);
    }

    /* ── 프로필 수정 ──────────────────────────────────────── */

    @Transactional
    public UserDto.ProfileResponse updateProfile(String userId, String requesterId, UserDto.UpdateRequest req) {
        if (!userId.equals(requesterId)) throw new AccessDeniedException("권한이 없습니다.");
        User user = getUser(userId);
        if (req.getNickname()     != null) user.setNickname(req.getNickname());
        if (req.getBio()          != null) user.setBio(req.getBio());
        if (req.getProfileImage() != null) user.setProfileImage(req.getProfileImage());

        // bio / profileImage 변경 시 user_pii 동기화
        if (req.getBio() != null || req.getProfileImage() != null) {
            UserPii pii = userPiiRepository.findById(userId).orElseGet(() -> UserPii.builder()
                    .userId(userId)
                    .handleEnc(piiEncryptionService.encrypt(user.getHandle()))
                    .handleHash(piiEncryptionService.hash(user.getHandle()))
                    .build());
            if (req.getBio() != null) {
                pii.setBioEnc(piiEncryptionService.encrypt(req.getBio()));
            }
            if (req.getProfileImage() != null) {
                pii.setProfileImageEnc(piiEncryptionService.encrypt(req.getProfileImage()));
            }
            userPiiRepository.save(pii);
        }
        return UserDto.ProfileResponse.from(user);
    }

    /* ── 내부 헬퍼 ───────────────────────────────────── */

    private User getUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));
    }
}
