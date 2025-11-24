import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  PlayIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  BookOpenIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

function ComprehensiveHome() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);

  useEffect(() => {
    fetchPublishedCourses();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursePreview = async (courseId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/courses/${courseId}/modules`);
      setCourseModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching course preview:', error);
    }
  };

  const handleCoursePreview = (course) => {
    setSelectedCourse(course);
    fetchCoursePreview(course.id);
  };

  const getContentTypeStats = (modules) => {
    let videoCount = 0;
    let pdfCount = 0;
    let quizCount = 0;

    modules.forEach(module => {
      if (module.moduleContent) {
        module.moduleContent.forEach(content => {
          switch (content.contentType) {
            case 'VIDEO': videoCount++; break;
            case 'PDF_NOTES':
            case 'PDF_QUESTIONS': pdfCount++; break;
            case 'QUIZ': quizCount++; break;
          }
        });
      }
    });

    return { videoCount, pdfCount, quizCount };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Master New Skills with SkillForge
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover comprehensive courses with videos, PDFs, interactive quizzes, and hands-on practice. 
            Learn from expert instructors and advance your career.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Learning Today
            </a>
            <a
              href="#courses"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose SkillForge?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform offers multiple learning formats to suit every learning style
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <PlayIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Lessons</h3>
              <p className="text-gray-600 text-sm">
                High-quality video content with expert instructors
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <DocumentTextIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">PDF Resources</h3>
              <p className="text-gray-600 text-sm">
                Downloadable notes and reference materials
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Practice Questions</h3>
              <p className="text-gray-600 text-sm">
                Test your knowledge with curated practice materials
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <AcademicCapIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Quizzes</h3>
              <p className="text-gray-600 text-sm">
                Assess your progress with comprehensive quizzes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div id="courses" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-gray-600">
              Explore our comprehensive course catalog
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 6).map((course) => {
                const stats = getContentTypeStats(course.modules || []);
                return (
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={course.thumbnailUrl || 'https://via.placeholder.com/400x250?text=Course+Thumbnail'}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      
                      {/* Course Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {stats.videoCount > 0 && (
                            <span className="flex items-center gap-1">
                              <PlayIcon className="w-4 h-4" />
                              {stats.videoCount}
                            </span>
                          )}
                          {stats.pdfCount > 0 && (
                            <span className="flex items-center gap-1">
                              <DocumentTextIcon className="w-4 h-4" />
                              {stats.pdfCount}
                            </span>
                          )}
                          {stats.quizCount > 0 && (
                            <span className="flex items-center gap-1">
                              <AcademicCapIcon className="w-4 h-4" />
                              {stats.quizCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>4.8</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ${course.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          By {course.instructor?.firstName} {course.instructor?.lastName}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCoursePreview(course)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Preview
                        </button>
                        <a
                          href="/register"
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
                        >
                          Enroll Now
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {courses.length > 6 && (
            <div className="text-center mt-12">
              <a
                href="/register"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Courses
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are advancing their careers with SkillForge
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-gray-600">
                    By {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedCourse.thumbnailUrl || 'https://via.placeholder.com/400x250?text=Course+Thumbnail'}
                    alt={selectedCourse.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <p className="text-gray-700 mb-4">
                    {selectedCourse.description}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      ${selectedCourse.price}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <StarIcon className="w-5 h-5 fill-current" />
                      <span>4.8 (245 reviews)</span>
                    </div>
                  </div>
                  <a
                    href="/register"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                  >
                    Enroll in This Course
                  </a>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Course Content</h4>
                  <div className="space-y-3">
                    {courseModules.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-3">
                        <h5 className="font-medium text-gray-900">
                          {index + 1}. {module.title}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {module.description}
                        </p>
                        {module.moduleContent && module.moduleContent.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{module.moduleContent.length} items</span>
                            {module.moduleContent.some(c => c.contentType === 'VIDEO') && (
                              <span className="flex items-center gap-1">
                                <PlayIcon className="w-3 h-3" />
                                Video
                              </span>
                            )}
                            {module.moduleContent.some(c => c.contentType.startsWith('PDF_')) && (
                              <span className="flex items-center gap-1">
                                <DocumentTextIcon className="w-3 h-3" />
                                PDF
                              </span>
                            )}
                            {module.moduleContent.some(c => c.contentType === 'QUIZ') && (
                              <span className="flex items-center gap-1">
                                <AcademicCapIcon className="w-3 h-3" />
                                Quiz
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComprehensiveHome;