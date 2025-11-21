package com.example.SkillForge.enums;

public enum AttemptStatus {
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    ABANDONED("Abandoned"),
    TIMED_OUT("Timed Out");
    
    private final String displayName;
    
    AttemptStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}