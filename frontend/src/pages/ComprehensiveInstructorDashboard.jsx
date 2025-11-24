import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentIcon,
  PlayIcon,
  AcademicCapIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

function ComprehensiveInstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentType, setContentType] = useState('VIDEO');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;
  const userEmail = decodedToken.sub;

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleContent(selectedModule.id);
    }
  }, [selectedModule]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/courses/instructor/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/courses/${courseId}/modules/manage`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await axios.post(
        'http://localhost:8080/api/courses',
        {
          title: formData.get('title'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price'))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCourses([...courses, response.data]);
      setIsModalOpen(false);
      e.target.reset();
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setActiveTab('modules');
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await axios.post(
        `http://localhost:8080/api/courses/${selectedCourse.id}/modules`,
        {
          title: formData.get('title'),
          description: formData.get('description')
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      fetchModules(selectedCourse.id);
      setShowModuleModal(false);
      e.target.reset();
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Failed to create module');
    }
  };

  const handleContentUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let endpoint;
      if (contentType === 'VIDEO') {
        endpoint = `http://localhost:8080/api/modules/${selectedModule.id}/content/video`;
      } else {
        endpoint = `http://localhost:8080/api/modules/${selectedModule.id}/content/pdf`;
        formData.append('contentType', contentType);
      }
      
      const response = await axios.post(endpoint, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      
      fetchModuleContent(selectedModule.id);
      setShowContentModal(false);
      e.target.reset();
      alert('Content uploaded successfully!');
    } catch (error) {
      console.error('Error uploading content:', error);
      alert('Failed to upload content');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleContentPublish = async (contentId, isPublished) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/modules/${selectedModule.id}/content/${contentId}/publish`,
        null,
        {
          params: { published: !isPublished },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchModuleContent(selectedModule.id);
    } catch (error) {
      console.error('Error toggling content publish status:', error);
    }
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

  const renderCoursesList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create Course
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
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
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-600 font-bold">${course.price}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {course.modules?.length || 0} modules
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCourseSelect(course)}
                      className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200"
                      title="Manage Course"
                    >
                      <FolderIcon className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-100 text-gray-600 p-2 rounded hover:bg-gray-200">
                      <PencilIcon className="w-4 h-4" />
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

  const renderModulesManagement = () => (
    <div className="space-y-6">
      {selectedCourse && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCourse.title} - Modules
              </h2>
              <p className="text-gray-600">Manage course content and structure</p>
            </div>
            <button
              onClick={() => setShowModuleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Module
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Modules List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Course Modules</h3>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                      selectedModule?.id === module.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          module.isPublished ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Content */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              {selectedModule ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {selectedModule.title} - Content
                    </h3>
                    <button
                      onClick={() => setShowContentModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <ArrowUpTrayIcon className="w-5 h-5" />
                      Add Content
                    </button>
                  </div>

                  <div className="space-y-4">
                    {moduleContent.map((content) => (
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
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleContentPublish(content.id, content.isPublished)}
                              className={`p-2 rounded ${
                                content.isPublished
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={content.isPublished ? 'Published' : 'Draft'}
                            >
                              {content.isPublished ? (
                                <CheckCircleIcon className="w-5 h-5" />
                              ) : (
                                <XCircleIcon className="w-5 h-5" />
                              )}
                            </button>
                            <button className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FolderIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a module to manage its content</p>
                </div>
              )}
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
            Instructor Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {userEmail}!</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('courses');
                setSelectedCourse(null);
                setSelectedModule(null);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Modules & Content
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' && renderCoursesList()}
        {activeTab === 'modules' && renderModulesManagement()}

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
              <form onSubmit={handleCreateCourse}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Module Modal */}
        {showModuleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Module</h3>
              <form onSubmit={handleCreateModule}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Content Modal */}
        {showContentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Add Content to {selectedModule?.title}</h3>
              <form onSubmit={handleContentUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="PDF_NOTES">PDF Notes</option>
                    <option value="PDF_QUESTIONS">PDF Questions</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File ({contentType === 'VIDEO' ? 'Video' : 'PDF'})
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept={contentType === 'VIDEO' ? 'video/*' : '.pdf'}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {contentType === 'VIDEO' ? 'Max size: 100MB' : 'Max size: 10MB'}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFree"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make this content free</span>
                  </label>
                </div>
                
                {isUploading && (
                  <div className="mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContentModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Add Content'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComprehensiveInstructorDashboard;