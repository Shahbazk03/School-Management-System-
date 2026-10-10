'use client';

import { CrudPage } from '@/components/CrudPage';
import { useFetch } from '@/api/hooks';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

export default function AdminSections() {
  const { data, loading, refetch } = useFetch(() => apiClient.get('/sections').then(res => res.data));
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    // Fetch school ID to attach to sections
    apiClient.get('/schools/settings').then(res => setSchoolId(res.data?.id)).catch(() => {});
  }, []);

  const handleAddClick = () => {
    reset({ name: '' });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset({ name: row.name });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      try {
        await apiClient.delete(`/sections/${id}`);
        toast.success('Section deleted');
        refetch();
      } catch (err: any) {
        toast.error('Failed to delete section');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (!schoolId) {
        toast.error('School context missing');
        return;
      }
      
      const payload = { ...formData, schoolId };
      if (editingId) {
        await apiClient.patch(`/sections/${editingId}`, payload);
        toast.success('Section updated');
      } else {
        await apiClient.post('/sections', payload);
        toast.success('Section created');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save section');
    }
  };

  const columns = [
    { header: 'Section Name', accessor: (row: any) => row.name },
    { header: 'Created At', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <CrudPage
      title="Sections"
      subtitle="Manage school sections (e.g. A, B, C)."
      data={data || []}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      searchPlaceholder="Search sections..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Name</label>
            <input 
              {...register('name', { required: true })} 
              placeholder="e.g. A" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 p-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 p-2 bg-blue-600 text-white rounded disabled:opacity-50">
              Save
            </button>
          </div>
        </form>
      )}
    />
  );
}
