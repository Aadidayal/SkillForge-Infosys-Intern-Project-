import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';
import { 
  PlayIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

function ComprehensiveStudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [loading, setLoading] = useState(true);
  const [enrollmentProgress, setEnrollmentProgress] = useState({});
  
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;
  const userEmail = decodedToken.sub;

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAvailableCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseModules(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleContent(selectedModule.id);
    }
  }, [selectedModule]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/enrollments/student/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEnrolledCourses(response.data.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/courses',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAvailableCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseModules = async (courseId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/courses/${courseId}/modules`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCourseModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching course modules:', error);
    }
  };

  const fetchModuleContent = async (moduleId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/modules/${moduleId}/content`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setModuleContent(response.data.content || []);
    } catch (error) {
      console.error('Error fetching module content:', error);
    }
  };

  const handleEnrollInCourse = async (courseId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/courses/${courseId}/enroll`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh the data
      fetchEnrolledCourses();
      fetchAvailableCourses();
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. You might already be enrolled or the course might be full.');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setActiveTab('learning');
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <PlayIcon className="w-5 h-5" />;
      case 'PDF_NOTES': return <DocumentTextIcon className="w-5 h-5" />;
      case 'PDF_QUESTIONS': return <ClipboardDocumentListIcon className="w-5 h-5" />;
      case 'QUIZ': return <AcademicCapIcon className="w-5 h-5" />;
      default: return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'VIDEO': return 'bg-blue-100 text-blue-800';
      case 'PDF_NOTES': return 'bg-green-100 text-green-800';
      case 'PDF_QUESTIONS': return 'bg-orange-100 text-orange-800';
      case 'QUIZ': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.course.id === courseId);
  };

  const renderEnrolledCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpenIcon className="w-12 h-12 mx-auto mb-4" />
          <p>You haven't enrolled in any courses yet.</p>
          <button
            onClick={() => setActiveTab('available')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Available Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={enrollment.course.thumbnailUrl || 'https://via.placeholder.com/300x200?text=Course+Thumbnail'}
                alt={enrollment.course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{enrollment.course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {enrollment.course.description?.length > 100
                    ? enrollment.course.description.substring(0, 100) + '...'
                    : enrollment.course.description}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(enrollment.progressPercentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${enrollment.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-500">
                      <StarIcon className="w-4 h-4 fill-current" />
                      <span className="text-sm ml-1">4.8</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}</span>
                  </div>
                  <button
                    onClick={() => handleCourseSelect(enrollment.course)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 text-sm font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAvailableCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.filter(course => !isEnrolled(course.id)).map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={course.thumbnailUrl || 'https://via.placeholder.com/300x200?text=Course+Thumbnail'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {course.description?.length > 100
                    ? course.description.substring(0, 100) + '...'
                    : course.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-600 font-bold text-lg">${course.price}</span>
                  <div className="flex items-center text-yellow-500">
                    <StarIcon className="w-4 h-4 fill-current" />
                    <span className="text-sm ml-1">4.8</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    By {course.instructor?.firstName} {course.instructor?.lastName}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCourseSelect(course)}
                      className="bg-gray-100 text-gray-600 p-2 rounded hover:bg-gray-200"
                      title="Preview Course"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEnrollInCourse(course.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLearningInterface = () => (
    <div className="space-y-6">
      {selectedCourse && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-gray-600 mt-2">{selectedCourse.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-gray-500">
                    Instructor: {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}
                  </span>
                  <span className="text-sm text-gray-500">
                    Price: ${selectedCourse.price}
                  </span>
                </div>
              </div>
              {!isEnrolled(selectedCourse.id) && (
                <button
                  onClick={() => handleEnrollInCourse(selectedCourse.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Course Modules Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Course Content</h3>
                <div className="space-y-2">
                  {courseModules.map((module, index) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setSelectedModule(module)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedModule?.id === module.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">
                              {index + 1}. {module.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {module.description}
                            </p>
                          </div>
                          {isEnrolled(selectedCourse.id) ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <LockClosedIcon className="w-4 h-4 text-gray-400" />
                          )}\n                        </div>\n                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {selectedModule ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4">{selectedModule.title}</h3>
                    <p className="text-gray-600 mb-6">{selectedModule.description}</p>

                    {isEnrolled(selectedCourse.id) ? (
                      <div className="space-y-4">
                        {moduleContent.map((content, index) => (
                          <div key={content.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getContentTypeColor(content.contentType)}`}>
                                  {getContentIcon(content.contentType)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{content.title}</h4>
                                  <p className="text-sm text-gray-500">{content.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 rounded text-xs ${getContentTypeColor(content.contentType)}`}>
                                      {content.contentType.replace('_', ' ')}
                                    </span>
                                    {content.isFree && (
                                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                        FREE
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      • {index + 1} of {moduleContent.length}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedContent(content)}
                                className="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 text-sm font-medium"
                              >
                                {content.contentType === 'VIDEO' ? 'Watch' : 
                                 content.contentType === 'QUIZ' ? 'Take Quiz' : 'Read'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <LockClosedIcon className="w-12 h-12 mx-auto mb-4" />
                        <p>Enroll in this course to access the content</p>
                        <button
                          onClick={() => handleEnrollInCourse(selectedCourse.id)}
                          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Enroll Now - ${selectedCourse.price}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpenIcon className="w-12 h-12 mx-auto mb-4" />
                    <p>Select a module from the sidebar to view its content</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {userEmail}!</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('enrolled');
                setSelectedCourse(null);
                setSelectedModule(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => {
                setActiveTab('available');
                setSelectedCourse(null);
                setSelectedModule(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Courses
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

        {/* Tab Content */}
        {activeTab === 'enrolled' && renderEnrolledCourses()}
        {activeTab === 'available' && renderAvailableCourses()}
        {activeTab === 'learning' && renderLearningInterface()}

        {/* Content Viewer Modal */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedContent.title}</h3>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">{selectedContent.description}</p>
              </div>

              {selectedContent.contentType === 'VIDEO' && selectedContent.videoUrl && (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <video 
                    controls 
                    className="w-full h-full"
                    src={selectedContent.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {selectedContent.contentType.startsWith('PDF_') && selectedContent.fileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DocumentIcon className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="font-medium">PDF Document</p>
                        <p className="text-sm text-gray-500">
                          {selectedContent.contentType === 'PDF_NOTES' ? 'Course Notes' : 'Practice Questions'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedContent.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Open PDF
                    </a>
                  </div>
                </div>
              )}

              {selectedContent.contentType === 'QUIZ' && (
                <div className="text-center py-8">
                  <AcademicCapIcon className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h4 className="text-lg font-semibold mb-2">Quiz Available</h4>
                  <p className="text-gray-600 mb-4">Test your knowledge with this quiz</p>
                  <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                    Start Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComprehensiveStudentDashboard;