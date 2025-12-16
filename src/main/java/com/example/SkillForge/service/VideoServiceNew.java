package com.example.SkillForge.service;

import com.example.SkillForge.entity.Video;
import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.entity.Enrollment;
import com.example.SkillForge.repository.VideoRepository;
import com.example.SkillForge.repository.EnrollmentRepository;
import com.example.SkillForge.enums.VideoType;
import com.example.SkillForge.enums.VideoStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoServiceNew {
    
    private final VideoRepository videoRepository;
    private final EnrollmentRepository enrollmentRepository;
    
    /**
     * OPTION 1: YouTube Integration (FREE)
     * Instructors upload to YouTube as "Unlisted" videos
     */
    public Video createVideoWithYouTubeLink(String title, String youtubeUrl, Course course, User instructor) {
        // Validate instructor owns the course
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("Instructor can only add videos to their own courses");
        }
        
        Video video = new Video();
        video.setTitle(title);
        video.setCourse(course);
        video.setVideoUrl(youtubeUrl); // YouTube URL
        video.setVideoType(VideoType.LESSON);
        video.setStatus(VideoStatus.READY);
        video.setOrderIndex(getNextOrderIndex(course.getId()));
        
        return videoRepository.save(video);
    }
    
    /**
     * OPTION 2: Cloudinary Integration (FREE TIER)
     * 25GB storage + 25GB bandwidth per month
     */
    public Video uploadVideoToCloudinary(MultipartFile videoFile, String title, Course course, User instructor) {
        try {
            // Validate file
            if (videoFile.isEmpty() || !isVideoFile(videoFile)) {
                throw new IllegalArgumentException("Invalid video file");
            }
            
            // Validate instructor
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                throw new SecurityException("Instructor can only upload to their own courses");
            }
            
            // Upload to Cloudinary (you'll need to add Cloudinary dependency)
            String publicId = "skillforge/course_" + course.getId() + "/" + UUID.randomUUID();
            String cloudinaryUrl = uploadToCloudinary(videoFile, publicId);
            
            Video video = new Video();
            video.setTitle(title);
            video.setCourse(course);
            video.setVideoUrl(cloudinaryUrl);
            video.setFileSize(videoFile.getSize());
            video.setVideoType(VideoType.LESSON);
            video.setStatus(VideoStatus.READY);
            video.setOrderIndex(getNextOrderIndex(course.getId()));
            
            return videoRepository.save(video);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload video: " + e.getMessage());
        }
    }
    
    /**
     * OPTION 3: Firebase Storage (FREE TIER)
     * 5GB storage + 1GB download per day
     */
    public Video uploadVideoToFirebase(MultipartFile videoFile, String title, Course course, User instructor) {
        try {
            // Similar implementation but using Firebase
            String fileName = "videos/" + course.getId() + "/" + UUID.randomUUID() + getFileExtension(videoFile);
            String firebaseUrl = uploadToFirebaseStorage(videoFile, fileName);
            
            Video video = new Video();
            video.setTitle(title);
            video.setCourse(course);
            video.setVideoUrl(firebaseUrl);
            video.setFileSize(videoFile.getSize());
            video.setVideoType(VideoType.LESSON);
            video.setStatus(VideoStatus.READY);
            
            return videoRepository.save(video);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload to Firebase: " + e.getMessage());
        }
    }
    
    /**
     * Find video by ID
     */
    public Video findById(Long videoId) {
        return videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found"));
    }
    
    /**
     * Access Control - Check if student can watch video
     */
    public String getVideoUrlForStudent(Long videoId, User student) {
        Video video = videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found"));
        
        // Check if it's a free preview
        if (video.isPreview()) {
            return video.getVideoUrl();
        }
        
        // Check if student has paid for the course
        boolean hasAccess = enrollmentRepository.existsByStudentIdAndCourseIdAndPaymentStatus(
            student.getId(), video.getCourse().getId(), "COMPLETED"
        );
        
        if (!hasAccess) {
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
                .collect(java.util.stream.Collectors.toList());
        }
    }
    
    // Helper methods
    private boolean isVideoFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("video/");
    }
    
    private String getFileExtension(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        return originalName != null ? originalName.substring(originalName.lastIndexOf(".")) : ".mp4";
    }
    
    private int getNextOrderIndex(Long courseId) {
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId).size();
    }
    
    private boolean isInstructorOfCourse(User user, Long courseId) {
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId)
            .stream()
            .anyMatch(video -> video.getCourse().getInstructor().getId().equals(user.getId()));
    }
    
    // Placeholder methods - implement based on chosen service
    private String uploadToCloudinary(MultipartFile file, String publicId) {
        // TODO: Implement Cloudinary upload
        // Return: https://res.cloudinary.com/your-cloud/video/upload/v123/skillforge/course_1/uuid.mp4
        return "https://res.cloudinary.com/skillforge/video/upload/" + publicId + ".mp4";
    }
    
    private String uploadToFirebaseStorage(MultipartFile file, String fileName) {
        // TODO: Implement Firebase Storage upload
        // Return: https://firebasestorage.googleapis.com/v0/b/skillforge/o/videos%2F...
        return "https://firebasestorage.googleapis.com/v0/b/skillforge/o/" + fileName;
    }
}