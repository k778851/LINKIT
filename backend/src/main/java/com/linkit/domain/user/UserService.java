package com.linkit.domain.user;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.linkit.security.JwtTokenProvider;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public UserDto.ProfileResponse register(UserDto.RegisterRequest req) {
        if (userRepository.existsByHandle(req.getHandle())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        User user = User.builder()
                .id("user-" + UUID.randomUUID().toString().substring(0, 8))
                .handle(req.getHandle())
                .nickname(req.getNickname())
                .password(passwordEncoder.encode(req.getPassword()))
                .emoji(req.getEmoji() != null ? req.getEmoji() : "😊")
                .bio(req.getBio())
                .build();
        return UserDto.ProfileResponse.from(userRepository.save(user));
    }

    public UserDto.LoginResponse login(UserDto.LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userRepository.findByHandle(req.getHandle())
                                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."))
                                .getId(),
                        req.getPassword()
                )
        );
        String userId = auth.getName();
        User user = getUser(userId);
        String token = tokenProvider.generateToken(userId);
        return UserDto.LoginResponse.builder()
                .token(token)
                .user(UserDto.ProfileResponse.from(user))
                .build();
    }

    public UserDto.ProfileResponse getProfile(String userId) {
        return UserDto.ProfileResponse.from(getUser(userId));
    }

    @Transactional
    public UserDto.ProfileResponse updateProfile(String userId, String requesterId, UserDto.UpdateRequest req) {
        if (!userId.equals(requesterId)) throw new AccessDeniedException("권한이 없습니다.");
        User user = getUser(userId);
        if (req.getNickname()     != null) user.setNickname(req.getNickname());
        if (req.getEmoji()        != null) user.setEmoji(req.getEmoji());
        if (req.getBio()          != null) user.setBio(req.getBio());
        if (req.getProfileImage() != null) user.setProfileImage(req.getProfileImage());
        return UserDto.ProfileResponse.from(user);
    }

    /* ── 클럽 멤버십 ──────────────────────────────────── */

    @Transactional
    public void joinClub(String userId, String clubId) {
        getUser(userId).getJoinedClubs().add(clubId);
    }

    @Transactional
    public void leaveClub(String userId, String clubId) {
        getUser(userId).getJoinedClubs().remove(clubId);
    }

    @Transactional
    public boolean toggleBookmark(String userId, String clubId) {
        User user = getUser(userId);
        Set<String> bookmarks = user.getBookmarkedClubs();
        if (bookmarks.contains(clubId)) {
            bookmarks.remove(clubId);
            return false;
        } else {
            bookmarks.add(clubId);
            return true;
        }
    }

    /* ── 내부 헬퍼 ───────────────────────────────────── */

    private User getUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));
    }
}
