'use client';

import { useAllStudents } from '@/api/hooks';
import { achievementService } from '@/api/services';
import { CrudPage } from '@/components/CrudPage';
import { Badge } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminAchievements() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: students } = useAllStudents();
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await achievementService.getAll();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleAddClick = () => {
    reset({ date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset({ ...row, date: row.date?.split('T')[0] || new Date().toISOString().split('T')[0] });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      try {
        await achievementService.delete(id);
        toast.success('Achievement deleted');
        fetchAchievements();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const payload = { ...formData, date: new Date(formData.date).toISOString() };
      if (editingId) {
        const { apiClient } = await import('@/api/client');
        await apiClient.patch(`/achievements/${editingId}`, payload);
        toast.success('Achievement updated');
      } else {
        await achievementService.create(payload);
        toast.success('Achievement recorded');
      }
      setFormOpen(false);
      fetchAchievements();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { header: 'Title', accessor: (row: any) => <span className="font-bold text-slate-900">{row.title}</span> },
    { header: 'Student', accessor: (row: any) => row.student ? `${row.student.firstName} ${row.student.lastName}` : 'Unknown' },
    { header: 'Category', accessor: (row: any) => <Badge variant="warning">{row.category}</Badge> },
    { header: 'Date', accessor: (row: any) => new Date(row.date).toLocaleDateString() },
  ];

  return (
    <CrudPage
      title="Student Achievements"
      subtitle="Record and manage awards and accomplishments."
      data={data}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search awards..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Award Title</label>
              <input {...register('title', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="e.g. Science Fair Winner" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Student</label>
              <select {...register('studentId', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none">
                <option value="">Select Student...</option>
                {students?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select {...register('category', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none">
                  <option value="ACADEMIC">Academic</option>
                  <option value="SPORTS">Sports</option>
                  <option value="ARTS">Arts</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                <input type="date" {...register('date', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none" placeholder="Details about the achievement..." />
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