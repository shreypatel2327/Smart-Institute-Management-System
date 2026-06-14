package com.institute.management.repository;

import com.institute.management.entity.StudyMaterial;
import com.institute.management.entity.Batch;
import com.institute.management.entity.Subject;
import com.institute.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findByBatch(Batch batch);
    List<StudyMaterial> findByBatchAndSubject(Batch batch, Subject subject);
    List<StudyMaterial> findByUploadedBy(User uploadedBy);
}
