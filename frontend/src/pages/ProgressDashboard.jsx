import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, Target, BookOpen, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function ProgressDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch user's enrollments
      const enrollmentsRes = await axios.get(`${API_URL}/enrollment/student`, config);
      const userEnrollments = enrollmentsRes.data || [];
      setEnrollments(userEnrollments);

      // Fetch progress for each enrollment
      const progressPromises = userEnrollments.map(async (enrollment) => {
        try {
          const progressRes = await axios.get(
            `${API_URL}/progress/enrollment/${enrollment.id}`,
            config
          );
          return { enrollmentId: enrollment.id, data: progressRes.data };
        } catch (error) {
          console.error(`Error fetching progress for enrollment ${enrollment.id}:`, error);
          return { enrollmentId: enrollment.id, data: null };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      progressResults.forEach((result) => {
        if (result.data) {
          progressMap[result.enrollmentId] = result.data;
        }
      });

      setProgressData(progressMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    let totalMaterials = 0;
    let completedMaterials = 0;
    let totalTimeSpent = 0;
    let totalProgress = 0;

    Object.values(progressData).forEach((data) => {
      totalMaterials += data.progressList?.length || 0;
      completedMaterials += data.completedCount || 0;
      totalTimeSpent += data.progressList?.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0) || 0;
      totalProgress += data.averageProgress || 0;
    });

    const avgProgress = Object.keys(progressData).length > 0 
      ? totalProgress / Object.keys(progressData).length 
      : 0;

    return {
      totalCourses: enrollments.length,
      totalMaterials,
      completedMaterials,
      totalTimeSpent: Math.round(totalTimeSpent / 3600), // Convert to hours
      averageProgress: Math.round(avgProgress)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-3">Your Learning Progress</h1>
          <p className="text-gray-300 text-lg">Track your journey and achievements</p>
        </motion.div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GlassStatCard
            icon={<BookOpen className="w-8 h-8" />}
            label="Active Courses"
            value={stats.totalCourses}
            color="from-blue-500 to-cyan-500"
          />
          <GlassStatCard
            icon={<CheckCircle2 className="w-8 h-8" />}
            label="Completed Materials"
            value={`${stats.completedMaterials}/${stats.totalMaterials}`}
            color="from-green-500 to-emerald-500"
          />
          <GlassStatCard
            icon={<Clock className="w-8 h-8" />}
            label="Hours Spent"
            value={stats.totalTimeSpent}
            color="from-purple-500 to-pink-500"
          />
          <GlassStatCard
            icon={<Target className="w-8 h-8" />}
            label="Avg Progress"
            value={`${stats.averageProgress}%`}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Course Progress Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Course-wise Progress</h2>
          {enrollments.map((enrollment, index) => (
            <CourseProgressCard
              key={enrollment.id}
              enrollment={enrollment}
              progressData={progressData[enrollment.id]}
              index={index}
            />
          ))}

          {enrollments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 text-center"
            >
              <p className="text-gray-300 text-lg">You haven't enrolled in any courses yet.</p>
              <button className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white font-semibold hover:scale-105 transition-transform">
                Browse Courses
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Glass Stat Card Component
function GlassStatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${color} bg-opacity-20 mb-4`}>
        {React.cloneElement(icon, { className: `${icon.props.className} text-white` })}
      </div>
      <div className="text-gray-300 text-sm mb-2">{label}</div>
      <div className="text-4xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

// Course Progress Card Component
function CourseProgressCard({ enrollment, progressData, index }) {
  const progress = progressData?.averageProgress || 0;
  const completedCount = progressData?.completedCount || 0;
  const totalMaterials = progressData?.progressList?.length || 0;
  const timeSpent = Math.round(
    (progressData?.progressList?.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0) || 0) / 60
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">{enrollment.course?.title}</h3>
          <p className="text-gray-300">{enrollment.course?.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-5xl font-bold text-indigo-400">{Math.round(progress)}%</div>
          <div className="text-gray-400 text-sm">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">{completedCount}/{totalMaterials}</div>
        </div>

        <div className="backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Time Spent</span>
          </div>
          <div className="text-2xl font-bold text-white">{timeSpent}min</div>
        </div>

        <div className="backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Materials</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalMaterials}</div>
        </div>
      </div>

      {/* Recent Materials */}
      {progressData?.progressList && progressData.progressList.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Materials</h4>
          <div className="space-y-2">
            {progressData.progressList.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 backdrop-blur-lg bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                  )}
                  <span className="text-white text-sm">{item.learningMaterial?.title}</span>
                </div>
                <span className="text-indigo-400 text-sm font-semibold">
                  {item.progressPercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
