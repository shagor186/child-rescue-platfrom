import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, createReport, deleteReport } from '../api/reportsApi';
import type { MissingPerson } from '../types';

export const useReports = () => {
  const queryClient = useQueryClient();

  /* ================= FETCH REPORTS ================= */
  const reportsQuery = useQuery<MissingPerson[]>({
    queryKey: ['reports'],
    queryFn: getReports,
  });

  /* ================= CREATE REPORT ================= */
  const createReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      // ✅ Auto refresh reports list
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  /* ================= DELETE REPORT ================= */
  const deleteReportMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      // ✅ Auto refresh after delete
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    reportsQuery,
    createReportMutation,
    deleteReportMutation,
  };
};
