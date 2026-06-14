package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import com.institute.management.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    @Autowired
    MeetingSessionRepository meetingSessionRepository;

    @Autowired
    MeetingParticipantLogRepository meetingParticipantLogRepository;

    @Autowired
    MeetingAttendanceProofRepository meetingAttendanceProofRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    FileStorageService fileStorageService;

    private User getCurrentUser() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId()).orElse(null);
    }

    // 1. Host Starts Meeting
    @PostMapping("/start")
    public ResponseEntity<?> startMeeting(@RequestParam("meetingId") String meetingId) {
        User host = getCurrentUser();
        MeetingSession session = meetingSessionRepository.findByMeetingId(meetingId).orElse(null);
        if (session == null) {
            session = MeetingSession.builder()
                    .meetingId(meetingId)
                    .host(host)
                    .status("ACTIVE")
                    .build();
            session = meetingSessionRepository.save(session);
        } else {
            session.setStatus("ACTIVE");
            session.setEndTime(null);
            session = meetingSessionRepository.save(session);
        }

        // Log host join
        MeetingParticipantLog log = MeetingParticipantLog.builder()
                .meetingId(meetingId)
                .user(host)
                .joinTime(LocalDateTime.now())
                .build();
        meetingParticipantLogRepository.save(log);

        return ResponseEntity.ok(session);
    }

    // 2. User Joins Meeting
    @PostMapping("/join")
    public ResponseEntity<?> joinMeeting(@RequestParam("meetingId") String meetingId) {
        User user = getCurrentUser();

        // Check if there is an active log for this user in this meeting, if so close it first
        Optional<MeetingParticipantLog> activeLog = meetingParticipantLogRepository
                .findByMeetingIdAndUserAndLeaveTimeIsNull(meetingId, user);
        if (activeLog.isPresent()) {
            activeLog.get().setLeaveTime(LocalDateTime.now());
            meetingParticipantLogRepository.save(activeLog.get());
        }

        MeetingParticipantLog log = MeetingParticipantLog.builder()
                .meetingId(meetingId)
                .user(user)
                .joinTime(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(meetingParticipantLogRepository.save(log));
    }

    // 3. User Leaves Meeting
    @PostMapping("/leave")
    public ResponseEntity<?> leaveMeeting(@RequestParam("meetingId") String meetingId) {
        User user = getCurrentUser();
        Optional<MeetingParticipantLog> activeLog = meetingParticipantLogRepository
                .findByMeetingIdAndUserAndLeaveTimeIsNull(meetingId, user);

        if (activeLog.isPresent()) {
            activeLog.get().setLeaveTime(LocalDateTime.now());
            return ResponseEntity.ok(meetingParticipantLogRepository.save(activeLog.get()));
        }

        return ResponseEntity.ok("No active session log found to exit.");
    }

    // 4. Host Ends Meeting
    @PostMapping("/end")
    public ResponseEntity<?> endMeeting(@RequestParam("meetingId") String meetingId) {
        MeetingSession session = meetingSessionRepository.findByMeetingId(meetingId)
                .orElse(null);
        if (session != null) {
            session.setStatus("COMPLETED");
            session.setEndTime(LocalDateTime.now());
            meetingSessionRepository.save(session);
        }

        // Leave any participant still inside
        List<MeetingParticipantLog> activeLogs = meetingParticipantLogRepository.findByMeetingId(meetingId).stream()
                .filter(l -> l.getLeaveTime() == null)
                .collect(Collectors.toList());
        for (MeetingParticipantLog l : activeLogs) {
            l.setLeaveTime(LocalDateTime.now());
            meetingParticipantLogRepository.save(l);
        }

        return ResponseEntity.ok("Meeting completed successfully.");
    }

    // 5. Faculty Uploads Screenshot Proof
    @PostMapping("/screenshot")
    public ResponseEntity<?> uploadScreenshot(@RequestParam("meetingId") String meetingId,
                                              @RequestParam("file") MultipartFile file) {
        User user = getCurrentUser();
        String path = fileStorageService.storeFile(file, "certificates"); // Reuse certificates upload path for images

        MeetingAttendanceProof proof = MeetingAttendanceProof.builder()
                .meetingId(meetingId)
                .screenshotUrl(path)
                .uploadedBy(user)
                .build();

        return ResponseEntity.ok(meetingAttendanceProofRepository.save(proof));
    }

    // 6. Get Attendance and Working Hours Reports (Daily, Weekly, Monthly)
    @GetMapping("/attendance-reports")
    public ResponseEntity<?> getAttendanceReports(@RequestParam(value = "minLectureDuration", defaultValue = "5") Integer minLectureDuration) {
        // Prepare Response Maps
        Map<String, Object> response = new HashMap<>();

        List<Student> students = studentRepository.findAll();
        List<Faculty> faculties = facultyRepository.findAll();
        List<MeetingSession> sessions = meetingSessionRepository.findAll();
        List<MeetingParticipantLog> logs = meetingParticipantLogRepository.findAll();
        List<MeetingAttendanceProof> proofs = meetingAttendanceProofRepository.findAll();

        // 1. Calculate Student attendance hours & statuses
        List<Map<String, Object>> studentReports = new ArrayList<>();
        for (Student stu : students) {
            User user = stu.getUser();
            List<MeetingParticipantLog> stuLogs = logs.stream()
                    .filter(l -> l.getUser().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            double totalMinutes = 0.0;
            List<Map<String, Object>> detailedClasses = new ArrayList<>();

            // Group logs by meetingId
            Map<String, List<MeetingParticipantLog>> logsByMeeting = stuLogs.stream()
                    .collect(Collectors.groupingBy(MeetingParticipantLog::getMeetingId));

            int presentCount = 0;
            int absentCount = 0;

            for (Map.Entry<String, List<MeetingParticipantLog>> entry : logsByMeeting.entrySet()) {
                String mId = entry.getKey();
                List<MeetingParticipantLog> mLogs = entry.getValue();

                // Find corresponding session title
                MeetingSession sess = sessions.stream().filter(s -> s.getMeetingId().equals(mId)).findFirst().orElse(null);
                String title = (sess != null) ? "Virtual Meeting Class" : "Class Session";
                String hostName = (sess != null) ? (sess.getHost().getFirstName() + " " + sess.getHost().getLastName()) : "Faculty";

                double minutesInMeeting = 0;
                for (MeetingParticipantLog log : mLogs) {
                    LocalDateTime end = log.getLeaveTime() != null ? log.getLeaveTime() : LocalDateTime.now();
                    Duration duration = Duration.between(log.getJoinTime(), end);
                    minutesInMeeting += Math.max(0, duration.toMinutes());
                }

                totalMinutes += minutesInMeeting;
                boolean isPresent = (minutesInMeeting >= minLectureDuration);

                if (isPresent) presentCount++;
                else absentCount++;

                Map<String, Object> detail = new HashMap<>();
                detail.put("meetingId", mId);
                detail.put("title", title);
                detail.put("host", hostName);
                detail.put("minutes", minutesInMeeting);
                detail.put("isPresent", isPresent);
                detail.put("hasProof", false);
                detail.put("proofs", List.of());
                detail.put("date", mLogs.isEmpty() ? "" : mLogs.get(0).getJoinTime().format(DateTimeFormatter.ISO_LOCAL_DATE));

                detailedClasses.add(detail);
            }

            Map<String, Object> stuRep = new HashMap<>();
            stuRep.put("studentId", stu.getId());
            stuRep.put("rollNumber", stu.getRollNumber());
            stuRep.put("name", user.getFirstName() + " " + user.getLastName());
            stuRep.put("batch", stu.getBatch() != null ? stu.getBatch().getName() : "No Batch");
            stuRep.put("totalHours", Math.round((totalMinutes / 60.0) * 100.0) / 100.0);
            stuRep.put("presentCount", presentCount);
            stuRep.put("absentCount", absentCount);
            stuRep.put("classes", detailedClasses);

            studentReports.add(stuRep);
        }

        // 2. Calculate Faculty working hours
        List<Map<String, Object>> facultyReports = new ArrayList<>();
        for (Faculty fac : faculties) {
            User user = fac.getUser();
            List<MeetingSession> facSessions = sessions.stream()
                    .filter(s -> s.getHost().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            double totalMinutes = 0.0;
            List<Map<String, Object>> hostedMeetings = new ArrayList<>();

            for (MeetingSession sess : facSessions) {
                LocalDateTime end = sess.getEndTime() != null ? sess.getEndTime() : LocalDateTime.now();
                Duration duration = Duration.between(sess.getStartTime(), end);
                double mins = Math.max(0, duration.toMinutes());
                totalMinutes += mins;

                Map<String, Object> detail = new HashMap<>();
                detail.put("meetingId", sess.getMeetingId());
                detail.put("status", sess.getStatus());
                detail.put("startTime", sess.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                detail.put("endTime", sess.getEndTime() != null ? sess.getEndTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "Ongoing");
                detail.put("durationMinutes", mins);
                detail.put("proofCount", proofs.stream().filter(p -> p.getMeetingId().equals(sess.getMeetingId())).count());
                detail.put("date", sess.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE));

                hostedMeetings.add(detail);
            }

            Map<String, Object> facRep = new HashMap<>();
            facRep.put("facultyId", fac.getId());
            facRep.put("employeeId", fac.getEmployeeId());
            facRep.put("name", user.getFirstName() + " " + user.getLastName());
            facRep.put("specialization", fac.getSpecialization());
            facRep.put("totalHours", Math.round((totalMinutes / 60.0) * 100.0) / 100.0);
            facRep.put("meetings", hostedMeetings);

            facultyReports.add(facRep);
        }

        response.put("studentReports", studentReports);
        response.put("facultyReports", facultyReports);

        return ResponseEntity.ok(response);
    }
}
