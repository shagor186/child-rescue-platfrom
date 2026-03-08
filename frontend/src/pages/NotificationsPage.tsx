import React, { useState } from 'react';
import { Bell, Clock, MapPin, Camera, Video, Trash2, X, RefreshCw } from 'lucide-react';
import ImageIcon from '../components/ImageIcon';
import { useNotifications, useDeleteNotification, useClearNotifications } from '../hooks/useNotifications';

import type { Detection } from '../types'; // FIX: Proper typing

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'webcam'>('all');

  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const deleteMutation = useDeleteNotification();
  const clearMutation = useClearNotifications();

  const filteredNotifications = notifications.filter((notif: Detection) =>
    filter === 'all' ? true : notif.type === filter
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'webcam': return <Camera className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDeleteNotification = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleClearAll = () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    clearMutation.mutate();
  };

  // FIX: Loading state
  if (isLoading) {
    return <div className="p-8 text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Detection Notifications</h1>
          <p className="text-gray-600">Track all person identification events in real-time</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetch()} // FIX: React Query manual refetch
            className="px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center space-x-2 border border-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition flex items-center space-x-2 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('image')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            filter === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Images</span>
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            filter === 'video'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos</span>
        </button>
        <button
          onClick={() => setFilter('webcam')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            filter === 'webcam'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Webcam</span>
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
          <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === 'all'
              ? 'Detection alerts will appear here'
              : `No ${filter} detections found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif: Detection) => (
            <div key={notif.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200 border border-gray-100 group">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{notif.person_name}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                        notif.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                        notif.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(notif.confidence * 100).toFixed(1)}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-3">Person ID: {notif.person_id}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                        {notif.person_location}
                      </span>
                      <span className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        {notif.time_ago}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium capitalize flex items-center space-x-1">
                        {getNotificationIcon(notif.type)}
                        <span>{notif.type} Detection</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-1 text-gray-400 hover:text-red-600 mb-2"
                    title="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* FIX: prevent crash if detected_at is null */}
                  {notif.detected_at && (
                    <>
                      <p className="text-xs text-gray-400 mb-2">
                        {new Date(notif.detected_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notif.detected_at).toLocaleTimeString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
