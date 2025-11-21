package com.example.SkillForge.entity;

import com.example.SkillForge.enums.ContentType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "module_contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleContent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    @JsonBackReference
    private CourseModule courseModule;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;
    
    @Column(name = "content_order", nullable = false)
    private Integer contentOrder; // Order of this content in the module
    
    // Generic content URL - can be video URL, PDF URL, etc.
    @Column(name = "content_url", length = 1000)
    private String contentUrl;
    
    // For videos - cloudinary URL
    @Column(name = "video_url", length = 500)
    private String videoUrl;
    
    // For PDFs - file storage URL  
    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;
    
    // Thumbnail/preview image
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    // Duration in seconds (for videos) or estimated read time (for PDFs)
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    // File size in bytes
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;
    
    @Column(name = "is_free", nullable = false)
    private Boolean isFree = false; // Some content can be free preview
    
    // One-to-one relationship with Quiz (for QUIZ content type)
    @OneToOne(mappedBy = "moduleContent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Quiz quiz;
    
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