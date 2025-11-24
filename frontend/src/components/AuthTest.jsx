import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AuthTest = () => {
  const { user, token, login, logout } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  const testAuth = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Test login
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
      
      if (response.data.token) {
        login(response.data.token);
        setTestResult('✅ Authentication successful! Token received.');
        
        // Test API call with token
        setTimeout(async () => {
          try {
            const testResponse = await axios.get('http://localhost:8080/api/test/health', {
              headers: { Authorization: `Bearer ${response.data.token}` }
            });
            setTestResult(prev => prev + '\n✅ API test successful! Backend is responding.');
          } catch (error) {
            setTestResult(prev => prev + '\n❌ API test failed: ' + error.message);
          }
        }, 1000);
      }
    } catch (error) {
      setTestResult('❌ Authentication failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const testCourseAPI = async () => {
    if (!token) {
      setTestResult('❌ Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/courses/instructor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestResult('✅ Course API successful! Courses: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setTestResult('❌ Course API failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Authentication Test</h2>
      
      {user ? (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">
            ✅ Logged in as: {user.email} ({user.role})
          </p>
          <button 
            onClick={logout}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <button
            onClick={testAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>
      )}

      {user && (
        <div className="mb-6">
          <button
            onClick={testCourseAPI}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Course API'}
          </button>
        </div>
      )}

      {testResult && (
        <div className="p-4 bg-gray-100 border rounded-lg">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Test Credentials:</h3>
        <p>Try creating a test user first or use existing credentials.</p>
        <p>Make sure the backend is running on http://localhost:8080</p>
      </div>
    </div>
  );
};

export default AuthTest;