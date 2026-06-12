package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek; // Monday, Tuesday, etc.

    @Column(name = "start_time", nullable = false)
    private String startTime; // e.g. "09:00 AM"

    @Column(name = "end_time", nullable = false)
    private String endTime; // e.g. "11:00 AM"

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;
}
