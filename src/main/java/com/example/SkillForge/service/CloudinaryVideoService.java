package com.example.SkillForge.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.SkillForge.entity.Video;
import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.VideoRepository;
import com.example.SkillForge.repository.EnrollmentRepository;
import com.example.SkillForge.enums.VideoType;
import com.example.SkillForge.enums.VideoStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class CloudinaryVideoService {
    
    private static final Logger logger = LoggerFactory.getLogger(CloudinaryVideoService.class);
    
    private final VideoRepository videoRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final Cloudinary cloudinary;
    
    /**
     * Upload video to Cloudinary
     */
    public Video uploadVideo(MultipartFile videoFile, String title, Course course, User instructor) {
        try {
            // Validate instructor owns the course
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                throw new SecurityException("Instructor can only upload to their own courses");
            }
            
            // Validate file
            if (videoFile.isEmpty() || !isVideoFile(videoFile)) {
                throw new IllegalArgumentException("Invalid video file");
            }
            
            // Check file size (Cloudinary free tier has limits)
            if (videoFile.getSize() > 100 * 1024 * 1024) { // 100MB limit
                throw new IllegalArgumentException("Video file too large. Maximum 100MB allowed.");
            }
            
            // Upload to Cloudinary first (synchronously)
            String publicId = String.format("skillforge/course_%d/video_%s", 
                course.getId(), 
                UUID.randomUUID().toString().substring(0, 8)
            );
            
            // Upload parameters
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "public_id", publicId,
                "resource_type", "video",
                "folder", "skillforge/videos",
                "quality", "auto:good",
                "format", "mp4"
            );
            
            // Upload to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(videoFile.getBytes(), uploadParams);
            
            // Get the secure URL
            String videoUrl = (String) uploadResult.get("secure_url");
            String thumbnailUrl = generateThumbnailUrl(publicId);
            
            // Extract video duration if available
            Integer duration = null;
            if (uploadResult.get("duration") != null) {
                duration = ((Number) uploadResult.get("duration")).intValue();
            }
            
            // Create video record with all required data
            Video video = new Video();
            video.setTitle(title);
            video.setCourse(course);
            video.setFileSize(videoFile.getSize());
            video.setVideoType(VideoType.LESSON);
            video.setStatus(VideoStatus.READY);
            video.setVideoUrl(videoUrl);
            video.setThumbnailUrl(thumbnailUrl);
            video.setDurationSeconds(duration);
            video.setOrderIndex(getNextOrderIndex(course.getId()));
            
            return videoRepository.save(video);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload video: " + e.getMessage());
        }
    }
    
    /**
     * Upload to Cloudinary with proper folder structure
     */
    private void uploadToCloudinaryAsync(MultipartFile videoFile, Video video) {
        try {
            // Create unique public ID
            String publicId = String.format("skillforge/course_%d/video_%d_%s", 
                video.getCourse().getId(), 
                video.getId(), 
                UUID.randomUUID().toString().substring(0, 8)
            );
            
            // Upload parameters
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "public_id", publicId,
                "resource_type", "video",
                "folder", "skillforge/videos",
                "quality", "auto:good", // Auto optimize video quality
                "format", "mp4", // Convert to MP4 for compatibility
                "transformation", ObjectUtils.asMap(
                    "quality", "auto:good",
                    "fetch_format", "auto"
                )
            );
            
            // Upload to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(videoFile.getBytes(), uploadParams);
            
            // Get the secure URL
            String videoUrl = (String) uploadResult.get("secure_url");
            String thumbnailUrl = generateThumbnailUrl(publicId);
            
            // Extract video duration if available
            Integer duration = null;
            if (uploadResult.get("duration") != null) {
                duration = ((Number) uploadResult.get("duration")).intValue();
            }
            
            // Update video record with Cloudinary info
            video.setVideoUrl(videoUrl);
            video.setThumbnailUrl(thumbnailUrl);
            video.setDurationSeconds(duration);
            video.setStatus(VideoStatus.READY);
            
            videoRepository.save(video);
            
        } catch (IOException e) {
            // Update status to FAILED if upload fails
            video.setStatus(VideoStatus.FAILED);
            videoRepository.save(video);
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }
    
    /**
     * Generate thumbnail URL from Cloudinary
     */
    private String generateThumbnailUrl(String publicId) {
        // Cloudinary auto-generates video thumbnails with simple URL manipulation
        return String.format("https://res.cloudinary.com/%s/video/upload/c_thumb,g_center,h_300,w_400/%s.jpg",
                cloudinary.config.cloudName, publicId);
    }
    
    /**
     * Get secure video URL with access control
     */
    public String getSecureVideoUrl(Long videoId, User user) {
        Video video = videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found"));
        
        // Check if it's a free preview
        if (video.isPreview()) {
            return video.getVideoUrl();
        }
        
        // Check if student has paid for the course
        boolean hasAccess = enrollmentRepository.existsByStudentIdAndCourseIdAndPaymentStatus(
            user.getId(), video.getCourse().getId(), "COMPLETED"
        );
        
        if (!hasAccess && !isInstructorOfVideo(user, video)) {
            throw new SecurityException("Payment required to access this video");
        }
        
        return video.getVideoUrl();
    }
    
    /**
     * Get all videos for a course (with access control)
     */
    public List<Video> getCourseVideos(Long courseId, User user) {
        List<Video> allVideos = videoRepository.findByCourseIdOrderByOrderIndex(courseId);
        
        // If user is the instructor, return all videos
        if (isInstructorOfCourse(user, courseId)) {
            return allVideos;
        }
        
        // If user is a student, check enrollment
        boolean hasAccess = enrollmentRepository.existsByStudentIdAndCourseIdAndPaymentStatus(
            user.getId(), courseId, "COMPLETED"
        );
        
        if (hasAccess) {
            return allVideos; // Return all videos if paid
        } else {
            // Return only preview videos if not paid
            return allVideos.stream()
                .filter(Video::isPreview)
                .toList();
        }
    }
    
    /**
     * Delete video from Cloudinary and database
     */
    public void deleteVideo(Long videoId, User instructor) {
        Video video = videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found"));
        
        if (!video.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("Only course instructor can delete videos");
        }
        
        try {
            // Extract public_id from Cloudinary URL to delete
            String publicId = extractPublicIdFromUrl(video.getVideoUrl());
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
            }
        } catch (Exception e) {
            // Log error but continue with database deletion
            System.err.println("Failed to delete from Cloudinary: " + e.getMessage());
        }
        
        // Delete from database
        videoRepository.delete(video);
    }
    
    /**
     * Set video as free preview
     */
    public Video setVideoAsPreview(Long videoId, User instructor, boolean isPreview) {
        Video video = videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found"));
        
        if (!video.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("Only course instructor can modify videos");
        }
        
        video.setPreview(isPreview);
        return videoRepository.save(video);
    }
    
    // Helper methods
    private boolean isVideoFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("video/");
    }
    
    private int getNextOrderIndex(Long courseId) {
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId).size();
    }
    
    private boolean isInstructorOfCourse(User user, Long courseId) {
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId)
            .stream()
            .anyMatch(video -> video.getCourse().getInstructor().getId().equals(user.getId()));
    }
    
    private boolean isInstructorOfVideo(User user, Video video) {
        return video.getCourse().getInstructor().getId().equals(user.getId());
    }
    
    private String extractPublicIdFromUrl(String cloudinaryUrl) {
        // Extract public_id from Cloudinary URL for deletion
        // URL format: https://res.cloudinary.com/cloud_name/video/upload/v123/public_id.mp4
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            String[] parts = cloudinaryUrl.split("/");
            String lastPart = parts[parts.length - 1];
            return lastPart.substring(0, lastPart.lastIndexOf('.'));
        } catch (Exception e) {
            return null;
        }
    }
}