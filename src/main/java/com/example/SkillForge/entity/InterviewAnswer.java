package com.example.SkillForge.entity;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "interview_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private InterviewAttempt attempt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;
    
    @Column(name = "student_answer", length = 5000)
    private String studentAnswer;
    
    @Column(name = "ai_score")
    private Integer aiScore; // 0-100
    
    @Column(name = "ai_feedback", length = 3000)
    private String aiFeedback;
    
    @Column(name = "strengths", length = 2000)
    private String strengths; // JSON array stored as string
    
    @Column(name = "improvements", length = 2000)
    private String improvements; // JSON array stored as string
}
