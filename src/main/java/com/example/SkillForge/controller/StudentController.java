package com.example.SkillForge.controller;

import com.example.SkillForge.dto.DashboardResponse;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.entity.Enrollment;
import com.example.SkillForge.entity.Course;
import com.example.SkillForge.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StudentController {
    
    private final EnrollmentRepository enrollmentRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Get real enrollment count
        List<Enrollment> completedEnrollments = enrollmentRepository.findByStudentIdAndPaymentStatus(
            user.getId(), "COMPLETED"
        );
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("enrolledCourses", completedEnrollments.size());
        dashboardData.put("completedQuizzes", 0);
        dashboardData.put("averageScore", 0.0);
        dashboardData.put("nextLesson", completedEnrollments.isEmpty() ? 
            "No courses enrolled. Browse and enroll in courses to start learning!" :
            "Continue learning in your enrolled courses"
        );
        
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
        try {
            User user = (User) authentication.getPrincipal();
            
            // Get enrolled courses with COMPLETED payment status
            List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndPaymentStatus(
                user.getId(), "COMPLETED"
            );
            
            // Extract course information from enrollments
            List<Map<String, Object>> courses = enrollments.stream()
                .map(enrollment -> {
                    Course course = enrollment.getCourse();
                    Map<String, Object> courseData = new HashMap<>();
                    courseData.put("id", course.getId());
                    courseData.put("title", course.getTitle());
                    courseData.put("description", course.getDescription());
                    courseData.put("instructor", course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName());
                    courseData.put("instructorId", course.getInstructor().getId());
                    courseData.put("price", course.getPrice());
                    courseData.put("status", course.getStatus());
                    courseData.put("thumbnailUrl", course.getThumbnailUrl());
                    courseData.put("enrolledAt", enrollment.getEnrolledAt());
                    courseData.put("paymentAmount", enrollment.getPaymentAmount());
                    return courseData;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Enrolled courses retrieved successfully");
            response.put("courses", courses);
            response.put("totalCourses", courses.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to retrieve enrolled courses: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
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