// packages/frontend/src/features/report/hooks/useReport.ts

import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services/report-api';

export function useRevenue(from: string, to: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return useQuery({
    queryKey: ['revenue', from, to, period],
    queryFn: async () => {
      const response = await reportApi.getRevenue(from, to, period);
      return response.data.data;
    },
    enabled: !!from && !!to,
  });
}

export function useBestSellers(limit: number = 10, from?: string, to?: string) {
  return useQuery({
    queryKey: ['best-sellers', limit, from, to],
    queryFn: async () => {
      const response = await reportApi.getBestSellers(limit, from, to);
      return response.data.data;
    },
  });
}

