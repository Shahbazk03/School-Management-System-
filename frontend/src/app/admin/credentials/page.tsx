'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminCredentialsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  const [resetModal, setResetModal] = useState<{ isOpen: boolean; userId: string; newPassword?: string; loginId?: string }>({ isOpen: false, userId: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, loginId: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${loginId}?`)) return;
    
    try {
      const res = await apiClient.post(`/users/${userId}/reset-password`);
      setResetModal({ isOpen: true, userId, newPassword: res.data.newPassword, loginId });
      toast.success('Password reset successfully');
    } catch (e) {
      toast.error('Failed to reset password');
    }
  };

  const filteredUsers = users.filter(u => filter === 'ALL' || u.role === filter);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Credential Management</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>System Users</CardTitle>
          <select 
            className="p-2 border rounded" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="TEACHER">Teachers</option>
            <option value="PARENT">Parents</option>
            <option value="STUDENT">Students</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Login ID</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold">{user.loginId}</td>
                    <td className="px-4 py-3"><Badge>{user.role}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'default'}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleResetPassword(user.id, user.loginId)}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded font-medium hover:bg-red-200"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {resetModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Password Reset Successful</h3>
              <p className="text-sm text-gray-600 mb-6">
                A new temporary password has been generated for <strong>{resetModal.loginId}</strong>.
                Please securely share this with the user.
              </p>
              
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">New Password</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{resetModal.newPassword}</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-800 rounded font-medium hover:bg-gray-200"
                >
                  Print
                </button>
                <button 
                  onClick={() => setResetModal({ isOpen: false, userId: '' })} 
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
