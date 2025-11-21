package com.example.SkillForge.enums;

public enum ContentType {
    VIDEO("Video Content"),
    PDF_NOTES("PDF Notes"), 
    PDF_QUESTIONS("PDF Questions/Assignments"),
    QUIZ("Interactive Quiz");
    
    private final String displayName;
    
    ContentType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}