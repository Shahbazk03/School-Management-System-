'use client';

import { useAllParents } from '@/api/hooks';
import { parentService } from '@/api/services';
import { CrudPage } from '@/components/CrudPage';
import { Badge } from '@/components/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminParents() {
  const { data, loading, refetch } = useAllParents();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleAddClick = () => {
    // Parent add form via backend currently uses auth endpoint or direct DB. 
    // Usually parents are imported, but here is a simple stub for consistency.
    reset();
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset(row);
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this parent record?')) {
      // NOTE: Our simple backend services might not have full Parent CRUD implemented,
      // but let's assume `apiClient.delete('/parents')` works for consistency if needed.
      try {
        const { apiClient } = await import('@/api/client');
        await apiClient.delete(`/parents/${id}`);
        toast.success('Parent deleted');
        refetch();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const { apiClient } = await import('@/api/client');
      if (editingId) {
        await apiClient.patch(`/parents/${editingId}`, formData);
        toast.success('Parent updated');
      } else {
        await apiClient.post(`/parents`, formData);
        toast.success('Parent created');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { header: 'Parent ID', accessor: (row: any) => <span className="font-mono font-bold text-slate-900">{row.parentId}</span> },
    { header: 'Name', accessor: (row: any) => <span className="font-semibold text-slate-900">{row.firstName} {row.lastName}</span> },
    { header: 'Email', accessor: (row: any) => row.email || '—' },
    { header: 'Phone', accessor: (row: any) => row.phone || '—' },
    { header: 'Linked Children', accessor: (row: any) => (
      <div className="flex flex-col gap-1">
        {row.children?.length > 0 ? (
          row.children.map((c: any, i: number) => {
            const enroll = c.student?.enrollments?.[0];
            const classInfo = enroll ? ` - ${enroll.classSection?.class?.name} ${enroll.classSection?.section?.name} (${enroll.academicSession?.name})` : '';
            return (
              <Badge key={i} variant="outline" className="text-xs justify-start w-fit">
                {c.student?.firstName} {c.student?.lastName} ({c.relation}){classInfo}
              </Badge>
            );
          })
        ) : (
          <span className="text-slate-400 text-xs">No children linked</span>
        )}
      </div>
    )},
  ];

  return (
    <CrudPage
      title="Manage Parents"
      subtitle="View and manage parent accounts and their linked children."
      data={data}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search parents by name, email, or ID..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parent ID (Login)</label>
              <input {...register('parentId', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="e.g. PARENT-001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                <input {...register('firstName', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                <input {...register('lastName', { required: true })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
            </div>
            
            {editingId && (
              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Linked Children Details</label>
                <div className="space-y-2">
                  {data?.find((p: any) => p.id === editingId)?.children?.map((c: any, idx: number) => {
                    const enroll = c.student?.enrollments?.[0];
                    return (
                      <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="font-bold text-sm text-blue-900">{c.student?.firstName} {c.student?.lastName} <span className="text-xs font-normal text-blue-600">({c.relation})</span></p>
                        <p className="text-xs text-blue-800 mt-1">
                          <span className="font-semibold">Academic Year:</span> {enroll?.academicSession?.name || 'N/A'} <br/>
                          <span className="font-semibold">Class & Section:</span> {enroll?.classSection?.class?.name} {enroll?.classSection?.section?.name || 'N/A'}
                        </p>
                      </div>
                    );
                  })}
                  {(!data?.find((p: any) => p.id === editingId)?.children || data?.find((p: any) => p.id === editingId)?.children?.length === 0) && (
                    <p className="text-sm text-gray-500">No children linked to this parent yet.</p>
                  )}
                </div>
              </div>
            )}
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