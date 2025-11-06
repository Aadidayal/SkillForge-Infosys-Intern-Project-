package com.example.SkillForge.controller;

import com.example.SkillForge.entity.Video;
import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.service.VideoServiceNew;
import com.example.SkillForge.service.CloudinaryVideoService;
import com.example.SkillForge.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VideoController {
    
    private final VideoServiceNew videoService;
    private final CloudinaryVideoService cloudinaryVideoService;
    private final CourseRepository courseRepository;
    
    /**
     * Instructor adds YouTube video to course
     */
    @PostMapping("/youtube")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> addYouTubeVideo(@RequestBody AddVideoRequest request, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            Video video = videoService.createVideoWithYouTubeLink(
                request.getTitle(), 
                request.getYoutubeUrl(), 
                course, 
                instructor
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video added successfully");
            response.put("video", video);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get videos for a course (with access control)
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseVideos(@PathVariable Long courseId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<Video> videos = videoService.getCourseVideos(courseId, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("videos", videos);
            response.put("totalVideos", videos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get video URL for student (with payment check)
     */
    @GetMapping("/{videoId}/url")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getVideoUrl(@PathVariable Long videoId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            String videoUrl = videoService.getVideoUrlForStudent(videoId, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("videoUrl", videoUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("paymentRequired", true);
            return ResponseEntity.status(403).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ===== CLOUDINARY VIDEO ENDPOINTS =====
    
    /**
     * Get video details by ID (for instructors to check upload status)
     */
    @GetMapping("/{videoId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getVideoById(@PathVariable Long videoId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            Video video = videoService.findById(videoId);
            
            // Check if user owns this video (instructor can only see their own videos)
            if ("INSTRUCTOR".equals(user.getRole().name()) && 
                !video.getCourse().getInstructor().getId().equals(user.getId())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Access denied");
                return ResponseEntity.status(403).body(error);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "id", video.getId(),
                "title", video.getTitle(),
                "status", video.getStatus(),
                "videoUrl", video.getVideoUrl(),
                "thumbnailUrl", video.getThumbnailUrl(),
                "duration", video.getDurationSeconds(),
                "fileSize", video.getFileSize(),
                "orderIndex", video.getOrderIndex()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Upload video file to Cloudinary (Instructor only)
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile videoFile,
            @RequestParam("title") String title,
            @RequestParam("courseId") Long courseId,
            Authentication auth) {
        
        try {
            User instructor = (User) auth.getPrincipal();
            
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            Video video = cloudinaryVideoService.uploadVideo(videoFile, title, course, instructor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video uploaded successfully");
            
            // Create a simplified video response to avoid circular references
            Map<String, Object> videoInfo = new HashMap<>();
            videoInfo.put("id", video.getId());
            videoInfo.put("title", video.getTitle());
            videoInfo.put("videoUrl", video.getVideoUrl());
            videoInfo.put("thumbnailUrl", video.getThumbnailUrl());
            videoInfo.put("status", video.getStatus());
            videoInfo.put("duration", video.getDurationSeconds());
            videoInfo.put("fileSize", video.getFileSize());
            videoInfo.put("orderIndex", video.getOrderIndex());
            
            response.put("video", videoInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get secure video URL for Cloudinary videos
     */
    @GetMapping("/{videoId}/stream")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getVideoStreamUrl(@PathVariable Long videoId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            String videoUrl = cloudinaryVideoService.getSecureVideoUrl(videoId, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("videoUrl", videoUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (SecurityException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("paymentRequired", true);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Set video as free preview (Instructor only)
     */
    @PutMapping("/{videoId}/preview")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> setVideoPreview(
            @PathVariable Long videoId,
            @RequestParam("isPreview") boolean isPreview,
            Authentication auth) {
        
        try {
            User instructor = (User) auth.getPrincipal();
            Video video = cloudinaryVideoService.setVideoAsPreview(videoId, instructor, isPreview);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video preview setting updated");
            response.put("video", video);
            
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Delete video from Cloudinary and database (Instructor only)
     */
    @DeleteMapping("/{videoId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteVideo(@PathVariable Long videoId, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            cloudinaryVideoService.deleteVideo(videoId, instructor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video deleted successfully");
            
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    // DTO for adding video
    public static class AddVideoRequest {
        public String title;
        public String youtubeUrl;
        public Long courseId;
        public boolean isPreview = false;
        
        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getYoutubeUrl() { return youtubeUrl; }
        public void setYoutubeUrl(String youtubeUrl) { this.youtubeUrl = youtubeUrl; }
        
        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        
        public boolean isPreview() { return isPreview; }
        public void setPreview(boolean preview) { isPreview = preview; }
    }
}