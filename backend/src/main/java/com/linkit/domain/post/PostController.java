package com.linkit.domain.post;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ApiResponse<List<PostDto.Response>> list(
            @RequestParam(defaultValue = "전체") String category,
            @AuthenticationPrincipal UserDetails principal) {
        String userId = principal != null ? principal.getUsername() : null;
        return ApiResponse.ok(postService.getPosts(category, userId));
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostDto.Response> get(
            @PathVariable String postId,
            @AuthenticationPrincipal UserDetails principal) {
        String userId = principal != null ? principal.getUsername() : null;
        postService.incrementView(postId);
        return ApiResponse.ok(postService.getPost(postId, userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostDto.Response> create(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid PostDto.CreateRequest req) {
        return ApiResponse.ok("게시글을 등록했어요.", postService.createPost(req, principal.getUsername()));
    }

    @PutMapping("/{postId}")
    public ApiResponse<PostDto.Response> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String postId,
            @RequestBody @Valid PostDto.UpdateRequest req) {
        return ApiResponse.ok(postService.updatePost(postId, req, principal.getUsername()));
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String postId) {
        postService.deletePost(postId, principal.getUsername());
        return ApiResponse.ok("게시글을 삭제했어요.");
    }

    @PostMapping("/{postId}/like")
    public ApiResponse<Void> like(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String postId) {
        boolean liked = postService.toggleLike(postId, principal.getUsername());
        return ApiResponse.ok(liked ? "좋아요를 눌렀어요 ❤️" : "좋아요를 취소했어요");
    }

    @GetMapping("/me")
    public ApiResponse<List<PostDto.Response>> myPosts(
            @AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok(postService.getMyPosts(principal.getUsername()));
    }
}
