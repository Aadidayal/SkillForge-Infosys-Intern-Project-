package com.example.SkillForge.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonBackReference
    private QuizQuestion question;
    
    @Column(nullable = false, length = 500)
    private String optionText;
    
    @Column(name = "option_order", nullable = false)
    private Integer optionOrder;
    
    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}