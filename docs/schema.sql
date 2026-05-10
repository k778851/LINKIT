-- ============================================================
-- LINKIT Database Schema
-- 작성일: 2026-05-07
-- 인증: 외부 시온(Zion) API 연동 (비밀번호 미저장)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  VARCHAR(50)  NOT NULL,
    handle              VARCHAR(20)  NOT NULL COMMENT '시온 고유번호 (00000000-00000)',
    provider            VARCHAR(20)  NOT NULL DEFAULT 'ZION' COMMENT '외부 인증 제공자',
    real_name           VARCHAR(20)  NULL     COMMENT '시온 API 수신 실명 (암호화 사본 → user_pii.real_name_enc)',
    phone_number        VARCHAR(20)  NULL     COMMENT '전화번호 (암호화 사본 → user_pii.phone_enc)',
    nickname            VARCHAR(20)  NULL     COMMENT 'LINKIT 닉네임 (온보딩 전 NULL)',
    bio                 TEXT         NULL,
    profile_image       VARCHAR(500) NULL,
    role                VARCHAR(10)  NOT NULL DEFAULT 'USER'       COMMENT 'USER | ADMIN',
    status              VARCHAR(15)  NOT NULL DEFAULT 'ONBOARDING' COMMENT 'ONBOARDING | ACTIVE | SUSPENDED',
    marketing_opted_in  BOOLEAN      NOT NULL DEFAULT FALSE,
    last_login_at       DATETIME     NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_handle (handle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='서비스 사용자';

-- ------------------------------------------------------------
-- 2. refresh_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    user_id      VARCHAR(50)  NOT NULL,
    token_hash   VARCHAR(64)  NOT NULL COMMENT 'SHA-256 해시 (원본 미저장)',
    device_info  VARCHAR(200) NULL,
    ip_address   VARCHAR(45)  NULL     COMMENT 'IPv6 대응 45자',
    issued_at    DATETIME     NOT NULL,
    expires_at   DATETIME     NOT NULL,
    revoked_at   DATETIME     NULL     COMMENT 'NULL = 유효한 토큰',

    PRIMARY KEY (id),
    UNIQUE KEY uq_rt_token_hash (token_hash),
    INDEX idx_rt_user_id   (user_id),
    INDEX idx_rt_expires_at (expires_at),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='LINKIT JWT Refresh Token';

-- ------------------------------------------------------------
-- 3. clubs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clubs (
    id            VARCHAR(50)  NOT NULL,
    name          VARCHAR(100) NOT NULL,
    emoji         VARCHAR(10)  NULL     COMMENT '커버 이미지 미설정 시 fallback',
    cover_image   VARCHAR(500) NULL,
    category      VARCHAR(30)  NULL     COMMENT '운동|음식|아트|스터디|음악|기타',
    description   TEXT         NULL,
    member_count  INT          NOT NULL DEFAULT 0,
    new_count     INT          NOT NULL DEFAULT 0,
    is_private    BOOLEAN      NOT NULL DEFAULT FALSE,
    join_question TEXT         NULL     COMMENT '비공개 클럽 가입 질문',
    schedule      VARCHAR(100) NULL     COMMENT '정기 모임 텍스트',
    location      VARCHAR(100) NULL,
    status        VARCHAR(10)  NOT NULL DEFAULT 'PENDING' COMMENT 'DRAFT|PENDING|ACTIVE|CLOSED',
    created_by    VARCHAR(50)  NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_clubs_category  (category),
    INDEX idx_clubs_status    (status),
    INDEX idx_clubs_created_by (created_by),
    CONSTRAINT fk_clubs_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='동네 소모임 클럽';

-- ------------------------------------------------------------
-- 4. club_tags
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_tags (
    club_id VARCHAR(50) NOT NULL,
    tag     VARCHAR(50) NOT NULL,

    INDEX idx_club_tags_club_id (club_id),
    CONSTRAINT fk_club_tags_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. club_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_members (
    club_id   VARCHAR(50) NOT NULL,
    user_id   VARCHAR(50) NOT NULL,
    role      VARCHAR(10) NOT NULL DEFAULT 'MEMBER' COMMENT 'OWNER | ADMIN | MEMBER',
    joined_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (club_id, user_id),
    INDEX idx_cm_user_id (user_id),
    CONSTRAINT fk_cm_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='클럽 멤버십 (역할·가입일 포함)';

-- ------------------------------------------------------------
-- 6. club_bookmarks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_bookmarks (
    user_id    VARCHAR(50) NOT NULL,
    club_id    VARCHAR(50) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, club_id),
    INDEX idx_cb_club_id (club_id),
    CONSTRAINT fk_cb_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_cb_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='클럽 찜';

-- ------------------------------------------------------------
-- 7. club_join_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_join_requests (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    club_id      VARCHAR(50) NOT NULL,
    user_id      VARCHAR(50) NOT NULL,
    message      TEXT        NULL     COMMENT '가입 신청 메시지',
    status       VARCHAR(10) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING | APPROVED | REJECTED',
    processed_at DATETIME    NULL,
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_cjr_club_id (club_id),
    INDEX idx_cjr_user_id (user_id),
    CONSTRAINT fk_cjr_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE,
    CONSTRAINT fk_cjr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='클럽 가입 신청';

-- ------------------------------------------------------------
-- 8. schedules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
    id           VARCHAR(50)  NOT NULL,
    club_id      VARCHAR(50)  NOT NULL,
    title        VARCHAR(100) NOT NULL,
    description  TEXT         NULL,
    scheduled_at DATETIME     NOT NULL COMMENT '모임 시작 일시',
    location     VARCHAR(200) NULL,
    created_by   VARCHAR(50)  NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_sch_club_id      (club_id),
    INDEX idx_sch_scheduled_at (scheduled_at),
    CONSTRAINT fk_sch_club    FOREIGN KEY (club_id)    REFERENCES clubs (id) ON DELETE CASCADE,
    CONSTRAINT fk_sch_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='클럽 모임 일정';

-- ------------------------------------------------------------
-- 9. schedule_attendees
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_attendees (
    schedule_id VARCHAR(50) NOT NULL,
    user_id     VARCHAR(50) NOT NULL,
    joined_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (schedule_id, user_id),
    INDEX idx_sa_user_id (user_id),
    CONSTRAINT fk_sa_schedule FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE,
    CONSTRAINT fk_sa_user     FOREIGN KEY (user_id)     REFERENCES users (id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='일정 참여 신청 (클럽 멤버만 가능 — 앱 레이어 검증)';

-- ------------------------------------------------------------
-- 10. posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id            VARCHAR(50)  NOT NULL,
    category      VARCHAR(30)  NULL     COMMENT '일상|질문|모임|나눔|생활정보',
    title         VARCHAR(200) NOT NULL,
    content       TEXT         NOT NULL,
    image         VARCHAR(500) NULL     COMMENT '첨부 이미지 URL',
    location      VARCHAR(100) NULL,
    author_id     VARCHAR(50)  NOT NULL,
    like_count    INT          NOT NULL DEFAULT 0,
    comment_count INT          NOT NULL DEFAULT 0,
    view_count    INT          NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_posts_author_id  (author_id),
    INDEX idx_posts_category   (category),
    INDEX idx_posts_created_at (created_at),
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='커뮤니티 게시글';

-- ------------------------------------------------------------
-- 11. post_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_likes (
    post_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,

    PRIMARY KEY (post_id, user_id),
    INDEX idx_pl_user_id (user_id),
    CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 좋아요';

-- ------------------------------------------------------------
-- 12. comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id         VARCHAR(50) NOT NULL,
    post_id    VARCHAR(50) NOT NULL,
    parent_id  VARCHAR(50) NULL     COMMENT 'NULL = 최상위 댓글, 값 있으면 대댓글',
    content    TEXT        NOT NULL,
    author_id  VARCHAR(50) NOT NULL,
    like_count INT         NOT NULL DEFAULT 0,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_cmt_post_id   (post_id),
    INDEX idx_cmt_parent_id (parent_id),
    INDEX idx_cmt_author_id (author_id),
    CONSTRAINT fk_cmt_post   FOREIGN KEY (post_id)   REFERENCES posts    (id) ON DELETE CASCADE,
    CONSTRAINT fk_cmt_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
    CONSTRAINT fk_cmt_author FOREIGN KEY (author_id) REFERENCES users    (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='커뮤니티 댓글 (대댓글 지원)';

-- ------------------------------------------------------------
-- 13. comment_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id VARCHAR(50) NOT NULL,
    user_id    VARCHAR(50) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (comment_id, user_id),
    INDEX idx_col_user_id (user_id),
    CONSTRAINT fk_col_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    CONSTRAINT fk_col_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='댓글 좋아요';

-- ------------------------------------------------------------
-- 14. club_posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_posts (
    id            VARCHAR(50)  NOT NULL,
    club_id       VARCHAR(50)  NOT NULL,
    category      VARCHAR(30)  NULL     COMMENT '공지|자유|질문',
    title         VARCHAR(200) NOT NULL,
    content       TEXT         NOT NULL,
    image         VARCHAR(500) NULL     COMMENT '첨부 이미지 URL',
    author_id     VARCHAR(50)  NOT NULL,
    like_count    INT          NOT NULL DEFAULT 0,
    comment_count INT          NOT NULL DEFAULT 0,
    view_count    INT          NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_cp_club_id   (club_id),
    INDEX idx_cp_author_id (author_id),
    CONSTRAINT fk_cp_club   FOREIGN KEY (club_id)   REFERENCES clubs (id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_author FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='클럽 내부 게시글';

-- ------------------------------------------------------------
-- 15. club_post_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_post_likes (
    club_post_id VARCHAR(50) NOT NULL,
    user_id      VARCHAR(50) NOT NULL,
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (club_post_id, user_id),
    INDEX idx_cpl_user_id (user_id),
    CONSTRAINT fk_cpl_club_post FOREIGN KEY (club_post_id) REFERENCES club_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cpl_user      FOREIGN KEY (user_id)      REFERENCES users      (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='클럽 게시글 좋아요';

-- ------------------------------------------------------------
-- 16. follows
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    follower_id  VARCHAR(50) NOT NULL COMMENT '팔로우 거는 사람',
    following_id VARCHAR(50) NOT NULL COMMENT '팔로우 당하는 사람',
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_follows (follower_id, following_id),
    INDEX idx_follows_following_id (following_id),
    CONSTRAINT fk_follows_follower  FOREIGN KEY (follower_id)  REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='유저 팔로우 관계';

-- ------------------------------------------------------------
-- 17. notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id         VARCHAR(50)  NOT NULL,
    user_id    VARCHAR(50)  NOT NULL COMMENT '수신자',
    type       VARCHAR(20)  NULL     COMMENT 'like | comment | club',
    icon       VARCHAR(10)  NULL,
    title      VARCHAR(100) NULL,
    body       VARCHAR(200) NULL,
    path       VARCHAR(200) NULL     COMMENT '클릭 시 이동 경로',
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_notif_user_id    (user_id),
    INDEX idx_notif_created_at (created_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='알림';

-- ============================================================
-- 개인정보 보호 관련 테이블
-- ============================================================

-- ------------------------------------------------------------
-- 18. user_pii  (개인정보 암호화 저장)
-- ------------------------------------------------------------
-- 설계 원칙:
--   · users 테이블과 1:1 관계 — 민감 필드를 물리적으로 분리
--   · 모든 값은 AES-256-GCM 으로 애플리케이션 레이어에서 암호화 후 저장
--   · handle_hash: 로그인 lookup 용 SHA-256 단방향 해시 (복원 불가)
--   · 암호화 키는 DB에 저장하지 않음 (HSM 또는 환경변수 관리)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_pii (
    user_id           VARCHAR(50) NOT NULL COMMENT 'FK → users.id',

    -- 시온 고유번호 — 양방향 암호화(AES-256-GCM) + Base64 인코딩
    handle_hash       VARCHAR(64) NOT NULL COMMENT 'SHA-256(handle) — 로그인 lookup용, 복원 불가',
    handle_enc        TEXT        NOT NULL COMMENT '양방향 암호화(AES-256-GCM)된 고유번호, Base64 저장',

    -- 시온 API 수신 실명·전화번호 암호화
    real_name_enc     TEXT        NULL     COMMENT 'AES-256-GCM 암호화된 실명',
    phone_hash        VARCHAR(64) NULL     COMMENT 'SHA-256(phone_number) — 중복 가입 방지 lookup',
    phone_enc         TEXT        NULL     COMMENT 'AES-256-GCM 암호화된 전화번호',

    -- 프로필 부가 정보 암호화
    bio_enc           TEXT        NULL     COMMENT 'AES-256-GCM 암호화된 bio',
    profile_image_enc TEXT        NULL     COMMENT 'AES-256-GCM 암호화된 profile_image URL',

    -- 암호화 메타
    enc_version       VARCHAR(10) NOT NULL DEFAULT 'v1' COMMENT '암호화 알고리즘 버전 (키 로테이션 추적)',
    encrypted_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    re_encrypted_at   DATETIME    NULL     COMMENT '키 로테이션 후 재암호화 시각',

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_pii_handle_hash (handle_hash),
    UNIQUE KEY uq_pii_phone_hash  (phone_hash),
    CONSTRAINT fk_pii_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='개인정보 암호화 저장 (AES-256-GCM)';

-- ------------------------------------------------------------
-- 19. refresh_token_pii  (토큰의 개인정보 암호화 저장)
-- ------------------------------------------------------------
-- refresh_tokens 의 ip_address, device_info 를 분리 암호화
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_token_pii (
    token_id         BIGINT NOT NULL COMMENT 'FK → refresh_tokens.id',

    ip_address_enc   TEXT   NULL     COMMENT 'AES-256-GCM 암호화된 IP 주소',
    device_info_enc  TEXT   NULL     COMMENT 'AES-256-GCM 암호화된 디바이스 정보',
    enc_version      VARCHAR(10) NOT NULL DEFAULT 'v1',

    PRIMARY KEY (token_id),
    CONSTRAINT fk_rt_pii_token FOREIGN KEY (token_id) REFERENCES refresh_tokens (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Refresh Token 개인정보 암호화 저장';

-- ------------------------------------------------------------
-- 20. pii_access_logs  (개인정보 조회 이력)
-- ------------------------------------------------------------
-- 설계 원칙:
--   · 개인정보 보호법 제29조 — 처리 기록 보관 의무
--   · ADMIN 조회는 purpose(사유) 필수
--   · 이 테이블 자체는 삭제/수정 금지 (INSERT ONLY)
--   · 보관 기간: 최소 3년 (법적 의무 기간 준수)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pii_access_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT,

    -- 조회 주체
    accessor_id     VARCHAR(50)  NULL     COMMENT '조회자 users.id (SYSTEM 배치는 NULL)',
    accessor_type   VARCHAR(10)  NOT NULL COMMENT 'USER | ADMIN | SYSTEM',

    -- 조회 대상
    target_user_id  VARCHAR(50)  NOT NULL COMMENT '조회된 정보의 소유자 users.id',
    fields_accessed VARCHAR(500) NOT NULL COMMENT '조회된 컬럼명 목록 (쉼표 구분, 예: handle,bio)',

    -- 조회 맥락
    purpose         VARCHAR(500) NULL     COMMENT '조회 사유 (ADMIN·SYSTEM은 필수)',
    access_result   VARCHAR(10)  NOT NULL DEFAULT 'SUCCESS' COMMENT 'SUCCESS | DENIED',

    -- 접속 환경 (평문 저장 — 로그 특성상 조회 가능해야 함)
    accessor_ip     VARCHAR(45)  NULL     COMMENT '조회자 IP',
    user_agent      VARCHAR(500) NULL     COMMENT '브라우저/클라이언트 정보',

    accessed_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_pal_accessor_id    (accessor_id),
    INDEX idx_pal_target_user_id (target_user_id),
    INDEX idx_pal_accessed_at    (accessed_at),
    -- target_user_id 에는 의도적으로 ON DELETE 제약 없음 (탈퇴 후에도 로그 보존)
    CONSTRAINT fk_pal_accessor FOREIGN KEY (accessor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='개인정보 조회 이력 (INSERT ONLY — 수정·삭제 금지)';

-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;
