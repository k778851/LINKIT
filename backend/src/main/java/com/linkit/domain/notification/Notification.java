package com.linkit.domain.notification;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String userId;

    /** like / comment / club */
    @Column(length = 20)
    private String type;

    @Column(length = 10)
    private String icon;

    @Column(length = 100)
    private String title;

    @Column(length = 200)
    private String body;

    /** 클릭 시 이동할 경로 */
    @Column(length = 200)
    private String path;

    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
