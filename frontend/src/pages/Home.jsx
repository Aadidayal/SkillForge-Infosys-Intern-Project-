import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EnhancedCourseBrowser from '../components/EnhancedCourseBrowser';
import {
  AcademicCapIcon,
  BookOpenIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  UsersIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false);

  const handleEnrollmentSuccess = (enrollment) => {
    setShowEnrollmentSuccess(true);
    setTimeout(() => setShowEnrollmentSuccess(false), 3000);
    
    // If user is a student, suggest they go to their dashboard
    if (user?.role === 'STUDENT') {
      setTimeout(() => {
        const goToDashboard = window.confirm('Successfully enrolled! Would you like to go to your learning dashboard?');
        if (goToDashboard) {
          navigate('/student/dashboard');
        }
      }, 1500);
    }
  };

  const features = [
    {
      icon: <PlayCircleIcon className="w-8 h-8 text-blue-500" />,
      title: "Interactive Videos",
      description: "High-quality video lectures with playback controls and progress tracking"
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8 text-green-500" />,
      title: "PDF Resources",
      description: "Downloadable notes and practice questions in PDF format"
    },
    {
      icon: <QuestionMarkCircleIcon className="w-8 h-8 text-purple-500" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with interactive quizzes and get instant feedback"
    },
    {
      icon: <BookOpenIcon className="w-8 h-8 text-orange-500" />,
      title: "Modular Learning",
      description: "Courses organized in modules for structured and progressive learning"
    },
    {
      icon: <TrophyIcon className="w-8 h-8 text-yellow-500" />,
      title: "Progress Tracking",
      description: "Track your learning progress and achievements throughout the course"
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-indigo-500" />,
      title: "Expert Instructors",
      description: "Learn from industry experts and experienced professionals"
    }
  ];

  const stats = [
    { label: "Active Students", value: "10,000+", icon: <UsersIcon className="w-6 h-6" /> },
    { label: "Courses Available", value: "500+", icon: <BookOpenIcon className="w-6 h-6" /> },
    { label: "Video Hours", value: "5,000+", icon: <PlayCircleIcon className="w-6 h-6" /> },
    { label: "Success Rate", value: "95%", icon: <StarIcon className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Enrollment Success Message */}
      {showEnrollmentSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-medium">Successfully enrolled in course!</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                SkillForge
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Master new skills with our enhanced learning platform featuring interactive modules, 
              video content, PDF resources, and engaging quizzes.
            </p>
            
            {!isAuthenticated() ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate(
                    user?.role === 'STUDENT' ? '/student/dashboard' :
                    user?.role === 'INSTRUCTOR' ? '/instructor/dashboard' :
                    '/admin/dashboard'
                  )}
                  className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 justify-center"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg text-indigo-600 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enhanced Learning Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform offers a comprehensive learning experience with multiple content types 
              and interactive features designed for modern learners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      {/* Course Browser Section */}
      <div className="py-16 bg-white">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through our extensive catalog of courses with preview features 
            to find the perfect learning path for you.
          </p>
        </div>
        
        <EnhancedCourseBrowser onEnroll={handleEnrollmentSuccess} />
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of learners who are already mastering new skills on SkillForge.
          </p>
          
          {!isAuthenticated() ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Sign In to Continue
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(
                user?.role === 'STUDENT' ? '/student/dashboard' :
                user?.role === 'INSTRUCTOR' ? '/instructor/dashboard' :
                '/admin/dashboard'
              )}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center gap-2"
            >
              Continue Learning
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AcademicCapIcon className="w-8 h-8 text-indigo-400" />
                <h3 className="text-2xl font-bold">SkillForge</h3>
              </div>
              <p className="text-gray-300 max-w-md">
                Empowering learners with interactive, modular courses designed for 
                the modern world. Learn at your own pace with videos, PDFs, and quizzes.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Courses</li>
                <li>Instructors</li>
                <li>Features</li>
                <li>Pricing</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 SkillForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;