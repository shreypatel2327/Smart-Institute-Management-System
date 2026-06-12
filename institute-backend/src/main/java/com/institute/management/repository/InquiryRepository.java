package com.institute.management.repository;

import com.institute.management.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByStage(String stage);
    List<Inquiry> findByStatus(String status);
}
