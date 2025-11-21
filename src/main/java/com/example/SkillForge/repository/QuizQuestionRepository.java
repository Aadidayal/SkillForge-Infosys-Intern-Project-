package com.example.SkillForge.repository;

import com.example.SkillForge.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    List<QuizQuestion> findByQuizIdOrderByQuestionOrderAsc(Long quizId);
    
    @Query("SELECT MAX(qq.questionOrder) FROM QuizQuestion qq WHERE qq.quiz.id = :quizId")
    Integer findMaxQuestionOrderByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(qq) FROM QuizQuestion qq WHERE qq.quiz.id = :quizId")
    Long countQuestionsByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT SUM(qq.points) FROM QuizQuestion qq WHERE qq.quiz.id = :quizId")
    Integer sumPointsByQuizId(@Param("quizId") Long quizId);
}