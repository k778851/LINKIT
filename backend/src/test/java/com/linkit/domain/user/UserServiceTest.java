package com.linkit.domain.user;

import com.linkit.domain.follow.FollowRepository;
import com.linkit.security.JwtTokenProvider;
import com.linkit.security.PiiEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private FollowRepository followRepository;
    @Mock private UserPiiRepository userPiiRepository;
    @Mock private PiiEncryptionService piiEncryptionService;

    @InjectMocks private UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "refreshExpiration", 2_592_000_000L);
    }

    private UserDto.LoginRequest loginReq(String handle, String pwd) {
        UserDto.LoginRequest r = new UserDto.LoginRequest();
        ReflectionTestUtils.setField(r, "handle", handle);
        ReflectionTestUtils.setField(r, "password", pwd);
        return r;
    }

    private UserDto.OnboardingRequest onboardReq(String nickname, String bio) {
        UserDto.OnboardingRequest r = new UserDto.OnboardingRequest();
        ReflectionTestUtils.setField(r, "nickname", nickname);
        ReflectionTestUtils.setField(r, "bio", bio);
        ReflectionTestUtils.setField(r, "marketingOptedIn", Boolean.TRUE);
        return r;
    }

    @Test
    void login_createsNewUser_whenHandleNotFound() {
        String handle = "00000000-12345";
        when(userRepository.findByHandle(handle)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userPiiRepository.existsByUserId(anyString())).thenReturn(false);
        when(tokenProvider.generateToken(anyString())).thenReturn("access-token");
        when(piiEncryptionService.encrypt(anyString())).thenReturn("enc");
        when(piiEncryptionService.hash(anyString())).thenReturn("hash");

        UserDto.LoginResponse resp = userService.login(loginReq(handle, "pw"));

        assertThat(resp.getToken()).isEqualTo("access-token");
        assertThat(resp.getRefreshToken()).isNotBlank();
        assertThat(resp.isNewUser()).isTrue();
        verify(userRepository).save(any(User.class));
        verify(userPiiRepository).save(any(UserPii.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void login_skipsCreation_whenHandleExists() {
        String handle = "00000000-12345";
        User existing = User.builder()
                .id("user-exists")
                .handle(handle)
                .nickname("kim")
                .status(UserStatus.ACTIVE)
                .role(UserRole.USER)
                .build();
        when(userRepository.findByHandle(handle)).thenReturn(Optional.of(existing));
        when(tokenProvider.generateToken("user-exists")).thenReturn("access-token");

        UserDto.LoginResponse resp = userService.login(loginReq(handle, "pw"));

        assertThat(resp.isNewUser()).isFalse();
        assertThat(resp.getToken()).isEqualTo("access-token");
        // No new user creation
        verify(userRepository, never()).save(any(User.class));
        // No PII row created for existing user
        verify(userPiiRepository, never()).save(any(UserPii.class));
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void completeOnboarding_throws_whenAlreadyActive() {
        User active = User.builder()
                .id("user-1")
                .handle("00000000-1")
                .status(UserStatus.ACTIVE)
                .role(UserRole.USER)
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(active));

        assertThatThrownBy(() -> userService.completeOnboarding("user-1", onboardReq("nick", null)))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void completeOnboarding_changesStatusToActive() {
        User onboarding = User.builder()
                .id("user-2")
                .handle("00000000-2")
                .status(UserStatus.ONBOARDING)
                .role(UserRole.USER)
                .build();
        when(userRepository.findById("user-2")).thenReturn(Optional.of(onboarding));
        when(userPiiRepository.findById("user-2")).thenReturn(Optional.empty());
        when(piiEncryptionService.encrypt(anyString())).thenReturn("enc");
        when(piiEncryptionService.hash(anyString())).thenReturn("hash");

        UserDto.ProfileResponse resp = userService.completeOnboarding(
                "user-2", onboardReq("newNick", "hello world"));

        assertThat(onboarding.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(onboarding.getNickname()).isEqualTo("newNick");
        assertThat(onboarding.getBio()).isEqualTo("hello world");
        assertThat(onboarding.getMarketingOptedIn()).isTrue();
        assertThat(resp.getStatus()).isEqualTo("ACTIVE");

        ArgumentCaptor<UserPii> piiCaptor = ArgumentCaptor.forClass(UserPii.class);
        verify(userPiiRepository).save(piiCaptor.capture());
        assertThat(piiCaptor.getValue().getUserId()).isEqualTo("user-2");
    }
}
