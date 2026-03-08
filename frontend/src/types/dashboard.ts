export interface RecentDetection {
  id: string;
  person_id: string;
  person_name: string;
  confidence: number;
  type: 'image' | 'video' | 'webcam' | 'unknown';
  time_ago: string;
}

export interface DashboardStats {
  total_persons: number;
  total_detections: number;
  total_images: number;
  model_accuracy: number;
  model_trained: boolean;
  last_training: string | null;
  recent_detections: RecentDetection[];
}