import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  VideoCameraIcon,
  DocumentIcon,
  AcademicCapIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const EnhancedInstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContents, setModuleContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showUploadContent, setShowUploadContent] = useState(false);
  const [contentType, setContentType] = useState('VIDEO'); // VIDEO, PDF_NOTES, PDF_QUESTIONS, QUIZ
  
  // Upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch instructor courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/instructor', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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

  // Fetch course modules
  const fetchModules = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/manage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      setModules(data.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
    }
  };

  // Fetch module contents
  const fetchModuleContents = async (moduleId) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/content/manage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setModuleContents(data.content || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      setModuleContents([]);
    }
  };

  // Create new course
  const handleCreateCourse = async (courseData) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData)
      });
      
      if (!response.ok) throw new Error('Failed to create course');
      await fetchCourses();
      setShowCreateCourse(false);
    } catch (err) {
      setError('Failed to create course');
      console.error('Error creating course:', err);
    }
  };

  // Create new module
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const formData = new FormData(e.target);
    const moduleData = {
      title: formData.get('title'),
      description: formData.get('description'),
      isPublished: false
    };

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(moduleData)
      });
      
      if (!response.ok) throw new Error('Failed to create module');
      await fetchModules(selectedCourse.id);
      setShowCreateModule(false);
      e.target.reset();
    } catch (err) {
      setError('Failed to create module');
      console.error('Error creating module:', err);
    }
  };

  // Upload content
  const handleUploadContent = async (e) => {
    e.preventDefault();
    if (!selectedModule || !uploadFile) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);

    try {
      let endpoint = '';
      if (contentType === 'VIDEO') {
        endpoint = `/api/modules/${selectedModule.id}/content/video`;
      } else if (contentType === 'PDF_NOTES' || contentType === 'PDF_QUESTIONS') {
        endpoint = `/api/modules/${selectedModule.id}/content/pdf`;
        formData.append('contentType', contentType);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload content');
      await fetchModuleContents(selectedModule.id);
      setShowUploadContent(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
    } catch (err) {
      setError('Failed to upload content');
      console.error('Error uploading content:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  // Toggle publish status
  const togglePublish = async (type, id, currentStatus) => {
    try {
      let endpoint = '';
      if (type === 'module') {
        endpoint = `/api/courses/${selectedCourse.id}/modules/${id}/publish?published=${!currentStatus}`;
      } else if (type === 'content') {
        endpoint = `/api/modules/${selectedModule.id}/content/${id}/publish?published=${!currentStatus}`;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to update publish status');
      
      if (type === 'module') {
        await fetchModules(selectedCourse.id);
      } else {
        await fetchModuleContents(selectedModule.id);
      }
    } catch (err) {
      setError('Failed to update publish status');
      console.error('Error updating publish status:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse.id);
      setSelectedModule(null);
      setModuleContents([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleContents(selectedModule.id);
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
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Instructor Dashboard</h1>
          <p className="text-gray-600">Create and manage courses with modules, videos, PDFs, and quizzes</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Course
                </button>
              </div>

              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors $${
                      selectedCourse?.id === course.id
                        ? 'bg-indigo-100 border-2 border-indigo-300'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs $${
                        course.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        ${course.courseModules?.length || 0} modules
                      </span>
                    </div>
                  </div>
                ))}

                {courses.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No courses yet. Create your first course!</p>
                )}
              </div>
            </div>
          </div>

          {/* Modules Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCourse ? `${selectedCourse.title} - Modules` : 'Select Course'}
                </h2>
                {selectedCourse && (
                  <button
                    onClick={() => setShowCreateModule(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    New Module
                  </button>
                )}
              </div>

              {selectedCourse ? (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors $${
                        selectedModule?.id === module.id
                          ? 'bg-green-100 border-2 border-green-300'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {index + 1}. {module.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs $${
                              module.isPublished 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {module.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {module.moduleContents?.length || 0} items
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublish('module', module.id, module.isPublished);
                          }}
                          className={`ml-2 p-1 rounded $${
                            module.isPublished 
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {module.isPublished ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {modules.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No modules yet. Create your first module!</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Select a course to view modules</p>
              )}
            </div>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedModule ? `${selectedModule.title} - Content` : 'Select Module'}
                </h2>
                {selectedModule && (
                  <button
                    onClick={() => setShowUploadContent(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center gap-1"
                  >
                    <CloudArrowUpIcon className="w-4 h-4" />
                    Add Content
                  </button>
                )}
              </div>

              {selectedModule ? (
                <div className="space-y-3">
                  {moduleContents.map((content, index) => (
                    <div
                      key={content.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getContentIcon(content.contentType)}
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {index + 1}. {content.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{content.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs $${
                                content.isPublished 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {content.isPublished ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {content.contentType.replace('_', ' ')}
                              </span>
                              {content.isFree && (
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Free Preview
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePublish('content', content.id, content.isPublished)}
                          className={`ml-2 p-1 rounded $${
                            content.isPublished 
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {content.isPublished ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {moduleContents.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No content yet. Add videos, PDFs, or quizzes!</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Select a module to view content</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCreateCourse({
                title: formData.get('title'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')) || 0,
                thumbnailUrl: '/api/placeholder/course-thumbnail'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCourse(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Module</h3>
            <form onSubmit={handleCreateModule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Module Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModule(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Content Modal */}
      {showUploadContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Content</h3>
            <form onSubmit={handleUploadContent}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="PDF_NOTES">PDF Notes</option>
                    <option value="PDF_QUESTIONS">PDF Questions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File ({contentType === 'VIDEO' ? 'Video files' : 'PDF files only'})
                  </label>
                  <input
                    type="file"
                    accept={contentType === 'VIDEO' ? 'video/*' : '.pdf'}
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadContent(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInstructorDashboard;