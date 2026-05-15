package com.linkit.domain.club;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

public class JoinRequestDto {

    /** 가입 신청 요청 본문 */
    @Getter @Setter @NoArgsConstructor
    public static class CreateRequest {
        @Size(max = 500, message = "신청 메시지는 500자 이하여야 합니다.")
        private String message;
    }

    /** 가입 신청 응답 */
    @Getter @Builder
    public static class Response {
        private Long id;
        private String clubId;
        private String userId;
        private String requesterNickname;
        private String message;
        private JoinRequestStatus status;
        private LocalDateTime processedAt;
        private LocalDateTime createdAt;

        public static Response from(ClubJoinRequest r, String requesterNickname) {
            return Response.builder()
                    .id(r.getId())
                    .clubId(r.getClubId())
                    .userId(r.getUserId())
                    .requesterNickname(requesterNickname)
                    .message(r.getMessage())
                    .status(r.getStatus())
                    .processedAt(r.getProcessedAt())
                    .createdAt(r.getCreatedAt())
                    .build();
        }
    }

    /** join 엔드포인트의 통합 결과 (즉시가입 vs 가입신청) */
    @Getter @Builder
    public static class JoinResult {
        /** "JOINED" | "PENDING" */
        private String status;
        private Long requestId; // PENDING 일 때만 채움
    }
}
