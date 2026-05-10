package com.linkit.domain.comment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentLikeRepository extends JpaRepository<CommentLike, CommentLike.CommentLikeId> {

    boolean existsByCommentIdAndUserId(String commentId, String userId);

    void deleteByCommentIdAndUserId(String commentId, String userId);

    long countByCommentId(String commentId);
}
