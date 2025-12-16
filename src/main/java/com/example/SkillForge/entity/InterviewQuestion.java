package com.example.SkillForge.entity;

import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "interview_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;
    
    @Column(nullable = false, length = 1000)
    private String question;
    
    @Column(name = "sample_answer", length = 3000)
    private String sampleAnswer;
    
    @Column(name = "key_points", length = 2000)
    private String keyPoints; // JSON array stored as string
    
    @Column(nullable = false)
    private String difficulty;
    
    @Column(name = "order_index")
    private Integer orderIndex = 0;
}
