import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  MapPin,
  User,
} from 'lucide-react';
import ImageIcon from '../components/ImageIcon';
import type { MissingPerson } from '../types';
import { useReports } from '../hooks/useReports';

const ReportsPage: React.FC = () => {
  /* ===================== TanStack Query ===================== */
  const { reportsQuery, createReportMutation, deleteReportMutation } = useReports();

  const reports: MissingPerson[] = reportsQuery.data || [];
  const loading = createReportMutation.isPending;

  const onRefresh = () => {
    reportsQuery.refetch(); // UI button unchanged
  };

  /* ===================== Local State ===================== */
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    location: '',
    description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ===================== CREATE REPORT ===================== */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('id', formData.id);
    formDataObj.append('name', formData.name);
    formDataObj.append('age', formData.age);
    formDataObj.append('location', formData.location);
    formDataObj.append('description', formData.description);

    selectedFiles.forEach((file) => {
      formDataObj.append('images', file);
    });

    createReportMutation.mutate(formDataObj, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({
          id: '',
          name: '',
          age: '',
          location: '',
          description: '',
        });
        setSelectedFiles([]);
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          alert(err.message || 'Failed to create report');
        } else {
          alert('Failed to create report');
        }
      },
    });
  };

  /* ===================== DELETE REPORT ===================== */
  const handleDelete = (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this report? This action cannot be undone.'
      )
    ) {
      return;
    }

    deleteReportMutation.mutate(id, {
      onError: (err: unknown) => {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Failed to delete report');
      }
    },
    });
  };

  /* ===================== FILE HANDLING ===================== */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files.slice(0, 100 - prev.length)]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===================== FILTER ===================== */
  const filteredReports = reports.filter(
    (report) =>
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Missing Person Reports</h1>
          <p className="text-gray-600">Manage and track all missing person cases</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition flex items-center space-x-2 border border-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
          >
            <FileText className="w-5 h-5" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reports by ID, name, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Missing Person Report</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Person ID *
                  <span className="text-gray-400 text-xs ml-2">(Leave empty to auto-generate)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., MP001"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                <input
                  type="number"
                  placeholder="Age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Known Location *</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Additional information, circumstances, identifying features, clothing description, etc..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Images *
                  <span className="text-gray-400 text-xs ml-2">(100+ recommended for better accuracy)</span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedFiles.length} / 100 files
                </span>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer mb-4"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg mb-2">
                  {selectedFiles.length > 0 ? 
                    `${selectedFiles.length} images selected` : 
                    'Click to upload images'}
                </p>
                <p className="text-sm text-gray-400">JPG, PNG, WEBP • Max 10MB per file</p>
              </div>

              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Selected Images:</h4>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading || selectedFiles.length === 0}
                className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Report...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ id: '', name: '', age: '', location: '', description: '' });
                  setSelectedFiles([]);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-linear-to-r from-blue-600 to-purple-700 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 text-green-500 bg-white bg-opacity-20 rounded-full text-xs font-bold backdrop-blur-sm">
                    {report.id}
                  </span>
                  <User className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-2xl font-bold">{report.name}</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Age: {report.age} years</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">{report.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">{report.image_count} images uploaded</span>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 pt-2 border-t border-gray-100">
                {report.description || 'No description provided'}
              </p>
              
              <div className="pt-4 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-semibold">
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 flex items-center"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Created: {new Date(report.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-20">
          <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No reports found</p>
          {searchQuery && (
            <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;