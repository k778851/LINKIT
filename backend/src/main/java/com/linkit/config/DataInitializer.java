package com.linkit.config;

import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import com.linkit.domain.user.UserRole;
import com.linkit.domain.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();

        log.info("========================================");
        log.info("LINKIT dev server ready (클린 DB)");
        log.info("  users: {}", userRepository.count());
        log.info("  demo accounts:");
        log.info("    00000000-00000 / admin1234 → 전체관리자 (SUPER_ADMIN)");
        log.info("    00000000-00001 / linkit1234 → 지파유저 (JIPA)");
        log.info("    00371210-00149 / linkit1234 → 본부관리자");
        log.info("    00371210-00150 / linkit1234 → 광산관리자");
        log.info("    00371210-00151 / linkit1234 → 북구관리자");
        log.info("========================================");
    }

    private void seedUsers() {
        saveUser("admin",         "00000000-00000", "전체관리자", "LINKIT 전체 관리자", UserRole.SUPER_ADMIN,   null);
        saveUser("admin-bonbu",   "00371210-00149", "본부관리자", "본부 지역 관리자",   UserRole.BONBU_ADMIN,   "본부");
        saveUser("admin-gwangsan","00371210-00150", "광산관리자", "광산 지역 관리자",   UserRole.GWANGSAN_ADMIN,"광산");
        saveUser("admin-bukgu",   "00371210-00151", "북구관리자", "북구 지역 관리자",   UserRole.BUKGU_ADMIN,   "북구");
        saveUser("jipa",     "00000000-00001", "지파유저",  "전체 지역 클럽 개설 권한", UserRole.JIPA, null);
        saveUser("user-me",  "20240001-00099", "링킷유저",  "소모임을 사랑하는 사람", UserRole.USER, "본부");
        saveUser("user-1",   "20240001-00001", "러닝장",    "매주 달리는 러닝 크루장", UserRole.USER, "본부");
        saveUser("user-2",   "20240001-00002", "피자러버",  "맛집 탐방 전문가",       UserRole.USER, "본부");
        saveUser("user-3",   "20240001-00003", "필름감성",  "필름 사진 모임장",       UserRole.USER, "본부");
        saveUser("user-4",   "20240001-00004", "밴드마스터","홍대 밴드 클럽장",       UserRole.USER, "광산");
        saveUser("user-5",   "20240001-00005", "독서왕",    "한 달에 한 권 독서모임", UserRole.USER, "광산");
        saveUser("user-6",   "20240001-00006", "풋살왕",    "주말 풋살 크루장",       UserRole.USER, "북구");
    }

    private void saveUser(String id, String handle, String nickname, String bio, UserRole role, String serviceRegion) {
        userRepository.findByHandle(handle).ifPresentOrElse((user) -> {
            if (user.getNickname() == null || user.getNickname().isBlank()) user.setNickname(nickname);
            if (user.getBio() == null || user.getBio().isBlank()) user.setBio(bio);
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            user.setServiceRegion(serviceRegion);
        }, () -> {
            if (userRepository.existsById(id)) return;
            userRepository.save(User.builder()
                .id(id)
                .handle(handle)
                .nickname(nickname)
                .bio(bio)
                .role(role)
                .status(UserStatus.ACTIVE)
                .marketingOptedIn(true)
                .serviceRegion(serviceRegion)
                .build());
        });
    }

}
