package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dynamic_form_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamicFormResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "form_id", nullable = false)
    private DynamicForm form;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student submittedBy;

    @Column(name = "responses_json", columnDefinition = "TEXT", nullable = false)
    private String responsesJson; // JSON string mapping field keys to student inputs

    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
