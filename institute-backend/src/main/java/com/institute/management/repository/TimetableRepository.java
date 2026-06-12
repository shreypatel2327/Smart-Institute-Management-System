package com.institute.management.repository;

import com.institute.management.entity.Timetable;
import com.institute.management.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByBatch(Batch batch);
}
