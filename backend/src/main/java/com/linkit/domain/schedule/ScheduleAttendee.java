package com.linkit.domain.schedule;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 일정 참여 신청 엔티티.
 * 클럽 멤버만 신청 가능 — 서비스 레이어에서 club_members 확인 후 INSERT.
 */
@Entity
@Table(name = "schedule_attendees")
@Getter
@NoArgsConstructor @AllArgsConstructor
@IdClass(ScheduleAttendee.ScheduleAttendeeId.class)
public class ScheduleAttendee {

    @Id
    @Column(name = "schedule_id", length = 50, nullable = false)
    private String scheduleId;

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleAttendeeId implements Serializable {
        private String scheduleId;
        private String userId;
    }
}
