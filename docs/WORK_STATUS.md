# LINKIT 작업 현황 및 남은 작업

> 작성일: 2026-05-09  
> 기준 브랜치: main

---

## 목차

1. [개발 환경](#1-개발-환경)
2. [완료된 작업](#2-완료된-작업)
3. [남은 작업](#3-남은-작업)
4. [API 엔드포인트 현황](#4-api-엔드포인트-현황)

---

## 1. 개발 환경

| 항목 | 버전 | 비고 |
|------|------|------|
| Node.js | 20.20.2 LTS | nvm-windows로 관리 (`nvm use 20`) |
| npm | 10.8.2 | |
| Java | 21.0.11 LTS | Microsoft OpenJDK 21, `JAVA_HOME` 설정 완료 |
| Maven | 3.9.6 | `C:\Users\k7788\AppData\Local\apache-maven-3.9.6` |
| Next.js | 15.3.2 | React 19, 정적 배포(`output: export`) |
| Spring Boot | 3.2.5 | |
| DB | SQLite 3.x | dev: `./linkit-dev.db`, prod: `/data/linkit.db` |

### 환경변수 (영구 설정 완료)
```
JAVA_HOME   = C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot
MAVEN_HOME  = C:\Users\k7788\AppData\Local\apache-maven-3.9.6
NVM_HOME    = C:\Users\k7788\AppData\Local\nvm
```

> ⚠️ 새 터미널 세션에서 자동 적용됩니다. 현재 열린 터미널은 재시작 필요.

---

## 2. 완료된 작업

### 2.1 프로젝트 기반 설정

| 항목 | 상태 | 내용 |
|------|------|------|
| 모노레포 구조 | ✅ | 루트(Next.js) + `/backend`(Spring Boot) |
| DB 확정 | ✅ | SQLite 단일 파일 (MySQL에서 전환) |
| `application.yml` 3프로파일 | ✅ | dev(SQLite) / prod(SQLite) / test(H2 in-memory) |
| SQLite 의존성 | ✅ | `org.xerial:sqlite-jdbc:3.45.3.0` + Hibernate Community Dialect |
| `pom.xml` H2/MySQL 정리 | ✅ | H2를 test scope으로 격리, MySQL 제거 |
| `.nvmrc` | ✅ | `20` |
| `package.json engines` | ✅ | `node >= 20.0.0` |
| `CLAUDE.md` | ✅ | Claude Code용 프로젝트 가이드 |
| `docs/DB_SPEC.md` v1.3 | ✅ | 21개 테이블, 인덱스 39개, SQLite 반영 |
| `docs/schema_sqlite.sql` | ✅ | 21개 테이블 DDL + 트리거 |
| GitHub Actions | ✅ | Node.js 20, GitHub Pages 정적 배포 |

---

### 2.2 백엔드 — 도메인별 구현 현황

#### 사용자 / 인증
| 파일 | 상태 | 내용 |
|------|------|------|
| `User` 엔티티 | ✅ | handle, realName, phoneNumber, nickname, bio, profileImage, role, status |
| `UserService` | ✅ | `login()`, `completeOnboarding()`, `getProfile()`, `updateProfile()` |
| `UserController` | ✅ | `POST /api/auth/login`, `POST /api/users/me/onboarding`, `GET/PUT /api/users/me`, `GET /api/users/{id}` |
| `JwtTokenProvider` | ✅ | 발급·검증 (JJWT 0.12, HS256) |
| `JwtAuthenticationFilter` | ✅ | Bearer 토큰 추출 → SecurityContext 설정 |
| `SecurityConfig` | ✅ | 공개/인증/관리자 엔드포인트 분리, CORS, Stateless |
| `RefreshToken` 엔티티 | ✅ | SHA-256 tokenHash, issuedAt, expiresAt, revokedAt |

#### 개인정보 보호 (PII)
| 파일 | 상태 | 내용 |
|------|------|------|
| `UserPii` 엔티티 | ✅ | handle_enc, handle_hash, real_name_enc, phone_hash, phone_enc, bio_enc, profile_image_enc |
| `RefreshTokenPii` 엔티티 | ✅ | ip_address_enc, device_info_enc |
| `PiiAccessLog` 엔티티 | ✅ | accessor_id, target_user_id, fields_accessed, purpose, access_result |
| `UserPiiRepository` | ✅ | findByHandleHash, existsByPhoneHash |
| `RefreshTokenPiiRepository` | ✅ | PK 기반 조회 |
| `PiiAccessLogRepository` | ✅ | 대상/조회자/기간별 페이지 조회 |

#### 클럽
| 파일 | 상태 | 내용 |
|------|------|------|
| `Club` 엔티티 | ✅ | name, emoji, coverImage, category, tags, isPrivate, joinQuestion, status |
| `ClubMember` 엔티티 | ✅ | 복합 PK, role(OWNER/ADMIN/MEMBER), joinedAt |
| `ClubBookmark` 엔티티 | ✅ | 복합 PK, userId, clubId |
| `ClubJoinRequest` 엔티티 | ✅ | PENDING/APPROVED/REJECTED |
| `ClubPost`, `ClubPostLike` | ✅ | 클럽 내 게시판 |
| `ClubService` | ✅ | CRUD, joinClub, leaveClub, toggleBookmark |
| `ClubController` | ✅ | 목록/상세/생성/수정/삭제, 가입/탈퇴/찜 |

#### 커뮤니티 게시판
| 파일 | 상태 | 내용 |
|------|------|------|
| `Post`, `PostLike` | ✅ | like_count, comment_count, view_count denormalized |
| `Comment`, `CommentLike` | ✅ | parent_id 자기 참조 (대댓글) |
| `PostService`, `PostController` | ✅ | CRUD + 좋아요 토글 |
| `CommentService`, `CommentController` | ✅ | CRUD + 좋아요 |

#### 기타 도메인
| 도메인 | 상태 | 내용 |
|--------|------|------|
| 일정 (Schedule) | ✅ | ScheduleAttendee, ClubMemberRepository 기반 내 일정 조회 |
| 팔로우 (Follow) | ✅ | followerId, followingId UNIQUE, 팔로워/팔로잉 목록·수 |
| 알림 (Notification) | ✅ | DB 저장 + SSE 실시간 전송, heartbeat 30초, 읽음 처리 |
| 검색 (Search) | ✅ | 클럽·게시글 키워드 검색 (현재 In-memory 필터) |
| 파일 업로드 (Upload) | ✅ | 로컬 디스크, UUID 파일명, 이미지 전용, 5MB 제한 |
| 관리자 (Admin) | ✅ | 통계, 유저/클럽/게시글 목록·제재 |
| 신고 (Report) | 🔶 | 엔티티·리포지토리만 완성, Service/Controller 미구현 |

---

### 2.3 프론트엔드 — 완료 항목

| 항목 | 상태 | 내용 |
|------|------|------|
| App Router 구조 | ✅ | `(app)/` 인증 그룹, `onboarding/`, `admin/` 분리 |
| 인증 가드 | ✅ | `(app)/layout.jsx` — isAuthenticated 미인증 시 `/onboarding` 강제 이동 |
| 온보딩 플로우 | ✅ | LoginStep → TermsStep → ProfileStep → WelcomeStep 4단계 |
| Zustand 스토어 | ✅ | authStore, clubStore, communityStore, notificationStore, followStore |
| API 클라이언트 | ✅ | JWT 자동 주입, 오프라인(status 0) → sampleData fallback |
| SSE 실시간 알림 | ✅ | useSseNotifications (지수 백오프 최대 5회 재연결) |
| 앱 초기화 | ✅ | AppInitProvider — 마운트 1회 프로필·알림·클럽 동기화 |
| 디자인 시스템 | ✅ | 4색 CSS 변수, 다크모드(`html[data-theme='dark']`) |
| 정적 파일 경로 | ✅ | `assetPath()` 유틸 (GitHub Pages basePath 보정) |
| 페이지 (30+) | ✅ | home, clubs, community, mypage, notifications, search, admin 등 |

---

## 3. 남은 작업

### 🔴 P0 — 배포 전 필수

#### 1. 시온 API 연동 (`ZionApiClient`)
- **현재 상태**: `UserService.login()`에 `TODO` 주석만 존재. handle 입력 시 검증 없이 즉시 로그인됨 (보안 구멍)
- **해야 할 일**:
  - `ZionApiClient` 클래스 구현 (HTTP 클라이언트 → 시온 서버 인증 요청)
  - 인증 실패 시 `BadCredentialsException` 처리
  - 시온 API 응답에서 `realName`, `phoneNumber` 수신 → `User` 엔티티에 저장
  - 시온 API URL/Key 환경변수 추가 (`ZION_API_URL`, `ZION_API_KEY`)

#### 2. PII 암호화 서비스 (`PiiEncryptionService`)
- **현재 상태**: `UserPii` 엔티티와 리포지토리는 완성됐으나, 실제 AES-256-GCM 암호화/복호화 서비스 없음. 로그인 시 `user_pii`에 데이터가 저장되지 않음
- **해야 할 일**:
  - `PiiEncryptionService` 구현 (AES-256-GCM + Base64, SHA-256 해시)
  - `UserService.login()` 또는 `completeOnboarding()` 시 `UserPii` INSERT
  - 환경변수 `APPLICATION_ENC_KEY` 추가 (32바이트 이상)
  - `RefreshToken` 발급 시 `RefreshTokenPii` INSERT

#### 3. Refresh Token 플로우
- **현재 상태**: `RefreshToken` 엔티티만 있고 발급·저장·갱신 로직 없음. Access Token 만료(1시간) 시 재로그인 필요
- **해야 할 일**:
  - `POST /api/auth/login` 응답에 refresh_token 추가
  - `POST /api/auth/refresh` 엔드포인트 구현 (refresh_token → 새 access_token)
  - `POST /api/auth/logout` 구현 (refresh_token revoke)
  - 프론트엔드 `apiClient.js`에 401 응답 시 자동 토큰 갱신 인터셉터 추가

#### 4. 비공개 클럽 가입 신청 플로우
- **현재 상태**: `ClubJoinRequest` 엔티티·리포지토리는 있지만 관련 API 없음. 현재 모든 클럽이 즉시 가입됨 (is_private 무시)
- **해야 할 일**:
  - `ClubService.joinClub()`에서 `is_private` 분기 처리
    - 공개: 즉시 `ClubMember` 저장
    - 비공개: `ClubJoinRequest` 저장 → 클럽장에게 알림
  - `POST /api/clubs/{clubId}/join-requests` — 가입 신청
  - `PATCH /api/clubs/{clubId}/join-requests/{requestId}/approve` — 승인
  - `PATCH /api/clubs/{clubId}/join-requests/{requestId}/reject` — 거절
  - `GET /api/clubs/{clubId}/join-requests` — 신청 목록 (클럽 관리자용)

#### 5. 신고 API (`ReportService` / `ReportController`)
- **현재 상태**: `Report` 엔티티·리포지토리만 존재
- **해야 할 일**:
  - `ReportService` 구현 (중복 신고 방지, 신고 접수)
  - `POST /api/reports` — 신고 접수
  - `GET /api/admin/reports` — 관리자 신고 목록 (상태·대상 유형별 필터)
  - `PATCH /api/admin/reports/{reportId}` — 신고 처리 (RESOLVED/DISMISSED)

---

### 🟡 P1 — 중요 (품질·안정성)

#### 6. 프론트엔드 `authApi.js` register 메서드 제거
- **현재 상태**: 백엔드에서 `POST /api/auth/register`를 삭제했으나 프론트 `authApi.js`에 `register()` 메서드가 남아있음
- **해야 할 일**: `src/api/authApi.js`에서 `register` 제거. `authStore.registerWithApi()` 정리

#### 7. 관리자 클럽 승인 API
- **현재 상태**: `clubs.status = PENDING`이 기본값이지만 관리자가 `ACTIVE`로 변경하는 API 없음
- **해야 할 일**: `AdminController`에 `PATCH /api/admin/clubs/{clubId}/status` 추가

#### 8. SSE 토큰 인증 방식 개선
- **현재 상태**: `GET /api/notifications/subscribe?token=...` — URL 파라미터로 JWT 전달 (서버 로그에 토큰 노출 위험)
- **해야 할 일**: `SecurityConfig`에서 SSE 엔드포인트를 별도 처리하거나 쿠키 기반 인증으로 교체 검토

#### 9. count 필드 정합성 보장
- **현재 상태**: `like_count`, `comment_count`, `view_count`가 denormalized 저장되는데 동시 요청 시 정합성 보장 없음
- **해야 할 일**: `@Version` Optimistic Lock 적용 또는 `UPDATE ... SET count = count + 1` 단일 쿼리로 처리

#### 10. 테스트 코드 작성
- **현재 상태**: `backend/src/test/` 파일 없음 (0개)
- **해야 할 일**: 최소한 아래 3개 서비스에 단위 테스트 작성
  - `UserServiceTest` (login, onboarding)
  - `ClubServiceTest` (join, leave, toggleBookmark)
  - `JwtTokenProviderTest`

---

### 🟢 P2 — 개선 (배포 후 단계적)

| # | 항목 | 내용 |
|---|------|------|
| 11 | 파일 스토리지 교체 | 로컬 디스크 → Cloudflare R2(권장) 또는 AWS S3. `FileUploadController`만 교체하면 됨 |
| 12 | 검색 성능 최적화 | 현재 전체 로드 후 In-memory 필터링 → JPA JPQL `LIKE` 쿼리 또는 SQLite FTS5 활용 |
| 13 | PII 조회 이력 자동 기록 | 현재 `PiiAccessLog`에 아무것도 기록 안 됨 → Spring AOP로 PII 접근 시 자동 INSERT |
| 14 | 만료 토큰 배치 삭제 | `refresh_tokens` 만료 레코드 정기 정리 `@Scheduled` 추가 |
| 15 | 클럽 멤버 역할 관리 API | `PATCH /api/clubs/{clubId}/members/{userId}/role` — MEMBER↔ADMIN 역할 변경 |
| 16 | 클럽 게시글 댓글 | 현재 `club_posts`에 댓글 테이블 없음 (커뮤니티 댓글과 분리 필요 여부 검토) |
| 17 | 프론트 API 연동 완성도 검증 | 각 store의 fallback이 실제 API 에러인지 오프라인인지 구분하여 에러 메시지 개선 |
| 18 | 관리자 대시보드 신고 현황 | `AdminController /stats`에 신고 통계 추가 |

---

## 4. API 엔드포인트 현황

### ✅ 구현 완료

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 시온 인증 → JWT 발급 |
| POST | `/api/users/me/onboarding` | 온보딩 완료 (ONBOARDING → ACTIVE) |
| GET | `/api/users/me` | 내 프로필 |
| PUT | `/api/users/me` | 프로필 수정 |
| GET | `/api/users/{userId}` | 특정 유저 프로필 |
| GET | `/api/clubs` | 클럽 목록 (카테고리·정렬 필터) |
| GET | `/api/clubs/{clubId}` | 클럽 상세 |
| POST | `/api/clubs` | 클럽 생성 |
| PUT | `/api/clubs/{clubId}` | 클럽 수정 |
| DELETE | `/api/clubs/{clubId}` | 클럽 삭제 |
| POST | `/api/clubs/{clubId}/join` | 클럽 가입 (공개 즉시 가입만) |
| DELETE | `/api/clubs/{clubId}/join` | 클럽 탈퇴 |
| POST | `/api/clubs/{clubId}/bookmark` | 찜 토글 |
| GET | `/api/clubs/{clubId}/posts` | 클럽 게시글 목록 |
| POST | `/api/clubs/{clubId}/posts` | 클럽 게시글 작성 |
| DELETE | `/api/clubs/{clubId}/posts/{postId}` | 클럽 게시글 삭제 |
| GET | `/api/clubs/{clubId}/schedules` | 클럽 일정 목록 |
| GET/POST | `/api/posts` | 커뮤니티 게시글 목록/작성 |
| GET/PUT/DELETE | `/api/posts/{postId}` | 게시글 상세/수정/삭제 |
| POST/DELETE | `/api/posts/{postId}/like` | 좋아요 토글 |
| GET/POST | `/api/posts/{postId}/comments` | 댓글 목록/작성 |
| DELETE | `/api/posts/{postId}/comments/{commentId}` | 댓글 삭제 |
| POST/DELETE | `/api/comments/{commentId}/like` | 댓글 좋아요 |
| GET | `/api/schedules/mine` | 내 일정 목록 |
| GET/POST/DELETE | `/api/follows` | 팔로우/언팔로우 |
| GET | `/api/follows/{userId}/followers` | 팔로워 목록 |
| GET | `/api/follows/{userId}/following` | 팔로잉 목록 |
| GET | `/api/notifications/subscribe` | SSE 실시간 알림 구독 |
| GET | `/api/notifications` | 알림 목록 |
| GET | `/api/notifications/unread-count` | 읽지 않은 알림 수 |
| PATCH | `/api/notifications/{id}/read` | 단건 읽음 처리 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 처리 |
| DELETE | `/api/notifications/{id}` | 알림 삭제 |
| GET | `/api/search` | 클럽·게시글 검색 |
| POST | `/api/upload` | 이미지 업로드 |
| GET | `/api/admin/stats` | 관리자 통계 |
| GET/PATCH | `/api/admin/users` | 유저 목록·제재 |
| GET/PATCH | `/api/admin/clubs` | 클럽 목록·상태 변경 |
| GET/DELETE | `/api/admin/posts` | 게시글 목록·삭제 |

### ❌ 미구현

| 메서드 | 경로 | 설명 | 우선순위 |
|--------|------|------|----------|
| POST | `/api/auth/refresh` | Access Token 갱신 | 🔴 P0 |
| POST | `/api/auth/logout` | Refresh Token 무효화 | 🔴 P0 |
| POST | `/api/clubs/{clubId}/join-requests` | 비공개 클럽 가입 신청 | 🔴 P0 |
| PATCH | `/api/clubs/{clubId}/join-requests/{id}/approve` | 가입 신청 승인 | 🔴 P0 |
| PATCH | `/api/clubs/{clubId}/join-requests/{id}/reject` | 가입 신청 거절 | 🔴 P0 |
| GET | `/api/clubs/{clubId}/join-requests` | 신청 목록 (관리자) | 🔴 P0 |
| POST | `/api/reports` | 신고 접수 | 🔴 P0 |
| GET | `/api/admin/reports` | 신고 목록 | 🟡 P1 |
| PATCH | `/api/admin/reports/{id}` | 신고 처리 | 🟡 P1 |
| PATCH | `/api/admin/clubs/{clubId}/status` | 클럽 상태 변경 (승인) | 🟡 P1 |
| PATCH | `/api/clubs/{clubId}/members/{userId}/role` | 멤버 역할 변경 | 🟢 P2 |
