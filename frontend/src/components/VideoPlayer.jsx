import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const VideoPlayer = ({ courseId, showOnlyPreviews = false }) => {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

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
        let videoList = result.data || [];
        
        // If showing only previews, filter accordingly
        if (showOnlyPreviews) {
          videoList = videoList.filter(video => video.preview);
        }
        
        setVideos(videoList);
        if (videoList.length > 0 && !currentVideo) {
          setCurrentVideo(videoList[0]);
        }
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

  const playVideo = async (video) => {
    try {
      setError('');
      setCurrentVideo(video);
      
      const response = await fetch(`/api/videos/${video.id}/stream`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setVideoUrl(result.videoUrl);
      } else {
        if (result.paymentRequired) {
          setError('This video requires course enrollment. Please purchase the course to access all content.');
        } else {
          setError(result.message || 'Failed to load video');
        }
        setVideoUrl('');
      }
    } catch (error) {
      console.error('Error loading video:', error);
      setError('Failed to load video');
      setVideoUrl('');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading course videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">No videos available</h3>
        <p className="text-sm text-gray-500">
          {showOnlyPreviews ? 'No preview videos are available for this course.' : 'This course doesn\'t have any videos yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {currentVideo && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="aspect-w-16 aspect-h-9 bg-gray-900">
            {videoUrl ? (
              <video 
                controls 
                className="w-full h-full"
                poster={currentVideo.thumbnailUrl}
                key={videoUrl} // Force re-render when URL changes
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <PlayIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">{currentVideo.title}</p>
                  <button
                    onClick={() => playVideo(currentVideo)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Play Video
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{currentVideo.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {currentVideo.durationSeconds && (
                <span>Duration: {formatDuration(currentVideo.durationSeconds)}</span>
              )}
              {currentVideo.preview && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Free Preview
                </span>
              )}
            </div>
            {currentVideo.description && (
              <p className="mt-2 text-sm text-gray-700">{currentVideo.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Access Restricted</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Playlist */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Course Videos</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                currentVideo?.id === video.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
              }`}
              onClick={() => playVideo(video)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentVideo?.id === video.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{video.title}</h4>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                      {video.durationSeconds && (
                        <span>{formatDuration(video.durationSeconds)}</span>
                      )}
                      {video.preview && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          Free
                        </span>
                      )}
                      {!video.preview && !showOnlyPreviews && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                          <LockClosedIcon className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {currentVideo?.id === video.id && videoUrl ? (
                    <PauseIcon className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <PlayIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Prompt for Preview Mode */}
      {showOnlyPreviews && videos.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Want to see more?</h3>
            <p className="text-indigo-100 mb-4">
              This course contains {videos.length} preview video{videos.length !== 1 ? 's' : ''}. 
              Purchase the full course to access all content.
            </p>
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
              Enroll Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;