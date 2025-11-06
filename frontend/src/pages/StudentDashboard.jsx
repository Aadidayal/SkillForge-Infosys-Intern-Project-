import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await studentAPI.getDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        // Mock data for demo purposes
        setDashboardData({
          message: 'Welcome to your Student Dashboard!',
          enrolledCourses: 3,
          completedCourses: 1,
          totalHours: 45,
          currentStreak: 7
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
      instructor: 'John Doe',
      progress: 75,
      duration: '12 hours',
      rating: 4.8,
      thumbnail: 'https://via.placeholder.com/300x200?text=React+Course'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      instructor: 'Jane Smith',
      progress: 40,
      duration: '18 hours',
      rating: 4.9,
      thumbnail: 'https://via.placeholder.com/300x200?text=JavaScript+Course'
    },
    {
      id: 3,
      title: 'Database Design',
      instructor: 'Mike Johnson',
      progress: 20,
      duration: '15 hours',
      rating: 4.7,
      thumbnail: 'https://via.placeholder.com/300x200?text=Database+Course'
    }
  ];

  const mockRecommendations = [
    {
      id: 4,
      title: 'Node.js Fundamentals',
      instructor: 'Sarah Wilson',
      duration: '14 hours',
      rating: 4.6,
      thumbnail: 'https://via.placeholder.com/300x200?text=NodeJS+Course'
    },
    {
      id: 5,
      title: 'CSS Grid & Flexbox',
      instructor: 'Alex Brown',
      duration: '8 hours',
      rating: 4.5,
      thumbnail: 'https://via.placeholder.com/300x200?text=CSS+Course'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Continue your learning journey and achieve your goals.
          </p>
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
                      Enrolled Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData?.enrolledCourses || 3}
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
                  <TrophyIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData?.completedCourses || 1}
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
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Hours
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData?.totalHours || 45}
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
                  <AcademicCapIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Current Streak
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData?.currentStreak || 7} days
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockCourses.map((course) => (
              <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg card-hover">
                <div className="relative">
                  <img
                    className="w-full h-48 object-cover"
                    src={course.thumbnail}
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100">
                      <PlayIcon className="w-4 h-4" />
                      <span>Continue</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{course.duration}</span>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockRecommendations.map((course) => (
              <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg card-hover">
                <div className="relative">
                  <img
                    className="w-full h-48 object-cover"
                    src={course.thumbnail}
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Enroll Now
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{course.duration}</span>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

export default StudentDashboard;