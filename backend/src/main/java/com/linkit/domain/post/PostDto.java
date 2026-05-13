package com.linkit.domain.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class PostDto {

    /* ── 요청 ─────────────────────────────────────────── */

    @Getter
    public static class CreateRequest {
        @NotBlank(message = "카테고리를 선택해주세요.")
        private String category;

        @NotBlank(message = "제목을 입력해주세요.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        private String title;

        @NotBlank(message = "내용을 입력해주세요.")
        @Size(max = 2000, message = "내용은 2000자 이하여야 합니다.")
        private String content;

        private String location;
    }

    @Getter
    public static class UpdateRequest {
        private String category;

        @Size(max = 100)
        private String title;

        @Size(max = 2000)
        private String content;

        private String location;
    }

    /* ── 응답 ─────────────────────────────────────────── */

    @Getter @Builder
    public static class Response {
        private String id;
        private String category;
        private String title;
        private String content;
        private String location;
        private String authorId;
        private int likeCount;
        private int commentCount;
        private int viewCount;
        private String status;
        private boolean liked;           // 현재 유저 좋아요 여부
        private LocalDateTime createdAt;

        public static Response from(Post p, boolean liked) {
            return Response.builder()
                    .id(p.getId())
                    .category(p.getCategory())
                    .title(p.getTitle())
                    .content(p.getContent())
                    .location(p.getLocation())
                    .authorId(p.getAuthorId())
                    .likeCount(p.getLikeCount())
                    .commentCount(p.getCommentCount())
                    .viewCount(p.getViewCount())
                    .status(p.getStatus())
                    .liked(liked)
                    .createdAt(p.getCreatedAt())
                    .build();
        }
    }
}
