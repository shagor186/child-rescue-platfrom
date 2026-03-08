import type { DashboardStats } from '../types/dashboard';

const API_BASE_URL = '/api/dashboard';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
};