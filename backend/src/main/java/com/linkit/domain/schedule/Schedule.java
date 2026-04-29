package com.linkit.domain.schedule;

import jakarta.persistence.*;
import lombok.*;

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

    /** 모임 시각 텍스트 (예: "20:00") */
    @Column(length = 20)
    private String time;

    /** 실제 시작 일시 */
    private LocalDateTime startAt;

    @Column(length = 100)
    private String location;
}
