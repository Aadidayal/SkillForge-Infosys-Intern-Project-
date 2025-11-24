import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpenIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  DocumentIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  UserIcon,
  AcademicCapIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const EnhancedCourseBrowser = ({ onEnroll }) => {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  // Fetch published courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/published', {
        headers: isAuthenticated() ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course preview (published modules only)
  const fetchCoursePreview = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/preview`, {
        headers: isAuthenticated() ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch course preview');
      const data = await response.json();
      setCourseModules(data.modules || []);
    } catch (err) {
      console.error('Error fetching course preview:', err);
      setCourseModules([]);
    }
  };

  // Fetch module preview (free content only)
  const fetchModulePreview = async (moduleId) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/preview`, {
        headers: isAuthenticated() ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch module preview');
      const data = await response.json();
      setModuleContent(data.content || []);
    } catch (err) {
      console.error('Error fetching module preview:', err);
      setModuleContent([]);
    }
  };

  // Enroll in course
  const handleEnroll = async (courseId) => {
    if (!isAuthenticated()) {
      setError('Please login to enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch('/api/enrollments/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ courseId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll in course');
      }

      const enrollment = await response.json();
      if (onEnroll) onEnroll(enrollment);
      
      // Update the course in the list to show enrollment status
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isEnrolled: true }
          : course
      ));
      
    } catch (err) {
      setError(err.message);
      console.error('Error enrolling in course:', err);
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCoursePreview(selectedCourse.id);
      setSelectedModule(null);
      setModuleContent([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      fetchModulePreview(selectedModule.id);
    }
  }, [selectedModule]);

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO': return <PlayCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'PDF_NOTES': return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      case 'PDF_QUESTIONS': return <DocumentIcon className="w-5 h-5 text-orange-500" />;
      case 'QUIZ': return <QuestionMarkCircleIcon className="w-5 h-5 text-purple-500" />;
      default: return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
        <p className="text-gray-600">Discover amazing courses with interactive modules, videos, PDFs, and quizzes</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpenIcon className="w-6 h-6 text-indigo-600" />
              Available Courses
            </h2>

            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedCourse?.id === course.id
                      ? 'bg-indigo-100 border-indigo-300 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-start gap-3">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{course.instructor?.name || 'Instructor'}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600 text-lg">
                            {formatPrice(course.price)}
                          </span>
                          {course.courseModules && (
                            <span className="text-xs text-gray-500">
                              {course.courseModules.length} modules
                            </span>
                          )}
                        </div>
                        
                        {course.isEnrolled ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircleIcon className="w-4 h-4" />
                            Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnroll(course.id);
                            }}
                            disabled={enrolling}
                            className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            {enrolling ? 'Enrolling...' : 'Enroll'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No courses available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedCourse ? `${selectedCourse.title} - Preview` : 'Select Course'}
            </h2>

            {selectedCourse ? (
              <div className="space-y-4">
                {/* Course Info */}
                <div className="border-b pb-4">
                  <p className="text-gray-600 mb-3">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {selectedCourse.instructor?.name || 'Instructor'}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpenIcon className="w-4 h-4" />
                      {courseModules.length} modules
                    </div>
                  </div>
                </div>

                {/* Modules List */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Course Modules</h3>
                  {courseModules.map((module, index) => (
                    <div
                      key={module.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedModule?.id === module.id
                          ? 'bg-green-100 border-green-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {index + 1}. {module.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-blue-600">
                              {module.moduleContents?.filter(c => c.isFree).length || 0} free previews
                            </span>
                            <span className="text-xs text-gray-500">
                              {module.moduleContents?.length || 0} total items
                            </span>
                          </div>
                        </div>
                        <EyeIcon className="w-4 h-4 text-gray-400 ml-2" />
                      </div>
                    </div>
                  ))}

                  {courseModules.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No modules available for preview
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a course to view preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Module Content Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedModule ? `${selectedModule.title} - Content` : 'Select Module'}
            </h2>

            {selectedModule ? (
              <div className="space-y-3">
                {moduleContent.map((content, index) => (
                  <div
                    key={content.id}
                    className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      {getContentIcon(content.contentType)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {index + 1}. {content.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {content.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-600">
                            {content.contentType.replace('_', ' ')}
                          </span>
                          {content.isFree && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Free Preview
                            </span>
                          )}
                          {!content.isFree && (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Premium
                            </span>
                          )}
                          {content.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {moduleContent.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No preview content available</p>
                  </div>
                )}

                {/* Enrollment CTA */}
                {!selectedCourse?.isEnrolled && moduleContent.length > 0 && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-medium text-indigo-900 mb-2">Want to see more?</h4>
                    <p className="text-sm text-indigo-700 mb-3">
                      Enroll in this course to access all content including videos, PDFs, and quizzes.
                    </p>
                    <button
                      onClick={() => handleEnroll(selectedCourse.id)}
                      disabled={enrolling}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {enrolling ? 'Enrolling...' : `Enroll Now - ${formatPrice(selectedCourse.price)}`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <PlayCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a module to preview content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCourseBrowser;