package com.linkit.domain.club;

import com.linkit.common.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clubs/{clubId}/posts")
@RequiredArgsConstructor
public class ClubPostController {

    private final ClubPostRepository clubPostRepository;
    private final ClubRepository     clubRepository;

    @GetMapping
    public ApiResponse<List<ClubPostDto.Response>> list(@PathVariable String clubId) {
        return ApiResponse.ok(
                clubPostRepository.findByClubIdOrderByCreatedAtDesc(clubId)
                        .stream().map(ClubPostDto.Response::from).toList()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ApiResponse<ClubPostDto.Response> create(
            @PathVariable String clubId,
            @RequestBody @Valid ClubPostDto.CreateRequest req,
            @AuthenticationPrincipal UserDetails principal) {

        // 클럽 멤버인지 확인 — 실 서비스에서는 club_members 테이블 조회
        clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("클럽을 찾을 수 없습니다."));

        ClubPost post = ClubPost.builder()
                .id("cp-" + UUID.randomUUID().toString().substring(0, 8))
                .clubId(clubId)
                .category(req.getCategory())
                .title(req.getTitle())
                .content(req.getContent())
                .authorId(principal.getUsername())
                .build();
        return ApiResponse.ok("게시글을 등록했어요.", ClubPostDto.Response.from(clubPostRepository.save(post)));
    }

    @DeleteMapping("/{postId}")
    @Transactional
    public ApiResponse<Void> delete(
            @PathVariable String clubId,
            @PathVariable String postId,
            @AuthenticationPrincipal UserDetails principal) {

        ClubPost post = clubPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));

        Club club = clubRepository.findById(clubId).orElseThrow();
        boolean isAuthor  = post.getAuthorId().equals(principal.getUsername());
        boolean isCreator = club.getCreatedBy().equals(principal.getUsername());
        if (!isAuthor && !isCreator) throw new AccessDeniedException("삭제 권한이 없습니다.");

        clubPostRepository.delete(post);
        return ApiResponse.ok("게시글을 삭제했어요.");
    }
}
