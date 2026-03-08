import React, { useEffect, useState } from 'react';
import { Activity, Users, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import ImageIcon from '../components/ImageIcon';
import { useTraining } from '../hooks/useTraining';

interface TrainPageProps {
  showMessage: (type: 'success' | 'error', text: string) => void;
  modelTrained: boolean;
  modelAccuracy: number;
}

const TrainPage: React.FC<TrainPageProps> = ({
  showMessage,
  modelTrained,
  modelAccuracy,
}) => {
  // ✅ Internal animated progress (0 → 90)
  const [internalProgress, setInternalProgress] = useState(0);

  // ✅ TanStack Query hook
  const { trainMutation, statusQuery } = useTraining();

  // ✅ Fix: mutation loading → isPending (v5)
  const training = trainMutation.isPending;

  const handleTrain = () => {
    // Reset internal progress when training starts
    setInternalProgress(0);

    trainMutation.mutate(undefined, {
      onSuccess: (data) => {
        showMessage('success', data.message || 'Model training started');
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          showMessage('error', error.message);
        } else {
          showMessage('error', 'Failed to start training');
        }
      },
    });
  };

  // ✅ Animate progress while training
  useEffect(() => {
    if (statusQuery.data?.training_status !== 'training') return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => Math.min(prev + 10, 90));
    }, 2000);

    return () => clearInterval(interval);
  }, [statusQuery.data?.training_status]);

  // ✅ Handle completion / failure without setState
  useEffect(() => {
    const status = statusQuery.data?.training_status;

    if (status === 'completed') {
      showMessage(
        'success',
        `Model trained successfully! Accuracy: ${(
          statusQuery.data?.accuracy ?? 0
        ).toFixed(1)}%`
      );
    }

    if (status === 'failed') {
      showMessage('error', 'Model training failed');
    }
  }, [
    statusQuery.data?.training_status,
    statusQuery.data?.accuracy,
    showMessage,
  ]);

  // ✅ Derived progress value for UI
  const progress =
    statusQuery.data?.training_status === 'completed'
      ? 100
      : internalProgress;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Model Training</h1>
        <p className="text-gray-600">Train the face recognition model with uploaded images</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Model Status */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Current Model Status</h2>
            <div className={`px-4 py-2 rounded-full font-semibold flex items-center space-x-2 ${
              modelTrained ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                modelTrained ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>{modelTrained ? 'Active & Trained' : 'Not Trained'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Total Persons</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">3</p>
            </div>
            
            <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Training Images</span>
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">144</p>
            </div>
            
            <div className="p-4 bg-linear-to-br from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Accuracy</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{modelAccuracy.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Training</span>
              <span className="font-semibold text-gray-800">December 28, 2024 at 8:00 AM</span>
            </div>
          </div>
        </div>

        {/* Training Process */}
        <div className="bg-linear-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Zap className="w-7 h-7 mr-3" />
            How Training Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-400 bg-opacity-10 rounded-xl p-6 backdrop-blur-sm hover:bg-opacity-20 transition-all">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <span className="font-bold text-xl text-black">1</span>
              </div>
              <h4 className="font-semibold text-lg mb-3">Image Collection</h4>
              <p className="text-sm opacity-90">Gathers all uploaded images from missing person reports</p>
            </div>
            
            <div className="bg-red-400 bg-opacity-10 rounded-xl p-6 backdrop-blur-sm hover:bg-opacity-20 transition-all">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <span className="font-bold text-xl text-black">2</span>
              </div>
              <h4 className="font-semibold text-lg mb-3">Face Detection</h4>
              <p className="text-sm opacity-90">MTCNN algorithm extracts facial features from images</p>
            </div>
            
            <div className="bg-red-400 bg-opacity-10 rounded-xl p-6 backdrop-blur-sm hover:bg-opacity-20 transition-all">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <span className="font-bold text-xl text-black">3</span>
              </div>
              <h4 className="font-semibold text-lg mb-3">Embedding Generation</h4>
              <p className="text-sm opacity-90">FaceNet creates 512-dimensional feature vectors</p>
            </div>
            
            <div className="bg-red-400 bg-opacity-10 rounded-xl p-6 backdrop-blur-sm hover:bg-opacity-20 transition-all">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <span className="font-bold text-xl text-black">4</span>
              </div>
              <h4 className="font-semibold text-lg mb-3">Model Training</h4>
              <p className="text-sm opacity-90">SVM classifier learns to identify each person</p>
            </div>
          </div>
        </div>

        {/* Train Button */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <button
            onClick={handleTrain}
            disabled={training}
            className="w-full py-5 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-2xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg font-bold"
          >
            {training ? (
              <>
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                <span>Training Model...</span>
              </>
            ) : (
              <>
                <Activity className="w-7 h-7" />
                <span>Start Model Training</span>
              </>
            )}
          </button>

          {training && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Training progress</span>
                  <span className="font-semibold text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-linear-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{width: `${progress}%`}}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Training Requirements</p>
                <p className="text-xs text-yellow-700 mt-1">
                  • At least 2 missing person reports with images are required<br/>
                  • Each person should have multiple images for better accuracy<br/>
                  • Training may take several minutes depending on image count
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainPage;