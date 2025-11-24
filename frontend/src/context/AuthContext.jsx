import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          setUser({
            id: decodedToken.userId,
            email: decodedToken.sub,
            role: decodedToken.role,
            firstName: decodedToken.firstName || '',
            lastName: decodedToken.lastName || ''
          });
        } else {
          // Token expired
          logout();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    try {
      const decodedToken = jwtDecode(newToken);
      setUser({
        id: decodedToken.userId,
        email: decodedToken.sub,
        role: decodedToken.role,
        firstName: decodedToken.firstName || '',
        lastName: decodedToken.lastName || ''
      });
    } catch (error) {
      console.error('Invalid token during login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isStudent = () => hasRole('STUDENT');
  const isInstructor = () => hasRole('INSTRUCTOR');
  const isAdmin = () => hasRole('ADMIN');

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isStudent,
    isInstructor,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};