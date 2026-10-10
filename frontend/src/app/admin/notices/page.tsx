'use client';

import { useNotices } from '@/api/hooks';
import { noticeService } from '@/api/services';
import { CrudPage } from '@/components/CrudPage';
import { Badge, priorityColor } from '@/components/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminNotices() {
  const { data, loading, refetch } = useNotices('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleAddClick = () => {
    reset({ targetAudience: 'ALL', priority: 'NORMAL', publishDate: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset({ ...row, publishDate: row.publishDate?.split('T')[0] || new Date().toISOString().split('T')[0] });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await noticeService.delete(id);
        toast.success('Notice deleted');
        refetch();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const payload = { ...formData, publishDate: new Date(formData.publishDate).toISOString() };
      if (editingId) {
        await noticeService.update(editingId, payload);
        toast.success('Notice updated');
      } else {
        await noticeService.create(payload);
        toast.success('Notice published');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { header: 'Title', accessor: (row: any) => <span className="font-bold text-slate-900">{row.title}</span> },
    { header: 'Audience', accessor: (row: any) => <Badge>{row.targetAudience}</Badge> },
    { header: 'Priority', accessor: (row: any) => (
        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${priorityColor(row.priority)}`}>
          {row.priority}
        </span>
      )
    },
    { header: 'Publish Date', accessor: (row: any) => new Date(row.publishDate || row.createdAt).toLocaleDateString() },
  ];

  return (
    <CrudPage
      title="Manage Notices"
      subtitle="Publish and manage school-wide announcements."
      data={data}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search notices by title..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
              <input {...register('title', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="Notice Title" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Content</label>
              <textarea {...register('content', { required: true })} rows={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none" placeholder="Notice details..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Audience</label>
                <select {...register('targetAudience', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none">
                  <option value="ALL">All</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="PARENTS">Parents Only</option>
                  <option value="TEACHERS">Teachers Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
                <select {...register('priority', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none">
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Publish Date</label>
              <input type="date" {...register('publishDate', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
              {isSubmitting ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      )}
    />
  );
}