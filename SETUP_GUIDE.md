# SkillForge Authentication & API Testing Guide

## Current Status
✅ Backend compiled successfully  
🔄 Backend server starting...  
🔄 Frontend setup complete with comprehensive dashboards  
❌ Need to test authentication flow  

## Quick Start Steps

### 1. Start Backend (If not running)
```bash
cd D:\SkillForge
mvn spring-boot:run
```
Wait for "Started SkillForgeApplication" message.

### 2. Start Frontend
```bash
cd D:\SkillForge\frontend
npm run dev
```

### 3. Test Authentication
1. Go to: http://localhost:3000/test
2. This will load our authentication test component
3. Try registering a new user first if needed

### 4. Create Test Users

#### Option A: Using Registration Page
- Go to http://localhost:3000/register
- Create users with different roles:
  - instructor@test.com / password123 (INSTRUCTOR)
  - student@test.com / password123 (STUDENT)

#### Option B: Using API directly (if frontend not working)
```bash
# Register Instructor
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@test.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Instructor",
    "role": "INSTRUCTOR"
  }'

# Register Student  
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Student",
    "role": "STUDENT"
  }'
```

### 5. Test Complete Flow
1. Login as instructor: http://localhost:3000/login
2. Create a course with modules and content
3. Login as student and enroll in course
4. Test learning interface

## API Endpoints Available
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Courses**: `/api/courses` (GET all), `/api/courses/instructor` (GET instructor courses)
- **Modules**: `/api/courses/{id}/modules`
- **Content**: `/api/modules/{id}/content`
- **Test**: `/api/test/health` (Check backend status)

## Troubleshooting
- If getting 403 errors: Authentication token issue
- If course creation fails: Check multipart form data
- If frontend crashes: Check console for React errors

## Current Issue
The 403 errors suggest the JWT tokens are not being properly sent or validated. The test component at `/test` will help diagnose this.