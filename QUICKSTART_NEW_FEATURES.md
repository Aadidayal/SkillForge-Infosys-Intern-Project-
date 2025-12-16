# Quick Start Guide - GitHub Features Integration

## What's New?

Your SkillForge backend now has enhanced course management features adapted from the GitHub repository, while keeping your MySQL architecture.

## Key Enhancements

### 1. Enhanced Course Fields
Courses now support:
- **Difficulty Levels**: BEGINNER, INTERMEDIATE, ADVANCED
- **Learning Objectives**: List of what students will learn
- **Prerequisites**: Required knowledge before enrollment
- **Estimated Duration**: Course length in hours
- **Published Status**: Control course visibility
- **Featured Flag**: Highlight special courses

### 2. Topic-Based Structure
Instead of just modules, courses now use **Topics**:
- Topics organize course content logically
- Each topic contains multiple learning materials
- Auto-ordered by `orderIndex`
- Can be published/unpublished individually

### 3. Learning Materials
Flexible content types:
- **VIDEO**: Video lectures with duration tracking
- **PDF**: Downloadable documents
- **ARTICLE**: Text-based content
- **LINK**: External resources
- Materials can be marked as **free** even in paid courses

## Quick API Examples

### Create a Course (Enhanced)
```http
POST http://localhost:8080/api/courses
Authorization: Bearer {token}

{
  "title": "Complete Web Development",
  "description": "Master modern web development",
  "price": 99.99,
  "difficultyLevel": "BEGINNER",
  "estimatedDurationHours": 40,
  "learningObjectives": [
    "Build responsive websites with HTML/CSS",
    "Master JavaScript ES6+",
    "Create full-stack applications"
  ],
  "prerequisites": [
    "Basic computer skills",
    "Passion for learning"
  ],
  "isPublished": false,
  "isFeatured": false
}
```

### Add a Topic to Course
```http
POST http://localhost:8080/api/topics/course/1

{
  "title": "Introduction to HTML",
  "description": "Learn HTML basics and structure"
}
```

### Add Learning Material to Topic
```http
POST http://localhost:8080/api/learning-materials/topic/1

{
  "title": "HTML Tutorial Video",
  "description": "Comprehensive HTML5 tutorial",
  "materialType": "VIDEO",
  "videoUrl": "https://example.com/html-tutorial.mp4",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "durationSeconds": 1800,
  "isFree": true
}
```

### Get All Topics for a Course
```http
GET http://localhost:8080/api/topics/course/1
```

### Get All Materials for a Topic
```http
GET http://localhost:8080/api/learning-materials/topic/1
```

## Database Schema

After restarting your app, these tables will be created:

```sql
-- New tables
CREATE TABLE course_learning_objectives (
    course_id BIGINT,
    objective VARCHAR(500)
);

CREATE TABLE course_prerequisites (
    course_id BIGINT,
    prerequisite VARCHAR(500)
);

-- Modified tables (new columns added)
ALTER TABLE courses ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'BEGINNER';
ALTER TABLE courses ADD COLUMN estimated_duration_hours INT;
ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE enrollments ADD COLUMN overall_score DOUBLE DEFAULT 0.0;
ALTER TABLE enrollments ADD COLUMN enrollment_status VARCHAR(20) DEFAULT 'ACTIVE';
```

## Frontend Integration

### TypeScript Types
```typescript
// Add to your types file
export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum MaterialType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  ARTICLE = 'ARTICLE',
  LINK = 'LINK'
}

export interface CourseDto {
  id: number;
  title: string;
  description: string;
  price: number;
  difficultyLevel: SkillLevel;
  learningObjectives: string[];
  prerequisites: string[];
  estimatedDurationHours: number;
  isPublished: boolean;
  isFeatured: boolean;
  thumbnailUrl?: string;
}

export interface TopicDto {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
}

export interface LearningMaterialDto {
  id: number;
  topicId: number;
  title: string;
  description: string;
  materialType: MaterialType;
  contentUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  isFree: boolean;
  orderIndex: number;
  isPublished: boolean;
}
```

### React Components (Examples)

#### Course Card with Difficulty Badge
```tsx
function CourseCard({ course }: { course: CourseDto }) {
  const getDifficultyColor = (level: SkillLevel) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      case 'ADVANCED': return 'bg-red-500';
    }
  };

  return (
    <div className="course-card">
      <Badge className={getDifficultyColor(course.difficultyLevel)}>
        {course.difficultyLevel}
      </Badge>
      <h3>{course.title}</h3>
      <p>{course.estimatedDurationHours}h</p>
      {course.isFeatured && <Star className="featured-icon" />}
    </div>
  );
}
```

#### Topic List Component
```tsx
function TopicList({ courseId }: { courseId: number }) {
  const [topics, setTopics] = useState<TopicDto[]>([]);

  useEffect(() => {
    fetch(`/api/topics/course/${courseId}`)
      .then(res => res.json())
      .then(data => setTopics(data.object));
  }, [courseId]);

  return (
    <div>
      {topics.map(topic => (
        <TopicItem key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
```

## Workflow Example

### Creating a Complete Course

1. **Create Course** (with metadata)
   ```
   POST /api/courses
   → Returns course with id=1
   ```

2. **Add Topics**
   ```
   POST /api/topics/course/1
   → Topic "Introduction" created (id=1)
   
   POST /api/topics/course/1
   → Topic "Advanced Concepts" created (id=2)
   ```

3. **Add Materials to Topics**
   ```
   POST /api/learning-materials/topic/1
   → Video tutorial added
   
   POST /api/learning-materials/topic/1
   → PDF guide added
   
   POST /api/learning-materials/topic/2
   → Video lecture added
   ```

4. **Publish Course**
   ```
   PUT /api/courses/1
   { "isPublished": true }
   ```

## Testing

Test the new endpoints using the provided Postman collection or:

```bash
# Get all topics for course 1
curl http://localhost:8080/api/topics/course/1

# Get all materials for topic 1
curl http://localhost:8080/api/learning-materials/topic/1
```

## Existing Features Still Work

All your existing features continue to work:
- ✅ AI Quiz Generation (Gemini API)
- ✅ AI Interview System
- ✅ Student Progress Tracking
- ✅ JWT Authentication
- ✅ Payment Processing
- ✅ File Uploads (Cloudinary)

## Migration Path

1. **Immediate**: Use new fields for new courses
2. **Gradual**: Update existing courses with difficulty levels and objectives
3. **Optional**: Migrate from old Video structure to Topic/Material structure

## Support

- Full documentation: See `GITHUB_INTEGRATION.md`
- Database schema: Auto-created by Hibernate
- API reference: All endpoints follow same response format

## Success Indicators

After restarting your backend:
- ✅ Build successful (already confirmed)
- ✅ Database tables created automatically
- ✅ New endpoints accessible
- ✅ Existing features unaffected
- ✅ Ready for frontend integration

Start building modern, structured courses! 🚀
