// src/api/trainingApi.ts

const API_BASE_URL = 'http://localhost:5000/api';

export interface TrainResponse {
  success: boolean;
  message: string;
  training_id: number;
  total_persons: number;
  total_images: number;
}

export interface ModelStatusResponse {
  model_exists: boolean;
  model_loaded: boolean;
  encoder_loaded: boolean;
  classes: string[];
  last_training: string | null;
  training_status: 'training' | 'completed' | 'failed' | null;
  total_persons?: number;
  total_images?: number;
  accuracy?: number;
}

export const startTraining = async (): Promise<TrainResponse> => {
  const res = await fetch(`${API_BASE_URL}/model/train`, {
    method: 'POST',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to start training');
  }

  return data;
};

export const fetchModelStatus = async (): Promise<ModelStatusResponse> => {
  const res = await fetch(`${API_BASE_URL}/model/status`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch model status');
  }

  return data;
};
