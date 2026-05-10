package com.linkit.domain.comment;

import com.linkit.domain.notification.NotificationService;
import com.linkit.domain.post.Post;
import com.linkit.domain.post.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository   commentRepository;
    private final PostRepository      postRepository;
    private final NotificationService notificationService;

    public List<CommentDto.Response> getComments(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentDto.Response::from)
                .toList();
    }

    @Transactional
    public CommentDto.Response addComment(String postId, CommentDto.CreateRequest req, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));

        Comment comment = Comment.builder()
                .id("c-" + UUID.randomUUID().toString().substring(0, 8))
                .postId(postId)
                .content(req.getContent())
                .authorId(userId)
                .build();

        post.setCommentCount(post.getCommentCount() + 1);
        CommentDto.Response saved = CommentDto.Response.from(commentRepository.save(comment));

        // 게시글 작성자에게 댓글 알림 전송 (본인 댓글 제외)
        if (!post.getAuthorId().equals(userId)) {
            notificationService.send(
                    post.getAuthorId(),
                    "comment",
                    "💬",
                    "내 게시글에 댓글이 달렸어요",
                    req.getContent().length() > 50
                            ? req.getContent().substring(0, 50) + "…"
                            : req.getContent(),
                    "/community/" + postId
            );
        }

        return saved;
    }

    @Transactional
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다."));
        if (!comment.getAuthorId().equals(userId))
            throw new org.springframework.security.access.AccessDeniedException("댓글 삭제 권한이 없습니다.");

        // commentCount 감소
        postRepository.findById(comment.getPostId()).ifPresent(p ->
                p.setCommentCount(Math.max(0, p.getCommentCount() - 1)));

        commentRepository.delete(comment);
    }
}
