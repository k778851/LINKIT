package com.linkit.domain.notification;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class NotificationDto {

    @Getter @Builder
    public static class Response {
        private String id;
        private String type;
        private String icon;
        private String title;
        private String body;
        private String path;
        private boolean isRead;
        private LocalDateTime createdAt;

        public static Response from(Notification n) {
            return Response.builder()
                    .id(n.getId())
                    .type(n.getType())
                    .icon(n.getIcon())
                    .title(n.getTitle())
                    .body(n.getBody())
                    .path(n.getPath())
                    .isRead(n.isRead())
                    .createdAt(n.getCreatedAt())
                    .build();
        }
    }

    @Getter @Builder
    public static class UnreadCountResponse {
        private long count;
    }
}
