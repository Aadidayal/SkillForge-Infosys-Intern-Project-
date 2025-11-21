package com.example.SkillForge.repository;

import com.example.SkillForge.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    
    List<QuestionOption> findByQuestionIdOrderByOptionOrderAsc(Long questionId);
    
    @Query("SELECT qo FROM QuestionOption qo WHERE qo.question.id = :questionId AND qo.isCorrect = true")
    List<QuestionOption> findCorrectOptionsByQuestionId(@Param("questionId") Long questionId);
    
    @Query("SELECT MAX(qo.optionOrder) FROM QuestionOption qo WHERE qo.question.id = :questionId")
    Integer findMaxOptionOrderByQuestionId(@Param("questionId") Long questionId);
}