import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  BookOpenIcon, PlayIcon, DocumentIcon, QuestionMarkCircleIcon,
  CheckCircleIcon, ClockIcon, StarIcon, AcademicCapIcon
} from '@heroicons/react/24/outline';

const ComprehensiveStudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  
  // Early return if no user or token
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the student dashboard.</p>
        </div>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState('browse');
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(false);

  // Configure axios defaults (function to get fresh token)
  const getAxiosConfig = () => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchEnrolledCourses();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourses = async () => {
    if (!token) {
      console.warn('No token available for fetching courses');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses', getAxiosConfig());
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    if (!token) {
      console.warn('No token available for fetching enrolled courses');
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:8080/api/student/enrolled-courses', getAxiosConfig());
      setEnrolledCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    }
  };

  const fetchCourseContent = async (courseId) => {
    if (!token || !courseId) {
      console.warn('Missing token or courseId for fetching content');
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:8080/api/courses/${courseId}/modules`, getAxiosConfig());
      setCourseContent(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching course content:', error);
      setCourseContent([]);
    }
  };

  const enrollInCourse = async (courseId) => {
    if (!token || !courseId) {
      alert('Missing authentication or course information');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:8080/api/student/enroll/${courseId}`, {}, getAxiosConfig());
      if (response.data.success) {
        alert('Successfully enrolled in course!');
        fetchEnrolledCourses();
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchCourseContent(course.id);
    setActiveTab('learning');
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO':
        return <PlayIcon className="w-5 h-5 text-blue-500" />;
      case 'PDF_NOTES':
        return <DocumentIcon className="w-5 h-5 text-green-500" />;
      case 'PDF_QUESTIONS':
        return <DocumentIcon className="w-5 h-5 text-orange-500" />;
      case 'QUIZ':
        return <QuestionMarkCircleIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <BookOpenIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderCourseBrowser = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Browse Courses</h2>
      </div>

      {loading && <div className="text-center py-8">Loading courses...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {course.thumbnailUrl && (
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.5 (120 reviews)</span>
                </div>
                <span className="text-green-600 font-semibold text-lg">${course.price}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>12 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>Beginner</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCourseSelect(course)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-center"
                >
                  Preview
                </button>
                <button
                  onClick={() => enrollInCourse(course.id)}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnrolledCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No enrolled courses</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
          <div className="mt-6">
            <button
              onClick={() => setActiveTab('browse')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Courses
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((enrollment) => (
          <div key={enrollment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {enrollment.course?.thumbnailUrl && (
              <img 
                src={enrollment.course.thumbnailUrl} 
                alt={enrollment.course.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{enrollment.course?.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{enrollment.course?.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{enrollment.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${enrollment.progressPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded ${
                  enrollment.progressPercentage === 100 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {enrollment.progressPercentage === 100 ? 'Completed' : 'In Progress'}
                </span>
              </div>

              <button
                onClick={() => handleCourseSelect(enrollment.course)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLearningInterface = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          {selectedCourse && (
            <p className="text-gray-600">Learning: {selectedCourse.title}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('enrolled')}
            className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
          >
            Back to My Courses
          </button>
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {selectedCourse.thumbnailUrl && (
              <img 
                src={selectedCourse.thumbnailUrl} 
                alt={selectedCourse.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{selectedCourse.title}</h3>
              <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Price: ${selectedCourse.price}</span>
                <span>Status: {selectedCourse.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {courseContent.map((module, moduleIndex) => (
          <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">
                  Module {module.moduleOrder}: {module.title}
                </h4>
                <span className={`px-2 py-1 rounded text-sm ${
                  module.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {module.isPublished ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{module.description}</p>
            </div>
            
            <div className="p-6">
              {module.content && module.content.length > 0 ? (
                <div className="space-y-3">
                  {module.content.map((content, contentIndex) => (
                    <div key={content.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                      {getContentIcon(content.contentType)}
                      <div className="flex-1">
                        <h5 className="font-medium">{content.title}</h5>
                        <p className="text-sm text-gray-600">{content.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{content.contentType}</span>
                        <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded">
                          {content.contentType === 'VIDEO' ? 'Watch' : 
                           content.contentType === 'QUIZ' ? 'Take Quiz' : 'View'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No content available for this module yet.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {courseContent.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No modules available</h3>
          <p className="mt-1 text-sm text-gray-500">The instructor hasn't added any modules yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.firstName}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Courses
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'learning'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Learning
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'browse' && renderCourseBrowser()}
          {activeTab === 'enrolled' && renderEnrolledCourses()}
          {activeTab === 'learning' && renderLearningInterface()}
        </div>
      </main>
    </div>
  );
};

export default ComprehensiveStudentDashboard;