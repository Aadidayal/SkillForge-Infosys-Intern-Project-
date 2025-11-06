package com.example.SkillForge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    // Constructor for success/error without data
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // Constructor with String status instead of boolean
    public ApiResponse(String status, String message, T data) {
        this.success = "success".equals(status);
        this.message = message;
        this.data = data;
    }
}