package com.linkit.config;

import com.linkit.security.CustomUserDetailsService;
import com.linkit.security.JwtAuthenticationFilter;
import com.linkit.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    /** application.yml: app.cors.allowed-origins (쉼표 구분) */
    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/push/public-key").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/clubs", "/api/clubs/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/{id}/comments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/clubs/{id}/posts").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                // 업로드 파일 정적 서빙 (인증 불필요)
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                // 관리자 전용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // H2 콘솔 (개발용)
                .requestMatchers("/h2-console/**").permitAll()
                // 나머지 인증 필요
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                // 미인증 요청 → 401 (기본값이 403이라 명시 필요)
                .authenticationEntryPoint((req, res, e) ->
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                // 인증은 됐으나 권한 없음 → 403
                .accessDeniedHandler((req, res, e) ->
                    res.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // application.yml에서 허용 origin 목록 읽기 (쉼표 구분)
        List<String> origins = List.of(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false); // Bearer JWT 방식 → credentials 불필요
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}
