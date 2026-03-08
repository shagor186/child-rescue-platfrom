import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getDashboardStats } from '../api/dashboardApi';
import type { DashboardStats } from '../types/dashboard';

export const useDashboard = (showMessage: (type: 'success' | 'error', text: string) => void) => {
  const query = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError) {
      showMessage('error', 'Failed to load dashboard data');
    }
  }, [query.isError, showMessage]);

  return {
    stats: query.data,
    isLoading: query.isLoading,
    refresh: () => query.refetch(),
  };
};