import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AcademicCapIcon, BookOpenIcon, VideoCameraIcon, DocumentIcon,
  StarIcon, PlayIcon, UserGroupIcon, CheckCircleIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const ComprehensiveHome = () => {
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses');
      const coursesData = Array.isArray(response.data) ? response.data : [];
      setCourses(coursesData);
      setFeaturedCourses(coursesData.slice(0, 6)); // Show first 6 as featured
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setFeaturedCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePreview = (course) => {
    setSelectedCourse(course);
    setShowPreviewModal(true);
  };

  const features = [
    {
      icon: <VideoCameraIcon className="h-8 w-8 text-blue-600" />,
      title: "High-Quality Video Lectures",
      description: "Learn from expert instructors through professionally recorded video content with crystal clear audio and visuals."
    },
    {
      icon: <DocumentIcon className="h-8 w-8 text-green-600" />,
      title: "Comprehensive Study Materials",
      description: "Access detailed PDF notes, practice questions, and supplementary materials to reinforce your learning."
    },
    {
      icon: <CheckCircleIcon className="h-8 w-8 text-purple-600" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with interactive quizzes and get instant feedback to track your progress."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-orange-600" />,
      title: "Expert Instructors",
      description: "Learn from industry professionals and experienced educators who bring real-world expertise to every course."
    }
  ];

  const stats = [
    { label: "Active Courses", value: "50+" },
    { label: "Students Enrolled", value: "10,000+" },
    { label: "Expert Instructors", value: "100+" },
    { label: "Success Rate", value: "95%" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <AcademicCapIcon className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master New Skills with
              <span className="block text-yellow-300">SkillForge</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Transform your career with our comprehensive online courses. Learn from industry experts, 
              practice with hands-on projects, and earn recognized certifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Get Started Free
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkillForge?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed to provide the most effective and engaging learning experience possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most popular courses taught by industry experts
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <BookOpenIcon className="h-16 w-16 text-white" />
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-gray-300" />
                    </div>
                    <span className="text-sm text-gray-600">(4.0)</span>
                    <span className="text-sm text-gray-600">• 1.2k students</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-green-600">
                      ${course.price}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'PUBLISHED' ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCoursePreview(course)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Preview
                    </button>
                    <Link
                      to="/register"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {featuredCourses.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
              <p className="text-gray-600">Check back later for exciting new courses!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Join thousands of students who have transformed their careers with SkillForge. 
            Start your journey today with our free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Course Preview Modal */}
      {showPreviewModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Preview</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {selectedCourse.thumbnailUrl ? (
                    <img 
                      src={selectedCourse.thumbnailUrl} 
                      alt={selectedCourse.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <PlayIcon className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">{selectedCourse.title}</h3>
                  <p className="text-gray-600 mb-6">{selectedCourse.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Price:</span>
                      <span className="text-2xl font-bold text-green-600">${selectedCourse.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedCourse.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedCourse.status === 'PUBLISHED' ? 'Available Now' : 'Coming Soon'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>8-12 hours</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Level:</span>
                      <span>Beginner to Intermediate</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-4">
                    <Link
                      to="/register"
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    >
                      Enroll Now
                    </Link>
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveHome;