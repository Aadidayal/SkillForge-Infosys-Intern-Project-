package com.example.SkillForge.controller;

import com.example.SkillForge.dto.ApiResponse;
import com.example.SkillForge.dto.AuthResponse;
import com.example.SkillForge.dto.LoginRequest;
import com.example.SkillForge.dto.RegisterRequest;
import com.example.SkillForge.service.AuthService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);// reg details format checking from file authresponse
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Invalid credentials"));
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse> test() {
        return ResponseEntity.ok(new ApiResponse(true, "Auth API is working!"));
    }
}