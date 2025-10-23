# SkillForge API Test Collection

## Testing Instructions

### 1. Start the Application
```bash
cd SkillForge
./mvnw spring-boot:run
```

### 2. Health Check
```bash
curl -X GET http://localhost:8080/api/test/health
```

### 3. Authentication Tests

#### Register New User (Student)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "Student",
    "role": "STUDENT"
  }'
```

#### Login with Default Student
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@skillforge.com",
    "password": "student123"
  }'
```

#### Login with Default Instructor
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@skillforge.com",
    "password": "instructor123"
  }'
```

#### Login with Default Admin
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@skillforge.com",
    "password": "admin123"
  }'
```

### 4. Dashboard Access Tests

**Note:** Replace `YOUR_JWT_TOKEN` with the actual token received from login response.

#### Student Dashboard
```bash
curl -X GET http://localhost:8080/api/student/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Student Courses
```bash
curl -X GET http://localhost:8080/api/student/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Student Quizzes
```bash
curl -X GET http://localhost:8080/api/student/quizzes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Instructor Dashboard
```bash
curl -X GET http://localhost:8080/api/instructor/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Instructor Courses
```bash
curl -X GET http://localhost:8080/api/instructor/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Instructor Quiz Generator
```bash
curl -X GET http://localhost:8080/api/instructor/quiz-generator \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Instructor Analytics
```bash
curl -X GET http://localhost:8080/api/instructor/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Admin Dashboard
```bash
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Admin Users List
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Admin Analytics
```bash
curl -X GET http://localhost:8080/api/admin/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Responses

### Login Response Example
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "student@skillforge.com",
  "firstName": "Jane",
  "lastName": "Student",
  "role": "STUDENT"
}
```

### Student Dashboard Response Example
```json
{
  "welcomeMessage": "Welcome to your Student Dashboard, Jane!",
  "userRole": "STUDENT",
  "features": [
    "View Enrolled Courses",
    "Take Quizzes",
    "Track Progress",
    "View Scores",
    "Adaptive Learning"
  ],
  "data": {
    "enrolledCourses": 0,
    "completedQuizzes": 0,
    "averageScore": 0.0,
    "nextLesson": "Welcome! Start your learning journey"
  }
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `application.properties`
   - Verify database `skillforge_db` exists

2. **Invalid JWT Token**
   - Make sure to include `Bearer ` prefix
   - Check if token has expired (24 hours by default)
   - Verify you're using the correct token from login response

3. **Access Denied**
   - Ensure you're using the correct role token for the endpoint
   - Student tokens can't access instructor/admin endpoints
   - Check if the user has the required role

4. **Port Already in Use**
   - Change port in `application.properties`: `server.port=8081`
   - Or stop other applications using port 8080

### Default Database Configuration
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=password
```

Update these values according to your MySQL setup.