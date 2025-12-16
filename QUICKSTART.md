# SkillForge - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Java 11+
- Maven 3.6+
- Node.js 18+
- MySQL 8.0+

### Backend Setup

1. **Configure Database** (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

2. **Run Backend**
```bash
cd d:\SkillForge
mvnw spring-boot:run
```

Backend will start at: `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
```bash
cd d:\SkillForge\frontend
npm install --legacy-peer-deps
```

2. **Configure API URL** (create `.env` file in frontend folder)
```
VITE_API_URL=http://localhost:8080/api
```

3. **Run Frontend**
```bash
npm run dev
```

Frontend will start at: `http://localhost:5173`

---

## 📱 New Features Overview

### 1. **3D Landing Page**
- URL: `http://localhost:5173/`
- Features:
  - Animated 3D logo with Three.js
  - Glassmorphic UI design
  - Particle effects
  - CTA buttons (Login, Browse Courses)

### 2. **Topic-Based Course Structure**
- URL: `/courses/:courseId`
- Features:
  - Sidebar navigation with topics
  - Material type icons (Video, PDF, Link, Article)
  - Real-time progress tracking
  - Free material preview badges

### 3. **Progress Dashboard**
- URL: `/progress` (Student role only)
- Features:
  - Overall statistics (courses, materials, time)
  - Course-wise progress cards
  - Animated progress bars
  - Recent materials tracking

---

## 🔑 API Endpoints

### Topics
```
GET    /api/courses/{courseId}/topics        - List all topics (public)
POST   /api/courses/{courseId}/topics        - Create topic (instructor)
PUT    /api/courses/{courseId}/topics/{id}   - Update topic (instructor)
DELETE /api/courses/{courseId}/topics/{id}   - Delete topic (instructor)
```

### Learning Materials
```
GET    /api/topics/{topicId}/materials       - List materials (public)
POST   /api/topics/{topicId}/materials       - Create material (instructor)
PUT    /api/topics/{topicId}/materials/{id}  - Update material (instructor)
DELETE /api/topics/{topicId}/materials/{id}  - Delete material (instructor)
```

### Student Progress
```
GET  /api/progress/enrollment/{enrollmentId}
PUT  /api/progress/enrollment/{enrollmentId}/material/{materialId}
POST /api/progress/enrollment/{enrollmentId}/material/{materialId}/start
GET  /api/progress/student/{studentId}/course/{courseId}
```

---

## 🎨 UI Components

### Glassmorphic Design System
All new pages use:
- `backdrop-blur-xl` for frosted glass effect
- `bg-white/10` for semi-transparent backgrounds
- `border border-white/20` for subtle borders
- Gradient overlays for depth
- Smooth animations with Framer Motion

### 3D Effects
- Three.js Canvas with React Three Fiber
- Floating animations (@react-three/drei)
- Auto-rotating camera
- Environment lighting
- Particle systems

---

## 🔐 User Roles & Access

### Student
- ✅ View all topics and materials
- ✅ Track progress per material
- ✅ View progress dashboard
- ✅ Enroll in courses

### Instructor
- ✅ All student permissions
- ✅ Create/edit/delete topics
- ✅ Create/edit/delete materials
- ✅ View student progress

### Admin
- ✅ All permissions
- ✅ User management
- ✅ System administration

---

## 📊 Database Schema

### New Tables
```sql
-- Topics table
CREATE TABLE topic (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT,
  title VARCHAR(255),
  description TEXT,
  order_index INT,
  is_published BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Learning Materials table
CREATE TABLE learning_material (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  topic_id BIGINT,
  title VARCHAR(255),
  description TEXT,
  material_type VARCHAR(50),
  content_url TEXT,
  video_url TEXT,
  pdf_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INT,
  file_size BIGINT,
  order_index INT,
  is_published BOOLEAN,
  is_free BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topic(id)
);

-- Student Progress table
CREATE TABLE student_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id BIGINT,
  learning_material_id BIGINT,
  completed BOOLEAN,
  progress_percentage INT,
  time_spent_seconds BIGINT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollment(id),
  FOREIGN KEY (learning_material_id) REFERENCES learning_material(id)
);
```

---

## 🧪 Testing

### Test User Creation
```bash
# Register as Student
POST http://localhost:8080/api/auth/register
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "role": "STUDENT"
}

# Register as Instructor
POST http://localhost:8080/api/auth/register
{
  "name": "Test Instructor",
  "email": "instructor@test.com",
  "password": "password123",
  "role": "INSTRUCTOR"
}
```

### Test Flow
1. Login as Instructor
2. Create a course
3. Add topics to course
4. Add materials to topics
5. Login as Student
6. Enroll in course
7. View topic-based course page
8. Click on materials to track progress
9. View progress dashboard

---

## 🎯 Material Types Supported

| Type | Description | Fields Used |
|------|-------------|-------------|
| VIDEO | Video content | videoUrl, thumbnailUrl, durationSeconds |
| PDF | PDF documents | pdfUrl, fileSize |
| LINK | External links | contentUrl |
| ARTICLE | Text articles | contentUrl |
| DOCUMENT | Other documents | contentUrl, fileSize |

---

## 📦 Project Structure

```
SkillForge/
├── backend/
│   └── src/main/java/com/example/SkillForge/
│       ├── controller/
│       │   ├── TopicController.java
│       │   ├── LearningMaterialController.java
│       │   └── StudentProgressController.java
│       ├── entity/
│       │   ├── Topic.java
│       │   ├── LearningMaterial.java
│       │   ├── StudentProgress.java
│       │   └── MaterialType.java
│       └── repository/
│           ├── TopicRepository.java
│           ├── LearningMaterialRepository.java
│           └── StudentProgressRepository.java
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage3D.jsx (New 3D homepage)
        │   ├── TopicBasedCoursePage.jsx (New course view)
        │   └── ProgressDashboard.jsx (New progress tracking)
        └── App.jsx (Updated routing)
```

---

## 🐛 Troubleshooting

### Frontend Issues
**Issue**: 3D page not loading
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Issue**: API calls failing
- Check `.env` file exists with correct VITE_API_URL
- Verify backend is running on port 8080
- Check browser console for CORS errors

### Backend Issues
**Issue**: Database connection failed
- Verify MySQL is running
- Check credentials in application.properties
- Ensure database `skillforge` exists

**Issue**: Compilation errors
```bash
# Clean and rebuild
./mvnw clean install
```

---

## 🚀 Deployment

### Frontend (Vite)
```bash
cd frontend
npm run build
# Deploy 'dist' folder to hosting (Vercel, Netlify, etc.)
```

### Backend (Spring Boot)
```bash
./mvnw clean package
java -jar target/SkillForge-0.0.1-SNAPSHOT.jar
```

---

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Spring Boot Guide](https://spring.io/guides)

---

**For detailed upgrade information, see** [UPGRADE_SUMMARY.md](./UPGRADE_SUMMARY.md)
