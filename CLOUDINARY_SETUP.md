# 🎥 **SkillForge Video Management System Setup Guide**

## 📊 **Current Implementation Status**

### ✅ **Completed Components**
- 🗄️ **Database Entities**: `Course.java`, `Video.java`, `Enrollment.java`
- 🔧 **Service Layer**: `CloudinaryVideoService.java` with full CRUD operations
- 🌐 **REST Endpoints**: `VideoController.java` with upload/stream/delete endpoints
- ⚙️ **Configuration**: `CloudinaryConfig.java` and dependencies in `pom.xml`

---

## 🚀 **Step 6: Configure Your Cloudinary Account**

### 1. **Create Free Cloudinary Account**
```bash
# Visit: https://cloudinary.com/users/register/free
# Benefits: 25GB storage + 25GB monthly bandwidth (FREE)
```

### 2. **Get Your Credentials**
After signup, go to **Dashboard** and copy:
- **Cloud Name**: `your-cloud-name`
- **API Key**: `123456789012345`  
- **API Secret**: `your-secret-key`

### 3. **Update Application Properties**
```properties
# Replace in: src/main/resources/application.properties

# Cloudinary Configuration
cloudinary.cloud-name=your-actual-cloud-name
cloudinary.api-key=your-actual-api-key
cloudinary.api-secret=your-actual-api-secret
```

---

## 🛠️ **API Endpoints Ready to Use**

### 📤 **Video Upload (Instructor Only)**
```http
POST /api/videos/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Form Data:
- file: video.mp4
- title: "Introduction to Spring Boot"  
- courseId: 1
```

### 📺 **Video Streaming (Students/Instructors)**
```http
GET /api/videos/{videoId}/stream
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "videoUrl": "https://res.cloudinary.com/your-cloud/video/upload/..."
}
```

### 🎬 **Set Free Preview (Instructor Only)**
```http
PUT /api/videos/{videoId}/preview?isPreview=true
Authorization: Bearer <jwt-token>
```

### 🗑️ **Delete Video (Instructor Only)**
```http
DELETE /api/videos/{videoId}
Authorization: Bearer <jwt-token>
```

---

## 🔐 **Access Control Features**

### **✅ Automatic Payment Verification**
- Students must **pay for course** to access non-preview videos
- **Free preview videos** are accessible to everyone
- **Instructors** can access all their course videos

### **✅ Security Features**
- File type validation (videos only)
- File size limits (100MB max)
- JWT authentication required
- Role-based access control

---

## 📱 **Frontend Integration Example**

### **Video Upload Form**
```html
<form id="video-upload">
  <input type="file" name="file" accept="video/*" required>
  <input type="text" name="title" placeholder="Video Title" required>
  <input type="hidden" name="courseId" value="1">
  <button type="submit">Upload Video</button>
</form>

<script>
document.getElementById('video-upload').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    },
    body: formData
  });
  
  const result = await response.json();
  console.log('Upload result:', result);
});
</script>
```

### **Video Player**
```html
<video id="course-video" controls width="800" height="450">
  <source id="video-source" src="" type="video/mp4">
  Your browser does not support the video tag.
</video>

<script>
async function loadVideo(videoId) {
  const response = await fetch(`/api/videos/${videoId}/stream`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    document.getElementById('video-source').src = result.videoUrl;
    document.getElementById('course-video').load();
  } else {
    alert(result.message);
  }
}
</script>
```

---

## 🎯 **Next Steps**

### **Immediate Actions:**
1. **Sign up** for Cloudinary account
2. **Copy credentials** to `application.properties`
3. **Build and run** your application
4. **Test video upload** with Postman/frontend

### **Optional Enhancements:**
- **Video compression** settings in Cloudinary
- **Custom video thumbnails**
- **Video progress tracking** for students
- **Batch video upload** functionality

---

## 💡 **Pro Tips**

### **🌟 Cloudinary Advantages:**
- **Automatic video optimization** and format conversion
- **Global CDN delivery** for fast streaming
- **Built-in thumbnails** generation
- **Mobile-friendly** adaptive streaming
- **99.9% uptime** reliability

### **🔧 Performance Tips:**
- Videos are uploaded **asynchronously**
- Check `VideoStatus.READY` before allowing playback
- Use Cloudinary's **auto quality** for optimal streaming
- Set reasonable **file size limits** (current: 100MB)

---

**🎉 Your SkillForge video system is now ready for production use!** Students can pay for courses and stream high-quality videos, while instructors can easily upload and manage their content.