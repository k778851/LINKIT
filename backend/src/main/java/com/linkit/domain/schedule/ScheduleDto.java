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
        private String time;
        @NotNull  private LocalDateTime startAt;
        private String location;
    }

    @Getter @Builder
    public static class Response {
        private String id;
        private String clubId;
        private String clubName;
        private String clubEmoji;
        private String time;
        private LocalDateTime startAt;
        private String location;
        private long dday;          // 양수 = 미래, 0 = 오늘, 음수 = 과거

        public static Response from(Schedule s, String clubName, String clubEmoji) {
            long dday = ChronoUnit.DAYS.between(
                    LocalDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDate(),
                    s.getStartAt().toLocalDate()
            );
            return Response.builder()
                    .id(s.getId())
                    .clubId(s.getClubId())
                    .clubName(clubName)
                    .clubEmoji(clubEmoji)
                    .time(s.getTime())
                    .startAt(s.getStartAt())
                    .location(s.getLocation())
                    .dday(dday)
                    .build();
        }
    }
}
