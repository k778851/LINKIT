# LINKIT 작업 현황 및 남은 작업

> 최종 갱신: 2026-05-15
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

### 환경변수

```
JAVA_HOME            = C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot
MAVEN_HOME           = C:\Users\k7788\AppData\Local\apache-maven-3.9.6
NVM_HOME             = C:\Users\k7788\AppData\Local\nvm

# 백엔드 운영 시 추가 (선택)
APPLICATION_ENC_KEY  = <32바이트 이상 임의 문자열>   # PII AES-256-GCM 키
ZION_API_URL         = <시온 인증 서버 URL>          # 시온 연동 시 필수
ZION_API_KEY         = <시온 API 키>
```

> ⚠️ `APPLICATION_ENC_KEY`가 비어있으면 개발용 결정적 키가 사용되며 경고 로그가 출력됩니다. 운영(prod)에서는 반드시 환경변수를 설정해야 합니다.

---

## 2. 완료된 작업

### 2.1 프로젝트 기반 설정

| 항목 | 상태 |
|------|------|
| 모노레포 구조 (루트 Next.js + `/backend` Spring Boot) | ✅ |
| SQLite 단일 DB + `application.yml` 3프로파일(dev/prod/test) | ✅ |
| `.nvmrc`, `package.json engines`, `CLAUDE.md` | ✅ |
| `docs/DB_SPEC.md` v1.3 (21개 테이블, 인덱스 39개) | ✅ |
| `docs/schema_sqlite.sql` | ✅ |
| GitHub Actions (Node 20, GitHub Pages 정적 배포) | ✅ |

---

### 2.2 백엔드

#### 인증/사용자
| 항목 | 상태 |
|------|------|
| `User`, `UserPii`, `RefreshToken`, `RefreshTokenPii`, `PiiAccessLog` 엔티티 | ✅ |
| `UserService.login()` / `completeOnboarding()` / `getProfile()` / `updateProfile()` | ✅ |
| `JwtTokenProvider` + `JwtAuthenticationFilter` (Authorization 헤더 + `?token=` 쿼리 모두 지원) | ✅ |
| **Refresh Token 발급·갱신·로그아웃 (`/api/auth/refresh`, `/api/auth/logout`)** | ✅ |
| **PII 암호화 서비스 (`PiiEncryptionService` AES-256-GCM + SHA-256 hash)** | ✅ NEW |
| **`UserService` 회원 가입/온보딩/프로필 수정 시 `user_pii` 자동 upsert** | ✅ NEW |
| `SecurityConfig` (공개/인증/관리자 엔드포인트 분리, CORS, Stateless) | ✅ |

#### 클럽
| 항목 | 상태 |
|------|------|
| `Club`, `ClubMember`, `ClubBookmark`, `ClubJoinRequest`, `ClubPost`, `ClubPostLike` | ✅ |
| `ClubService` CRUD + 가입/탈퇴/찜 | ✅ |
| **비공개 클럽 분기 — `isPrivate=true`일 때 `ClubJoinRequest` 생성 + 클럽장 알림** | ✅ NEW |
| **가입 신청 목록/승인/거절 API + 권한 체크 (`requireOwnerOrAdmin`)** | ✅ NEW |
| **클럽 생성 시 작성자 자동 `OWNER` 멤버 등록** | ✅ NEW |
| **멤버 역할 변경 (`PATCH /clubs/{id}/members/{userId}/role`) — OWNER만 가능** | ✅ NEW |

#### 커뮤니티/댓글
| 항목 | 상태 |
|------|------|
| `Post`, `PostLike`, `Comment`, `CommentLike` | ✅ |
| `PostService` / `PostController` / `CommentService` / `CommentController` | ✅ |
| **count 동시성 처리 — `@Modifying` JPQL `count = count + 1` 원자 갱신 + `CASE WHEN > 0` 0-floor** | ✅ NEW |

#### 신고
| 항목 | 상태 |
|------|------|
| `Report` 엔티티 + `ReportRepository` | ✅ |
| **`ReportService` (중복 신고 차단, 페이지네이션, 처리)** | ✅ NEW |
| **`ReportController` — `POST /api/reports`, `GET/PATCH /api/admin/reports`** | ✅ NEW |

#### 기타 도메인
| 도메인 | 상태 |
|--------|------|
| 일정 (Schedule, ScheduleAttendee) | ✅ |
| 팔로우 (Follow) | ✅ |
| 알림 (Notification + SSE 실시간) | ✅ |
| 검색 (Search) — In-memory 필터링 | ✅ |
| 파일 업로드 (Upload) — 로컬 디스크, UUID, 이미지 5MB 제한 | ✅ |
| 관리자 (Admin) — 통계·유저·클럽·게시글·**클럽 상태 PATCH** | ✅ |
| 웹 푸시 (WebPush + VAPID, BouncyCastle 등록) | ✅ |

#### 테스트
| 항목 | 상태 |
|------|------|
| **`JwtTokenProviderTest` (3건)** | ✅ NEW |
| **`UserServiceTest` (4건)** | ✅ NEW |
| **`ClubServiceTest` (4건)** | ✅ NEW |
| **`./mvnw test` 전체 11/11 PASS** | ✅ NEW |

---

### 2.3 프론트엔드

| 항목 | 상태 |
|------|------|
| App Router 구조 (`(app)` 인증그룹, `onboarding`, `admin`) | ✅ |
| 인증 가드 (`(app)/layout.jsx` — 미인증 시 `/onboarding` 강제 이동) | ✅ |
| 온보딩 4단계 (Login → Terms → Profile → Welcome) | ✅ |
| Zustand 5개 스토어 (auth, club, community, notification, follow) | ✅ |
| **`apiClient.js` — 401 자동 Refresh Token 갱신 인터셉터 (대기열 처리 포함)** | ✅ |
| SSE 실시간 알림 (`useSseNotifications`, 지수 백오프 5회) | ✅ |
| `AppInitProvider` 마운트 1회 동기화 | ✅ |
| 4색 디자인 시스템 + 다크모드(`html[data-theme='dark']`) | ✅ |
| `assetPath()` 정적 파일 경로 (GitHub Pages basePath 보정) | ✅ |
| 30+ 페이지 (home, clubs, community, mypage, notifications, search, admin 등) | ✅ |
| **API 클라이언트 11개 — `clubApi`에 join-requests/role 변경 추가, `reportApi.js`, `webPushApi.js` 신규** | ✅ NEW |
| **`useWebPush` 훅 — `webPushApi` 사용 + 오프라인 graceful 처리** | ✅ |
| **gh-pages 데모 — 오프라인 fallback (sampleData), 모든 화면 동작 검증** | ✅ |
| 404 페이지 (`not-found.jsx`) | ✅ |

---

## 3. 남은 작업

### 🔴 P0 — 배포 전 필수 (1건)

#### 1. 시온 API 연동 (`ZionApiClient`)
- **현재 상태**: `UserService.login()`에 `TODO` 주석. handle 입력만으로 즉시 로그인 (보안 구멍).
- **해야 할 일**:
  - `ZionApiClient` 클래스 (HTTP 클라이언트 → 시온 서버 인증)
  - 인증 실패 시 `BadCredentialsException`
  - 시온 응답에서 `realName`, `phoneNumber` 수신 → `User` 평문 + `UserPii`에 암호화 저장
  - 환경변수: `ZION_API_URL`, `ZION_API_KEY`
  - `UserService.login()`에서 `piiEncryptionService.encrypt(realName)` → `userPii.setRealNameEnc(...)` 호출 (이미 PII 인프라 준비 완료)

> 💡 사용자 요청에 따라 본 사이클에서는 시온 연동을 의도적으로 보류했습니다. 위 인프라(PII 암호화 서비스, UserPii upsert 흐름)는 모두 구축되어 있으므로 시온 연동 시 `ZionApiClient` 한 클래스만 추가하면 됩니다.

---

### 🟡 P1 — 중요 (품질·안정성)

#### 2. SSE 토큰 인증 강화
- **현재 상태**: URL 쿼리 파라미터(`?token=...`)로 JWT 전달 가능 — 서버 로그 노출 위험.
- **검토 옵션**: HttpOnly 쿠키 기반으로 전환 또는 `EventSource` 대신 `fetch` + ReadableStream 사용.

#### 3. 신고 통계 관리자 대시보드
- **현재 상태**: `AdminController /stats`에 신고 PENDING 카운트 미포함.
- **해야 할 일**: `ReportRepository.countPendingByTargetType()` 활용해 stats 응답에 추가.

#### 4. PII 조회 이력 자동 기록
- **현재 상태**: `PiiAccessLog` 엔티티만 존재, 실제 기록 로직 없음.
- **해야 할 일**: Spring AOP로 `PiiEncryptionService.decrypt` 호출 시 자동 INSERT.

---

### 🟢 P2 — 개선 (배포 후 단계적)

| # | 항목 | 내용 |
|---|------|------|
| 5 | 파일 스토리지 교체 | 로컬 디스크 → Cloudflare R2 / AWS S3 |
| 6 | 검색 성능 최적화 | In-memory 필터 → JPQL `LIKE` 또는 SQLite FTS5 |
| 7 | 만료 토큰 배치 삭제 | `refresh_tokens` 만료 레코드 `@Scheduled` 정리 |
| 8 | 클럽 게시글 댓글 테이블 | `club_posts` 댓글 분리 필요 여부 검토 |
| 9 | 프론트 에러 메시지 차별화 | API 에러 vs 오프라인 구분 표시 |
| 10 | 알림 카테고리별 필터 | 클럽/댓글/좋아요 탭 분리 |
| 11 | E2E 테스트 | Playwright 로그인→클럽가입→글쓰기→댓글 시나리오 |

---

## 4. API 엔드포인트 현황

### ✅ 구현 완료 (54개)

#### 인증
| 메서드 | 경로 | 비고 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 + Refresh Token 발급 |
| POST | `/api/auth/refresh` | Access Token 갱신 |
| POST | `/api/auth/logout` | Refresh Token 폐기 |

#### 사용자
| 메서드 | 경로 |
|--------|------|
| POST | `/api/users/me/onboarding` |
| GET / PUT | `/api/users/me` |
| GET | `/api/users/{userId}` |

#### 클럽
| 메서드 | 경로 | 비고 |
|--------|------|------|
| GET | `/api/clubs` | 카테고리·정렬 필터 |
| GET / POST / PUT / DELETE | `/api/clubs/{clubId}` | |
| POST | `/api/clubs/{clubId}/join` | **공개=즉시, 비공개=신청** |
| DELETE | `/api/clubs/{clubId}/join` | 탈퇴 |
| POST | `/api/clubs/{clubId}/bookmark` | 찜 토글 |
| GET | `/api/clubs/{clubId}/join-requests` | **NEW** 신청 목록 (관리자) |
| POST | `/api/clubs/{clubId}/join-requests` | **NEW** 신청 (alias) |
| PATCH | `/api/clubs/{clubId}/join-requests/{id}/approve` | **NEW** |
| PATCH | `/api/clubs/{clubId}/join-requests/{id}/reject` | **NEW** |
| PATCH | `/api/clubs/{clubId}/members/{userId}/role` | **NEW** 역할 변경 (OWNER만) |
| GET / POST / DELETE | `/api/clubs/{clubId}/posts[/{postId}]` | 클럽 게시판 |
| GET | `/api/clubs/{clubId}/schedules` | 클럽 일정 |

#### 커뮤니티
| 메서드 | 경로 |
|--------|------|
| GET / POST | `/api/posts` |
| GET / PUT / DELETE | `/api/posts/{postId}` |
| POST / DELETE | `/api/posts/{postId}/like` |
| GET / POST | `/api/posts/{postId}/comments` |
| DELETE | `/api/posts/{postId}/comments/{commentId}` |
| POST / DELETE | `/api/comments/{commentId}/like` |

#### 일정·팔로우·알림·검색·업로드
| 메서드 | 경로 |
|--------|------|
| GET | `/api/schedules/mine` |
| GET / POST / DELETE | `/api/follows` |
| GET | `/api/follows/{userId}/followers` |
| GET | `/api/follows/{userId}/following` |
| GET (SSE) | `/api/notifications/subscribe` |
| GET | `/api/notifications` |
| GET | `/api/notifications/unread-count` |
| PATCH | `/api/notifications/{id}/read` |
| PATCH | `/api/notifications/read-all` |
| DELETE | `/api/notifications/{id}` |
| GET | `/api/search` |
| POST | `/api/upload` |

#### 신고
| 메서드 | 경로 | 비고 |
|--------|------|------|
| POST | `/api/reports` | **NEW** 신고 접수 |
| GET | `/api/admin/reports` | **NEW** 신고 목록 (status 필터) |
| PATCH | `/api/admin/reports/{reportId}` | **NEW** RESOLVED/DISMISSED |

#### 관리자
| 메서드 | 경로 |
|--------|------|
| GET | `/api/admin/stats` |
| GET / PATCH | `/api/admin/users` |
| GET / PATCH | `/api/admin/clubs` |
| PATCH | `/api/admin/clubs/{clubId}/status` |
| GET / DELETE | `/api/admin/posts` |

#### 웹 푸시
| 메서드 | 경로 |
|--------|------|
| GET | `/api/push/public-key` |
| POST | `/api/push/subscribe` |
| POST | `/api/push/unsubscribe` |

### ❌ 미구현 (1개 — P0)

| 메서드 | 경로 | 우선순위 |
|--------|------|----------|
| (내부) | `ZionApiClient.validate(handle, password)` 호출 | 🔴 P0 |
