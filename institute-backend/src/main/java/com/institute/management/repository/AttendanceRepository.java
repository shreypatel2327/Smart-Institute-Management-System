package com.institute.management.repository;

import com.institute.management.entity.Attendance;
import com.institute.management.entity.Student;
import com.institute.management.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent(Student student);
    List<Attendance> findByLecture(Lecture lecture);
    Optional<Attendance> findByStudentAndLecture(Student student, Lecture lecture);
    List<Attendance> findByDate(LocalDate date);
}
