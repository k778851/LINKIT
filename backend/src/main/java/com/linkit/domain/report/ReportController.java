package com.linkit.domain.report;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /* ── 사용자: 신고 접수 ─────────────────────────────── */

    @PostMapping("/api/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReportDto.Response> create(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid ReportDto.CreateRequest req) {
        return ApiResponse.ok("신고가 접수되었어요.",
                reportService.create(principal.getUsername(), req));
    }

    /* ── 관리자: 신고 목록 / 처리 ──────────────────────── */

    @GetMapping("/api/admin/reports")
    public ApiResponse<Page<ReportDto.Response>> listForAdmin(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.ok(reportService.listForAdmin(status, pageable));
    }

    @PatchMapping("/api/admin/reports/{reportId}")
    public ApiResponse<ReportDto.Response> updateStatus(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long reportId,
            @RequestBody @Valid ReportDto.UpdateStatusRequest req) {
        return ApiResponse.ok("신고 상태를 업데이트했어요.",
                reportService.updateStatus(reportId, principal.getUsername(), req));
    }
}
