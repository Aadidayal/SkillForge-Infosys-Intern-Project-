package com.example.SkillForge.config;

import com.example.SkillForge.entity.User;
import com.example.SkillForge.enums.Role;
import com.example.SkillForge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if doesn't exist
        if (!userRepository.existsByEmail("admin@skillforge.com")) {
            User admin = new User();
            admin.setEmail("admin@skillforge.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@skillforge.com / admin123");
        }
        
        // Create default instructor user if doesn't exist
        if (!userRepository.existsByEmail("instructor@skillforge.com")) {
            User instructor = new User();
            instructor.setEmail("instructor@skillforge.com");
            instructor.setPassword(passwordEncoder.encode("instructor123"));
            instructor.setFirstName("John");
            instructor.setLastName("Instructor");
            instructor.setRole(Role.INSTRUCTOR);
            instructor.setEnabled(true);
            userRepository.save(instructor);
            System.out.println("Default instructor user created: instructor@skillforge.com / instructor123");
        }
        
        // Create default student user if doesn't exist
        if (!userRepository.existsByEmail("student@skillforge.com")) {
            User student = new User();
            student.setEmail("student@skillforge.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setFirstName("Jane");
            student.setLastName("Student");
            student.setRole(Role.STUDENT);
            student.setEnabled(true);
            userRepository.save(student);
            System.out.println("Default student user created: student@skillforge.com / student123");
        }
    }
}