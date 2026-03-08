import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  deleteNotification,
  clearNotifications,
} from '../api/notificationsApi';
import type { Detection } from '../types';

// ✅ Get all notifications
export const useNotifications = () => {
  return useQuery<Detection[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 10000,
  });
};

// ✅ Delete single notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// ✅ Clear all notifications  🔥 THIS WAS MISSING
export const useClearNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
