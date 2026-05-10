package com.linkit.domain.schedule;

import com.linkit.domain.club.Club;
import com.linkit.domain.club.ClubMember;
import com.linkit.domain.club.ClubMemberRepository;
import com.linkit.domain.club.ClubRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository   scheduleRepository;
    private final ClubRepository       clubRepository;
    private final ClubMemberRepository clubMemberRepository;

    /** 유저가 가입한 클럽들의 다가오는 일정 */
    public List<ScheduleDto.Response> getMySchedules(String userId) {
        // club_members 테이블에서 유저가 속한 클럽 ID 목록 조회
        List<String> clubIds = clubMemberRepository.findByUserId(userId)
                .stream()
                .map(ClubMember::getClubId)
                .collect(Collectors.toList());

        if (clubIds.isEmpty()) return List.of();

        // 클럽 정보 일괄 조회 (name, emoji 매핑용)
        Map<String, Club> clubMap = clubRepository.findAllById(clubIds)
                .stream()
                .collect(Collectors.toMap(Club::getId, c -> c));

        return scheduleRepository
                .findUpcomingByClubIds(clubIds, LocalDateTime.now())
                .stream()
                .map(s -> {
                    Club club = clubMap.get(s.getClubId());
                    String name  = club != null ? club.getName()  : s.getClubId();
                    String emoji = club != null ? club.getEmoji() : "📌";
                    return ScheduleDto.Response.from(s, name, emoji);
                })
                .toList();
    }

    /** 특정 클럽의 일정 목록 */
    public List<ScheduleDto.Response> getClubSchedules(String clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new EntityNotFoundException("클럽을 찾을 수 없습니다."));
        return scheduleRepository.findByClubIdOrderByScheduledAtAsc(clubId)
                .stream()
                .map(s -> ScheduleDto.Response.from(s, club.getName(), club.getEmoji()))
                .toList();
    }

    @Transactional
    public ScheduleDto.Response createSchedule(ScheduleDto.CreateRequest req, String userId) {
        Club club = clubRepository.findById(req.getClubId())
                .orElseThrow(() -> new EntityNotFoundException("클럽을 찾을 수 없습니다."));

        // 클럽 멤버만 일정 등록 가능 (OWNER 또는 ADMIN 권한은 ClubMemberRole 로 추가 검증 가능)
        if (!clubMemberRepository.existsByClubIdAndUserId(req.getClubId(), userId))
            throw new AccessDeniedException("클럽 멤버만 일정을 등록할 수 있습니다.");

        Schedule schedule = Schedule.builder()
                .id("sch-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                .clubId(req.getClubId())
                .title(req.getTitle())
                .description(req.getDescription())
                .scheduledAt(req.getScheduledAt())
                .location(req.getLocation())
                .createdBy(userId)
                .build();

        return ScheduleDto.Response.from(scheduleRepository.save(schedule), club.getName(), club.getEmoji());
    }

    @Transactional
    public void deleteSchedule(String scheduleId, String userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new EntityNotFoundException("일정을 찾을 수 없습니다."));
        Club club = clubRepository.findById(schedule.getClubId()).orElseThrow();
        if (!club.getCreatedBy().equals(userId))
            throw new AccessDeniedException("일정 삭제 권한이 없습니다.");
        scheduleRepository.delete(schedule);
    }
}
