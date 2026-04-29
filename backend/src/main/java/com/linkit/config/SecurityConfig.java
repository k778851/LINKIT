package com.linkit.config;

import com.linkit.security.CustomUserDetailsService;
import com.linkit.security.JwtAuthenticationFilter;
import com.linkit.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/clubs", "/api/clubs/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/{id}/comments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/clubs/{id}/posts").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                // 관리자 전용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // H2 콘솔 (개발용)
                .requestMatchers("/h2-console/**").permitAll()
                // 나머지 인증 필요
                .anyRequest().authenticated()
            )
            .headers(h -> h.frameOptions(fo -> fo.sameOrigin())) // H2 콘솔 iframe 허용
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
