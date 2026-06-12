package com.institute.management.controller;

import com.institute.management.dto.JwtResponse;
import com.institute.management.dto.LoginRequest;
import com.institute.management.dto.MessageResponse;
import com.institute.management.dto.RegisterRequest;
import com.institute.management.entity.User;
import com.institute.management.entity.Student;
import com.institute.management.entity.Faculty;
import com.institute.management.entity.Role;
import com.institute.management.repository.UserRepository;
import com.institute.management.repository.StudentRepository;
import com.institute.management.repository.FacultyRepository;
import com.institute.management.security.JwtUtils;
import com.institute.management.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Parse Role
        Role role;
        String reqRole = signUpRequest.getRole();
        if (reqRole == null) {
            role = Role.ROLE_STUDENT;
        } else {
            switch (reqRole.toUpperCase()) {
                case "SUPER_ADMIN":
                    role = Role.ROLE_SUPER_ADMIN;
                    break;
                case "ADMIN":
                    role = Role.ROLE_ADMIN;
                    break;
                case "FACULTY":
                    role = Role.ROLE_FACULTY;
                    break;
                case "ADMISSION":
                    role = Role.ROLE_ADMISSION;
                    break;
                default:
                    role = Role.ROLE_STUDENT;
            }
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(role)
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .phone(signUpRequest.getPhone())
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);

        // If user is STUDENT or FACULTY, auto create their corresponding empty profile with default details
        if (role == Role.ROLE_STUDENT) {
            Student student = Student.builder()
                    .user(savedUser)
                    .rollNumber("STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .city(signUpRequest.getPhone() != null ? "" : "Unknown")
                    .status("ACTIVE")
                    .build();
            studentRepository.save(student);
        } else if (role == Role.ROLE_FACULTY) {
            Faculty faculty = Faculty.builder()
                    .user(savedUser)
                    .employeeId("FAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .status("ACTIVE")
                    .build();
            facultyRepository.save(faculty);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
