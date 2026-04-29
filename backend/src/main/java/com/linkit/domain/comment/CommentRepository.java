package com.linkit.domain.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);
    void deleteByPostId(String postId);
    long countByPostId(String postId);
}
