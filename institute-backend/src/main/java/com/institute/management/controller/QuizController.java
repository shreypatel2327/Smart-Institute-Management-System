package com.institute.management.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    QuizRepository quizRepository;

    @Autowired
    QuizResultRepository quizResultRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    ObjectMapper objectMapper;

    private User getCurrentUser() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId()).orElse(null);
    }

    // 1. Create Quiz (Faculty)
    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestParam("title") String title,
                                        @RequestParam(value = "batchId", required = false) Long batchId,
                                        @RequestBody String questionsJson) {
        User user = getCurrentUser();
        Faculty faculty = facultyRepository.findByUser(user).orElse(null);
        if (faculty == null) {
            if (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_SUPER_ADMIN) {
                faculty = Faculty.builder()
                        .user(user)
                        .employeeId("ADM-FAC-" + user.getId())
                        .specialization("Administration / Management")
                        .qualification("ERP Administrator")
                        .status("ACTIVE")
                        .build();
                faculty = facultyRepository.save(faculty);
            } else {
                throw new ResourceNotFoundException("Faculty profile not found");
            }
        }

        Batch batch = null;
        if (batchId != null) {
            batch = batchRepository.findById(batchId).orElse(null);
        }

        Quiz quiz = Quiz.builder()
                .title(title)
                .batch(batch)
                .questionsJson(questionsJson)
                .createdBy(faculty)
                .build();

        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    // 2. Get all quizzes (Faculty)
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizRepository.findByOrderByCreatedAtDesc());
    }

    // 3. Get quizzes for student batch
    @GetMapping("/my-quizzes")
    public ResponseEntity<?> getMyQuizzes() {
        User user = getCurrentUser();
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getBatch() == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(quizRepository.findByBatchOrderByCreatedAtDesc(student.getBatch()));
    }

    // 4. Submit Quiz answers (Student MCQ checking)
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long id, @RequestBody String answersJson) {
        User user = getCurrentUser();
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Check if already completed
        if (quizResultRepository.existsByQuizAndStudent(quiz, student)) {
            return ResponseEntity.badRequest().body("Error: You have already submitted answers for this quiz.");
        }

        int score = 0;
        int totalQuestions = 0;

        try {
            // Parse questions: [{"question":"Text", "options":[], "correctIndex": 1}]
            List<Map<String, Object>> questions = objectMapper.readValue(quiz.getQuestionsJson(),
                    new TypeReference<List<Map<String, Object>>>() {});
            
            // Parse student answers: [1, 2, 0]
            List<Integer> studentAnswers = objectMapper.readValue(answersJson,
                    new TypeReference<List<Integer>>() {});

            totalQuestions = questions.size();
            for (int i = 0; i < totalQuestions; i++) {
                if (i < studentAnswers.size()) {
                    Map<String, Object> question = questions.get(i);
                    int correctIndex = ((Number) question.get("correctIndex")).intValue();
                    int studentIndex = studentAnswers.get(i);
                    if (correctIndex == studentIndex) {
                        score++;
                    }
                }
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error parsing quiz structures: " + e.getMessage());
        }

        QuizResult result = QuizResult.builder()
                .quiz(quiz)
                .student(student)
                .answersJson(answersJson)
                .score(score)
                .totalQuestions(totalQuestions)
                .build();

        return ResponseEntity.ok(quizResultRepository.save(result));
    }

    // 5. Get student quiz results (Student)
    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults() {
        User user = getCurrentUser();
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return ResponseEntity.ok(quizResultRepository.findByStudent(student));
    }

    // 6. Get results for a Quiz (Faculty)
    @GetMapping("/{id}/results")
    public ResponseEntity<List<QuizResult>> getQuizResults(@PathVariable Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return ResponseEntity.ok(quizResultRepository.findByQuiz(quiz));
    }
}
