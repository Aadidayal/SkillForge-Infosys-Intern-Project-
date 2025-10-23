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
@RequestMapping("/api/instructor")
@PreAuthorize("hasRole('INSTRUCTOR')")
@CrossOrigin(origins = "*")
public class InstructorController {
    
    @GetMapping("/dashboard")
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
    public ResponseEntity<?> getCourses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Instructor courses management - Coming soon!");
        data.put("instructorId", user.getId());
        data.put("courses", Arrays.asList());
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/quiz-generator")
    public ResponseEntity<?> getQuizGenerator(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "AI Quiz Generator - Coming soon!");
        data.put("instructorId", user.getId());
        data.put("availableTopics", Arrays.asList());
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Student Analytics - Coming soon!");
        data.put("instructorId", user.getId());
        data.put("analytics", new HashMap<>());
        
        return ResponseEntity.ok(data);
    }
}