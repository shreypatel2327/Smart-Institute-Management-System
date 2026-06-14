package com.institute.management.repository;

import com.institute.management.entity.MeetingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MeetingSessionRepository extends JpaRepository<MeetingSession, Long> {
    Optional<MeetingSession> findByMeetingId(String meetingId);
}
