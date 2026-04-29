package com.linkit.domain.admin;

import com.linkit.common.ApiResponse;
import com.linkit.domain.club.Club;
import com.linkit.domain.club.ClubDto;
import com.linkit.domain.club.ClubRepository;
import com.linkit.domain.comment.CommentRepository;
import com.linkit.domain.post.Post;
import com.linkit.domain.post.PostDto;
import com.linkit.domain.post.PostRepository;
import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository    userRepository;
    private final ClubRepository    clubRepository;
    private final PostRepository    postRepository;
    private final CommentRepository commentRepository;

    /* ── 대시보드 통계 ─────────────────────────────────── */

    @GetMapping("/stats")
    public ApiResponse<StatsResponse> stats() {
        long users  = userRepository.count();
        long clubs  = clubRepository.count();
        long posts  = postRepository.count();
        long comments = commentRepository.count();

        // 최근 5개 게시글
        List<PostSummary> recentPosts = postRepository.findAllByOrderByCreatedAtDesc()
                .stream().limit(5).map(PostSummary::from).toList();

        // 최근 5명 유저
        List<UserSummary> recentUsers = userRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5).map(UserSummary::from).toList();

        return ApiResponse.ok(StatsResponse.builder()
                .totalUsers(users).totalClubs(clubs)
                .totalPosts(posts).totalComments(comments)
                .recentPosts(recentPosts).recentUsers(recentUsers)
                .build());
    }

    /* ── 유저 관리 ─────────────────────────────────────── */

    @GetMapping("/users")
    public ApiResponse<List<UserSummary>> users(
            @RequestParam(defaultValue = "") String q) {
        String keyword = q.trim().toLowerCase();
        return ApiResponse.ok(
                userRepository.findAll().stream()
                        .filter(u -> keyword.isEmpty()
                                || u.getNickname().toLowerCase().contains(keyword)
                                || u.getHandle().toLowerCase().contains(keyword))
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .map(UserSummary::from)
                        .toList()
        );
    }

    @DeleteMapping("/users/{userId}")
    @Transactional
    public ApiResponse<Void> deleteUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));
        if ("ADMIN".equals(user.getRole()))
            throw new IllegalArgumentException("관리자 계정은 삭제할 수 없습니다.");
        userRepository.delete(user);
        return ApiResponse.ok("유저를 삭제했어요.");
    }

    /* ── 클럽 관리 ─────────────────────────────────────── */

    @GetMapping("/clubs")
    public ApiResponse<List<ClubDto.Response>> clubs(
            @RequestParam(defaultValue = "") String q) {
        String keyword = q.trim().toLowerCase();
        return ApiResponse.ok(
                clubRepository.findAll().stream()
                        .filter(c -> keyword.isEmpty()
                                || c.getName().toLowerCase().contains(keyword)
                                || c.getCategory().toLowerCase().contains(keyword))
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .map(ClubDto.Response::from)
                        .toList()
        );
    }

    @DeleteMapping("/clubs/{clubId}")
    @Transactional
    public ApiResponse<Void> deleteClub(@PathVariable String clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("클럽을 찾을 수 없습니다."));
        clubRepository.delete(club);
        return ApiResponse.ok("클럽을 삭제했어요.");
    }

    /* ── 게시글 관리 ───────────────────────────────────── */

    @GetMapping("/posts")
    public ApiResponse<List<PostSummary>> posts(
            @RequestParam(defaultValue = "") String q) {
        String keyword = q.trim().toLowerCase();
        return ApiResponse.ok(
                postRepository.findAllByOrderByCreatedAtDesc().stream()
                        .filter(p -> keyword.isEmpty()
                                || p.getTitle().toLowerCase().contains(keyword)
                                || p.getContent().toLowerCase().contains(keyword))
                        .map(PostSummary::from)
                        .toList()
        );
    }

    @DeleteMapping("/posts/{postId}")
    @Transactional
    public ApiResponse<Void> deletePost(@PathVariable String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
        return ApiResponse.ok("게시글을 삭제했어요.");
    }

    /* ── 내부 DTO ──────────────────────────────────────── */

    @Getter @Builder
    public static class StatsResponse {
        private long totalUsers, totalClubs, totalPosts, totalComments;
        private List<PostSummary> recentPosts;
        private List<UserSummary> recentUsers;
    }

    @Getter @Builder
    public static class UserSummary {
        private String id, nickname, handle, emoji, role;
        private int joinedClubsCount;
        private LocalDateTime createdAt;

        static UserSummary from(User u) {
            return UserSummary.builder()
                    .id(u.getId()).nickname(u.getNickname()).handle(u.getHandle())
                    .emoji(u.getEmoji()).role(u.getRole())
                    .joinedClubsCount(u.getJoinedClubs().size())
                    .createdAt(u.getCreatedAt()).build();
        }
    }

    @Getter @Builder
    public static class PostSummary {
        private String id, category, title, authorId;
        private int likeCount, commentCount, viewCount;
        private LocalDateTime createdAt;

        static PostSummary from(Post p) {
            return PostSummary.builder()
                    .id(p.getId()).category(p.getCategory()).title(p.getTitle())
                    .authorId(p.getAuthorId()).likeCount(p.getLikeCount())
                    .commentCount(p.getCommentCount()).viewCount(p.getViewCount())
                    .createdAt(p.getCreatedAt()).build();
        }
    }
}
