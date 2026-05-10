package com.linkit.domain.club;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 클럽 멤버십 엔티티.
 * User.joinedClubs @ElementCollection 을 대체하여
 * role / joinedAt 등 추가 정보를 관리합니다.
 */
@Entity
@Table(name = "club_members")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(ClubMember.ClubMemberId.class)
public class ClubMember {

    @Id
    @Column(name = "club_id", length = 50, nullable = false)
    private String clubId;

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    /** OWNER | ADMIN | MEMBER */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 10)
    private ClubMemberRole role = ClubMemberRole.MEMBER;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    /* ── 복합 PK 클래스 ──────────────────────────────────── */
    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClubMemberId implements Serializable {
        private String clubId;
        private String userId;
    }
}
