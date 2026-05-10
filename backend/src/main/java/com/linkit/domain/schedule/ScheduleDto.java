package com.linkit.domain.schedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

public class ScheduleDto {

    @Getter
    public static class CreateRequest {
        @NotBlank private String clubId;
        @NotBlank private String title;
        private String description;
        @NotNull  private LocalDateTime scheduledAt;
        private String location;
    }

    @Getter @Builder
    public static class Response {
        private String id;
        private String clubId;
        private String clubName;
        private String clubEmoji;
        private String title;
        private String description;
        private LocalDateTime scheduledAt;
        private String location;
        private LocalDateTime createdAt;
        private long dday;   // 양수 = 미래, 0 = 오늘, 음수 = 과거

        public static Response from(Schedule s, String clubName, String clubEmoji) {
            long dday = ChronoUnit.DAYS.between(
                    LocalDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDate(),
                    s.getScheduledAt().toLocalDate()
            );
            return Response.builder()
                    .id(s.getId())
                    .clubId(s.getClubId())
                    .clubName(clubName)
                    .clubEmoji(clubEmoji)
                    .title(s.getTitle())
                    .description(s.getDescription())
                    .scheduledAt(s.getScheduledAt())
                    .location(s.getLocation())
                    .createdAt(s.getCreatedAt())
                    .dday(dday)
                    .build();
        }
    }
}
