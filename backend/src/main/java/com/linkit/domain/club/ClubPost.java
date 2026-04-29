package com.linkit.domain.club;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "club_posts")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubPost {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String clubId;

    @Column(length = 30)
    private String category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String authorId;

    @Builder.Default private int likeCount    = 0;
    @Builder.Default private int commentCount = 0;
    @Builder.Default private int viewCount    = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
