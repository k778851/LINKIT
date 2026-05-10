package com.linkit.domain.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleAttendeeRepository extends JpaRepository<ScheduleAttendee, ScheduleAttendee.ScheduleAttendeeId> {

    List<ScheduleAttendee> findByScheduleId(String scheduleId);

    boolean existsByScheduleIdAndUserId(String scheduleId, String userId);

    void deleteByScheduleIdAndUserId(String scheduleId, String userId);

    long countByScheduleId(String scheduleId);
}
