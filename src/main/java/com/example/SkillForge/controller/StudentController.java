package com.example.SkillForge.controller;

import com.example.SkillForge.dto.DashboardResponse;
import com.example.SkillForge.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@CrossOrigin(origins = "*")
public class StudentController {
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("enrolledCourses", 0);
        dashboardData.put("completedQuizzes", 0);
        dashboardData.put("averageScore", 0.0);
        dashboardData.put("nextLesson", "Welcome! Start your learning journey");
        
        DashboardResponse response = new DashboardResponse(
                "Welcome to your Student Dashboard, " + user.getFirstName() + "!",
                "STUDENT",
                Arrays.asList(
                        "View Enrolled Courses",
                        "Take Quizzes", 
                        "Track Progress",
                        "View Scores",
                        "Adaptive Learning"
                ),
                dashboardData
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/courses")
    public ResponseEntity<?> getCourses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Student courses endpoint - Coming soon!");
        data.put("studentId", user.getId());
        data.put("courses", Arrays.asList());
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/quizzes")
    public ResponseEntity<?> getQuizzes(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Student quizzes endpoint - Coming soon!");
        data.put("studentId", user.getId());
        data.put("availableQuizzes", Arrays.asList());
        
        return ResponseEntity.ok(data);
    }
}