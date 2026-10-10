'use client';

import { CrudPage } from '@/components/CrudPage';
import { useFetch } from '@/api/hooks';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

export default function AdminSubjects() {
  const { data, loading, refetch } = useFetch(() => apiClient.get('/subjects').then(res => res.data));
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    apiClient.get('/schools/settings').then(res => setSchoolId(res.data?.id)).catch(() => {});
  }, []);

  const handleAddClick = () => {
    reset({ subjectCode: '', subjectName: '', maxMarks: 100, passingMarks: 33, theoryMarks: 80, practicalMarks: 20 });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (row: any) => {
    reset({ 
      subjectCode: row.subjectCode, 
      subjectName: row.subjectName,
      maxMarks: row.maxMarks,
      passingMarks: row.passingMarks,
      theoryMarks: row.theoryMarks,
      practicalMarks: row.practicalMarks
    });
    setEditingId(row.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await apiClient.delete(`/subjects/${id}`);
        toast.success('Subject deleted');
        refetch();
      } catch (err: any) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (!schoolId) {
        toast.error('School context missing');
        return;
      }
      
      const payload = { 
        ...formData, 
        schoolId,
        maxMarks: Number(formData.maxMarks),
        passingMarks: Number(formData.passingMarks),
        theoryMarks: Number(formData.theoryMarks),
        practicalMarks: Number(formData.practicalMarks),
      };
      
      if (editingId) {
        await apiClient.patch(`/subjects/${editingId}`, payload);
        toast.success('Subject updated');
      } else {
        await apiClient.post('/subjects', payload);
        toast.success('Subject created');
      }
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save subject');
    }
  };

  const handleBulkUpload = (file: File) => {
    if (!schoolId) {
      toast.error('School context missing');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setBulkUploading(true);
        const text = e.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length <= 1) throw new Error('CSV is empty or missing data rows');
        
        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['subjectCode', 'subjectName', 'maxMarks', 'passingMarks', 'theoryMarks', 'practicalMarks'];
        const missing = expectedHeaders.filter(h => !headers.includes(h));
        if (missing.length > 0) {
          throw new Error(`CSV is missing headers: ${missing.join(', ')}`);
        }

        const payload = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = { schoolId };
          headers.forEach((h, i) => {
            const val = values[i]?.trim();
            if (['maxMarks', 'passingMarks', 'theoryMarks', 'practicalMarks'].includes(h)) {
              obj[h] = Number(val) || 0;
            } else {
              obj[h] = val;
            }
          });
          return obj;
        });

        await apiClient.post('/subjects/bulk', payload);
        toast.success('Bulk import successful');
        refetch();
      } catch (err: any) {
        toast.error(err.message || 'Failed to process CSV file');
      } finally {
        setBulkUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const columns = [
    { header: 'Code', accessor: (row: any) => row.subjectCode },
    { header: 'Name', accessor: (row: any) => row.subjectName },
    { header: 'Max Marks', accessor: (row: any) => row.maxMarks },
    { header: 'Pass Marks', accessor: (row: any) => row.passingMarks },
  ];

  return (
    <CrudPage
      title="Subjects"
      subtitle="Manage school subjects and grading parameters."
      data={data || []}
      loading={loading}
      columns={columns}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDelete}
      isFormOpen={formOpen}
      onCloseForm={() => setFormOpen(false)}
      onBulkImport={handleBulkUpload}
      bulkImportLoading={bulkUploading}
      searchPlaceholder="Search subjects..."
      renderForm={() => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject Code</label>
              <input {...register('subjectCode', { required: true })} placeholder="e.g. MAT01" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject Name</label>
              <input {...register('subjectName', { required: true })} placeholder="e.g. Mathematics" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Marks</label>
              <input type="number" {...register('maxMarks', { required: true, min: 0 })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passing Marks</label>
              <input type="number" {...register('passingMarks', { required: true, min: 0 })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theory Marks</label>
              <input type="number" {...register('theoryMarks', { required: true, min: 0 })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Practical Marks</label>
              <input type="number" {...register('practicalMarks', { required: true, min: 0 })} className="w-full p-2 border rounded" />
            </div>
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
