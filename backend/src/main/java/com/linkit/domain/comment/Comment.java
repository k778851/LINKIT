package com.linkit.domain.comment;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String postId;

    /** 대댓글의 경우 부모 댓글 ID, 최상위 댓글은 NULL */
    @Column(length = 50)
    private String parentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String authorId;

    @Builder.Default
    private int likeCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
