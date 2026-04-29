package com.linkit.domain.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

public class CommentDto {

    @Getter
    public static class CreateRequest {
        @NotBlank(message = "댓글 내용을 입력해주세요.")
        @Size(max = 500, message = "댓글은 500자 이하여야 합니다.")
        private String content;
    }

    @Getter @Builder
    public static class Response {
        private String id;
        private String postId;
        private String content;
        private String authorId;
        private int likeCount;
        private LocalDateTime createdAt;

        public static Response from(Comment c) {
            return Response.builder()
                    .id(c.getId())
                    .postId(c.getPostId())
                    .content(c.getContent())
                    .authorId(c.getAuthorId())
                    .likeCount(c.getLikeCount())
                    .createdAt(c.getCreatedAt())
                    .build();
        }
    }
}
