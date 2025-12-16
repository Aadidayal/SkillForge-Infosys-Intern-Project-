package com.example.SkillForge.repository;

import com.example.SkillForge.entity.InterviewAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewAttemptRepository extends JpaRepository<InterviewAttempt, Long> {
    List<InterviewAttempt> findByStudentId(Long studentId);
    List<InterviewAttempt> findByInterviewId(Long interviewId);
    List<InterviewAttempt> findByStudentIdAndInterviewId(Long studentId, Long interviewId);
}
