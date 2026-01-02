import axios from 'axios';

// Cập nhật baseURL thêm /api để khớp với app.setGlobalPrefix('api') ở Backend
const api = axios.create({ 
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Định nghĩa Interface để tránh lỗi 'implicitly has any type'
export interface LoginCredentials {
  email: string;
  password?: string;
}

export const login = async (credentials: LoginCredentials) => {
  // Request thực tế: POST http://localhost:3000/api/auth/login
  const { data } = await api.post('/auth/login', credentials);
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  
  return data.user;
};
export const logout = () => {
  localStorage.removeItem('access_token');
  // Nếu bạn có lưu thông tin user, hãy xóa luôn
  // localStorage.removeItem('user'); 
  
  // Điều hướng về trang login và reload để xóa sạch state cũ
  window.location.href = '/login';
};