import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  PlusIcon, VideoCameraIcon, DocumentIcon, QuestionMarkCircleIcon,
  AcademicCapIcon, UserGroupIcon, ChartBarIcon, ClockIcon,
  XMarkIcon, CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const ComprehensiveInstructorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  
  // Early return if no user or token
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the instructor dashboard.</p>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', price: '', category: '', thumbnail: null
  });
  const [moduleForm, setModuleForm] = useState({
    title: '', description: '', moduleOrder: 1
  });
  const [contentForm, setContentForm] = useState({
    moduleId: '', contentType: 'VIDEO', title: '', description: '', file: null
  });

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
      
      // Try to recover selected course from sessionStorage
      const savedCourse = sessionStorage.getItem('selectedCourse');
      if (savedCourse) {
        try {
          const course = JSON.parse(savedCourse);
          setSelectedCourse(course);
          fetchModules(course.id);
        } catch (error) {
          console.error('Error parsing saved course:', error);
          sessionStorage.removeItem('selectedCourse');
        }
      }
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourses = async () => {
    if (!token) {
      console.warn('No token available for fetching courses');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses/instructor', getAxiosConfig());
      if (response.data.success) {
        setCourses(response.data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      if (error.response?.status === 403) {
        console.error('Access denied. Please make sure you are logged in as an instructor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleContent = async (moduleId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/modules/${moduleId}/content/manage`, getAxiosConfig());
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching content for module', moduleId, ':', error);
      return [];
    }
  };

  const fetchModules = async (courseId) => {
    if (!token || !courseId) {
      console.warn('Missing token or courseId for fetching modules');
      return;
    }
    
    try {
      console.log('Fetching modules for course:', courseId);
      const response = await axios.get(`http://localhost:8080/api/courses/${courseId}/modules/manage`, getAxiosConfig());
      console.log('Modules API response:', response.data);
      
      // Handle different response structures
      let modulesData = [];
      if (response.data && response.data.modules && Array.isArray(response.data.modules)) {
        modulesData = response.data.modules;
      } else if (Array.isArray(response.data)) {
        modulesData = response.data;
      }
      
      // Fetch content for each module
      const modulesWithContent = await Promise.all(
        modulesData.map(async (module) => {
          const content = await fetchModuleContent(module.id);
          return { ...module, content };
        })
      );
      
      console.log('Setting modules with content:', modulesWithContent);
      setModules(modulesWithContent);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('price', courseForm.price);
      if (courseForm.category) formData.append('category', courseForm.category);
      if (courseForm.thumbnail) formData.append('thumbnail', courseForm.thumbnail);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.post('http://localhost:8080/api/courses', formData, config);
      if (response.data.success) {
        setShowCourseModal(false);
        setCourseForm({ title: '', description: '', price: '', category: '', thumbnail: null });
        fetchCourses();
        alert('Course created successfully!');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const createModule = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Authentication required. Please log in again.');
      return;
    }
    
    if (!selectedCourse?.id) {
      alert('No course selected. Please select a course first.');
      setActiveTab('courses');
      setShowModuleModal(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // First create the module
      const moduleData = {
        title: moduleForm.title,
        description: moduleForm.description,
        moduleOrder: moduleForm.moduleOrder
      };
      
      const moduleResponse = await axios.post(
        `http://localhost:8080/api/courses/${selectedCourse.id}/modules`,
        moduleData,
        getAxiosConfig()
      );
      
      const createdModule = moduleResponse.data;
      console.log('Module creation response:', moduleResponse.data);
      console.log('Created module:', createdModule);
      
      alert('Module created successfully!');
      
      setShowModuleModal(false);
      setModuleForm({ title: '', description: '', moduleOrder: 1 });
      setUploadProgress(0);
      
      // Add a small delay then refresh modules to ensure backend processing is complete
      console.log('Scheduling module refresh for course:', selectedCourse.id);
      setTimeout(() => {
        console.log('Executing delayed module refresh...');
        fetchModules(selectedCourse.id);
      }, 500);
      
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error creating module: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const uploadContent = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!contentForm.file) {
      alert('Please select a file to upload');
      return;
    }
    
    if (!contentForm.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!contentForm.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', contentForm.title.trim());
      formData.append('description', contentForm.description.trim());
      formData.append('isFree', 'false'); // Default to paid content
      formData.append('file', contentForm.file);

      // For PDF uploads, add contentType parameter
      if (contentForm.contentType !== 'VIDEO') {
        formData.append('contentType', contentForm.contentType);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      // Determine the correct endpoint based on content type
      const endpoint = contentForm.contentType === 'VIDEO' 
        ? `http://localhost:8080/api/modules/${contentForm.moduleId}/content/video`
        : `http://localhost:8080/api/modules/${contentForm.moduleId}/content/pdf`;
      
      console.log('Uploading to endpoint:', endpoint);
      console.log('Form data:', Object.fromEntries(formData));
      console.log('Content type:', contentForm.contentType);
      console.log('File:', contentForm.file);
      
      const response = await axios.post(endpoint, formData, config);
      
      setShowContentModal(false);
      setContentForm({ moduleId: '', contentType: 'VIDEO', title: '', description: '', file: null });
      setUploadProgress(0);
      alert('Content uploaded successfully!');
      
      // Refresh modules to show new content
      if (selectedCourse?.id) {
        fetchModules(selectedCourse.id);
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      alert('Error uploading content: ' + (error.response?.data?.error || error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    if (!course || !course.id) {
      console.error('Invalid course selection:', course);
      alert('Invalid course selection. Please try again.');
      return;
    }
    
    console.log('Course selected:', course);
    setSelectedCourse(course);
    fetchModules(course.id);
    setActiveTab('modules');
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('selectedCourse', JSON.stringify(course));
  };

  const publishCourse = async (courseId, publish = true) => {
    if (!token || !courseId) {
      alert('Authentication required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8080/api/courses/${courseId}/publish?publish=${publish}`,
        {},
        getAxiosConfig()
      );
      
      if (response.data.success) {
        alert(response.data.message);
        fetchCourses(); // Refresh courses to show updated status
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={() => setShowCourseModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Create Course
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading courses...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {course.thumbnailUrl && (
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-green-600 font-semibold">${course.price}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleCourseSelect(course)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Manage Course
                </button>
                
                {course.status === 'PUBLISHED' ? (
                  <button
                    onClick={() => publishCourse(course.id, false)}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    🔒 Unpublish
                  </button>
                ) : (
                  <button
                    onClick={() => publishCourse(course.id, true)}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    🌟 Publish Course
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
          {selectedCourse ? (
            <div className="flex items-center gap-2">
              <p className="text-gray-600">Managing: <span className="font-semibold text-blue-600">{selectedCourse.title}</span></p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">ID: {selectedCourse.id}</span>
            </div>
          ) : (
            <p className="text-red-600">⚠️ No course selected. Please select a course from the Courses tab.</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
          >
            Back to Courses
          </button>
          <button
            onClick={() => selectedCourse && fetchModules(selectedCourse.id)}
            className="text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            disabled={!selectedCourse}
            title="Refresh module list"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => {
              if (!selectedCourse) {
                alert('Please select a course first');
                setActiveTab('courses');
                return;
              }
              setShowModuleModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedCourse}
          >
            <PlusIcon className="w-5 h-5" />
            Add Module
          </button>
        </div>
      </div>

      {!selectedCourse ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Course Selected</h3>
          <p className="text-gray-600 mb-6">Please select a course from the Courses tab to manage its modules.</p>
          <button
            onClick={() => setActiveTab('courses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {modules.length > 0 ? (
            modules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Module {module.moduleOrder}: {module.title}</h3>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded ${
                        module.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {module.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ID: {module.id}
                      </span>
                    </div>
                    
                    {/* Module Content Display */}
                    {module.content && module.content.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">📁 Module Content:</h4>
                        {module.content.map((content) => (
                          <div key={content.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {content.contentType === 'VIDEO' ? '🎥' : '📄'}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{content.title}</p>
                                <p className="text-xs text-gray-500">{content.contentType}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              content.isPublished ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {content.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setContentForm({ ...contentForm, moduleId: module.id });
                      setShowContentModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Content
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Modules Yet</h3>
              <p className="text-gray-600 mb-6">This course doesn't have any modules yet. Create your first module to get started!</p>
              <button
                onClick={() => setShowModuleModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Create First Module
              </button>
            </div>
          )}
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
                <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                🚪 Logout
              </button>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Courses
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {courses.length}
              </span>
            </button>
            <button
              onClick={() => {
                if (!selectedCourse) {
                  alert('Please select a course first to view modules');
                  return;
                }
                setActiveTab('modules');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : selectedCourse 
                    ? 'border-transparent text-gray-500 hover:text-gray-700'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
              }`}
              disabled={!selectedCourse}
            >
              📝 Modules
              {selectedCourse && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {modules.length}
                </span>
              )}
              {!selectedCourse && (
                <span className="text-gray-400 text-xs">
                  (Select course)
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'modules' && renderModules()}
        </div>
      </main>

      {/* Course Creation Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Create New Course</h3>
              <button onClick={() => setShowCourseModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={createCourse} className="space-y-4">
              <input
                type="text"
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Course Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full p-3 border rounded-lg h-24"
                required
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Category (Optional)"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.files[0] })}
                className="w-full p-3 border rounded-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Module Creation Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Create New Module</h3>
              <button onClick={() => setShowModuleModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={createModule} className="space-y-4">
              <input
                type="text"
                placeholder="Module Title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Module Description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                className="w-full p-3 border rounded-lg h-24"
                required
              />
              <input
                type="number"
                placeholder="Module Order"
                value={moduleForm.moduleOrder}
                onChange={(e) => setModuleForm({ ...moduleForm, moduleOrder: parseInt(e.target.value) })}
                className="w-full p-3 border rounded-lg"
                required
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating Module...' : 'Create Module'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content Upload Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add Content</h3>
              <button onClick={() => setShowContentModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={uploadContent} className="space-y-4">
              <select
                value={contentForm.contentType}
                onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="VIDEO">🎥 Video Content</option>
                <option value="PDF_NOTES">📄 PDF Notes</option>
                <option value="PDF_QUESTIONS">📝 PDF Questions/Assignments</option>
              </select>
              <input
                type="text"
                placeholder="Content Title"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Content Description"
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                className="w-full p-3 border rounded-lg h-24"
                required
              />
              <input
                type="file"
                accept={contentForm.contentType === 'VIDEO' ? 'video/*' : 'application/pdf,.pdf'}
                onChange={(e) => setContentForm({ ...contentForm, file: e.target.files[0] })}
                className="w-full p-3 border rounded-lg"
                required
              />
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? `Uploading... ${uploadProgress}%` : 'Upload Content'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveInstructorDashboard;