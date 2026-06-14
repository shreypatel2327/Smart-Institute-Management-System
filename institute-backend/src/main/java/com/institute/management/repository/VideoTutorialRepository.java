package com.institute.management.repository;

import com.institute.management.entity.VideoTutorial;
import com.institute.management.entity.Batch;
import com.institute.management.entity.Subject;
import com.institute.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VideoTutorialRepository extends JpaRepository<VideoTutorial, Long> {
    List<VideoTutorial> findByBatch(Batch batch);
    List<VideoTutorial> findByBatchAndSubject(Batch batch, Subject subject);
    List<VideoTutorial> findByUploadedBy(User uploadedBy);
}
