package com.linkit.domain.schedule;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String clubId;

    /** 일정 제목 */
    @Column(nullable = false, length = 100)
    private String title;

    /** 일정 상세 설명 */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** 모임 시작 일시 */
    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(length = 200)
    private String location;

    /** 일정을 생성한 유저 ID */
    @Column(nullable = false, length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
