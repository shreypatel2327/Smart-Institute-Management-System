package com.institute.management.repository;

import com.institute.management.entity.Lecture;
import com.institute.management.entity.Batch;
import com.institute.management.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, Long> {
    List<Lecture> findByBatch(Batch batch);
    List<Lecture> findByFaculty(Faculty faculty);
    List<Lecture> findByDate(LocalDate date);
}
