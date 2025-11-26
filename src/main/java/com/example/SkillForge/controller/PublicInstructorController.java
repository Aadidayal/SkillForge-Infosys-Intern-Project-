package com.example.SkillForge.controller;

import com.example.SkillForge.entity.User;
import com.example.SkillForge.enums.Role;
import com.example.SkillForge.enums.CourseStatus;
import com.example.SkillForge.repository.UserRepository;
import com.example.SkillForge.repository.CourseRepository;
import com.example.SkillForge.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PublicInstructorController {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Get all instructors who have published courses (for students and public)
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublicInstructors() {
        try {
            // Get all instructors who have at least one course
            List<User> allInstructors = userRepository.findByRole(Role.INSTRUCTOR);
            
            List<Map<String, Object>> instructorsWithStats = allInstructors.stream()
                .map(instructor -> {
                    try {
                        List<com.example.SkillForge.entity.Course> courses = courseRepository.findByInstructorId(instructor.getId());
                        Long totalCourseCount = Long.valueOf(courses.size());
                    
                        // Include all instructors who have any courses (published or draft)
                        if (totalCourseCount > 0) {
                            Map<String, Object> instructorData = new HashMap<>();
                            instructorData.put("id", instructor.getId());
                            instructorData.put("firstName", instructor.getFirstName());
                            instructorData.put("lastName", instructor.getLastName());
                            instructorData.put("email", instructor.getEmail());
                            instructorData.put("courseCount", totalCourseCount);
                            
                            // Get total enrolled students count across all instructor's courses
                            Long totalStudents = courses.stream()
                                .mapToLong(course -> {
                                    try {
                                        return enrollmentRepository.countByCourseId(course.getId());
                                    } catch (Exception e) {
                                        return 0L;
                                    }
                                })
                                .sum();
                            
                            instructorData.put("studentCount", totalStudents);
                            return instructorData;
                        }
                        return null;
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(data -> data != null)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("instructors", instructorsWithStats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch instructors: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get instructor profile by ID (public endpoint)
     */
    @GetMapping("/public/{instructorId}")
    public ResponseEntity<?> getInstructorProfile(@PathVariable Long instructorId) {
        try {
            User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
            
            if (instructor.getRole() != Role.INSTRUCTOR) {
                throw new RuntimeException("User is not an instructor");
            }
            
            Long publishedCourseCount = courseRepository.countByInstructorIdAndStatus(
                instructorId, CourseStatus.PUBLISHED);
            
            Long totalStudents = courseRepository.findByInstructorIdAndStatus(
                instructorId, CourseStatus.PUBLISHED)
                .stream()
                .mapToLong(course -> {
                    try {
                        return enrollmentRepository.countByCourseId(course.getId());
                    } catch (Exception e) {
                        return 0L;
                    }
                })
                .sum();
            
            Map<String, Object> instructorData = new HashMap<>();
            instructorData.put("id", instructor.getId());
            instructorData.put("firstName", instructor.getFirstName());
            instructorData.put("lastName", instructor.getLastName());
            instructorData.put("email", instructor.getEmail());
            instructorData.put("courseCount", publishedCourseCount);
            instructorData.put("studentCount", totalStudents);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("instructor", instructorData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}