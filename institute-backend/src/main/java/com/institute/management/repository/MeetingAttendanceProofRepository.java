package com.institute.management.repository;

import com.institute.management.entity.MeetingAttendanceProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MeetingAttendanceProofRepository extends JpaRepository<MeetingAttendanceProof, Long> {
    List<MeetingAttendanceProof> findByMeetingId(String meetingId);
}
