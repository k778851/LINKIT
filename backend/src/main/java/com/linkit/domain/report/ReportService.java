package com.linkit.domain.report;

import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository   userRepository;

    @Transactional
    public ReportDto.Response create(String reporterId, ReportDto.CreateRequest req) {
        if (reportRepository.existsByReporter_IdAndTargetTypeAndTargetId(
                reporterId, req.getTargetType(), req.getTargetId())) {
            throw new IllegalStateException("이미 신고한 대상입니다.");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new EntityNotFoundException("신고자를 찾을 수 없습니다."));

        Report saved = reportRepository.save(Report.builder()
                .reporter(reporter)
                .targetType(req.getTargetType())
                .targetId(req.getTargetId())
                .reason(req.getReason())
                .detail(req.getDetail())
                .status(ReportStatus.PENDING)
                .build());

        return ReportDto.Response.from(saved);
    }

    public Page<ReportDto.Response> listForAdmin(ReportStatus status, Pageable pageable) {
        Page<Report> page = (status == null)
                ? reportRepository.findAll(pageable)
                : reportRepository.findByStatus(status, pageable);
        return page.map(ReportDto.Response::from);
    }

    @Transactional
    public ReportDto.Response updateStatus(Long reportId, String adminId, ReportDto.UpdateStatusRequest req) {
        if (req.getStatus() != ReportStatus.RESOLVED && req.getStatus() != ReportStatus.DISMISSED) {
            throw new IllegalArgumentException("처리 상태는 RESOLVED 또는 DISMISSED 여야 합니다.");
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("신고를 찾을 수 없습니다."));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("관리자를 찾을 수 없습니다."));

        report.setStatus(req.getStatus());
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());

        return ReportDto.Response.from(report);
    }
}
