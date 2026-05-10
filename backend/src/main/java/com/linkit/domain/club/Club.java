package com.linkit.domain.club;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clubs")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10)
    private String emoji;

    /** 클럽 커버 이미지 URL */
    @Column(length = 500)
    private String coverImage;

    @Column(length = 30)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private int memberCount = 0;

    @Builder.Default
    private boolean isPrivate = false;

    /** 가입 시 질문 (비공개 클럽 전용) */
    @Column(length = 500)
    private String joinQuestion;

    /** 정기 모임 일정 텍스트 (예: "매주 금요일 20:00") */
    @Column(length = 100)
    private String schedule;

    @Column(length = 100)
    private String location;

    /** DRAFT | PENDING | ACTIVE | CLOSED */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 10)
    private ClubStatus status = ClubStatus.PENDING;

    @Column(nullable = false, length = 50)
    private String createdBy;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "club_tags",
            joinColumns = @JoinColumn(name = "club_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
