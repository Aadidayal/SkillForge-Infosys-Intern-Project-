import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ComprehensiveHome from './components/ComprehensiveHome';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard';
import ComprehensiveStudentDashboard from './components/ComprehensiveStudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import EnhancedInstructorDashboard from './pages/EnhancedInstructorDashboard';
import ComprehensiveInstructorDashboard from './components/ComprehensiveInstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthTest from './components/AuthTest';
import ErrorBoundary from './components/ErrorBoundary';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="spinner"></div>
  </div>
);

// Main app content
const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const getDefaultDashboard = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'INSTRUCTOR':
        return '/instructor/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? (
            <Navigate to={getDefaultDashboard()} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated() ? (
            <Navigate to={getDefaultDashboard()} replace />
          ) : (
            <Register />
          )
        } 
      />

      {/* Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <ErrorBoundary>
              <ComprehensiveStudentDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard/enhanced"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <EnhancedStudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard/legacy"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute requiredRole="INSTRUCTOR">
            <ErrorBoundary>
              <ComprehensiveInstructorDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/dashboard/enhanced"
        element={
          <ProtectedRoute requiredRole="INSTRUCTOR">
            <EnhancedInstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/dashboard/legacy"
        element={
          <ProtectedRoute requiredRole="INSTRUCTOR">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Home route */}
      <Route path="/home" element={<ComprehensiveHome />} />
      <Route path="/home/legacy" element={<Home />} />
      
      {/* Test route */}
      <Route path="/test" element={<AuthTest />} />
      
      {/* Default route */}
      <Route
        path="/"
        element={<ComprehensiveHome />}
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-700 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
