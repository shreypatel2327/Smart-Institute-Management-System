package com.institute.management.repository;

import com.institute.management.entity.Assignment;
import com.institute.management.entity.Batch;
import com.institute.management.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByBatch(Batch batch);
    List<Assignment> findByFaculty(Faculty faculty);
}
