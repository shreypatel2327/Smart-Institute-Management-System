package com.institute.management.repository;

import com.institute.management.entity.ComplaintLeaveRequest;
import com.institute.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintLeaveRequestRepository extends JpaRepository<ComplaintLeaveRequest, Long> {
    List<ComplaintLeaveRequest> findBySenderOrderByCreatedAtDesc(User sender);
    List<ComplaintLeaveRequest> findByTargetUserOrderByCreatedAtDesc(User targetUser);
    List<ComplaintLeaveRequest> findByTargetTypeOrderByCreatedAtDesc(String targetType);
}
