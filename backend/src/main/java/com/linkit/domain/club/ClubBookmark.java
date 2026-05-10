package com.linkit.domain.club;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 클럽 찜(북마크) 엔티티.
 * User.bookmarkedClubs @ElementCollection 을 대체합니다.
 */
@Entity
@Table(name = "club_bookmarks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(ClubBookmark.ClubBookmarkId.class)
public class ClubBookmark {

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @Id
    @Column(name = "club_id", length = 50, nullable = false)
    private String clubId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClubBookmarkId implements Serializable {
        private String userId;
        private String clubId;
    }
}
