package com.example.SkillForge.controller;

import com.example.SkillForge.dto.DashboardResponse;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {
    
    private final UserRepository userRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        long totalUsers = userRepository.count();
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("totalUsers", totalUsers);
        dashboardData.put("totalCourses", 0);
        dashboardData.put("totalQuizzes", 0);
        dashboardData.put("systemHealth", "Good");
        
        DashboardResponse response = new DashboardResponse(
                "Welcome to your Admin Dashboard, " + user.getFirstName() + "!",
                "ADMIN",
                Arrays.asList(
                        "User Management",
                        "System Analytics",
                        "Course Oversight",
                        "Platform Configuration",
                        "Reports & Insights"
                ),
                dashboardData
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        List<User> users = userRepository.findAll();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "All users retrieved successfully");
        data.put("totalUsers", users.size());
        data.put("users", users.stream().map(u -> {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", u.getId());
            userInfo.put("email", u.getEmail());
            userInfo.put("firstName", u.getFirstName());
            userInfo.put("lastName", u.getLastName());
            userInfo.put("role", u.getRole());
            userInfo.put("enabled", u.isEnabled());
            userInfo.put("createdAt", u.getCreatedAt());
            return userInfo;
        }).collect(java.util.stream.Collectors.toList()));
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<?> getSystemAnalytics(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "System Analytics - Coming soon!");
        data.put("adminId", user.getId());
        data.put("analytics", new HashMap<>());
        
        return ResponseEntity.ok(data);
    }
}