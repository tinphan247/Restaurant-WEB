// packages/frontend/src/features/report/services/report-api.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  // Backend NestJS có global prefix 'api'
  baseURL: `${API_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reportApi = {
  getRevenue: (from: string, to: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
    api.get('/reports/revenue', { params: { from, to, period } }),

  getBestSellers: (limit: number = 10, from?: string, to?: string) =>
    api.get('/reports/best-sellers', { params: { limit, from, to } }),
};
