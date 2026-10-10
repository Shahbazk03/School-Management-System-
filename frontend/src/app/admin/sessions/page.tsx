'use client';

import { useAllSessions } from '@/api/hooks';
import { CrudPage } from '@/components/CrudPage';
import { Badge } from '@/components/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminSessions() {
  const { data, loading, refetch } = useAllSessions();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleAddClick = () => {
    reset({ isCurrent: false });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset({ ...row, startDate: row.startDate?.split('T')[0], endDate: row.endDate?.split('T')[0] });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        const { apiClient } = await import('@/api/client');
        await apiClient.delete(`/academic-sessions/${id}`);
        toast.success('Session deleted');
        refetch();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const { apiClient } = await import('@/api/client');
      // Format dates properly
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      if (editingId) {
        await apiClient.patch(`/academic-sessions/${editingId}`, payload);
        toast.success('Session updated');
      } else {
        await apiClient.post(`/academic-sessions`, payload);
        toast.success('Session created');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { header: 'Session Name', accessor: (row: any) => <span className="font-bold text-slate-900">{row.name}</span> },
    { header: 'Start Date', accessor: (row: any) => new Date(row.startDate).toLocaleDateString() },
    { header: 'End Date', accessor: (row: any) => new Date(row.endDate).toLocaleDateString() },
    { header: 'Status', accessor: (row: any) => row.isCurrent ? <Badge variant="success">Current</Badge> : <Badge variant="default">Inactive</Badge> },
  ];

  return (
    <CrudPage
      title="Academic Sessions"
      subtitle="Manage school years and current active session."
      data={data}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search sessions..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Session Name</label>
              <input {...register('name', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="e.g. 2024-25" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                <input type="date" {...register('startDate', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                <input type="date" {...register('endDate', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <input type="checkbox" id="isCurrent" {...register('isCurrent')} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
              <label htmlFor="isCurrent" className="text-sm font-bold text-slate-900">Mark as Current Session</label>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      )}
    />
  );
}