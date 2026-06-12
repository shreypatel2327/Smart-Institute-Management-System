package com.institute.management.repository;

import com.institute.management.entity.Student;
import com.institute.management.entity.User;
import com.institute.management.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByRollNumber(String rollNumber);
    List<Student> findByBatch(Batch batch);
    List<Student> findByStatus(String status);
}
