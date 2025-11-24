import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  BookOpenIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  DocumentIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const EnhancedStudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({});

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/enrollments/my-courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch enrolled courses');
      const data = await response.json();
      setEnrolledCourses(data.enrollments || []);
    } catch (err) {
      setError('Failed to load your courses');
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course modules
  const fetchCourseModules = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      setCourseModules(data.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setCourseModules([]);
    }
  };

  // Fetch module content
  const fetchModuleContent = async (moduleId) => {
    setContentLoading(true);
    try {
      const response = await fetch(`/api/modules/${moduleId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setModuleContent(data.content || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      setModuleContent([]);
    } finally {
      setContentLoading(false);
    }
  };

  // Fetch content details for viewing
  const fetchContentDetails = async (contentId) => {
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch content details');
      const data = await response.json();
      setSelectedContent(data);
    } catch (err) {
      console.error('Error fetching content details:', err);
      setError('Failed to load content');
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseModules(selectedCourse.id);
      setSelectedModule(null);
      setModuleContent([]);
      setSelectedContent(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleContent(selectedModule.id);
      setSelectedContent(null);
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

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600">Access your enrolled courses, modules, and learning materials</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enrolled Courses Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                My Courses
              </h2>

              <div className="space-y-3">
                {enrolledCourses.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors border-2 ${
                      selectedCourse?.id === enrollment.course.id
                        ? 'bg-indigo-100 border-indigo-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCourse(enrollment.course)}
                  >
                    <div className="flex items-start gap-3">
                      {enrollment.course.thumbnailUrl ? (
                        <img 
                          src={enrollment.course.thumbnailUrl}
                          alt={enrollment.course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{enrollment.course.title}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{enrollment.course.instructor?.name || 'Instructor'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-green-600 font-medium">
                            Enrolled {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {enrolledCourses.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No courses enrolled yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Modules Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedCourse ? `${selectedCourse.title} - Modules` : 'Select Course'}
              </h2>

              {selectedCourse ? (
                <div className="space-y-3">
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
                          <h3 className="font-medium text-gray-900 text-sm">
                            {index + 1}. {module.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-blue-600">
                              {module.moduleContents?.length || 0} items
                            </span>
                            {module.isPublished && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {courseModules.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No modules available</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Select a course to view modules</p>
                </div>
              )}
            </div>
          </div>

          {/* Module Content Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedModule ? `${selectedModule.title} - Content` : 'Select Module'}
              </h2>

              {selectedModule ? (
                contentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moduleContent.map((content, index) => (
                      <div
                        key={content.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                          selectedContent?.id === content.id
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => fetchContentDetails(content.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getContentIcon(content.contentType)}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {index + 1}. {content.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {content.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-600">
                                {content.contentType.replace('_', ' ')}
                              </span>
                              {content.isFree && (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  Free
                                </span>
                              )}
                              {content.duration && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {formatDuration(content.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {moduleContent.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">No content available</p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Select a module to view content</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Viewer Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Viewer</h2>

              {selectedContent ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {getContentIcon(selectedContent.contentType)}
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedContent.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedContent.description}</p>
                    </div>
                  </div>

                  {/* Video Content */}
                  {selectedContent.contentType === 'VIDEO' && selectedContent.contentUrl && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        controls 
                        className="w-full h-full"
                        poster={selectedContent.thumbnailUrl}
                      >
                        <source src={selectedContent.contentUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {/* PDF Content */}
                  {(selectedContent.contentType === 'PDF_NOTES' || selectedContent.contentType === 'PDF_QUESTIONS') && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <DocumentIcon className="w-5 h-5 text-red-500" />
                        <span className="font-medium">PDF Document</span>
                      </div>
                      {selectedContent.contentUrl ? (
                        <div className="space-y-2">
                          <a
                            href={selectedContent.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <DocumentIcon className="w-4 h-4" />
                            Open PDF
                          </a>
                          <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 text-center">
                              PDF preview not available<br/>
                              Click "Open PDF" to view
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">PDF content not available</p>
                      )}
                    </div>
                  )}

                  {/* Quiz Content */}
                  {selectedContent.contentType === 'QUIZ' && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Interactive Quiz</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Test your knowledge with this interactive quiz
                      </p>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Start Quiz
                      </button>
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Content Type:</span>
                      <span className="font-medium">{selectedContent.contentType.replace('_', ' ')}</span>
                    </div>
                    {selectedContent.duration && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{formatDuration(selectedContent.duration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Access:</span>
                      <span className={`font-medium ${selectedContent.isFree ? 'text-green-600' : 'text-blue-600'}`}>
                        {selectedContent.isFree ? 'Free Preview' : 'Enrolled Access'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PlayCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select content to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;