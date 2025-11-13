import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import { placeholders } from '../utils/placeholder';
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  PlayIcon,
  StarIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourseForVideos, setSelectedCourseForVideos] = useState(null);

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

  const [availableCourses, setAvailableCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await fetch('/api/courses/public');
        const result = await response.json();
        
        if (result.success) {
          // Transform backend data to match frontend expectations
          const transformedCourses = result.courses.map(course => ({
            id: course.id,
            title: course.title,
            instructor: `${course.instructor.firstName} ${course.instructor.lastName}`,
            instructorEmail: course.instructor.email,
            description: course.description,
            price: course.price,
            duration: course.videos?.length ? `${course.videos.length} video${course.videos.length > 1 ? 's' : ''}` : '0 videos',
            rating: 4.5, // Default rating since we don't have ratings yet
            thumbnail: placeholders.reactCourse, // Use placeholder for now
            videos: course.videos || [],
            status: course.status,
            createdAt: course.createdAt
          }));
          setAvailableCourses(transformedCourses);
        } else {
          setCoursesError('Failed to load courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCoursesError('Error loading courses');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchAvailableCourses();
  }, []);

  const mockRecommendations = [
    {
      id: 4,
      title: 'Node.js Fundamentals',
      instructor: 'Sarah Wilson',
      duration: '14 hours',
      rating: 4.6,
      thumbnail: placeholders.nodejsCourse
    },
    {
      id: 5,
      title: 'CSS Grid & Flexbox',
      instructor: 'Alex Brown',
      duration: '8 hours',
      rating: 4.5,
      thumbnail: placeholders.cssCourse
    }
  ];

  if (loading || coursesLoading) {
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

        {/* Available Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
          
          {coursesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="spinner"></div>
            </div>
          ) : coursesError ? (
            <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
              {coursesError}
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="text-gray-600 text-center p-8 bg-gray-50 rounded-lg">
              <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No courses available yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course) => (
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
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                  {course.description && (
                    <p className="text-sm text-gray-500 mb-3">{course.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{course.duration}</span>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-lg font-semibold text-green-600">${course.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCourseForVideos(selectedCourseForVideos === course.id ? null : course.id)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>{selectedCourseForVideos === course.id ? 'Hide Videos' : 'Watch Videos'}</span>
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Player Section */}
        {selectedCourseForVideos && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Course Videos - {availableCourses.find(c => c.id === selectedCourseForVideos)?.title}
              </h3>
              <button
                onClick={() => setSelectedCourseForVideos(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <VideoPlayer courseId={selectedCourseForVideos} />
          </div>
        )}

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