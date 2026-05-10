package com.linkit.domain.comment;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment_likes")
@Getter
@NoArgsConstructor @AllArgsConstructor
@IdClass(CommentLike.CommentLikeId.class)
public class CommentLike {

    @Id
    @Column(name = "comment_id", length = 50, nullable = false)
    private String commentId;

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentLikeId implements Serializable {
        private String commentId;
        private String userId;
    }
}
