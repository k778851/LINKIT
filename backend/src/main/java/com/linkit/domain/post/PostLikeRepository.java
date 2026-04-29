package com.linkit.domain.post;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.io.Serializable;

/* ── 좋아요 엔티티 ─────────────────────────────────────── */

@Entity
@Table(name = "post_likes")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(PostLikeRepository.PostLikeId.class)
class PostLike {
    @Id @Column(length = 50) private String postId;
    @Id @Column(length = 50) private String userId;
}

/* ── 레포지토리 ─────────────────────────────────────────── */

interface PostLikeRepository extends JpaRepository<PostLike, PostLikeRepository.PostLikeId> {
    boolean existsByPostIdAndUserId(String postId, String userId);
    void deleteByPostIdAndUserId(String postId, String userId);

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    class PostLikeId implements Serializable {
        private String postId;
        private String userId;
    }
}
