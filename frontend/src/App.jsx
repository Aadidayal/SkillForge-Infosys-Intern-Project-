import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

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
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/dashboard"
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

      {/* Default route */}
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to={getDefaultDashboard()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
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
