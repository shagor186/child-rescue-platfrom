import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, X, ChevronRight, ChevronLeft, Activity, 
  FileText, Upload, Camera, Bell, Shield, 
  CheckCircle, AlertCircle, LogOut 
} from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import TrainPage from './pages/TrainPage';
import PredictPage from './pages/PredictPage';
import NotificationsPage from './pages/NotificationsPage';
import NavItem from './components/NavItem';
import SidebarIcon from './components/SidebarIcon';
import { fetchDashboardStats, fetchReports, fetchNotifications } from './api';
import type { MissingPerson, Detection, DashboardStats } from './types';

const SideBar: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'reports' | 'train' | 'predict' | 'notifications'>('dashboard');
  const [reports, setReports] = useState<MissingPerson[]>([]);
  const [notifications, setNotifications] = useState<Detection[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_persons: 0,
    total_detections: 0,
    total_images: 0,
    recent_detections: [],
    model_trained: false,
    model_accuracy: 0,
    last_training: null
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

 
  const loadInitialData = useCallback(async () => {
    await fetchDashboardStats(setDashboardStats, showMessage, setLoading);
    await fetchReports(setReports, showMessage);
    await fetchNotifications(setNotifications);
  }, [showMessage]);


  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.reload(); 
  };

 
  useEffect(() => {
    loadInitialData();
    const interval = setInterval(() => {
      fetchDashboardStats(setDashboardStats, showMessage, setLoading);
      fetchNotifications(setNotifications);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadInitialData, showMessage]);

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Toast message */}
      {message && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in ${
          message.type === 'success' 
            ? 'bg-linear-to-r from-green-500 to-green-600' 
            : 'bg-linear-to-r from-red-500 to-red-600'
        } text-white`}>
          {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-linear-to-b from-indigo-600 via-blue-600 to-blue-700 text-white shadow-2xl transition-all duration-300 relative flex flex-col`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 bg-white text-blue-600 p-1.5 rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {!sidebarCollapsed ? (
            <>
              {/* Branding */}
              <div className="flex items-center space-x-3 mb-8 bg-pink-600 bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-12 h-12 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">FaceTrack AI</h1>
                  <p className="text-xs opacity-80">Rescue Platform</p>
                </div>
              </div>

              {/* Navigation menu */}
              <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <NavItem icon={<Activity />} label="Dashboard" badge={dashboardStats.total_detections} active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
                <NavItem icon={<FileText />} label="Reports" badge={reports.length} active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
                <NavItem icon={<Upload />} label="Train Model" active={currentPage === 'train'} onClick={() => setCurrentPage('train')} />
                <NavItem icon={<Camera />} label="Predict" active={currentPage === 'predict'} onClick={() => setCurrentPage('predict')} />
                <NavItem icon={<Bell />} label="Notifications" badge={notifications.length} active={currentPage === 'notifications'} onClick={() => setCurrentPage('notifications')} />
                
                {/* Logout button added */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 mt-4 rounded-xl transition-all duration-200 hover:bg-red-500 hover:bg-opacity-20 text-red-100 group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Logout System</span>
                </button>
              </nav>

              {/* System status */}
              <div className="mt-6 p-4 bg-pink-600 bg-opacity-10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">System Status</span>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${dashboardStats.model_trained ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                </div>
                <div className="text-xs opacity-80 space-y-1">
                  <div className="flex justify-between">
                    <span>AI Model:</span>
                    <span className={dashboardStats.model_trained ? 'text-green-300' : 'text-yellow-300'}>
                      {dashboardStats.model_trained ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed mode icons */
            <div className="flex flex-col items-center space-y-6 pt-4 h-full">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7" />
              </div>
              <nav className="flex-1 space-y-4">
                <SidebarIcon icon={<Activity />} active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
                <SidebarIcon icon={<FileText />} active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
                <SidebarIcon icon={<Upload />} active={currentPage === 'train'} onClick={() => setCurrentPage('train')} />
                <SidebarIcon icon={<Camera />} active={currentPage === 'predict'} onClick={() => setCurrentPage('predict')} />
                <SidebarIcon icon={<Bell />} active={currentPage === 'notifications'} onClick={() => setCurrentPage('notifications')} />
                <button onClick={handleLogout} className="p-3 text-red-300 hover:text-red-100 transition-colors">
                  <LogOut size={22} />
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Footer Shield */}
        {!sidebarCollapsed && (
          <div className="p-6 bg-black bg-opacity-10">
            <div className="flex items-center space-x-3 text-blue-200 opacity-70">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-medium">Child Rescue</span>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {loading && currentPage === 'dashboard' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Syncing Data...</p>
            </div>
          </div>
        ) : (
          <main className="animate-fade-in">
            {currentPage === 'dashboard' && <DashboardPage stats={dashboardStats} onRefresh={() => fetchDashboardStats(setDashboardStats, showMessage, setLoading)} showMessage={showMessage} />}
            {currentPage === 'reports' && <ReportsPage reports={reports} setReports={setReports} showMessage={showMessage} onRefresh={() => fetchReports(setReports, showMessage)} />}
            {currentPage === 'train' && <TrainPage showMessage={showMessage} modelTrained={dashboardStats.model_trained} modelAccuracy={dashboardStats.model_accuracy} />}
            {currentPage === 'predict' && <PredictPage showMessage={showMessage} />}
            {currentPage === 'notifications' && <NotificationsPage notifications={notifications} onRefresh={() => fetchNotifications(setNotifications)} showMessage={showMessage} />}
          </main>
        )}
      </div>
    </div>
  );
};

export default SideBar;