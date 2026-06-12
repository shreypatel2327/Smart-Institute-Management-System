package com.institute.management.repository;

import com.institute.management.entity.Feedback;
import com.institute.management.entity.Faculty;
import com.institute.management.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByFaculty(Faculty faculty);
    List<Feedback> findByBatch(Batch batch);
}
