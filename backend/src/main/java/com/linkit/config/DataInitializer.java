package com.linkit.config;

import com.linkit.domain.club.Club;
import com.linkit.domain.club.ClubMember;
import com.linkit.domain.club.ClubMemberRepository;
import com.linkit.domain.club.ClubMemberRole;
import com.linkit.domain.club.ClubRepository;
import com.linkit.domain.club.ClubStatus;
import com.linkit.domain.comment.Comment;
import com.linkit.domain.comment.CommentRepository;
import com.linkit.domain.notification.Notification;
import com.linkit.domain.notification.NotificationRepository;
import com.linkit.domain.post.Post;
import com.linkit.domain.post.PostRepository;
import com.linkit.domain.schedule.Schedule;
import com.linkit.domain.schedule.ScheduleRepository;
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

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ScheduleRepository scheduleRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedClubs();
        seedPosts();
        seedSchedules();
        seedNotifications();

        log.info("========================================");
        log.info("LINKIT dev server ready");
        log.info("  users: {}", userRepository.count());
        log.info("  clubs: {}", clubRepository.count());
        log.info("  posts: {}", postRepository.count());
        log.info("  demo login handles: 00000000-00000, 20240001-00099");
        log.info("========================================");
    }

    private void seedUsers() {
        saveUser("admin", "00000000-00000", "관리자", "LINKIT 관리자", UserRole.ADMIN);
        saveUser("user-me", "20240001-00099", "링킷유저", "소모임을 사랑하는 사람", UserRole.USER);
        saveUser("user-1", "20240001-00001", "러닝장", "매주 달리는 러닝 크루장", UserRole.USER);
        saveUser("user-2", "20240001-00002", "피자러버", "맛집 탐방 전문가", UserRole.USER);
        saveUser("user-3", "20240001-00003", "필름감성", "필름 사진 모임장", UserRole.USER);
        saveUser("user-4", "20240001-00004", "밴드마스터", "홍대 밴드 클럽장", UserRole.USER);
        saveUser("user-5", "20240001-00005", "독서왕", "한 달에 한 권 독서모임", UserRole.USER);
        saveUser("user-6", "20240001-00006", "풋살왕", "주말 풋살 크루장", UserRole.USER);
    }

    private void saveUser(String id, String handle, String nickname, String bio, UserRole role) {
        userRepository.findByHandle(handle).ifPresentOrElse((user) -> {
            if (user.getNickname() == null || user.getNickname().isBlank()) user.setNickname(nickname);
            if (user.getBio() == null || user.getBio().isBlank()) user.setBio(bio);
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
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
                .build());
        });
    }

    private String demoUserId() {
        return userRepository.findByHandle("20240001-00099")
            .map(User::getId)
            .orElse("user-me");
    }

    private void seedClubs() {
        String demoUserId = demoUserId();
        if (clubRepository.count() > 0) {
            clubRepository.findAll().forEach((club) -> saveMember(club.getId(), demoUserId, ClubMemberRole.MEMBER));
            return;
        }
        List<Club> clubs = List.of(
            club("club-1", "러닝 크루", "운동", "매주 금요일 함께 달리는 러닝 모임입니다.", 156, 8, false, "매주 금요일 20:00", "여의도 한강공원", "user-1", List.of("운동", "러닝", "여의도")),
            club("club-2", "맛집 탐방대", "맛집", "동네 숨은 맛집을 함께 찾아가는 모임입니다.", 89, 3, false, "매주 토요일 12:00", "서울 전역", "user-2", List.of("맛집", "탐방", "서울")),
            club("club-3", "감성 사진 모임", "사진", "필름 감성과 산책을 좋아하는 사람들의 출사 모임입니다.", 43, 2, false, "매월 둘째 주 일요일", "성수동", "user-3", List.of("사진", "필름", "성수동")),
            club("club-4", "밴드 클럽", "음악", "악기 연주와 합주를 즐기는 음악 모임입니다.", 98, 6, true, "매주 수요일 19:00", "홍대", "user-4", List.of("음악", "밴드", "홍대")),
            club("club-5", "책 읽는 모임", "독서", "한 달에 한 권을 함께 읽고 이야기하는 독서 모임입니다.", 67, 4, false, "매월 마지막 주 토요일", "강남", "user-5", List.of("독서", "책", "강남")),
            club("club-6", "풋살 크루", "운동", "실력 불문! 즐겁게 땀 흘리는 풋살 모임입니다.", 312, 12, false, "매주 일요일 15:00", "오치동 풋살장", "user-6", List.of("운동", "풋살", "오치동"))
        );
        clubRepository.saveAll(clubs);
        clubs.forEach((club) -> {
            saveMember(club.getId(), club.getCreatedBy(), ClubMemberRole.OWNER);
            saveMember(club.getId(), demoUserId, ClubMemberRole.MEMBER);
        });
    }

    private Club club(String id, String name, String category, String description, int memberCount, int newCount,
                      boolean isPrivate, String schedule, String location, String owner, List<String> tags) {
        return Club.builder()
            .id(id)
            .name(name)
            .category(category)
            .description(description)
            .memberCount(memberCount)
            .newCount(newCount)
            .isPrivate(isPrivate)
            .joinQuestion(isPrivate ? "가입 이유를 알려주세요." : null)
            .schedule(schedule)
            .location(location)
            .status(ClubStatus.ACTIVE)
            .createdBy(owner)
            .tags(tags)
            .build();
    }

    private void saveMember(String clubId, String userId, ClubMemberRole role) {
        if (clubMemberRepository.existsByClubIdAndUserId(clubId, userId)) return;
        clubMemberRepository.save(ClubMember.builder()
            .clubId(clubId)
            .userId(userId)
            .role(role)
            .build());
    }

    private void seedPosts() {
        savePostIfMissing(post("post-1", "일상", "같이 꽃 보러 가실분!!!", "이번 주말 여의도 벚꽃 축제 같이 가실 분 계신가요? 토요일 오후 2시에 모여서 산책하면 좋을 것 같아요 :)", "여의도", demoUserId(), 3, 4, 46));
        savePostIfMissing(post("post-2", "모임", "이번 주 풋살 같이 하실 분!", "이번 일요일 오후 3시 오치동 풋살장에서 진행합니다. 자리 2~3명 남았어요!", "오치동", "user-6", 8, 6, 89));
        savePostIfMissing(post("post-3", "질문", "교회 근처 맛집 추천해주세요", "모임 후 다같이 저녁 먹으려고 하는데 근처 맛집 추천 부탁드려요!", null, "user-2", 5, 3, 67));
        if (commentRepository.countByPostId("post-1") == 0) {
            commentRepository.saveAll(List.of(
                comment("c-1", "post-1", "저도 가고 싶어요!!", "user-1"),
                comment("c-2", "post-1", "몇 명이나 모였나요?", "user-2"),
                comment("c-3", "post-1", "저 갈게요.", "user-3"),
                comment("c-4", "post-1", "토요일 오후 2시 맞죠?", "user-6")
            ));
        }
    }

    private void savePostIfMissing(Post post) {
        if (!postRepository.existsById(post.getId())) {
            postRepository.save(post);
        }
    }

    private Post post(String id, String category, String title, String content, String location,
                      String authorId, int likes, int comments, int views) {
        return Post.builder()
            .id(id)
            .category(category)
            .title(title)
            .content(content)
            .location(location)
            .authorId(authorId)
            .likeCount(likes)
            .commentCount(comments)
            .viewCount(views)
            .build();
    }

    private Comment comment(String id, String postId, String content, String authorId) {
        return Comment.builder()
            .id(id)
            .postId(postId)
            .content(content)
            .authorId(authorId)
            .build();
    }

    private void seedSchedules() {
        if (scheduleRepository.count() > 0) return;
        scheduleRepository.saveAll(List.of(
            schedule("sch-1", "club-1", "러닝 크루 정기 모임", LocalDateTime.now().plusDays(3), "여의도 한강공원", "user-1"),
            schedule("sch-2", "club-6", "주말 정기 풋살 모임", LocalDateTime.now().plusDays(4), "오치동 풋살장", "user-6"),
            schedule("sch-3", "club-3", "성수동 출사", LocalDateTime.now().plusDays(8), "성수동 카페거리", "user-3")
        ));
    }

    private Schedule schedule(String id, String clubId, String title, LocalDateTime time, String location, String owner) {
        return Schedule.builder()
            .id(id)
            .clubId(clubId)
            .title(title)
            .description("LINKIT 데모 일정입니다.")
            .scheduledAt(time)
            .location(location)
            .createdBy(owner)
            .build();
    }

    private void seedNotifications() {
        String demoUserId = demoUserId();
        if (notificationRepository.countByUserIdAndIsReadFalse(demoUserId) > 0) return;
        saveNotificationIfMissing(notification("noti-demo-1", demoUserId, "comment", "새 댓글", "게시글에 새 댓글이 달렸습니다.", "/community/post-1"));
        saveNotificationIfMissing(notification("noti-demo-2", demoUserId, "club", "모임 일정", "풋살 크루 정기 모임이 곧 시작됩니다.", "/clubs/club-6"));
    }

    private void saveNotificationIfMissing(Notification notification) {
        if (!notificationRepository.existsById(notification.getId())) {
            notificationRepository.save(notification);
        }
    }

    private Notification notification(String id, String userId, String type, String title, String body, String path) {
        return Notification.builder()
            .id(id)
            .userId(userId)
            .type(type)
            .icon(type.equals("club") ? "👥" : "💬")
            .title(title)
            .body(body)
            .path(path)
            .build();
    }
}
