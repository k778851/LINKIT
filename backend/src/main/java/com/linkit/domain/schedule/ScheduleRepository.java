package com.linkit.domain.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, String> {

    List<Schedule> findByClubIdOrderByScheduledAtAsc(String clubId);

    /** 유저가 가입한 클럽들의 오늘 이후 일정 */
    @Query("SELECT s FROM Schedule s WHERE s.clubId IN :clubIds AND s.scheduledAt >= :now ORDER BY s.scheduledAt ASC")
    List<Schedule> findUpcomingByClubIds(
            @Param("clubIds") List<String> clubIds,
            @Param("now")     LocalDateTime now);
}
