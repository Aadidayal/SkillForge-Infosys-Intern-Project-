package com.example.SkillForge.controller;

import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.Topic;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.CourseRepository;
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
@RequestMapping("/api/courses/{courseId}/topics")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TopicController {
    
    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    
    // Get all topics for a course (public access - all topics visible)
    @GetMapping
    public ResponseEntity<?> getTopics(@PathVariable Long courseId) {
        try {
            List<Topic> topics = topicRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("topics", topics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Create new topic (instructor only)
    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> createTopic(@PathVariable Long courseId, @RequestBody Topic topic, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify course exists and belongs to instructor
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Course course = courseOpt.get();
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            topic.setCourse(course);
            Topic savedTopic = topicRepository.save(topic);
            
            return ResponseEntity.ok(Map.of("success", true, "topic", savedTopic));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Update topic
    @PutMapping("/{topicId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateTopic(@PathVariable Long courseId, @PathVariable Long topicId, 
                                        @RequestBody Topic topicData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            Optional<Topic> topicOpt = topicRepository.findById(topicId);
            if (topicOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Topic topic = topicOpt.get();
            if (!topic.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            // Update fields
            if (topicData.getTitle() != null) topic.setTitle(topicData.getTitle());
            if (topicData.getDescription() != null) topic.setDescription(topicData.getDescription());
            if (topicData.getOrderIndex() != null) topic.setOrderIndex(topicData.getOrderIndex());
            if (topicData.getIsPublished() != null) topic.setIsPublished(topicData.getIsPublished());
            
            Topic updatedTopic = topicRepository.save(topic);
            
            return ResponseEntity.ok(Map.of("success", true, "topic", updatedTopic));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // Delete topic
    @DeleteMapping("/{topicId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteTopic(@PathVariable Long courseId, @PathVariable Long topicId, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            Optional<Topic> topicOpt = topicRepository.findById(topicId);
            if (topicOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Topic topic = topicOpt.get();
            if (!topic.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "Access denied"));
            }
            
            topicRepository.delete(topic);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Topic deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
