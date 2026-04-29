package com.linkit.domain.schedule;

import com.linkit.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /** 내 일정 (가입 클럽 기준) */
    @GetMapping("/api/schedules/me")
    public ApiResponse<List<ScheduleDto.Response>> mySchedules(
            @AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok(scheduleService.getMySchedules(principal.getUsername()));
    }

    /** 특정 클럽 일정 목록 */
    @GetMapping("/api/clubs/{clubId}/schedules")
    public ApiResponse<List<ScheduleDto.Response>> clubSchedules(@PathVariable String clubId) {
        return ApiResponse.ok(scheduleService.getClubSchedules(clubId));
    }

    /** 일정 등록 (클럽장만) */
    @PostMapping("/api/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleDto.Response> create(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid ScheduleDto.CreateRequest req) {
        return ApiResponse.ok("일정을 등록했어요 📅", scheduleService.createSchedule(req, principal.getUsername()));
    }

    /** 일정 삭제 (클럽장만) */
    @DeleteMapping("/api/schedules/{scheduleId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String scheduleId) {
        scheduleService.deleteSchedule(scheduleId, principal.getUsername());
        return ApiResponse.ok("일정을 삭제했어요.");
    }
}
