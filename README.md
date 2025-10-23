# SkillForge - Smart Learning Platform

## 🧠 What You're Building

SkillForge is a smart learning platform that personalizes learning and exam generation using AI (like GPT APIs).
It's like combining Coursera + ChatGPT, where each student gets custom lessons and auto-generated quizzes based on their level and progress.

## 🛠️ Current Implementation Status

### ✅ Completed Features

1. **JWT Authentication System**
   - User registration and login
   - JWT token generation and validation
   - Password encryption using BCrypt

2. **Role-Based Access Control**
   - Three roles: STUDENT, INSTRUCTOR, ADMIN
   - Role-specific dashboard endpoints
   - Spring Security configuration

3. **Database Setup**
   - User entity with roles
   - MySQL database configuration
   - JPA repository for user management

4. **REST API Endpoints**
   - Authentication endpoints (`/api/auth/*`)
   - Role-based dashboard endpoints:
     - Student: `/api/student/*`
     - Instructor: `/api/instructor/*`
     - Admin: `/api/admin/*`

## 📋 Project Structure

```
SkillForge/
├── src/main/java/com/example/SkillForge/
│   ├── config/
│   │   ├── DataInitializer.java        # Default test users
│   │   └── SecurityConfig.java         # Spring Security config
│   ├── controller/
│   │   ├── AdminController.java        # Admin dashboard APIs
│   │   ├── AuthController.java         # Login/Register APIs
│   │   ├── InstructorController.java   # Instructor dashboard APIs
│   │   ├── StudentController.java      # Student dashboard APIs
│   │   └── TestController.java         # Health check API
│   ├── dto/
│   │   ├── ApiResponse.java           # Generic API response
│   │   ├── AuthResponse.java          # Login/Register response
│   │   ├── DashboardResponse.java     # Dashboard response
│   │   ├── LoginRequest.java          # Login request DTO
│   │   └── RegisterRequest.java       # Registration request DTO
│   ├── entity/
│   │   └── User.java                  # User JPA entity
│   ├── enums/
│   │   └── Role.java                  # User roles enum
│   ├── repository/
│   │   └── UserRepository.java        # User data access
│   ├── security/
│   │   └── JwtAuthenticationFilter.java # JWT filter
│   ├── service/
│   │   ├── AuthService.java           # Authentication logic
│   │   └── UserDetailsServiceImpl.java # Spring Security user service
│   ├── util/
│   │   └── JwtUtil.java              # JWT token utilities
│   └── SkillForgeApplication.java    # Main application class
└── src/main/resources/
    └── application.properties         # Database & JWT config
```

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Maven 3.6+
- MySQL 8.0+

### Database Setup
1. Install MySQL and start the service
2. Create a database named `skillforge_db` (optional - will be created automatically)
3. Update database credentials in `application.properties` if needed:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=password
   ```

### Running the Application
```bash
cd SkillForge
./mvnw spring-boot:run
```

### Default Test Users
The application creates default users for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillforge.com | admin123 |
| Instructor | instructor@skillforge.com | instructor123 |
| Student | student@skillforge.com | student123 |

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/test` - Auth API health check

### Student Dashboard (Requires STUDENT role)
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/student/courses` - Student courses
- `GET /api/student/quizzes` - Available quizzes

### Instructor Dashboard (Requires INSTRUCTOR role)
- `GET /api/instructor/dashboard` - Instructor dashboard data
- `GET /api/instructor/courses` - Course management
- `GET /api/instructor/quiz-generator` - AI quiz generator
- `GET /api/instructor/analytics` - Student analytics

### Admin Dashboard (Requires ADMIN role)
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics` - System analytics

### General
- `GET /api/test/health` - Application health check

## 🧪 Testing the API

### 1. Register a new user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }'
```

### 2. Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@skillforge.com",
    "password": "student123"
  }'
```

### 3. Access dashboard (use token from login response):
```bash
curl -X GET http://localhost:8080/api/student/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Next Steps

1. **Course Management Module**
   - Course entity and repository
   - Course creation and management APIs
   - File upload for course materials

2. **AI Quiz Generator**
   - OpenAI GPT integration
   - Quiz entity and repository
   - Auto-generate MCQs from topics

3. **Quiz Attempt System**
   - Quiz attempt tracking
   - Auto-scoring system
   - Result analytics

4. **Frontend (React)**
   - Login/Register pages
   - Role-based dashboards
   - Course and quiz interfaces

5. **Analytics Dashboard**
   - Progress tracking
   - Performance charts
   - Learning insights

## 💡 Key Features Implemented

- ✅ **Secure Authentication**: JWT-based with role management
- ✅ **Role-Based Access**: Different dashboards for each user type  
- ✅ **Database Integration**: JPA with MySQL
- ✅ **API Security**: CORS, CSRF protection
- ✅ **Input Validation**: DTO validation with proper error handling
- ✅ **Password Security**: BCrypt encryption
- ✅ **Auto User Creation**: Default test users for quick testing

The foundation is now ready for building the complete learning platform! 🎉