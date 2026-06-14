package com.institute.management.repository;

import com.institute.management.entity.Quiz;
import com.institute.management.entity.QuizResult;
import com.institute.management.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByQuiz(Quiz quiz);
    List<QuizResult> findByStudent(Student student);
    Optional<QuizResult> findByQuizAndStudent(Quiz quiz, Student student);
    Boolean existsByQuizAndStudent(Quiz quiz, Student student);
}
