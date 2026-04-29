package com.linkit.domain.search;

import com.linkit.common.ApiResponse;
import com.linkit.domain.club.Club;
import com.linkit.domain.club.ClubDto;
import com.linkit.domain.club.ClubRepository;
import com.linkit.domain.post.Post;
import com.linkit.domain.post.PostDto;
import com.linkit.domain.post.PostRepository;
import com.linkit.domain.post.PostLikeRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ClubRepository    clubRepository;
    private final PostRepository    postRepository;
    private final PostLikeRepository likeRepository;

    @GetMapping
    public ApiResponse<SearchResult> search(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails principal) {

        if (q == null || q.isBlank()) {
            return ApiResponse.ok(SearchResult.empty());
        }

        String keyword = q.trim().toLowerCase();
        String userId  = principal != null ? principal.getUsername() : null;

        // 클럽 검색 — 이름·카테고리·태그
        List<ClubDto.Response> clubs = clubRepository.findAll().stream()
                .filter(c ->
                    c.getName().toLowerCase().contains(keyword) ||
                    (c.getCategory() != null && c.getCategory().toLowerCase().contains(keyword)) ||
                    c.getTags().stream().anyMatch(t -> t.toLowerCase().contains(keyword))
                )
                .map(ClubDto.Response::from)
                .toList();

        // 게시글 검색 — 제목·내용·카테고리
        List<PostDto.Response> posts = postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p ->
                    p.getTitle().toLowerCase().contains(keyword) ||
                    p.getContent().toLowerCase().contains(keyword) ||
                    (p.getCategory() != null && p.getCategory().toLowerCase().contains(keyword))
                )
                .map(p -> PostDto.Response.from(p,
                        userId != null && likeRepository.existsByPostIdAndUserId(p.getId(), userId)))
                .toList();

        return ApiResponse.ok(SearchResult.of(clubs, posts));
    }

    @Getter @Builder
    public static class SearchResult {
        private List<ClubDto.Response> clubs;
        private List<PostDto.Response> posts;
        private int total;

        static SearchResult empty() {
            return SearchResult.builder().clubs(List.of()).posts(List.of()).total(0).build();
        }

        static SearchResult of(List<ClubDto.Response> clubs, List<PostDto.Response> posts) {
            return SearchResult.builder()
                    .clubs(clubs).posts(posts)
                    .total(clubs.size() + posts.size())
                    .build();
        }
    }
}
