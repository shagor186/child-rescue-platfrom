import React, { useState } from 'react';
import { Clock, Eye, Camera, FileText, RefreshCw, TrendingUp, Database, Users, Zap, Upload, User } from 'lucide-react';
import StatCard from '../components/StatCard';
import type { DashboardStats } from '../types/dashboard';

interface DashboardPageProps {
  stats: DashboardStats;
  onRefresh: () => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ stats, onRefresh, showMessage }) => {
  const [activityData] = useState([
    { day: 'Mon', detections: 12 },
    { day: 'Tue', detections: 19 },
    { day: 'Wed', detections: 15 },
    { day: 'Thu', detections: 24 },
    { day: 'Fri', detections: 18 },
    { day: 'Sat', detections: 28 },
    { day: 'Sun', detections: 22 },
  ]);

  const handleQuickAction = (action: string) => {
    showMessage('success', `${action} clicked - navigate to relevant page`);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time analytics and system monitoring</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center space-x-2 border border-blue-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="w-8 h-8" />} title="Missing Persons" value={stats.total_persons} change="+2 this week" color="blue" />
        <StatCard icon={<Eye className="w-8 h-8" />} title="Total Detections" value={stats.total_detections} change="+5 today" color="green" />
        <StatCard 
          icon={<TrendingUp className="w-8 h-8" />} 
          title="Model Accuracy" 
          value={`${stats.model_accuracy.toFixed(1)}%`} 
          change={stats.model_trained ? "Trained" : "Not trained"} 
          color={stats.model_trained ? "purple" : "orange"} 
        />
        <StatCard icon={<Database className="w-8 h-8" />} title="Total Images" value={stats.total_images} change="+150 today" color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Clock className="w-7 h-7 mr-3 text-blue-600" /> Recent Detections
            </h2>
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">View All</button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {stats.recent_detections.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No detections yet</p>
              </div>
            ) : (
              stats.recent_detections.slice(0, 4).map(det => (
                <div key={det.id} className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-200 group border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{det.person_name}</p>
                      <p className="text-sm text-gray-600">ID: {det.person_id}</p>
                      <p className="text-xs text-gray-500 mt-1">{det.time_ago}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold mb-2 ${det.confidence > 0.8 ? 'bg-green-100 text-green-700' : det.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {(det.confidence * 100).toFixed(1)}%
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{det.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-linear-to-br from-blue-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-10 h-10" />
              <div className={`w-3 h-3 rounded-full animate-pulse ${stats.model_trained ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Model Status</h3>
            <p className="text-sm opacity-90 mb-4">Last trained: {stats.last_training ? new Date(stats.last_training).toLocaleDateString() : 'Never'}</p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy</span>
                <span className="font-bold">{stats.model_accuracy.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full transition-all duration-500" style={{width: `${stats.model_accuracy}%`}}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => handleQuickAction('Add New Report')} className="w-full px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2">
                <FileText className="w-4 h-4" /> <span>Add New Report</span>
              </button>
              <button onClick={() => handleQuickAction('Train Model')} className="w-full px-4 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" /> <span>Train Model</span>
              </button>
              <button onClick={() => handleQuickAction('Start Prediction')} className="w-full px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2">
                <Camera className="w-4 h-4" /> <span>Start Prediction</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Detection Activity (Last 7 Days)</h2>
        <div className="h-64 flex items-end justify-between space-x-2 px-4">
          {activityData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-linear-to-t from-blue-500 to-purple-600 rounded-t-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 cursor-pointer group relative" style={{height: `${(item.detections / 30) * 100}%`}}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.detections} detections</div>
              </div>
              <span className="text-sm text-gray-600 mt-2 font-medium">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;