package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meeting_id", nullable = false, unique = true)
    private String meetingId; // Jitsi room name

    @ManyToOne
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String status; // ACTIVE, COMPLETED

    @PrePersist
    protected void onCreate() {
        startTime = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
