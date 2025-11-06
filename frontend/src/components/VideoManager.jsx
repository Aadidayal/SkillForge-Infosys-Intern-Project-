import React, { useState, useEffect } from 'react';
import { 
  CloudArrowUpIcon, 
  VideoCameraIcon, 
  EyeIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const VideoManager = ({ courseId }) => {
  const [videos, setVideos] = useState([]);
  const [uploadingVideo, setUploadingVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseVideos();
    }
  }, [courseId]);

  const fetchCourseVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setVideos(result.videos || []);
      } else {
        setError('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Error loading videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('Video file is too large. Maximum size is 100MB.');
      return;
    }

    const title = prompt('Enter video title:');
    if (!title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('courseId', courseId);

    try {
      setUploadingVideo({ name: file.name, title });
      setUploadProgress(0);
      setError('');

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format');
      }

      const result = await response.json();
      
      if (result.success) {
        // Poll for upload completion
        if (result.video && result.video.id) {
          pollUploadStatus(result.video.id);
        }
        fetchCourseVideos(); // Refresh the list
        setError(''); // Clear any previous errors
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else if (error.message.includes('HTTP 413')) {
        setError('File too large. Please select a smaller video file.');
      } else if (error.message.includes('HTTP 403')) {
        setError('Access denied. Please login as an instructor.');
      } else {
        setError(`Upload failed: ${error.message}`);
      }
    } finally {
      setUploadingVideo(null);
      setUploadProgress(0);
    }
  };

  const pollUploadStatus = (videoId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch video status: ${response.status} ${response.statusText}`);
          
          // If it's 403, it means authentication issue
          if (response.status === 403) {
            console.warn('Authentication failed. User may need to log in again.');
            setError('Session expired. Please log in again.');
          }
          
          clearInterval(interval);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response');
          clearInterval(interval);
          return;
        }
        
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          clearInterval(interval);
          return;
        }
        if (result.success) {
          const video = result.data;
          if (video.status === 'READY' || video.status === 'FAILED') {
            clearInterval(interval);
            fetchCourseVideos(); // Refresh to show updated status
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(interval);
      }
    }, 2000); // Check every 2 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  };

  const setVideoPreview = async (videoId, isPreview) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/preview?isPreview=${isPreview}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        fetchCourseVideos(); // Refresh the list
      } else {
        setError(result.message || 'Failed to update preview setting');
      }
    } catch (error) {
      console.error('Error updating preview:', error);
      setError('Failed to update preview setting');
    }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        fetchCourseVideos(); // Refresh the list
      } else {
        setError(result.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('Failed to delete video');
    }
  };

  const getVideoUrl = async (videoId) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/stream`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        return result.videoUrl;
      }
    } catch (error) {
      console.error('Error getting video URL:', error);
    }
    return null;
  };

  const playVideo = async (videoId) => {
    const url = await getVideoUrl(videoId);
    if (url) {
      window.open(url, '_blank');
    } else {
      setError('Failed to get video URL');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'READY': return 'text-green-600';
      case 'UPLOADING': return 'text-blue-600';
      case 'PROCESSING': return 'text-yellow-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'READY': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'UPLOADING': return <CloudArrowUpIcon className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'PROCESSING': return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'FAILED': return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      default: return <VideoCameraIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Video Management</h3>
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={!courseId || uploadingVideo}
            />
            <div className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              uploadingVideo ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              {uploadingVideo ? 'Uploading...' : 'Upload Video'}
            </div>
          </label>
        </div>

        {/* Upload Progress */}
        {uploadingVideo && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading: {uploadingVideo.title}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Info */}
        <p className="text-sm text-gray-500">
          Upload video files to your course. Maximum file size: 100MB. 
          Supported formats: MP4, AVI, MOV, WMV.
        </p>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Course Videos</h4>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-6 text-center">
            <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No videos uploaded</h3>
            <p className="text-sm text-gray-500">Upload your first video to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {videos.map((video) => (
              <div key={video.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(video.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{video.title}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className={getStatusColor(video.status)}>
                        {video.status}
                      </span>
                      {video.durationSeconds && (
                        <span>{Math.floor(video.durationSeconds / 60)}:{(video.durationSeconds % 60).toString().padStart(2, '0')}</span>
                      )}
                      {video.preview && <span className="text-green-600">Free Preview</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {video.status === 'READY' && (
                    <>
                      <button
                        onClick={() => playVideo(video.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Play Video"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setVideoPreview(video.id, !video.preview)}
                        className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white ${
                          video.preview ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        title={video.preview ? "Remove from Preview" : "Set as Preview"}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    title="Delete Video"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManager;