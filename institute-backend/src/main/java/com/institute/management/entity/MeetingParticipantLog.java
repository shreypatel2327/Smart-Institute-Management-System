package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_participant_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingParticipantLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meeting_id", nullable = false)
    private String meetingId; // Jitsi room name

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "join_time", nullable = false)
    private LocalDateTime joinTime;

    @Column(name = "leave_time")
    private LocalDateTime leaveTime;

    @PrePersist
    protected void onCreate() {
        if (joinTime == null) {
            joinTime = LocalDateTime.now();
        }
    }
}
