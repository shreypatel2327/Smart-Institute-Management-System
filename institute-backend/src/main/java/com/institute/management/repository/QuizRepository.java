package com.institute.management.repository;

import com.institute.management.entity.Batch;
import com.institute.management.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByBatchOrderByCreatedAtDesc(Batch batch);
    List<Quiz> findByOrderByCreatedAtDesc();
}
