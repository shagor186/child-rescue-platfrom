// Login system base types
export type View = 'welcome' | 'signin' | 'signup' | 'forgot' | 'home';

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface MessageState {
  type: 'success' | 'error' | '';
  text: string;
}

export interface CommonProps {
  navigateTo: (v: View) => void;
}



// Missing persons system types
export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  location: string;
  description: string;
  image_count: number;
  created_at: string;
}

export interface Detection {
  id: number;
  person_id: string;
  person_name: string;
  person_location: string;
  type: string;
  confidence: number;
  detected_at: string;
  time_ago: string;
}

export interface DashboardStats {
  total_persons: number;
  total_detections: number;
  total_images: number;
  recent_detections: Detection[];
  model_trained: boolean;
  model_accuracy: number;
  last_training: string | null;
}

export interface PredictionResult {
  person_id: string;
  name: string;
  age: number;
  location: string;
  confidence: number;
  description: string;
  image?: string;
  count?: number;
}

export interface TrainingStatus {
  id: number;
  status: 'pending' | 'training' | 'completed' | 'failed';
  total_images: number;
  accuracy: number;
  started_at: string;
  completed_at: string | null;
}