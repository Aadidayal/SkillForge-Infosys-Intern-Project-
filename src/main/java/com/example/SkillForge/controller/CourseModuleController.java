package com.example.SkillForge.controller;

import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.CourseModule;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.CourseModuleRepository;
import com.example.SkillForge.repository.CourseRepository;
import com.example.SkillForge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseModuleController {

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserService userService;

    // Get all modules for a course (public for enrolled students)
    @GetMapping
    public ResponseEntity<?> getCourseModules(@PathVariable Long courseId) {
        try {
            List<CourseModule> modules = courseModuleRepository.findByCourseIdAndIsPublishedTrueOrderByModuleOrderAsc(courseId);
            return ResponseEntity.ok(Map.of("modules", modules));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch modules: " + e.getMessage()));
        }
    }

    // Get all modules for instructor (including unpublished)
    @GetMapping("/manage")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getModulesForInstructor(@PathVariable Long courseId, org.springframework.security.core.Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify course belongs to instructor
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
            return ResponseEntity.ok(Map.of("modules", modules));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch modules: " + e.getMessage()));
        }
    }

    // Create new module
    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> createModule(@PathVariable Long courseId, @RequestBody CourseModule moduleData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify course belongs to instructor
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Set course and order
            moduleData.setCourse(course);
            
            // Auto-assign next order if not provided
            if (moduleData.getModuleOrder() == null) {
                Integer maxOrder = courseModuleRepository.findMaxModuleOrderByCourseId(courseId);
                moduleData.setModuleOrder(maxOrder != null ? maxOrder + 1 : 1);
            }

            CourseModule savedModule = courseModuleRepository.save(moduleData);
            return ResponseEntity.ok(Map.of("module", savedModule, "message", "Module created successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create module: " + e.getMessage()));
        }
    }

    // Update module
    @PutMapping("/{moduleId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateModule(@PathVariable Long courseId, @PathVariable Long moduleId, 
                                        @RequestBody CourseModule moduleData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Find existing module
            Optional<CourseModule> moduleOpt = courseModuleRepository.findById(moduleId);
            if (moduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseModule existingModule = moduleOpt.get();
            
            // Verify course belongs to instructor
            if (!existingModule.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Update fields
            existingModule.setTitle(moduleData.getTitle());
            existingModule.setDescription(moduleData.getDescription());
            if (moduleData.getModuleOrder() != null) {
                existingModule.setModuleOrder(moduleData.getModuleOrder());
            }
            if (moduleData.getIsPublished() != null) {
                existingModule.setIsPublished(moduleData.getIsPublished());
            }

            CourseModule savedModule = courseModuleRepository.save(existingModule);
            return ResponseEntity.ok(Map.of("module", savedModule, "message", "Module updated successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update module: " + e.getMessage()));
        }
    }

    // Delete module
    @DeleteMapping("/{moduleId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteModule(@PathVariable Long courseId, @PathVariable Long moduleId, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Find existing module
            Optional<CourseModule> moduleOpt = courseModuleRepository.findById(moduleId);
            if (moduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseModule existingModule = moduleOpt.get();
            
            // Verify course belongs to instructor
            if (!existingModule.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            courseModuleRepository.delete(existingModule);
            return ResponseEntity.ok(Map.of("message", "Module deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete module: " + e.getMessage()));
        }
    }

    // Publish/Unpublish module
    @PutMapping("/{moduleId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> toggleModulePublish(@PathVariable Long courseId, @PathVariable Long moduleId, 
                                               @RequestParam boolean published, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Find existing module
            Optional<CourseModule> moduleOpt = courseModuleRepository.findById(moduleId);
            if (moduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseModule existingModule = moduleOpt.get();
            
            // Verify course belongs to instructor
            if (!existingModule.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            existingModule.setIsPublished(published);
            CourseModule savedModule = courseModuleRepository.save(existingModule);
            
            String action = published ? "published" : "unpublished";
            return ResponseEntity.ok(Map.of("module", savedModule, "message", "Module " + action + " successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update module: " + e.getMessage()));
        }
    }
}