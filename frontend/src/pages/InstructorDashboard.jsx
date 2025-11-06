import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { instructorAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import VideoManager from '../components/VideoManager';
import CreateCourseModal from '../components/CreateCourseModal';
import CourseAnalytics from '../components/CourseAnalytics';
import { placeholders } from '../utils/placeholder';
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
  ChartPieIcon
} from '@heroicons/react/24/outline';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourseForVideos, setSelectedCourseForVideos] = useState(null);
  const [selectedCourseForAnalytics, setSelectedCourseForAnalytics] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/instructor', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend not available, using mock data');
        throw new Error('Non-JSON response received');
      }
      
      const result = await response.json();
      if (result.success) {
        setCourses(result.courses || []);
      } else {
        console.error('Failed to fetch courses:', result.message);
        // Fall back to mock data
        setCourses(getMockCourses());
      }
    } catch (error) {
      console.error('Error fetching courses (backend not available):', error.message);
      // Fall back to mock data on error
      setCourses(getMockCourses());
    }
  };

  const getMockCourses = () => [
    {
      id: 1,
      title: 'Introduction to React',
      students: 45,
      rating: 4.8,
      status: 'PUBLISHED',
      earnings: 1250,
      lastUpdated: '2024-01-15',
      thumbnailUrl: placeholders.reactCourse
    },
    {
      id: 2,
      title: 'Advanced JavaScript', 
      students: 32,
      rating: 4.9,
      status: 'PUBLISHED',
      earnings: 960,
      lastUpdated: '2024-01-10',
      thumbnailUrl: placeholders.javascriptCourse
    },
    {
      id: 3,
      title: 'Node.js Fundamentals',
      students: 28,
      rating: 4.7,
      status: 'DRAFT',
      earnings: 0,
      lastUpdated: '2024-01-20',
      thumbnailUrl: placeholders.nodejsCourse
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await instructorAPI.getDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        // Mock data for demo purposes
        setDashboardData({
          message: 'Welcome to your Instructor Dashboard!',
          totalCourses: 5,
          totalStudents: 127,
          totalRevenue: 3450,
          monthlyEarnings: 890
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchCourses();
  }, []);

  const handleCourseCreated = async (newCourse) => {
    // Refresh course list from API after successful creation
    await fetchCourses();
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCreateCourse(true); // Reuse the create modal for editing
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh course list after successful deletion
        await fetchCourses();
        setShowDeleteConfirm(null);
      } else {
        console.error('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const mockCourses = courses.length > 0 ? courses : [
    {
      id: 1,
      title: 'Introduction to React',
      students: 45,
      rating: 4.8,
      status: 'Published',
      earnings: 1250,
      lastUpdated: '2024-01-15',
      thumbnail: placeholders.reactCourse
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      students: 32,
      rating: 4.9,
      status: 'Published',
      earnings: 960,
      lastUpdated: '2024-01-10',
      thumbnail: placeholders.javascriptCourse
    },
    {
      id: 3,
      title: 'Node.js Fundamentals',
      students: 28,
      rating: 4.7,
      status: 'Draft',
      earnings: 0,
      lastUpdated: '2024-01-20',
      thumbnail: placeholders.nodejsCourse
    },
    {
      id: 4,
      title: 'Database Design',
      students: 22,
      rating: 4.6,
      status: 'Published',
      earnings: 680,
      lastUpdated: '2024-01-08',
      thumbnail: placeholders.databaseCourse
    }
  ];

  const mockRecentActivity = [
    { type: 'enrollment', message: 'New student enrolled in React course', time: '2 hours ago' },
    { type: 'review', message: 'Received 5-star review on JavaScript course', time: '4 hours ago' },
    { type: 'completion', message: '3 students completed Database Design', time: '1 day ago' },
    { type: 'question', message: 'New question posted in React course', time: '2 days ago' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Instructor Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your courses and track student progress
              </p>
            </div>
            <button
              onClick={() => setShowCreateCourse(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData?.totalCourses || 5}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Students
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData?.totalStudents || 127}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${dashboardData?.totalRevenue || 3450}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      This Month
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${dashboardData?.monthlyEarnings || 890}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white shadow rounded-lg p-6 card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        className="w-16 h-16 rounded-lg object-cover"
                        src={course.thumbnailUrl || placeholders.course}
                        alt={course.title}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{course.students} students</span>
                          <span>★ {course.rating}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              course.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Last updated: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-semibold text-green-600">
                        ${course.earnings}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View Course"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-600"
                          onClick={() => handleEditCourse(course)}
                          title="Edit Course"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-600"
                          onClick={() => setShowDeleteConfirm(course.id)}
                          title="Delete Course"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-green-600"
                          onClick={() => setSelectedCourseForVideos(selectedCourseForVideos === course.id ? null : course.id)}
                          title="Manage Videos"
                        >
                          <VideoCameraIcon className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-purple-600"
                          onClick={() => setSelectedCourseForAnalytics(selectedCourseForAnalytics === course.id ? null : course.id)}
                          title="View Analytics"
                        >
                          <ChartPieIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Management Section */}
            {selectedCourseForVideos && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Manage Videos - {courses.find(c => c.id === selectedCourseForVideos)?.title}
                  </h3>
                  <button
                    onClick={() => setSelectedCourseForVideos(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <VideoManager courseId={selectedCourseForVideos} />
              </div>
            )}

            {/* Analytics Section */}
            {selectedCourseForAnalytics && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Course Analytics - {courses.find(c => c.id === selectedCourseForAnalytics)?.title}
                  </h3>
                  <button
                    onClick={() => setSelectedCourseForAnalytics(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <CourseAnalytics 
                  courseId={selectedCourseForAnalytics}
                  courseName={courses.find(c => c.id === selectedCourseForAnalytics)?.title}
                />
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                {[
                  { type: 'enrollment', message: '5 new students enrolled in React course', time: '2 hours ago' },
                  { type: 'review', message: 'Received 5-star review on JavaScript course', time: '4 hours ago' },
                  { type: 'completion', message: '3 students completed Database Design', time: '1 day ago' },
                  { type: 'question', message: 'New question posted in React course', time: '2 days ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  View Student Analytics
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Manage Course Content
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Review Student Submissions
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Send Announcements
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            <p className="text-sm">
              <strong>Note:</strong> {error}. Showing demo data for demonstration purposes.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Course Modal */}
      <CreateCourseModal
        isOpen={showCreateCourse}
        onClose={() => {
          setShowCreateCourse(false);
          setEditingCourse(null);
        }}
        onCourseCreated={handleCourseCreated}
        editingCourse={editingCourse}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Course
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(showDeleteConfirm)}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;