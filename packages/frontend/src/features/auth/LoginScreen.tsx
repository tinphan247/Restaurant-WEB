import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {login} from './hooks/useAuth'
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const LoginScreen = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data : any) => {
    try {
      await login(data);
      window.location.href = '/admin';
    } catch (err) {
      alert('Đăng nhập thất bại!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>
        <input {...register('email')} className="w-full border p-2 mb-4 rounded" placeholder="Email" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>
        
        <input type="password" {...register('password')} className="w-full border p-2 mb-4 rounded" placeholder="Mật khẩu" />
        
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
          Đăng nhập
        </button>
        
        <div className="mt-4 border-t pt-4">
          <button type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
            className="w-full border py-2 rounded flex items-center justify-center gap-2">
            <img src="/google-icon.svg" width={20} /> Tiếp tục với Google
          </button>
        </div>
      </form>
    </div>
  );
};