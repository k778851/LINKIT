package com.linkit.config;

import com.linkit.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 서버 시작 시 개발용 테스트 계정 정보를 로그로 출력합니다.
 *
 * <p>시온 외부 API 인증 방식을 사용하므로 LINKIT 서버에 비밀번호를 저장하지 않습니다.
 * 로컬 테스트 시에는 Zion API 스텁(mock)을 통해 인증을 진행하세요.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        long count = userRepository.count();

        log.info("========================================");
        log.info("✅ LINKIT 서버 시작 완료");
        log.info("  등록된 유저 수 : {}", count);
        log.info("----------------------------------------");
        log.info("  [개발 테스트 계정]");
        log.info("  관리자  고유번호 : 00000000-00000");
        log.info("  유저-1  고유번호 : 20240001-00001  (러닝장)");
        log.info("  유저-me 고유번호 : 20240001-00099  (링킷유저)");
        log.info("  ※ 비밀번호는 Zion API 스텁 설정을 확인하세요.");
        log.info("========================================");
    }
}
