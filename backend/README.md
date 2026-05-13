# LINKIT Backend

Spring Boot 3.2 + JWT based REST API server.

## Stack

| Area | Technology |
|------|------------|
| Language | Java 17 |
| Framework | Spring Boot 3.2 |
| DB | SQLite |
| ORM | Spring Data JPA / Hibernate |
| Auth | Spring Security + JWT (JJWT 0.12) |
| Build | Maven |

## Quick Start

```bash
cd backend

# macOS/Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

Server: `http://localhost:8080`

Default development DB file: `backend/linkit-dev.db`

You can override the DB path:

```bash
DB_PATH=./linkit-dev.db ./mvnw spring-boot:run
```

## API Summary

Authenticated endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login and issue JWT |

### Users

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/me` | Update current user profile |
| GET | `/api/users/{id}` | User profile |

### Clubs

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/clubs` | Club list |
| GET | `/api/clubs/{id}` | Club detail |
| POST | `/api/clubs` | Create club |
| PUT | `/api/clubs/{id}` | Update club |
| DELETE | `/api/clubs/{id}` | Delete club |
| POST | `/api/clubs/{id}/join` | Join/apply to club |
| DELETE | `/api/clubs/{id}/join` | Leave/cancel club |
| POST | `/api/clubs/{id}/bookmark` | Toggle bookmark |

### Club Posts

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/clubs/{id}/posts` | Club post list |
| POST | `/api/clubs/{id}/posts` | Create club post |
| DELETE | `/api/clubs/{id}/posts/{postId}` | Delete club post |

### Schedules

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/schedules/me` | My schedules |
| GET | `/api/clubs/{id}/schedules` | Club schedules |
| POST | `/api/schedules` | Create schedule |
| DELETE | `/api/schedules/{id}` | Delete schedule |

### Community Posts

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/posts` | Post list |
| GET | `/api/posts/{id}` | Post detail |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/{id}` | Update post |
| DELETE | `/api/posts/{id}` | Delete post |
| POST | `/api/posts/{id}/like` | Toggle like |
| GET | `/api/posts/me` | My posts |

### Comments

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/posts/{id}/comments` | Comment list |
| POST | `/api/posts/{id}/comments` | Create comment |
| DELETE | `/api/comments/{id}` | Delete comment |

### Notifications

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/notifications` | Notification list |
| GET | `/api/notifications/unread-count` | Unread count |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

## SQLite Profiles

Development uses SQLite by default:

```yaml
spring.datasource.url: jdbc:sqlite:${DB_PATH:./linkit-dev.db}
```

Production also uses SQLite and reads `DB_PATH`:

```bash
set SPRING_PROFILES_ACTIVE=prod
set DB_PATH=C:\data\linkit.db
set JWT_SECRET=256bit_or_longer_secret
set CORS_ORIGINS=http://localhost:3000,https://k7788.github.io
```

The test profile also uses SQLite and defaults to `backend/linkit-test.db`.
