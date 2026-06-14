package com.institute.management.repository;

import com.institute.management.entity.MeetingParticipantLog;
import com.institute.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingParticipantLogRepository extends JpaRepository<MeetingParticipantLog, Long> {
    List<MeetingParticipantLog> findByMeetingId(String meetingId);
    Optional<MeetingParticipantLog> findByMeetingIdAndUserAndLeaveTimeIsNull(String meetingId, User user);
    List<MeetingParticipantLog> findByUser(User user);
}
