package com.example.SkillForge.controller;

import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.CourseRepository;
import com.example.SkillForge.enums.CourseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CourseController {
    
    private final CourseRepository courseRepository;
    

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getInstructorCourses(Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            List<Course> courses = courseRepository.findByInstructorId(instructor.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Create new course (Instructor only)
     */
    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> createCourse(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") String priceStr,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "level", defaultValue = "BEGINNER") String level,
            Authentication auth) {
        
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Validate input
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Course title is required");
            }
            
            BigDecimal price;
            try {
                price = new BigDecimal(priceStr);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid price format");
            }
            
            // Create course
            Course course = new Course();
            course.setTitle(title.trim());
            course.setDescription(description != null ? description.trim() : "");
            course.setPrice(price);
            course.setInstructor(instructor);
            course.setStatus(CourseStatus.DRAFT);
            
            // Set a default thumbnail or use uploaded one
            // In production, you'd upload the thumbnail to Cloudinary too
            if (thumbnail != null && !thumbnail.isEmpty()) {
                // TODO: Upload thumbnail to Cloudinary
                course.setThumbnailUrl(null); // Let frontend handle placeholder
            } else {
                course.setThumbnailUrl(null); // Let frontend handle placeholder
            }
            
            Course savedCourse = courseRepository.save(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Course created successfully");
            response.put("course", savedCourse);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to create course: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Update course (Instructor only)
     */
    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> updates,
            Authentication auth) {
        
        try {
            User instructor = (User) auth.getPrincipal();
            
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            // Check if instructor owns the course
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                throw new SecurityException("You can only update your own courses");
            }
            
            // Update fields
            if (updates.containsKey("title")) {
                course.setTitle((String) updates.get("title"));
            }
            if (updates.containsKey("description")) {
                course.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("price")) {
                course.setPrice(new BigDecimal(updates.get("price").toString()));
            }
            if (updates.containsKey("status")) {
                course.setStatus(CourseStatus.valueOf((String) updates.get("status")));
            }
            
            Course updatedCourse = courseRepository.save(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Course updated successfully");
            response.put("course", updatedCourse);
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Delete course (Instructor only)
     */
    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long courseId, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            // Check if instructor owns the course
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                throw new SecurityException("You can only delete your own courses");
            }
            
            courseRepository.delete(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Course deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Publish/Unpublish course (Instructor only)
     */
    @PutMapping("/{courseId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> publishCourse(@PathVariable Long courseId, @RequestParam boolean publish, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
                
            // Verify course belongs to instructor
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                throw new SecurityException("Access denied: Course does not belong to you");
            }
            
            // Update course status
            course.setStatus(publish ? CourseStatus.PUBLISHED : CourseStatus.DRAFT);
            courseRepository.save(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Course " + (publish ? "published" : "unpublished") + " successfully");
            response.put("course", course);
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all published courses (for students and public)
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublishedCourses() {
        try {
            List<Course> courses = courseRepository.findByStatus(CourseStatus.PUBLISHED);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}