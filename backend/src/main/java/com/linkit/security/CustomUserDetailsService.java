package com.linkit.security;

import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import com.linkit.domain.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /** username 파라미터에는 userId 값이 전달됩니다. */
    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없습니다: " + userId));

        // 시온 외부 API 인증 방식 — LINKIT 은 비밀번호를 저장하지 않습니다.
        // JWT 검증 필터에서 토큰 유효성만 확인하므로 password 는 빈 값으로 설정합니다.
        String roleName = switch (user.getRole()) {
            case SUPER_ADMIN        -> "ROLE_SUPER_ADMIN";
            case BONBU_ADMIN,
                 GWANGSAN_ADMIN,
                 BUKGU_ADMIN,
                 ADMIN              -> "ROLE_ADMIN";
            case JIPA               -> "ROLE_JIPA";
            default                 -> "ROLE_USER";
        };
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getId())
                .password("")
                .authorities(List.of(new SimpleGrantedAuthority(roleName)))
                .build();
    }
}
