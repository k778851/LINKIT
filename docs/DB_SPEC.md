# LINKIT DB 설계 명세서

> 작성일: 2026-05-07  
> 최종 수정: 2026-05-08  
> 버전: v1.3  
> 대상 DB: **SQLite 3.x** (개발·운영 공용). 단위 테스트는 H2 in-memory 사용  
> 인증 방식: 외부 시온(Zion) API 연동 — LINKIT은 비밀번호를 저장하지 않음  
> ID 전략: 기존 엔티티 VARCHAR(50) UUID / 신규 엔티티 BIGINT AUTO_INCREMENT  
> 개인정보 보호: AES-256-GCM 암호화 + 별도 PII 테이블 + 조회 이력 로깅

---

## 목차

1. [테이블 목록](#1-테이블-목록)
2. [개인정보 보호 정책](#2-개인정보-보호-정책)
3. [테이블별 컬럼 명세](#3-테이블별-컬럼-명세)
4. [테이블 관계 다이어그램](#4-테이블-관계-다이어그램)
5. [인덱스 목록](#5-인덱스-목록)
6. [설계 결정 사항](#6-설계-결정-사항)

---

## 1. 테이블 목록

| # | 테이블명 | 한글명 | 분류 | PK 타입 |
|---|---|---|---|---|
| 1 | `users` | 서비스 사용자 | 기본 | VARCHAR(50) UUID |
| 2 | `refresh_tokens` | JWT Refresh Token | 기본 | BIGINT AUTO_INC |
| 3 | `clubs` | 동네 소모임 클럽 | 기본 | VARCHAR(50) UUID |
| 4 | `club_tags` | 클럽 태그 | 기본 | 복합(club_id, tag) |
| 5 | `club_members` | 클럽 멤버십 | 기본 | 복합(club_id, user_id) |
| 6 | `club_bookmarks` | 클럽 찜 | 기본 | 복합(user_id, club_id) |
| 7 | `club_join_requests` | 클럽 가입 신청 | 기본 | BIGINT AUTO_INC |
| 8 | `schedules` | 클럽 모임 일정 | 기본 | VARCHAR(50) UUID |
| 9 | `schedule_attendees` | 일정 참여 신청 | 기본 | 복합(schedule_id, user_id) |
| 10 | `posts` | 커뮤니티 게시글 | 기본 | VARCHAR(50) UUID |
| 11 | `post_likes` | 게시글 좋아요 | 기본 | 복합(post_id, user_id) |
| 12 | `comments` | 댓글 (대댓글 포함) | 기본 | VARCHAR(50) UUID |
| 13 | `comment_likes` | 댓글 좋아요 | 기본 | 복합(comment_id, user_id) |
| 14 | `club_posts` | 클럽 게시글 | 기본 | VARCHAR(50) UUID |
| 15 | `club_post_likes` | 클럽 게시글 좋아요 | 기본 | 복합(club_post_id, user_id) |
| 16 | `follows` | 팔로우 관계 | 기본 | BIGINT AUTO_INC |
| 17 | `notifications` | 알림 | 기본 | VARCHAR(50) UUID |
| 18 | `user_pii` | 유저 개인정보 암호화 저장 | ⚠️ 개인정보 | VARCHAR(50) 공유PK |
| 19 | `refresh_token_pii` | 토큰 접속 정보 암호화 저장 | ⚠️ 개인정보 | BIGINT 공유PK |
| 20 | `pii_access_logs` | 개인정보 조회 이력 로그 | ⚠️ 개인정보 | BIGINT AUTO_INC |
| 21 | `reports` | 신고 | 운영/안전 | BIGINT AUTO_INC |

---

## 2. 개인정보 보호 정책

### 2.1 개인정보 항목 분류 및 처리 방식

| 등급 | 항목 | 저장 방식 | 출처 | 화면 표시 |
|---|---|---|---|---|
| 🔴 필수 암호화 | 시온 고유번호 (`handle`) | `users.handle` 평문 + `user_pii.handle_enc` 양방향 암호화 | 시온 API | `202400**-*****` |
| 🔴 필수 암호화 | 실명 (`real_name`) | `users.real_name` 평문 + `user_pii.real_name_enc` 암호화 | 시온 API | `홍*동` |
| 🔴 필수 암호화 | 전화번호 (`phone_number`) | `users.phone_number` 평문 + `user_pii.phone_enc` 암호화 | 시온 API | `010-****-5678` |
| 🔴 필수 암호화 | 한 줄 소개 (`bio`) | `users.bio` 평문 + `user_pii.bio_enc` 암호화 | 사용자 입력 | `서울 사는...` |
| 🔴 필수 암호화 | 프로필 이미지 URL | `users.profile_image` 평문 + `user_pii.profile_image_enc` 암호화 | 사용자 업로드 | 그대로 노출 |
| 🔴 필수 암호화 | 접속 IP | `refresh_tokens.ip_address` 평문 + `refresh_token_pii.ip_address_enc` 암호화 | 시스템 수집 | `192.168.*.*` |
| 🔴 필수 암호화 | 디바이스 정보 | `refresh_tokens.device_info` 평문 + `refresh_token_pii.device_info_enc` 암호화 | 시스템 수집 | `iPhone 15 / ***` |
| 🟡 준식별자 | 닉네임 | `users.nickname` 평문 저장 | 사용자 입력 | `러**` |

> **🔴 필수 암호화**: 양방향 암호화(AES-256-GCM) + Base64 저장. 복호화 가능  
> **🟡 준식별자**: 단독 식별 어려우나 결합 시 식별 가능

> **🔴 필수 암호화**: 단독 또는 결합으로 개인 식별 가능 — DB 유출 시 직접 피해 발생  
> **🟡 준식별자**: 단독 식별은 어렵지만 다른 정보와 결합 시 식별 가능

**이중 저장 전략**: 원본 테이블(`users`, `refresh_tokens`)에는 서비스 운영에 필요한 평문을 보관하고, PII 테이블(`user_pii`, `refresh_token_pii`)에는 동일 정보를 암호화하여 별도 보관합니다. 일반 쿼리와 민감 정보 접근을 물리적으로 분리하고 감사 모니터링 범위를 최소화합니다.

---

### 2.2 암호화 정책

| 항목 | 내용 |
|---|---|
| 알고리즘 | AES-256-GCM (양방향 암호화 — 복호화 가능) |
| 저장 형식 | AES-256-GCM 암호화 후 **Base64 인코딩** 저장 (개발 착수 보고서: "Base64로 양방향 암호화 저장") |
| 전송 암호화 | **TLS 1.3** (개발 착수 보고서 4조 명시) |
| 암호화 위치 | 애플리케이션 레이어 — DB에는 암호화된 값만 저장 |
| 키 관리 | DB 저장 금지. 환경변수(`APPLICATION_ENC_KEY`) 또는 HSM 관리 |
| IV/Nonce | 암호화마다 랜덤 생성 (96-bit). 암호화 결과값에 포함하여 Base64로 저장 |
| 로그인 Lookup | 동일 원문도 암호화마다 결과가 달라 WHERE 조건 불가 → `handle_hash`(SHA-256 단방향 해시)를 별도 저장하여 O(1) 조회 |
| 암호화 대상 | 고유번호(`handle`) — 보고서 명시 항목. bio·profile_image는 추가 적용 |
| 키 로테이션 | `enc_version` 컬럼으로 버전 추적. 구버전 암호화 행 식별 후 순차 재암호화. `re_encrypted_at` 갱신 |

---

### 2.3 화면 마스킹 규칙

> 마스킹은 DB에 저장하지 않고 **응답 DTO 레이어**에서 처리합니다.

| 항목 | 원문 예시 | 마스킹 결과 | 규칙 | 근거 |
|---|---|---|---|---|
| 고유번호 (handle) | `20240001-00099` | `202400**-*****` | 앞 6자리 노출, 나머지 `*` | 보고서 명시 |
| 실명 (real_name) | `홍길동` | `홍*동` | 첫·마지막 글자 노출, 중간 `*` | 보고서 명시 |
| 전화번호 (phone_number) | `010-1234-5678` | `010-****-5678` | 앞 3자리·뒤 4자리 노출, 중간 마스킹 | 보고서 명시 |
| 닉네임 | `러닝장` | `러**` | 첫 글자만 노출 | 준식별자 보호 |
| 한 줄 소개 | `서울 사는 개발자입니다` | `서울 사는...` | 앞 5자 노출 후 `...` | 준식별자 보호 |
| IP 주소 | `192.168.1.100` | `192.168.*.*` | 앞 두 옥텟 노출 | 침해사고 대응 최소 노출 |
| 디바이스 정보 | `iPhone 15 / iOS 17` | `iPhone 15 / ***` | 기기명만 노출 | 준식별자 보호 |

---

### 2.4 개인정보 조회 이력 로그 (`pii_access_logs`) 정책

개인정보 보호법 제29조(안전조치 의무)에 따라 개인정보 조회 시 이력을 기록합니다.

| 조회 주체 | `accessor_type` | `purpose` | 기록 시점 |
|---|---|---|---|
| 정보 주체 본인 | `USER` | 선택 | 본인 PII 복호화 요청 시 |
| 관리자 | `ADMIN` | **필수** (미입력 시 요청 차단) | 관리 콘솔에서 개인정보 조회 시 |
| 시스템/배치 | `SYSTEM` | **필수** (자동화 작업명 기록) | 내부 배치 작업이 PII 접근 시 |

**운영 원칙**

| 항목 | 내용 |
|---|---|
| 쓰기 정책 | **INSERT ONLY** — UPDATE·DELETE 금지. 애플리케이션 레이어에서 통제 |
| 보관 기간 | **1년** (개발 착수 보고서 4조: "시스템 접속 로그 1년 보관") |
| 조회자 탈퇴 처리 | `accessor_id` ON DELETE SET NULL — 조회자 탈퇴 후에도 이력 영구 보존 |
| `accessor_ip` 저장 방식 | 침해사고 대응 목적으로 **평문 저장** (조사 시 즉시 확인 필요) |
| `access_result` 값 | `SUCCESS` \| `FAILURE` \| `PARTIAL` (일부 복호화 실패) |

---

## 3. 테이블별 컬럼 명세

---

### 3.1 `users` — 서비스 사용자

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `user-{UUID 8자리}` |
| `handle` | VARCHAR(20) | NO | — | 시온 고유번호 (형식: `00000000-00000`). UNIQUE. 암호화 사본 → `user_pii.handle_enc` |
| `provider` | VARCHAR(20) | NO | `'ZION'` | 외부 인증 제공자 식별자 |
| `real_name` | VARCHAR(20) | YES | NULL | 시온 API 수신 실명. 로그인 시 갱신. 암호화 사본 → `user_pii.real_name_enc` |
| `phone_number` | VARCHAR(20) | YES | NULL | 시온 API 수신 전화번호. 로그인 시 갱신. 암호화 사본 → `user_pii.phone_enc` |
| `nickname` | VARCHAR(20) | YES | NULL | LINKIT 닉네임. 온보딩 완료 전 NULL. 준식별자 → 화면 마스킹 적용 |
| `bio` | TEXT | YES | NULL | 한 줄 자기소개. 암호화 사본 → `user_pii.bio_enc` |
| `profile_image` | VARCHAR(500) | YES | NULL | 프로필 이미지 URL. 암호화 사본 → `user_pii.profile_image_enc` |
| `role` | VARCHAR(10) | NO | `'USER'` | `USER` \| `ADMIN` |
| `status` | VARCHAR(15) | NO | `'ONBOARDING'` | `ONBOARDING` \| `ACTIVE` \| `SUSPENDED` |
| `marketing_opted_in` | BOOLEAN | NO | `false` | 마케팅 수신 동의 여부 (온보딩 시 설정) |
| `last_login_at` | DATETIME | YES | NULL | 마지막 로그인 시각 (로그인마다 갱신) |
| `created_at` | DATETIME | NO | `NOW()` | 최초 가입(시온 인증 성공) 일시 |
| `updated_at` | DATETIME | NO | `NOW()` | 프로필 수정 시 자동 갱신 |

**상태 전이**: `ONBOARDING` → (닉네임 설정 완료) → `ACTIVE` → (관리자 제재) → `SUSPENDED`

---

### 3.2 `refresh_tokens` — JWT Refresh Token

> Access Token(JWT, 1시간)은 Stateless 검증. Refresh Token(30일)만 DB 저장하여 강제 로그아웃(revoke)을 지원합니다.

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | BIGINT | NO | AUTO_INC | PK |
| `user_id` | VARCHAR(50) | NO | — | FK → `users.id` ON DELETE CASCADE |
| `token_hash` | VARCHAR(64) | NO | — | SHA-256 해시 (원본 토큰 미저장). UNIQUE |
| `device_info` | VARCHAR(200) | YES | NULL | 디바이스 정보 (예: `iPhone 15 / iOS 17`). 암호화 사본 → `refresh_token_pii.device_info_enc` |
| `ip_address` | VARCHAR(45) | YES | NULL | 접속 IP (IPv4/IPv6 지원). 암호화 사본 → `refresh_token_pii.ip_address_enc` |
| `issued_at` | DATETIME | NO | — | 토큰 발급 일시 |
| `expires_at` | DATETIME | NO | — | 만료 일시 (발급 후 30일) |
| `revoked_at` | DATETIME | YES | NULL | 로그아웃 처리 일시. NULL이면 유효한 토큰 |

> 유효성 판단: `revoked_at IS NULL AND expires_at > NOW()`

---

### 3.3 `clubs` — 동네 소모임 클럽

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `club-{UUID 8자리}` |
| `name` | VARCHAR(100) | NO | — | 클럽명 |
| `emoji` | VARCHAR(10) | YES | NULL | 클럽 대표 이모지. 커버 이미지 미설정 시 UI fallback |
| `cover_image` | VARCHAR(500) | YES | NULL | 커버 이미지 URL |
| `category` | VARCHAR(30) | YES | NULL | `운동` \| `음식` \| `아트` \| `스터디` \| `음악` \| `기타` |
| `description` | TEXT | YES | NULL | 클럽 소개 |
| `member_count` | INT | NO | `0` | 현재 멤버 수 (denormalized, 정합성은 서비스 레이어 관리) |
| `new_count` | INT | NO | `0` | 신규 멤버 수 (UI 표시용 카운터) |
| `is_private` | BOOLEAN | NO | `false` | 비공개 클럽 여부. `true`이면 가입 신청 → 승인 플로우 적용 |
| `join_question` | TEXT | YES | NULL | 가입 신청 질문. 비공개 클럽 전용 |
| `schedule` | VARCHAR(100) | YES | NULL | 정기 모임 일정 텍스트 (예: `매주 금요일 20:00`) |
| `location` | VARCHAR(100) | YES | NULL | 주요 활동 지역 |
| `status` | VARCHAR(10) | NO | `'PENDING'` | `DRAFT` \| `PENDING` \| `ACTIVE` \| `CLOSED` |
| `created_by` | VARCHAR(50) | NO | — | FK → `users.id`. 클럽 개설자 |
| `created_at` | DATETIME | NO | `NOW()` | 개설 일시 |

---

### 3.4 `club_tags` — 클럽 태그

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `club_id` | VARCHAR(50) | NO | — | FK → `clubs.id` ON DELETE CASCADE |
| `tag` | VARCHAR(50) | NO | — | 태그 값 (예: `#러닝`, `#주말`) |

> 복합 인덱스 대신 `club_id` 단일 인덱스 적용 (태그는 클럽 단위로만 조회)

---

### 3.5 `club_members` — 클럽 멤버십

> `@ElementCollection`(단순 ID 목록) 대체. 역할(role)·가입일(joined_at) 저장 및 FK 무결성 보장을 위해 독립 테이블로 승격.

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `club_id` | VARCHAR(50) | NO | — | PK (복합), FK → `clubs.id` ON DELETE CASCADE |
| `user_id` | VARCHAR(50) | NO | — | PK (복합), FK → `users.id` ON DELETE CASCADE |
| `role` | VARCHAR(10) | NO | `'MEMBER'` | `OWNER` \| `ADMIN` \| `MEMBER` |
| `joined_at` | DATETIME | NO | `NOW()` | 가입 일시 |

---

### 3.6 `club_bookmarks` — 클럽 찜

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `user_id` | VARCHAR(50) | NO | — | PK (복합), FK → `users.id` ON DELETE CASCADE |
| `club_id` | VARCHAR(50) | NO | — | PK (복합), FK → `clubs.id` ON DELETE CASCADE |
| `created_at` | DATETIME | NO | `NOW()` | 찜 등록 일시 |

---

### 3.7 `club_join_requests` — 클럽 가입 신청

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | BIGINT | NO | AUTO_INC | PK |
| `club_id` | VARCHAR(50) | NO | — | FK → `clubs.id` ON DELETE CASCADE |
| `user_id` | VARCHAR(50) | NO | — | FK → `users.id` ON DELETE CASCADE |
| `message` | TEXT | YES | NULL | 가입 신청 메시지 (`join_question`에 대한 답변) |
| `status` | VARCHAR(10) | NO | `'PENDING'` | `PENDING` \| `APPROVED` \| `REJECTED` |
| `processed_at` | DATETIME | YES | NULL | 승인/거절 처리 일시 |
| `created_at` | DATETIME | NO | `NOW()` | 신청 일시 |

---

### 3.8 `schedules` — 클럽 모임 일정

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `sch-{UUID 8자리}` |
| `club_id` | VARCHAR(50) | NO | — | FK → `clubs.id` ON DELETE CASCADE |
| `title` | VARCHAR(100) | NO | — | 일정 제목 |
| `description` | TEXT | YES | NULL | 일정 상세 설명 |
| `scheduled_at` | DATETIME | NO | — | 모임 시작 일시 |
| `location` | VARCHAR(200) | YES | NULL | 모임 장소 |
| `created_by` | VARCHAR(50) | NO | — | FK → `users.id`. 일정 생성자 |
| `created_at` | DATETIME | NO | `NOW()` | 등록 일시 |

---

### 3.9 `schedule_attendees` — 일정 참여 신청

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `schedule_id` | VARCHAR(50) | NO | — | PK (복합), FK → `schedules.id` ON DELETE CASCADE |
| `user_id` | VARCHAR(50) | NO | — | PK (복합), FK → `users.id` ON DELETE CASCADE |
| `joined_at` | DATETIME | NO | `NOW()` | 참여 신청 일시 |

> **참여 자격**: 클럽 멤버(`club_members`)에 등록된 사용자만 참여 가능. DB 레벨 FK 대신 서비스 레이어에서 검증.  
> **정원 제한**: 없음 (정책상 `max_attendees` 미사용)

---

### 3.10 `posts` — 커뮤니티 게시글

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `post-{UUID 8자리}` |
| `category` | VARCHAR(30) | YES | NULL | `일상` \| `질문` \| `모임` \| `나눔` \| `생활정보` |
| `title` | VARCHAR(200) | NO | — | 게시글 제목 |
| `content` | TEXT | NO | — | 게시글 본문 |
| `image` | VARCHAR(500) | YES | NULL | 첨부 이미지 URL |
| `location` | VARCHAR(100) | YES | NULL | 위치 정보 |
| `author_id` | VARCHAR(50) | NO | — | FK → `users.id` |
| `like_count` | INT | NO | `0` | 좋아요 수 (denormalized) |
| `comment_count` | INT | NO | `0` | 댓글 수 (denormalized) |
| `view_count` | INT | NO | `0` | 조회 수 (denormalized) |
| `created_at` | DATETIME | NO | `NOW()` | 작성 일시 |

---

### 3.11 `post_likes` — 게시글 좋아요

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `post_id` | VARCHAR(50) | NO | — | PK (복합), FK → `posts.id` ON DELETE CASCADE |
| `user_id` | VARCHAR(50) | NO | — | PK (복합), FK → `users.id` ON DELETE CASCADE |

> 복합 PK로 중복 좋아요를 DB 레벨에서 방지

---

### 3.12 `comments` — 댓글 (대댓글 포함)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `cmt-{UUID 8자리}` |
| `post_id` | VARCHAR(50) | NO | — | FK → `posts.id` ON DELETE CASCADE |
| `parent_id` | VARCHAR(50) | YES | NULL | FK → `comments.id` ON DELETE CASCADE. NULL이면 최상위 댓글, 값이 있으면 대댓글 |
| `content` | TEXT | NO | — | 댓글 내용 |
| `author_id` | VARCHAR(50) | NO | — | FK → `users.id` |
| `like_count` | INT | NO | `0` | 좋아요 수 (denormalized) |
| `created_at` | DATETIME | NO | `NOW()` | 작성 일시 |

> `parent_id` 자기 참조로 단일 컬럼 무한 depth 대댓글 구현. 현재 UI는 1단계(댓글→대댓글)만 지원.

---

### 3.13 `comment_likes` — 댓글 좋아요

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `comment_id` | VARCHAR(50) | NO | — | PK (복합), FK → `comments.id` ON DELETE CASCADE |
| `user_id` | VARCHAR(50) | NO | — | PK (복합), FK → `users.id` ON DELETE CASCADE |
| `created_at` | DATETIME | NO | `NOW()` | 좋아요 등록 일시 |

---

### 3.14 `club_posts` — 클럽 게시글

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `cp-{UUID 8자리}` |
| `club_id` | VARCHAR(50) | NO | — | FK → `clubs.id` ON DELETE CASCADE |
| `category` | VARCHAR(30) | YES | NULL | `공지` \| `자유` \| `질문` |
| `title` | VARCHAR(200) | NO | — | 게시글 제목 |
| `content` | TEXT | NO | — | 게시글 본문 |
| `image` | VARCHAR(500) | YES | NULL | 첨부 이미지 URL |
| `author_id` | VARCHAR(50) | NO | — | FK → `users.id` |
| `like_count` | INT | NO | `0` | 좋아요 수 (denormalized) |
| `comment_count` | INT | NO | `0` | 댓글 수 (denormalized) |
| `view_count` | INT | NO | `0` | 조회 수 (denormalized) |
| `created_at` | DATETIME | NO | `NOW()` | 작성 일시 |

---

### 3.15 `club_post_likes` — 클럽 게시글 좋아요

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `club_post_id` | VARCHAR(50) | NO | — | PK (복합), FK → `club_posts.id` ON DELETE CASCADE |
| `user_id` | VARCHAR(50) | NO | — | PK (복합), FK → `users.id` ON DELETE CASCADE |
| `created_at` | DATETIME | NO | `NOW()` | 좋아요 등록 일시 |

---

### 3.16 `follows` — 팔로우 관계

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | BIGINT | NO | AUTO_INC | PK |
| `follower_id` | VARCHAR(50) | NO | — | FK → `users.id` ON DELETE CASCADE. 팔로우를 거는 사람 |
| `following_id` | VARCHAR(50) | NO | — | FK → `users.id` ON DELETE CASCADE. 팔로우를 받는 사람 |
| `created_at` | DATETIME | NO | `NOW()` | 팔로우 일시 |

> UNIQUE (`follower_id`, `following_id`) — 중복 팔로우 방지

---

### 3.17 `notifications` — 알림

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | VARCHAR(50) | NO | — | PK. 형식: `notif-{UUID 8자리}` |
| `user_id` | VARCHAR(50) | NO | — | FK → `users.id` ON DELETE CASCADE. 알림 수신자 |
| `type` | VARCHAR(20) | YES | NULL | `like` \| `comment` \| `follow` \| `club` |
| `icon` | VARCHAR(10) | YES | NULL | 알림 아이콘 (이모지) |
| `title` | VARCHAR(100) | YES | NULL | 알림 제목 |
| `body` | VARCHAR(200) | YES | NULL | 알림 본문 |
| `path` | VARCHAR(200) | YES | NULL | 알림 클릭 시 이동 경로 |
| `is_read` | BOOLEAN | NO | `false` | 읽음 여부 |
| `created_at` | DATETIME | NO | `NOW()` | 발송 일시 |

---

### 3.18 `user_pii` — 유저 개인정보 암호화 저장 ⚠️

> **INSERT ONLY** 원칙. 키 로테이션 시 `re_encrypted_at` 갱신.  
> `users` 테이블과 1:1 관계 (공유 PK).

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `user_id` | VARCHAR(50) | NO | — | PK, FK → `users.id` ON DELETE CASCADE |
| `handle_hash` | VARCHAR(64) | NO | — | SHA-256(handle) — 로그인 lookup용 단방향 해시. UNIQUE |
| `handle_enc` | TEXT | NO | — | 양방향 암호화(AES-256-GCM) + Base64 인코딩 |
| `real_name_enc` | TEXT | YES | NULL | AES-256-GCM 암호화된 실명 |
| `phone_hash` | VARCHAR(64) | YES | NULL | SHA-256(phone_number) — 중복 가입 방지 lookup용 단방향 해시. UNIQUE |
| `phone_enc` | TEXT | YES | NULL | AES-256-GCM 암호화된 전화번호 (Base64 인코딩) |
| `bio_enc` | TEXT | YES | NULL | AES-256-GCM 암호화된 자기소개 |
| `profile_image_enc` | TEXT | YES | NULL | AES-256-GCM 암호화된 프로필 이미지 URL |
| `enc_version` | VARCHAR(10) | NO | `'v1'` | 암호화 키 버전. 키 로테이션 추적용 |
| `encrypted_at` | DATETIME | NO | `NOW()` | 최초 암호화(레코드 생성) 일시 |
| `re_encrypted_at` | DATETIME | YES | NULL | 마지막 키 로테이션 후 재암호화 일시 |

**hash 컬럼 설계 근거**: AES-256-GCM은 랜덤 IV로 인해 동일 원문도 암호화마다 결과가 달라 WHERE 조회가 불가능합니다. `handle_hash`(로그인 lookup)와 `phone_hash`(중복 가입 방지)에 SHA-256 단방향 해시를 별도 저장하여 O(1) 조회를 지원하며, 해시 원문 복원이 불가능하므로 유출 시에도 안전합니다.

---

### 3.19 `refresh_token_pii` — 토큰 접속 정보 암호화 저장 ⚠️

> **INSERT ONLY** 원칙. `refresh_tokens` 테이블과 1:1 관계 (공유 PK).

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `token_id` | BIGINT | NO | — | PK, FK → `refresh_tokens.id` ON DELETE CASCADE |
| `ip_address_enc` | TEXT | YES | NULL | AES-256-GCM 암호화된 접속 IP (Base64 인코딩) |
| `device_info_enc` | TEXT | YES | NULL | AES-256-GCM 암호화된 디바이스 정보 (Base64 인코딩) |
| `enc_version` | VARCHAR(10) | NO | `'v1'` | 암호화 키 버전 |

---

### 3.20 `pii_access_logs` — 개인정보 조회 이력 로그 ⚠️

> **INSERT ONLY** — 수정·삭제 절대 금지.  
> 보관 기간: **1년** (개발 착수 보고서 4조: "시스템 접속 로그 1년 보관").

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | BIGINT | NO | AUTO_INC | PK |
| `accessor_id` | VARCHAR(50) | YES | NULL | 조회자 `users.id`. 탈퇴 시 NULL로 유지 (ON DELETE SET NULL). SYSTEM 배치는 NULL |
| `accessor_type` | VARCHAR(20) | NO | — | `USER` \| `ADMIN` \| `SYSTEM` |
| `target_user_id` | VARCHAR(50) | NO | — | 조회된 정보 소유자의 `users.id` (FK 제약 없음 — 탈퇴 후에도 로그 보존) |
| `fields_accessed` | TEXT | NO | — | 조회한 컬럼명 목록, 쉼표 구분. 예: `handle,bio,profile_image` |
| `purpose` | TEXT | YES | NULL | 조회 사유. `ADMIN`·`SYSTEM`은 필수, `USER`는 선택 |
| `access_result` | VARCHAR(20) | NO | `'SUCCESS'` | `SUCCESS` \| `FAILURE` \| `PARTIAL` |
| `accessor_ip` | VARCHAR(45) | YES | NULL | 조회자 IP 주소. **평문 저장** (침해사고 즉시 대응 목적) |
| `user_agent` | TEXT | YES | NULL | 브라우저 및 클라이언트 정보 |
| `accessed_at` | DATETIME | NO | `NOW()` | 조회 발생 일시 |

**기록 대상 시나리오 예시**

| 시나리오 | accessor_type | purpose 예시 |
|---|---|---|
| 내 프로필 상세 조회 | `USER` | (선택사항) |
| 관리자가 민원 처리를 위해 회원 조회 | `ADMIN` | `고객센터 문의 #1234 처리` |
| 신고 접수 후 피신고자 정보 확인 | `ADMIN` | `신고 ID #567 검토` |
| 탈퇴 회원 데이터 정리 배치 | `SYSTEM` | `scheduled_dormant_cleanup_20260508` |

---

### 3.21 `reports` — 신고

> 동일 신고자가 같은 대상을 중복 신고할 수 없습니다. (UNIQUE 제약)  
> 신고자 탈퇴 후에도 신고 이력은 보존됩니다. (`reporter_id` ON DELETE SET NULL)

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | BIGINT | NO | AUTO_INC | PK |
| `reporter_id` | VARCHAR(50) | YES | NULL | 신고자 `users.id`. 탈퇴 시 NULL 유지 (ON DELETE SET NULL) |
| `target_type` | VARCHAR(20) | NO | — | `USER` \| `POST` \| `COMMENT` \| `CLUB` \| `CLUB_POST` |
| `target_id` | VARCHAR(50) | NO | — | 신고 대상 엔티티의 ID |
| `reason` | VARCHAR(20) | NO | — | `SPAM` \| `ABUSE` \| `ILLEGAL` \| `PORNOGRAPHY` \| `OTHER` |
| `detail` | TEXT | YES | NULL | 사용자 입력 상세 내용 (선택 항목) |
| `status` | VARCHAR(20) | NO | `'PENDING'` | `PENDING` \| `RESOLVED` \| `DISMISSED` |
| `resolved_by` | VARCHAR(50) | YES | NULL | 처리 관리자 `users.id`. 탈퇴 시 NULL 유지 |
| `resolved_at` | DATETIME | YES | NULL | 처리 일시 |
| `created_at` | DATETIME | NO | `NOW()` | 신고 접수 일시 |

> UNIQUE (`reporter_id`, `target_type`, `target_id`) — 동일 대상 중복 신고 방지

---

## 4. 테이블 관계 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│  인증 / 사용자                                                     │
│                                                                   │
│  users ──────────────── user_pii           (1:1  PII 암호화)      │
│  users ──< refresh_tokens                  (1:N  로그인 세션)     │
│           └── refresh_token_pii            (1:1  접속 정보 암호화) │
│  users ──< pii_access_logs                 (1:N  조회 이력 로그)   │
│  users ──< notifications                   (1:N  알림)            │
│  users ──< follows >── users               (N:M  자기 참조)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  클럽                                                             │
│                                                                   │
│  users ──< clubs                           (1:N  created_by)     │
│  clubs ──< club_tags                       (1:N)                  │
│  clubs ──< club_members >── users          (N:M  role/joined_at) │
│  clubs ──< club_bookmarks >── users        (N:M)                  │
│  clubs ──< club_join_requests >── users    (N:M  승인 플로우)     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  일정                                                             │
│                                                                   │
│  clubs ──< schedules                       (1:N)                  │
│  schedules ──< schedule_attendees >── users (N:M  멤버만 가능)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  커뮤니티 게시판                                                   │
│                                                                   │
│  users ──< posts                           (1:N)                  │
│  posts ──< post_likes >── users            (N:M  복합 PK)         │
│  posts ──< comments                        (1:N)                  │
│  comments ─┐ (parent_id 자기 참조, 대댓글)                        │
│            └─< comments                                           │
│  comments ──< comment_likes >── users      (N:M  복합 PK)         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  클럽 게시판                                                       │
│                                                                   │
│  clubs ──< club_posts                      (1:N)                  │
│  club_posts ──< club_post_likes >── users  (N:M  복합 PK)         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  운영 / 안전                                                       │
│                                                                   │
│  users ──< reports (reporter_id)           (1:N  신고자)          │
│  reports → [target_type + target_id]       (다형적 대상 참조)      │
│  users ──< reports (resolved_by)           (1:N  처리 관리자)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 인덱스 목록

| # | 테이블 | 인덱스명 | 컬럼 | 종류 | 목적 |
|---|---|---|---|---|---|
| 1 | `users` | `uq_users_handle` | `handle` | UNIQUE | 로그인 중복 방지 |
| 2 | `refresh_tokens` | `uq_rt_token_hash` | `token_hash` | UNIQUE | 토큰 조회 |
| 3 | `refresh_tokens` | `idx_rt_user_id` | `user_id` | IDX | 사용자 토큰 목록 |
| 4 | `refresh_tokens` | `idx_rt_expires_at` | `expires_at` | IDX | 만료 토큰 배치 삭제 |
| 5 | `clubs` | `idx_clubs_category` | `category` | IDX | 카테고리 필터 |
| 6 | `clubs` | `idx_clubs_status` | `status` | IDX | 상태별 조회 |
| 7 | `clubs` | `idx_clubs_created_by` | `created_by` | IDX | 내가 만든 클럽 |
| 8 | `club_tags` | `idx_club_tags_club_id` | `club_id` | IDX | 클럽 태그 조회 |
| 9 | `club_members` | `idx_cm_user_id` | `user_id` | IDX | 내 클럽 목록 |
| 10 | `club_bookmarks` | `idx_cb_club_id` | `club_id` | IDX | 클럽 찜 수 |
| 11 | `club_join_requests` | `idx_cjr_club_id` | `club_id` | IDX | 클럽 신청 목록 |
| 12 | `club_join_requests` | `idx_cjr_user_id` | `user_id` | IDX | 내 신청 이력 |
| 13 | `schedules` | `idx_sch_club_id` | `club_id` | IDX | 클럽 일정 목록 |
| 14 | `schedules` | `idx_sch_scheduled_at` | `scheduled_at` | IDX | 다가오는 일정 조회 |
| 15 | `schedule_attendees` | `idx_sa_user_id` | `user_id` | IDX | 내 일정 참여 이력 |
| 16 | `posts` | `idx_posts_author_id` | `author_id` | IDX | 내 게시글 |
| 17 | `posts` | `idx_posts_category` | `category` | IDX | 카테고리 필터 |
| 18 | `posts` | `idx_posts_created_at` | `created_at` | IDX | 최신순 정렬 |
| 19 | `post_likes` | `idx_pl_user_id` | `user_id` | IDX | 내가 좋아요한 게시글 |
| 20 | `comments` | `idx_cmt_post_id` | `post_id` | IDX | 게시글 댓글 목록 |
| 21 | `comments` | `idx_cmt_parent_id` | `parent_id` | IDX | 대댓글 조회 |
| 22 | `comments` | `idx_cmt_author_id` | `author_id` | IDX | 내 댓글 |
| 23 | `comment_likes` | `idx_col_user_id` | `user_id` | IDX | 내가 좋아요한 댓글 |
| 24 | `club_posts` | `idx_cp_club_id` | `club_id` | IDX | 클럽 게시글 목록 |
| 25 | `club_posts` | `idx_cp_author_id` | `author_id` | IDX | 내 클럽 게시글 |
| 26 | `club_post_likes` | `idx_cpl_user_id` | `user_id` | IDX | 내가 좋아요한 클럽 게시글 |
| 27 | `follows` | `uq_follows` | `(follower_id, following_id)` | UNIQUE | 중복 팔로우 방지 |
| 28 | `follows` | `idx_follows_following_id` | `following_id` | IDX | 팔로워 목록 조회 |
| 29 | `notifications` | `idx_notif_user_id` | `user_id` | IDX | 내 알림 목록 |
| 30 | `notifications` | `idx_notif_created_at` | `created_at` | IDX | 최신순 정렬 |
| 31 | `user_pii` | `uq_pii_handle_hash` | `handle_hash` | UNIQUE | 로그인 lookup |
| 31a | `user_pii` | `uq_pii_phone_hash` | `phone_hash` | UNIQUE | 전화번호 중복 가입 방지 |
| 32 | `pii_access_logs` | `idx_pal_accessor_id` | `accessor_id` | IDX | 조회자별 감사 |
| 33 | `pii_access_logs` | `idx_pal_target_user_id` | `target_user_id` | IDX | 피조회자별 감사 |
| 34 | `pii_access_logs` | `idx_pal_accessed_at` | `accessed_at` | IDX | 기간별 조회 / 보존 기간 만료 처리 |
| 35 | `reports` | `uq_rpt_reporter_target` | `(reporter_id, target_type, target_id)` | UNIQUE | 중복 신고 방지 |
| 36 | `reports` | `idx_rpt_reporter_id` | `reporter_id` | IDX | 신고자별 신고 내역 |
| 37 | `reports` | `idx_rpt_target` | `(target_type, target_id)` | IDX | 대상별 신고 조회 (관리자) |
| 38 | `reports` | `idx_rpt_status` | `status` | IDX | 처리 상태별 필터 (관리자 대시보드) |
| 39 | `reports` | `idx_rpt_created_at` | `created_at` | IDX | 최신순 정렬 |

---

## 6. 설계 결정 사항

### 6.1 인증 설계

| 결정 | 근거 |
|---|---|
| `users.password` 미저장 | 인증은 시온 API 전담. LINKIT DB에 비밀번호를 저장하지 않아 유출 위험 제거 |
| `ONBOARDING` 상태 | 시온 인증 성공 후 프로필 미설정 상태를 구분. 프론트엔드가 `isNewUser` 플래그로 온보딩 플로우 진입 |
| `refresh_tokens.token_hash` SHA-256 | 원본 토큰 대신 해시만 저장. DB 유출 시 토큰 복원 및 도용 불가 |
| `refresh_tokens`에 `ip_address`·`device_info` 평문 보관 | 보안 이벤트 발생 시 빠른 세션 식별 필요. PII 테이블에 암호화 사본을 병행 보관하여 규정 준수 |

### 6.2 클럽 설계

| 결정 | 근거 |
|---|---|
| `club_members` 독립 엔티티 | `@ElementCollection`은 단순 ID 목록만 저장 가능. `role`, `joined_at` 및 FK 무결성 보장을 위해 독립 테이블로 승격 |
| `clubs.status` ENUM | CLOSED 소프트 삭제로 이력 보존. PENDING 상태로 관리자 승인 플로우 지원 |
| 일정 참여 자격 — 서비스 레이어 검증 | 클럽 멤버만 참여 가능하나 DB 레벨 복합 FK는 구조를 복잡하게 만듦. 비즈니스 규칙은 서비스 레이어 검증이 실용적 |
| 정원 제한 없음 | 프로젝트 정책상 `max_attendees` 미사용. 향후 필요 시 `schedules` 테이블에 컬럼 추가 가능 |

### 6.3 게시글·댓글 설계

| 결정 | 근거 |
|---|---|
| 좋아요 복합 PK | `(post_id, user_id)` 복합 PK로 중복 방지와 취소를 DB 레벨에서 보장. Race Condition 없이 안전 |
| `comments.parent_id` 자기 참조 | 단일 컬럼으로 무한 depth 대댓글 구현 가능. 별도 테이블 대비 단순하고 실용적 |
| count 컬럼 denormalization | `like_count`, `comment_count`, `view_count`를 본 테이블에 저장. 목록 조회 시 COUNT(*) 서브쿼리 불필요. 정합성은 서비스 레이어 또는 트리거로 관리 |

### 6.4 개인정보 보호 설계

| 결정 | 근거 |
|---|---|
| 고유번호 양방향 암호화 + Base64 | 개발 착수 보고서 4조: "고유번호를 Base64로 양방향 암호화 저장". AES-256-GCM 암호화 결과를 Base64로 인코딩하여 저장. 복호화 가능(양방향) |
| 이름·전화번호 암호화 저장 | 보고서는 마스킹만 명시했으나, 내부 결정으로 암호화 저장 추가 적용. 보고서 최소 기준보다 높은 수준의 보호 |
| 로그 보관 1년 | 개발 착수 보고서 4조: "시스템 관리자의 시스템 접속 로그는 1년 간 보관" |
| `users.real_name` · `users.phone_number` 저장 | 내부 논의를 통해 시온 API 수신 정보를 LINKIT DB에 저장하기로 결정. 로그인마다 최신 정보로 갱신 |
| `phone_hash` UNIQUE | 동일 전화번호 중복 가입 방지. 암호화된 `phone_enc`는 WHERE 조회 불가이므로 SHA-256 해시를 별도 저장 |
| `user_pii` 별도 테이블 (이중 저장) | `users`에는 서비스 운영용 평문, `user_pii`에는 암호화 사본을 별도 보관. 일반 쿼리와 민감 정보 접근을 물리적으로 분리하여 내부자 위협 및 SQL Injection 피해 최소화 |
| `handle_hash` · `phone_hash` SHA-256 | AES-256-GCM 암호화 결과는 랜덤 IV로 동일 원문도 매번 달라 WHERE 조회 불가. 단방향 해시를 별도 저장하여 O(1) lookup 지원. 복원 불가 |
| `enc_version` 컬럼 | 키 로테이션 시 버전별 재암호화 범위 식별. 구버전 키로 암호화된 행을 순차 마이그레이션할 때 사용 |
| `pii_access_logs` INSERT ONLY | 개인정보 보호법 제29조 처리 기록 보관 의무 준수. 수정·삭제 금지로 감사 무결성 보장 |
| `accessor_id` ON DELETE SET NULL | 조회자 탈퇴 후에도 이력 영구 보존 (법적 의무). `target_user_id`는 FK 제약 없이 문자열로 보존 |
| 마스킹 — DTO 레이어 처리 | DB에 마스킹 값 별도 저장 시 원본·마스킹 두 벌 관리 필요. 규칙 변경 시 전체 데이터 재처리 필요. DTO 레이어 처리가 유연하고 일관적 |
| `accessor_ip` 평문 저장 | 침해사고 대응 시 IP 즉시 확인 필요. 암호화하면 조사 시 복호화 과정으로 대응 속도 저하 |

### 6.5 신고(reports) 설계

| 결정 | 근거 |
|---|---|
| `target_type` + `target_id` 다형적 참조 | Post, Comment, User, Club, ClubPost 등 다양한 대상을 단일 테이블로 처리. 별도 테이블 분리 대비 쿼리 단순화 |
| `reporter_id` ON DELETE SET NULL | 신고자 탈퇴 후에도 신고 이력 보존. 관리자가 계속 신고를 처리할 수 있어야 함 |
| UNIQUE (reporter_id, target_type, target_id) | 동일 사용자가 같은 대상을 중복 신고하지 못하도록 DB 레벨에서 방지 |
| `status` PENDING → RESOLVED \| DISMISSED | 미처리(PENDING) → 제재(RESOLVED) 또는 기각(DISMISSED). 처리자(`resolved_by`)와 처리 일시(`resolved_at`) 함께 기록 |
| `detail` TEXT 선택 항목 | 신고 사유(ENUM) 외 추가 설명이 필요한 경우 사용. 강제하지 않아 UX 부담 최소화 |

### 6.6 DB 선택 — SQLite

| 결정 | 근거 |
|---|---|
| SQLite 단일 파일 DB | 프로젝트 규모(1만 2천명)에서 별도 DB 서버 운영 불필요. 설치·배포·백업이 단순 |
| 개발·운영 동일 DB 엔진 | 환경 불일치(dialect 차이)로 인한 버그 방지. H2를 테스트 전용으로 격리 |
| Hibernate Community Dialect | `org.hibernate.community.dialect.SQLiteDialect`로 JPA/Hibernate SQLite 지원 |
| `DB_PATH` 환경변수 | 개발: `./linkit-dev.db`, 운영: `/data/linkit.db`. 컨테이너 볼륨 마운트로 데이터 영속성 보장 |
| 파일 백업 | 운영 환경에서 cron + `cp` 또는 Litestream(SQLite 전용 스트리밍 복제)으로 백업 |
