package com.linkit.domain.follow;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "follows",
    uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 팔로우를 거는 사람 */
    @Column(name = "follower_id", nullable = false, length = 50)
    private String followerId;

    /** 팔로우 당하는 사람 */
    @Column(name = "following_id", nullable = false, length = 50)
    private String followingId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
