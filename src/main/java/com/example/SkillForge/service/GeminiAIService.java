package com.example.SkillForge.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Google Gemini AI Service (Free Tier - No Billing Required)
 * Free tier: 15 requests per minute
 * Get API key from: https://makersuite.google.com/app/apikey
 */
@Service
@Slf4j
public class GeminiAIService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;
    
    @Value("${gemini.temperature:0.7}")
    private double temperature;
    
    @Value("${gemini.max.tokens:2048}")
    private int maxTokens;
    
    private final OkHttpClient client;
    private final Gson gson;
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    
    public GeminiAIService() {
        this.client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();
        this.gson = new Gson();
    }
    
    /**
     * Generate content using Gemini AI
     * @param prompt The prompt to send to AI
     * @return AI generated response
     */
    public String generateContent(String prompt) throws IOException {
        if (apiKey == null || apiKey.equals("your-gemini-api-key-here")) {
            throw new IllegalStateException(
                "Gemini API key not configured. Get your free key from: https://makersuite.google.com/app/apikey"
            );
        }
        
        // Build request body
        JsonObject requestBody = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject content = new JsonObject();
        JsonArray parts = new JsonArray();
        JsonObject part = new JsonObject();
        
        part.addProperty("text", prompt);
        parts.add(part);
        content.add("parts", parts);
        contents.add(content);
        requestBody.add("contents", contents);
        
        // Add generation config
        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty("temperature", temperature);
        generationConfig.addProperty("maxOutputTokens", maxTokens);
        requestBody.add("generationConfig", generationConfig);
        
        // Build request
        String url = API_URL + model + ":generateContent?key=" + apiKey;
        RequestBody body = RequestBody.create(
            requestBody.toString(),
            MediaType.parse("application/json")
        );
        
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .addHeader("Content-Type", "application/json")
            .build();
        
        // Execute request
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("Gemini API error: {}", errorBody);
                throw new IOException("Gemini API request failed: " + response.code() + " - " + errorBody);
            }
            
            String responseBody = response.body().string();
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
            
            // Extract generated text
            if (jsonResponse.has("candidates")) {
                JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
                if (candidates.size() > 0) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content")) {
                        JsonObject contentObj = candidate.getAsJsonObject("content");
                        if (contentObj.has("parts")) {
                            JsonArray partsArray = contentObj.getAsJsonArray("parts");
                            if (partsArray.size() > 0) {
                                JsonObject partObj = partsArray.get(0).getAsJsonObject();
                                if (partObj.has("text")) {
                                    return partObj.get("text").getAsString();
                                }
                            }
                        }
                    }
                }
            }
            
            throw new IOException("Unexpected response format from Gemini API");
        }
    }
    
    /**
     * Generate quiz questions for a course topic
     * @param courseName The course name
     * @param topicName The topic name
     * @param difficulty Easy, Medium, or Hard
     * @param numberOfQuestions Number of questions to generate
     * @return JSON string with quiz questions
     */
    public String generateQuiz(String courseName, String topicName, String difficulty, int numberOfQuestions) throws IOException {
        String prompt = String.format(
            "Generate %d multiple-choice quiz questions for the topic '%s' in the course '%s' at %s difficulty level.\n\n" +
            "Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):\n" +
            "[\n" +
            "  {\n" +
            "    \"question\": \"Question text here?\",\n" +
            "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
            "    \"correctAnswer\": 0,\n" +
            "    \"explanation\": \"Explanation of why this is correct\"\n" +
            "  }\n" +
            "]\n\n" +
            "Rules:\n" +
            "- correctAnswer is the index (0-3) of the correct option\n" +
            "- Make questions practical and relevant to real-world scenarios\n" +
            "- Ensure all 4 options are plausible\n" +
            "- Return ONLY the JSON array, no additional text",
            numberOfQuestions, topicName, courseName, difficulty
        );
        
        String response = generateContent(prompt);
        // Clean up markdown code blocks if present
        response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        return response;
    }
    
    /**
     * Generate interview questions for a course
     * @param courseName The course name
     * @param jobRole Target job role
     * @param difficulty Easy, Medium, or Hard
     * @param numberOfQuestions Number of questions to generate
     * @return JSON string with interview questions
     */
    public String generateInterviewQuestions(String courseName, String jobRole, String difficulty, int numberOfQuestions) throws IOException {
        String prompt = String.format(
            "Generate %d technical interview questions for a '%s' position based on the '%s' course at %s difficulty level.\n\n" +
            "Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):\n" +
            "[\n" +
            "  {\n" +
            "    \"question\": \"Interview question text here?\",\n" +
            "    \"sampleAnswer\": \"A comprehensive sample answer\",\n" +
            "    \"keyPoints\": [\"Key point 1\", \"Key point 2\", \"Key point 3\"],\n" +
            "    \"difficulty\": \"%s\"\n" +
            "  }\n" +
            "]\n\n" +
            "Rules:\n" +
            "- Questions should test practical knowledge and problem-solving\n" +
            "- Include behavioral and technical questions\n" +
            "- Sample answers should be detailed and professional\n" +
            "- Return ONLY the JSON array, no additional text",
            numberOfQuestions, jobRole, courseName, difficulty, difficulty
        );
        
        String response = generateContent(prompt);
        // Clean up markdown code blocks if present
        response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        return response;
    }
    
    /**
     * Evaluate an interview answer using AI
     * @param question The interview question
     * @param studentAnswer The student's answer
     * @param sampleAnswer The ideal answer
     * @return Evaluation with score and feedback
     */
    public String evaluateInterviewAnswer(String question, String studentAnswer, String sampleAnswer) throws IOException {
        String prompt = String.format(
            "Evaluate this interview answer:\n\n" +
            "Question: %s\n\n" +
            "Student's Answer: %s\n\n" +
            "Sample Answer: %s\n\n" +
            "Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):\n" +
            "{\n" +
            "  \"score\": 85,\n" +
            "  \"feedback\": \"Detailed feedback on the answer\",\n" +
            "  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n" +
            "  \"improvements\": [\"Area to improve 1\", \"Area to improve 2\"],\n" +
            "  \"overallAssessment\": \"Overall assessment of the answer\"\n" +
            "}\n\n" +
            "Rules:\n" +
            "- score: 0-100 based on accuracy, completeness, and clarity\n" +
            "- Be constructive and encouraging in feedback\n" +
            "- Highlight both strengths and areas for improvement\n" +
            "- Return ONLY the JSON object, no additional text",
            question, studentAnswer, sampleAnswer
        );
        
        String response = generateContent(prompt);
        // Clean up markdown code blocks if present
        response = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        return response;
    }
}
