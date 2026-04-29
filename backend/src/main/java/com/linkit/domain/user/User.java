package com.linkit.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false, unique = true, length = 50)
    private String handle;

    @Column(length = 10)
    private String emoji;

    @Column(length = 200)
    private String bio;

    @Column(nullable = false)
    private String password;

    /** USER | ADMIN */
    @Builder.Default
    @Column(nullable = false, length = 10)
    private String role = "USER";

    /** 가입한 클럽 ID 목록 */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "club_members",
            joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "club_id")
    @Builder.Default
    private Set<String> joinedClubs = new HashSet<>();

    /** 찜한 클럽 ID 목록 */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "club_bookmarks",
            joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "club_id")
    @Builder.Default
    private Set<String> bookmarkedClubs = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
