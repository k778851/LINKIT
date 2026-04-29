# LINKIT Backend

Spring Boot 3.2 + JWT 기반 REST API 서버

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | Java 17 |
| Framework | Spring Boot 3.2 |
| DB (개발) | H2 In-Memory |
| DB (운영) | MySQL 8+ |
| ORM | Spring Data JPA / Hibernate |
| 인증 | Spring Security + JWT (JJWT 0.12) |
| Build | Maven |

## 빠른 시작

```bash
# 1. 프로젝트 루트 (backend/) 이동
cd backend

# 2. 빌드 + 실행 (H2 개발 모드)
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

서버: `http://localhost:8080`  
H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:linkitdb`)

## API 목록

### 인증
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 → JWT 발급 |

### 유저
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/users/me` | 내 프로필 조회 🔒 |
| PUT | `/api/users/me` | 내 프로필 수정 🔒 |
| GET | `/api/users/{id}` | 특정 유저 조회 |

### 클럽
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/clubs?category=전체&sort=최신순` | 클럽 목록 |
| GET | `/api/clubs/{id}` | 클럽 상세 |
| POST | `/api/clubs` | 클럽 생성 🔒 |
| PUT | `/api/clubs/{id}` | 클럽 수정 🔒 (클럽장) |
| DELETE | `/api/clubs/{id}` | 클럽 삭제 🔒 (클럽장) |
| POST | `/api/clubs/{id}/join` | 모임 신청 🔒 |
| DELETE | `/api/clubs/{id}/join` | 참여 취소 🔒 |
| POST | `/api/clubs/{id}/bookmark` | 찜 토글 🔒 |

### 클럽 게시판
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/clubs/{id}/posts` | 클럽 게시글 목록 |
| POST | `/api/clubs/{id}/posts` | 게시글 작성 🔒 |
| DELETE | `/api/clubs/{id}/posts/{postId}` | 게시글 삭제 🔒 |

### 일정
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/schedules/me` | 내 일정 (가입 클럽) 🔒 |
| GET | `/api/clubs/{id}/schedules` | 클럽 일정 목록 |
| POST | `/api/schedules` | 일정 등록 🔒 (클럽장) |
| DELETE | `/api/schedules/{id}` | 일정 삭제 🔒 (클럽장) |

### 커뮤니티 게시글
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/posts?category=전체` | 게시글 목록 |
| GET | `/api/posts/{id}` | 게시글 상세 (조회수 +1) |
| POST | `/api/posts` | 게시글 작성 🔒 |
| PUT | `/api/posts/{id}` | 게시글 수정 🔒 (작성자) |
| DELETE | `/api/posts/{id}` | 게시글 삭제 🔒 (작성자) |
| POST | `/api/posts/{id}/like` | 좋아요 토글 🔒 |
| GET | `/api/posts/me` | 내 게시글 목록 🔒 |

### 댓글
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/posts/{id}/comments` | 댓글 목록 |
| POST | `/api/posts/{id}/comments` | 댓글 등록 🔒 |
| DELETE | `/api/comments/{id}` | 댓글 삭제 🔒 (작성자) |

### 알림
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/notifications` | 내 알림 목록 🔒 |
| GET | `/api/notifications/unread-count` | 미읽음 수 🔒 |
| PATCH | `/api/notifications/{id}/read` | 단건 읽음 처리 🔒 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 처리 🔒 |

> 🔒 = `Authorization: Bearer <token>` 헤더 필요

## 인증 사용 예시

```bash
# 1. 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"handle":"linkit_user","password":"password123"}'

# 2. 토큰으로 요청
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <위에서_받은_토큰>"
```

## 운영 환경 (MySQL) 전환

`application.yml`의 active profile을 `prod`로 변경하거나 환경변수 설정:

```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=localhost
export DB_NAME=linkitdb
export DB_USER=linkit
export DB_PASSWORD=비밀번호
export JWT_SECRET=256비트_이상_시크릿키
```
