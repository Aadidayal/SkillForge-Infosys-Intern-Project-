package com.example.SkillForge.service;

import com.example.SkillForge.entity.Video;
import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.VideoRepository;
import com.example.SkillForge.repository.EnrollmentRepository;
import com.example.SkillForge.enums.VideoType;
import com.example.SkillForge.enums.VideoStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoServiceClean {
    
    private final VideoRepository videoRepository;
    private final EnrollmentRepository enrollmentRepository;
    
    /**
     * OPTION 1: YouTube Integration (FREE & RECOMMENDED)
     * Instructor provides YouTube URL, we store it with access control
     */
    public Video createVideoWithYouTubeLink(String title, String youtubeUrl, Course course, User instructor) {
        // Validate instructor owns the course
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("Instructor can only add videos to their own courses");
        }
        
        Video video = new Video();
        video.setTitle(title);
        video.setCourse(course);
        video.setVideoUrl(youtubeUrl); // YouTube URL like: https://youtu.be/VIDEO_ID
        video.setVideoType(VideoType.LESSON);
        video.setStatus(VideoStatus.READY);
        video.setOrderIndex(getNextOrderIndex(course.getId()));
        
        return videoRepository.save(video);
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
                .toList();
        }
    }
    
    /**
     * Mark video as free preview
     */
    public Video setVideoAsPreview(Long videoId, User instructor) {
        Video video = videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found"));
        
        if (!video.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new SecurityException("Only course instructor can modify videos");
        }
        
        video.setPreview(true);
        return videoRepository.save(video);
    }
    
    // Helper methods
    private int getNextOrderIndex(Long courseId) {
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId).size();
    }
    
    private boolean isInstructorOfCourse(User user, Long courseId) {
        return videoRepository.findByCourseIdOrderByOrderIndex(courseId)
            .stream()
            .anyMatch(video -> video.getCourse().getInstructor().getId().equals(user.getId()));
    }
}