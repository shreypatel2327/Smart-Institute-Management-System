package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch; // Optional, can be assigned to a batch

    @Column(name = "questions_json", columnDefinition = "TEXT", nullable = false)
    private String questionsJson; // JSON array of questions, options, and correct answers

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private Faculty createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
