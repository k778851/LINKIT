# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

LINKIT — 동네 소모임 커뮤니티 플랫폼. **모노레포** 구조로 프론트엔드(Next.js)와 백엔드(Spring Boot)가 하나의 저장소에 공존합니다.

- **프론트엔드**: 루트 디렉터리 (`/src`) — Next.js 15 + React 19, Node.js 20 LTS, GitHub Pages 정적 배포
- **백엔드**: `/backend` — Spring Boot 3.2.5 + JPA + Java 21 LTS, SQLite 운영 DB
- **문서**: `/docs/DB_SPEC.md` — DB 설계 명세서 (v1.3)

---

## 개발 명령어

### 프론트엔드 (루트 디렉터리에서)

```bash
npm run dev        # 개발 서버 (localhost:3000)
npm run build      # 정적 빌드 → /out 디렉터리
npm run start      # 빌드 결과물 서빙
npm run lint       # ESLint 검사
```

### 백엔드 (`/backend` 디렉터리에서)

```bash
./mvnw spring-boot:run                          # 개발 서버 실행 (localhost:8080)
./mvnw spring-boot:run -Dspring.profiles.active=prod  # 운영 프로파일
./mvnw test                                     # 전체 테스트
./mvnw test -Dtest=UserServiceTest              # 단일 테스트 클래스
./mvnw test -Dtest=UserServiceTest#methodName   # 단일 테스트 메서드
./mvnw package -DskipTests                      # 빌드만 (테스트 스킵)
```

### 환경변수

프론트엔드 (`/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

백엔드 — Spring 프로파일로 제어 (`dev`/`prod`/`test`). 운영 시 필수:
```
JWT_SECRET=<256bit 이상 문자열>
DB_PATH=/data/linkit.db
UPLOAD_DIR=/data/uploads
CORS_ORIGINS=https://k7788.github.io
```

---

## 아키텍처

### 프론트엔드 구조

**Next.js App Router** + 정적 내보내기(`output: 'export'`). GitHub Pages 배포 경로는 `/LINKIT`(basePath).

```
src/
├── app/                   # Next.js 라우트 정의 (파일 = 페이지)
│   ├── page.jsx           # 스플래시 → /home 또는 /onboarding 리다이렉트
│   ├── (app)/             # 인증 필요 페이지 그룹 (ProtectedLayout 적용)
│   │   ├── layout.jsx     # 인증 체크 + AppLayout 주입
│   │   ├── home/
│   │   ├── clubs/[clubId]/
│   │   ├── community/[postId]/
│   │   └── mypage/
│   ├── onboarding/        # 비인증 접근 가능 (로그인·약관·프로필 설정 4단계)
│   └── admin/             # 관리자 전용
├── views/                 # 페이지 실제 UI 컴포넌트 (app/ 페이지에서 import)
├── components/            # 재사용 UI
│   ├── common/            # Button, Card, Chip, Modal, Toast, FAB 등
│   ├── layout/            # AppLayout, BottomTabBar, Header, AnimatedPage
│   ├── club/              # ClubCard
│   └── community/         # PostCard
├── store/                 # Zustand 전역 상태
│   ├── authStore.js       # 인증·프로필 (persist — localStorage)
│   ├── clubStore.js       # 클럽 목록·필터·멤버 (persist)
│   ├── communityStore.js  # 게시글·댓글
│   ├── notificationStore.js
│   └── followStore.js
├── api/                   # 백엔드 HTTP 클라이언트
│   ├── apiClient.js       # fetch 래퍼, JWT 자동 주입, 오프라인 fallback
│   ├── authApi.js
│   ├── clubApi.js
│   └── ...
├── hooks/                 # 커스텀 훅
│   └── useSseNotifications.js  # SSE 실시간 알림 구독 (지수 백오프 재연결)
├── context/               # React Context
│   ├── ToastContext.jsx
│   └── AppInitProvider.jsx  # 앱 진입 시 프로필·알림·클럽 동기화 (1회)
├── data/sampleData.js     # 백엔드 미연결 시 fallback 목업 데이터
├── styles/
│   ├── variables.css      # 디자인 토큰 (CSS 변수)
│   └── global.css
└── lib/assetPath.js       # GitHub Pages basePath 보정 유틸
```

**핵심 흐름**:
1. 루트 `page.jsx`(스플래시) → 2초 후 인증 여부에 따라 `/home` 또는 `/onboarding`
2. `(app)/layout.jsx` — `isAuthenticated` 검사 → 미인증 시 `/onboarding` 강제 이동
3. `AppLayout` — 하단 탭바 + `useSseNotifications`(실시간 알림) + `useInitialLoad` 마운트

**오프라인 모드**: `apiClient.js`는 `status === 0` 네트워크 오류 시 `ApiError`를 던지고, 각 store 메서드에서 이를 캐치해 `sampleData`로 fallback합니다. 백엔드 없이도 UI 개발 가능합니다.

**정적 파일 경로**: `/public` 이미지를 참조할 때는 반드시 `assetPath('/file.png')`를 사용하세요. `next/image`는 `basePath`를 자동 적용하지 않습니다.

---

### 백엔드 구조

**Spring Boot 도메인 패키지** 방식. 도메인별로 Entity·Repository·Service·Controller·Dto가 한 패키지에 묶입니다.

```
backend/src/main/java/com/linkit/
├── common/
│   ├── ApiResponse.java         # 공통 응답 포맷 { success, message, data }
│   └── GlobalExceptionHandler.java
├── config/
│   ├── SecurityConfig.java      # JWT 필터 체인, CORS, 공개/인증 엔드포인트 분리
│   ├── WebMvcConfig.java        # /uploads/** 정적 서빙
│   └── DataInitializer.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
└── domain/
    ├── user/        # User, UserPii, RefreshToken, RefreshTokenPii, PiiAccessLog
    ├── club/        # Club, ClubMember, ClubBookmark, ClubJoinRequest, ClubPost, ClubPostLike
    ├── post/        # Post, PostLike
    ├── comment/     # Comment, CommentLike
    ├── schedule/    # Schedule, ScheduleAttendee
    ├── follow/      # Follow
    ├── notification/# Notification
    ├── report/      # Report (ReportTargetType, ReportReason, ReportStatus)
    ├── search/      # SearchController
    ├── admin/       # AdminController
    └── upload/      # FileUploadController
```

**인증**: LINKIT은 비밀번호를 저장하지 않습니다. 시온(Zion) 외부 API로 인증 → `POST /api/auth/login` → JWT 발급. 최초 로그인 시 자동 회원가입(`ONBOARDING` 상태) → `POST /api/users/me/onboarding`으로 닉네임 설정 시 `ACTIVE`.

**공통 응답**: 모든 API는 `ApiResponse<T>` 래퍼로 응답합니다. `{ success: true, data: ... }` 또는 `{ success: false, message: "..." }`.

**DB**: SQLite 단일 파일. `dev` 프로파일은 `./linkit-dev.db`, `prod`는 `/data/linkit.db`. `ddl-auto: update`(dev) / `validate`(prod). 테스트는 H2 인메모리 사용.

**개인정보(PII)**: `users` 테이블에 서비스용 평문 저장 + `user_pii` 테이블에 AES-256-GCM 암호화 사본 이중 저장. 고유번호(`handle`)·실명·전화번호·bio·프로필이미지 대상. 자세한 내용은 `docs/DB_SPEC.md` 참조.

**파일 업로드**: `POST /api/upload` → 서버 로컬 `uploads/` 디렉터리 저장, UUID 파일명. 이미지 전용, 5MB 제한.

---

## 디자인 시스템

CSS 변수(`src/styles/variables.css`)로 모든 스타일 토큰을 관리합니다. 컬러는 4색 체계입니다:

- `--blue` `#0088FF` — 주요 액션
- `--pink` `#FF668A` — 에러/강조
- `--mint` `#00C3D0` — 보조 액션
- `--base` `#F1F4F9` — 배경

다크모드는 `html[data-theme='dark']`로 전환. 새 컴포넌트는 항상 의미론적 변수(`--color-primary`, `--bg-card`, `--text-primary` 등)를 사용하세요.

---

## DB 스키마 변경 시

1. `docs/schema_sqlite.sql` 수정
2. `docs/DB_SPEC.md` 업데이트
3. 해당 JPA 엔티티 수정 (`ddl-auto: update`이므로 자동 반영되나, SQLite 컬럼 타입 주의)
