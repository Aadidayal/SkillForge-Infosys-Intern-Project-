package com.example.SkillForge.entity;

import com.example.SkillForge.enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_materials")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningMaterial {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType; // VIDEO, PDF, LINK, ARTICLE
    
    @Column
    private String contentUrl; // URL for videos, PDFs, or external links
    
    @Column
    private String videoUrl;
    
    @Column
    private String pdfUrl;
    
    @Column
    private String thumbnailUrl;
    
    @Column
    private Integer durationSeconds; // For videos
    
    @Column
    private Long fileSize; // File size in bytes
    
    @Column(nullable = false)
    private Integer orderIndex = 0;
    
    @Column(nullable = false)
    private Boolean isPublished = false;
    
    @Column(nullable = false)
    private Boolean isFree = false; // Can be accessed without enrollment
    
    @Column(name = "created_at", nullable = false, updatable = false)
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
