package com.linkit.domain.club;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class ClubPostDto {

    @Getter
    public static class CreateRequest {
        @NotBlank private String category;

        @NotBlank @Size(max = 200)
        private String title;

        @NotBlank @Size(max = 2000)
        private String content;
    }

    @Getter @Builder
    public static class Response {
        private String id;
        private String clubId;
        private String category;
        private String title;
        private String content;
        private String authorId;
        private int likeCount;
        private int commentCount;
        private int viewCount;
        private LocalDateTime createdAt;

        public static Response from(ClubPost p) {
            return Response.builder()
                    .id(p.getId())
                    .clubId(p.getClubId())
                    .category(p.getCategory())
                    .title(p.getTitle())
                    .content(p.getContent())
                    .authorId(p.getAuthorId())
                    .likeCount(p.getLikeCount())
                    .commentCount(p.getCommentCount())
                    .viewCount(p.getViewCount())
                    .createdAt(p.getCreatedAt())
                    .build();
        }
    }
}
