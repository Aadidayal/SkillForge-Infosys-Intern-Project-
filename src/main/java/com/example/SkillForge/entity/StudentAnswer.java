package com.example.SkillForge.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonBackReference
    private QuizAttempt attempt;
    
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;
    
    @ManyToOne
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    @Column(name = "points_earned")
    private Integer pointsEarned = 0;
    
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    
    @PrePersist
    protected void onCreate() {
        answeredAt = LocalDateTime.now();
    }
}