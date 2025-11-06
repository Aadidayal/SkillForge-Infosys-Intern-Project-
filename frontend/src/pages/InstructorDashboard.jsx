import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { instructorAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import {
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

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
  }, []);

  const mockCourses = [
    {
      id: 1,
      title: 'Introduction to React',
      students: 45,
      rating: 4.8,
      status: 'Published',
      earnings: 1250,
      lastUpdated: '2024-01-15',
      thumbnail: 'https://via.placeholder.com/300x200?text=React+Course'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      students: 32,
      rating: 4.9,
      status: 'Published',
      earnings: 960,
      lastUpdated: '2024-01-10',
      thumbnail: 'https://via.placeholder.com/300x200?text=JavaScript+Course'
    },
    {
      id: 3,
      title: 'Node.js Fundamentals',
      students: 28,
      rating: 4.7,
      status: 'Draft',
      earnings: 0,
      lastUpdated: '2024-01-20',
      thumbnail: 'https://via.placeholder.com/300x200?text=NodeJS+Course'
    },
    {
      id: 4,
      title: 'Database Design',
      students: 22,
      rating: 4.6,
      status: 'Published',
      earnings: 680,
      lastUpdated: '2024-01-08',
      thumbnail: 'https://via.placeholder.com/300x200?text=Database+Course'
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
              {mockCourses.map((course) => (
                <div key={course.id} className="bg-white shadow rounded-lg p-6 card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        className="w-16 h-16 rounded-lg object-cover"
                        src={course.thumbnail}
                        alt={course.title}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{course.students} students</span>
                          <span>★ {course.rating}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              course.status === 'Published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Last updated: {course.lastUpdated}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-semibold text-green-600">
                        ${course.earnings}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
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
    </div>
  );
};

export default InstructorDashboard;