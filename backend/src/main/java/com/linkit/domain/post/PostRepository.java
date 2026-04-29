package com.linkit.domain.post;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByCategoryOrderByCreatedAtDesc(String category);
    List<Post> findByAuthorIdOrderByCreatedAtDesc(String authorId);
    List<Post> findAllByOrderByLikeCountDesc();
}
