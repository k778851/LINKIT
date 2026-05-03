package com.linkit.config;

import com.linkit.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 서버 시작 시 data.sql의 가짜 비밀번호 해시를 실제 BCrypt 해시로 교체.
 *
 * 테스트 계정 비밀번호
 *   일반 유저 : linkit1234
 *   관리자    : admin1234
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String userPw  = passwordEncoder.encode("linkit1234");
        String adminPw = passwordEncoder.encode("admin1234");

        userRepository.findAll().forEach(user -> {
            // data.sql 에서 삽입된 가짜 해시는 "dummyhash" 포함
            if (user.getPassword().contains("dummyhash")) {
                user.setPassword("ADMIN".equals(user.getRole()) ? adminPw : userPw);
                userRepository.save(user);
            }
        });

        log.info("========================================");
        log.info("✅ 테스트 계정 초기화 완료");
        log.info("  일반 유저  비밀번호 : linkit1234");
        log.info("  관리자     비밀번호 : admin1234");
        log.info("----------------------------------------");
        log.info("  관리자  고유번호 : 00000000-00000");
        log.info("  유저-1  고유번호 : 20240001-00001  (러닝장)");
        log.info("  유저-me 고유번호 : 20240001-00099  (링킷유저)");
        log.info("========================================");
    }
}
