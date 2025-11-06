import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, editingCourse }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: null,
    category: '',
    level: 'BEGINNER',
    language: 'English'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'DevOps',
    'Database',
    'UI/UX Design',
    'Digital Marketing',
    'Business',
    'Other'
  ];

  const levels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' }
  ];

  // Effect to populate form when editing
  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || '',
        description: editingCourse.description || '',
        price: editingCourse.price || '',
        thumbnail: null, // Keep as null, show existing image separately
        category: editingCourse.category || '',
        level: editingCourse.level || 'BEGINNER',
        language: editingCourse.language || 'English'
      });
      setPreviewImage(editingCourse.thumbnailUrl || null);
    } else {
      // Reset form for creating new course
      setFormData({
        title: '',
        description: '',
        price: '',
        thumbnail: null,
        category: '',
        level: 'BEGINNER',
        language: 'English'
      });
      setPreviewImage(null);
    }
  }, [editingCourse]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        thumbnail: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      thumbnail: null,
      category: '',
      level: 'BEGINNER',
      language: 'English'
    });
    setPreviewImage(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('level', formData.level);
      formDataToSend.append('language', formData.language);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response received');
      }

      const result = await response.json();

      if (result.success) {
        onCourseCreated(result.data);
        resetForm();
        onClose();
      } else {
        setError(result.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.message.includes('HTTP error! status: 404')) {
        setError('Backend API not available. Please ensure the server is running.');
      } else if (error.message.includes('Non-JSON response')) {
        setError('Server returned an invalid response. Please check server logs.');
      } else {
        setError('Failed to create course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Course Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter course title..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe what students will learn..."
                  />
                </div>

                {/* Price and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Level and Language Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <input
                      type="text"
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="English"
                    />
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Thumbnail
                  </label>
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Max file size: 5MB. Recommended: 300x200px</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading 
                  ? (editingCourse ? 'Updating...' : 'Creating...') 
                  : (editingCourse ? 'Update Course' : 'Create Course')
                }
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;