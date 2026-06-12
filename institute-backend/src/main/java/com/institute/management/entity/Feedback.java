package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "topic_explanation")
    private Integer topicExplanation; // Rating 1 to 5

    @Column(name = "subject_knowledge")
    private Integer subjectKnowledge; // Rating 1 to 5

    @Column(name = "communication_skills")
    private Integer communicationSkills; // Rating 1 to 5

    @Column(name = "practical_knowledge")
    private Integer practicalKnowledge; // Rating 1 to 5

    @Column(name = "doubt_solving")
    private Integer doubtSolving; // Rating 1 to 5

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
