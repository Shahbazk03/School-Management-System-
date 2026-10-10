'use client';

import { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { apiClient } from '@/api/client';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        loginId: data.loginId,
        password: data.password,
      });

      if (response.data.success) {
        login(
          response.data.data.accessToken,
          response.data.data.refreshToken,
          response.data.data.user
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white flex flex-col items-center">
          <GraduationCap size={48} className="mb-4" />
          <h2 className="text-2xl font-bold">School Portal</h2>
          <p className="text-blue-100 mt-2">Sign in to access your dashboard</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
              <input
                type="text"
                {...register('loginId', { required: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. STUDENT-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-500">
            <p>Demo Accounts:</p>
            <div className="flex justify-center gap-4 mt-2 font-mono text-xs">
              <span>ADMIN-001</span>
              <span>TEACHER-001</span>
              <span>PARENT-001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
