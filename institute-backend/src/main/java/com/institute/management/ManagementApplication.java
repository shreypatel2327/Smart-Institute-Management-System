package com.institute.management;

import com.institute.management.entity.*;
import com.institute.management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@SpringBootApplication
public class ManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ManagementApplication.class, args);
    }

    @Bean
    public CommandLineRunner demoData(JdbcTemplate jdbcTemplate,
                                     UserRepository userRepository,
                                     StudentRepository studentRepository,
                                     FacultyRepository facultyRepository,
                                     BatchRepository batchRepository,
                                     SubjectRepository subjectRepository,
                                     LectureRepository lectureRepository,
                                     InquiryRepository inquiryRepository,
                                     FeesRepository feesRepository,
                                     TimetableRepository timetableRepository,
                                     PasswordEncoder encoder) {
        return args -> {
            // Native update to convert stale ROLE_ADMISSION rows to a valid role
            jdbcTemplate.execute("UPDATE users SET role = 'ROLE_ADMIN' WHERE role = 'ROLE_ADMISSION'");

            if (userRepository.count() == 0) {
                System.out.println("No users found in database. Seeding initial role-based users...");

                // 1. Seed Super Admin
                User superAdmin = User.builder()
                        .username("superadmin")
                        .email("superadmin@institute.com")
                        .password(encoder.encode("superadmin"))
                        .role(Role.ROLE_SUPER_ADMIN)
                        .firstName("System")
                        .lastName("SuperAdmin")
                        .phone("9999999999")
                        .status("ACTIVE")
                        .build();
                userRepository.save(superAdmin);

                // 2. Seed Admin
                User admin = User.builder()
                        .username("admin")
                        .email("admin@institute.com")
                        .password(encoder.encode("admin123"))
                        .role(Role.ROLE_ADMIN)
                        .firstName("Jane")
                        .lastName("Doe")
                        .phone("8888888888")
                        .status("ACTIVE")
                        .build();
                userRepository.save(admin);



                // 4. Seed Faculty
                User facultyUser = User.builder()
                        .username("faculty")
                        .email("faculty@institute.com")
                        .password(encoder.encode("faculty123"))
                        .role(Role.ROLE_FACULTY)
                        .firstName("Alan")
                        .lastName("Turing")
                        .phone("6666666666")
                        .status("ACTIVE")
                        .build();
                Faculty faculty = Faculty.builder()
                        .user(facultyUser)
                        .employeeId("FAC-TURING")
                        .specialization("Computer Science")
                        .qualification("PhD in Mathematics")
                        .status("ACTIVE")
                        .build();
                Faculty savedFaculty = facultyRepository.save(faculty);

                // 5. Seed Batch
                Batch batch = Batch.builder()
                        .name("Full Stack Development Batch A")
                        .code("FSD-2026A")
                        .lectureDays("Monday,Wednesday,Friday")
                        .timings("09:00 AM - 11:00 AM")
                        .strength(30)
                        .faculty(savedFaculty)
                        .status("ACTIVE")
                        .build();
                Batch savedBatch = batchRepository.save(batch);

                // 6. Seed Subject
                Subject subject = Subject.builder()
                        .name("Java Web Development with Spring Boot")
                        .code("CS-SB3")
                        .description("Mastering Spring Boot framework, JPA, Security, and MySQL.")
                        .build();
                Subject savedSubject = subjectRepository.save(subject);

                // 7. Seed Student
                User studentUser = User.builder()
                        .username("student")
                        .email("student@institute.com")
                        .password(encoder.encode("student123"))
                        .role(Role.ROLE_STUDENT)
                        .firstName("Bob")
                        .lastName("Marley")
                        .phone("5555555555")
                        .status("ACTIVE")
                        .build();
                Student student = Student.builder()
                        .user(studentUser)
                        .rollNumber("STU-MARLEY")
                        .city("New York")
                        .mobileNumber("5555555555")
                        .fatherName("Norval Marley")
                        .fatherOccupation("Engineer")
                        .fatherMobile("4444444444")
                        .motherOccupation("Homemaker")
                        .motherMobile("3333333333")
                        .referenceSource("Social Media Ads")
                        .status("ACTIVE")
                        .batch(savedBatch)
                        .build();
                Student savedStudent = studentRepository.save(student);

                // 8. Seed Fees Invoice
                Fees fees = Fees.builder()
                        .student(savedStudent)
                        .totalAmount(25000.0)
                        .paidAmount(10000.0)
                        .pendingAmount(15000.0)
                        .dueDate(LocalDate.now().plusMonths(1))
                        .paymentStatus("PARTIAL")
                        .lastPaymentDate(LocalDate.now().minusDays(5))
                        .build();
                feesRepository.save(fees);

                // 9. Seed Inquiries Funnel data
                Inquiry lead1 = Inquiry.builder()
                        .firstName("Alice")
                        .lastName("Wonderland")
                        .email("alice@test.com")
                        .mobileNumber("1234567890")
                        .city("London")
                        .referenceSource("Newspaper")
                        .stage("LEAD")
                        .status("ACTIVE")
                        .build();
                inquiryRepository.save(lead1);

                Inquiry lead2 = Inquiry.builder()
                        .firstName("Charlie")
                        .lastName("Brown")
                        .email("charlie@test.com")
                        .mobileNumber("9876543210")
                        .city("Chicago")
                        .referenceSource("Friends/Relatives")
                        .stage("COUNSELLING")
                        .status("ACTIVE")
                        .build();
                inquiryRepository.save(lead2);

                Inquiry lead3 = Inquiry.builder()
                        .firstName("David")
                        .lastName("Beckham")
                        .email("david@test.com")
                        .mobileNumber("5432167890")
                        .city("Manchester")
                        .referenceSource("Other")
                        .otherReference("Google Search")
                        .stage("ADMISSION")
                        .status("CONVERTED")
                        .build();
                inquiryRepository.save(lead3);

                // 10. Seed Timetable
                Timetable t1 = Timetable.builder()
                        .batch(savedBatch)
                        .dayOfWeek("Monday")
                        .startTime("09:00 AM")
                        .endTime("11:00 AM")
                        .subject(savedSubject)
                        .faculty(savedFaculty)
                        .build();
                timetableRepository.save(t1);

                Timetable t2 = Timetable.builder()
                        .batch(savedBatch)
                        .dayOfWeek("Wednesday")
                        .startTime("09:00 AM")
                        .endTime("11:00 AM")
                        .subject(savedSubject)
                        .faculty(savedFaculty)
                        .build();
                timetableRepository.save(t2);

                // 11. Seed a sample scheduled lecture
                Lecture l1 = Lecture.builder()
                        .title("Spring JPA & Hibernate Relationships")
                        .date(LocalDate.now())
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(11, 0))
                        .batch(savedBatch)
                        .subject(savedSubject)
                        .faculty(savedFaculty)
                        .status("SCHEDULED")
                        .build();
                lectureRepository.save(l1);

                System.out.println("Seeding completed successfully!");
            }
        };
    }
}
