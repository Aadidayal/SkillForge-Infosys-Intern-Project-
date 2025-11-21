package com.example.SkillForge.entity;

import com.example.SkillForge.enums.CourseStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor; // Reference to User with INSTRUCTOR role
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(length = 500)
    private String thumbnailUrl; // Course thumbnail image URL
    
    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.DRAFT;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One course can have many videos (legacy - keeping for backward compatibility)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Video> videos;
    
    // One course can have many modules (NEW STRUCTURE)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @OrderBy("moduleOrder ASC")
    private List<CourseModule> courseModules;
    
    // One course can have many enrollments
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Enrollment> enrollments;
    
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