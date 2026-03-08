// src/hooks/useTraining.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchModelStatus, startTraining } from '../api/trainingApi';

export const useTraining = () => {
  const trainMutation = useMutation({
    mutationFn: startTraining,
  });

  const statusQuery = useQuery({
    queryKey: ['modelStatus'],
    queryFn: fetchModelStatus,
    refetchInterval: 2000, // polling
    enabled: trainMutation.isPending || trainMutation.isSuccess,
  });

  return {
    trainMutation,
    statusQuery,
  };
};
