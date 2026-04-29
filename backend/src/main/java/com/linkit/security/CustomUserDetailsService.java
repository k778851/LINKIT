package com.linkit.security;

import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
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

        String role = "ADMIN".equals(user.getRole()) ? "ROLE_ADMIN" : "ROLE_USER";
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getId())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .build();
    }
}
