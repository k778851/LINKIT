package com.linkit.domain.comment;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /** 커뮤니티 게시글 댓글 목록 */
    @GetMapping("/api/posts/{postId}/comments")
    public ApiResponse<List<CommentDto.Response>> list(@PathVariable String postId) {
        return ApiResponse.ok(commentService.getComments(postId));
    }

    /** 커뮤니티 게시글 댓글 등록 */
    @PostMapping("/api/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommentDto.Response> create(
            @PathVariable String postId,
            @RequestBody @Valid CommentDto.CreateRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok("댓글을 등록했어요.", commentService.addComment(postId, req, principal.getUsername()));
    }

    /** 댓글 삭제 */
    @DeleteMapping("/api/comments/{commentId}")
    public ApiResponse<Void> delete(
            @PathVariable String commentId,
            @AuthenticationPrincipal UserDetails principal) {
        commentService.deleteComment(commentId, principal.getUsername());
        return ApiResponse.ok("댓글을 삭제했어요.");
    }
}
