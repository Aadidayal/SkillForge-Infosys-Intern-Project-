import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, FileText, Link as LinkIcon, Book, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function TopicBasedCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (selectedTopic) {
      fetchMaterials(selectedTopic.id);
    }
  }, [selectedTopic]);

  const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch course details
      const courseRes = await axios.get(`${API_URL}/courses/${courseId}`, config);
      setCourse(courseRes.data);

      // Fetch topics
      const topicsRes = await axios.get(`${API_URL}/courses/${courseId}/topics`, config);
      setTopics(topicsRes.data.topics || []);
      
      if (topicsRes.data.topics?.length > 0) {
        setSelectedTopic(topicsRes.data.topics[0]);
      }

      // Fetch enrollment and progress
      const enrollmentRes = await axios.get(`${API_URL}/enrollment/course/${courseId}`, config);
      if (enrollmentRes.data.enrollment) {
        setEnrollmentId(enrollmentRes.data.enrollment.id);
        fetchProgress(enrollmentRes.data.enrollment.id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setLoading(false);
    }
  };

  const fetchMaterials = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/topics/${topicId}/materials`, config);
      setMaterials(res.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchProgress = async (enrollId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/progress/enrollment/${enrollId}`, config);
      
      const progressMap = {};
      res.data.progressList?.forEach(p => {
        progressMap[p.learningMaterial.id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleMaterialClick = async (material) => {
    if (!enrollmentId) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Start material if not started
      if (!progress[material.id]) {
        await axios.post(
          `${API_URL}/progress/enrollment/${enrollmentId}/material/${material.id}/start`,
          {},
          config
        );
        fetchProgress(enrollmentId);
      }

      // Navigate to material viewer based on type
      navigate(`/courses/${courseId}/materials/${material.id}`);
    } catch (error) {
      console.error('Error starting material:', error);
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle className="w-5 h-5" />;
      case 'PDF': return <FileText className="w-5 h-5" />;
      case 'LINK': return <LinkIcon className="w-5 h-5" />;
      case 'ARTICLE': return <Book className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const calculateOverallProgress = () => {
    const totalMaterials = materials.length;
    if (totalMaterials === 0) return 0;
    
    const totalProgress = materials.reduce((sum, material) => {
      return sum + (progress[material.id]?.progressPercentage || 0);
    }, 0);
    
    return Math.round(totalProgress / totalMaterials);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 mb-8 border border-white/20"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">{course?.title}</h1>
              <p className="text-gray-300 text-lg">{course?.description}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-indigo-400">{calculateOverallProgress()}%</div>
              <div className="text-gray-300 text-sm">Overall Progress</div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <StatCard
              icon={<CheckCircle className="w-6 h-6 text-green-400" />}
              label="Completed"
              value={`${Object.values(progress).filter(p => p.completed).length}/${materials.length}`}
            />
            <StatCard
              icon={<Clock className="w-6 h-6 text-blue-400" />}
              label="Time Spent"
              value={`${Math.round(Object.values(progress).reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0) / 60)}min`}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
              label="Topics"
              value={topics.length}
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Course Topics</h2>
              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    index={index}
                    isSelected={selectedTopic?.id === topic.id}
                    onClick={() => setSelectedTopic(topic)}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Materials Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedTopic && (
                <motion.div
                  key={selectedTopic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20"
                >
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedTopic.title}</h2>
                  <p className="text-gray-300 mb-8">{selectedTopic.description}</p>

                  <h3 className="text-xl font-semibold text-white mb-6">Learning Materials</h3>
                  
                  <div className="space-y-4">
                    {materials.map((material, index) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        index={index}
                        progress={progress[material.id]}
                        onClick={() => handleMaterialClick(material)}
                        icon={getMaterialIcon(material.materialType)}
                      />
                    ))}
                  </div>

                  {materials.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">No materials available yet</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Topic Card Component
function TopicCard({ topic, index, isSelected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg'
          : 'bg-white/5 hover:bg-white/10'
      } border border-white/10`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          isSelected ? 'bg-white text-indigo-600' : 'bg-white/10 text-white'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white">{topic.title}</div>
        </div>
      </div>
    </motion.button>
  );
}

// Material Card Component
function MaterialCard({ material, index, progress, onClick, icon }) {
  const progressPercentage = progress?.progressPercentage || 0;
  const isCompleted = progress?.completed || false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          isCompleted ? 'bg-green-500/20' : 'bg-indigo-500/20'
        }`}>
          {isCompleted ? <CheckCircle className="w-6 h-6 text-green-400" /> : icon}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-lg font-semibold text-white">{material.title}</h4>
              <p className="text-gray-400 text-sm mt-1">{material.description}</p>
            </div>
            {material.isFree && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                FREE
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4">
            {material.durationSeconds && (
              <div className="text-sm text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {Math.round(material.durationSeconds / 60)}min
              </div>
            )}
            <div className="flex-1">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-semibold text-indigo-400">{progressPercentage}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value }) {
  return (
    <div className="backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
