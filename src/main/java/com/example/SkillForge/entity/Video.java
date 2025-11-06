package com.example.SkillForge.entity;

import com.example.SkillForge.enums.VideoType;
import com.example.SkillForge.enums.VideoStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Video {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference
    private Course course;
    
    // Video file information (NOT the actual video data)
    @Column(name = "video_url", nullable = false, length = 500)
    private String videoUrl; // URL to video file (AWS S3, YouTube, etc.)
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl; // Video thumbnail image URL
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds; // Video duration in seconds
    
    @Column(name = "file_size")
    private Long fileSize; // File size in bytes
    
    @Column(name = "video_quality")
    private String videoQuality; // "720p", "1080p", etc.
    
    @Enumerated(EnumType.STRING)
    private VideoType videoType = VideoType.LESSON;
    
    @Enumerated(EnumType.STRING)
    private VideoStatus status = VideoStatus.PROCESSING;
    
    @Column(name = "order_index")
    private Integer orderIndex = 0; // Order within the course
    
    @Column(name = "is_preview")
    private boolean isPreview = false; // Free preview video
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}