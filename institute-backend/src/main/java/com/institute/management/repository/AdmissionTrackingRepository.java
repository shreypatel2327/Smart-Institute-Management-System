package com.institute.management.repository;

import com.institute.management.entity.AdmissionTracking;
import com.institute.management.entity.Inquiry;
import com.institute.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionTrackingRepository extends JpaRepository<AdmissionTracking, Long> {
    Optional<AdmissionTracking> findByInquiry(Inquiry inquiry);
    List<AdmissionTracking> findByEmployee(User employee);
}
