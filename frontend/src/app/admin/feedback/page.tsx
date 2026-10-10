'use client';

import { useAllFeedback } from '@/api/hooks';
import { feedbackService } from '@/api/services';
import { CrudPage } from '@/components/CrudPage';
import { Badge, priorityColor } from '@/components/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminFeedback() {
  const { data, loading, refetch } = useAllFeedback();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalTicket, setOriginalTicket] = useState<any>(null);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleEditClick = (row: any) => {
    setOriginalTicket(row);
    reset({ 
      status: row.status, 
      resolution: row.resolution || ''
    });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        await feedbackService.delete(id);
        toast.success('Ticket deleted');
        refetch();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (editingId) {
        await feedbackService.update(editingId, { 
          status: formData.status,
          resolution: formData.resolution 
        });
        toast.success('Ticket updated');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { header: 'Subject', accessor: (row: any) => <span className="font-bold text-slate-900">{row.subject}</span> },
    { header: 'Category', accessor: (row: any) => <Badge variant="info">{row.category}</Badge> },
    { header: 'Submitted By', accessor: (row: any) => row.submittedBy?.loginId || 'Unknown' },
    { header: 'Status', accessor: (row: any) => (
      <Badge variant={row.status === 'PENDING' ? 'warning' : row.status === 'RESOLVED' ? 'success' : 'default'}>
        {row.status}
      </Badge>
    )},
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <CrudPage
      title="Feedback & Support Tickets"
      subtitle="Review and resolve issues submitted by students, parents, and teachers."
      data={data}
      loading={loading}
      columns={columns}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search tickets by subject..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ticket Details</p>
            <p className="font-bold text-slate-900 mb-2">{originalTicket?.subject}</p>
            <p className="text-sm text-slate-700">{originalTicket?.message}</p>
            <p className="text-[10px] text-slate-400 mt-2">Submitted By: {originalTicket?.submittedBy?.loginId}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select {...register('status', { required: true })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resolution / Notes</label>
              <textarea {...register('resolution')} rows={4} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none" placeholder="Add resolution details..." />
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
              {isSubmitting ? 'Updating...' : 'Update Ticket'}
            </button>
          </div>
        </form>
      )}
    />
  );
}