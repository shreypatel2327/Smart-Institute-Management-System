package com.institute.management.repository;

import com.institute.management.entity.OnlineClass;
import com.institute.management.entity.Batch;
import com.institute.management.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OnlineClassRepository extends JpaRepository<OnlineClass, Long> {
    List<OnlineClass> findByBatch(Batch batch);
    List<OnlineClass> findByFaculty(Faculty faculty);
    List<OnlineClass> findByStatus(String status);
}
