import React, { useState } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const CourseAnalytics = ({ courseId, courseName }) => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalViews: 1247,
      totalEnrollments: 89,
      completionRate: 67,
      averageRating: 4.7,
      totalRevenue: 3450,
      watchTime: 142 // hours
    },
    recentActivity: [
      { date: '2024-11-06', enrollments: 5, views: 23, revenue: 245 },
      { date: '2024-11-05', enrollments: 3, views: 18, revenue: 147 },
      { date: '2024-11-04', enrollments: 7, views: 31, revenue: 343 },
      { date: '2024-11-03', enrollments: 2, views: 15, revenue: 98 },
      { date: '2024-11-02', enrollments: 4, views: 22, revenue: 196 },
      { date: '2024-11-01', enrollments: 6, views: 28, revenue: 294 },
      { date: '2024-10-31', enrollments: 8, views: 35, revenue: 392 }
    ],
    topVideos: [
      { id: 1, title: 'Introduction to Course', views: 234, completion: 89, engagement: 4.8 },
      { id: 2, title: 'Getting Started', views: 187, completion: 76, engagement: 4.6 },
      { id: 3, title: 'Advanced Concepts', views: 156, completion: 68, engagement: 4.7 },
      { id: 4, title: 'Practical Examples', views: 143, completion: 72, engagement: 4.9 },
      { id: 5, title: 'Final Project', views: 98, completion: 45, engagement: 4.5 }
    ],
    studentProgress: [
      { stage: 'Started', count: 89, percentage: 100 },
      { stage: '25% Complete', count: 76, percentage: 85 },
      { stage: '50% Complete', count: 65, percentage: 73 },
      { stage: '75% Complete', count: 52, percentage: 58 },
      { stage: 'Completed', count: 38, percentage: 43 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Course Analytics</h3>
          <p className="text-sm text-gray-600">{courseName}</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{mockAnalytics.overview.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Enrollments</p>
              <p className="text-2xl font-semibold text-gray-900">{mockAnalytics.overview.totalEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${mockAnalytics.overview.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{mockAnalytics.overview.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{mockAnalytics.overview.averageRating} ⭐</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Watch Time</p>
              <p className="text-2xl font-semibold text-gray-900">{mockAnalytics.overview.watchTime}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and detailed analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {mockAnalytics.recentActivity.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{day.date}</div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-blue-600">{day.views} views</span>
                  <span className="text-green-600">{day.enrollments} enrollments</span>
                  <span className="text-purple-600">${day.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Videos */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top Performing Videos</h4>
          <div className="space-y-3">
            {mockAnalytics.topVideos.map((video, index) => (
              <div key={video.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{video.title}</p>
                  <div className="flex space-x-3 text-xs text-gray-500">
                    <span>{video.views} views</span>
                    <span>{video.completion}% completion</span>
                    <span>⭐ {video.engagement}</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Progress */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Student Progress Funnel</h4>
        <div className="space-y-4">
          {mockAnalytics.studentProgress.map((stage, index) => (
            <div key={stage.stage} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">{stage.stage}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex space-x-2 text-sm">
                <span className="font-medium">{stage.count}</span>
                <span className="text-gray-500">({stage.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">💡 Insights & Recommendations</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-green-600">✓</span>
            <p><strong>Great engagement!</strong> Your course has an above-average completion rate of {mockAnalytics.overview.completionRate}%.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">💡</span>
            <p><strong>Content tip:</strong> "Final Project" has lower completion. Consider breaking it into smaller modules.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-600">📈</span>
            <p><strong>Growth opportunity:</strong> Your course is trending upward with consistent daily enrollments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;