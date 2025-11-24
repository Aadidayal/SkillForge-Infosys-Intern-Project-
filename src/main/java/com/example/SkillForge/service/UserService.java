package com.example.SkillForge.service;

import com.example.SkillForge.entity.User;
import com.example.SkillForge.repository.UserRepository;
import com.example.SkillForge.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    public User getUserFromToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
            throw new RuntimeException("User not found");
        } catch (Exception e) {
            throw new RuntimeException("Invalid token or user not found: " + e.getMessage());
        }
    }
}