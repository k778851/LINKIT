package com.linkit.domain.report;

import com.linkit.domain.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class ReportDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "신고 대상 유형은 필수입니다.")
        private ReportTargetType targetType;

        @NotBlank(message = "신고 대상 ID는 필수입니다.")
        private String targetId;

        @NotNull(message = "신고 사유는 필수입니다.")
        private ReportReason reason;

        private String detail;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotNull(message = "처리 상태는 필수입니다.")
        private ReportStatus status;
    }

    @Getter @Builder
    public static class ReporterRef {
        private String id;
        private String nickname;

        static ReporterRef from(User u) {
            if (u == null) return null;
            return ReporterRef.builder()
                    .id(u.getId())
                    .nickname(u.getNickname())
                    .build();
        }
    }

    @Getter @Builder
    public static class Response {
        private Long id;
        private ReporterRef reporter;
        private ReportTargetType targetType;
        private String targetId;
        private ReportReason reason;
        private String detail;
        private ReportStatus status;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;

        public static Response from(Report r) {
            return Response.builder()
                    .id(r.getId())
                    .reporter(ReporterRef.from(r.getReporter()))
                    .targetType(r.getTargetType())
                    .targetId(r.getTargetId())
                    .reason(r.getReason())
                    .detail(r.getDetail())
                    .status(r.getStatus())
                    .resolvedAt(r.getResolvedAt())
                    .createdAt(r.getCreatedAt())
                    .build();
        }
    }
}
