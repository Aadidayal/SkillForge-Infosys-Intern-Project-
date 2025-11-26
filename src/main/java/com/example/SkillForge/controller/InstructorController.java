package com.example.SkillForge.controller;

import com.example.SkillForge.dto.DashboardResponse;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.enums.Role;
import com.example.SkillForge.enums.CourseStatus;
import com.example.SkillForge.repository.UserRepository;
import com.example.SkillForge.repository.CourseRepository;
import com.example.SkillForge.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructor")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InstructorController {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("totalCourses", 0);
        dashboardData.put("totalStudents", 0);
        dashboardData.put("generatedQuizzes", 0);
        dashboardData.put("avgStudentScore", 0.0);
        
        DashboardResponse response = new DashboardResponse(
                "Welcome to your Instructor Dashboard, " + user.getFirstName() + "!",
                "INSTRUCTOR",
                Arrays.asList(
                        "Create Courses",
                        "Upload Materials",
                        "Generate AI Quizzes",
                        "View Student Analytics",
                        "Manage Content"
                ),
                dashboardData
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/courses")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getCourses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Instructor courses management - Coming soon!");
        data.put("instructorId", user.getId());
        data.put("courses", Arrays.asList());
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/quiz-generator")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getQuizGenerator(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "AI Quiz Generator - Coming soon!");
        data.put("instructorId", user.getId());
        data.put("availableTopics", Arrays.asList());
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getAnalytics(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Student Analytics - Coming soon!");
        data.put("instructorId", user.getId());
        data.put("analytics", new HashMap<>());
        
        return ResponseEntity.ok(data);
    }

}