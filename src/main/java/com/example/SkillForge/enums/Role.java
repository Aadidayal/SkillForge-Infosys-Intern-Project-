package com.example.SkillForge.enums;

public enum Role {
    STUDENT,
    INSTRUCTOR,
    ADMIN
}

// Dangerous approach
//public class User {
//    private String role; // "student",
//    "STUDENT", "Student", "admin", etc.
//}

// Problems:
//String role = "STUDENT";     // Typo - no error until runtime
//String role = "student";     // Case sensitivity issues
//String role = "TEACHER";     // Invalid role - security vulnerability
//String role = null;          // Null pointer exceptions