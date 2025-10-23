package com.example.SkillForge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardResponse {
    private String welcomeMessage;
    private String userRole;
    private List<String> features;
    private Object data;
}