# API Endpoints - GitHub vs SkillForge

## Comparison Table

| Feature | GitHub API | SkillForge API | Status |
|---------|-----------|----------------|--------|
| **Course Management** |
| Get all courses | `GET /api/v0/course/all` | `GET /api/courses` | ✅ Adapted |
| Get published courses | `GET /api/v0/course/all/published` | `GET /api/courses/public` | ✅ Adapted |
| Create course | `POST /api/v0/course/create/{instructorId}` | `POST /api/courses` | ✅ Enhanced |
| Get course details | `GET /api/v0/course/get/{courseId}` | `GET /api/courses/{id}` | ✅ Adapted |
| Publish course | `POST /api/v0/course/publish/{courseId}` | `PUT /api/courses/{id}` | ✅ Adapted |
| **Topic Management** |
| Create topic | `POST /api/v0/topic/create/{courseId}` | `POST /api/topics/course/{courseId}` | ✅ Implemented |
| Get all topics | `GET /api/v0/topic/get/course/{courseId}` | `GET /api/topics/course/{courseId}` | ✅ Implemented |
| **Learning Materials** |
| Create material | `POST /api/v0/learning/create/{topicId}` | `POST /api/learning-materials/topic/{topicId}` | ✅ Implemented |
| Get materials | `GET /api/v0/learning/topic/{topicId}` | `GET /api/learning-materials/topic/{topicId}` | ✅ Implemented |
| **Student Enrollment** |
| Enroll student | `POST /api/v0/enroll/create/{studentId}/{courseId}` | `POST /api/student/enroll/{courseId}` | ✅ Exists |
| Get enrollments | `GET /api/v0/enroll/get/{studentId}` | `GET /api/student/enrollments` | ✅ Exists |
| Get active courses | `GET /api/v0/enroll/get/courses/active/{studentId}` | `GET /api/student/courses/active` | ✅ Can add |
| **Student Progress** |
| Update progress | `POST /api/v0/progress/update/{enrollId}/{materialId}` | `POST /api/progress/update` | ✅ Exists |
| Get progress | `GET /api/v0/progress/get/{enrollmentId}` | `GET /api/progress/{enrollmentId}` | ✅ Exists |
| **Quiz System** |
| Create quiz | `POST /api/v0/quiz/create/{topicId}/{instructorId}` | `POST /api/quizzes` | ✅ Exists |
| Generate AI quiz | `POST /api/v0/quiz/generate` | `POST /api/quizzes/generate` | ✅ Exists |
| Attempt quiz | `POST /api/v0/quiz/attempt/{quizId}/{studentId}` | `POST /api/quizzes/{id}/submit` | ✅ Exists |
| **Interview System** |
| Get interview | `GET /api/v0/interview/get/{enrollmentId}` | `GET /api/interviews/course/{courseId}` | ✅ Exists |
| Create attempt | `POST /api/v0/interview/create/attempt/{studentId}/{enrollmentId}` | `POST /api/interviews/{id}/start` | ✅ Exists |
| Get attempt | `GET /api/v0/interview/get/attempt/{enrollmentId}` | `GET /api/interviews/attempts/{id}` | ✅ Exists |
| **Instructor Profile** |
| Get profile | `GET /api/v0/instructor/get/{userId}` | `GET /api/instructor/profile` | ✅ Exists |
| Create profile | `POST /api/v0/instructor/create/{userId}` | `POST /api/instructor/register` | ✅ Exists |
| Edit profile | `PUT /api/v0/instructor/edit/{instructorId}` | `PUT /api/instructor/profile` | ✅ Exists |
| **Student Profile** |
| Get profile | `GET /api/v0/student/get/{userId}` | `GET /api/student/profile` | ✅ Exists |
| Create profile | `POST /api/v0/student/create/{userId}` | `POST /api/student/register` | ✅ Exists |
| Edit profile | `PUT /api/v0/student/edit/{studentId}` | `PUT /api/student/profile` | ✅ Exists |

## Key Differences

### ID Format
- **GitHub**: Uses String IDs (MongoDB ObjectId)
  ```json
  { "id": "507f1f77bcf86cd799439011" }
  ```
- **SkillForge**: Uses Long IDs (MySQL auto-increment)
  ```json
  { "id": 1 }
  ```

### API Versioning
- **GitHub**: Uses `/api/v0/...` pattern
- **SkillForge**: Uses `/api/...` pattern

### Response Format
Both use similar response structures:

**GitHub**:
```json
{
  "message": "Course added successfully",
  "result": true,
  "object": { ... }
}
```

**SkillForge** (maintained same format):
```json
{
  "message": "Course created successfully",
  "result": true,
  "object": { ... }
}
```

## New Endpoints Added

These endpoints were created to match GitHub functionality:

```
POST   /api/topics/course/{courseId}          Create topic
GET    /api/topics/course/{courseId}          Get all topics
GET    /api/topics/{topicId}                  Get topic by ID
PUT    /api/topics/{topicId}                  Update topic
DELETE /api/topics/{topicId}                  Delete topic

POST   /api/learning-materials/topic/{topicId}    Create material
GET    /api/learning-materials/topic/{topicId}    Get all materials
GET    /api/learning-materials/{materialId}       Get material by ID
PUT    /api/learning-materials/{materialId}       Update material
DELETE /api/learning-materials/{materialId}       Delete material
```

## Request/Response Examples

### Create Course (GitHub Style → SkillForge)

**GitHub**:
```http
POST /api/v0/course/create/507f1f77bcf86cd799439011
{
  "title": "Web Development",
  "description": "Learn web dev",
  "difficultyLevel": "BEGINNER",
  "estimatedDurationHours": 40,
  "price": 99.99,
  "learningObjectives": ["HTML", "CSS"],
  "prerequisites": ["Basic PC skills"]
}
```

**SkillForge (Adapted)**:
```http
POST /api/courses
Authorization: Bearer {jwt-token}
{
  "title": "Web Development",
  "description": "Learn web dev",
  "difficultyLevel": "BEGINNER",
  "estimatedDurationHours": 40,
  "price": 99.99,
  "learningObjectives": ["HTML", "CSS"],
  "prerequisites": ["Basic PC skills"]
}
```

### Create Topic (Identical Pattern)

**GitHub**:
```http
POST /api/v0/topic/create/507f1f77bcf86cd799439011
{
  "title": "Introduction to HTML",
  "description": "HTML basics",
  "difficultyLevel": "BEGINNER",
  "estimatedDurationMinutes": 120,
  "learningObjectives": ["HTML tags", "Structure"]
}
```

**SkillForge**:
```http
POST /api/topics/course/1
{
  "title": "Introduction to HTML",
  "description": "HTML basics"
}
```

### Create Learning Material

**GitHub**:
```http
POST /api/v0/learning/create/507f1f77bcf86cd799439011
Content-Type: multipart/form-data

{
  "learningMaterialDto": {
    "title": "HTML Video Tutorial",
    "description": "Complete HTML guide",
    "contentType": "VIDEO",
    "durationMinutes": 30
  },
  "file": <video-file>
}
```

**SkillForge**:
```http
POST /api/learning-materials/topic/1
{
  "title": "HTML Video Tutorial",
  "description": "Complete HTML guide",
  "materialType": "VIDEO",
  "videoUrl": "https://cloudinary.com/video.mp4",
  "durationSeconds": 1800
}
```

## Authentication

### GitHub
Uses JWT tokens (similar to SkillForge):
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### SkillForge
Same JWT approach:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## URL Parameters

### GitHub Pattern
```
/api/v0/{resource}/action/{id}
/api/v0/course/create/{instructorId}
/api/v0/topic/create/{courseId}
```

### SkillForge Pattern
```
/api/{resource}/{id}?action=value
/api/courses
/api/topics/course/{courseId}
```

## Status Codes

Both use standard HTTP status codes:
- `200 OK` - Success
- `201 CREATED` - Resource created
- `400 BAD REQUEST` - Validation error
- `401 UNAUTHORIZED` - Auth required
- `403 FORBIDDEN` - Insufficient permissions
- `404 NOT FOUND` - Resource not found
- `500 INTERNAL SERVER ERROR` - Server error

## Query Parameters

### GitHub Examples
```
GET /api/v0/course/all/published
GET /api/v0/topic/get/course/{courseId}
```

### SkillForge Examples
```
GET /api/courses?published=true
GET /api/topics/course/{courseId}
```

## Migration Guide

### For Frontend Developers

If migrating from GitHub's frontend:

1. **Change base URL**:
   ```typescript
   // GitHub
   const API_BASE = '/api/v0';
   
   // SkillForge
   const API_BASE = '/api';
   ```

2. **Update ID types**:
   ```typescript
   // GitHub
   interface Course {
     id: string;
   }
   
   // SkillForge
   interface Course {
     id: number;
   }
   ```

3. **Adjust endpoint paths**:
   ```typescript
   // GitHub
   fetch(`/api/v0/course/all`)
   
   // SkillForge
   fetch(`/api/courses`)
   ```

4. **Keep response handling** (same structure):
   ```typescript
   const response = await fetch(url);
   const data = await response.json();
   if (data.result) {
     const courses = data.object;
   }
   ```

## Full API Documentation

For complete API documentation:
- See `AI_INTEGRATION_GUIDE.md` for AI features
- See `GITHUB_INTEGRATION.md` for architecture details
- See `QUICKSTART_NEW_FEATURES.md` for usage examples

---

**Summary**: SkillForge maintains GitHub's core concepts while using RESTful conventions and MySQL-appropriate patterns. All main features are supported with similar or enhanced functionality.
