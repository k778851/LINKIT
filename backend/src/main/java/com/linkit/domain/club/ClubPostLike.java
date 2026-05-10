package com.linkit.domain.club;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "club_post_likes")
@Getter
@NoArgsConstructor @AllArgsConstructor
@IdClass(ClubPostLike.ClubPostLikeId.class)
public class ClubPostLike {

    @Id
    @Column(name = "club_post_id", length = 50, nullable = false)
    private String clubPostId;

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClubPostLikeId implements Serializable {
        private String clubPostId;
        private String userId;
    }
}
