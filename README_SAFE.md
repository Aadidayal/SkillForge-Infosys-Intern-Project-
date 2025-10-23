# SkillForge - Smart Learning Platform

A Spring Boot learning platform with JWT authentication and role-based access control.

## Setup Instructions

### 1. Database Configuration
1. Install MySQL 8.0+
2. Create a database user and password
3. Copy `application.properties.example` to `application.properties`
4. Update the database credentials:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 2. JWT Secret Configuration
Generate a secure JWT secret:
```bash
# Using OpenSSL
openssl rand -base64 64
```

Add it to your `application.properties`:
```properties
jwt.secret=your_generated_secret_here
```

### 3. Run the Application
```bash
./mvnw spring-boot:run
```

## Demo Accounts
The application creates demo users automatically:
- Student: student@skillforge.com / student123
- Instructor: instructor@skillforge.com / instructor123
- Admin: admin@skillforge.com / admin123

## API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/student/dashboard` - Student dashboard (STUDENT role)
- `GET /api/instructor/dashboard` - Instructor dashboard (INSTRUCTOR role)
- `GET /api/admin/dashboard` - Admin dashboard (ADMIN role)

## Technology Stack
- Spring Boot 3.5.7
- Spring Security 6
- MySQL 8
- JWT Authentication
- Maven

## Security
- JWT tokens for stateless authentication
- Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
- BCrypt password encryption
- CORS configuration for frontend integration