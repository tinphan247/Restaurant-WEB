import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {login} from './hooks/useAuth'
import * as z from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [loginError, setLoginError] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data : any) => {
    setLoginError(''); // Xóa lỗi cũ khi submit
    try {
      const user = await login(data);
      
      // Kiểm tra role của user
      if (user.role === 'USER') {
        alert(`Chào mừng ${user.name}! Bạn đã đăng nhập thành công với tài khoản khách hàng.`);
        // Gọi callback nếu có
        onLoginSuccess?.();
      } else if (user.role === 'ADMIN') {
        // Admin được redirect đến trang admin
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      // Hiển thị thông báo lỗi dưới input password
      if (err.response?.status === 401) {
        setLoginError('Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Đăng nhập thất bại!';
        setLoginError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>
        <input {...register('email')} className="w-full border p-2 mb-4 rounded" placeholder="Email" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>
        
        <input type="password" {...register('password')} className="w-full border p-2 mb-2 rounded" placeholder="Mật khẩu" />
        {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
        
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
          Đăng nhập
        </button>
        
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-500 hover:text-blue-700">Đăng ký</Link>
        </div>
      </form>
    </div>
  );
};