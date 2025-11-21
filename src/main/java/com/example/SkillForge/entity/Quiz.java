package com.example.SkillForge.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @OneToOne
    @JoinColumn(name = "module_content_id", nullable = false)
    @JsonBackReference
    private ModuleContent moduleContent;
    
    @Column(name = "passing_score", nullable = false)
    private Integer passingScore = 70; // Percentage required to pass
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes; // Optional time limit
    
    @Column(name = "max_attempts")
    private Integer maxAttempts = 3; // Maximum attempts allowed
    
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;
    
    @Column(name = "show_results_immediately", nullable = false)
    private Boolean showResultsImmediately = true;
    
    // One quiz can have many questions
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @OrderBy("questionOrder ASC")
    private List<QuizQuestion> questions;
    
    // One quiz can have many attempts
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizAttempt> attempts;
    
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