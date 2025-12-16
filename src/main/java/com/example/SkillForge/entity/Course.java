package com.example.SkillForge.entity;

import com.example.SkillForge.enums.CourseStatus;
import com.example.SkillForge.enums.SkillLevel;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    @JsonBackReference
    private User instructor; // Reference to User with INSTRUCTOR role
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(length = 500)
    private String thumbnailUrl; // Course thumbnail image URL
    
    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private SkillLevel difficultyLevel = SkillLevel.BEGINNER;
    
    @ElementCollection
    @CollectionTable(name = "course_learning_objectives", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "objective", length = 500)
    private List<String> learningObjectives = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "course_prerequisites", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "prerequisite", length = 500)
    private List<String> prerequisites = new ArrayList<>();
    
    @Column(name = "estimated_duration_hours")
    private Integer estimatedDurationHours;
    
    @Column(name = "is_published")
    private Boolean isPublished = false;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One course can have many videos (legacy - keeping for backward compatibility)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Video> videos;
    
    // One course can have many modules (NEW STRUCTURE)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @OrderBy("moduleOrder ASC")
    private List<CourseModule> courseModules;
    
    // One course can have many enrollments
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Enrollment> enrollments;
    
    // One course can have many topics
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @OrderBy("orderIndex ASC")
    private List<Topic> topics = new ArrayList<>();
    
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