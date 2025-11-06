import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpenIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  CogIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isStudent, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isStudent()) return '/student/dashboard';
    if (isInstructor()) return '/instructor/dashboard';
    if (isAdmin()) return '/admin/dashboard';
    return '/';
  };

  const getRoleIcon = () => {
    if (isStudent()) return <BookOpenIcon className="w-5 h-5" />;
    if (isInstructor()) return <AcademicCapIcon className="w-5 h-5" />;
    if (isAdmin()) return <CogIcon className="w-5 h-5" />;
    return <UserCircleIcon className="w-5 h-5" />;
  };

  const getRoleName = () => {
    if (isStudent()) return 'Student';
    if (isInstructor()) return 'Instructor';
    if (isAdmin()) return 'Admin';
    return 'User';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SkillForge</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Dashboard Link */}
            <Link
              to={getDashboardLink()}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {getRoleIcon()}
              <span>Dashboard</span>
            </Link>

            {/* Admin specific links */}
            {isAdmin() && (
              <Link
                to="/admin/users"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <UsersIcon className="w-5 h-5" />
                <span>Users</span>
              </Link>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-50">
                {getRoleIcon()}
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name || user?.email}</div>
                  <div className="text-gray-500">{getRoleName()}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;