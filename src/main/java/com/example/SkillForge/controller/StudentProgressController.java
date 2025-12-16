package com.example.SkillForge.controller;

import com.example.SkillForge.entity.Enrollment;
import com.example.SkillForge.entity.LearningMaterial;
import com.example.SkillForge.entity.StudentProgress;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.EnrollmentRepository;
import com.example.SkillForge.repository.LearningMaterialRepository;
import com.example.SkillForge.repository.StudentProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StudentProgressController {
    
    private final StudentProgressRepository studentProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LearningMaterialRepository learningMaterialRepository;
    
    // Get student's progress for a course
    @GetMapping("/enrollment/{enrollmentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> getProgressByEnrollment(@PathVariable Long enrollmentId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
            if (enrollmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Enrollment enrollment = enrollmentOpt.get();
            // Only allow the student themselves or instructor/admin
            if (!enrollment.getStudent().getId().equals(user.getId()) && 
                !user.getRole().toString().equals("INSTRUCTOR") && 
                !user.getRole().toString().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            List<StudentProgress> progressList = studentProgressRepository.findByEnrollmentId(enrollmentId);
            Long completedCount = studentProgressRepository.countCompletedMaterialsByEnrollment(enrollmentId);
            Double avgProgress = studentProgressRepository.getAverageProgressByEnrollment(enrollmentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("progressList", progressList);
            response.put("completedCount", completedCount);
            response.put("averageProgress", avgProgress != null ? avgProgress : 0.0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Update material progress
    @PutMapping("/enrollment/{enrollmentId}/material/{materialId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateMaterialProgress(@PathVariable Long enrollmentId,
                                                    @PathVariable Long materialId,
                                                    @RequestBody Map<String, Object> progressData,
                                                    Authentication auth) {
        try {
            User student = (User) auth.getPrincipal();
            
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
            if (enrollmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Enrollment enrollment = enrollmentOpt.get();
            if (!enrollment.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            Optional<LearningMaterial> materialOpt = learningMaterialRepository.findById(materialId);
            if (materialOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            LearningMaterial material = materialOpt.get();
            
            // Find or create progress record
            Optional<StudentProgress> progressOpt = studentProgressRepository
                .findByEnrollmentIdAndLearningMaterialId(enrollmentId, materialId);
            
            StudentProgress progress;
            if (progressOpt.isPresent()) {
                progress = progressOpt.get();
            } else {
                progress = new StudentProgress();
                progress.setEnrollment(enrollment);
                progress.setLearningMaterial(material);
                progress.setStartedAt(LocalDateTime.now());
            }
            
            // Update progress fields
            if (progressData.containsKey("progressPercentage")) {
                Integer percentage = ((Number) progressData.get("progressPercentage")).intValue();
                progress.setProgressPercentage(percentage);
                
                // Auto-mark as completed if 100%
                if (percentage >= 100 && !progress.getCompleted()) {
                    progress.setCompleted(true);
                    progress.setCompletedAt(LocalDateTime.now());
                }
            }
            
            if (progressData.containsKey("timeSpentSeconds")) {
                Long timeSpent = ((Number) progressData.get("timeSpentSeconds")).longValue();
                progress.setTimeSpentSeconds((int) (progress.getTimeSpentSeconds() + timeSpent));
            }
            
            if (progressData.containsKey("completed") && (Boolean) progressData.get("completed")) {
                progress.setCompleted(true);
                progress.setProgressPercentage(100);
                if (progress.getCompletedAt() == null) {
                    progress.setCompletedAt(LocalDateTime.now());
                }
            }
            
            StudentProgress savedProgress = studentProgressRepository.save(progress);
            
            return ResponseEntity.ok(Map.of("success", true, "progress", savedProgress));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Mark material as started
    @PostMapping("/enrollment/{enrollmentId}/material/{materialId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> startMaterial(@PathVariable Long enrollmentId,
                                          @PathVariable Long materialId,
                                          Authentication auth) {
        try {
            User student = (User) auth.getPrincipal();
            
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(enrollmentId);
            if (enrollmentOpt.isEmpty() || !enrollmentOpt.get().getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            Optional<LearningMaterial> materialOpt = learningMaterialRepository.findById(materialId);
            if (materialOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if already started
            Optional<StudentProgress> existingProgress = studentProgressRepository
                .findByEnrollmentIdAndLearningMaterialId(enrollmentId, materialId);
            
            if (existingProgress.isPresent()) {
                return ResponseEntity.ok(Map.of("success", true, "progress", existingProgress.get()));
            }
            
            StudentProgress progress = new StudentProgress();
            progress.setEnrollment(enrollmentOpt.get());
            progress.setLearningMaterial(materialOpt.get());
            progress.setStartedAt(LocalDateTime.now());
            progress.setProgressPercentage(0);
            progress.setTimeSpentSeconds(0);
            progress.setCompleted(false);
            
            StudentProgress savedProgress = studentProgressRepository.save(progress);
            
            return ResponseEntity.ok(Map.of("success", true, "progress", savedProgress));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Get overall progress statistics for a student
    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> getStudentCourseProgress(@PathVariable Long studentId,
                                                      @PathVariable Long courseId,
                                                      Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            
            // Only allow the student themselves or instructor/admin
            if (!user.getId().equals(studentId) && 
                !user.getRole().toString().equals("INSTRUCTOR") && 
                !user.getRole().toString().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            List<StudentProgress> progressList = studentProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
            
            long totalMaterials = progressList.size();
            long completedMaterials = progressList.stream().filter(StudentProgress::getCompleted).count();
            double overallProgress = progressList.isEmpty() ? 0.0 : 
                progressList.stream().mapToInt(StudentProgress::getProgressPercentage).average().orElse(0.0);
            long totalTimeSpent = progressList.stream().mapToLong(StudentProgress::getTimeSpentSeconds).sum();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalMaterials", totalMaterials);
            response.put("completedMaterials", completedMaterials);
            response.put("overallProgress", Math.round(overallProgress * 100.0) / 100.0);
            response.put("totalTimeSpentSeconds", totalTimeSpent);
            response.put("progressDetails", progressList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
