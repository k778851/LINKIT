package com.linkit.domain.club;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

public class ClubDto {

    /* ── 요청 ─────────────────────────────────────────── */

    @Getter
    public static class CreateRequest {
        @NotBlank(message = "클럽 이름을 입력해주세요.")
        @Size(max = 50, message = "클럽 이름은 50자 이하여야 합니다.")
        private String name;

        private String emoji;
        private String coverImage;

        @NotBlank(message = "카테고리를 선택해주세요.")
        private String category;

        @Size(max = 500, message = "소개는 500자 이하여야 합니다.")
        private String description;

        private String schedule;
        private String location;
        private boolean isPrivate;
        private List<String> tags;
    }

    @Getter
    public static class UpdateRequest {
        @Size(max = 50)
        private String name;

        private String emoji;
        private String coverImage;
        private String category;

        @Size(max = 500)
        private String description;

        private String schedule;
        private String location;
        private Boolean isPrivate;
        private List<String> tags;
    }

    /* ── 응답 ─────────────────────────────────────────── */

    @Getter @Builder
    public static class Response {
        private String id;
        private String name;
        private String emoji;
        private String coverImage;
        private String category;
        private String description;
        private int memberCount;
        private int newCount;
        private boolean isPrivate;
        private String schedule;
        private String location;
        private String createdBy;
        private List<String> tags;
        private LocalDateTime createdAt;

        public static Response from(Club c) {
            return Response.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .emoji(c.getEmoji())
                    .coverImage(c.getCoverImage())
                    .category(c.getCategory())
                    .description(c.getDescription())
                    .memberCount(c.getMemberCount())
                    .newCount(c.getNewCount())
                    .isPrivate(c.isPrivate())
                    .schedule(c.getSchedule())
                    .location(c.getLocation())
                    .createdBy(c.getCreatedBy())
                    .tags(c.getTags())
                    .createdAt(c.getCreatedAt())
                    .build();
        }
    }
}
