package com.example.SkillForge.controller;

import com.example.SkillForge.entity.LearningMaterial;
import com.example.SkillForge.entity.Topic;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.LearningMaterialRepository;
import com.example.SkillForge.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/topics/{topicId}/materials")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LearningMaterialController {
    
    private final LearningMaterialRepository learningMaterialRepository;
    private final TopicRepository topicRepository;
    
    // Get all learning materials for a topic (public access)
    @GetMapping
    public ResponseEntity<?> getLearningMaterials(@PathVariable Long topicId) {
        try {
            List<LearningMaterial> materials = learningMaterialRepository.findByTopicIdOrderByOrderIndexAsc(topicId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("materials", materials);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Create new learning material (instructor only)
    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> createLearningMaterial(@PathVariable Long topicId, 
                                                    @RequestBody LearningMaterial material, 
                                                    Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify topic exists and belongs to instructor
            Optional<Topic> topicOpt = topicRepository.findById(topicId);
            if (topicOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Topic topic = topicOpt.get();
            if (!topic.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            material.setTopic(topic);
            LearningMaterial savedMaterial = learningMaterialRepository.save(material);
            
            return ResponseEntity.ok(Map.of("success", true, "material", savedMaterial));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Update learning material
    @PutMapping("/{materialId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateLearningMaterial(@PathVariable Long topicId, 
                                                    @PathVariable Long materialId,
                                                    @RequestBody LearningMaterial materialData, 
                                                    Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            Optional<LearningMaterial> materialOpt = learningMaterialRepository.findById(materialId);
            if (materialOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            LearningMaterial material = materialOpt.get();
            if (!material.getTopic().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            // Update fields
            if (materialData.getTitle() != null) material.setTitle(materialData.getTitle());
            if (materialData.getDescription() != null) material.setDescription(materialData.getDescription());
            if (materialData.getMaterialType() != null) material.setMaterialType(materialData.getMaterialType());
            if (materialData.getContentUrl() != null) material.setContentUrl(materialData.getContentUrl());
            if (materialData.getVideoUrl() != null) material.setVideoUrl(materialData.getVideoUrl());
            if (materialData.getPdfUrl() != null) material.setPdfUrl(materialData.getPdfUrl());
            if (materialData.getThumbnailUrl() != null) material.setThumbnailUrl(materialData.getThumbnailUrl());
            if (materialData.getDurationSeconds() != null) material.setDurationSeconds(materialData.getDurationSeconds());
            if (materialData.getFileSize() != null) material.setFileSize(materialData.getFileSize());
            if (materialData.getOrderIndex() != null) material.setOrderIndex(materialData.getOrderIndex());
            if (materialData.getIsPublished() != null) material.setIsPublished(materialData.getIsPublished());
            if (materialData.getIsFree() != null) material.setIsFree(materialData.getIsFree());
            
            LearningMaterial updatedMaterial = learningMaterialRepository.save(material);
            
            return ResponseEntity.ok(Map.of("success", true, "material", updatedMaterial));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Delete learning material
    @DeleteMapping("/{materialId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteLearningMaterial(@PathVariable Long topicId, 
                                                    @PathVariable Long materialId, 
                                                    Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            Optional<LearningMaterial> materialOpt = learningMaterialRepository.findById(materialId);
            if (materialOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            LearningMaterial material = materialOpt.get();
            if (!material.getTopic().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            learningMaterialRepository.delete(material);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Learning material deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
