import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, Camera, Video, MapPin, Play, AlertCircle } from 'lucide-react';
import ImageIcon from '../components/ImageIcon';
import { usePredictImage, usePredictVideo, usePredictWebcam } from '../hooks/usePredict';
import type { PredictionResult } from '../types';

interface PredictPageProps {
  showMessage: (type: 'success' | 'error', text: string) => void;
}

const PredictPage: React.FC<PredictPageProps> = ({ showMessage }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'webcam' | 'video'>('image');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [webcamActive, setWebcamActive] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutations from custom hooks
  const imageMutation = usePredictImage();
  const videoMutation = usePredictVideo();
  const webcamMutation = usePredictWebcam();

  /* ================= WEBCAM AUTO CAPTURE LOGIC ================= */
  // useCallback ব্যবহার করা হয়েছে hoisting এরর এবং রি-রেন্ডার লুপ এড়াতে
  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !webcamActive) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ভিডিওর বর্তমান সাইজ অনুযায়ী ক্যানভাস সেট করা
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ইমেজকে Base64 ফরম্যাটে রূপান্তর
    const base64Image = canvas.toDataURL('image/jpeg', 0.7);

    webcamMutation.mutate(base64Image, {
      onSuccess: (data) => {
        if (data.success) {
          setPredictions((prev) => {
            const exists = prev.find((p) => p.person_id === data.person_id);
            if (exists) return prev; // ডুপ্লিকেট এন্ট্রি রোধ
            return [data, ...prev];
          });
          showMessage('success', `Live Match Found: ${data.name}`);
        }
      },
      // নোট: অটো-লুপে এরর মেসেজ দেখালে ইউজার ইন্টারফেস ডিস্টার্ব হতে পারে, তাই onError এখানে সাইলেন্ট রাখা হয়েছে।
    });
  }, [webcamActive, webcamMutation, showMessage]);

  // ওয়েবক্যাম একটিভ থাকলে প্রতি ২ সেকেন্ডে একবার অটো-প্রেডিক্ট করবে
  useEffect(() => {
    let interval: number | undefined;
    if (webcamActive) {
      interval = window.setInterval(() => {
        captureAndPredict();
      }, 2000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [webcamActive, captureAndPredict]);

  /* ================= HANDLERS ================= */

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    imageMutation.mutate(file, {
      onSuccess: (data) => {
        if (data.success && data.prediction) {
          setPredictions((prev) => [data.prediction, ...prev]);
          showMessage('success', `Match found: ${data.prediction.name}`);
        }
      },
      onError: (err: Error) => showMessage('error', err.message || 'Image upload failed'),
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    videoMutation.mutate(file, {
      onSuccess: (data) => {
        if (data.success && data.predictions) {
          setPredictions((prev) => [...data.predictions, ...prev]);
          showMessage('success', `Video processed: ${data.total_detections} matches found`);
        }
      },
      onError: (err: Error) => showMessage('error', err.message || 'Video processing failed'),
    });
  };

  const toggleWebcam = () => {
    if (webcamActive) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setWebcamActive(false);
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setWebcamActive(true);
          }
        })
        .catch(() => showMessage('error', 'Could not access webcam'));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Person Identification</h1>
        <p className="text-gray-600">Identify missing persons using AI-powered face recognition</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'image'
              ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span>Image Upload</span>
        </button>
        <button
          onClick={() => setActiveTab('webcam')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'webcam'
              ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>Webcam Live</span>
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
            activeTab === 'video'
              ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Video className="w-5 h-5" />
          <span>Video Upload</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Area */}
        <div className="lg:col-span-2">
          {activeTab === 'image' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Image for Identification</h2>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
              >
                {imageMutation.isPending ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-semibold text-lg">Processing image...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-20 h-20 text-gray-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
                    <p className="text-gray-600 font-semibold text-lg mb-2">Click to upload an image</p>
                    <p className="text-sm text-gray-400">JPG, PNG, WEBP • Max 10MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'webcam' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Real-time Webcam Detection</h2>
              <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                <canvas ref={canvasRef} className="hidden" />
                {webcamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-linear-to-br from-blue-50 to-purple-600 opacity-20"></div>
                    <div className="text-center text-white z-10">
                      <Camera className="w-20 h-20 mx-auto mb-4 opacity-70 animate-pulse" />
                      <p className="text-xl font-semibold mb-2">Webcam Mode</p>
                      <p className="text-gray-300">Click start to enable webcam</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={toggleWebcam}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    webcamActive
                      ? 'bg-linear-to-r from-red-600 to-red-700 text-white'
                      : 'bg-linear-to-r from-green-600 to-green-700 text-white'
                  }`}
                >
                  {webcamActive ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span>Stop Webcam</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Webcam</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Note</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      For real-time face detection, the system will automatically scan for matches every 2 seconds while the camera is active.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Video for Analysis</h2>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
              >
                {videoMutation.isPending ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600 font-semibold text-lg">Processing video...</p>
                    <p className="text-sm text-gray-400">This may take a minute</p>
                  </div>
                ) : (
                  <>
                    <Video className="w-20 h-20 text-gray-400 group-hover:text-purple-500 mx-auto mb-4 transition-colors" />
                    <p className="text-gray-600 font-semibold text-lg mb-2">Click to upload a video</p>
                    <p className="text-sm text-gray-400">MP4, AVI, MOV • Max 100MB</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-blue-600" />
              Detection Results
            </h2>
            {predictions.length > 0 && (
              <button
                onClick={() => setPredictions([])}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            )}
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">No predictions yet</p>
              <p className="text-gray-400 text-xs mt-1">Upload an image or video to begin</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-linear-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-gray-800 text-lg">{pred.name}</span>
                      {pred.count && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {pred.count}x detected
                        </span>
                      )}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        pred.confidence > 0.8
                          ? 'bg-green-500 text-white'
                          : pred.confidence > 0.6
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {(pred.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  {pred.image && (
                    <div className="mb-3">
                      <img
                        src={`data:image/jpeg;base64,${pred.image}`}
                        alt="Detected face"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 flex items-center">
                      <span className="font-medium mr-2">ID:</span> {pred.person_id}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <span className="font-medium mr-2">Age:</span> {pred.age} years
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {pred.location}
                    </p>
                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">{pred.description}</p>
                  </div>

                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold">
                      View Report
                    </button>
                    <button className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm font-semibold">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;