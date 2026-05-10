-- ============================================================
-- LINKIT Database Schema (SQLite 호환)
-- 작성일: 2026-05-07
-- 대상 DB: SQLite 3.x
-- 실행 방법:
--   sqlite3 linkit.db < schema_sqlite.sql
-- ============================================================

PRAGMA foreign_keys = OFF;

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  TEXT    NOT NULL,
    handle              TEXT    NOT NULL,
    provider            TEXT    NOT NULL DEFAULT 'ZION',
    real_name           TEXT    NULL,
    phone_number        TEXT    NULL,
    nickname            TEXT    NULL,
    bio                 TEXT    NULL,
    profile_image       TEXT    NULL,
    role                TEXT    NOT NULL DEFAULT 'USER',
    status              TEXT    NOT NULL DEFAULT 'ONBOARDING',
    marketing_opted_in  INTEGER NOT NULL DEFAULT 0,
    last_login_at       TEXT    NULL,
    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_handle ON users (handle);

-- updated_at 자동 갱신 트리거 (MySQL의 ON UPDATE CURRENT_TIMESTAMP 대체)
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ------------------------------------------------------------
-- 2. refresh_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT    NOT NULL,
    token_hash  TEXT    NOT NULL,
    device_info TEXT    NULL,
    ip_address  TEXT    NULL,
    issued_at   TEXT    NOT NULL,
    expires_at  TEXT    NOT NULL,
    revoked_at  TEXT    NULL,

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rt_token_hash  ON refresh_tokens (token_hash);
CREATE        INDEX IF NOT EXISTS idx_rt_user_id    ON refresh_tokens (user_id);
CREATE        INDEX IF NOT EXISTS idx_rt_expires_at ON refresh_tokens (expires_at);

-- ------------------------------------------------------------
-- 3. clubs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clubs (
    id            TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    emoji         TEXT    NULL,
    cover_image   TEXT    NULL,
    category      TEXT    NULL,
    description   TEXT    NULL,
    member_count  INTEGER NOT NULL DEFAULT 0,
    new_count     INTEGER NOT NULL DEFAULT 0,
    is_private    INTEGER NOT NULL DEFAULT 0,
    join_question TEXT    NULL,
    schedule      TEXT    NULL,
    location      TEXT    NULL,
    status        TEXT    NOT NULL DEFAULT 'PENDING',
    created_by    TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_clubs_category   ON clubs (category);
CREATE INDEX IF NOT EXISTS idx_clubs_status     ON clubs (status);
CREATE INDEX IF NOT EXISTS idx_clubs_created_by ON clubs (created_by);

-- ------------------------------------------------------------
-- 4. club_tags
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_tags (
    club_id TEXT NOT NULL,
    tag     TEXT NOT NULL,

    FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_club_tags_club_id ON club_tags (club_id);

-- ------------------------------------------------------------
-- 5. club_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_members (
    club_id   TEXT NOT NULL,
    user_id   TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'MEMBER',
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (club_id, user_id),
    FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cm_user_id ON club_members (user_id);

-- ------------------------------------------------------------
-- 6. club_bookmarks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_bookmarks (
    user_id    TEXT NOT NULL,
    club_id    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (user_id, club_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cb_club_id ON club_bookmarks (club_id);

-- ------------------------------------------------------------
-- 7. club_join_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_join_requests (
    id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    club_id      TEXT    NOT NULL,
    user_id      TEXT    NOT NULL,
    message      TEXT    NULL,
    status       TEXT    NOT NULL DEFAULT 'PENDING',
    processed_at TEXT    NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cjr_club_id ON club_join_requests (club_id);
CREATE INDEX IF NOT EXISTS idx_cjr_user_id ON club_join_requests (user_id);

-- ------------------------------------------------------------
-- 8. schedules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
    id           TEXT NOT NULL,
    club_id      TEXT NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT NULL,
    scheduled_at TEXT NOT NULL,
    location     TEXT NULL,
    created_by   TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id),
    FOREIGN KEY (club_id)    REFERENCES clubs (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_sch_club_id      ON schedules (club_id);
CREATE INDEX IF NOT EXISTS idx_sch_scheduled_at ON schedules (scheduled_at);

-- ------------------------------------------------------------
-- 9. schedule_attendees
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_attendees (
    schedule_id TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (schedule_id, user_id),
    FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users    (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sa_user_id ON schedule_attendees (user_id);

-- ------------------------------------------------------------
-- 10. posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id            TEXT    NOT NULL,
    category      TEXT    NULL,
    title         TEXT    NOT NULL,
    content       TEXT    NOT NULL,
    image         TEXT    NULL,
    location      TEXT    NULL,
    author_id     TEXT    NOT NULL,
    like_count    INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    view_count    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id),
    FOREIGN KEY (author_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id  ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category   ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at);

-- ------------------------------------------------------------
-- 11. post_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pl_user_id ON post_likes (user_id);

-- ------------------------------------------------------------
-- 12. comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id         TEXT    NOT NULL,
    post_id    TEXT    NOT NULL,
    parent_id  TEXT    NULL,
    content    TEXT    NOT NULL,
    author_id  TEXT    NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id),
    FOREIGN KEY (post_id)   REFERENCES posts    (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users    (id)
);

CREATE INDEX IF NOT EXISTS idx_cmt_post_id   ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_cmt_parent_id ON comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_cmt_author_id ON comments (author_id);

-- ------------------------------------------------------------
-- 13. comment_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_col_user_id ON comment_likes (user_id);

-- ------------------------------------------------------------
-- 14. club_posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_posts (
    id            TEXT    NOT NULL,
    club_id       TEXT    NOT NULL,
    category      TEXT    NULL,
    title         TEXT    NOT NULL,
    content       TEXT    NOT NULL,
    image         TEXT    NULL,
    author_id     TEXT    NOT NULL,
    like_count    INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    view_count    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id),
    FOREIGN KEY (club_id)   REFERENCES clubs (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_cp_club_id   ON club_posts (club_id);
CREATE INDEX IF NOT EXISTS idx_cp_author_id ON club_posts (author_id);

-- ------------------------------------------------------------
-- 15. club_post_likes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_post_likes (
    club_post_id TEXT NOT NULL,
    user_id      TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (club_post_id, user_id),
    FOREIGN KEY (club_post_id) REFERENCES club_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)      REFERENCES users      (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cpl_user_id ON club_post_likes (user_id);

-- ------------------------------------------------------------
-- 16. follows
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
    id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    follower_id  TEXT    NOT NULL,
    following_id TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (follower_id)  REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_follows              ON follows (follower_id, following_id);
CREATE        INDEX IF NOT EXISTS idx_follows_following_id ON follows (following_id);

-- ------------------------------------------------------------
-- 17. notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT    NOT NULL,
    user_id    TEXT    NOT NULL,
    type       TEXT    NULL,
    icon       TEXT    NULL,
    title      TEXT    NULL,
    body       TEXT    NULL,
    path       TEXT    NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_user_id    ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notif_created_at ON notifications (created_at);

-- ============================================================
-- 개인정보 보호 관련 테이블
-- ============================================================

-- ------------------------------------------------------------
-- 18. user_pii  (개인정보 암호화 저장)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_pii (
    user_id           TEXT    NOT NULL,
    handle_hash       TEXT    NOT NULL,   -- SHA-256(handle), 로그인 lookup
    handle_enc        TEXT    NOT NULL,   -- 양방향 암호화(AES-256-GCM) + Base64
    real_name_enc     TEXT    NULL,
    phone_hash        TEXT    NULL,       -- SHA-256(phone_number), 중복 가입 방지
    phone_enc         TEXT    NULL,
    bio_enc           TEXT    NULL,
    profile_image_enc TEXT    NULL,
    enc_version       TEXT    NOT NULL DEFAULT 'v1',
    encrypted_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    re_encrypted_at   TEXT    NULL,

    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pii_handle_hash ON user_pii (handle_hash);
CREATE UNIQUE INDEX IF NOT EXISTS uq_pii_phone_hash  ON user_pii (phone_hash);

-- ------------------------------------------------------------
-- 19. refresh_token_pii  (토큰 개인정보 암호화 저장)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_token_pii (
    token_id        INTEGER NOT NULL,
    ip_address_enc  TEXT    NULL,
    device_info_enc TEXT    NULL,
    enc_version     TEXT    NOT NULL DEFAULT 'v1',

    PRIMARY KEY (token_id),
    FOREIGN KEY (token_id) REFERENCES refresh_tokens (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 20. pii_access_logs  (개인정보 조회 이력)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pii_access_logs (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    accessor_id     TEXT    NULL,
    accessor_type   TEXT    NOT NULL,
    target_user_id  TEXT    NOT NULL,
    fields_accessed TEXT    NOT NULL,
    purpose         TEXT    NULL,
    access_result   TEXT    NOT NULL DEFAULT 'SUCCESS',
    accessor_ip     TEXT    NULL,
    user_agent      TEXT    NULL,
    accessed_at     TEXT    NOT NULL DEFAULT (datetime('now')),

    -- accessor 탈퇴 후에도 로그 보존 → ON DELETE SET NULL
    FOREIGN KEY (accessor_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pal_accessor_id    ON pii_access_logs (accessor_id);
CREATE INDEX IF NOT EXISTS idx_pal_target_user_id ON pii_access_logs (target_user_id);
CREATE INDEX IF NOT EXISTS idx_pal_accessed_at    ON pii_access_logs (accessed_at);

-- ============================================================
-- 신고 관련 테이블
-- ============================================================

-- ------------------------------------------------------------
-- 21. reports  (신고)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    reporter_id   TEXT    NOT NULL,   -- 신고자 (탈퇴 시 NULL 유지 → SET NULL)
    target_type   TEXT    NOT NULL,   -- 'USER' | 'POST' | 'COMMENT' | 'CLUB' | 'CLUB_POST'
    target_id     TEXT    NOT NULL,   -- 신고 대상 엔티티의 ID
    reason        TEXT    NOT NULL,   -- 'SPAM' | 'ABUSE' | 'ILLEGAL' | 'PORNOGRAPHY' | 'OTHER'
    detail        TEXT    NULL,       -- 사용자 입력 상세 내용 (선택)
    status        TEXT    NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'RESOLVED' | 'DISMISSED'
    resolved_by   TEXT    NULL,       -- 처리 관리자 user_id
    resolved_at   TEXT    NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),

    -- 신고자 탈퇴 후에도 신고 이력 보존
    FOREIGN KEY (reporter_id)  REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by)  REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rpt_reporter_id ON reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_rpt_target      ON reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_rpt_status      ON reports (status);
CREATE INDEX IF NOT EXISTS idx_rpt_created_at  ON reports (created_at);

-- 동일 신고자가 같은 대상을 중복 신고하지 못하도록
CREATE UNIQUE INDEX IF NOT EXISTS uq_rpt_reporter_target
    ON reports (reporter_id, target_type, target_id);

-- ------------------------------------------------------------
PRAGMA foreign_keys = ON;
